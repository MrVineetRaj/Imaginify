"use client";

import Image from "next/image";

import Header from "@/components/shared/headers";
import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { useEffect, useState } from "react";
import { useGlobalProvider } from "@/lib/globalProvider";
import toast from "react-hot-toast";
// import axios from "axios";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const Credits = () => {
  const { user } = useGlobalProvider();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (signingClient) {
      return;
    }
  }, [signingClient]);

  const buyCreditsFromBlockChain = async (bundle: string, price: string) => {
    const msg = {
      buy_credits: { bundle: bundle },
    };
    setLoading(true);
    try {
      if (signingClient) {
        await signingClient.execute(
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

        toast.success(`Successfully purchased ${bundle} bundle for Imaginify!`);
      }
    } catch (error: any) {
      if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds in your wallet. Please add more XION.");
      }
      // toast.error(error.message);
    } finally {
      setLoading(false);
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
                className="w-full h-14 text-xl disabled:opacity-50"
                disabled={loading}
                onClick={() => {
                  buyCreditsFromBlockChain(
                    plan.name,
                    `${plan?.price * 1000000}`
                  );
                }}
              >
                Buy Now
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Credits;
