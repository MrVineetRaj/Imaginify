"use client";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
// import "@burnt-labs/abstraxion/dist/index.css";
import React from "react";

const AbstraxionProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const treasuryConfig = {
    treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT!,
    rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
    restUrl: "https://api.xion-testnet-2.burnt.com:443",
  };

  // console.log("treasuryConfig", treasuryConfig);

  return (
    <AbstraxionProvider config={treasuryConfig}>{children}</AbstraxionProvider>
  );
};

export default AbstraxionProviderWrapper;
