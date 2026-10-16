"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product, PublicUser } from "@/lib/types";

type StoreContext = {
  cart: CartItem[]; user: PublicUser | null; ready: boolean; authReady: boolean; notice: string;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  notify: (message: string) => void;
};
const Ctx = createContext<StoreContext | null>(null);
const CART_KEY = "house_of_farhan_cart_v1";
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart,setCart] = useState<CartItem[]>([]);
  const [user,setUser] = useState<PublicUser | null>(null);
  const [ready,setReady] = useState(false);
  const [authReady,setAuthReady] = useState(false);
  const [notice,setNotice] = useState("");
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(raw)) setCart(raw.filter(i => typeof i.productId === "string" && Number.isInteger(i.quantity) && i.quantity > 0).slice(0,50));
    } catch { /* ignore corrupted cart */ }
    setReady(true);
  },[]);
  useEffect(() => { if (ready) localStorage.setItem(CART_KEY,JSON.stringify(cart)); },[cart,ready]);
  const refreshUser = useCallback(async () => {
    try { const res=await fetch("/api/auth/me",{cache:"no-store"}); if(!res.ok) throw Error(); const data=await res.json(); setUser(data.user); }
    catch { setUser(null); }
    finally { setAuthReady(true); }
  },[]);
  useEffect(() => { void refreshUser(); },[refreshUser]);
  const notify = useCallback((message:string) => { setNotice(message); },[]);
  useEffect(() => { if (!notice) return; const id=window.setTimeout(()=>setNotice(""),3000); return ()=>clearTimeout(id); },[notice]);
  const addToCart = useCallback((product: Product,quantity=1) => {
    if(product.stock<=0) { notify("This product is sold out."); return; }
    setCart(items => {
      const existing=items.find(i=>i.productId===product.id);
      if (existing) return items.map(i=>i.productId===product.id?{...i,quantity:Math.min(product.stock,20,i.quantity+quantity)}:i);
      return [...items,{productId:product.id,quantity:Math.min(product.stock,20,quantity)}];
    });
    notify(`${product.name} added to bag`);
  },[notify]);
  const updateQuantity = useCallback((id:string,quantity:number)=>setCart(items=>items.map(i=>i.productId===id?{...i,quantity:Math.min(20,Math.max(1,quantity))}:i)),[]);
  const removeFromCart = useCallback((id:string)=>setCart(items=>items.filter(i=>i.productId!==id)),[]);
  const clearCart = useCallback(()=>setCart([]),[]);
  const logout = useCallback(async () => {
    const res=await fetch("/api/auth/logout",{method:"POST"});
    if(!res.ok) throw Error("Unable to log out. Please try again.");
    setUser(null); notify("You have signed out.");
  },[notify]);
  const value = useMemo(()=>({cart,user,ready,authReady,notice,addToCart,updateQuantity,removeFromCart,clearCart,refreshUser,logout,notify}),[cart,user,ready,authReady,notice,addToCart,updateQuantity,removeFromCart,clearCart,refreshUser,logout,notify]);
  return <Ctx.Provider value={value}>{children}{notice && <div className="toast" role="status">{notice}</div>}</Ctx.Provider>;
}
export function useStore() { const ctx=useContext(Ctx); if(!ctx) throw Error("Missing StoreProvider"); return ctx; }
