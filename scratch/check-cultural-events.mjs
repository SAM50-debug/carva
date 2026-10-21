import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);

  const cat = await db.collection("categories").findOne({ name: { $regex: "cultural", $options: "i" } });
  console.log("Cultural Category:", cat?._id?.toString(), cat?.name);

  const events = await db.collection("events").find({ categoryId: cat._id }).toArray();
  console.log("\nCurrent Cultural Events in DB (" + events.length + " total):");
  for (const e of events) {
    console.log("-", e.name, "| slug:", e.slug, "| participation:", JSON.stringify(e.participation), "| subEvents:", e.subEvents);
  }

  await client.close();
}

run().catch(console.error);
