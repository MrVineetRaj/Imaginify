import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import AbstraxionProviderWrapper from "@/components/abstraxion-provider-wrapper";
import GlobalProvider from "@/lib/globalProvider";
import { Toaster } from "react-hot-toast";
import MobileNav from "@/components/shared/mobile-nav";
import Sidebar from "@/components/shared/sidebar";

const RubikFont = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Imaginify",
  description: "AI-powered and Blockchain powered image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${RubikFont.variable}  antialiased`}
        suppressHydrationWarning
      >
        <AbstraxionProviderWrapper>
          <GlobalProvider>
            <div className="root">
              <Sidebar />
              <MobileNav />
              <div className="root-container">
                <div className="wrapper">{children}</div>
              </div>
            </div>
            <Toaster />
          </GlobalProvider>
        </AbstraxionProviderWrapper>
      </body>
    </html>
  );
}
