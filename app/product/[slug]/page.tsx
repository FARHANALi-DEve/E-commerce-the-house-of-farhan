import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, listProducts } from "@/lib/store";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
export const dynamic="force-dynamic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await getProductBySlug(slug);
  if(!product) notFound();
  const similar=(await listProducts()).filter(p=>p.category===product.category && p.id!==product.id).slice(0,4);
  return <div className="container product-page"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <Link href={`/shop?category=${product.category}`}>{product.category}</Link> / {product.name}</div><ProductDetail product={product}/>{similar.length>0&&<section className="section related"><div className="section-heading"><div><div className="eyebrow">HANDPICKED FOR YOU</div><h2>You May Also <em>Love</em></h2></div></div><div className="products-grid">{similar.map(p=><ProductCard product={p} key={p.id}/>)}</div></section>}</div>;
}
