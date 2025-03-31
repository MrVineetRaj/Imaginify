import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { z } from "zod";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "../ui/form";

// import { formSchema } from "./TransformationForm";


type CustomFieldProps<T extends FieldValues> = {
  control: Control<T>;
  render: (props: { field: any }) => React.ReactNode;
  name: FieldPath<T>;
  formLabel?: string;
  className?: string;
};



export const CustomField = <T extends Record<string, any>>({
  control,
  render,
  name,
  formLabel,
  className,
}: CustomFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          <FormControl>{render({ field })}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
