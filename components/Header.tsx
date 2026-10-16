"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, UserRound, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
export function Header() {
  const pathname=usePathname(), router=useRouter();
  const {cart,user,ready,logout,notify}=useStore();
  const [open,setOpen]=useState(false), [searchOpen,setSearchOpen]=useState(false), [query,setQuery]=useState("");
  const nav=[{href:"/shop",label:"Shop All"},{href:"/shop?category=Clothing",label:"Clothing"},{href:"/shop?category=Footwear",label:"Footwear"},{href:"/shop?category=Perfumes",label:"Fragrance"},{href:"/shop?category=Accessories",label:"Accessories"}];
  function submitSearch(e:React.FormEvent) {e.preventDefault();router.push(`/shop?search=${encodeURIComponent(query)}`);setSearchOpen(false);setOpen(false);}
  return <>
    <div className="announcement">COMPLIMENTARY DELIVERY ON ALL ORDERS <span>✦</span> CURATED LUXURY FOR EVERY DAY</div>
    <header className="site-header">
      <div className="header-main container">
        <button className="icon-button mobile-menu" aria-label="Open menu" onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
        <Link href="/" className="brand" onClick={()=>setOpen(false)}><span className="brand-line">THE HOUSE OF</span><span className="brand-name">FARHAN</span><span className="brand-est">EST. 2026 <i>✦</i> TIMELESS LUXURY</span></Link>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search" onClick={()=>setSearchOpen(!searchOpen)}><Search size={21}/></button>
          {user ? <div className="account-control"><Link className="icon-button" href={user.role==="admin"?"/admin":"/account/orders"} title="Your account"><UserRound size={21}/></Link><button className="icon-button logout-mini" title="Sign out" onClick={async()=>{try{await logout();router.push("/");router.refresh();}catch(e){notify(String(e));}}}><LogOut size={18}/></button></div> : <Link className="icon-button" href="/login" title="Sign in"><UserRound size={21}/></Link>}
          <Link className="bag-link" href="/cart" aria-label="Shopping bag"><ShoppingBag size={21}/><span className="bag-count">{ready?cart.reduce((s,i)=>s+i.quantity,0):0}</span></Link>
        </div>
      </div>
      <nav className={`main-nav ${open?"nav-open":""}`} aria-label="Main navigation"><div className="nav-inner">{nav.map(item=><Link key={item.label} className={pathname==="/shop"&&item.label==="Shop All"?"active":""} href={item.href} onClick={()=>setOpen(false)}>{item.label}</Link>)}<Link href="/about" onClick={()=>setOpen(false)}>Our Story</Link>{user?.role==="admin"&&<Link href="/admin" onClick={()=>setOpen(false)}>Admin</Link>}</div></nav>
      {searchOpen&&<form className="search-bar container" onSubmit={submitSearch}><Search size={20}/><input aria-label="Search products" autoFocus placeholder="Search clothing, shoes, fragrances..." value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit">Search</button><button type="button" className="icon-button" aria-label="Close search" onClick={()=>setSearchOpen(false)}><X size={18}/></button></form>}
    </header>
  </>;
}
