import Link from "next/link";
import { Instagram, Mail, ArrowUpRight } from "lucide-react";
import { getFounder } from "@/lib/store";
export async function Footer() {
  const founder=await getFounder();
  return <footer className="footer"><div className="container">
    <div className="founder-footer"><div className="founder-photo"><img src={founder.photo || "/founder.jpg"} alt={founder.name}/></div><div className="founder-copy"><div className="eyebrow">A NOTE FROM THE FOUNDER</div><h2>Meet {founder.name}</h2><div className="gold-rule"/><p className="founder-role">{founder.role}</p><p>{founder.bio}</p><div className="founder-links">{founder.instagram&&<a href={founder.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17}/> Instagram <ArrowUpRight size={14}/></a>}{founder.email&&<a href={`mailto:${founder.email}`}><Mail size={17}/> Get in touch</a>}<Link href="/about">Our Story <ArrowUpRight size={14}/></Link></div></div></div>
    <div className="footer-main"><div className="footer-brand"><span className="brand-line">THE HOUSE OF</span><strong>FARHAN</strong><p>Modern essentials. Elevated living.<br/> A world of considered luxury.</p></div><div><h4>Explore</h4><Link href="/shop">All Collections</Link><Link href="/shop?category=Clothing">Clothing</Link><Link href="/shop?category=Footwear">Footwear</Link><Link href="/shop?category=Perfumes">Perfumes</Link></div><div><h4>Assistance</h4><Link href="/cart">Your Bag</Link><Link href="/account/orders">Track Your Orders</Link><Link href="/login">My Account</Link><Link href="/about">About Us</Link></div><div className="footer-news"><h4>Considered, Always.</h4><p>Luxury is the feeling of finding something truly yours.</p><div className="footer-motto">CURATED WITH INTENTION ✦</div></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} The House of Farhan. All rights reserved.</span><span>MADE WITH PURPOSE &nbsp; ✦ &nbsp; PAKISTAN</span></div>
  </div></footer>;
}
