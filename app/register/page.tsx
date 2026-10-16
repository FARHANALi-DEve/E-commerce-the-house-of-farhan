"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { api } from "@/lib/utils";
export default function Register(){
  const router=useRouter(),{refreshUser}=useStore();
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setError("");if(password!==confirm){setError("Passwords do not match.");return;}setBusy(true);try{await api("/api/auth/register",{method:"POST",body:JSON.stringify({name,email,password})});await refreshUser();router.push("/account/orders");router.refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <section className="auth-section"><div className="auth-aside"><div className="eyebrow">JOIN THE HOUSE</div><h1>The first step<br/>to <em>something</em><br/>exceptional.</h1><p>Join our circle and enjoy a seamless, considered shopping experience.</p></div><div className="auth-panel"><div className="eyebrow">BECOME A MEMBER</div><h2>Create Account</h2><p className="muted">Already a member? <Link href="/login">Sign in</Link></p><form onSubmit={submit} className="form-stack"><label>Full name<input autoComplete="name" minLength={2} maxLength={90} required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label>Email address<input autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input autoComplete="new-password" type="password" minLength={8} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><label>Confirm password<input autoComplete="new-password" type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your password"/></label>{error&&<div className="form-error" role="alert">{error}</div>}<button disabled={busy} className="button button-gold" type="submit">{busy?"CREATING ACCOUNT...":"CREATE ACCOUNT"} <ArrowRight size={18}/></button></form></div></section>;
}
