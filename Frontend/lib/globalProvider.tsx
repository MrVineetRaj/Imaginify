"use client";
import { createContext, useContext, useEffect, useState } from "react";

import {
  useAbstraxionAccount,
  useAbstraxionClient,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import toast from "react-hot-toast";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
export interface IUser {
  credit_balance: number;
}

export interface ITransactionHistory {
  credits: number;
  label: string;
  timestamp: number;
  amount_used: number;
}

export interface IImageData {
  image_id: string;
  author: string;
  original_image_url: string;
  edited_image_url: string;
  title: string;
  prompt: string;
  like_count?: number;
  dislike_count?: number;
}

export interface IImageComment {
  comment_id: string;
  image_id: string;
  author: string;
  comment: string;
  timestamp: number | string;
}
export interface IGlobalContext {
  getConfig: () => Promise<void>;
  getProfile: () => Promise<IUser | null>;
  getTransactionHistory: () => Promise<ITransactionHistory[] | null>;
  getImage: (image_id: string) => Promise<IImageData | null>;
  getImages: () => Promise<string[] | null>;
  getUserImages: () => Promise<string[] | null>;
  getImageComments: (image_id: string) => Promise<string[] | null>;
  getComment: (comment_id: string) => Promise<IImageComment | null>;
  getLikedImages: () => Promise<string[] | null>;
  registerUser: () => Promise<any>;
  buyCredits: (bundle: string, price: string) => Promise<any>;
  useCredits: (credits: number) => Promise<any>;
  createImage: (data: IImageData) => Promise<any>;
  likeImage: (image_id: string) => Promise<any>;
  dislikeImage: (image_id: string) => Promise<any>;
  createComment: (data: IImageComment) => Promise<any>;
  likeComment: (comment_id: string) => Promise<any>;
  dislikeComment: (comment_id: string) => Promise<any>;
  loadingMessages: boolean;
  isRegistered: number;
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const initUnAuthClient = async () => {
  const rpcEndPoint = "https://rpc.xion-testnet-2.burnt.com:443";
  const unauthClient = await CosmWasmClient.connect(rpcEndPoint);
  return unauthClient;
};

export const GlobalContext = createContext<IGlobalContext | null>(null);

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: account } = useAbstraxionAccount(); // info : for getting wallet details
  const { client: queryClient } = useAbstraxionClient(); //info : for querying smart contract
  const { client: signingClient } = useAbstraxionSigningClient(); // info : for signing transactions
  const [loadingMessages, setLoadingMessages] = useState(false);

  // let unauthClient = Abstract;
  //debug :-1 -> wallet not connected, 0 -> not registered,  1 -> registered
  const [isRegistered, setIsRegistered] = useState(-1);

  useEffect(() => {
    getConfig().then(() => {});
    if (account?.bech32Address && queryClient) {
      const toastId = toast.loading("Loading...");
      queryClient
        .queryContractSmart(CONTRACT_ADDRESS, {
          get_user: {
            address: account?.bech32Address,
          },
        })
        .then((res) => {
          console.log(res);
          if (res.is_registered) {
            setIsRegistered(1);
            toast.success("Account Loaded", {
              id: toastId,
            });
          } else {
            setIsRegistered(0);
            toast.error("You are not registered yet", {
              id: toastId,
            });
          }
        })
        .catch((err) => {
          setIsRegistered(0);
          toast.error("You are not registered yet", {
            id: toastId,
          });
        });
    }
  }, [queryClient, account?.bech32Address, loadingMessages]);

  useEffect(() => {
    if (signingClient) {
      console.log("signingClient loaded");
    }
  }, [signingClient]);

  // info : Listing all the queries
  async function getProfile() {
    //note
    if (!account?.bech32Address) {
      toast.error("Wallet not connected");
      return null;
    }
    try {
      const res = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
        get_user: {
          address: account?.bech32Address,
        },
      });

      const user: IUser = res?.user;
      return user;
    } catch (error) {
      toast.error("Error fetching profile");
      console.error("Error fetching profile", error);
      return null;
    }
  }
  async function getConfig() {
    try {
      const unauthClient = initUnAuthClient();
      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_config: {},
      });
      console.log("\n\n\nres", res, "\n\n\n");
      // return res;
    } catch (error) {
      toast.error("Error fetching profile");
      console.error("Error fetching profile", error);
      // return null;
    }
  }

  //note
  async function getTransactionHistory() {
    try {
      if (!account?.bech32Address) {
        // toast.error("Wallet not connected");
        return null;
      }
      const unauthClient = initUnAuthClient();
      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_transactions: {
          address: account?.bech32Address,
        },
      });

      const transactionHistory: ITransactionHistory[] = res?.transactions;
      return transactionHistory;
    } catch (error) {
      toast.error("Error fetching transaction history");
      console.error("Error fetching transaction history", error);
      return null;
    }
  }

  //note
  async function getImage(image_id: string) {
    try {
      const unauthClient = initUnAuthClient();
      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_image: {
          image_id: image_id,
        },
      });
      const imageData: IImageData = res;
      return imageData;
    } catch (error) {
      toast.error("Error fetching image data");
      console.error("Error fetching image data", error);
      return null;
    }
  }

  //todo
  async function getImages() {
    try {
      const unauthClient = initUnAuthClient();
      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_images: {},
      });
      const images: string[] = res;
      return images;
    } catch (error) {
      toast.error("Error fetching images");
      console.error("Error fetching images", error);
      return null;
    }
  }

  //note
  async function getUserImages() {
    console.log("getUserImages");
    //note
    if (!account?.bech32Address && isRegistered != 1) {
      return null;
    }
    try {
      const unauthClient = initUnAuthClient();

      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_user_images: {
          address: account?.bech32Address,
        },
      });
      const imageIDs: string[] = res;
      return imageIDs;
    } catch (error) {
      toast.error("Error fetching user images");
      console.error("Error fetching user images", error);
      return null;
    }
  }

  async function getImageComments(image_id: string) {
    try {
      const unauthClient = initUnAuthClient();

      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_image_comments: {
          image_id: image_id, //todo : after new update in your contract it will be image_id
        },
      });
      console.log("getImageComments", res);
      const comments: string[] = res;

      return comments;
    } catch (error) {
      toast.error("Error fetching image comments");
      console.error("Error fetching image comments", error);
      return null;
    }
  }

  async function getLikedImages() {
    try {
      const unauthClient = initUnAuthClient();
      console.log("getLikedImages", queryClient);
      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_liked_images: {
          address: account?.bech32Address,
        },
      });
      const imageIDs: string[] = res;
      return imageIDs;
    } catch (error) {
      toast.error("Error fetching liked images");
      console.error("Error fetching liked images", error);
      return null;
    }
  }

  async function getComment(comment_id: string) {
    try {
      const unauthClient = initUnAuthClient();
      console.log("getLikedImages", queryClient);
      const res = await (
        await unauthClient
      ).queryContractSmart(CONTRACT_ADDRESS, {
        get_comment: {
          comment_id: comment_id,
        },
      });
      const comment: IImageComment = res;
      return comment;
    } catch (error) {
      toast.error("Error fetching liked images");
      console.error("Error fetching liked images", error);
      return null;
    }
  }

  // info : For executing messages
  //note
  async function registerUser() {
    setLoadingMessages(true);
    try {
      const msg = {
        register_user: {},
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success("User registered successfully");
        setIsRegistered(1);
        return res.transactionHash;
      }
    } catch (error) {
      toast.error("Error registering user");
      console.error("Error registering user", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  //note
  async function buyCredits(bundle: string, price: string) {
    setLoadingMessages(true);
    try {
      const msg = {
        buy_credits: {
          bundle: bundle,
        },
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
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
        toast.success("Credits purchased successfully");
        return res.transactionHash;
      }
    } catch (error) {
      toast.error("Error purchasing credits");
      console.error("Error purchasing credits", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  //note
  async function useCredits(credits: number) {
    setLoadingMessages(true);

    try {
      const msg = {
        use_credits: {
          credits: `${Math.abs(credits)}`,
        },
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success(`${credits} Credits used successfully`);
        return res.transactionHash;
      }
    } catch (error) {
      toast.error("Error using credits");
      console.error("Error using credits", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  //note
  async function createImage(data: IImageData) {
    setLoadingMessages(true);
    try {
      const msg = {
        create_image: {
          image_id: data.image_id,
          title: data.title,
          prompt: data.prompt,
          original_image_url: data.original_image_url,
          edited_image_url: data.edited_image_url,
          author: account?.bech32Address,
        },
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success("Image created successfully");
        return res.transactionHash;
      }
    } catch (error) {
      toast.error("Error creating image");
      console.error("Error creating image", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function likeImage(image_id: string) {
    setLoadingMessages(true);
    try {
      const msg = {
        like_image: {
          image_id: image_id,
        },
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success("Image liked successfully");
        return res.transactionHash;
      }
    } catch (error: any) {
      if (error.message.includes("Image Already Liked")) {
        toast.error("You previously Liked this imaged");
        return null;
      }

      if (JSON.stringify(error).includes("Image Already Disliked")) {
        toast.error("You previously Liked this imaged");
        return null;
      }
      toast.error("Error liking image");
      console.error("Error liking image", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function dislikeImage(image_id: string) {
    setLoadingMessages(true);
    try {
      const msg = {
        dislike_image: {
          image_id: image_id,
        },
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success("Image disliked successfully");
        return res.transactionHash;
      }
    } catch (error: any) {
      if (error.message.includes("Image Already Liked")) {
        toast.error("You previously Liked this imaged");
        return null;
      }

      if (JSON.stringify(error).includes("Image Already Disliked")) {
        toast.error("You previously Liked this imaged");
        return null;
      }
      toast.error("Error disliking image");
      console.error("Error disliking image", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function createComment(commentData: IImageComment) {
    setLoadingMessages(true);
    try {
      const msg = {
        create_comment: {
          image_id: commentData.image_id,
          comment: commentData.comment,
          comment_id: commentData.comment_id,
          author: account?.bech32Address,
          timestamp: String(commentData.timestamp),
        },
      };

      console.log("Message", msg);
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success("Comment created successfully");
        return res.transactionHash;
      }
    } catch (error) {
      toast.error("Error creating comment");
      console.error("Error creating comment", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function likeComment(comment_id: string) {
    setLoadingMessages(true);
    try {
      const msg = {
        like_comment: {
          comment_id: comment_id,
        },
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success("Comment liked successfully");
        return res;
      }
    } catch (error) {
      toast.error("Error liking comment");
      console.error("Error liking comment", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function dislikeComment(comment_id: string) {
    setLoadingMessages(true);
    try {
      const msg = {
        dislike_comment: {
          comment_id: comment_id,
        },
      };
      if (signingClient && account?.bech32Address) {
        const res = await signingClient.execute(
          account?.bech32Address,
          CONTRACT_ADDRESS,
          msg,
          "auto"
        );
        toast.success("Comment disliked successfully");
        return res.transactionHash;
      }
    } catch (error) {
      toast.error("Error disliking comment");
      console.error("Error disliking comment", error);
    } finally {
      setLoadingMessages(false);
    }
  }

  const contextValue: IGlobalContext = {
    getProfile,
    getTransactionHistory,
    getImage,
    getUserImages,
    getImageComments,
    getLikedImages,
    getImages,
    registerUser,
    buyCredits,
    useCredits,
    createImage,
    likeImage,
    dislikeImage,
    createComment,
    likeComment,
    dislikeComment,
    loadingMessages,
    isRegistered,
    getConfig,
    getComment,
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
    throw new Error("useGlobalProvider must be used within a GlobalProvider");
  }
  return { ...context };
};

export default GlobalProvider;
