"use client";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Truck, ShieldCheck, Minus, Plus, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";
import { useStore } from "@/components/StoreProvider";
export function ProductDetail({product}:{product:Product}){
  const [qty,setQty]=useState(1);
  const {addToCart}=useStore();
  return <div className="product-detail"><div className="detail-photo"><img src={product.image||"/product-placeholder.svg"} alt={product.name}/></div><div className="detail-info"><div className="eyebrow">{product.category.toUpperCase()} / {product.brand.toUpperCase()}</div><h1>{product.name}</h1><div className="price-row large"><strong>{money(product.price)}</strong>{product.compareAtPrice&&product.compareAtPrice>product.price&&<del>{money(product.compareAtPrice)}</del>}</div><div className="gold-rule"/><p className="detail-description">{product.description}</p><div className="stock-display"><Check size={16}/> {product.stock>0?`${product.stock} available in stock`:"Currently sold out"}</div><div className="detail-actions"><div className="quantity"><button aria-label="Decrease quantity" onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={17}/></button><span>{qty}</span><button aria-label="Increase quantity" onClick={()=>setQty(Math.min(20,product.stock,qty+1))}><Plus size={17}/></button></div><button className="button button-gold detail-add" disabled={!product.stock} onClick={()=>addToCart(product,qty)}><ShoppingBag size={18}/> {product.stock?"ADD TO BAG":"SOLD OUT"}</button></div><Link className="detail-cart-link" href="/cart">View your shopping bag →</Link><div className="detail-perks"><div><Truck size={22}/><span><b>Complimentary Delivery</b><small>On every order in Pakistan</small></span></div><div><ShieldCheck size={22}/><span><b>Secure Checkout</b><small>Cash on Delivery available</small></span></div></div></div></div>;
}
