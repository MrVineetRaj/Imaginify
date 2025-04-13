"use client";
import { navLinks } from "@/constants";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionClient,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import TransactionExplorer from "./TransactionExplorer";
import { useGlobalProvider } from "@/lib/globalProvider";
import RegistrationAlert from "../registration-alert";

const Sidebar = () => {
  const pathname = usePathname();
  const { isRegistered, registerUser } = useGlobalProvider();
  const { data: account } = useAbstraxionAccount();
  const [showTransactionModel, setShowTransactionModel] = React.useState("");
  const [showRegistrationModel, setSowRegistrationModel] =
    React.useState(false);

  const [, setShowModal]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useModal();
  const router = useRouter();

  useEffect(() => {
    setSowRegistrationModel(false);
  }, [isRegistered]);
  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <Link href={"/dashboard"} className="sidebar-logo">
          <Image
            src={"/assets/images/logo-text.svg"}
            alt="logo"
            width={180}
            height={180}
            className="rounded-full"
          />
        </Link>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav_elements">
            {navLinks.slice(0, 6).map((link) => {
              const isActive = link.route === pathname;
              return (
                <li
                  key={link.route}
                  className={`sidebar-nav_element cursor-pointer text-white  shadow-primary/80 ${
                    isActive
                      ? "bg-primary shadow-[2.8px_0px_20px]"
                      : "hover:bg-primary/50 hover:shadow-[2.8px_0px_20px]"
                  }`}
                >
                  <Link
                    href={link.route}
                    className={`sidebar-nav_element_link flex items-center gap-2 text-white`}
                  >
                    <span className={`sidebar-link`}>
                      <Image
                        src={link.icon}
                        alt="icon"
                        width={20}
                        height={20}
                        className={`brightness-200`}
                      />
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <ul className="sidebar-nav_elements">
            <li
              key={"/profile"}
              className={`sidebar-nav_element  shadow-primary/60 ${
                pathname === "/profile"
                  ? "bg-primary shadow-[2.8px_0px_20px]"
                  : "hover:bg-primary/50 hover:shadow-[2.8px_0px_20px]"
              }`}
            >
              <span
                // href={"/profile"}
                onClick={() => {
                  if (isRegistered === 1) {
                    router.push("/profile");
                  } else if (isRegistered === -1) {
                    setShowModal(true);
                  } else {
                    setSowRegistrationModel(true);
                  }
                }}
                className={`sidebar-nav_element_link flex items-center gap-2 text-white cursor-pointer w-full`}
              >
                <span className={`sidebar-link`}>
                  <Image
                    src={"/assets/icons/profile.svg"}
                    alt="icon"
                    width={20}
                    height={20}
                    className={"brightness-200"}
                  />
                  {isRegistered === 1
                    ? "Profile"
                    : isRegistered === 0
                    ? "Register"
                    : "Connect Wallet"}
                </span>
              </span>
            </li>
            {navLinks.slice(7).map((link) => {
              const isActive = link.route === pathname;
              return (
                <li
                  key={link.route}
                  className={`sidebar-nav_element  shadow-primary/60 ${
                    isActive
                      ? "bg-primary shadow-[2.8px_0px_20px]"
                      : "hover:bg-primary/50 hover:shadow-[2.8px_0px_20px]"
                  }`}
                >
                  <Link
                    href={link.route}
                    className={`sidebar-nav_element_link flex items-center gap-2 text-white`}
                  >
                    <span className={`sidebar-link`}>
                      <Image
                        src={link.icon}
                        alt="icon"
                        width={20}
                        height={20}
                        className={"brightness-200"}
                      />
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <Abstraxion onClose={() => setShowModal(false)} />
      {showTransactionModel && (
        <TransactionExplorer
          transactionHash={showTransactionModel}
          setShowModel={setShowTransactionModel}
          description="Your wallet address successfully registered with imaginify."
        />
      )}
      {showRegistrationModel && <RegistrationAlert />}
    </aside>
  );
};

export default Sidebar;
