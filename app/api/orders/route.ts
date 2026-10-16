import { NextRequest, NextResponse } from "next/server";
import { listOrders, placeOrder, StoreError } from "@/lib/store";
import { problem, requireUser, validateShipping } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try { const user = await requireUser(); return NextResponse.json({ orders: await listOrders(user.id) }); }
  catch(e) { return problem(e); }
}
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    if (!Array.isArray(body.items)) throw new StoreError("Invalid cart.");
    const items = body.items.map((item: unknown) => {
      if (!item || typeof item !== "object") throw new StoreError("Invalid cart item.");
      const i = item as Record<string, unknown>;
      if (typeof i.productId !== "string" || typeof i.quantity !== "number") throw new StoreError("Invalid cart item.");
      return { productId: i.productId, quantity: i.quantity };
    });
    const order = await placeOrder(user.id, items, validateShipping(body.shipping || {}));
    return NextResponse.json({ order }, { status: 201 });
  } catch(e) { return problem(e); }
}
