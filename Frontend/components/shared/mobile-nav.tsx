"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { navLinks } from "@/constants";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalProvider } from "@/lib/globalProvider";
import { Abstraxion, useModal } from "@burnt-labs/abstraxion";
import RegistrationAlert from "../registration-alert";

const MobileNav = () => {
  const pathname = usePathname();

  const { isRegistered, registerUser } = useGlobalProvider();
  const [showRegistrationModel, setSowRegistrationModel] =
    React.useState(false);

  const [, setShowModal]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useModal();
  const router = useRouter();
  return (
    <header className="header">
      <Link href="/" className="flex items-center gap-2 md:py-2">
        <Image
          src="/assets/images/logo-text.svg"
          alt="logo"
          width={180}
          height={28}
        />
      </Link>
      <Sheet>
        <SheetTrigger>
          <Image
            src={"/assets/icons/menu.svg"}
            alt="menu"
            width={32}
            height={32}
            className="cursor-pointer "
          />
        </SheetTrigger>
        <SheetContent className="sheet-content sm:w-64">
          <SheetHeader>
            <SheetTitle>
              <Image
                src="/assets/images/logo-text.svg"
                alt="logo"
                width={152}
                height={23}
              />
            </SheetTitle>

            <ul className="">
              {navLinks.slice(0, 6).map((link) => {
                const isActive = link.route === pathname;
                return (
                  <li key={link.route}>
                    <Link
                      href={link.route}
                      className={`${isActive && "text-primary"}`}
                    >
                      <span className={`sidebar-link`}>
                        <Image
                          src={link.icon}
                          alt="icon"
                          width={20}
                          height={20}
                          className={`${isActive && "text-primary"}`}
                        />
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}

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
                  <li key={link.route}>
                    <Link
                      href={link.route}
                      className={`${isActive && "text-primary"}`}
                    >
                      <span className={`sidebar-link`}>
                        <Image
                          src={link.icon}
                          alt="icon"
                          width={20}
                          height={20}
                          className={`${isActive && "text-primary"}`}
                        />
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Abstraxion onClose={() => setShowModal(false)} />
      
      {showRegistrationModel && <RegistrationAlert />}
    </header>
  );
};

export default MobileNav;
