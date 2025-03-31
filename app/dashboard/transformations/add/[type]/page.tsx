"use client";
import Header from "@/components/shared/headers";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";


const AddTransformationPage = () => {
  const searchParams = useParams();
  const type = searchParams.type || "";
  const [transformation, setTransformation] = useState<any>();
  useEffect(() => {
    if (type) {
      const transformation = transformationTypes[type as string];
      if (transformation) {
        setTransformation(transformation);
      } else {
        setTransformation("");
      }
      return;
    }
  }, [type]);

  return (
    <>
      <Header
        title={transformation?.title}
        subtitle={transformation?.subTitle}
      />
      <TransformationForm
        action="Add"
        type={transformation?.type as TransformationTypeKey}
        // userId={user?.data?._id!}
        // credit_balance={user?.data?.credit_balance!}
      />
    </>
  );
};

export default AddTransformationPage;
