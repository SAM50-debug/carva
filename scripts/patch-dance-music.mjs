/**
 * Patch script: updates the 9 dance/music/culture events that had wrong slugs
 */
import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB_NAME);

const GENERAL_RULES = [
  "The competition is open to students currently enrolled in a recognized university, college or institution.",
  "Every participant must carry a valid College/University Identity Card.",
  "All participants must register within the prescribed deadline.",
  "Participants must report at the designated venue at least 30 minutes before the scheduled starting time.",
  "Late entry may not be permitted once the competition has started.",
  "Participants must maintain discipline, dignity and respectful behaviour throughout the event.",
  "Misconduct, abusive behaviour, harassment, disruption of an event or damage to university property may lead to disqualification.",
  "The decision of the judges shall be final and binding.",
  "Participants shall not directly approach or argue with judges regarding marks, rankings or results.",
  "Alcohol, narcotic substances, weapons and inflammable substances are strictly prohibited.",
  "In case of a tie, the jury may use additional judging criteria; the jury's decision shall be final.",
];

const DANCE_JUDGING = [
  { criterion: "Performance & Presentation" },
  { criterion: "Creativity & Originality" },
  { criterion: "Technical Skill" },
  { criterion: "Expression & Confidence" },
  { criterion: "Coordination" },
  { criterion: "Stage Presence" },
  { criterion: "Overall Impact" },
];

const DANCE_RULES = [
  "Participants must submit their final audio tracks before the performance.",
  "Tracks should be submitted in a good-quality audio format.",
  "Costumes should be appropriate, culturally respectful and suitable for a university-level competition.",
  "Vulgar, obscene or offensive gestures, lyrics, costumes or choreography are strictly prohibited.",
  "Props may be permitted subject to safety requirements and prior approval.",
  "Participants exceeding the prescribed time may face penalty marks or disqualification.",
  ...GENERAL_RULES,
];

const MUSIC_JUDGING = [
  { criterion: "Technical Skill" },
  { criterion: "Expression & Confidence" },
  { criterion: "Cultural Authenticity" },
  { criterion: "Stage Presence" },
  { criterion: "Overall Impact" },
];

const patches = [
  {
    slug: "traditional-attire",
    descriptor: "Participants represent the cultural identity of their state, region, or country through traditional attire, cultural presentation, folk art, dance, music, poetry, and cultural storytelling. Theme: My Culture, My Pride.",
    rules: [
      "Participants must represent their cultural identity with authenticity and dignity.",
      "Costumes should be appropriate, culturally respectful and suitable for a university-level competition.",
      "Vulgar, obscene or offensive gestures, lyrics, costumes or choreography are strictly prohibited.",
      "Props may be permitted subject to safety requirements and prior approval.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Cultural Authenticity" },
      { criterion: "Creativity & Presentation" },
      { criterion: "Expression & Confidence" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },
  {
    slug: "bhangra-dhol",
    descriptor: "Traditional and energetic Punjabi Bhangra performed with live or recorded Dhol beats.",
    rules: DANCE_RULES,
    judging: DANCE_JUDGING,
  },
  {
    slug: "bhangra-empire",
    descriptor: "Contemporary/competitive Bhangra inspired by modern Bhangra performance styles.",
    rules: DANCE_RULES,
    judging: DANCE_JUDGING,
  },
  {
    slug: "bhangra-on-music",
    descriptor: "Bhangra performance on a recorded musical track.",
    rules: DANCE_RULES,
    judging: DANCE_JUDGING,
  },
  {
    slug: "western-dance",
    descriptor: "Western/Contemporary/Hip-Hop/Jazz/Freestyle dance performance.",
    rules: DANCE_RULES,
    judging: DANCE_JUDGING,
  },
  {
    slug: "folk-dance",
    descriptor: "Traditional folk dances from any Indian state or region.",
    rules: DANCE_RULES,
    judging: DANCE_JUDGING,
  },
  {
    slug: "international-dance",
    descriptor: "Dance forms representing any country or international culture.",
    rules: DANCE_RULES,
    judging: DANCE_JUDGING,
  },
  {
    slug: "shabad-gayan",
    descriptor: "Presentation of Shabad/Gurbani singing with appropriate musical accompaniment.",
    rules: [
      "Pre-recorded vocals should not be used in a live vocal competition unless explicitly permitted.",
      "Instruments should be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: MUSIC_JUDGING,
  },
  {
    slug: "folk-singing",
    descriptor: "Traditional folk songs from any Indian state or region.",
    rules: [
      "Pre-recorded vocals should not be used in a live vocal competition unless explicitly permitted.",
      "Instruments should be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: MUSIC_JUDGING,
  },
  {
    slug: "qawwali",
    descriptor: "Solo, duet or group presentation of Qawwali.",
    rules: [
      "Pre-recorded vocals should not be used unless explicitly permitted.",
      "Instruments should be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: MUSIC_JUDGING,
  },
  {
    slug: "international-music",
    descriptor: "Vocal or instrumental presentation representing musical traditions from any country.",
    rules: [
      "Pre-recorded vocals should not be used in a live vocal competition unless explicitly permitted.",
      "Instruments should be brought by the participants.",
      ...GENERAL_RULES,
    ],
    judging: MUSIC_JUDGING,
  },
  {
    slug: "indian-classical",
    descriptor: "Participants may present Hindustani or Carnatic classical/semi-classical compositions.",
    rules: [
      "Pre-recorded vocals should not be used in a live vocal competition unless explicitly permitted.",
      "Instruments should be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: MUSIC_JUDGING,
  },
  {
    slug: "instrumental-music",
    descriptor: "Participants may perform on Indian or Western instruments individually or as a group.",
    rules: [
      "Instruments must be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: MUSIC_JUDGING,
  },
];

let updated = 0;
let notFound = 0;

for (const ev of patches) {
  const { slug, ...update } = ev;
  const result = await db.collection("events").updateOne(
    { slug },
    { $set: { ...update, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    console.warn(`⚠️  Not found: ${slug}`);
    notFound++;
  } else {
    console.log(`✅ Updated: ${slug}`);
    updated++;
  }
}

console.log(`\nDone. ${updated} updated, ${notFound} not found.`);
await client.close();
process.exit(0);
