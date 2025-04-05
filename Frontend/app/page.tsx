import ConnectUserWallet from "@/components/connect-user-wallet";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <nav className="flex items-center justify-between p-4">
        <Image
          src="/assets/images/logo-text.svg"
          alt="logo"
          width={100}
          height={100}
          className="cursor-pointer w-[180px]"
        />
        <ConnectUserWallet />
      </nav>
      <main className="flex flex-col md:flex-row items-start md:items-center justify-center h-screen max-h-[700px] ">
        <div className=" p-8 w-full">
          <h1 className="font-bold text-6xl">
            Welcome! to <br />
            <span className="text-primary italic">Imaginify</span>
          </h1>
          <p className="text-gray-500 mt-4">
            Your one-stop solution for Editing your images .
          </p>

          <ConnectUserWallet />
        </div>
        <div className="flex flex-col justify-center items-start md:items-center  w-full p-8">
          <Image
            src="/assets/images/hero.png"
            alt="hero"
            width={500}
            height={500}
            className=" w-full border-2 border-primary rounded-xl"
          />
        </div>
      </main>
    </>
  );
}
