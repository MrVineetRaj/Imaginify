import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ITransactionHistory, useGlobalProvider } from "@/lib/globalProvider";
import {
  useAbstraxionAccount,
  useAbstraxionClient,
} from "@burnt-labs/abstraxion";

const UserTransactions = () => {
  const { getTransactionHistory } = useGlobalProvider();
  const [transactions, setTransactions] = React.useState<ITransactionHistory[]>(
    []
  );

  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();

  useEffect(() => {
    getTransactionHistory().then((res) => {
      // ("Transactions", res);
      console.log("Transactions", res);
      setTransactions(res);
    });
  }, [account?.bech32Address, queryClient]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Credits</TableHead>
          <TableHead>Label</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions?.map((txn, index) => {
          const date = new Date(Number(txn.timestamp)*1000);
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
  );
};

export default UserTransactions;
