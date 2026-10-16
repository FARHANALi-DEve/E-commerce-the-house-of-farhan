import { NextRequest, NextResponse } from "next/server";
import { addProduct, listProducts } from "@/lib/store";
import { problem, requireAdmin, validateProduct } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    let products = await listProducts();
    const category = req.nextUrl.searchParams.get("category");
    const search = req.nextUrl.searchParams.get("search")?.toLowerCase();
    const sort = req.nextUrl.searchParams.get("sort");
    if (category && category !== "All") products = products.filter(p => p.category === category);
    if (search) products = products.filter(p => `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase().includes(search));
    if (req.nextUrl.searchParams.get("featured") === "true") products = products.filter(p => p.featured);
    if (sort === "price-asc") products.sort((a,b) => a.price - b.price);
    else if (sort === "price-desc") products.sort((a,b) => b.price - a.price);
    else if (sort === "name") products.sort((a,b) => a.name.localeCompare(b.name));
    return NextResponse.json({ products });
  } catch(e) { return problem(e); }
}
export async function POST(req: NextRequest) {
  try { await requireAdmin(); return NextResponse.json({ product: await addProduct(validateProduct(await req.json())) }, { status: 201 }); }
  catch(e) { return problem(e); }
}
