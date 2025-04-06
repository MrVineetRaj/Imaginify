"use client";
import { navLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
  const pathname = usePathname();
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
            {navLinks.slice(6).map((link) => {
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
    </aside>
  );
};

export default Sidebar;
