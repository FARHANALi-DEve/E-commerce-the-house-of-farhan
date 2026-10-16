export type Category = "Clothing" | "Footwear" | "Perfumes" | "Accessories";
export type Role = "customer" | "admin";
export type OrderStatus = "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
export type Product = {
  id: string; slug: string; name: string; brand: string; category: Category;
  description: string; price: number; compareAtPrice: number | null; image: string;
  stock: number; featured: boolean; createdAt: string;
};
export type User = {
  id: string; name: string; email: string; passwordHash: string; role: Role; createdAt: string;
};
export type PublicUser = Omit<User, "passwordHash">;
export type CartItem = { productId: string; quantity: number };
export type OrderItem = { productId: string; name: string; price: number; quantity: number; image: string };
export type Shipping = { fullName: string; phone: string; address: string; city: string; postalCode: string; notes: string };
export type Order = {
  id: string; userId: string; items: OrderItem[]; subtotal: number; shippingFee: number;
  total: number; shipping: Shipping; paymentMethod: "Cash on Delivery";
  status: OrderStatus; createdAt: string;
};
export type Founder = {
  name: string; role: string; bio: string; photo: string; instagram: string; email: string;
};
export type LocalData = { users: User[]; products: Product[]; orders: Order[]; founder: Founder };
export const CATEGORIES: Category[] = ["Clothing", "Footwear", "Perfumes", "Accessories"];
export const ORDER_STATUSES: OrderStatus[] = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];
export const publicUser = (user: User): PublicUser => {
  const { passwordHash: _secret, ...safe } = user;
  void _secret;
  return safe;
};
