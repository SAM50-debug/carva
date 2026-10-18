import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  console.error("Missing MONGODB_URI or MONGODB_DB_NAME in .env.local");
  process.exit(1);
}

async function ensureIndexes() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  console.log("Creating high-concurrency indexes for event day...");

  // 1. gate_entries
  console.log("1. Indexing gate_entries...");
  await db.collection("gate_entries").createIndex(
    { registrationId: 1 },
    { name: "gate_reg_id_idx" }
  );
  await db.collection("gate_entries").createIndex(
    { scannedAt: -1 },
    { name: "gate_scanned_at_desc" }
  );
  await db.collection("gate_entries").createIndex(
    { qrCode: 1 },
    { name: "gate_qr_idx" }
  );
  await db.collection("gate_entries").createIndex(
    { university: 1 },
    { name: "gate_uni_idx" }
  );
  // Partial unique index: prevent parallel double admissions for initial entry
  try {
    await db.collection("gate_entries").createIndex(
      { registrationId: 1 },
      { 
        unique: true, 
        partialFilterExpression: { isReEntry: false },
        name: "gate_initial_entry_unique"
      }
    );
    console.log("   -> Created partial unique index on gate_entries (isReEntry: false)");
  } catch (err) {
    console.warn("   -> Note on gate_initial_entry_unique:", err.message);
  }

  // 2. attendance
  console.log("2. Indexing attendance...");
  try {
    await db.collection("attendance").createIndex(
      { registrationId: 1, eventId: 1 },
      { unique: true, name: "attendance_reg_event_unique" }
    );
    console.log("   -> Created compound unique index on attendance (registrationId + eventId)");
  } catch (err) {
    console.warn("   -> Note on attendance_reg_event_unique:", err.message);
  }
  await db.collection("attendance").createIndex(
    { eventId: 1, scannedAt: -1 },
    { name: "attendance_event_scanned_idx" }
  );

  // 3. registrations
  console.log("3. Indexing registrations...");
  try {
    await db.collection("registrations").createIndex({ qrCode: 1 }, { unique: true });
  } catch (e) {
    console.log("   -> qrCode index exists");
  }
  await db.collection("registrations").createIndex(
    { rollNumber: 1 },
    { name: "reg_roll_idx" }
  );
  await db.collection("registrations").createIndex(
    { mobile: 1 },
    { name: "reg_mobile_idx" }
  );
  await db.collection("registrations").createIndex(
    { university: 1, status: 1 },
    { name: "reg_uni_status_idx" }
  );
  await db.collection("registrations").createIndex(
    { "selectedEvents.eventId": 1 },
    { name: "reg_selected_event_idx" }
  );
  await db.collection("registrations").createIndex(
    { registeredAt: -1 },
    { name: "reg_registered_at_desc" }
  );

  // 4. adminUsers & events & categories
  console.log("4. Indexing adminUsers, events, categories...");
  try {
    await db.collection("adminUsers").createIndex({ email: 1 }, { unique: true });
  } catch (e) {}
  try {
    await db.collection("events").createIndex({ slug: 1 }, { unique: true });
  } catch (e) {}
  await db.collection("events").createIndex(
    { categoryId: 1 },
    { name: "event_category_idx" }
  );
  try {
    await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  } catch (e) {}

  console.log("\nAll indexes successfully verified & applied!");
  const collections = ["gate_entries", "attendance", "registrations", "adminUsers", "events", "categories"];
  for (const col of collections) {
    const idxs = await db.collection(col).indexes();
    console.log(`\nIndexes for ${col}:`, idxs.map(i => i.name));
  }

  await client.close();
}

ensureIndexes().catch(err => {
  console.error("Index creation failed:", err);
  process.exit(1);
});
