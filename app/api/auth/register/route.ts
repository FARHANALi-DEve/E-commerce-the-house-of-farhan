import { NextRequest, NextResponse } from "next/server";
import { addUser, StoreError } from "@/lib/store";
import { hashPassword, createToken, sessionCookieOptions } from "@/lib/auth";
import { problem } from "@/lib/http";
import { publicUser } from "@/lib/types";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 90);
    const email = String(body.email || "").trim().toLowerCase();
    const password = body.password;
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) throw new StoreError("Enter a valid name and email.");
    if (typeof password !== "string" || password.length < 8 || password.length > 128) throw new StoreError("Use a password between 8 and 128 characters.");
    const user = await addUser({ name, email, passwordHash: await hashPassword(password) });
    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    response.cookies.set({ ...sessionCookieOptions, value: createToken(user.id) });
    return response;
  } catch (e) { return problem(e); }
}
