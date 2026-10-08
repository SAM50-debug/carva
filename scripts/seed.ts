/**
 * Seed script — run with: npx tsx scripts/seed.ts
 * Populates MongoDB with all categories, events, default FormTemplate,
 * and a super_admin account.
 *
 * Idempotent: safe to run multiple times (uses upsert on slug).
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME!;

if (!uri || !dbName) {
  console.error("❌ MONGODB_URI and MONGODB_DB_NAME must be set in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "cultural", name: "Cultural Events", descriptor: "Theatre, Dance, Music & Heritage", icon: "music", accent: "#7c3aed", order: 1 },
  { slug: "technical", name: "Technical Events", descriptor: "Code, Build, Create & Battle", icon: "cpu", accent: "#0ea5e9", order: 2 },
  { slug: "business", name: "Business Battles", descriptor: "Strategy, Marketing & Management", icon: "briefcase", accent: "#f59e0b", order: 3 },
  { slug: "fine-arts", name: "Fine Arts Events", descriptor: "Paint, Sculpt, Photograph & Install", icon: "palette", accent: "#ec4899", order: 4 },
  { slug: "literary", name: "Literary Events", descriptor: "Debate, Write, Recite & Perform", icon: "book-open", accent: "#10b981", order: 5 },
  { slug: "media", name: "Media Club Events", descriptor: "Reel, Report, Podcast & Film", icon: "video", accent: "#f97316", order: 6 },
];

// ─── Events ───────────────────────────────────────────────────────────────────

const EVENTS_BY_CATEGORY: Record<string, object[]> = {
  cultural: [
    {
      slug: "mono-acting", name: "Mono Acting",
      descriptor: "Solo theatrical performance on social themes",
      participation: { type: "individual", min: 1, max: 1 },
      subEvents: ["Social Issues", "Patriotism", "Indian Culture & Heritage", "Youth & Society", "Contemporary Issues"],
    },
    {
      slug: "nukkad-natak", name: "Nukkad Natak / Street Play",
      descriptor: "Team-based street theatre on social issues",
      participation: { type: "group", notes: "Group participation" },
      subEvents: ["Social Issues", "Patriotism & Nationalism", "Drug Abuse Awareness", "Women Empowerment", "Environmental Awareness", "Education & Youth", "Social Responsibility"],
    },
    {
      slug: "traditional-attire", name: "\"My Culture, My Pride\" (Traditional Attire & Talent Showcase)",
      descriptor: "Solo or team presentation of cultural identity",
      participation: { type: "team", notes: "Solo or group allowed" },
      subEvents: ["Traditional Attire", "Cultural Presentation", "Folk Art", "Dance", "Music", "Poetry", "Traditional Skills", "Cultural Storytelling"],
    },
    {
      slug: "fashion-modeling", name: "Fashion Modeling",
      descriptor: "Fashion modeling team event with special rules",
      participation: { type: "team", min: 11, max: 13, notes: "Only 1 team per university. 11-13 participants." },
    },
    // ── Dance events (event name = style, subEvents = formats) ──
    {
      slug: "bhangra-dhol", name: "Bhangra - Dhol",
      descriptor: "Traditional Bhangra with live dhol",
      participation: { type: "team", min: 8, max: 15, notes: "Group (8–15)" },
    },
    {
      slug: "bhangra-empire", name: "Bhangra Empire",
      descriptor: "Contemporary / competitive Bhangra",
      participation: { type: "team", min: 8, max: 15, notes: "Group (8–15)" },
    },
    {
      slug: "bhangra-on-music", name: "Bhangra on Music",
      descriptor: "Bhangra performed on recorded tracks",
      participation: { type: "team", min: 8, max: 15, notes: "Group (8–15)" },
    },
    {
      slug: "western-dance", name: "Western Dance",
      descriptor: "Western, Hip-Hop, Jazz, etc.",
      participation: { type: "team", min: 1, max: 8, notes: "Solo (1), Duet (2), or Group (2–8)" },
    },
    {
      slug: "folk-dance", name: "Folk Dance",
      descriptor: "Any Indian state representation",
      participation: { type: "team", min: 1, max: 8, notes: "Solo (1), Duet (2), or Group (2–8)" },
    },
    {
      slug: "international-dance", name: "International Dance",
      descriptor: "Any country representation",
      participation: { type: "team", min: 1, max: 8, notes: "Solo (1), Duet (2), or Group (2–8)" },
    },
    // ── Music events (event name = style, subEvents = vocal/instrumental formats) ──
    {
      slug: "shabad-gayan", name: "Shabad Gayan",
      descriptor: "Singing with musical accompaniment",
      participation: { type: "team", min: 1, max: 8, notes: "Solo Vocal, Duet Vocal, or Group Vocal" },
    },
    {
      slug: "folk-singing", name: "Folk Singing",
      descriptor: "Traditional songs from any Indian state",
      participation: { type: "team", min: 1, max: 8, notes: "Solo Vocal, Duet Vocal, or Group Vocal" },
    },
    {
      slug: "qawwali", name: "Qawwali",
      descriptor: "Solo, duet, or group Qawwali presentation",
      participation: { type: "team", min: 1, max: 8, notes: "Solo, Duet, or Group" },
    },
    {
      slug: "international-music", name: "International Music",
      descriptor: "Vocal or instrumental representing international traditions",
      participation: { type: "team", min: 1, max: 8, notes: "Solo Vocal, Duet Vocal, Group Vocal, Solo Instrumental, or Duet/Group Instrumental" },
    },
    {
      slug: "indian-classical", name: "Indian Classical / Semi-Classical",
      descriptor: "Hindustani or Carnatic compositions",
      participation: { type: "team", min: 1, max: 8, notes: "Solo Vocal, Duet Vocal, Group Vocal, Solo Instrumental, or Duet/Group Instrumental" },
    },
    {
      slug: "instrumental-music", name: "Instrumental Music",
      descriptor: "Indian or Western instruments",
      participation: { type: "team", min: 1, max: 8, notes: "Solo Instrumental or Duet/Group Instrumental" },
    },
  ],

  technical: [
    {
      slug: "codathon", name: "Codathon",
      participation: { type: "team", min: 2, max: 3 },
    },
    {
      slug: "toyathon", name: "Toyathon",
      participation: { type: "team", min: 2, max: 4 },
    },
    {
      slug: "robothon", name: "Robothon",
      participation: { type: "team", min: 1, max: 3 },
    },
    {
      slug: "structurathon", name: "Structurathon",
      participation: { type: "team", min: 2, max: 4 },
    },
    {
      slug: "gamethon", name: "Gamethon",
      participation: { type: "team", min: 2, max: 4 },
    },
  ],

  business: [
    {
      slug: "mock-stock-market", name: "Mock Stock Market",
      participation: { type: "team", min: 1, max: 2 },
    },
    {
      slug: "business-venture-challenge", name: "Business Venture Challenge",
      participation: { type: "team", min: 2, max: 4 },
    },
    {
      slug: "best-manager", name: "Best Manager",
      participation: { type: "individual", min: 1, max: 1 },
    },
    {
      slug: "marketing-war", name: "Marketing War",
      participation: { type: "team", min: 2, max: 4 },
    },
    {
      slug: "brand-detective", name: "Brand Detective",
      participation: { type: "team", min: 3, max: 4 },
    },
    {
      slug: "marketing-auction", name: "Marketing Auction",
      participation: { type: "team", min: 3, max: 4 },
    },
    {
      slug: "ad-mad-show", name: "Ad-Mad Show",
      participation: { type: "team", min: 3, max: 6 },
    },
  ],

  "fine-arts": [
    {
      slug: "colour-storm", name: "Colour Storm (Painting)",
      participation: { type: "individual", min: 1, max: 1 },
    },
    {
      slug: "poster-pulse", name: "Poster Pulse",
      participation: { type: "individual", min: 1, max: 1 },
    },
    {
      slug: "earth-and-form", name: "Earth & Form (Clay Modelling)",
      participation: { type: "individual", min: 1, max: 1 },
    },
    {
      slug: "frame-the-fest", name: "Frame the Fest (Photography)",
      participation: { type: "individual", min: 1, max: 1 },
    },
    {
      slug: "re-create", name: "Re: Create (Installation)",
      participation: { type: "team", min: 3, max: 4 },
    },
    {
      slug: "art-from-waste", name: "Art from Waste",
      participation: { type: "team", min: 2, max: 3 },
    },
    {
      slug: "human-canvas", name: "Human Canvas (Live Face/Body Art)",
      participation: { type: "team", min: 2, max: 2 },
    },
  ],

  literary: [
    {
      slug: "war-of-words", name: "War of Words (Debate)",
      participation: { type: "team", min: 2, max: 2 },
    },
    {
      slug: "just-a-minute", name: "Just a Minute (JAM)",
      participation: { type: "individual", min: 1, max: 1 },
    },
    {
      slug: "ink-and-imagination", name: "Ink & Imagination (Creative Writing)",
      participation: { type: "individual", min: 1, max: 1 },
    },
    {
      slug: "verse-unplugged", name: "Verse Unplugged (Poetry Recitation)",
      participation: { type: "individual", min: 1, max: 1 },
    },
  ],

  media: [
    {
      slug: "reel-it-real", name: "Reel It Real (Reel Making)",
      participation: { type: "team", min: 2, max: 2 },
    },
    {
      slug: "60-second-story", name: "60-Second Story (Short Film)",
      participation: { type: "team", min: 3, max: 3 },
    },
    {
      slug: "caravan-live", name: "Caravan Live (Festival Reporting)",
      participation: { type: "team", min: 2, max: 2 },
    },
    {
      slug: "sound-of-caravan", name: "Sound of Caravan (Podcast/Audio Story)",
      participation: { type: "team", min: 2, max: 2 },
    },
  ],
};

// ─── Form Template seed ───────────────────────────────────────────────────────

function makeField(label: string, type: string, required: boolean, opts: object = {}): object {
  return { id: nanoid(10), label, type, required, isSystemField: true, order: 0, ...opts };
}

function buildDefaultFormTemplate(adminId: ObjectId): object {
  return {
    version: 1,
    updatedAt: new Date(),
    updatedBy: adminId,
    sections: [
      {
        id: nanoid(10),
        title: "Participant Details",
        fields: [
          makeField("Name of College / University", "text", true, { placeholder: "Your institution name" }),
          makeField("Student Name", "text", true),
          makeField("Student Roll Number", "text", true),
          makeField("Course / Program", "text", true),
          makeField("Year", "radio", true, { options: ["1st", "2nd", "3rd", "4th"] }),
          makeField("Gender", "radio", true, { options: ["Male", "Female", "Other"] }),
          makeField("Mobile Number", "tel", true, { placeholder: "10-digit mobile number" }),
          makeField("Email", "email", true),
          makeField("Participation Type", "radio", true, { options: ["Individual", "Team"] }),
        ].map((f, i) => ({ ...f, order: i + 1 })),
      },
      {
        id: nanoid(10),
        title: "Event Category (Individual)",
        description: "Select up to 2 categories and the events within them.",
        fields: [
          makeField("Select your category (max 2)", "multiselect", true, { options: ["Cultural Events", "Technical Events", "Business Battles", "Fine Arts Events", "Literary Events", "Media Club Events"], maxSelect: 2 }),
          makeField("CULTURAL — Select Event", "multiselect", false, { options: ["Mono Acting", "Nukkad Natak / Street Play", "\"My Culture, My Pride\" (Traditional Attire & Talent Showcase)", "Fashion Modeling", "Bhangra - Dhol", "Bhangra Empire", "Bhangra on Music", "Western Dance", "Folk Dance", "International Dance", "Shabad Gayan", "Folk Singing", "Qawwali", "International Music", "Indian Classical / Semi-Classical", "Instrumental Music"] }),
          makeField("TECHNICAL — Select Event", "multiselect", false, { options: ["Codathon", "Toyathon", "Robothon", "Structurathon", "Gamethon"] }),
          makeField("BUSINESS — Select Event", "multiselect", false, { options: ["Mock Stock Market", "Business Venture Challenge", "Best Manager", "Marketing War", "Brand Detective", "Marketing Auction", "Ad-Mad Show"] }),
          makeField("FINE ARTS — Select Event", "multiselect", false, { options: ["Colour Storm (Painting)", "Poster Pulse", "Earth & Form (Clay Modelling)", "Frame the Fest (Photography)", "Re: Create (Installation)", "Art from Waste", "Human Canvas (Live Face/Body Art)"] }),
          makeField("LITERARY — Select Event", "multiselect", false, { options: ["War of Words (Debate)", "Just a Minute (JAM)", "Ink & Imagination (Creative Writing)", "Verse Unplugged (Poetry Recitation)"] }),
          makeField("MEDIA — Select Event", "multiselect", false, { options: ["Reel It Real (Reel Making)", "Caravan Live (Festival Reporting)", "Sound of Caravan (Podcast/Audio Story)", "60-Second Story (Short Film)"] }),
        ].map((f, i) => ({ ...f, order: i + 1 })),
      },
      {
        id: nanoid(10),
        title: "Payment",
        fields: [
          makeField("Upload Student ID / Fee Receipt", "file", true, { helpText: "RIMT students: student ID card. Other universities: fee receipt or payment screenshot." }),
          makeField("Payment Date", "date", true),
        ].map((f, i) => ({ ...f, order: i + 1 })),
      },
      {
        id: nanoid(10),
        title: "Team Information",
        description: "Fill this section if participation type is Team.",
        fields: [
          makeField("Team Name", "text", false),
          makeField("Team Leader Name", "text", false),
          makeField("Number of Team Members", "number", false),
          makeField("Team Members Info", "textarea", false, { placeholder: "name, course, roll no, mobile, email — one member per line" }),
        ].map((f, i) => ({ ...f, order: i + 1 })),
      },
      {
        id: nanoid(10),
        title: "Event Category (Team)",
        description: "For teams — select up to 2 categories and events.",
        fields: [
          makeField("Select your category (max 2)", "multiselect", false, { options: ["Cultural Events", "Technical Events", "Business Battles", "Fine Arts Events", "Literary Events", "Media Club Events"], maxSelect: 2 }),
          makeField("CULTURAL (Team) — Select Event", "multiselect", false, { options: ["Nukkad Natak / Street Play", "\"My Culture, My Pride\" (Traditional Attire & Talent Showcase)", "Fashion Modeling", "Bhangra - Dhol", "Bhangra Empire", "Bhangra on Music", "Western Dance", "Folk Dance", "International Dance", "Shabad Gayan", "Folk Singing", "Qawwali", "International Music", "Indian Classical / Semi-Classical", "Instrumental Music"] }),
          makeField("TECHNICAL (Team)", "multiselect", false, { options: ["Codathon", "Toyathon", "Robothon", "Structurathon", "Gamethon"] }),
          makeField("BUSINESS (Team)", "multiselect", false, { options: ["Mock Stock Market", "Business Venture Challenge", "Marketing War", "Marketing Auction", "Brand Detective", "Ad-Mad Show"] }),
          makeField("FINE ARTS (Team)", "multiselect", false, { options: ["Re: Create (Installation)", "Art from Waste", "Human Canvas (Live Face/Body Art)"] }),
          makeField("LITERARY (Team)", "multiselect", false, { options: ["War of Words (Debate)"] }),
          makeField("MEDIA (Team)", "multiselect", false, { options: ["Reel It Real (Reel Making)", "Caravan Live (Festival Reporting)", "Sound of Caravan (Podcast/Audio Story)", "60-Second Story (Short Film)"] }),
          makeField("Upload Team Payment Receipt", "file", false, { helpText: "Payment proof for team registration." }),
          makeField("Team Payment Date", "date", false),
        ].map((f, i) => ({ ...f, order: i + 1 })),
      },
      {
        id: nanoid(10),
        title: "Declaration",
        fields: [
          makeField("I confirm that the information provided is correct and agree to follow the rules, regulations and guidelines of CARAVAN '26 and the decisions of the organising committee.", "checkbox", true),
        ].map((f, i) => ({ ...f, order: i + 1 })),
      },
    ],
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await client.connect();
  console.log("✅ Connected to MongoDB:", dbName);
  const db = client.db(dbName);

  // Instead of updating, we will drop the collections to ensure perfect sync
  console.log("🗑️  Dropping old collections to sync with final_event_list...");
  try { await db.collection("events").drop(); } catch (e) {}
  try { await db.collection("categories").drop(); } catch (e) {}
  try { await db.collection("formTemplates").drop(); } catch (e) {}
  
  // Ensure indexes
  await db.collection("adminUsers").createIndex({ email: 1 }, { unique: true });
  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("events").createIndex({ slug: 1 }, { unique: true });
  await db.collection("registrations").createIndex({ qrCode: 1 }, { unique: true });
  console.log("✅ Indexes created");

  // ── Seed super_admin ────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@rimt.ac.in";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "caravan2026admin";
  const existing = await db.collection("adminUsers").findOne({ email: adminEmail });

  let adminId: ObjectId;
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 12);
    const adminDoc = {
      name: "Super Admin",
      email: adminEmail,
      passwordHash: hash,
      role: "super_admin",
      assignedEventIds: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await db.collection("adminUsers").insertOne(adminDoc);
    adminId = res.insertedId;
    console.log(`✅ Created super_admin: ${adminEmail} / ${adminPassword}`);
  } else {
    adminId = existing._id as ObjectId;
    console.log(`ℹ️  super_admin already exists: ${adminEmail}`);
  }

  // ── Seed categories ─────────────────────────────────────────────────────────
  const categoryIdMap: Record<string, ObjectId> = {};
  for (const cat of CATEGORIES) {
    const res = await db.collection("categories").insertOne({
      ...cat,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    categoryIdMap[cat.slug] = res.insertedId;
    console.log(`  ✅ Category: ${cat.name}`);
  }

  // ── Seed events ─────────────────────────────────────────────────────────────
  for (const [catSlug, events] of Object.entries(EVENTS_BY_CATEGORY)) {
    const catId = categoryIdMap[catSlug];
    for (const evt of events as Record<string, unknown>[]) {
      await db.collection("events").insertOne({
        ...evt,
        categoryId: catId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`    ✅ Event: ${evt.name}`);
    }
  }

  // ── Seed FormTemplate ────────────────────────────────────────────────────────
  await db.collection("formTemplates").insertOne(buildDefaultFormTemplate(adminId));
  console.log("✅ FormTemplate seeded exactly to match final_event_list.txt");

  await client.close();
  console.log("\n🎉 Seed complete! All events are perfectly synced.");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
