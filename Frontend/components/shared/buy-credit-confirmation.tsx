import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";

const BuyCreditConfirmation = ({
  buyingConfirmationModelOpen,
  setBuyingConfirmationModelOpen,
  plan,
  buyCreditsFromBlockChain,
  loading,
}: {
  buyingConfirmationModelOpen: boolean;
  setBuyingConfirmationModelOpen: (value: boolean) => void;
  plan: { name: string; price: number };
  buyCreditsFromBlockChain: (planName: string, amount: string) => void;
  loading: string | boolean;
}) => {
  return (
    <AlertDialog open={buyingConfirmationModelOpen}>
      <AlertDialogTrigger
        className="w-full h-14 text-xl text-white disabled:opacity-50 bg-primary rounded-2xl hover:shadow-[2px_0px_20px] shadow-primary/60"
        onClick={() => {
          // console.log("Hello from");
          setBuyingConfirmationModelOpen(true);
        }}
      >
        Buy Now
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. <br /> This will buy {plan.name} plan
            from your account and amount of {plan?.price} XION will be deducted
            from your account
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className=" h-14 "
            onClick={() => {
              setBuyingConfirmationModelOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            className="min-w-[120px]  h-14 text-xl text-white disabled:opacity-50 "
            disabled={!!loading}
            onClick={() => {
              buyCreditsFromBlockChain(plan.name, `${plan?.price * 1000000}`);
            }}
          >
            {plan.name === loading ? (
              <Loader className="animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BuyCreditConfirmation;
