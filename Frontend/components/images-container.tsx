"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { IImageData, useGlobalProvider } from "@/lib/globalProvider";
import { getAllImages } from "@/lib/actions/image.actions";

export const Collection = ({
  // hasSearch = false,
  // images,
  pageType = "home",
}: {
  // images: IImage[];
  pageType: string;
  hasSearch?: boolean;
}) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const { getUserImages, getImage, getLikedImages } = useGlobalProvider();
  const router = useRouter();
  const [imageIDs, setImageIDs] = useState<string[] | null>([]);
  const [images, setImages] = useState<IImageData[] | null>(null);

  useEffect(() => {
    if (pageType === "home") {
      const fetchImages = async () => {
        try {
          const result = await getAllImages({ searchQuery });
          // console.log(result);

          const imageDataPromises = Promise.all(
            result.data?.map((imageId) => {
              return getImage(imageId);
            })
          );

          const data = await imageDataPromises;
          // console.log("Image Data", data);
          setImages(data);
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      };

      fetchImages();
    } else if (pageType === "user-images") {
      getUserImages().then((res) => {
        if (!res) return;
        let imageDataPromises = Promise.all(
          res?.map((imageId: string) => {
            return getImage(imageId);
          })
        );

        imageDataPromises
          .then((data) => {
            // console.log("Image Data", data);
            setImages(data);
          })
          .catch((error) => {
            console.error("Error fetching image data:", error);
          });
      });
    } else if (pageType === "liked-images") {
      getLikedImages().then((res) => {
        if (!res) return;
        let imageDataPromises = Promise.all(
          res?.map((imageId: string) => {
            return getImage(imageId);
          })
        );

        imageDataPromises
          .then((data) => {
            "Image Data", data;
            setImages(data);
          })
          .catch((error) => {
            console.error("Error fetching image data:", error);
          });
      });
    }
  }, [searchQuery]);
  // PAGINATION HANDLER

  return (
    <>
      {images?.length > 0 ? (
        <ul className="collection-list">
          {images?.map((image) => (
            <Card image={image} key={image.image_id as string} />
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">Empty List</p>
        </div>
      )}
    </>
  );
};

const Card = ({ image }: { image: IImageData }) => {
  return (
    <li>
      <Link
        href={`/transformations/${image.image_id}`}
        className="collection-card shadow-[0px_0px_10px] shadow-primary/50 hover:shadow-primary hover:shadow-[0px_0px_20px]"
      >
        <Image
          src={image.edited_image_url}
          alt={image.title}
          width={300}
          height={4000}
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover "
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="flex-between">
          <p className="p-20-semibold mr-3 line-clamp-1 text-dark-600">
            {image.title}
          </p>
          {/* <Image
            src={`/assets/icons/${
              transformationTypes[
                image.transformationType as TransformationTypeKey
              ].icon
            }`}
            alt={image.title}
            width={24}
            height={24}
          /> */}
        </div>
      </Link>
    </li>
  );
};
