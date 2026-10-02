/**
 * Seed script: upserts event descriptions, rules, and judging criteria
 * from the official rules.txt into MongoDB events collection.
 * Run: node --require dotenv/config scripts/seed-event-rules.mjs
 */

import { MongoClient, ObjectId } from "mongodb";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

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
  "Alcohol, narcotic substances, weapons, inflammable substances and any item prohibited under university regulations are strictly prohibited.",
  "In case of a tie, the jury may use additional judging criteria; the jury's decision shall be final.",
  "Participants may be disqualified for violation of rules, misconduct, plagiarism, or providing false information.",
];

// Each entry: { slug, descriptor, rules, judging, objective?, rounds?, virtualCapital? }
const eventData = [
  // ─── CULTURAL ───────────────────────────────────────────────────────────────

  {
    slug: "mono-acting",
    descriptor: "A solo theatrical performance based on social issues, patriotism, Indian culture & heritage, youth & society, and contemporary issues.",
    rules: [
      "Solo performance only.",
      "Performances must focus on constructive social messages, patriotism, culture or youth-related issues.",
      "Hate speech, abusive language, defamatory content or material promoting violence/discrimination will not be permitted.",
      "Teams must arrange their own costumes and basic props unless otherwise specified by the organisers.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Performance & Presentation" },
      { criterion: "Creativity & Originality" },
      { criterion: "Technical Skill" },
      { criterion: "Expression & Confidence" },
      { criterion: "Cultural Authenticity" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  {
    slug: "nukkad-natak",
    descriptor: "A powerful team-based street theatre competition focusing on social issues, patriotism, nationalism, drug abuse awareness, women empowerment, environmental awareness, and education.",
    rules: [
      "Performances must focus on a constructive social message, patriotism, culture or youth-related issues.",
      "Hate speech, abusive language, defamatory content or material promoting violence/discrimination will not be permitted.",
      "Teams must arrange their own costumes and basic props unless otherwise specified.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Performance & Presentation" },
      { criterion: "Creativity & Originality" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
      { criterion: "Expression & Confidence" },
      { criterion: "Coordination" },
    ],
  },

  {
    slug: "my-culture-my-pride",
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

  // Dance events share rules
  {
    slug: "solo-dance",
    descriptor: "Individual solo dance performance. Dance styles accepted: Bhangra, Western, Folk Dance (any Indian state), International Dance (any country).",
    rules: [
      "One participant only.",
      "Participants must submit their final audio tracks before the performance.",
      "Tracks should be submitted in a good-quality audio format.",
      "Costumes should be appropriate, culturally respectful and suitable for a university-level competition.",
      "Vulgar, obscene or offensive gestures, lyrics, costumes or choreography are strictly prohibited.",
      "Props may be permitted subject to safety requirements and prior approval.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Performance & Presentation" },
      { criterion: "Creativity & Originality" },
      { criterion: "Technical Skill" },
      { criterion: "Expression & Confidence" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  {
    slug: "duet-dance",
    descriptor: "A duet dance performance by exactly two participants. Dance styles accepted include Bhangra, Western, Folk, and International.",
    rules: [
      "Exactly two participants.",
      "Participants must submit their final audio tracks before the performance.",
      "Tracks should be submitted in a good-quality audio format.",
      "Costumes should be appropriate, culturally respectful and suitable for a university-level competition.",
      "Vulgar, obscene or offensive gestures, lyrics, costumes or choreography are strictly prohibited.",
      "Props may be permitted subject to safety requirements and prior approval.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Performance & Presentation" },
      { criterion: "Creativity & Originality" },
      { criterion: "Technical Skill" },
      { criterion: "Coordination" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  {
    slug: "group-dance",
    descriptor: "Group dance performance with 2–8 participants. Categories include Bhangra-Dhol, Bhangra Empire, Bhangra on Music, Western Dance, Folk Dance, and International Dance.",
    rules: [
      "2 to 8 participants per group.",
      "Participants must submit their final audio tracks before the performance.",
      "Tracks should be submitted in a good-quality audio format.",
      "Costumes should be appropriate, culturally respectful and suitable for a university-level competition.",
      "Vulgar, obscene or offensive gestures, lyrics, costumes or choreography are strictly prohibited.",
      "Props may be permitted subject to safety requirements and prior approval.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Performance & Presentation" },
      { criterion: "Creativity & Originality" },
      { criterion: "Technical Skill" },
      { criterion: "Coordination" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  // Music events
  {
    slug: "solo-vocal",
    descriptor: "Individual vocal singing performance. Categories include Shabad Gayan, Folk Singing, Qawwali, International Music, and Indian Classical/Semi-Classical.",
    rules: [
      "Individual performance only.",
      "Participants may perform vocal pieces according to the selected music category.",
      "Pre-recorded vocals should not be used in a live vocal competition unless explicitly permitted.",
      "Instruments should be brought by the participants unless arrangements are specifically announced.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Performance & Presentation" },
      { criterion: "Technical Skill" },
      { criterion: "Expression & Confidence" },
      { criterion: "Cultural Authenticity" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  {
    slug: "duet-vocal",
    descriptor: "Two singers performing together. Accepted categories include Shabad Gayan, Folk, Qawwali, and International Music.",
    rules: [
      "Exactly two performers.",
      "Pre-recorded vocals should not be used unless explicitly permitted.",
      "Instruments should be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Technical Skill" },
      { criterion: "Expression & Confidence" },
      { criterion: "Coordination" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  {
    slug: "group-vocal",
    descriptor: "Group singing performance. Accepted categories include Shabad Gayan, Folk Singing, Qawwali, and International Music.",
    rules: [
      "Group performance.",
      "Pre-recorded vocals should not be used unless explicitly permitted.",
      "Instruments should be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Technical Skill" },
      { criterion: "Expression & Confidence" },
      { criterion: "Coordination" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  {
    slug: "solo-instrumental",
    descriptor: "Individual instrumental music performance. Participants may perform on Indian or Western instruments.",
    rules: [
      "Individual performance only.",
      "Instruments must be brought by the participant.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Technical Skill" },
      { criterion: "Expression & Confidence" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  {
    slug: "duet-group-instrumental",
    descriptor: "Two or more participants performing instrumental music together, on Indian or Western instruments.",
    rules: [
      "Two or more participants.",
      "Instruments must be brought by the participants.",
      "Participants exceeding the prescribed time may face penalty marks or disqualification.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Technical Skill" },
      { criterion: "Expression & Confidence" },
      { criterion: "Coordination" },
      { criterion: "Stage Presence" },
      { criterion: "Overall Impact" },
    ],
  },

  // ─── TECHNICAL ──────────────────────────────────────────────────────────────

  {
    slug: "codathon",
    descriptor: "Rapid Coding & Problem-Solving Challenge. Develop a functional software solution for a given real-world problem within four hours. Domains: AI/ML, Web Dev, IoT, Education, Agriculture, Healthcare, Smart Campus, Sustainability, Cybersecurity, Social Innovation.",
    objective: "To develop a functional soft solution for a given real-world problem within four hours.",
    rounds: ["Problem Statement & Briefing (15 min)", "Architecture Planning", "Development (150 min)", "Testing & Final Submission (30 min)", "Live Demonstration & Judging (30 min)"],
    rules: [
      "Code must be substantially developed during the competition.",
      "Teams may use publicly available libraries/frameworks.",
      "Pre-existing templates may be permitted, but the core solution must be developed during the event.",
      "AI coding assistants may be allowed or prohibited according to organizer policy, announced before the event.",
      "Teams must submit source code.",
      "Internet may be used for documentation and technical references.",
      "Any copied project submitted as original work will be disqualified.",
      "Each team must report at least 15 minutes before the event.",
      "A participant can be a member of only one team in the same event.",
      "Teams must complete the project within the stipulated time.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Functionality & Completeness" },
      { criterion: "Innovation & Creativity" },
      { criterion: "Technical Complexity" },
      { criterion: "Code Quality" },
      { criterion: "Live Demonstration" },
    ],
    deliverables: ["Working application/software", "Source code", "Short README/documentation", "3–5 minute demonstration"],
  },

  {
    slug: "toyathon",
    descriptor: "Innovative Toy Design & Prototyping Challenge. Design and build an innovative, educational, sustainable or technology-enabled toy addressing a specific learning or social need.",
    objective: "To design and build an innovative, educational, sustainable or technology-enabled toy addressing a specific learning or social need.",
    rounds: ["Team Verification (15 min)", "Design & Prototyping (150 min)", "Testing & Submission (30 min)", "Demonstration & Judging (30 min)"],
    rules: [
      "The toy must be designed and assembled during the competition.",
      "Commercially available toys cannot simply be modified and presented as original.",
      "The toy must have a clear educational, recreational or social purpose.",
      "The prototype must be safe to handle.",
      "Sharp edges, hazardous materials and dangerous mechanisms are prohibited.",
      "Recycled materials are encouraged.",
      "The toy must be demonstrated by the team.",
      "Each team must report at least 15 minutes before the event.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Innovation & Creativity" },
      { criterion: "Educational/Social Purpose" },
      { criterion: "Build Quality & Safety" },
      { criterion: "Use of Materials" },
      { criterion: "Demonstration & Presentation" },
    ],
    deliverables: ["Physical prototype", "Concept explanation", "Working demonstration", "2–3 minute presentation"],
  },

  {
    slug: "robothon",
    descriptor: "Robot Design, Control & Race Challenge. Design, build and operate a robot capable of following a path in a pre-tracked arena in a race or line-following path.",
    objective: "To design/build and operate a robot capable of following a path in a pre-tracked arena in a race or line following path.",
    rounds: ["Round 1 – Qualification: Technical inspection & trial", "Round 2 – Knockout: Based on Time"],
    rules: [
      "Robot must pass safety inspection before entering the arena.",
      "Maximum robot weight: 2 kg.",
      "Maximum dimensions: 400 × 400 × 400 mm.",
      "Robot must be battery operated and wirelessly controlled.",
      "Operators must stand in the designated control zone.",
      "Match starts only after the referee's signal.",
      "A robot that becomes immobile for the prescribed period may be declared defeated.",
      "Referee's decision is final.",
      "Each team must report at least 15 minutes before the event.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Design & Build Quality" },
      { criterion: "Control & Maneuverability" },
      { criterion: "Race Performance / Speed" },
      { criterion: "Innovation" },
      { criterion: "Safety Compliance" },
    ],
  },

  {
    slug: "structurathon",
    descriptor: "Structure Design & Load-Bearing Challenge. Design and construct the strongest and most efficient structure using limited materials within four hours. Challenge options include Bridge, Tower, Load-Bearing, or Efficiency challenges.",
    objective: "To design and construct the strongest and most efficient structure using limited materials within four hours.",
    rounds: ["Briefing & Material Distribution (15 min)", "Design & Construction (150 min)", "Testing & Load Application (30 min)", "Judging & Results (30 min)"],
    rules: [
      "Only organizer-provided materials may be used, unless otherwise announced.",
      "No pre-assembled structural components are permitted.",
      "Structure must be constructed completely within the competition period.",
      "Dimensions specified by the organizers must be followed.",
      "Structure must be self-supporting where required.",
      "Load must be applied according to the prescribed testing procedure.",
      "Safety clearance must be maintained during load testing.",
      "Any structure exceeding prescribed dimensions may receive a penalty.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Load-Bearing Capacity" },
      { criterion: "Structural Efficiency (Load ÷ Material)" },
      { criterion: "Design & Aesthetics" },
      { criterion: "Safety & Stability" },
      { criterion: "Innovation" },
    ],
  },

  {
    slug: "gamethon",
    descriptor: "e-Game Development Challenge. Design and develop a playable digital game within four hours based on a given theme. Platforms: Unity, Unreal Engine, Godot, Scratch, HTML5/JS, Python/Pygame.",
    objective: "To design and develop a playable digital game within four hours based on a given theme.",
    rounds: ["Theme Announcement", "Game Concept & Design", "Development (150 min)", "Testing & Final Build", "Live Demonstration & Judging"],
    rules: [
      "The game must be developed substantially during the competition.",
      "Teams may use game engines and permitted asset libraries.",
      "Pre-built complete games cannot be submitted.",
      "Copyrighted assets should not be used without appropriate permission/licensing.",
      "The game must be playable offline during judging.",
      "The game should have a clear objective and gameplay mechanism.",
      "Teams must submit the playable build and source/project files.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Gameplay Mechanics & Fun Factor" },
      { criterion: "Creativity & Originality" },
      { criterion: "Technical Execution" },
      { criterion: "Relevance to Theme" },
      { criterion: "Visual Design & Polish" },
    ],
  },

  // ─── BUSINESS ────────────────────────────────────────────────────────────────

  {
    slug: "mock-stock-market",
    descriptor: "Simulated investment/trading competition. Participants manage virtual capital of ₹10 lakh to maximize portfolio returns through strategic trading, knowledge quizzes, and investment pitches.",
    objective: "Simulated investment/trading competition to test market knowledge, investment strategy, and risk management.",
    virtualCapital: "₹10 lakh virtual capital per participant.",
    rounds: ["Round 1 – Market Knowledge Quiz", "Round 2 – Virtual Trading", "Round 3 – Investment Pitch"],
    rules: [
      "Virtual money only; no real-money trading.",
      "Participants must follow the trading window strictly.",
      "All transactions must be recorded.",
      "Late decisions are not considered.",
      "Individual or 2 participants per team.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Portfolio Returns", weight: 40 },
      { criterion: "Investment Strategy", weight: 25 },
      { criterion: "Risk Management", weight: 20 },
      { criterion: "Market Knowledge & Justification", weight: 15 },
    ],
  },

  {
    slug: "business-venture-challenge",
    descriptor: "Present an original start-up or business idea to a panel of judges in a structured pitch format including idea submission, business pitch, and investor Q&A.",
    objective: "Present an original start-up/business idea.",
    rounds: ["Round 1 – Idea Submission", "Round 2 – Business Pitch", "Round 3 – Investor Q&A"],
    rules: [
      "Idea should be original or meaningfully improved upon an existing concept.",
      "Teams must stay within the allotted time.",
      "Identify and present the target market clearly.",
      "Plagiarism/copying may lead to disqualification.",
      "Team size: 2–4 participants.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Innovation & Uniqueness", weight: 20 },
      { criterion: "Market Potential", weight: 20 },
      { criterion: "Business Model & Feasibility", weight: 20 },
      { criterion: "Marketing Strategy", weight: 15 },
      { criterion: "Financial Understanding", weight: 10 },
      { criterion: "Presentation & Q&A", weight: 15 },
    ],
  },

  {
    slug: "best-manager",
    descriptor: "Multiple rounds testing managerial skills including managerial aptitude, case study analysis, crisis management, and leadership/negotiation tasks.",
    objective: "Multiple rounds testing managerial skills.",
    rounds: ["Round 1 – Managerial Aptitude", "Round 2 – Case Study", "Round 3 – Crisis Management", "Round 4 – Leadership/Negotiation Task"],
    rules: [
      "Individual participation only.",
      "Strict time limits apply.",
      "Decisions must be independent; no external assistance.",
      "Judges' scoring is final.",
      "Professional conduct and communication expected.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Decision-Making", weight: 20 },
      { criterion: "Leadership", weight: 20 },
      { criterion: "Problem-Solving", weight: 20 },
      { criterion: "Communication & Confidence", weight: 15 },
      { criterion: "Strategic Thinking", weight: 15 },
      { criterion: "Time Management", weight: 10 },
    ],
  },

  {
    slug: "marketing-war",
    descriptor: "Marketing strategy & product promotion challenge. Teams compete through brand battles, strategy sessions, product promotion, and marketing crisis rounds.",
    objective: "Marketing strategy & product promotion challenge.",
    rounds: ["Round 1 – Brand Battle", "Round 2 – Marketing Strategy", "Round 3 – Product Promotion", "Round 4 – Marketing Crisis"],
    rules: [
      "Brand/product may be assigned by organizers.",
      "Teams develop their own marketing strategy.",
      "Content must be appropriate and ethical.",
      "Participants must stay within the presentation time.",
      "Team size: 2–4 participants.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Creativity", weight: 20 },
      { criterion: "Marketing Strategy", weight: 25 },
      { criterion: "Target-Market Understanding", weight: 15 },
      { criterion: "USP & Positioning", weight: 15 },
      { criterion: "Promotional Effectiveness", weight: 15 },
      { criterion: "Presentation & Teamwork", weight: 10 },
    ],
  },

  {
    slug: "brand-detective",
    descriptor: "Marketing mystery involving brand identification, consumer behaviour analysis, and marketing solutions. Rounds include Guess the Brand, Marketing Mystery, and a 60-Second Marketing Challenge.",
    objective: "Marketing mystery involving brand identification, consumer behaviour and marketing solutions.",
    rounds: ["Round 1 – Guess the Brand", "Round 2 – Marketing Mystery", "Round 3 – 60-Second Marketing Challenge"],
    rules: [
      "30–45 seconds per clue; answer must be written on answer sheets.",
      "No mobile phones during the competition.",
      "No negative marking.",
      "10-minute preparation time for Round 2.",
      "Maximum 3-minute presentation.",
      "Every team member must actively contribute.",
      "No unfair means; strict time limits apply.",
      "Team size: 3–4 students.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Creativity & Originality", weight: 25 },
      { criterion: "Marketing Knowledge/Application", weight: 20 },
      { criterion: "Problem-Solving", weight: 20 },
      { criterion: "Target Audience Understanding", weight: 15 },
      { criterion: "Innovation in Promotion", weight: 10 },
      { criterion: "Communication & Teamwork", weight: 10 },
    ],
  },

  {
    slug: "marketing-auction",
    descriptor: "Teams bid for products, target audiences, marketing channels and influencer/USP cards using ₹10 lakh virtual money, then build and present a marketing campaign.",
    objective: "Teams bid for products and build a marketing campaign using auctioned resources.",
    virtualCapital: "₹10 lakh virtual money per team.",
    rounds: ["Round 1 – Marketing Auction", "Round 2 – Build Your Campaign", "Round 3 – Sell It!"],
    rules: [
      "Virtual money only; teams cannot exceed their allocated budget.",
      "Purchased items cannot be returned.",
      "Highest valid bid wins.",
      "No mobile phones during the auction phase.",
      "Campaign must use only the acquired resources.",
      "Content must be appropriate.",
      "Strict time limits apply.",
      "Judges' decision is final.",
      "Team size: 3–4 students.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Creativity & Originality", weight: 25 },
      { criterion: "Marketing Strategy", weight: 20 },
      { criterion: "Effective Use of Auctioned Resources", weight: 20 },
      { criterion: "Consumer Understanding", weight: 15 },
      { criterion: "Adaptability", weight: 10 },
      { criterion: "Pitching & Teamwork", weight: 10 },
    ],
  },

  {
    slug: "ad-mad-show",
    descriptor: "Create and present an entertaining advertisement for a randomly assigned daily-use product. Includes product pick, ad performance, and a surprise marketing twist round.",
    objective: "Create and present an entertaining advertisement.",
    rounds: ["Round 1 – Product Pick (random selection)", "Round 2 – Ad-Mad Performance (10–15 min prep, 2–3 min performance)", "Round 3 – Marketing Twist (surprise challenge by judges)"],
    rules: [
      "Each team must consist of 3–6 participants; all members must actively participate.",
      "Each team will be given or randomly select a daily-use product and prepare a creative advertisement.",
      "The advertisement must be completed within 2–3 minutes; exceeding the time limit may result in deduction of marks.",
      "Content must be original, appropriate and entertaining; offensive, abusive, discriminatory or unsafe content is not allowed.",
      "Teams may use props, costumes, slogans, jingles and background music.",
      "Judges' decision will be final.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Creativity & Originality", weight: 30 },
      { criterion: "Marketing Strategy", weight: 25 },
      { criterion: "Entertainment Value", weight: 20 },
      { criterion: "Presentation Skills", weight: 15 },
      { criterion: "Teamwork & Management", weight: 10 },
    ],
  },

  // ─── FINE ARTS ───────────────────────────────────────────────────────────────

  {
    slug: "colour-storm",
    descriptor: "On-the-spot painting competition. Theme announced at the venue. Artwork size: 22 × 15 inches (half imperial). Accepted media: oil, watercolour, poster colour, acrylic, or pastel.",
    rules: [
      "Theme/subject will be announced at the venue.",
      "Artwork size: 22 × 15 inches (half imperial); host provides the sheet.",
      "Oil, watercolour, poster colour, acrylic or pastel may be used.",
      "Participant must bring colours, brushes, palette, board/easel and other tools.",
      "No pre-drawn work, tracing, printed references or digital assistance.",
      "All works must be produced on the spot within the prescribed time.",
      "Mobile phones and digital reference devices are not permitted during the event.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Interpretation of Theme", weight: 20 },
      { criterion: "Composition", weight: 20 },
      { criterion: "Originality", weight: 25 },
      { criterion: "Technique", weight: 20 },
      { criterion: "Overall Visual Impact", weight: 15 },
    ],
  },

  {
    slug: "poster-pulse",
    descriptor: "Live on-the-spot poster making competition. Topic announced at the venue, may relate to CARAVAN, youth, culture or a social theme. Sheet size: 22 × 15 inches (supplied by host).",
    rules: [
      "Topic will be announced on the spot.",
      "Sheet size: 22 × 15 inches; sheet supplied by host.",
      "Hand-rendered typography and illustration only.",
      "Participant must bring all art material.",
      "No printed cut-outs, stencils carrying ready-made designs, tracing or digital devices.",
      "All works must be produced on the spot within the prescribed time.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Concept & Message Clarity", weight: 25 },
      { criterion: "Originality", weight: 20 },
      { criterion: "Layout & Composition", weight: 20 },
      { criterion: "Technique", weight: 20 },
      { criterion: "Visual Impact", weight: 15 },
    ],
  },

  {
    slug: "earth-and-form",
    descriptor: "On-the-spot clay modelling challenge. Theme announced at the venue. Clay supplied by the host; participants bring modelling/carving tools.",
    rules: [
      "Theme will be announced on the spot.",
      "Clay will be supplied by the host; participants must bring modelling/carving tools.",
      "Work must be created entirely during the competition.",
      "No moulds, pre-modelled parts or pre-fabricated forms.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Form & Proportion", weight: 25 },
      { criterion: "Interpretation of Theme", weight: 20 },
      { criterion: "Craftsmanship", weight: 25 },
      { criterion: "Originality", weight: 20 },
      { criterion: "Overall Presentation", weight: 10 },
    ],
  },

  {
    slug: "frame-the-fest",
    descriptor: "On-the-spot spot photography walk. Theme revealed before the walk. Participants must use their own digital camera and submit the best 5 photographs captured during the allotted period within the RIMT campus/event zone.",
    rules: [
      "Theme will be revealed immediately before the photography walk.",
      "Participant must use their own digital camera; memory card may be checked/formatted before the event.",
      "Submit the best 5 photographs captured during the allotted period within the RIMT campus/event zone.",
      "No compositing, morphing, AI generation or manipulation; only basic in-camera settings are permitted.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Impact & Storytelling", weight: 25 },
      { criterion: "Composition", weight: 25 },
      { criterion: "Technical Quality", weight: 20 },
      { criterion: "Relevance to Theme", weight: 20 },
      { criterion: "Creativity", weight: 10 },
    ],
  },

  {
    slug: "re-create",
    descriptor: "Sustainable Art Installation — team creates a site-responsive installation using waste, recyclable, natural or everyday materials. Theme announced on the spot. Max footprint: 5 × 5 × 5 ft.",
    rules: [
      "Team creates a site-responsive installation on the theme announced on the spot.",
      "Suggested footprint: maximum 5 × 5 × 5 ft, subject to the allocated outdoor site.",
      "Use waste, recyclable, natural or everyday materials only.",
      "No pre-assembled artwork or commercially ready decorative structure may be used.",
      "Installation must be structurally safe, non-toxic and must not damage lawns, trees, walls or university property.",
      "Team size: 3–4 participants.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Concept & Originality", weight: 25 },
      { criterion: "Use of Material & Sustainability", weight: 20 },
      { criterion: "Spatial Composition", weight: 20 },
      { criterion: "Teamwork", weight: 15 },
      { criterion: "Presentation", weight: 20 },
    ],
  },

  {
    slug: "art-from-waste",
    descriptor: "Create a freestanding or relief artwork using discarded/recycled materials. A surprise common material may be supplied. Team size: 2–3 participants.",
    rules: [
      "Create a freestanding or relief artwork using discarded/recycled materials.",
      "A surprise common material may be supplied; teams may bring a limited kit of safe waste material if permitted.",
      "No ready-made craft objects or pre-assembled components.",
      "Cutting tools must be safe; no open flame, hazardous chemicals, broken glass or dangerous sharp waste.",
      "Team size: 2–3 participants.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Transformation of Material", weight: 25 },
      { criterion: "Innovation & Creativity", weight: 25 },
      { criterion: "Craftsmanship", weight: 20 },
      { criterion: "Sustainability", weight: 15 },
      { criterion: "Concept & Presentation", weight: 15 },
    ],
  },

  {
    slug: "human-canvas",
    descriptor: "Live face/body art competition. Team of 2 (1 artist + 1 model). Theme announced on the spot. Only skin-safe, non-toxic face/body paints and cosmetic-grade materials are allowed.",
    rules: [
      "Team of exactly 2 members: 1 artist + 1 model.",
      "Theme will be announced on the spot.",
      "Only skin-safe, non-toxic face/body paints and cosmetic-grade materials are allowed.",
      "Design must be created live; pre-painted prosthetics or ready-made design transfers are not permitted.",
      "Artwork must remain culturally respectful and suitable for a university youth festival.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Concept & Originality", weight: 25 },
      { criterion: "Transformation", weight: 25 },
      { criterion: "Colour & Technique", weight: 25 },
      { criterion: "Cultural Appropriateness", weight: 15 },
      { criterion: "Presentation", weight: 10 },
    ],
  },

  // ─── LITERARY ────────────────────────────────────────────────────────────────

  {
    slug: "war-of-words",
    descriptor: "Debate competition. Two participants per university — one speaks for the motion, one against. Topic/motion announced by organizers per event schedule.",
    rules: [
      "Team of 2 participants: 1 for the motion, 1 against.",
      "The motion/topic will be announced by the organizers.",
      "Speakers must remain within the prescribed time; warning signals may be given.",
      "Reading a fully prepared speech is discouraged; brief notes may be used.",
      "Personal remarks, offensive language and disrespect toward any participant, institution, community or belief are prohibited.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Content & Argument" },
      { criterion: "Reasoning & Rebuttal" },
      { criterion: "Delivery & Language" },
      { criterion: "Confidence" },
      { criterion: "Time Management" },
    ],
  },

  {
    slug: "just-a-minute",
    descriptor: "JAM (Just A Minute) — participant must speak continuously for one minute on a topic given on the spot, without hesitation, repetition, or deviation.",
    rules: [
      "Individual performance; topic given on the spot.",
      "Participant must speak continuously for one minute.",
      "No unnecessary hesitation, repetition or deviation from topic.",
      "No written script, phone or external assistance permitted.",
      "Language will be English unless organizers announce separate language categories.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Spontaneity" },
      { criterion: "Fluency" },
      { criterion: "Relevance to Topic" },
      { criterion: "Confidence" },
      { criterion: "Command Over Language" },
    ],
  },

  {
    slug: "ink-and-imagination",
    descriptor: "Creative Writing competition. A prompt, image, opening line or theme is given on the spot. Participants write a short story, reflective piece or creative prose. Suggested max length: 1,000 words. Duration: 60 minutes.",
    rules: [
      "Individual participation only. Duration: 60 minutes.",
      "A prompt, image, opening line or theme will be given on the spot.",
      "Participants may write a short story, reflective piece or creative prose.",
      "Suggested maximum length: 1,000 words.",
      "Writing must be original and completed during the event.",
      "No mobile phones, internet, AI tools, pre-written material or reference books are permitted.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Originality & Imagination", weight: 25 },
      { criterion: "Structure & Coherence", weight: 20 },
      { criterion: "Language Quality", weight: 20 },
      { criterion: "Connection with Prompt", weight: 20 },
      { criterion: "Overall Impact", weight: 15 },
    ],
  },

  {
    slug: "verse-unplugged",
    descriptor: "Poetry Recitation competition. Participant may recite an original poem or a published poem (as specified). Languages: English, Hindi or Punjabi. Maximum 5 minutes.",
    rules: [
      "Individual performance only. Maximum duration: 5 minutes.",
      "Participant may recite an original poem or a published poem, as specified by the organizers.",
      "If the poem is not original, the poet/author must be acknowledged before recitation.",
      "Recitation may be in English, Hindi or Punjabi, subject to the announced category.",
      "No background track unless specifically permitted.",
      "Content must be appropriate for an inter-university festival.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Selection & Content", weight: 20 },
      { criterion: "Voice Modulation & Pronunciation", weight: 25 },
      { criterion: "Expression", weight: 25 },
      { criterion: "Stage Presence", weight: 20 },
      { criterion: "Overall Impact", weight: 10 },
    ],
  },

  // ─── MEDIA ───────────────────────────────────────────────────────────────────

  {
    slug: "reel-it-real",
    descriptor: "On-the-spot Reel Making. Create a vertical reel of 20–45 seconds based on the theme announced at the venue. All principal footage must be shot during the competition within the festival area. Team of 2.",
    rules: [
      "Team of 2 participants.",
      "Create a vertical reel of 20–45 seconds based on the theme announced at the venue.",
      "All principal footage must be shot during the competition within the designated festival area.",
      "Editing may be done on a mobile phone using the participant's preferred editing app.",
      "Music/audio must be appropriate for a public university social media environment.",
      "No previously shot footage, downloaded video clips or AI-generated video may be used.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Concept & Hook", weight: 25 },
      { criterion: "Shooting Quality", weight: 20 },
      { criterion: "Editing & Pacing", weight: 20 },
      { criterion: "Originality & Creativity", weight: 20 },
      { criterion: "Festival Connection & Shareability", weight: 15 },
    ],
  },

  {
    slug: "60-second-story",
    descriptor: "Mobile Short Film Challenge. Create a complete short film of maximum 60 seconds. Theme/line/object revealed on the spot. Film must be conceived, shot and edited during the event. Team of 3.",
    rules: [
      "Team of 3 participants.",
      "Create a complete short film of maximum 60 seconds.",
      "Theme/line/object will be revealed on the spot.",
      "Film must be conceived, shot and edited during the event.",
      "Mobile phones are recommended; external lenses/gimbals may be used if permitted.",
      "No stock footage, pre-shot sequences or AI-generated scenes.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Story & Direction", weight: 25 },
      { criterion: "Cinematography", weight: 20 },
      { criterion: "Editing & Sound", weight: 20 },
      { criterion: "Originality", weight: 20 },
      { criterion: "Emotional/Creative Impact", weight: 15 },
    ],
  },

  {
    slug: "caravan-live",
    descriptor: "Festival Reporting Challenge. Team covers an assigned CARAVAN event/zone as a live field-reporting exercise. Final video report: 2–3 minutes, including presenter piece-to-camera, event visuals and at least one short interview.",
    rules: [
      "Team of 2 participants: 1 reporter + 1 camera person.",
      "Team will cover an assigned CARAVAN event/zone as a live field-reporting exercise.",
      "Final video report: 2–3 minutes, including presenter piece-to-camera, event visuals and at least one short participant/organizer sound bite.",
      "Facts and names must be verified before submission.",
      "Reporting must not interrupt ongoing competitions or enter restricted performance areas.",
      "Editing should remain journalistic; misleading cuts, fabricated statements or staged 'news' are prohibited.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "News Sense & Accuracy", weight: 25 },
      { criterion: "Scripting & Presentation", weight: 20 },
      { criterion: "Visuals & Cinematography", weight: 20 },
      { criterion: "Interviewing", weight: 20 },
      { criterion: "Overall Production Quality", weight: 15 },
    ],
  },

  {
    slug: "sound-of-caravan",
    descriptor: "Podcast/Audio Story Challenge. Create a 3–5 minute audio story/podcast episode around the festival or an announced youth theme. Teams may include narration, ambient festival sound and short interviews. Team of 2.",
    rules: [
      "Team of 2 participants.",
      "Create a 3–5 minute audio story/podcast episode around the festival or an announced youth theme.",
      "Teams may include narration, ambient festival sound and short interviews recorded during the event.",
      "All primary audio must be recorded on the spot.",
      "Music, if used, must be organizer-approved or royalty-free.",
      "No pre-recorded narration/interviews or AI-generated voices.",
      ...GENERAL_RULES,
    ],
    judging: [
      { criterion: "Concept & Storytelling", weight: 25 },
      { criterion: "Voice & Sound Design", weight: 25 },
      { criterion: "Editing Quality", weight: 20 },
      { criterion: "Scripting", weight: 20 },
      { criterion: "Overall Listening Experience", weight: 10 },
    ],
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB_NAME);

  let updated = 0;
  let notFound = 0;

  for (const ev of eventData) {
    const { slug, ...update } = ev;

    const result = await db.collection("events").updateOne(
      { slug },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      console.warn(`⚠️  Not found in DB: ${slug}`);
      notFound++;
    } else {
      console.log(`✅ Updated: ${slug}`);
      updated++;
    }
  }

  console.log(`\nDone. ${updated} events updated, ${notFound} slugs not found in DB.`);
  await client.close();
}

main().catch((err) => {
  console.error("Seed script error:", err);
  process.exit(1);
});
