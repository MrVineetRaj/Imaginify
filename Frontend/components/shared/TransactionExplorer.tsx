import { X } from "lucide-react";
import React from "react";

const TransactionExplorer = ({
  transactionHash,
  setShowModel,
  description = "Your transaction has been successfully completed.",
}: {
  transactionHash: string;
  setShowModel: (val: string) => void;
  description?: string;
}) => {
  const blockExplorerUrl = `https://explorer.burnt.com/xion-testnet-2/tx/${transactionHash}`;

  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-secondary/50 flex items-center justify-center">
      <div className="min-w-[300px] bg-gray-900 flex flex-col p-4 gap-4 rounded-2xl shadow-[2px_0px_20px] shadow-primary/80 relative">
        <h2 className="text-2xl font-bold text-primary text-left mt-4">
          Transaction Done
        </h2>
        {!!description && <p>{description}</p>}
        <span>
          TxHash :{" "}
          <a
            href={blockExplorerUrl}
            target="__blank"
            className="bg-primary/20 text-primary px-4 py-1 rounded-full"
          >
            {transactionHash.slice(0, 12)}...{transactionHash.slice(-12)}
          </a>
        </span>
        <X
          className="absolute top-4 right-4"
          onClick={() => {
            setShowModel("");
          }}
        />
      </div>
    </div>
  );
};

export default TransactionExplorer;
