"use client";
import Image from "next/image";

import Header from "@/components/shared/headers";
import TransformedImage from "@/components/shared/TransformedImage";
import { getImageById } from "@/lib/actions/image.actions";
import { getImageSize } from "@/lib/utils";
import { useEffect, useState } from "react";
import { IImage } from "@/lib/database/models/image.model";
import { useParams } from "next/navigation";

const ImageDetails = () => {
  const searchParams = useParams();
  const id = searchParams.id || "";

  const [image, setImage] = useState<IImage | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!id) return;
      const image = await getImageById(id as string);
      setImage(image);
    };

    fetchImage();
  }, [id]);

  return (
    <>
      <Header title={image?.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className=" capitalize text-purple-400">
            {image?.transformationType}
          </p>
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

        {image?.color && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Color:</p>
              <p className=" capitalize text-purple-400">{image?.color}</p>
            </div>
          </>
        )}

        {image?.aspectRatio && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Aspect Ratio:</p>
              <p className=" capitalize text-purple-400">
                {image?.aspectRatio}
              </p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="transformation-grid">
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>

            {image && (
              <Image
                width={getImageSize(image?.transformationType, image, "width")}
                height={getImageSize(
                  image?.transformationType,
                  image,
                  "height"
                )}
                src={image?.secureURL}
                alt="image"
                className="transformation-original_image"
              />
            )}
          </div>

          <TransformedImage
            image={image}
            type={image?.transformationType}
            title={image?.title}
            isTransforming={false}
            transformationConfig={image?.config}
            hasDownload={true}
          />
        </div>
      </section>
    </>
  );
};

export default ImageDetails;
