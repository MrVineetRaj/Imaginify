"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/lib/database/models/user.model";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";

export interface IGlobalContext {
  user: {
    walletAddress: string;
    data: IUser | null;
    loading: boolean;
    methods: {
      setWalletAddress: (address: string) => void;
      setUser: (user: IUser) => void;
      getUser: (string) => Promise<string>;
      registerUser: (formData: {
        name: string;
        wallet_address: string;
        role: string;
      }) => void;
      loadWalletAddress: (addr: string) => Promise<void>;
    };
    error: string | null;
    isLogged: boolean;
  };
}

export const GlobalContext = createContext<IGlobalContext | null>(null);

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [errorUser, setErrorUser] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const loadWalletAddress = async (address) => {
    await getUser(address);
  };

  const getUser = async (wallet_address = walletAddress) => {
    try {
      // setLoadingUser(true);
      setWalletAddress(wallet_address);
      const res = await axios.get(`/api/user?addr=${wallet_address}`);
      if (res.data.success && res.data) {
        setUser(res.data.data || null);
        setIsLogged(true);
      }
      return res.data.message;
    } catch (error) {
      return "Not able to get user";
    }
  };

  const registerUser = async (formData: {
    name: string;
    wallet_address: string;
    role: string;
  }) => {
    setLoadingUser(true);
    try {
      setLoadingUser(true);

      const res = await axios.post("/api/user", {
        name: formData.name,
        wallet_address: formData.wallet_address,
        role: formData.role,
      });

      if (res.data.success) {
        setUser(res.data.data);
        setIsLogged(true);
        setErrorUser(null);
      } else {
        setUser(null);
        setIsLogged(false);
      }

      return res.data.message;
    } catch (error) {
      setErrorUser("Not able to register user");
    } finally {
      setLoadingUser(false);
    }
  };

  const storeWalletAddress = async (address: string) => {
    setWalletAddress(address);
  };

  const contextValue: IGlobalContext = {
    user: {
      data: user,
      loading: loadingUser,
      walletAddress: walletAddress as string,
      methods: {
        setWalletAddress: storeWalletAddress,
        getUser: getUser,
        registerUser,
        setUser: (user: IUser) => {
          setUser(user);
          setIsLogged(true);
        },
        loadWalletAddress,
      },
      error: errorUser,
      isLogged: isLogged,
    },
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalProvider = () => {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a GlobalProvider");
  }
  return { user: context?.user };
};

export default GlobalProvider;
