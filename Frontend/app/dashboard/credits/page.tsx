"use client";

import Image from "next/image";

import Header from "@/components/shared/headers";
import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { useEffect, useState } from "react";
import { useGlobalProvider } from "@/lib/globalProvider";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

import TransactionExplorer from "@/components/shared/TransactionExplorer";

// import axios from "axios";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const planPrice: {
  [key: string]: number;
} = {
  Basic: 0.01,
  Pro: 0.02,
  Premium: 0.03,
};
const Credits = () => {
  const { user } = useGlobalProvider();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [loading, setLoading] = useState<string>("");
  const [buyingConfirmationModelOpen, setBuyingConfirmationModelOpen] =
    useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    if (signingClient) {
      return;
    }
  }, [signingClient]);

  const buyCreditsFromBlockChain = async (bundle: string, price: string) => {
    const msg = {
      buy_credits: { bundle: bundle },
    };
    setLoading(bundle);
    try {
      if (signingClient) {
        const res = await signingClient.execute(
          user?.walletAddress!,
          contractAddress,
          msg,
          "auto",
          `Purchase of ${bundle} bundle for Imaginify`,
          [
            {
              denom: "uxion",
              amount: price?.toString() || "0",
            },
          ]
        );

        console.log("Transaction response:", res);
        setTxHash(res.transactionHash);

        toast.success(`Successfully purchased ${bundle} bundle for Imaginify!`);
      }
    } catch (error: any) {
      console.log("Error in transaction:", error);
      if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds in your wallet. Please add more XION.");
      }

      // console.log("Buying credits from blockchain", msg);
    } finally {
      setLoading("");
      setBuyingConfirmationModelOpen("");
    }
  };
  return (
    <>
      <Header
        title="Buy Credits"
        subtitle="Choose a credit package that suits your needs!"
      />

      <section>
        <ul className="credits-list">
          {plans.map((plan) => (
            <li key={plan.name} className="credits-item">
              <div className="flex-center flex-col gap-3">
                <Image src={plan.icon} alt="check" width={50} height={50} />
                <p className="p-20-semibold mt-2 text-purple-500">
                  {plan.name}
                </p>
                <p className="h1-semibold text-dark-600">{plan.price} XION</p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              {/* Inclusions */}
              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map((inclusion) => (
                  <li
                    key={plan.name + inclusion.label}
                    className="flex items-center gap-4"
                  >
                    <Image
                      src={`/assets/icons/${
                        inclusion.isIncluded ? "check.svg" : "cross.svg"
                      }`}
                      alt="check"
                      width={24}
                      height={24}
                    />
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full h-14 text-xl text-white disabled:opacity-50 bg-primary rounded-2xl hover:shadow-[2px_0px_20px] shadow-primary/60"
                onClick={() => {
                  setBuyingConfirmationModelOpen(plan.name);
                }}
              >
                Buy
              </Button>
            </li>
          ))}
        </ul>
        {!!txHash && (
          <TransactionExplorer
            transactionHash={txHash}
            setShowModel={setTxHash}
          />
        )}

        {!!buyingConfirmationModelOpen && (
          <div className="fixed bg-secondary/50 top-0 left-0 w-screen h-screen flex items-center justify-center">
            <div className="bg-gray-900 max-w-[400px] mx-4 p-4 rounded-lg shadow-[2px_0px_20px] shadow-primary/60 flex flex-col items-end gap-4">
              <h1 className="text-2xl font-semibold w-full">Are you sure ?</h1>
              <p className="text-gray-400 text-sm">
                This action cannot be undone. <br /> This will buy{" "}
                {buyingConfirmationModelOpen} plan from your account and amount
                of {planPrice[buyingConfirmationModelOpen]} XION will be
                deducted from your account
              </p>
              <span className="flex items-center gap-4">
                <Button
                  className=" h-12 text-white disabled:opacity-50 "
                  variant="outline"
                  onClick={() => {
                    setBuyingConfirmationModelOpen("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="min-w-[120px]  h-12 text-white disabled:opacity-50 "
                  disabled={!!loading}
                  onClick={() => {
                    buyCreditsFromBlockChain(
                      buyingConfirmationModelOpen,
                      `${planPrice[buyingConfirmationModelOpen]*1000000}`
                    );
                  }}
                >
                  {buyingConfirmationModelOpen === loading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </span>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Credits;
