"use client";
import MobileNav from "@/components/shared/mobile-nav";
import Sidebar from "@/components/shared/sidebar";
import { useGlobalProvider } from "@/lib/globalProvider";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useGlobalProvider();
  
  return (
    <div className="root">
      {user?.loading ? (
        <div className="fixed top-0 left-0 h-screen w-[100svw] flex items-center justify-center ">
          <Loader className="size-24 animate-spin " />
        </div>
      ) : (
        <>
          <Sidebar />
          <MobileNav />
          <div className="root-container">
            <div className="wrapper">{children}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardLayout;
