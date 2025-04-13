"use client";
import React from "react";
import { Button } from "./ui/button";
import { useGlobalProvider } from "@/lib/globalProvider";
import { Loader } from "lucide-react";

const RegistrationAlert = () => {
  const { registerUser, loadingMessages } = useGlobalProvider();

  return (
    <div className="fixed min-h-screen min-w-screen flex justify-center items-center bg-black/50 top-0 left-0">
      <div className="p-4 bg-secondary rounded-xl shadow-[2px_0px_20px] shadow-primary min-w-64 md:w-[70%] lg:w-[30%] flex items-end flex-col">
        <h1 className="text-2xl font-bold w-full">
          Register on <span className="text-primary">Imaginify</span>
        </h1>

        <p className="text-gray-300 text-sm">
          Before using this platform you must have to register
        </p>

        <Button
          onClick={() => {
            registerUser();
          }}
          className="text-white font-semibold"
        >
          {loadingMessages ? (
            <Loader className="size-6 animate-spin" />
          ) : (
            "Register"
          )}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationAlert;
