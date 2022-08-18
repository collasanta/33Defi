import Head from "next/head";
import Script from "next/script";
import Swap from "../components/Swap";

const style = {
  wrapper: `h-screen bg-[#f2f4ff] max-h-screen h-min-screen w-screen text-white select-none flex flex-col justify-between`
}

export default function Home() {
  return (
    <div className={style.wrapper}>
      <Swap />
    </div>
  );
}
