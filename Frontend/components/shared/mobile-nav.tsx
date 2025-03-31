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
import { usePathname } from "next/navigation";

const MobileNav = () => {
  const pathname = usePathname();
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
              {navLinks.map((link) => {
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
    </header>
  );
};

export default MobileNav;
