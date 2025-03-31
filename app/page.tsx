import ConnectUserWallet from "@/components/connect-user-wallet";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <h1 className="text-primary text-6xl min-w-[100svw] h-screen flex items-center justify-center">
        <ConnectUserWallet />
      </h1>
    </>
  );
}
