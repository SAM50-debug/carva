import { MongoClient } from "mongodb";

const uri = "mongodb://triggerproject05_db_user:NuTVZJq1zO2reIku@ac-wzenlrm-shard-00-00.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-01.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-02.tcu0rjs.mongodb.net:27017/?ssl=true&replicaSet=atlas-61cxr7-shard-0&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db("Cluster0");

  console.log("=== EVENTS WITH FASHION ===");
  const events = await db.collection("events").find({ name: { $regex: /fashion/i } }).toArray();
  console.log(JSON.stringify(events, null, 2));

  console.log("=== REGISTRATIONS WITH FASHION ===");
  const regs = await db.collection("registrations").find({
    "selectedEvents.eventName": { $regex: /fashion/i }
  }).project({
    studentName: 1,
    university: 1,
    mobile: 1,
    participationType: 1,
    "teamDetails.teamName": 1,
    "selectedEvents": 1,
  }).toArray();
  console.log(`Found ${regs.length} registrations with fashion:`);
  console.log(JSON.stringify(regs, null, 2));

  console.log("=== RESULTS WITH FASHION ===");
  const results = await db.collection("event_results").find({
    eventName: { $regex: /fashion/i }
  }).toArray();
  console.log(`Found ${results.length} results:`, JSON.stringify(results, null, 2));

  console.log("=== CERTIFICATES WITH FASHION ===");
  const certs = await db.collection("certificates").find({
    eventName: { $regex: /fashion/i }
  }).toArray();
  console.log(`Found ${certs.length} certificates:`, JSON.stringify(certs, null, 2));

  await client.close();
}

main().catch(console.error);
