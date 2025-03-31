"use client";
import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getAllImages } from "@/lib/actions/image.actions";
import { IImage } from "@/lib/database/models/image.model";
import { formUrlQuery } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// Create a client component to use useSearchParams
function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const page = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("query") || "";

  const [images, setImages] = useState<IImage[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(searchQuery || "");

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const result = await getAllImages({ page, searchQuery });
        if (result) {
          setImages(result.data);
          setTotalPages(result.totalPage);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [page, searchQuery]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: 'query',
      value: searchText
    });
    
    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Imaginify
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
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
          <button type="submit" className="btn">Search</button>
        </form>
      </section>

      <section className="sm:mt-12">
        {loading ? (
          <div className="flex-center">Loading images...</div>
        ) : (
          <Collection
            images={images}
            totalPages={totalPages}
            page={page}
          />
        )}
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