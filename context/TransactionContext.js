import React, {useState, useEffect} from 'react'
import { MWPAddress, wMATICAddress } from '../lib/constants'
import { ethers } from 'ethers'
// import { client} from '../lib/sanityClient'
import { useRouter } from 'next/router'
import swapMentoraABI from '../hardhat/contracts/abis/mentoraSwap.json'
import mwpContractABI from '../hardhat/contracts/abis/mwpContractABI.json'
import axios from "axios";
import { AlphaRouter } from '@uniswap/smart-order-router'
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

const web3Provider =new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/pkqdvzeiqirYql1sNmUAA3IIe0AL9_0U")
const chainId = 80001
const router = new AlphaRouter({ chainId, provider: web3Provider })
const poolFee = 3000
const MWP = new Token(chainId, MWPAddress, 18)
const wMATIC = new Token(chainId, wMATICAddress, 18)

let eth

if (typeof window !== 'undefined') {
   eth = window.ethereum
}

async function gasPriceEth() {
   try {
     const { data: { result: gasPrice } } = await axios.post('https://polygon-mainnet.g.alchemyapi.io/v2/cLBYf3MjB7MAcWCsT_6OFc19nnoTEZMx', {
       jsonrpc: '2.0',
       method: 'eth_gasPrice',
       params: [],
       id: +new Date(),
     }, {
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*'
       },
     });
     return gasPrice;
   } catch (err) {
     console.error("Failed to retrieve gas price", err);
   }
 }

export const TransactionProvider = ({ children }) => {
   const [currentAccount, setCurrentAccount] = useState()
   const [isLoading, setIsLoading] = useState(false)

   const routerx = useRouter()

   useEffect(()=>{
      checkIfWalletIsConnected()
   })
   
   async function getContractBalance(metamask = eth) {
      const provider = new ethers.providers.Web3Provider(metamask)
      const balance = await provider.getBalance("0x5268e5C5A755c2527F601Bd58778319b4DF12A4C")
      return ethers.utils.formatEther(balance.toString())
   }

    async function getPrice(amountIn, swapOrder) {

      if (swapOrder === "maticmwp") {
         const weiAmountIn = ethers.utils.parseUnits(amountIn.toString(), 18)
         const inputAmount = CurrencyAmount.fromRawAmount(wMATIC, JSBI.BigInt(weiAmountIn))
         const route = await router.route(inputAmount, MWP, TradeType.EXACT_INPUT)
         const quoteAmountOut = route.quote.toFixed(3)
         console.log("quoteAmountOut", quoteAmountOut)
         return [quoteAmountOut]
      }

      
      if (swapOrder === "mwpmatic") {
         const weiAmountIn = ethers.utils.parseUnits(amountIn.toString(), 18)
         const inputAmount = CurrencyAmount.fromRawAmount(MWP, JSBI.BigInt(weiAmountIn))
         const route = await router.route(inputAmount, wMATIC, TradeType.EXACT_INPUT)
         const quoteAmountOut = route.quote.toFixed(4)
         console.log("quoteAmountOut", quoteAmountOut)
         return [quoteAmountOut]
      }

    }

   const connectWallet = async (metamask = eth) => {
      try {
        if (!metamask) return alert('Please install metamask ')
  
        const accounts = await metamask.request({ method: 'eth_requestAccounts' })
  
        setCurrentAccount(accounts[0])
      } catch (error) {
        console.error(error)
        throw new Error('No ethereum object.')
      }
   }

   const checkIfWalletIsConnected = async (metamask = eth) => {
      try {
        if (!metamask) return alert('Please install metamask ')
  
        const accounts = await metamask.request({ method: 'eth_accounts' })
  
        if (accounts.length) {
          setCurrentAccount(accounts[0])
          console.log('wallet already connected')
        }
      } catch (error) {
        console.error(error)
        throw new Error('No ethereum object.')
      }
   }

   const sendSwap = async (
      amountIn,
      expectedAmountOut,
      deadlineMinutes,
      slippage,
      swapOrder,
      metamask = eth,
      connectedAccount = currentAccount
    ) => {
      try {
        if (!metamask) return alert('Please install metamask ')
        const deadline = Math.floor(Date.now() / 1000 + (deadlineMinutes*60))
        const _expectedAmountOut = expectedAmountOut
        const minAmountOut = (_expectedAmountOut * ( 1 - (slippage/100) )).toString()
        const gasPrice = await gasPriceEth();
        console.log("gasPrice", gasPrice)
        console.log("deadline", deadline)
        console.log("swaporder", swapOrder)
        console.log("expectedamountout: ", _expectedAmountOut, "minAmountOut: ", minAmountOut)
        const provider = new ethers.providers.Web3Provider(metamask)
        console.log("amountIn", amountIn)
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const swapContract = new ethers.Contract("0x5268e5C5A755c2527F601Bd58778319b4DF12A4C", swapMentoraABI.abi, signer)
        if (swapOrder === "maticmwp") {
           setIsLoading(true)
           const  _minAmountOut = (ethers.utils.parseEther(minAmountOut)).toString()
           const  _amountIn = ethers.utils.parseEther(amountIn)
              console.log("_amountIn", _amountIn)
           const txswapmaticmwp = await swapContract.MaticToMwp(deadline, _minAmountOut, poolFee, {value: _amountIn , gasLimit: 250000, gasPrice: gasPrice})  //
           await txswapmaticmwp.wait(1)
           setIsLoading(false)
        }

        if (swapOrder === "mwpmatic") {
         setIsLoading(true)
         const mwpContract = new ethers.Contract("0xd2b2ad7252aa2f633223c9863dd979772e7fb416", mwpContractABI, signer)
         const  _minAmountOut = (ethers.utils.parseEther(minAmountOut)).toString()
         const  _amountIn = (ethers.utils.parseEther(amountIn)).toString()
         const txapprove = await mwpContract.approve("0x5268e5C5A755c2527F601Bd58778319b4DF12A4C", _amountIn, { gasLimit: 250000, gasPrice: gasPrice})
         await txapprove.wait(1)
         console.log("MWP Approved, amount=", _amountIn)
         const txswapmwpmatic = await swapContract.MwpToMatic(_amountIn, deadline, _minAmountOut, poolFee, { gasLimit: 250000, gasPrice: gasPrice})  //
         await txswapmwpmatic.wait(1)
         setIsLoading(false)
            
        }

      } catch (error) {
        console.log(error)
      }
    }

    useEffect(()=>{
       if (isLoading) {
          routerx.push(`/?loading=${currentAccount}`)
       } else {
          routerx.push(`/`)
       }
    }, [isLoading])


   return (
      <TransactionContext.Provider
         value={{
            currentAccount,
            connectWallet,
            getContractBalance,
            sendSwap,
            isLoading,
            getPrice,
         }}
      >
         {children}
      </TransactionContext.Provider>
   )

}

export const TransactionContext = React.createContext()