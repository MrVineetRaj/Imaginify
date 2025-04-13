"use client";

import Header from "@/components/shared/headers";
// import { IImage } from "@/lib/database/models/image.model";
import { useGlobalProvider } from "@/lib/globalProvider";
import {
  useAbstraxionAccount,
  useAbstraxionClient,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import Image from "next/image";
import React, { Suspense, useEffect } from "react";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTransactions from "@/components/user-transactions";
import { Collection } from "@/components/images-container";

// const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const ProfilePage = () => {
  const { getProfile, isRegistered, getUserImages } = useGlobalProvider();
  const { data: account } = useAbstraxionAccount();
  const { logout } = useAbstraxionSigningClient();
  const router = useRouter();
  const { client: queryClient } = useAbstraxionClient();
  const [images, setImages] = React.useState<number>(null);
  const [creditBalance, setCreditBalance] = React.useState<number>(0);

  useEffect(() => {
    if (isRegistered !== 1) {
      router.push("/");
    }
    getProfile().then((res) => {
      // console.log("Profile", res);
      setCreditBalance(Number(res?.credit_balance));
    });
    getUserImages().then((res) => {
      if (!res) return;
      setImages(res?.length);
    });
  }, [account?.bech32Address, queryClient]);

  return (
    <>
      <Header title={`Greetings! `} />
      <span className="bg-orange-50 px-4 py-1 rounded-full italic font-semibold text-orange-500 text-sm">
        {account?.bech32Address}
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
            <h2 className="h2-bold text-dark-600">{creditBalance || 0}</h2>
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
            <h2 className="h2-bold text-dark-600">{images}</h2>
          </div>
        </div>
      </section>
      <hr className="my-4" />
      <Tabs defaultValue="user-images" className="">
        <TabsList>
          <TabsTrigger value="user-images">User Images</TabsTrigger>
          <TabsTrigger value="liked-images">Liked Images</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>{" "}
        <TabsContent value="user-images">
          <h1 className="h3-bold">Images generated by you</h1>
          <Suspense fallback={<div>Loading user images...</div>}>
            <Collection pageType="user-images" />
          </Suspense>
        </TabsContent>
        <TabsContent value="liked-images">
          <h1 className="h3-bold">Images Liked by you</h1>
          <Suspense fallback={<div>Loading liked images...</div>}>
            <Collection pageType="liked-images" />
          </Suspense>
        </TabsContent>
        <TabsContent value="transactions">
          <h1 className="h3-bold">Your Transactions</h1>
          <UserTransactions />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProfilePage;
