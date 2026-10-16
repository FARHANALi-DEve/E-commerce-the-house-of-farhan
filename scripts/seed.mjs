import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const seed = JSON.parse(readFileSync(new URL('../data/seed.json', import.meta.url), 'utf8'));
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if ((email && !password) || (password && !email)) throw Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD, or neither.');
if (password && password.length < 12) throw Error('ADMIN_PASSWORD must be at least 12 characters.');
const newAdmin = () => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { id:randomUUID(), name:'Farhan Admin', email, passwordHash:`${salt}:${hash}`, role:'admin', createdAt:new Date().toISOString() };
};
async function main() {
  if (process.env.MONGODB_URI?.trim()) {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS:10000 });
    try {
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || 'house_of_farhan');
      await db.collection('users').createIndex({email:1},{unique:true});
      await db.collection('products').createIndex({slug:1},{unique:true});
      let added = 0;
      for (const product of seed.products) {
        const res = await db.collection('products').updateOne({slug:product.slug},{$setOnInsert:product},{upsert:true});
        added += res.upsertedCount;
      }
      await db.collection('settings').updateOne({key:'founder'},{$setOnInsert:{key:'founder',...seed.founder}},{upsert:true});
      if (email) {
        const admin = newAdmin();
        await db.collection('users').updateOne({email}, {$set:{passwordHash:admin.passwordHash,role:'admin',name:admin.name},$setOnInsert:{id:admin.id,email:admin.email,createdAt:admin.createdAt}}, {upsert:true});
      }
      console.log(`MongoDB Atlas setup complete: ${added} new products.${email ? ' Admin created/updated.' : ''}`);
    } finally { await client.close(); }
  } else {
    const filename = resolve('.data/store.json');
    mkdirSync(dirname(filename), {recursive:true});
    const data = existsSync(filename) ? JSON.parse(readFileSync(filename,'utf8')) : {users:[],products:[],orders:[],founder:seed.founder};
    let added = 0;
    for (const product of seed.products) if (!data.products.some(p => p.slug === product.slug)) { data.products.push(product); added++; }
    if (!data.founder) data.founder = seed.founder;
    if (email) { const admin = newAdmin(); data.users = data.users.filter(u => u.email !== email); data.users.push(admin); }
    writeFileSync(filename, JSON.stringify(data,null,2));
    console.log(`Local database setup complete: ${added} new products.${email ? ' Admin created/updated.' : ''}`);
  }
  if (!email) console.log('Tip: set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local and run npm run seed to create admin login.');
}
main().catch(e=> { console.error(e); process.exitCode=1; });
