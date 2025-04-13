"use client";
import { Collection } from "@/components/images-container";
// import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { formUrlQuery } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {  useState, Suspense } from "react";

// Create a client component to use useSearchParams
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("query") || "";

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(searchQuery || "");

  // Handle search submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "query",
      value: searchText,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <section className="home">
        <h1 className="home-heading shadow-lg rounded-lg">
          Unleash Your Creative Vision with Imaginify
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2 border-2 border-transparent p-2 rounded-md hover:border-white/30 hover:scale-105 hover:shadow-lg transition-transform duration-200"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      {/* Search Form */}
      <section className="mt-6">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search images..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input-field flex-1"
          />
          <button type="submit" className="button bg-gray-90 border 0">
            Search
          </button>
        </form>
      </section>

      <section className="sm:mt-12">
        <Collection pageType={"home"} />
      </section>
    </>
  );
}

// Update the formUrlQuery function in utils.ts if needed
// export const formUrlQuery = ({
//   searchParams,
//   key,
//   value,
// }: {
//   searchParams: string;
//   key: string;
//   value: string;
// }) => {
//   const params = new URLSearchParams(searchParams);
//   params.set(key, value);
//
//   return `${pathname}?${params.toString()}`;
// };

// Loading fallback component
function HomeLoading() {
  return <div className="flex-center h-screen">Loading dashboard...</div>;
}

// Main page component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
