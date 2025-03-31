"use client";

import { useState, useEffect } from "react";
import {
  Abstraxion,
  useAbstraxionAccount,
  useModal,
} from "@burnt-labs/abstraxion";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useGlobalProvider } from "@/lib/globalProvider";
import RegistrationModel from "./registration-model";
import { useRouter } from "next/navigation";

export default function ConnectUserWallet(): JSX.Element {
  const { user } = useGlobalProvider();
  const router = useRouter();
  const { data: account } = useAbstraxionAccount();
  const [showRegistrationModel, setShowRegistrationModel] = useState(false);

  const [, setShowModal]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useModal();

  useEffect(() => {
    if (user?.loading) {
      return;
    }

    if (!user?.walletAddress) {
      return;
    }
    if (!user?.isLogged) {
      setShowRegistrationModel(true);
    } else {
      setShowRegistrationModel(false);
      router.push("/dashboard");
    }
  }, [user]);

  return (
    <>
      {account?.bech32Address ? (
        <Link href={"/settings"}>
          <Settings className="w-4 h-4 inline mr-1" />
        </Link>
      ) : (
        <div
          onClick={() => setShowModal(true)}
          className="text-white bg-primary font-semibold p-4 rounded-md cursor-pointer active:scale-95 duration-200"
        >
          Login To Start
        </div>
      )}

      <Abstraxion onClose={() => setShowModal(false)} />
      {showRegistrationModel && (
        <RegistrationModel
          setShowRegistrationModel={setShowRegistrationModel}
        />
      )}
    </>
  );
}
