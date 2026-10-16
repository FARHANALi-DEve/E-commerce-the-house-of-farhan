# THE HOUSE OF FARHAN

A custom-built luxury multi-brand e-commerce website in **Next.js 15 (App Router + TypeScript)** with a **MongoDB Atlas backend**, an optional **local JSON development database**, and a responsive **white-and-gold** design.

## Start in 4 steps

Requirements: **Node.js 20.9+**, npm. (Node 22 LTS recommended.)

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and replace the default values for `SESSION_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Initially **leave `MONGODB_URI=` empty**. This uses a persistent local data file at `.data/store.json`. You can create an admin and seed the collection with:

```bash
npm run seed
npm run dev
```

Then visit **http://localhost:3000**. Log in with the exact `ADMIN_EMAIL` and `ADMIN_PASSWORD` you placed in `.env.local`. Visit **/admin**.

> The local JSON mode is intended for development, not multi-instance production hosting. It persists customer accounts, orders, stock and founder settings between local restarts. Uploaded photos are stored under `.data/media/`. Files in `.data` are gitignored.

## Switch to MongoDB Atlas yourself

1. In MongoDB Atlas, create a project and cluster (a free tier works for demos).
2. Under **Database Access**, create a database user with a strong password and appropriate access to your application database.
3. Under **Network Access**, allow your development machine's current IP. Configure a restricted access policy for deployment; avoid broad access except when strictly needed.
4. Choose **Connect → Drivers**, copy the `mongodb+srv://...` connection string and substitute the user's password (URL-encode special characters).
5. In `.env.local`, fill in `MONGODB_URI=mongodb+srv://...` and leave `MONGODB_DB=house_of_farhan` or change it as desired.
6. **Stop the dev server**, run `npm run seed` once to populate the Atlas database and create the admin account there, then run `npm run dev` again.
7. Confirm products appear and test registration, adding a product, checkout and order status changes.

**Never paste your Atlas URI into client-side code, commit `.env.local`, or upload it to GitHub.** Your URI stays server-side. Local JSON records are **not automatically migrated** to Atlas when you switch; the seed command adds sample products and your admin account to the new database. Other local user/order data stays local.

## Functionality included

| Customer experience | Admin experience |
|---|---|
| Home page and editorial collections | Protected admin dashboard |
| Clothing, footwear, perfumes, accessories | Add/edit/delete products |
| Search, category filters, sorting | Product prices, inventory and featured flags |
| Product detail and quantity selector | Review customer orders / delivery addresses |
| Persistent shopping bag (browser local storage) | Manage order statuses |
| Registration, login, logout, password hashing | Cancel an unshipped order & restore inventory |
| Signed, HttpOnly session cookie | Edit founder bio, role, email and Instagram |
| Checkout with validated shipping address | Upload founder photo (JPEG/PNG/WebP, up to 3MB) |
| Cash on Delivery order placement | Changes reflected in About page and footer |
| Server-side stock checks and transaction | Orders and data persist in MongoDB Atlas |
| Order history and shipment status | No exposed admin password or URI in frontend |

Sample product labels are **fictional demonstration brands**, not verified external vendor partnerships. Images are external Unsplash demo URLs and require internet access on the viewer's device. Replace the demo images and products with your licensed content before opening a real store.

### Payment scope

The checkout **really creates an order** and updates inventory. It only supports **Cash on Delivery**. It does **not** collect cards, charge payments, arrange couriers, or send emails. Online payments require separate payment-provider onboarding, webhooks and credentials; those actions are intentionally **not** faked.

### API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/products`, `POST /api/products` (admin)
- `PUT /api/products/:id`, `DELETE /api/products/:id` (admin)
- `GET /api/orders`, `POST /api/orders` (signed-in customer)
- `PATCH /api/admin/orders/:id` (admin)
- `GET /api/founder`, `PUT /api/founder` (admin to edit)
- `POST /api/media` (admin upload), `GET /api/media/:id`

Authenticated APIs validate authorization on the server. Order totals and inventory are derived from server-side product data instead of trusting browser prices. MongoDB Atlas orders use a multi-document transaction to reserve inventory and create the order together. Sessions use a signed 7-day HttpOnly cookie; passwords are hashed using Node's scrypt.

### Before public deployment

- Set `MONGODB_URI`, `SESSION_SECRET` and unique admin credentials on your hosting service **as secrets/environment variables**. Never deploy with the included example values.
- Use MongoDB Atlas in production. The local database/photo directory is not a replacement for durable cloud storage on serverless platforms.
- Configure shipping rates and taxes for your jurisdiction; the sample includes **free shipping** and **no separate tax calculation**.
- Add your actual customer service details, refund policy, shipping policy, terms and privacy policy before accepting real orders.
- Consider password reset / email verification, login rate limits, backup strategy, monitoring, accessibility auditing and end-to-end tests for production.
- Change all demonstration images, placeholder founder bio and product data.

## Useful commands

```bash
npm run dev        # Development server
npm run build      # Production build (requires installed dependencies)
npm run start      # Run production build
npm run typecheck  # TypeScript validation
npm run seed       # Non-destructive demo seed + create/update admin login
npm run test       # Source-structure and seed consistency checks
```

## Project layout

```text
app/             Pages and server API route handlers
components/      Interactive storefront and admin screens
lib/             MongoDB/local storage, session security, input validation
scripts/         Idempotent seed script and smoke checks
data/            16 demo products and editable founder defaults
public/          Image placeholder
```

## Build/test note

The code was generated in an environment where the npm registry could not be reached, so a full `npm install` / running-server / browser checkout test could **not** be carried out here. The bundled smoke test checks file structure and seed integrity. Please run `npm install`, `npm run typecheck`, `npm run build` and test the customer/admin workflows on your machine before a real deployment.
