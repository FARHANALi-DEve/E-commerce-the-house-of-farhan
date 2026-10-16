# Final project review — The House of Farhan

**Status:** Source package prepared; *not* yet deployment-verified.

## Checks completed here
- Project ZIP integrity check.
- 38 TS/TSX files parsed successfully (syntax diagnostics: none).
- `npm test` source/seed smoke check passed.
- 16 demo products with unique IDs/slugs covering Clothing, Footwear, Perfumes and Accessories.
- Source review: account login/registration, COD checkout, inventory, admin product/order/founder edit APIs and MongoDB Atlas connection option are included.

## Not verified yet
- `npm install` could not reach the npm registry (`EAI_AGAIN`), so **`next build`, TypeScript typechecking, browser testing and API end-to-end testing were not completed**.
- No real MongoDB Atlas credentials were supplied, so live Atlas connectivity is untested.
- No production website is deployed. No card-payment gateway is present; checkout is Cash on Delivery only.

## First run
1. `npm install`
2. Copy `.env.example` to `.env.local`.
3. Set random `SESSION_SECRET` and new `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters).
4. Leave `MONGODB_URI=` blank to use the local development store.
5. `npm run seed`
6. `npm run typecheck && npm run build`
7. `npm run dev` and open http://localhost:3000; exercise customer + admin flows.

When you're ready for MongoDB Atlas, fill `MONGODB_URI`, stop the server and run `npm run seed` before restarting. Do not commit `.env.local` to GitHub.
