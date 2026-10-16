import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "The House of Farhan | Timeless Luxury", template: "%s | The House of Farhan" }, description: "Discover thoughtfully curated clothing, footwear, fragrances and accessories at The House of Farhan." };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><StoreProvider><Header/><main>{children}</main><Footer/></StoreProvider></body></html>;
}
