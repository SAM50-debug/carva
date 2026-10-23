import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb://triggerproject05_db_user:NuTVZJq1zO2reIku@ac-wzenlrm-shard-00-00.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-01.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-02.tcu0rjs.mongodb.net:27017/?ssl=true&replicaSet=atlas-61cxr7-shard-0&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function check() {
  await client.connect();
  const db = client.db("Cluster0");

  const events = await db.collection("events").find({
    name: { $regex: /fashion modeling/i },
    isActive: true
  }).toArray();

  console.log(`Found ${events.length} active Fashion Modeling events:`);
  for (const e of events) {
    console.log(`\nEvent: ${e.name} (id: ${e._id.toString()})`);
    const escapedName = e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const orConditions = [
      { "selectedEvents.eventId": e._id.toString() },
      { "selectedEvents.eventId": e._id },
      { "selectedEvents.eventName": { $regex: new RegExp(`^${escapedName}$`, "i") } }
    ];
    const regs = await db.collection("registrations").find({
      status: { $ne: "rejected" },
      $or: orConditions
    }).toArray();
    console.log(`Matched ${regs.length} registrations:`);
    regs.forEach(r => {
      console.log(` - ${r.studentName} | ${r.university} | type: ${r.participationType} | teamName: ${r.teamDetails?.teamName || "N/A"}`);
    });
  }

  await client.close();
}

check().catch(console.error);
