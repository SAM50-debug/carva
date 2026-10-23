import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

const uri = "mongodb://triggerproject05_db_user:NuTVZJq1zO2reIku@ac-wzenlrm-shard-00-00.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-01.tcu0rjs.mongodb.net:27017,ac-wzenlrm-shard-00-02.tcu0rjs.mongodb.net:27017/?ssl=true&replicaSet=atlas-61cxr7-shard-0&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  console.log("Connecting to MongoDB...");
  await client.connect();
  const db = client.db("Cluster0");

  const CULTURAL_CATEGORY_ID = new ObjectId("6ac7a468a3734fe7a7383c0e");
  const OLD_EVENT_ID_STR = "6ac7a469a3734fe7a7383c17";

  // 1. Fetch current Fashion Modeling event
  const oldEvent = await db.collection("events").findOne({ _id: new ObjectId(OLD_EVENT_ID_STR) });
  console.log("Old Event found:", oldEvent?.name);

  // 2. Fetch and snapshot all registrations referencing Fashion Modeling
  const existingRegs = await db.collection("registrations").find({
    "selectedEvents.eventName": { $regex: /fashion modeling/i }
  }).toArray();

  console.log(`Found ${existingRegs.length} registrations to backup and migrate.`);

  // Write pre-migration backup to scratch
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.resolve("./scratch", `backup_fashion_regs_${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existingRegs, null, 2), "utf8");
  console.log(`Pre-migration backup written to: ${backupPath}`);

  // 3. Upsert the 3 separated events in `events` collection
  const now = new Date();

  // Event 1: Solo
  const soloDoc = {
    slug: "fashion-modeling-solo",
    name: "Fashion Modeling (Solo)",
    descriptor: "Solo Fashion Modeling inter-university runway competition combining couture, poise, and stage presence.",
    participation: {
      type: "individual",
      min: 1,
      max: 1,
      notes: "Solo modeling (1 model)"
    },
    categoryId: CULTURAL_CATEGORY_ID,
    isActive: true,
    updatedAt: now,
    rules: [
      "Solo modeling (1 model per entry).",
      "Performance time: 5 to 8 minutes.",
      "Multiple entries permitted per university/college.",
      "Prohibited tools on stage: real weapons, firearms, open flame, sharp objects.",
      "Decent and appropriate runway couture required."
    ]
  };

  const soloResult = await db.collection("events").findOneAndUpdate(
    { slug: "fashion-modeling-solo" },
    { $set: soloDoc, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  const soloIdStr = soloResult._id.toString();
  console.log(`Created/Updated Solo event: ${soloIdStr} - ${soloDoc.name}`);

  // Event 2: Duet
  const duetDoc = {
    slug: "fashion-modeling-duet",
    name: "Fashion Modeling (Duet)",
    descriptor: "Duet Fashion Modeling (pair of 1 male & 1 female) inter-university runway competition combining couture, coordination, and poise.",
    participation: {
      type: "team",
      min: 2,
      max: 2,
      notes: "Duet modeling (strictly 2 models: 1 male & 1 female)"
    },
    categoryId: CULTURAL_CATEGORY_ID,
    isActive: true,
    updatedAt: now,
    rules: [
      "Duet modeling (strictly 2 models: 1 male & 1 female).",
      "Performance time: 5 to 8 minutes.",
      "Multiple entries permitted per university/college.",
      "Prohibited tools on stage: real weapons, firearms, open flame, sharp objects.",
      "Decent and appropriate runway couture required."
    ]
  };

  const duetResult = await db.collection("events").findOneAndUpdate(
    { slug: "fashion-modeling-duet" },
    { $set: duetDoc, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  const duetIdStr = duetResult._id.toString();
  console.log(`Created/Updated Duet event: ${duetIdStr} - ${duetDoc.name}`);

  // Event 3: Team
  const teamDoc = {
    slug: "fashion-modeling-team",
    name: "Fashion Modeling (Team)",
    descriptor: "Team Fashion Modeling (4–13 models) inter-university runway competition showcasing coordinated couture, choreography, and themed presentations.",
    participation: {
      type: "team",
      min: 4,
      max: 13,
      notes: "Team modeling (strictly 4 to 13 models)"
    },
    categoryId: CULTURAL_CATEGORY_ID,
    isActive: true,
    updatedAt: now,
    rules: [
      "Team modeling (strictly 4 to 13 models).",
      "Performance time: 5 to 8 minutes.",
      "Multiple entries permitted per university/college.",
      "Prohibited tools on stage: real weapons, firearms, open flame, sharp objects.",
      "Decent and appropriate runway couture required."
    ]
  };

  const teamResult = await db.collection("events").findOneAndUpdate(
    { slug: "fashion-modeling-team" },
    { $set: teamDoc, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  const teamIdStr = teamResult._id.toString();
  console.log(`Created/Updated Team event: ${teamIdStr} - ${teamDoc.name}`);

  // 4. Migrate each of the 7 existing registrations
  let soloCount = 0;
  let duetCount = 0;
  let teamCount = 0;

  for (const reg of existingRegs) {
    const updatedSelectedEvents = reg.selectedEvents.map((evt) => {
      const isFashion = (evt.eventName || "").toLowerCase().includes("fashion modeling") ||
                        evt.eventId?.toString() === OLD_EVENT_ID_STR;
      if (!isFashion) return evt;

      const memberCount = evt.teamDetails?.memberCount;
      const isSolo = reg.participationType === "individual" || memberCount === 1;
      const isDuet = reg.participationType === "team" && memberCount === 2;
      const isTeam = reg.participationType === "team" && memberCount >= 11;

      if (isSolo) {
        soloCount++;
        return {
          ...evt,
          eventId: soloIdStr,
          eventName: "Fashion Modeling (Solo)"
        };
      } else if (isDuet) {
        duetCount++;
        return {
          ...evt,
          eventId: duetIdStr,
          eventName: "Fashion Modeling (Duet)"
        };
      } else if (isTeam) {
        teamCount++;
        return {
          ...evt,
          eventId: teamIdStr,
          eventName: "Fashion Modeling (Team)"
        };
      }

      // Default fallback if unclassified
      soloCount++;
      return {
        ...evt,
        eventId: soloIdStr,
        eventName: "Fashion Modeling (Solo)"
      };
    });

    await db.collection("registrations").updateOne(
      { _id: reg._id },
      { $set: { selectedEvents: updatedSelectedEvents, updatedAt: new Date() } }
    );
    console.log(`Migrated registration ${reg._id} (${reg.studentName}) - ${reg.university}`);
  }

  console.log(`\nMigration Summary:`);
  console.log(`- Solo migrated: ${soloCount}`);
  console.log(`- Duet migrated: ${duetCount}`);
  console.log(`- Team migrated: ${teamCount}`);
  console.log(`- Total: ${soloCount + duetCount + teamCount}`);

  // 5. Deactivate old event
  await db.collection("events").updateOne(
    { _id: new ObjectId(OLD_EVENT_ID_STR) },
    { $set: { isActive: false, name: "Fashion Modeling (Deprecated - Merged)", updatedAt: new Date() } }
  );
  console.log(`Old generic event ${OLD_EVENT_ID_STR} deactivated.`);

  // 6. Verification
  console.log("\nVerifying migrated registrations in DB...");
  const verifySolo = await db.collection("registrations").countDocuments({ "selectedEvents.eventId": soloIdStr });
  const verifyDuet = await db.collection("registrations").countDocuments({ "selectedEvents.eventId": duetIdStr });
  const verifyTeam = await db.collection("registrations").countDocuments({ "selectedEvents.eventId": teamIdStr });
  const verifyOld = await db.collection("registrations").countDocuments({ "selectedEvents.eventId": OLD_EVENT_ID_STR });

  console.log(`Verification:`);
  console.log(`- Registrations pointing to Solo: ${verifySolo}`);
  console.log(`- Registrations pointing to Duet: ${verifyDuet}`);
  console.log(`- Registrations pointing to Team: ${verifyTeam}`);
  console.log(`- Registrations pointing to Old event: ${verifyOld} (Expected: 0)`);

  await client.close();
  console.log("\nMigration completed successfully.");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
