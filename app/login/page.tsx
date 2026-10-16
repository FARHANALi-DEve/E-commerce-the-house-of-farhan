"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { api } from "@/lib/utils";
function LoginForm(){
  const router=useRouter(),params=useSearchParams(),{refreshUser}=useStore();
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setError("");setBusy(true);try{const data=await api<{user:{role:string}}>("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})});await refreshUser();const next=params.get("next");router.push(next?.startsWith("/")&&!next.startsWith("//")?next:(data.user.role==="admin"?"/admin":"/account/orders"));router.refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <section className="auth-section"><div className="auth-aside"><div className="eyebrow">THE HOUSE OF FARHAN</div><h1>Your world<br/>of <em>luxury</em><br/>awaits.</h1><p>Sign in to your account to track orders and discover your next favorite piece.</p></div><div className="auth-panel"><div className="eyebrow">WELCOME BACK</div><h2>Sign In</h2><p className="muted">New to the House? <Link href="/register">Create an account</Link></p><form onSubmit={submit} className="form-stack"><label>Email address<input autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input autoComplete="current-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<button disabled={busy} className="button button-gold" type="submit">{busy?"SIGNING IN...":"SIGN IN"} <ArrowRight size={18}/></button></form></div></section>;
}

export default function Login(){return <Suspense fallback={<div className="container empty-note">Loading sign in...</div>}><LoginForm/></Suspense>;}
