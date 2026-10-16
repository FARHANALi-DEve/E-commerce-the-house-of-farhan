import { NextRequest, NextResponse } from "next/server";
import { changeProduct, removeProduct } from "@/lib/store";
import { problem, requireAdmin, validateProduct } from "@/lib/http";
export async function PUT(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try { await requireAdmin(); const {id} = await params; return NextResponse.json({ product: await changeProduct(id, validateProduct(await req.json())) }); }
  catch(e) { return problem(e); }
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try { await requireAdmin(); const {id} = await params; await removeProduct(id); return NextResponse.json({ok:true}); }
  catch(e) { return problem(e); }
}
