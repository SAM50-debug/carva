import { MongoClient } from "mongodb";

const uri = "mongodb://triggerproject05_db_user:NuTVZJq1zO2reIku@ac-wzenlrm-shard-00-00.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-01.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-02.tcu0rjs.mongodb.net:27017/?ssl=true&replicaSet=atlas-61cxr7-shard-0&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function inspect() {
  await client.connect();
  const db = client.db("Cluster0");

  console.log("=== ATTENDANCE RECORDS ===");
  const attendances = await db.collection("attendance").find({}).toArray();
  console.log(`Found ${attendances.length} attendance records:`);
  for (const a of attendances) {
    console.log({
      _id: a._id,
      registrationId: a.registrationId,
      regType: typeof a.registrationId,
      eventId: a.eventId,
      eventType: typeof a.eventId,
      isEventIdObjectId: a.eventId?._bsontype === "ObjectID" || a.eventId instanceof Object,
      scannedAt: a.scannedAt
    });
  }

  console.log("\n=== SUB ADMIN USERS ===");
  const users = await db.collection("admin_users").find({ role: "sub_admin" }).toArray();
  console.log(`Found ${users.length} sub_admin users:`);
  for (const u of users) {
    console.log({
      username: u.username,
      role: u.role,
      assignedCategoryIds: u.assignedCategoryIds,
      assignedEventIds: u.assignedEventIds
    });
  }

  console.log("\n=== CATEGORIES ===");
  const categories = await db.collection("categories").find({}).project({ name: 1, _id: 1 }).toArray();
  console.log(categories);

  await client.close();
}

inspect().catch(console.error);
