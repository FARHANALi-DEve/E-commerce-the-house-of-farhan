import { NextResponse } from "next/server";
import { StoreError } from "@/lib/store";
import { currentUser } from "@/lib/auth";
import type { Category, Product, Founder, Shipping } from "@/lib/types";

export function problem(error: unknown) {
  if (error instanceof StoreError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("API error", error);
  return NextResponse.json({ error: "An unexpected server error occurred. Check your server log." }, { status: 500 });
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new StoreError("Please sign in to continue.", 401);
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new StoreError("Admin access required.", 403);
  return user;
}
function str(v: unknown, max: number): string {
  if (typeof v !== "string") throw new StoreError("Please provide valid text fields.");
  return v.trim().slice(0, max);
}
function price(v: unknown): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 100_000_000) throw new StoreError("Invalid price.");
  return v;
}
export function validateProduct(body: Record<string, unknown>): Omit<Product, "id" | "createdAt"> {
  const name = str(body.name, 120), brand = str(body.brand, 100);
  const slug = str(body.slug, 130).toLowerCase();
  if (name.length < 2 || brand.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new StoreError("Enter a name, brand and URL-friendly slug.");
  if (!["Clothing", "Footwear", "Perfumes", "Accessories"].includes(String(body.category))) throw new StoreError("Invalid category.");
  const image = str(body.image, 500);
  if (image && !/^https?:\/\//i.test(image) && !image.startsWith("/")) throw new StoreError("Image must be an http(s) URL or /local/path.");
  const stock = price(body.stock), amount = price(body.price);
  const compareAtPrice = body.compareAtPrice == null || body.compareAtPrice === "" ? null : price(body.compareAtPrice);
  return { name, brand, slug, image, stock, price: amount,
    compareAtPrice, category: body.category as Category,
    description: str(body.description, 4000), featured: body.featured === true };
}
export function validateFounder(body: Record<string, unknown>): Founder {
  const photo = str(body.photo || "", 500), instagram = str(body.instagram || "", 300);
  if (photo && !/^https?:\/\//i.test(photo) && !photo.startsWith("/")) throw new StoreError("Use a photo URL starting with https:// or /.");
  if (instagram && !/^https?:\/\//i.test(instagram)) throw new StoreError("Instagram link must start with https://");
  const email = str(body.email || "", 150);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new StoreError("Enter a valid email address.");
  return { name: str(body.name, 100), role: str(body.role, 100), bio: str(body.bio, 1500), photo, instagram, email };
}
export function validateShipping(body: Record<string, unknown>): Shipping {
  const shipping = { fullName: str(body.fullName, 100), phone: str(body.phone, 30), address: str(body.address, 300), city: str(body.city, 100), postalCode: str(body.postalCode || "", 20), notes: str(body.notes || "", 500) };
  if (shipping.fullName.length < 2 || shipping.phone.length < 7 || shipping.address.length < 8 || shipping.city.length < 2) throw new StoreError("Complete your delivery name, phone, address and city.");
  return shipping;
}
