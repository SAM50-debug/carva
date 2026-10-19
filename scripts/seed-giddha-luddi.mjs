import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  console.error("Missing MONGODB_URI or MONGODB_DB_NAME in .env.local");
  process.exit(1);
}

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const category = await db.collection("categories").findOne({ name: { $regex: "cultural", $options: "i" } });
  if (!category) {
    console.error("Cultural Events category not found!");
    process.exit(1);
  }
  const categoryId = category._id;
  console.log(`Found Cultural Events category: ${categoryId} (${category.name})`);

  const eventsToAdd = [
    {
      name: "Giddha",
      slug: "giddha",
      categoryId: categoryId,
      descriptor: "Traditional Punjabi folk dance celebrating feminine grace, lively boliyan, rhythmic clapping, and dholki beats.",
      imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1000&auto=format&fit=crop",
      participation: {
        type: "team",
        min: 8,
        max: 12,
        notes: "Team of 8–12 participants"
      },
      duration: {
        minutes: 10,
        display: "8–10 minutes"
      },
      objective: "To showcase the authentic folk spirit, traditional boliyan, synchronization, and cultural expressions of Punjabi Giddha.",
      rounds: ["Single Round — Live Stage Performance"],
      rules: [
        "Team Size: Each team must consist of 8–12 participants.",
        "Time Limit: Each performance must be between 8–10 minutes.",
        "Performance Style: The performance must represent traditional Punjabi Giddha, including folk expressions, graceful movements, and appropriate boliyan.",
        "Boliyan: Participants may perform traditional or original Punjabi boliyan suitable for a university cultural event.",
        "Music: Dholki, clapping, and other suitable traditional rhythmic accompaniment are permitted.",
        "Costumes: Traditional Punjabi attire and accessories are encouraged.",
        "Cultural Authenticity: Teams should maintain the traditional spirit of Giddha while demonstrating creativity and group coordination.",
        "Content Restrictions: Vulgar, abusive, discriminatory, or offensive boliyan and gestures are strictly prohibited.",
        "Time Violation: Exceeding the allotted time may result in mark deductions or disqualification.",
        "Judges' Decision: The decision of the judges will be final and binding."
      ],
      judging: [
        { criterion: "Quality and delivery of boliyan", weight: 25 },
        { criterion: "Folk authenticity and expressions", weight: 25 },
        { criterion: "Rhythm, clapping and musical coordination", weight: 20 },
        { criterion: "Synchronization, formations and teamwork", weight: 20 },
        { criterion: "Costumes, stage presence and overall presentation", weight: 10 }
      ],
      isActive: true,
      updatedAt: new Date(),
    },
    {
      name: "Luddi / Sammi",
      slug: "luddi-sammi",
      categoryId: categoryId,
      descriptor: "Traditional Punjabi folk dance of Luddi / Sammi, celebrating energetic movements, cultural significance, and graceful group coordination.",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
      participation: {
        type: "team",
        min: 8,
        max: 12,
        notes: "Team of 8–12 participants"
      },
      duration: {
        minutes: 10,
        display: "8–10 minutes"
      },
      objective: "To reflect the traditional Punjabi folk dance form of Luddi or Sammi with authenticity, rhythm, and vibrant group formations.",
      rounds: ["Single Round — Live Stage Performance"],
      rules: [
        "Team Size: Each team must consist of 8–12 participants.",
        "Time Limit: Each performance must be between 8–10 minutes.",
        "Performance Style: The performance must reflect the traditional Punjabi folk dance form of Luddi or Sammi.",
        "Cultural Representation: Participants should maintain the traditional character, movements, expressions, and cultural significance of the selected dance.",
        "Music: Traditional Punjabi folk songs and suitable instrumental accompaniment are permitted.",
        "Costumes: Traditional Punjabi attire is encouraged.",
        "Props: Simple traditional props may be used if relevant and safe.",
        "Originality: Creative formations are permitted while preserving the essential folk-dance style.",
        "Content Restrictions: Vulgarity, obscene gestures, and inappropriate music or choreography are prohibited.",
        "Time Violation: Exceeding the allotted time may result in mark deductions or disqualification.",
        "Judges' Decision: The decision of the judges will be final and binding."
      ],
      judging: [
        { criterion: "Folk authenticity and traditional character", weight: 25 },
        { criterion: "Rhythm, synchronization and tempo", weight: 25 },
        { criterion: "Facial expressions and movement dynamics", weight: 20 },
        { criterion: "Group formations and choreography", weight: 20 },
        { criterion: "Costumes, props and overall stage presentation", weight: 10 }
      ],
      isActive: true,
      updatedAt: new Date(),
    }
  ];

  for (const evt of eventsToAdd) {
    const existing = await db.collection("events").findOne({ slug: evt.slug });
    if (existing) {
      console.log(`Updating existing event: ${evt.name} (${evt.slug})...`);
      await db.collection("events").updateOne(
        { _id: existing._id },
        { $set: evt }
      );
    } else {
      console.log(`Inserting new event: ${evt.name} (${evt.slug})...`);
      await db.collection("events").insertOne({
        ...evt,
        createdAt: new Date(),
      });
    }
  }

  console.log("\nSuccessfully seeded Giddha and Luddi / Sammi!");
  const allCultural = await db.collection("events").find({ categoryId }).toArray();
  console.log(`Total Cultural Events now: ${allCultural.length}`);
  for (const e of allCultural) {
    console.log(` - ${e.name} (${e.slug}) -> Min: ${e.participation?.min}, Max: ${e.participation?.max}`);
  }

  await client.close();
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
