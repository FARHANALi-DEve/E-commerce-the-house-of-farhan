import "server-only";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/store";
import type { User } from "@/lib/types";
const scrypt = promisify(scryptCallback);
const COOKIE = "hof_session";
const MAX_AGE = 60 * 60 * 24 * 7;
const secret = () => {
  const value = process.env.SESSION_SECRET || "";
  if (value.length < 32) throw new Error("Configure SESSION_SECRET (32+ characters) in .env.local");
  return value;
};
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string) {
  try {
    const [salt, hex] = encoded.split(":");
    const stored = Buffer.from(hex, "hex");
    const candidate = (await scrypt(password, salt, stored.length)) as Buffer;
    return stored.length === candidate.length && timingSafeEqual(stored, candidate);
  } catch { return false; }
}
export function createToken(userId: string) {
  const value = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${signature}`;
}
function getTokenId(token?: string): string | null {
  if (!token) return null;
  try {
    const [value, signature] = token.split(".");
    if (!value || !signature) return null;
    const actual = Buffer.from(signature, "base64url");
    const expected = createHmac("sha256", secret()).update(value).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return typeof payload.id === "string" && typeof payload.exp === "number" && payload.exp > Date.now() ? payload.id : null;
  } catch { return null; }
}
export async function currentUser(): Promise<User | null> {
  const cookieJar = await cookies();
  const id = getTokenId(cookieJar.get(COOKIE)?.value);
  return id ? findUserById(id) : null;
}
export const sessionCookieOptions = {
  name: COOKIE, httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, path: "/", maxAge: MAX_AGE
};
