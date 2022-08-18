//SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

/** @author Mentora.gg
 * @title Intermediate contract
 * @notice This contract is used to manage swaps between gameplayers and Mentora.
 */

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

contract mentoraSwap is PriceConsumerMaticDollar {
    /** @notice This contract is used to manage swaps between gameplayers and Mentora.
     *  @dev This interface is used to address matic/wmatic conversion.
     */
    constructor(address aggregator, address)
        PriceConsumerMaticDollar(aggregator)
    {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    ISwapRouter public constant swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    address public constant wMaticAddress =
        0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889;
    address public constant MwpAddress =
        0xd2B2Ad7252AA2f633223c9863dd979772E7FB416;
    address public constant swapRouterAddress =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address payable public owner;
    uint256 internal bipsFeeAmount;
    uint256 internal amountOut;
    uint256 internal amountSwap;
    uint256 public bipsTxFeeAmountA = 300; // ATÉ 10 USD
    uint256 public bipsTxFeeAmountB = 100; // ENTRE 10USD E 100 USD
    uint256 public bipsTxFeeAmountC = 50; // ACIMA DE 100 USD
    uint256 public priceRangeA = 10 * 10**18; //até 10 USD
    uint256 public priceRangeB = 100 * 10**18; // 100 USD

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

    receive() external payable {}

    fallback() external payable {
        revert("Operation not allowed. Please execute a valid function!");
    }

    // WITHDRAW
    function withdraw(uint amount) public onlyOwner returns (bool) {
        require(amount <= address(this).balance);
        // owner.transfer(amount);
        (bool success, ) = payable(owner).call{value: amount}("");
        if (!success) {
            revert("Failure on withdraw!");
        }
        emit ContractWithdraw(owner, amount);
        return true;
    }

    //SETS RANGES

    function setPriceRangeA(uint256 _newRangeA) public {
        priceRangeA = _newRangeA;
        emit ChangeOnPriceRangeA(msg.sender, _newRangeA);
    }

    function setPriceRangeB(uint256 _newRangeB) public {
        priceRangeB = _newRangeB;
        emit ChangeOnPriceRangeB(msg.sender, _newRangeB);
    }

    //SET FEES

    function setTxFeeRangeA(uint256 _bipsnewFeeA) public {
        bipsTxFeeAmountA = _bipsnewFeeA;
        emit ChangeOnTxFeeRangeA(msg.sender, _bipsnewFeeA);
    }

    function setTxFeeRangeB(uint256 _bipsnewFeeB) public {
        bipsTxFeeAmountB = _bipsnewFeeB;
        emit ChangeOnTxFeeRangeB(msg.sender, _bipsnewFeeB);
    }

    function setTxFeeRangeC(uint256 _bipsnewFeeC) public {
        bipsTxFeeAmountC = _bipsnewFeeC;
        emit ChangeOnTxFeeRangeC(msg.sender, _bipsnewFeeC);
    }

    //SWAPs MATIC to MWP
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

    function MaticToMwp(
        uint256 _deadline,
        uint256 _minAmountOut,
        uint24 _fee
    ) external payable {
        // GET RESPECTIVE MATIC AMOUNT DEPOSIT IN DOLLAR
        // Contract Reveice MATICs from User
        // Contract deducts convenience Fee
        amountSwap = msg.value - ((msg.value * bipsFeeAmount) / 10000);
        // Contract Wrapps the MATIC into wMATIC
        IWmaticContract(wMaticAddress).deposit{value: amountSwap}();
        TransferHelper.safeApprove(
            wMaticAddress,
            address(swapRouter),
            amountSwap
        );
        //Contract calls uni router and do the swap
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

    function MwpToMatic(
        uint256 _amountSwap,
        uint256 _deadline,
        uint256 _minAmountOut,
        uint24 _fee
    ) public {
        // msg.sender must approve this contract to transfer their funds
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
            _amountSwap, //aqui estava dando erro pq estava amountSwap
            _minAmountOut
        );
        IWmaticContract(wMaticAddress).withdraw(amountOut);

        amountSwap = amountOut - ((amountOut * bipsFeeAmount) / 10000);
        //    payable(msg.sender).transfer(amountSwap);
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
}
