"use client";
import MobileNav from "@/components/shared/mobile-nav";
import Sidebar from "@/components/shared/sidebar";
import { useGlobalProvider } from "@/lib/globalProvider";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useGlobalProvider();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isLogged) {
      router.push("/");
    }
  }, [user?.isLogged]);

  return (
    <div className="root">
      {user?.loading  ? (
        <Loader className="size-24 animate-spin absolute top-[50%] left-[50%] translate-[50%]" />
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
