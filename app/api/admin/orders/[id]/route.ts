import { NextRequest, NextResponse } from "next/server";
import { changeOrderStatus, StoreError } from "@/lib/store";
import { problem, requireAdmin } from "@/lib/http";
import { ORDER_STATUSES } from "@/lib/types";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    await requireAdmin();
    const {id} = await params;
    const {status} = await req.json();
    if (!ORDER_STATUSES.includes(status)) throw new StoreError("Invalid status.");
    return NextResponse.json({ order: await changeOrderStatus(id,status) });
  } catch(e) { return problem(e); }
}
