"use client";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
function Confirmation(){const params=useSearchParams();const id=params.get("id");return <div className="container confirmation"><CheckCircle2 size={64} strokeWidth={1} color="#ad8d4c"/><div className="eyebrow">ORDER RECEIVED</div><h1>Thank you for <em>choosing us.</em></h1><p>We&apos;ve received your Cash on Delivery order. You can track its status from your account.</p>{id&&<div className="order-number">Order reference: <strong>{id.slice(0,8).toUpperCase()}</strong></div>}<Link href="/account/orders" className="button button-gold">VIEW MY ORDERS <ArrowRight size={18}/></Link><Link href="/shop" className="text-link">CONTINUE SHOPPING</Link></div>}

export default function OrderSuccess(){return <Suspense fallback={<div className="container empty-note">Loading your order...</div>}><Confirmation/></Suspense>;}
