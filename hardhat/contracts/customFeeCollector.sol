//SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

/** @author Mentora.gg
 * @title Intermediate contract
 * @notice This contract is used to manage swaps between gameplayers and Mentora.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./Price.sol";

/** @notice This contract is used to manage swaps between gameplayers and Mentora.
 *  @dev This interface is used to address matic/wmatic conversion.
 */

interface IWmaticContract {
    function deposit() external payable;

    function approve(address, uint) external returns (bool);

    function withdraw(uint256) external;

    function balanceOf(address) external returns (uint256);
}

contract customFeeCollector is AccessControl, PriceConsumerMaticDollar {
    constructor(address aggregator) PriceConsumerMaticDollar(aggregator) {
        owner = payable(msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(WITHDRAW_ROLE, msg.sender);
        _grantRole(CHANGE_FEE_ORDER_AMOUNT_ROLE, msg.sender);
    }

    address payable public owner;
    ISwapRouter public constant swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    address public constant wMaticAddress =
        0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889;
    address public constant MwpAddress =
        0xd2B2Ad7252AA2f633223c9863dd979772E7FB416;
    address public constant swapRouterAddress =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;

    uint256 public bipsTxFeeAmountA = 100;
    uint256 public bipsTxFeeAmountB = 75;
    uint256 public bipsTxFeeAmountC = 50;
    uint256 public priceRangeA = 10 * 10**18;
    uint256 public priceRangeB = 100 * 10**18;
    uint256 internal bipsFeeAmount;
    uint256 internal amountOut;
    uint256 internal amountSwap;

    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");
    bytes32 public constant CHANGE_FEE_ORDER_AMOUNT_ROLE = keccak256("CHANGE_FEE_ORDER_AMOUNT_ROLE");

    event ContractWithdraw(address indexed _owner, uint indexed _amount);
    event ChangeOnPriceRangeA(address indexed _caller, uint indexed _newRange);
    event ChangeOnPriceRangeB(address indexed _caller, uint indexed _newRange);
    event ChangeOnTxFeeRangeA(address indexed _caller, uint indexed _newTxFee);
    event ChangeOnTxFeeRangeB(address indexed _caller, uint indexed _newTxFee);
    event ChangeOnTxFeeRangeC(address indexed _caller, uint indexed _newTxFee);
    event MaticToMwpTransaction(
        address indexed _caller,
        uint indexed _amountIn,
        uint indexed _amountOut
    );
    event MwpToMaticTransaction(
        address indexed _caller,
        uint indexed _amountIn,
        uint indexed _amountOut
    );

    /** @notice This couple of setPriceRange functions, defines the ranges where is applyed taxes.
     *  @dev Set the new range to applyed taxes.
     *  @param _newRangeA B and C is the value of new range.
     */

    function setPriceRangeA(uint256 _newRangeA) onlyRole(CHANGE_FEE_ORDER_AMOUNT_ROLE) public {
        priceRangeA = _newRangeA;
        emit ChangeOnPriceRangeA(msg.sender, _newRangeA);
    }

    function setPriceRangeB(uint256 _newRangeB) onlyRole(CHANGE_FEE_ORDER_AMOUNT_ROLE) public {
        priceRangeB = _newRangeB;
        emit ChangeOnPriceRangeB(msg.sender, _newRangeB);
    }

    /** @notice This couple of setTxFeeRange functions, defines the fees applyed on the ranges.
     *  @dev Set the new fee to apply on ranges.
     *  @param _bipsnewFeeA B and C is the new fee value.
     */
    function setTxFeeRangeA(uint256 _bipsnewFeeA) onlyRole(CHANGE_FEE_ORDER_AMOUNT_ROLE)  public {
        bipsTxFeeAmountA = _bipsnewFeeA;
        emit ChangeOnTxFeeRangeA(msg.sender, _bipsnewFeeA);
    }

    function setTxFeeRangeB(uint256 _bipsnewFeeB) onlyRole(CHANGE_FEE_ORDER_AMOUNT_ROLE)  public {
        bipsTxFeeAmountB = _bipsnewFeeB;
        emit ChangeOnTxFeeRangeB(msg.sender, _bipsnewFeeB);
    }

    function setTxFeeRangeC(uint256 _bipsnewFeeC) onlyRole(CHANGE_FEE_ORDER_AMOUNT_ROLE)  public {
        bipsTxFeeAmountC = _bipsnewFeeC;
        emit ChangeOnTxFeeRangeC(msg.sender, _bipsnewFeeC);
    }

    function returnFee(uint256 amountMATIC) internal returns (uint256) {
        uint amountUSD = getPriceUSD(amountMATIC);
        if (amountUSD < priceRangeA) {
            bipsFeeAmount = bipsTxFeeAmountA;
        } else if (priceRangeA <= amountUSD && amountUSD <= priceRangeB) {
            bipsFeeAmount = bipsTxFeeAmountB;
        } else if (amountUSD > priceRangeB) {
            bipsFeeAmount = bipsTxFeeAmountC;
        }
        return bipsFeeAmount;
    }

    /** @notice This function swaps the Polygon native token(MATIC) to  Mentora Well Played token(MWP)
     *  @dev This payable function will use the amount defined on msg.value to swap to MWP.
     *  @dev A fee is applyed on this amount.
     *  @dev This contract deposits this amount at Wrapped Matic contract. The WMatic contract, receives MATIC and returns WMATIC.
     *  @dev The WMatic contract aproves this contract to spend the value informed.
     *  @dev Once aproved, this contract send the amount to Uniswap Router to swap tokens.
     *  @dev The Uniswap Router transfer the new token to the msg.send.
     *  @param _deadline the unix time after which a swap will fail, to protect against long-pending transactions and wild swings in prices.
     *  @param _minAmountOut the mininum amount acceptable.
     *  @param _fee The fee tier of the pool, used to determine the correct pool contract in which to execute the swap.
     */
    function MaticToMwp(
        uint256 _deadline,
        uint256 _minAmountOut,
        uint24 _fee
    ) external payable {
        amountSwap = msg.value - ((msg.value * bipsFeeAmount) / 10000);
        IWmaticContract(wMaticAddress).deposit{value: amountSwap}();
        TransferHelper.safeApprove(
            wMaticAddress,
            address(swapRouter),
            amountSwap
        );
        amountOut = swap(
            wMaticAddress,
            MwpAddress,
            _fee,
            msg.sender,
            _deadline,
            amountSwap,
            _minAmountOut
        );
        emit MaticToMwpTransaction(msg.sender, amountSwap, amountOut);
    }

    /** @notice This function swaps the Mentora Well Played token(MWP) to Polygon native token(MATIC).
     *  @dev First of all, it needed aprove this contract to spend the MWP balance.
     *  @dev Then, it is transfers the balance from msg.sender address to this contract.
     *  @dev This contract aproves Uniswap Router to spend the value informed.
     *  @dev Once aproved, this contract send the amount to Uniswap Router to swap tokens.
     *  @dev The Uniswap Router transfer the WMATIC to this contract.
     *  @dev Then this contract withdraws the amount from WMATIC contract.
     *  @dev In the end, the amount is transfered to msg.sender.
     *  @param _amountSwap the amount in MWP to swap to Matic
     *  @param _deadline the unix time after which a swap will fail, to protect against long-pending transactions and wild swings in prices.
     *  @param _minAmountOut the mininum amount acceptable.
     *  @param _fee The fee tier of the pool, used to determine the correct pool contract in which to execute the swap.
     */
    function MwpToMatic(
        uint256 _amountSwap,
        uint256 _deadline,
        uint256 _minAmountOut,
        uint24 _fee
    ) public {
        TransferHelper.safeTransferFrom(
            MwpAddress,
            msg.sender,
            address(this),
            _amountSwap
        );
        TransferHelper.safeApprove(
            MwpAddress,
            address(swapRouter),
            _amountSwap
        );
        amountOut = swap(
            MwpAddress,
            wMaticAddress,
            _fee,
            address(this),
            _deadline,
            _amountSwap,
            _minAmountOut
        );
        IWmaticContract(wMaticAddress).withdraw(amountOut);

        amountSwap = amountOut - ((amountOut * bipsFeeAmount) / 10000);

        (bool success, ) = payable(msg.sender).call{value: amountSwap}("");
        if (!success) {
            revert("Failure on withdraw!");
        }

        emit MwpToMaticTransaction(msg.sender, _amountSwap, amountOut);
    }

    function swap(
        address _tokenIn,
        address _tokenOut,
        uint24 _fee,
        address _recipient,
        uint256 _deadline,
        uint256 _amountSwap,
        uint256 _minAmountOut
    ) internal returns (uint256) {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: _fee,
                recipient: _recipient,
                deadline: _deadline,
                amountIn: _amountSwap,
                amountOutMinimum: _minAmountOut,
                sqrtPriceLimitX96: 0
            });
        amountOut = swapRouter.exactInputSingle(params);
        return amountOut;
    }

    receive() external payable {}

    fallback() external payable {
        revert("Operation not allowed. Please execute a valid function!");
    }

    /** @dev Withdraw taxes balance of contract.
     *  @param amount is the value to be withdrawn.
     */
    function withdraw(uint amount)
        public
        onlyRole(WITHDRAW_ROLE)
        returns (bool)
    {
        require(amount <= address(this).balance);
        (bool success, ) = payable(owner).call{value: amount}("");
        if (!success) {
            revert("Failure on withdraw!");
        }
        emit ContractWithdraw(owner, amount);
        return true;
    }
}
