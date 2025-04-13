"use client";
import Image from "next/image";

import Header from "@/components/shared/headers";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IImageData, useGlobalProvider } from "@/lib/globalProvider";
import { Loader, ThumbsDown, ThumbsUp } from "lucide-react";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import TransactionExplorer from "@/components/shared/TransactionExplorer";
import ImageComments from "@/components/image-comments";
import toast from "react-hot-toast";

const ImageDetails = () => {
  const { getImage } = useGlobalProvider();
  const searchParams = useParams();
  const id = searchParams.id || "";
  const { likeImage, dislikeImage, loadingMessages ,isRegistered} = useGlobalProvider();
  const [image, setImage] = useState<IImageData | null>(null);
  const { data: account } = useAbstraxionAccount();
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    const fetchImage = async () => {
      if (!id) return;
      const imageData = await getImage(id as string);
      setImage(imageData);
    };

    if (txHash) return;
    fetchImage();
  }, [id, txHash]);

  return (
    <>
      {!image ? (
        <>
          <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin text-purple-500 size-20" />
          </div>
        </>
      ) : (
        <>
          <Header title={image?.title} />

          <section className="mt-5 flex flex-wrap gap-4">
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Transformation:</p>
              {/* <p className=" capitalize text-purple-400">
            {image?.transformationType}
          </p> */}
            </div>

            {image?.prompt && (
              <>
                <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
                <div className="p-14-medium md:p-16-medium flex gap-2 ">
                  <p className="text-dark-600">Prompt:</p>
                  <p className=" capitalize text-purple-400">{image?.prompt}</p>
                </div>
              </>
            )}
          </section>

          <section className="mt-4 flex items-center justify-between">
            <span className="text-primary text-sm bg-primary/20 px-4 py-1 rounded-full flex ">
              <span>{image?.author.slice(0, 6) + "..."} </span>
              <span className="hidden md:block">
                {image?.author.slice(-8, -4)}
              </span>
              <span>{image?.author.slice(-4)}</span>
            </span>
            <span className="flex items-center gap-4">
              <span
                className={`flex items-center gap-2 text-green-500 bg-green-50/20 px-5 ${
                  loadingMessages
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => {
                  if (loadingMessages) return;
                  if(isRegistered !== 1) toast("Please authenticate first", {
                    icon: "⚠️",
                  });
                  likeImage(image?.image_id).then((res) => {
                    setTxHash(res);
                  });
                }}
              >
                <ThumbsUp className="size-4" />
                {image?.like_count}
              </span>
              <span
                className={`flex items-center gap-2 text-red-500 bg-red-50/20 px-5 ${
                  loadingMessages
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => {
                  if (loadingMessages) return;
                  if (isRegistered !== 1)
                    toast("Please authenticate first", {
                      icon: "⚠️",
                    });
                  dislikeImage(image?.image_id).then((res) => {
                    setTxHash(res);
                  });
                }}
              >
                <ThumbsDown className={`size-4 `} />
                {image?.dislike_count}
              </span>
            </span>
          </section>
          <section className="mt-5 border-t border-dark-400/15">
            <div className="transformation-grid">
              <div className="flex flex-col gap-4">
                <h3 className="h3-bold text-dark-600">Original</h3>

                {image && (
                  <Image
                    width={400}
                    height={500}
                    src={image?.original_image_url}
                    alt="image"
                    className="transformation-original_image"
                  />
                )}
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="h3-bold text-dark-600">Transformed</h3>

                {image && (
                  <Image
                    width={400}
                    height={500}
                    src={image?.edited_image_url}
                    alt="image"
                    className="transformation-original_image"
                  />
                )}
              </div>

              {/* <TransformedImage
            image={image}
            type={image?.transformationType}
            title={image?.title}
            isTransforming={false}
            transformationConfig={image?.config}
            hasDownload={true}
          /> */}
            </div>
          </section>
          <section className="mt-5 border-t border-dark-400/15">
            <h3 className="h3-bold text-dark-600">Comments</h3>
            <ImageComments imageId={image?.image_id} />
          </section>
        </>
      )}
      {txHash && (
        <TransactionExplorer
          transactionHash={txHash}
          setShowModel={setTxHash}
        />
      )}{" "}
    </>
  );
};

export default ImageDetails;
