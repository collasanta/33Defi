import React, { useState, useEffect, useContext} from 'react'
import Image from 'next/image'
import { FiArrowUpRight } from 'react-icons/fi'
import { AiOutlineDown } from 'react-icons/ai'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import maticLogo from '../assets/matic2.png'
import weblogo from '../assets/33weblogo.png'
import { TransactionContext } from '../context/TransactionContext'
import { useRouter } from 'next/router'

const style = {
   wrapper: `p-4 w-screen flex justify-between items-center bg-[#f3f6ff]`,
   headerLogo: `flex w-1/9 items-center justify-start`,
   nav: `flex-1 flex justify-center items-center`,
   navItemsContainer: `flex bg-[#ffffff] rounded-3xl`,
   navItem: `px-4 py-2 m-1 flex items-center text-lg font-semibold text-[0.9rem] cursor-pointer rounded-3xl text-[#00000c]`,
   activeNavItem: `bg-[#f6f8f8]`,
   buttonsContainer: `flex w-2/5 justify-end items-center` ,
   button: `flex items-center bg-[#ffffff] rounded-2xl mx-2 text-[0.9rem] font-semibold cursor-pointer text-[#00000c]`,
   buttonPadding: `p-2`,
   buttonTextContainer: `h-8  flex items-center text-[#00000c]`,
   buttonIconContainer:`flex items-center justify-center w-8 h-8 `,
   buttonAccent: `bg-[#00b09b] hover:bg-[#08d37e] h-full rounded-2xl flex items-center justify-center text-[#ffffff] font-semibold px-4 py-2`
}


const Header = () => {
   const [selectedNav, setSelectedNav] = useState<any>(undefined)
   const {connectWallet, currentAccount} = useContext(TransactionContext)
   const [userName, setUserName] = useState<string>()
   const Router = useRouter()

   useEffect(() => {
    console.log("selectedNav", selectedNav)
    if (selectedNav === 'stake'){
      Router.push(`/stake`)}
    if (selectedNav === 'swap'){
      Router.push(`/`)}
    if (selectedNav === 'send'){
      Router.push(`/send`)}
     
   }, [selectedNav])
   

   useEffect(()=> {
      if (!currentAccount) return
      setUserName(`${currentAccount.slice(0, 7)}...${currentAccount.slice(35)}`)
   }, [currentAccount])

   return (

    <div className={style.wrapper}>
      <div className={style.headerLogo}>
         <Image src={weblogo} alt="uniswap" height={50} width={50} />
      </div>   

      <div className={style.nav}>
         <div className={style.navItemsContainer}>
              <div
              onClick={() => {
                setSelectedNav('swap')
              } }
              className={`${style.navItem} ${selectedNav === "swap" && style.activeNavItem} ${selectedNav === undefined && style.activeNavItem}`}
              >Swap
              </div>

              <div
              onClick={() => setSelectedNav('stake')}
              className={`${style.navItem} ${
              selectedNav === 'stake' && style.activeNavItem   
              }`}
              >Stake 
              </div>
            
              <div
              onClick={() => setSelectedNav('send')}
              className={`${style.navItem} ${
              selectedNav === 'send' && style.activeNavItem   
              }`}
              >Send
              </div>
         </div>
      </div>
      
      <div className={style.buttonsContainer}>
        <div className={`${style.button} ${style.buttonPadding}`}>
          <div className={style.buttonIconContainer}>
            <Image src={maticLogo} alt='matic logo' height={20} width={20} />
          </div>
          <p>Polygon Mumbai</p>
          <div className={style.buttonIconContainer}>
            <AiOutlineDown />
          </div>
        </div>
            
          {currentAccount ? (
          <div className={`${style.button} ${style.buttonPadding}`}>
            <div className={style.buttonTextContainer}>{userName}</div>
          </div>
        ) : (
          <div
            onClick={() => connectWallet()}
            className={`${style.button} ${style.buttonPadding}`}
          >
            <div className={`${style.buttonAccent} ${style.buttonPadding}`}>
              ConnectWallet
            </div>
          </div>
        )}
        
        <div className={`${style.button} ${style.buttonPadding}`}>
          <div className={`${style.buttonIconContainer} mx-2`}>
            <HiOutlineDotsVertical />
          </div>
        </div>
      </div>




    </div>
  )
}

export default Header