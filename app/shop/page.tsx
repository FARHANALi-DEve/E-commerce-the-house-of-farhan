import type { Metadata } from "next";
import { ShopClient } from "@/components/ShopClient";
import { listProducts } from "@/lib/store";
export const metadata: Metadata={title:"Shop the Collection"};
export const dynamic="force-dynamic";
export default async function Shop(){return <ShopClient products={await listProducts()}/>;}
