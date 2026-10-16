import { NextRequest, NextResponse } from "next/server";
import { changeFounder, getFounder } from "@/lib/store";
import { problem, requireAdmin, validateFounder } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ founder: await getFounder() }); }
  catch(e) { return problem(e); }
}
export async function PUT(req: NextRequest) {
  try { await requireAdmin(); return NextResponse.json({ founder: await changeFounder(validateFounder(await req.json())) }); }
  catch(e) { return problem(e); }
}
