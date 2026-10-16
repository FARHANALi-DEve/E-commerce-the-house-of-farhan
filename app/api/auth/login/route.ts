import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, StoreError } from "@/lib/store";
import { createToken, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { problem } from "@/lib/http";
import { publicUser } from "@/lib/types";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.email !== "string" || typeof body.password !== "string") throw new StoreError("Invalid email or password.", 401);
    const user = await findUserByEmail(body.email.trim().toLowerCase());
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) throw new StoreError("Invalid email or password.", 401);
    const response = NextResponse.json({ user: publicUser(user) });
    response.cookies.set({ ...sessionCookieOptions, value: createToken(user.id) });
    return response;
  } catch (e) { return problem(e); }
}
