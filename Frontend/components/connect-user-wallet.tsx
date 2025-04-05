"use client";

import { useState, useEffect } from "react";
import {
  Abstraxion,
  useAbstraxionAccount,
  useModal,
} from "@burnt-labs/abstraxion";
import { Loader, Settings } from "lucide-react";
import Link from "next/link";
import { useGlobalProvider } from "@/lib/globalProvider";
import RegistrationModel from "./registration-model";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function ConnectUserWallet(): JSX.Element {
  const { user } = useGlobalProvider();
  const router = useRouter();
  const { data: account } = useAbstraxionAccount();
  const [showRegistrationModel, setShowRegistrationModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setShowModal]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useModal();

  useEffect(() => {
    console.log("re rendering!");
    if (account?.bech32Address.startsWith("xion")) {
      setLoading(true);
      user?.methods.getUser(account?.bech32Address).then((res) => {
        console.log("res", account?.bech32Address);
        setLoading(false);
        if (!user?.isLogged) {
          setShowRegistrationModel(true);
        }
      });
    }
  }, [account?.bech32Address]);

  return (
    <>
      <Button
        onClick={() => {
          if (user?.isLogged) {
            router.push("/dashboard");
          } else {
            setShowModal(true);
          }
        }}
        className="text-white min-w-[180px]"
      >
        {loading ? (
          <Loader className="animate-spin" />
        ) : account?.bech32Address ? (
          "Go to Dashboard"
        ) : (
          "Get Started"
        )}
      </Button>
      <Abstraxion onClose={() => setShowModal(false)} />
      {showRegistrationModel && (
        <RegistrationModel
          setShowRegistrationModel={setShowRegistrationModel}
        />
      )}
    </>
  );
}
