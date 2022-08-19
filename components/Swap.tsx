import React, { useContext, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { RiSettings3Fill } from 'react-icons/ri'
import { AiOutlineDown } from 'react-icons/ai'
import maticLogo from '../assets/matic.png'
import thirdLogo from '../assets/third.png'
import swap from '../assets/swap.png'
import { TransactionContext } from '../context/TransactionContext'
import Modal from 'react-modal'
import { useRouter } from 'next/router'
import TransactionLoader from './TransactionLoader'
import BeatLoader from 'react-spinners/BeatLoader';
import ConfigModal from './ConfigModal'


const style = {
   wrapper: `w-screen flex flex-col items-center justify-center mt-14`,
   content: `bg-[#ffffff] w-[35rem] rounded-2xl p-4`,
   formHeader: `px-2 flex items-center justify-between font-semibold text-xl text-[#00000c]`,
   transferPropContainer: `bg-[#f7f8fa] my-3 rounded-2xl p-4 text-3xl border hover:border-[#cfd0d4] flex justify-between`,
   transferPropInput: `bg-transparent placeholder:text-[#B2B9D2] outline-none mb-6 w-full text-2xl text-[#00000c]`,
   transferPropOutput: `bg-transparent placeholder:text-[#B2B9D2] outline-none mb-6  w-full h-[27px]  text-2xl text-[#00000c]`,
   currencySelector: `flex w-2/5 flex flex-col`,
   currencySelectorContent: `w-full h-min flex justify-between items-center shadow-md bg-[#edeef2] hover:bg-[#c2c3c5] rounded-2xl text-[#00000c] text-xl font-medium cursor-pointer p-2 mt-[-0.2rem]`,
   currencySelectorIcon: `flex items-center`,
   currencySelectorTicker: `mx-2`,
   currencySelectorArrow: `text-lg`,
   confirmButton: `bg-gradient-to-r from-[#00b09b] animate-pulse to-[#08d37e] hover:bg-[#cf0063] my-2 rounded-2xl py-6 px-8 text-xl text-[white] font-semibold flex items-center justify-center cursor-pointer`,
   gearcontainer: `cursor-pointer`,
   swapOrder: `text-center cursor-pointer mt-[-20px] mb-[-25px]`,
   balance: 'flex flex-col text-end text-[16px] text-[gray]',
  }

 const customStyles = {
   content: {
     top: '50%',
     left: '50%',
     right: 'auto',
     bottom: 'auto',
     transform: 'translate(-50%, -50%)',
     backgroundColor: '#0a0b0d',
     padding: 0,
     border: 'none',
   },
   overlay: {
     backgroundColor: 'rgba(10, 11, 13, 0.75)',
   },
 }

const Swap = () => {
   const { getPrice, sendSwap, getContractBalance, MWPbalance, MATICbalance } = useContext(TransactionContext)
   const router = useRouter()
   const [contractBalance, setContractBalance] = useState()
   const [amountIn, setAmountIn] = useState("")
   const [amountOut, setAmountOut] = useState("")
   const [loading, setloading] = useState(false)
   const [showModal, setShowModal] = useState(false)
   const [deadlineMinutes, setDeadlineMinutes] = useState<any>(30)
   const [slippageAmount, setSlippageAmount] = useState<any>(30)
   const [swapOrder, setSwapOrder] = useState("mwpmatic")
   const [mwpbalance, setmwpbalance] = useState()
   const [maticbalance, setmaticbalance] = useState()

   const inputUp:any = useRef(null);
   const feeAmount = 0.05 //5%
  
   const handleChange = async (event:any) => {
    console.log("handlechange")
    setloading(true)
    setAmountIn(event.target.value)
    const amountOut = await getPrice(event.target.value, swapOrder)
    setAmountOut(amountOut)
    setloading(false)

  }

  useEffect(()=> {
    if (!MWPbalance) return
    setmwpbalance(MWPbalance)
 }, [MWPbalance])
  useEffect(()=> {
    if (!MATICbalance) return
    setmaticbalance(MATICbalance)
 }, [MATICbalance])

  useEffect( () => {
    const onLoad = async () => {
        setloading(true)
        setAmountIn("1")
        const amountOut = await getPrice("1", swapOrder)
        setContractBalance(await getContractBalance())
        setAmountOut(amountOut[0])
        setloading(false) 

      }
      onLoad()
  }, [])
  
  async function swapOrderChange (swapOrder:any) {
    inputUp.current.value = '1';
    setAmountIn("1")
    setloading(true)
      if (swapOrder === "maticmwp"){
        setSwapOrder("mwpmatic")
        const amountOut = await getPrice("1", "mwpmatic")
        setAmountOut(amountOut)
        setSwapOrder("mwpmatic")
      }
      if (swapOrder === "mwpmatic"){
        setSwapOrder("maticmwp")
        const amountOut = await getPrice("1", "maticmwp")
        setAmountOut(amountOut)
        setSwapOrder("maticmwp")
      }
    setloading(false)
  }

  function amountOutMinusFee (amountOut:any) {
    if (!loading) {
      console.log("amountOut", amountOut)
      const _amountOutMinusFee = (parseFloat(amountOut) * (1-feeAmount)).toFixed(4)
      console.log("_amountOutMinusFee", _amountOutMinusFee)
      return _amountOutMinusFee
    } 
  }
  
  return (
    <>
    
      <div className={style.wrapper}>
          <div className={style.content}>
            <div className={style.formHeader}>
                <div>Swap Tokens </div>
                <div>
                  <a className={style.gearcontainer} onClick={() => {setShowModal(true)}}>
                    <RiSettings3Fill  />
                  </a>
                  {showModal && (
                        <ConfigModal
                          onClose={()=> setShowModal(false)}
                          setDeadlineMinutes={setDeadlineMinutes}
                          deadlineMinutes={deadlineMinutes}
                          setSlippageAmount={setSlippageAmount}
                          slippageAmount={slippageAmount}
                        />
                  ) }
                </div>
            </div>
            
            {swapOrder === "maticmwp" ? 

            <div className={style.transferPropContainer}>
              <input
                ref={inputUp}
                type='text'
                className={style.transferPropInput}
                defaultValue="1.0"
                pattern='^[0-9]*[.,]?[0-9]*$'
                onBlur={e => handleChange(e)}
              />
              <div className={style.currencySelector}>
                <div className={style.currencySelectorContent}>
                  <div className={style.currencySelectorIcon}>
                    <Image src={maticLogo} alt='eth logo' height={27} width={27} />
                  </div>
                  <div className={style.currencySelectorTicker}>MATIC</div>
                  <AiOutlineDown className={style.currencySelectorArrow} />
                  <a className={style.balance}>Balance: {mwpbalance}</a>
                </div>
              </div>
            </div>
            
            :


            <div className={style.transferPropContainer}>
              <input
                ref={inputUp}
                type='text'
                className={style.transferPropInput}
                defaultValue="1.0"
                pattern='^[0-9]*[.,]?[0-9]*$'
                onBlur={e => handleChange(e)}
              />
              <div className={style.currencySelector}>
                <div className={style.currencySelectorContent}>
                  <div className={style.currencySelectorIcon}>
                    <Image src={thirdLogo} alt='eth logo' height={27} width={27} />
                  </div>
                  <div className={style.currencySelectorTicker}>MWP</div>
                  <AiOutlineDown className={style.currencySelectorArrow} />
                </div>
                <a className={style.balance}>Balance: {mwpbalance}</a>
              </div>

              
            </div>
            
            
            


            }
            <div className={style.swapOrder}>
                <Image onClick={()=>{ 
                  swapOrderChange(swapOrder)
                }} 
                  src={swap} alt='eth logo' height={27} width={27} />
            </div>
            
            
            {swapOrder === "maticmwp" ?  

            <div className={style.transferPropContainer}>
              <div className={style.transferPropOutput}>
                {loading ?
                    (
                        <div className=''>
                            <BeatLoader/>
                        </div>
                    )
                    :
                    (
                        <input
                        type='text'
                        className={style.transferPropInput}
                        defaultValue="0.0"
                        value={amountOutMinusFee(amountOut)}
                        pattern='^[0-9]*[.,]?[0-9]*$'
                        // onChange={e => handleChange(e)}
                        />
                    )
                  }
                </div>
                <div className={style.currencySelector}>
                  <div className={style.currencySelectorContent}>
                    <div className={style.currencySelectorIcon}>
                      <Image src={thirdLogo} alt='third logo' height={27} width={27} />
                    </div>
                    <div className={style.currencySelectorTicker}>MWP</div>
                    <AiOutlineDown className={style.currencySelectorArrow} />
                  </div>
                  <a className={style.balance}>Balance: {maticbalance}</a>

                </div>
            </div>

            :

            <div className={style.transferPropContainer}>
              <div className={style.transferPropOutput}>
                {loading ?
                    (
                        <div className=''>
                            <BeatLoader/>
                        </div>
                    )
                    :
                    (
                        <input
                        type='text'
                        className={style.transferPropInput}
                        defaultValue="0.0"
                        value={amountOutMinusFee(amountOut)}
                        pattern='^[0-9]*[.,]?[0-9]*$'
                        // onChange={e => handleChange(e)}
                        />
                    )
                  }
                </div>
                <div className={style.currencySelector}>
                  <div className={style.currencySelectorContent}>
                    <div className={style.currencySelectorIcon}>
                      <Image src={maticLogo} alt='third logo' height={27} width={27} />
                    </div>
                    <div className={style.currencySelectorTicker}>MATIC</div>
                    <AiOutlineDown className={style.currencySelectorArrow} />
                  </div>
                  <a className={style.balance}>Balance: {maticbalance}</a>

                </div>
            </div>
          


            
            }

            <div className={style.confirmButton} onClick={async ()=>{await sendSwap(amountIn, amountOut, deadlineMinutes, slippageAmount, swapOrder); await setContractBalance(await getContractBalance()) }}>
              Confirm
            </div>
          </div>

          <Modal isOpen={!!router.query.loading} style={customStyles}>
            <TransactionLoader />
          </Modal>

          <div className='text-[#808080] mt-[10px]'>
          feeCollector Balance: { !loading ? `${contractBalance} MATIC`:"" }
         </div>
          
      </div>
   </>      
  )
}

export default Swap