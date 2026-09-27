export type Category = 
  | "CULTURAL" 
  | "TECHNICAL" 
  | "BUSINESS" 
  | "FINE ARTS" 
  | "LITERARY" 
  | "MEDIA";

export interface EventDetails {
  id: string;
  name: string;
  category: Category;
  description: string;
  teamSize: string;
  duration?: string;
  objective?: string;
  theme?: string;
  rules: string[];
  judgingCriteria: string[];
  deliverables?: string[];
  rounds?: string[];
}

export const eventsData: EventDetails[] = [
  // CULTURAL EVENTS
  {
    id: "mono-acting",
    name: "Mono Acting",
    category: "CULTURAL",
    description: "A solo theatrical performance based on social issues, patriotism, etc.",
    teamSize: "Solo",
    theme: "Social Issues, Patriotism, Indian Culture & Heritage, Youth & Society, Contemporary Issues",
    rules: [
      "Performances must focus on a constructive social message.",
      "Hate speech, abusive language, defamatory content not permitted."
    ],
    judgingCriteria: [
      "Performance & Presentation",
      "Creativity & Originality",
      "Expression & Confidence"
    ]
  },
  {
    id: "nukkad-natak",
    name: "Nukkad Natak / Street Play",
    category: "CULTURAL",
    description: "A powerful team-based street theatre competition.",
    teamSize: "Group",
    theme: "Social Issues, Patriotism & Nationalism, Drug Abuse Awareness, Women Empowerment, Environmental Awareness, Education & Youth, Social Responsibility",
    rules: [
      "Performances must focus on a constructive social message.",
      "Teams must arrange their own costumes and basic props."
    ],
    judgingCriteria: [
      "Performance & Presentation",
      "Coordination",
      "Overall Impact"
    ]
  },
  {
    id: "traditional-attire",
    name: "Traditional Attire & Talent Show",
    category: "CULTURAL",
    description: "My Culture, My Pride – Traditional Attire & Talent Showcase.",
    teamSize: "Individual or Group",
    theme: "My Culture, My Pride",
    rules: [
      "Participants will represent the cultural identity of their state, region, or country.",
      "Costumes should be appropriate and culturally respectful."
    ],
    judgingCriteria: [
      "Cultural Authenticity",
      "Performance & Presentation"
    ]
  },
  {
    id: "dance-solo",
    name: "Solo Dance",
    category: "CULTURAL",
    description: "Individual dance performance in various categories (Bhangra, Western, Folk, etc.)",
    teamSize: "1 participant",
    rules: [
      "Participants must submit their final audio tracks before the performance.",
      "Props may be permitted subject to safety requirements and prior approval."
    ],
    judgingCriteria: [
      "Performance & Presentation",
      "Coordination",
      "Stage Presence"
    ]
  },
  {
    id: "dance-group",
    name: "Group Dance",
    category: "CULTURAL",
    description: "Group dance performance (Bhangra, Western, Folk, etc.)",
    teamSize: "2–8 participants",
    rules: [
      "Participants must submit their final audio tracks before the performance.",
      "Costumes should be appropriate and suitable for a university-level competition."
    ],
    judgingCriteria: [
      "Performance & Presentation",
      "Coordination",
      "Stage Presence"
    ]
  },
  {
    id: "vocal-solo",
    name: "Solo Vocal",
    category: "CULTURAL",
    description: "Individual singing performance.",
    teamSize: "1 participant",
    rules: [
      "Pre-recorded vocals should not be used in a live vocal competition.",
      "Participants may perform vocal pieces according to the selected category."
    ],
    judgingCriteria: [
      "Technical Skill",
      "Expression & Confidence",
      "Overall Impact"
    ]
  },
  
  // TECHNICAL EVENTS
  {
    id: "codathon",
    name: "Codathon",
    category: "TECHNICAL",
    description: "Rapid Coding & Problem-Solving Challenge",
    teamSize: "2–3 Participants",
    duration: "4 Hours",
    objective: "To develop a functional soft solution for a given real-world problem within four hours.",
    theme: "Problem Solving & Coding",
    deliverables: [
      "Working application/software",
      "Source code",
      "Short README/documentation",
      "3–5 minute demonstration"
    ],
    rules: [
      "Code must be substantially developed during the competition.",
      "Teams may use publicly available libraries/frameworks.",
      "Internet may be used for documentation and technical references."
    ],
    judgingCriteria: [
      "Functionality",
      "Code Quality",
      "Innovation"
    ]
  },
  {
    id: "toyathon",
    name: "Toyathon",
    category: "TECHNICAL",
    description: "Innovative Toy Design & Prototyping Challenge",
    teamSize: "2–4 participants",
    duration: "4 Hours",
    objective: "To design and build an innovative, educational, sustainable or technology-enabled toy.",
    theme: "Innovative Educational Toy",
    deliverables: [
      "Physical prototype",
      "Concept explanation",
      "Working demonstration",
      "2–3 minute presentation"
    ],
    rules: [
      "The toy must be designed and assembled during the competition.",
      "Commercially available toys cannot simply be modified.",
      "The toy must have a clear educational, recreational or social purpose."
    ],
    judgingCriteria: [
      "Innovation",
      "Educational Value",
      "Design"
    ]
  },
  {
    id: "robothon",
    name: "Robothon",
    category: "TECHNICAL",
    description: "Robot Design, Control & Race Challenge",
    teamSize: "1-3 participants",
    duration: "Match based",
    objective: "To design/build and operate a robot capable of following a path.",
    theme: "Robot Design & Race",
    rounds: [
      "Round 1 – Qualification",
      "Round 2 – Knockout"
    ],
    rules: [
      "Robot must pass safety inspection before entering the arena.",
      "Robot must remain within specified weight and dimensions."
    ],
    judgingCriteria: [
      "Match results (Time/Completion)",
      "Control and maneuverability"
    ]
  },
  {
    id: "structurathon",
    name: "Structurathon",
    category: "TECHNICAL",
    description: "Structure Design & Load-Bearing Challenge",
    teamSize: "2–4 participants",
    duration: "4 Hours",
    objective: "To design and construct the strongest and most efficient structure using limited materials.",
    theme: "Structural Design Challenge",
    rules: [
      "Only organizer-provided materials may be used.",
      "Structure must be constructed completely within the competition period."
    ],
    judgingCriteria: [
      "Structural Efficiency = Maximum Load Supported ÷ Material Used"
    ]
  },
  {
    id: "gamethon",
    name: "Gamethon",
    category: "TECHNICAL",
    description: "e-Game Development Challenge",
    teamSize: "2–4 participants",
    duration: "4 Hours",
    objective: "To design and develop a playable digital game within four hours based on a given theme.",
    theme: "e-Game Development",
    deliverables: [
      "Playable build",
      "Source/project files"
    ],
    rules: [
      "The game must be developed substantially during the competition.",
      "Copyrighted assets should not be used without appropriate permission.",
      "The game must be playable offline during judging."
    ],
    judgingCriteria: [
      "Gameplay & Mechanics",
      "Visuals & Audio",
      "Theme Integration"
    ]
  },

  // BUSINESS BATTLES
  {
    id: "mock-stock-market",
    name: "Mock Stock Market",
    category: "BUSINESS",
    description: "Simulated investment/trading competition.",
    teamSize: "Individual / 2 participants",
    duration: "60–90 minutes",
    theme: "Simulated investment/trading competition",
    rounds: [
      "1. Market Knowledge Quiz",
      "2. Virtual Trading",
      "3. Investment Pitch"
    ],
    rules: [
      "Virtual money only.",
      "No real-money trading; follow trading window.",
      "Record all transactions."
    ],
    judgingCriteria: [
      "Portfolio Returns – 40%",
      "Investment Strategy – 25%",
      "Risk Management – 20%",
      "Market Knowledge & Justification – 15%"
    ]
  },
  {
    id: "business-venture-challenge",
    name: "Business Venture Challenge",
    category: "BUSINESS",
    description: "Present an original start-up/business idea.",
    teamSize: "2–4 participants",
    duration: "8–10 minutes per team",
    rounds: [
      "1. Idea Submission",
      "2. Business Pitch",
      "3. Investor Q&A"
    ],
    rules: [
      "Idea should be original or meaningfully improved.",
      "Stay within time; identify target market."
    ],
    judgingCriteria: [
      "Innovation & Uniqueness – 20%",
      "Market Potential – 20%",
      "Business Model & Feasibility – 20%",
      "Marketing Strategy – 15%",
      "Financial Understanding – 10%",
      "Presentation & Q&A – 15%"
    ]
  },
  {
    id: "best-manager",
    name: "Best Manager",
    category: "BUSINESS",
    description: "Multiple rounds testing managerial skills.",
    teamSize: "Individual",
    duration: "60–90 minutes",
    rounds: [
      "1. Managerial Aptitude",
      "2. Case Study",
      "3. Crisis Management",
      "4. Leadership/Negotiation Task"
    ],
    rules: [
      "Strict time limits.",
      "Independent decisions."
    ],
    judgingCriteria: [
      "Decision-Making – 20%",
      "Leadership – 20%",
      "Problem-Solving – 20%",
      "Communication & Confidence – 15%",
      "Strategic Thinking – 15%; Time Management – 10%"
    ]
  },
  {
    id: "marketing-war",
    name: "Marketing War",
    category: "BUSINESS",
    description: "Marketing strategy & product promotion challenge.",
    teamSize: "2–4 participants",
    duration: "60–90 minutes",
    rounds: [
      "1. Brand Battle",
      "2. Marketing Strategy",
      "3. Product Promotion",
      "4. Marketing Crisis"
    ],
    rules: [
      "Brand/product may be assigned.",
      "Teams develop their own strategy."
    ],
    judgingCriteria: [
      "Creativity – 20%",
      "Marketing Strategy – 25%",
      "Target-Market Understanding – 15%",
      "USP & Positioning – 15%",
      "Promotional Effectiveness – 15%",
      "Presentation & Teamwork – 10%"
    ]
  },
  {
    id: "brand-detective",
    name: "Brand Detective – The Ultimate Marketing Mystery",
    category: "BUSINESS",
    description: "Marketing mystery involving brand identification, consumer behaviour and marketing solutions.",
    teamSize: "3–4 students",
    duration: "60–75 minutes",
    rounds: [
      "1. Guess the Brand",
      "2. Marketing Mystery",
      "3. 60-Second Marketing Challenge"
    ],
    rules: [
      "30–45 seconds per clue; answer sheets.",
      "No mobile phones; no negative marking."
    ],
    judgingCriteria: [
      "Creativity & Originality – 25%",
      "Marketing Knowledge/Application – 20%",
      "Problem-Solving – 20%",
      "Target Audience Understanding – 15%",
      "Innovation in Promotion – 10%",
      "Communication & Teamwork – 10%"
    ]
  },
  {
    id: "marketing-auction",
    name: "Marketing Auction – “Bid, Build & Sell”",
    category: "BUSINESS",
    description: "Teams bid for products, target audiences, marketing channels and influencer/USP cards and build a campaign.",
    teamSize: "3–4 students",
    duration: "60–90 minutes",
    rounds: [
      "1. Marketing Auction",
      "2. Build Your Campaign",
      "3. Sell It!"
    ],
    rules: [
      "Virtual money only.",
      "Cannot exceed allocated budget."
    ],
    judgingCriteria: [
      "Creativity & Originality – 25%",
      "Marketing Strategy – 20%",
      "Effective Use of Auctioned Resources – 20%",
      "Consumer Understanding – 15%",
      "Adaptability – 10%"
    ]
  },
  {
    id: "ad-mad-show",
    name: "Ad-Mad Show",
    category: "BUSINESS",
    description: "Create and present an entertaining advertisement.",
    teamSize: "3–6 participants",
    duration: "3-5 minutes",
    rounds: [
      "Round 1 – Product Pick",
      "Round 2 – Ad-Mad Performance",
      "Round 3 – Marketing Twist"
    ],
    rules: [
      "The advertisement must be completed within 2–3 minutes.",
      "The content must be original, appropriate and entertaining."
    ],
    judgingCriteria: [
      "Creativity & Originality – 30%",
      "Marketing Strategy – 25%",
      "Entertainment value - 20%",
      "Presentation skills – 15%",
      "Teamwork and management – 10%"
    ]
  },

  // FINE ARTS EVENTS
  {
    id: "colour-storm",
    name: "Colour Storm — On-the-Spot Painting",
    category: "FINE ARTS",
    description: "On-the-Spot Painting.",
    teamSize: "Individual | 1 participant per university",
    duration: "2 hr 30 min",
    rules: [
      "Artwork size: 22 × 15 inches (half imperial).",
      "Participant brings colours, brushes, palette, board/easel and other tools; host provides the sheet.",
      "No pre-drawn work, tracing, printed references or digital assistance."
    ],
    judgingCriteria: [
      "Creativity & Originality - 25%",
      "Interpretation / Relevance to Theme - 20%",
      "Composition & Visual Impact - 20%",
      "Technique / Craftsmanship - 20%",
      "Presentation, Finish & Time Management - 15%"
    ]
  },
  {
    id: "poster-pulse",
    name: "Poster Pulse — Live Poster Making",
    category: "FINE ARTS",
    description: "Live Poster Making.",
    teamSize: "Individual | 1 participant per university",
    duration: "2 hr 30 min",
    rules: [
      "Sheet size: 22 × 15 inches; sheet supplied by host.",
      "Hand-rendered typography and illustration only; participant brings all art material.",
      "No printed cut-outs, stencils carrying ready-made designs."
    ],
    judgingCriteria: [
      "Creativity & Originality - 25%",
      "Interpretation / Relevance to Theme - 20%",
      "Composition & Visual Impact - 20%",
      "Technique / Craftsmanship - 20%",
      "Presentation, Finish & Time Management - 15%"
    ]
  },
  {
    id: "earth-form",
    name: "Earth & Form — Clay Modelling Challenge",
    category: "FINE ARTS",
    description: "Clay Modelling Challenge.",
    teamSize: "Individual | 1 participant per university",
    duration: "2 hr 30 min",
    rules: [
      "Clay will be supplied by the host; participants bring modelling/carving tools.",
      "Work must be created entirely during the competition.",
      "No moulds pre-modelled parts or pre-fabricated forms."
    ],
    judgingCriteria: [
      "Creativity & Originality - 25%",
      "Interpretation / Relevance to Theme - 20%",
      "Composition & Visual Impact - 20%",
      "Technique / Craftsmanship - 20%",
      "Presentation, Finish & Time Management - 15%"
    ]
  },
  {
    id: "frame-the-fest",
    name: "Frame the Fest — Spot Photography Walk",
    category: "FINE ARTS",
    description: "Spot Photography Walk.",
    teamSize: "Individual | 1 participant per university",
    duration: "2 hr 30 min",
    rules: [
      "Submit the best 5 photographs captured during the allotted period within the RIMT campus/event zone.",
      "No compositing, morphing, AI generation or manipulation."
    ],
    judgingCriteria: [
      "Creativity & Originality - 25%",
      "Interpretation / Relevance to Theme - 20%",
      "Composition & Visual Impact - 20%",
      "Technique / Craftsmanship - 20%",
      "Presentation, Finish & Time Management - 15%"
    ]
  },
  {
    id: "re-create",
    name: "Re:Create — Sustainable Art Installation",
    category: "FINE ARTS",
    description: "Sustainable Art Installation.",
    teamSize: "Team | 3–4 participants per university",
    duration: "2 hr 30 min",
    rules: [
      "Team creates a site-responsive installation on the theme announced on the spot.",
      "Suggested footprint: maximum 5 × 5 × 5 ft.",
      "Use waste, recyclable, natural or everyday materials."
    ],
    judgingCriteria: [
      "Creativity & Originality - 25%",
      "Interpretation / Relevance to Theme - 20%",
      "Composition & Visual Impact - 20%",
      "Technique / Craftsmanship - 20%",
      "Presentation, Finish & Time Management - 15%"
    ]
  },
  {
    id: "art-from-waste",
    name: "Art from Waste — Junk-to-Art Challenge",
    category: "FINE ARTS",
    description: "Junk-to-Art Challenge.",
    teamSize: "Team | 2–3 participants per university",
    duration: "2 hr 30 min",
    rules: [
      "Create a freestanding or relief artwork using discarded/recycled materials.",
      "No ready-made craft objects or pre-assembled components.",
      "Cutting tools must be safe; no open flame, hazardous chemicals."
    ],
    judgingCriteria: [
      "Creativity & Originality - 25%",
      "Interpretation / Relevance to Theme - 20%",
      "Composition & Visual Impact - 20%",
      "Technique / Craftsmanship - 20%",
      "Presentation, Finish & Time Management - 15%"
    ]
  },
  {
    id: "human-canvas",
    name: "Human Canvas — Live Face/Body Art",
    category: "FINE ARTS",
    description: "Live Face/Body Art.",
    teamSize: "Team | 2 members: 1 artist + 1 model",
    duration: "2 hr",
    rules: [
      "Only skin-safe, non-toxic face/body paints and cosmetic-grade materials are allowed.",
      "Design must be created live; pre-painted prosthetics or ready-made design transfers are not permitted."
    ],
    judgingCriteria: [
      "Creativity & Originality - 25%",
      "Interpretation / Relevance to Theme - 20%",
      "Composition & Visual Impact - 20%",
      "Technique / Craftsmanship - 20%",
      "Presentation, Finish & Time Management - 15%"
    ]
  },

  // LITERARY EVENTS
  {
    id: "war-of-words",
    name: "War of Words — Debate",
    category: "LITERARY",
    description: "Debate Competition.",
    teamSize: "Team | 2 participants per university",
    duration: "4–5 min per speaker",
    rules: [
      "One participant will speak for the motion and one against it.",
      "Reading a fully prepared speech is discouraged; brief notes may be used.",
      "Personal remarks, offensive language and disrespect are prohibited."
    ],
    judgingCriteria: [
      "Content / Ideas - 25%",
      "Originality & Creativity - 20%",
      "Language / Structure - 20%",
      "Delivery / Expression - 20%",
      "Overall Impact & Time Management - 15%"
    ]
  },
  {
    id: "just-a-minute",
    name: "Just a Minute — JAM",
    category: "LITERARY",
    description: "JAM speaking competition.",
    teamSize: "Individual | 1 participant per university",
    duration: "1 minute speaking time",
    rules: [
      "The participant must speak continuously for one minute without unnecessary hesitation, repetition or deviation.",
      "No written script, phone or external assistance is permitted."
    ],
    judgingCriteria: [
      "Content / Ideas - 25%",
      "Originality & Creativity - 20%",
      "Language / Structure - 20%",
      "Delivery / Expression - 20%",
      "Overall Impact & Time Management - 15%"
    ]
  },
  {
    id: "ink-and-imagination",
    name: "Ink & Imagination — Creative Writing",
    category: "LITERARY",
    description: "Creative Writing.",
    teamSize: "Individual | 1 participant per university",
    duration: "60 min",
    rules: [
      "Participants may write a short story, reflective piece or creative prose.",
      "Suggested maximum length: 1,000 words.",
      "No mobile phones, internet, AI tools, pre-written material are permitted."
    ],
    judgingCriteria: [
      "Content / Ideas - 25%",
      "Originality & Creativity - 20%",
      "Language / Structure - 20%",
      "Delivery / Expression - 20%",
      "Overall Impact & Time Management - 15%"
    ]
  },
  {
    id: "verse-unplugged",
    name: "Verse Unplugged — Poetry Recitation",
    category: "LITERARY",
    description: "Poetry Recitation.",
    teamSize: "Individual | 1 participant per university",
    duration: "Maximum 5 min",
    rules: [
      "Participant may recite an original poem or a published poem.",
      "Recitation may be in English, Hindi or Punjabi.",
      "No background track unless specifically permitted."
    ],
    judgingCriteria: [
      "Content / Ideas - 25%",
      "Originality & Creativity - 20%",
      "Language / Structure - 20%",
      "Delivery / Expression - 20%",
      "Overall Impact & Time Management - 15%"
    ]
  },

  // MEDIA CLUB EVENTS
  {
    id: "reel-it-real",
    name: "Reel It Real — On-the-Spot Reel Making",
    category: "MEDIA",
    description: "On-the-Spot Reel Making.",
    teamSize: "Team | 2 participants per university",
    duration: "2 hr 30 min",
    rules: [
      "Create a vertical reel of 20–45 seconds based on the theme.",
      "All principal footage must be shot during the competition within the designated festival area.",
      "No previously shot footage, downloaded video clips or AI-generated video may be used."
    ],
    judgingCriteria: [
      "Concept & Originality - 25%",
      "Storytelling / Communication - 20%",
      "Technical Execution - 20%",
      "Creativity & Audience Engagement - 20%",
      "Presentation, Relevance & Time Management - 15%"
    ]
  },
  {
    id: "60-second-story",
    name: "60-Second Story — Mobile Short Film Challenge",
    category: "MEDIA",
    description: "Mobile Short Film Challenge.",
    teamSize: "Team | 3 participants per university",
    duration: "3 hr",
    rules: [
      "Create a complete short film of maximum 60 seconds.",
      "Film must be conceived, shot and edited during the event.",
      "No stock footage, pre-shot sequences or AI-generated scenes."
    ],
    judgingCriteria: [
      "Concept & Originality - 25%",
      "Storytelling / Communication - 20%",
      "Technical Execution - 20%",
      "Creativity & Audience Engagement - 20%",
      "Presentation, Relevance & Time Management - 15%"
    ]
  },
  {
    id: "caravan-live",
    name: "Caravan Live — Festival Reporting Challenge",
    category: "MEDIA",
    description: "Festival Reporting Challenge.",
    teamSize: "Team | 2 participants: 1 reporter + 1 camera person",
    duration: "2 hr",
    rules: [
      "Team will cover an assigned CARAVAN event/zone as a live field-reporting exercise.",
      "Final video report: 2–3 minutes.",
      "Editing should remain journalistic; misleading cuts, fabricated statements or staged 'news' are prohibited."
    ],
    judgingCriteria: [
      "Concept & Originality - 25%",
      "Storytelling / Communication - 20%",
      "Technical Execution - 20%",
      "Creativity & Audience Engagement - 20%",
      "Presentation, Relevance & Time Management - 15%"
    ]
  },
  {
    id: "sound-of-caravan",
    name: "Sound of Caravan — Podcast / Audio Story",
    category: "MEDIA",
    description: "Podcast / Audio Story.",
    teamSize: "Team | 2 participants per university",
    duration: "2 hr 30 min",
    rules: [
      "Create a 3–5 minute audio story/podcast episode.",
      "All primary audio must be recorded on the spot.",
      "No pre-recorded narration/interviews or AI-generated voices."
    ],
    judgingCriteria: [
      "Concept & Originality - 25%",
      "Storytelling / Communication - 20%",
      "Technical Execution - 20%",
      "Creativity & Audience Engagement - 20%",
      "Presentation, Relevance & Time Management - 15%"
    ]
  }
];
