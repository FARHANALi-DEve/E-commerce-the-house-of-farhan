import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { listOrders } from "@/lib/store";
import { money,orderDate } from "@/lib/utils";
import Link from "next/link";
export const metadata:Metadata={title:"My Orders"};
export const dynamic="force-dynamic";
export default async function Orders(){const user=await currentUser();if(!user) redirect("/login?next=%2Faccount%2Forders");const orders=await listOrders(user.id);return <div className="container orders-page"><div className="page-intro"><div className="eyebrow">YOUR ACCOUNT</div><h1>Order <em>History</em></h1><p>Welcome back, {user.name}. Here&apos;s where your pieces are.</p></div>{orders.length===0?<div className="empty-cart"><h2>No orders just yet</h2><p>Your next favorite thing is waiting.</p><Link className="button button-gold" href="/shop">EXPLORE COLLECTION →</Link></div>:<div className="orders-list">{orders.map(order=><article className="order-card" key={order.id}><div className="order-card-header"><div><span className="eyebrow">ORDER #{order.id.slice(0,8).toUpperCase()}</span><p>{orderDate(order.createdAt)}</p></div><span className="order-status">{order.status}</span></div><div className="ordered-items">{order.items.map(item=><div key={item.productId}><img src={item.image||"/product-placeholder.svg"} alt={item.name}/><div><strong>{item.name}</strong><p>{money(item.price)} × {item.quantity}</p></div></div>)}</div><div className="order-card-bottom"><span>Cash on Delivery • {order.shipping.city}</span><strong>Total: {money(order.total)}</strong></div></article>)}</div>}</div>}
