import { redirect,notFound } from "next/navigation";
import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { listProducts, listOrders, getFounder } from "@/lib/store";
import { AdminPanel } from "@/components/AdminPanel";
export const metadata:Metadata={title:"Admin Dashboard"};
export const dynamic="force-dynamic";
export default async function AdminPage(){const user=await currentUser();if(!user)redirect("/login?next=%2Fadmin");if(user.role!=="admin")notFound();const [products,orders,founder]=await Promise.all([listProducts(),listOrders(),getFounder()]);return <AdminPanel initialProducts={products} initialOrders={orders} initialFounder={founder} adminName={user.name}/>;}
