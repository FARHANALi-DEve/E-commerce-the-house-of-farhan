"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";
const categories=["All","Clothing","Footwear","Perfumes","Accessories"];
export function ShopClient({products}:{products:Product[]}){
  const params=useSearchParams(), router=useRouter();
  const category=categories.includes(params.get("category")||"")?params.get("category")!:"All";
  const search=params.get("search")||"";
  const [query,setQuery]=useState(search),[sort,setSort]=useState("newest");
  useEffect(()=>setQuery(search),[search]);
  const filtered=useMemo(()=>{
    const result=products.filter(p=>(category==="All"||p.category===category)&&(`${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase().includes(search.toLowerCase())));
    if(sort==="price-low") result.sort((a,b)=>a.price-b.price);
    if(sort==="price-high") result.sort((a,b)=>b.price-a.price);
    if(sort==="name") result.sort((a,b)=>a.name.localeCompare(b.name));
    return result;
  },[products,category,search,sort]);
  const setFilters=(cat:string,q:string)=>{const next=new URLSearchParams();if(cat!=="All")next.set("category",cat);if(q.trim())next.set("search",q.trim());router.push(`/shop${next.size?`?${next}`:""}`);};
  return <div className="shop-page container"><div className="page-intro"><div className="eyebrow">CURATED FOR YOU</div><h1>The <em>Collection</em></h1><p>Discover timeless pieces, selected for the way you live.</p></div><div className="shop-layout"><aside className="shop-sidebar"><h3>Browse By Category</h3>{categories.map(cat=><button key={cat} className={`category-filter ${cat===category?"selected":""}`} onClick={()=>setFilters(cat,search)}>{cat}<span>{cat==="All"?products.length:products.filter(p=>p.category===cat).length}</span></button>)}<div className="sidebar-note">✦<p>Great style never asks for attention. It simply earns it.</p></div></aside><div className="shop-results"><div className="shop-tools"><span>{filtered.length} {filtered.length===1?"piece":"pieces"} found</span><form onSubmit={e=>{e.preventDefault();setFilters(category,query);}}><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search pieces..." aria-label="Search collection"/></form><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="name">Name: A to Z</option></select></div><div className="mobile-category-list">{categories.map(cat=><button key={cat} className={cat===category?"selected":""} onClick={()=>setFilters(cat,search)}>{cat}</button>)}</div>{filtered.length?<div className="products-grid">{filtered.map(p=><ProductCard product={p} key={p.id}/>)}</div>:<div className="empty-note">No pieces found. Try a different search or category.<button onClick={()=>{setQuery("");setFilters("All","");}}>CLEAR FILTERS</button></div>}</div></div></div>;
}
