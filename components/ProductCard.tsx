"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";
export function ProductCard({product}:{product:Product}) {
  const {addToCart}=useStore();
  return <article className="product-card"><div className="product-image"><Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`}><img src={product.image||"/product-placeholder.svg"} alt={product.name} loading="lazy"/></Link>{product.compareAtPrice&&product.compareAtPrice>product.price&&<span className="tag-sale">EXCLUSIVE</span>}{product.stock===0&&<span className="tag-sold">SOLD OUT</span>}<button className="quick-add" disabled={!product.stock} onClick={()=>addToCart(product)} aria-label={`Add ${product.name} to bag`}><ShoppingBag size={17}/> <span>ADD TO BAG</span></button></div><div className="product-meta"><span>{product.brand}</span><Link href={`/product/${product.slug}`}><h3>{product.name}</h3></Link><div className="price-row"><strong>{money(product.price)}</strong>{product.compareAtPrice&&product.compareAtPrice>product.price&&<del>{money(product.compareAtPrice)}</del>}</div></div></article>;
}
