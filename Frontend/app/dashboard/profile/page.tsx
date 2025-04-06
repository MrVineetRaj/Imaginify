"use client";

import Header from "@/components/shared/headers";
import { getUserImages } from "@/lib/actions/image.actions";
import { IImage } from "@/lib/database/models/image.model";
import { useGlobalProvider } from "@/lib/globalProvider";
import {
  useAbstraxionAccount,
  useAbstraxionClient,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import Image from "next/image";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const ProfilePage = () => {
  const { user } = useGlobalProvider();
  const { data: account } = useAbstraxionAccount();
  const { logout } = useAbstraxionSigningClient();
  const router = useRouter();
  const { client: queryClient } = useAbstraxionClient();
  const [images, setImages] = React.useState<IImage[] | null>(null);
  const [creditBalance, setCreditBalance] = React.useState<number>(0);
  const [transactions, setTransactions] = React.useState<
    {
      credits: string;
      label: string;
      timestamp: number;
    }[]
  >([]);

  useEffect(() => {
    getInfoFromBlockChain();
  }, [queryClient]);

  useEffect(() => {
    console.log("rerendering.444444444444....");
    if (user?.data) {
      let page = 1;
      getUserImages({
        limit: 100,
        page,
        userId: user?.data?._id as string,
      }).then((res) => {
        setImages(res?.data);
      });
    }
  }, [user?.data]);
  const getInfoFromBlockChain = async () => {
    try {
      if (queryClient) {
        const user_res = await queryClient.queryContractSmart(contractAddress, {
          get_user: {
            address: account?.bech32Address,
          },
        });
        setCreditBalance(user_res?.user?.credit_balance);

        const transaction_res = await queryClient.queryContractSmart(
          contractAddress,
          {
            get_transactions: {
              address: account?.bech32Address,
            },
          }
        );

        console.log("transaction_res", transaction_res);

        let req_txn = transaction_res?.transactions?.map(
          (txn: { credits: string; label: string; timestamp: string }) => ({
            credits: txn?.credits,
            label: txn?.label,
            timestamp: Number(txn?.timestamp) * 1000,
          })
        );

        setTransactions(req_txn);
      }
    } catch (error) {
      console.error("Error querying contract:", error);
    }
  };

  return (
    <>
      <Header
        title={`Greetings! ${user?.data?.first_name} ${user?.data?.last_name}`}
      />
      <span className="bg-orange-50 px-4 py-1 rounded-full italic font-semibold text-orange-500 text-sm">
        {user?.walletAddress}
      </span>
      <section className="profile relative">
        <LogOut
          className="absolute -top-20 right-5 text-red-500 cursor-pointer"
          onClick={() => {
            logout();
            router.push("/");
          }}
        />
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{images?.length}</h2>
          </div>
        </div>
      </section>
      <hr className="my-4" />
      <h1 className="h3-bold">Your Transactions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Label</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn, index) => {
            const date = new Date(txn.timestamp);
            const formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {formattedDate} {formattedTime}
                </TableCell>
                <TableCell>{txn.credits} credits</TableCell>
                <TableCell>
                  <span
                    className={`px-4 py-1 rounded-full text-xm font-semibold ${
                      txn.label?.toLowerCase() === "used"
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {txn.label?.toLowerCase()}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default ProfilePage;
