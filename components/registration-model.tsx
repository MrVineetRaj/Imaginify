import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader, X } from "lucide-react";
import { useGlobalProvider } from "@/lib/globalProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RegistrationModel = ({
  setShowRegistrationModel,
}: {
  setShowRegistrationModel: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { user } = useGlobalProvider();
  const { client: signingClient } = useAbstraxionSigningClient();

  const [formData, setFormData] = React.useState<{
    username: string;
    first_name: string;
    last_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (signingClient) {
      setLoading(false);
      return;
    }
  }, [signingClient]);
  useEffect(() => {
    if (user?.data?.username) {
      setShowRegistrationModel(false);
    }
  }, [user?.walletAddress]);

  const registerUserOnBlockChain = async () => {
    const msg = {
      register_user: {},
    };
    setLoading(true);

    try {
      if (signingClient) {
        await signingClient.execute(
          user?.walletAddress!,
          contractAddress,
          msg,
          "auto"
        );
      }
    } catch (error) {
      console.error("Error querying contract:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    const res = await axios.post("/api/user", {
      username: formData.username,
      wallet_address: user?.walletAddress,
      last_name: formData.last_name,
      first_name: formData.first_name,
    });

    if (res.data.success) {
      setLoading(false);
      user?.methods?.setUser(res.data.data);
      toast.success(res.data.message);
      await registerUserOnBlockChain();
      return;
    }

    setLoading(false);
    toast.error(res.data.message);
  };

  return (
    <div className="w-[100svw] h-screen fixed top-0 left-0 bg-black/50 z-50 flex items-center justify-center">
      {loading ? (
        <Loader className="size-24 animate-spin absolute top-[50%] left-[50%] translate-[50%]" />
      ) : (
        <div className="relative  bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-[90svw] md:w-[50svw] lg:w-[30svw]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Registration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Please fill in the details to register.
          </p>

          <form className="mt-4" onSubmit={handleRegisterUser}>
            <span className="mb-4 flex gap-4 items-center">
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Userame
              </Label>
              <Input
                type="text"
                className="border-2 border-primary"
                id="name"
                required
                placeholder="johndoe"
                onChange={(e) => {
                  setFormData({
                    ...formData!,
                    username: e.target.value,
                  });
                }}
              />
            </span>
            <span className="mb-4 flex gap-4 items-center">
              <Label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name
              </Label>
              <Input
                type="text"
                className="border-2 border-primary"
                id="first_name"
                required
                placeholder="John"
                onChange={(e) => {
                  setFormData({
                    ...formData!,
                    first_name: e.target.value,
                  });
                }}
              />
            </span>
            <span className="mb-4 flex gap-4 items-center">
              <Label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name
              </Label>
              <Input
                type="text"
                className="border-2 border-primary"
                id="last_name"
                required
                placeholder="Doe"
                onChange={(e) => {
                  setFormData({
                    ...formData!,
                    last_name: e.target.value,
                  });
                }}
              />
            </span>
            <Button className="w-full">
              {user?.loading ? (
                <Loader className="animate-spin size-4" />
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegistrationModel;
