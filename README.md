<div align="center">

# THE HOUSE OF FARHAN
### A premium digital storefront, thoughtfully engineered.

**LUXURY E-COMMERCE · NEXT.JS · MONGODB · WHITE & GOLD**

[Explore the repository](https://github.com/FARHANALi-DEve/E-commerce-the-house-of-farhan) · [Meet the developer](https://github.com/FARHANALi-DEve)

</div>

---

## The experience

**The House of Farhan** is a luxury-inspired, responsive multi-category commerce application. It pairs an editorial white-and-gold storefront with practical shopping and inventory workflows, rather than just static product cards.

Customers can browse collections, filter and search products, manage a cart, register and sign in, place Cash on Delivery orders, and review order history. A separate, protected admin area manages the catalog, orders, and founder information.

> **Project scope:** This is source code for a portfolio-ready commerce application. Sample merchandise and imagery are demonstrations, not brand partnerships. Payments are **Cash on Delivery only**; there is no live card charging, fulfillment integration, or automated email service.

## At a glance

| Storefront | Management | Engineering |
| :--- | :--- | :--- |
| Responsive catalog and product details | Protected admin dashboard | Next.js 15 App Router + React 19 |
| Clothing, shoes, perfumes, accessories | Product CRUD and inventory | TypeScript + server API routes |
| Search, filters and sorting | Order review and status updates | MongoDB Atlas or local JSON datastore |
| Browser-persistent shopping bag | Editable founder details and image | Server-side validation and sessions |
| Customer accounts and order history | Stock restoration for eligible cancellations | Seed and smoke-check scripts |
| Cash on Delivery checkout | Featured product controls | Signed HttpOnly session cookies |

## Quick start

**Requires:** Node.js **20.9+** and npm. From the repository root:

```bash
npm install
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if necessary. Open `.env.local` and configure `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For an offline development database, leave `MONGODB_URI` blank. Then:

```bash
npm run seed
npm run dev
```

Open **http://localhost:3000**; the admin dashboard is at **http://localhost:3000/admin**. Sign in with your configured admin credentials.

### MongoDB Atlas

To connect a real database, create an Atlas cluster and database user; allow the development machine's IP; set `MONGODB_URI` in `.env.local` (and optionally `MONGODB_DB`); stop the server; then run `npm run seed` and `npm run dev` again.

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
MONGODB_DB=house_of_farhan
```

**Never commit real credentials.** Local JSON files under `.data/` are intended for development and are **not automatically migrated** to MongoDB. Seeding Atlas creates sample catalog/admin records; it does not import your previous local customer orders.

## How the app fits together

```text
app/          Routes: shop, cart, checkout, account, admin, API
components/   Storefront and admin UI
lib/          Persistence, sessions, request utilities, data types
data/         Sample products and founder defaults
scripts/      Seed and smoke-test scripts
public/       Static assets
```

Selected server routes include `/api/auth/*`, `/api/products`, `/api/orders`, `/api/admin/orders/*`, `/api/founder`, and `/api/media`. Product prices and inventory should be validated on the server rather than accepted from the browser.

### Developer commands

```bash
npm run dev         # Start development server
npm run build       # Create production build
npm run start       # Serve production build
npm run seed        # Populate demo data and admin
npm run typecheck   # Check TypeScript
npm run test        # Project smoke checks
```

## Deployment readiness

For real sales, use persistent MongoDB, secure production secrets, reliable file storage, domain/HTTPS configuration, delivery policies, tax/shipping calculations, refund and privacy pages, and a real payment gateway **if** online payments are required. Test customer and admin flows end to end before taking orders. Demo external image URLs require connectivity and should be replaced with licensed brand photography.

This README describes the checked-in project structure; it does **not** claim a freshly verified live deployment or successful checkout test on the reader's machine.

---

<div align="center"><sub>Designed and developed by <a href="https://github.com/FARHANALi-DEve">Farhan Ali</a> · Full-Stack Engineering × Luxury UI/UX</sub></div>
