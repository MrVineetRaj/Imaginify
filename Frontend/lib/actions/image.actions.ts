"use server";

import { handleError } from "../utils";
import { v2 as cloudinary } from "cloudinary";

// GET IMAGES
export async function getAllImages({
  searchQuery = "",
}: {
  searchQuery?: string;
}) {
  try {
    
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = "folder=imaginify";

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map(
      (resource: any) => resource.publicId || resource.public_id
    );

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: resourceIds,
        },
      };
    }

    return {
      data: resourceIds, 
    };
  } catch (error) {
    handleError(error);
  }
}

