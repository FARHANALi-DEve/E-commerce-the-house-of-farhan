import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const seed=JSON.parse(readFileSync(new URL('../data/seed.json',import.meta.url)));
assert.equal(seed.products.length,16);
assert.equal(new Set(seed.products.map(p=>p.id)).size,seed.products.length);
assert.equal(new Set(seed.products.map(p=>p.slug)).size,seed.products.length);
for(const product of seed.products){assert.ok(['Clothing','Footwear','Perfumes','Accessories'].includes(product.category));assert.ok(Number.isInteger(product.price)&&product.price>=0);assert.ok(Number.isInteger(product.stock)&&product.stock>=0);}
for(const filename of ['app/page.tsx','app/shop/page.tsx','app/cart/page.tsx','app/login/page.tsx','app/register/page.tsx','app/checkout/page.tsx','app/account/orders/page.tsx','app/admin/page.tsx','app/api/products/route.ts','app/api/orders/route.ts','app/api/media/route.ts','lib/store.ts','lib/auth.ts','components/Footer.tsx','components/AdminPanel.tsx']) assert.ok(existsSync(filename),filename);
console.log('Smoke checks passed: 16 unique products, all categories, route and component files present.');
