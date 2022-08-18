import Send from '../components/Send'
// import TransactionHistory from '../components/TransactionHistory'

const style = {
   wrapper: `h-screen max-h-screen h-min-screen w-screen bg-[#f3f6ff] text-white select-none flex flex-col justify-between`
}



export default function Home() {
  return (
   <div className={style.wrapper}> 
      <Send />
      {/* <TransactionHistory /> */}
   </div>
  )
}