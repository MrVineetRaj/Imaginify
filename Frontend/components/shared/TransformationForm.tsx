"use client";
import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "@/constants";
import { useGlobalProvider } from "@/lib/globalProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form"; // Remove Form import from react-hook-form
import { z } from "zod";
import { CustomField } from "./CustomField";
import { Input } from "../ui/input";
import { Form } from "../ui/form"; // Import Form from UI components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { Button } from "../ui/button";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { getCldImageUrl } from "next-cloudinary";
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import TransactionExplorer from "./TransactionExplorer";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

// Define a type for the form values
type FormValues = z.infer<typeof formSchema>;

const TransformationForm = ({
  action,
  data = null,
  type,
  config = null,
}: TransformationFormProps) => {
  const { createImage, useCredits } = useGlobalProvider();
  const { client: signingClient } = useAbstraxionSigningClient();
  const { data: account } = useAbstraxionAccount();

  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] =
    useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [, startTransition] = useTransition();
  const [transformationConfig, setTransformationConfig] = useState(config);
  const router = useRouter();
  const [txHash, setTxHash] = useState<string>("");
  // const userId = user?.data?._id!;

  // Support both camelCase and snake_case
  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio || data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.public_id || data?.publicId,
        }
      : defaultValues;

  useEffect(() => {
    if (signingClient) {
      return;
    }
  }, [signingClient]);

  useEffect(() => {
    if (image) {
      setNewTransformation(transformationType.config);
    }
  }, [type, image]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const useCreditFromBlockChain = async (creditFee: number) => {
    const msg = { use_credits: { credits: `${Math.abs(creditFee)}` } };
    try {
      if (signingClient) {
        await signingClient.execute(
          account?.bech32Address,
          contractAddress,
          JSON.parse(JSON.stringify(msg)),
          "auto"
        );
      }
    } catch (error) {
      console.error("Error querying contract:", error);
    }
  };
  // Add proper type to onSubmit function
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    if (data || image) {
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig,
      });

      // Fix property names to match expected AddImageParams type
      const imageData = {
        image_id: image?.publicId,
        author: account?.bech32Address,
        original_image_url: image?.secureURL || image?.secureURL,
        edited_image_url: transformationUrl,
        title: values?.title,
        prompt: values.prompt,
      };

      if (action === "Add") {
        try {
          const res = await createImage(imageData);
          router.push(`/transformations/${image?.publicId}`);
        } catch (error) {
          console.log(error);
        }
      }
    }

    setIsSubmitting(false);
  }
  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));

    // console.log(transformationType.config);
    setNewTransformation(transformationType.config);

    return onChangeField(value);
  };

  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === "prompt" ? "prompt" : "to"]: value,
        },
      }));
    }, 1000)();

    return onChangeField(value);
  };

  const onTransformHandler = async () => {
    setIsTransforming(true);

    setTransformationConfig(
      deepMergeObjects(newTransformation, transformationConfig)
    );

    setNewTransformation(null);

    // TODO : Update Credits

    startTransition(async () => {
      const res = await useCredits(creditFee);
      // await updateCredits(userId, creditFee);
      setTxHash(res?.txHash);
    });
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomField
            control={form.control}
            name="title"
            formLabel="Title"
            render={({ field }) => <Input {...field} className="input-field" />}
          />

          {type === "fill" && (
            <CustomField
              control={form.control}
              name="aspectRatio"
              formLabel="Aspect Ratio"
              className="w-full "
              render={({ field }) => (
                <Select
                  onValueChange={(value) =>
                    onSelectFieldHandler(value, field.onChange)
                  }
                  value={field.value}
                >
                  <SelectTrigger className="select-field w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(aspectRatioOptions).map((key) => (
                      <SelectItem key={key} value={key} className="select-item">
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}

          {(type === "remove" || type === "recolor") && (
            <div className="prompt-field">
              <CustomField
                control={form.control}
                name="prompt"
                formLabel={
                  type === "remove" ? "Object to remove" : "Object to recolor"
                }
                className="w-full"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler(
                        "prompt",
                        e.target.value,
                        type,
                        field.onChange
                      )
                    }
                  />
                )}
              />

              {type === "recolor" && (
                <CustomField
                  control={form.control}
                  name="color"
                  formLabel="Replacement Color"
                  className="w-full"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      className="input-field"
                      onChange={(e) =>
                        onInputChangeHandler(
                          "color",
                          e.target.value,
                          "recolor",
                          field.onChange
                        )
                      }
                    />
                  )}
                />
              )}
            </div>
          )}
          <div className="media-uploader-field w-full ">
            <CustomField
              control={form.control}
              name="publicId"
              className="flex size-full flex-col  w-full"
              render={({ field }) => (
                <MediaUploader
                  onValueChange={field.onChange}
                  setImage={setImage}
                  publicId={field.value}
                  image={image}
                  type={type}
                />
              )}
            />

            <TransformedImage
              image={image}
              type={type}
              title={form.getValues().title}
              isTransforming={isTransforming}
              setIsTransforming={setIsTransforming}
              transformationConfig={transformationConfig}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              className="submit-button capitalize"
              disabled={isTransforming || newTransformation === null}
              onClick={onTransformHandler}
            >
              {isTransforming ? "Transforming..." : "Apply Transformation"}
            </Button>
            <Button
              type="submit"
              className="submit-button capitalize"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save Image"}
            </Button>
          </div>
        </form>
      </Form>

      {txHash && (
        <TransactionExplorer
          transactionHash={txHash}
          setShowModel={setTxHash}
        />
      )}
    </>
  );
};

/**
 * 
 * <Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>

 */

export default TransformationForm;
