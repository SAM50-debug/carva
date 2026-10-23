import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb://triggerproject05_db_user:NuTVZJq1zO2reIku@ac-wzenlrm-shard-00-00.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-01.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-02.tcu0rjs.mongodb.net:27017/?ssl=true&replicaSet=atlas-61cxr7-shard-0&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function testPipeline() {
  await client.connect();
  const db = client.db("Cluster0");

  console.log("=== Testing attendance-records pipeline without matchStage ===");
  try {
    const pipeline = [
      {
        $lookup: {
          from: "registrations",
          localField: "registrationId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      {
        $lookup: {
          from: "events",
          let: { event_id: { $toObjectId: "$eventId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$event_id"] } } }
          ],
          as: "eventInfo"
        }
      },
      { $unwind: "$eventInfo" },
      { $sort: { scannedAt: -1 } },
      { $limit: 10 }
    ];
    const res = await db.collection("attendance").aggregate(pipeline).toArray();
    console.log("Pipeline result length:", res.length);
    if (res[0]) {
      console.log("Sample record:", {
        student: res[0].studentInfo?.studentName,
        event: res[0].eventInfo?.name
      });
    }
  } catch (err) {
    console.error("Pipeline error:", err);
  }

  await client.close();
}

testPipeline().catch(console.error);
