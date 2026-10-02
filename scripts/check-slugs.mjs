import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB_NAME);
const events = await db.collection("events").find({}).project({ slug: 1, name: 1, descriptor: 1 }).toArray();
console.log(JSON.stringify(events.map(e => ({ slug: e.slug, name: e.name, hasDescriptor: !!e.descriptor })), null, 2));
await client.close();
process.exit(0);
