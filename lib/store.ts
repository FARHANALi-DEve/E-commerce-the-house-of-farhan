import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { MongoClient, Db } from "mongodb";
import seed from "@/data/seed.json";
import type { LocalData, Founder, Product, User, Order, CartItem, Shipping, OrderStatus } from "@/lib/types";

const localPath = path.join(process.cwd(), ".data", "store.json");
const seedData = (): LocalData => ({ users: [], orders: [], founder: { ...seed.founder }, products: seed.products as Product[] });
export class StoreError extends Error { constructor(message: string, public status = 400) { super(message); } }

let dbPromise: Promise<Db> | undefined;
function usesMongo() { return Boolean(process.env.MONGODB_URI?.trim()); }
async function mongo(): Promise<Db> {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  if (!dbPromise) {
    dbPromise = (async () => {
      const client = new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 9000 });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || "house_of_farhan");
      await Promise.all([
        db.collection("users").createIndex({ email: 1 }, { unique: true }),
        db.collection("products").createIndex({ slug: 1 }, { unique: true }),
        db.collection("orders").createIndex({ userId: 1, createdAt: -1 })
      ]);
      return db;
    })().catch(err => { dbPromise = undefined; throw err; });
  }
  return dbPromise;
}
async function readLocal(): Promise<LocalData> {
  try { return JSON.parse(await fs.readFile(localPath, "utf8")) as LocalData; }
  catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const initial = seedData();
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    try { await fs.writeFile(localPath, JSON.stringify(initial, null, 2), { flag: "wx" }); }
    catch (e2) { if ((e2 as NodeJS.ErrnoException).code !== "EEXIST") throw e2; }
    return JSON.parse(await fs.readFile(localPath, "utf8")) as LocalData;
  }
}
let queue: Promise<void> = Promise.resolve();
async function updateLocal<T>(fn: (db: LocalData) => T | Promise<T>): Promise<T> {
  let release!: () => void;
  const mine = new Promise<void>(r => { release = r; });
  const previous = queue;
  queue = previous.then(() => mine);
  await previous;
  try {
    const db = await readLocal();
    const value = await fn(db);
    const tmp = `${localPath}.${randomUUID()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, localPath);
    return value;
  } finally { release(); }
}

export async function listProducts(): Promise<Product[]> {
  if (usesMongo()) return (await mongo()).collection<Product>("products").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return (await readLocal()).products.slice().reverse();
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (usesMongo()) return (await mongo()).collection<Product>("products").findOne({ slug }, { projection: { _id: 0 } });
  return (await readLocal()).products.find(p => p.slug === slug) || null;
}
export async function getProductById(id: string): Promise<Product | null> {
  if (usesMongo()) return (await mongo()).collection<Product>("products").findOne({ id }, { projection: { _id: 0 } });
  return (await readLocal()).products.find(p => p.id === id) || null;
}
export async function addProduct(input: Omit<Product, "id" | "createdAt">): Promise<Product> {
  const product: Product = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  if (usesMongo()) {
    try { await (await mongo()).collection<Product>("products").insertOne(product); }
    catch (e) { if ((e as { code?: number }).code === 11000) throw new StoreError("This product slug is already used.", 409); throw e; }
  } else {
    await updateLocal(db => {
      if (db.products.some(p => p.slug === input.slug)) throw new StoreError("This product slug is already used.", 409);
      db.products.push(product);
    });
  }
  return product;
}
export async function changeProduct(id: string, patch: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product> {
  if (usesMongo()) {
    const db = await mongo();
    try {
      const result = await db.collection<Product>("products").findOneAndUpdate({ id }, { $set: patch }, { returnDocument: "after", projection: { _id: 0 } });
      if (!result) throw new StoreError("Product not found.", 404);
      return result;
    } catch(e) { if ((e as { code?: number }).code === 11000) throw new StoreError("This product slug is already used.", 409); throw e; }
  }
  return updateLocal(db => {
    const product = db.products.find(p => p.id === id);
    if (!product) throw new StoreError("Product not found.", 404);
    if (patch.slug && db.products.some(p => p.id !== id && p.slug === patch.slug)) throw new StoreError("This product slug is already used.", 409);
    Object.assign(product, patch);
    return product;
  });
}
export async function removeProduct(id: string): Promise<void> {
  if (usesMongo()) {
    const res = await (await mongo()).collection("products").deleteOne({ id });
    if (!res.deletedCount) throw new StoreError("Product not found.", 404);
  } else await updateLocal(db => {
    if (!db.products.some(p => p.id === id)) throw new StoreError("Product not found.", 404);
    db.products = db.products.filter(p => p.id !== id);
  });
}
export async function findUserByEmail(email: string): Promise<User | null> {
  if (usesMongo()) return (await mongo()).collection<User>("users").findOne({ email: email.toLowerCase() }, { projection: { _id: 0 } });
  return (await readLocal()).users.find(u => u.email === email.toLowerCase()) || null;
}
export async function findUserById(id: string): Promise<User | null> {
  if (usesMongo()) return (await mongo()).collection<User>("users").findOne({ id }, { projection: { _id: 0 } });
  return (await readLocal()).users.find(u => u.id === id) || null;
}
export async function addUser(input: Pick<User, "name" | "email" | "passwordHash">): Promise<User> {
  const user: User = { ...input, email: input.email.toLowerCase(), id: randomUUID(), role: "customer", createdAt: new Date().toISOString() };
  if (usesMongo()) {
    try { await (await mongo()).collection<User>("users").insertOne(user); }
    catch(e) { if ((e as {code?:number}).code === 11000) throw new StoreError("Email is already registered.", 409); throw e; }
  } else await updateLocal(db => {
    if (db.users.some(u => u.email === user.email)) throw new StoreError("Email is already registered.", 409);
    db.users.push(user);
  });
  return user;
}
export async function getFounder(): Promise<Founder> {
  if (usesMongo()) {
    const saved = await (await mongo()).collection<Founder & { key: string }>("settings").findOne({ key: "founder" });
    if (!saved) return seed.founder;
    return { name: saved.name, role: saved.role, bio: saved.bio, photo: saved.photo, instagram: saved.instagram, email: saved.email };
  }
  return (await readLocal()).founder;
}
export async function changeFounder(input: Founder): Promise<Founder> {
  if (usesMongo()) await (await mongo()).collection("settings").updateOne({ key: "founder" }, { $set: { ...input, key: "founder" } }, { upsert: true });
  else await updateLocal(db => { db.founder = input; });
  return input;
}
const SHIPPING_FEE = 0;
function checkAndMakeOrder(products: Product[], userId: string, cart: CartItem[], shipping: Shipping): Order {
  if (!cart.length || cart.length > 50) throw new StoreError("Your cart is empty or too large.");
  const ids = new Set<string>();
  const lines = cart.map(c => {
    if (ids.has(c.productId)) throw new StoreError("Duplicate cart item.");
    ids.add(c.productId);
    if (!Number.isInteger(c.quantity) || c.quantity < 1 || c.quantity > 20) throw new StoreError("Invalid item quantity.");
    const product = products.find(p => p.id === c.productId);
    if (!product) throw new StoreError("A product in your cart is no longer available.", 409);
    if (product.stock < c.quantity) throw new StoreError(`Not enough stock for ${product.name}.`, 409);
    return { productId: product.id, name: product.name, price: product.price, image: product.image, quantity: c.quantity };
  });
  const subtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { id: randomUUID(), userId, items: lines, subtotal, shippingFee: SHIPPING_FEE,
    total: subtotal + SHIPPING_FEE, shipping, paymentMethod: "Cash on Delivery",
    status: "Placed", createdAt: new Date().toISOString() };
}
export async function placeOrder(userId: string, cart: CartItem[], shipping: Shipping): Promise<Order> {
  if (usesMongo()) {
    const db = await mongo();
    // Atlas replica sets support transactions: the stock update and order write are atomic.
    const client = db.client;
    const session = client.startSession();
    let created: Order | undefined;
    try {
      await session.withTransaction(async () => {
        const ids = cart.map(item => item.productId);
        const products = await db.collection<Product>("products").find({ id: { $in: ids } }, { session }).toArray();
        const order = checkAndMakeOrder(products, userId, cart, shipping);
        for (const item of cart) {
          const result = await db.collection<Product>("products").updateOne(
            { id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { session });
          if (!result.modifiedCount) throw new StoreError("Stock changed. Refresh your cart and try again.", 409);
        }
        await db.collection<Order>("orders").insertOne(order, { session });
        created = order;
      });
    } finally { await session.endSession(); }
    if (!created) throw new StoreError("Order could not be created.", 500);
    return created;
  }
  return updateLocal(db => {
    const order = checkAndMakeOrder(db.products, userId, cart, shipping);
    for (const item of cart) db.products.find(p => p.id === item.productId)!.stock -= item.quantity;
    db.orders.push(order);
    return order;
  });
}
export async function listOrders(userId?: string): Promise<Order[]> {
  if (usesMongo()) return (await mongo()).collection<Order>("orders").find(userId ? { userId } : {}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return (await readLocal()).orders.filter(o => !userId || o.userId === userId).slice().reverse();
}
const allowed: Record<OrderStatus, OrderStatus[]> = {
  Placed: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"], Delivered: [], Cancelled: []
};
function ensureTransition(current: OrderStatus, next: OrderStatus) {
  if (!allowed[current].includes(next)) throw new StoreError(`Cannot change ${current} to ${next}.`, 409);
}
export async function changeOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  if (usesMongo()) {
    const db = await mongo(), session = db.client.startSession();
    let updated: Order | undefined;
    try {
      await session.withTransaction(async () => {
        const order = await db.collection<Order>("orders").findOne({ id }, { session });
        if (!order) throw new StoreError("Order not found.", 404);
        ensureTransition(order.status, status);
        // Cancelling an unshipped order restores available stock exactly once.
        if (status === "Cancelled") {
          for (const item of order.items) {
            await db.collection("products").updateOne({ id: item.productId }, { $inc: { stock: item.quantity } }, { session });
          }
        }
        const res = await db.collection<Order>("orders").findOneAndUpdate(
          { id, status: order.status }, { $set: { status } }, { session, returnDocument: "after", projection: { _id: 0 } });
        if (!res) throw new StoreError("Order status changed. Refresh the page.", 409);
        updated = res;
      });
    } finally { await session.endSession(); }
    if (!updated) throw new StoreError("Order status could not be updated.", 500);
    return updated;
  }
  return updateLocal(db => {
    const order = db.orders.find(o => o.id === id);
    if (!order) throw new StoreError("Order not found.", 404);
    ensureTransition(order.status, status);
    if (status === "Cancelled") for (const item of order.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product) product.stock += item.quantity;
    }
    order.status = status;
    return order;
  });
}

// Expose the shared connection to the upload handler (the UI never sees DB credentials).
export async function getDatabaseForMedia(): Promise<Db> { return mongo(); }
