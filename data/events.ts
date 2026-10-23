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
    description: "Solo theatrical performance on social themes, patriotism, culture, and character portrayals.",
    teamSize: "Solo (1 participant)",
    duration: "4–5 minutes",
    theme: "Social Issues, Comedy, Patriotism, Indian Culture & Heritage, Youth & Society, Contemporary Issues",
    rules: [
      "Time Limit: Each participant will be given a maximum of 4–5 minutes to perform.",
      "Performance Type: The act must be performed by a single participant.",
      "Theme: Participants may choose any appropriate theme, including social issues, comedy, patriotism, culture, or a meaningful character portrayal.",
      "Language: Participants may perform in Punjabi, Hindi, English, or any other approved language.",
      "Props and Costumes: Participants may use simple props and costumes relevant to their performance. Arrangements must be made by the participants themselves.",
      "Originality: Performances should demonstrate creativity, expression, and originality.",
      "Content Restrictions: Vulgarity, abusive language, offensive gestures, and content hurting any religion, community, or individual are strictly prohibited.",
      "Time Penalty: Exceeding the allotted time may result in deduction of marks or disqualification, as decided by the judges.",
      "Discipline: Participants must report to the venue at the scheduled reporting time and follow coordinator instructions.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Acting skills",
      "Voice modulation",
      "Facial expressions",
      "Stage presence",
      "Creativity & originality",
      "Overall impact"
    ]
  },
  {
    id: "nukkad-natak",
    name: "Nukkad Natak / Street Play",
    category: "CULTURAL",
    description: "A powerful team-based street theatre competition highlighting social and cultural issues.",
    teamSize: "Group (5–15 participants)",
    duration: "8–10 minutes",
    theme: "Social Awareness, Cultural Values, Environmental Protection, Women's Empowerment, Drug Abuse Prevention, Education, Patriotism",
    rules: [
      "Time Limit: Each team will be given 8–10 minutes to perform.",
      "Team Size: Each team must consist of a minimum of 5 and a maximum of 15 participants.",
      "Theme: Performance should focus on social awareness, cultural values, environmental protection, women's empowerment, drug abuse prevention, education, patriotism, or other relevant social issues.",
      "Language: Teams may perform in Punjabi, Hindi, English, or a combination of these languages.",
      "Performance Style: Traditional street-play format emphasizing audience engagement, powerful dialogue delivery, expressions, and coordinated group performance.",
      "Props and Costumes: Only simple, safe, and easily manageable props and costumes are permitted. Teams must arrange their own materials.",
      "Music and Sound: Live music, clapping, rhythmic sounds, and portable instruments may be used where appropriate. Any recorded music or sound effects must be arranged by the team.",
      "Content Restrictions: Vulgarity, abusive language, hate speech, political campaigning, and content that hurts religious or community sentiments are strictly prohibited.",
      "Time Penalty: Exceeding the time limit may lead to deduction of marks or disqualification.",
      "Discipline and Safety: Participants must maintain discipline, avoid obstructing other events, and ensure props/movements do not endanger audience or participants.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Theme relevance",
      "Acting & dialogue delivery",
      "Teamwork & coordination",
      "Creativity & audience engagement",
      "Overall social impact"
    ]
  },
  {
    id: "shabad-gayan",
    name: "Shabad Gayan",
    category: "CULTURAL",
    description: "Devotional Shabad and Gurbani singing presented with traditional musical accompaniment.",
    teamSize: "Group (2–3 participants)",
    duration: "3–5 minutes",
    theme: "Gurbani and Spiritual Shabads",
    rules: [
      "Team Size: Each team must consist of 2–3 participants.",
      "Time Limit: Each performance will be limited to 3–5 minutes.",
      "Performance: Participants must present Shabad/Gurbani singing with appropriate musical accompaniment.",
      "Language: The performance must be based on Gurbani or an approved Shabad.",
      "Musical Accompaniment: Harmonium, tabla, and other suitable traditional instruments are permitted.",
      "Respect and Decorum: Participants must maintain the sanctity, dignity, and spiritual essence of the Shabad.",
      "Backing Tracks: Pre-recorded vocals are not permitted. Instrumental backing tracks may be allowed with prior approval.",
      "Reporting: Teams must report at the venue at the designated time (at least 30 minutes before performance).",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Vocal quality",
      "Sur and taal",
      "Rhythm and coordination",
      "Pronunciation",
      "Devotional expression",
      "Overall presentation"
    ]
  },
  {
    id: "folk-singing",
    name: "Folk Singing",
    category: "CULTURAL",
    description: "Traditional folk songs representing regional cultures and musical heritage from any Indian state.",
    teamSize: "Solo (1), Duet (2), or Group (6–8 participants)",
    duration: "Solo: 3–5 mins | Duet: 4–5 mins | Group: 5–8 mins",
    theme: "Traditional Indian Folk Traditions",
    rules: [
      "Team Categories: Solo, duet, and group performances are permitted. Group performances must consist of 6–8 participants.",
      "Time Limit: Solo: 3–5 minutes | Duet: 4–5 minutes | Group: 5–8 minutes.",
      "Theme: Songs must represent traditional folk music from any Indian state or region.",
      "Language: Participants may sing in any Indian regional language.",
      "Musical Accompaniment: Traditional instruments and suitable instrumental backing tracks are permitted.",
      "Originality & Authenticity: Songs should preserve the traditional character and cultural identity of the selected folk tradition.",
      "Content Restrictions: Songs containing vulgarity, abusive language, or offensive material are strictly prohibited.",
      "Props and Costumes: Traditional attire and simple cultural props are permitted, provided they do not disrupt the performance.",
      "Time Violation: Exceeding allotted time may result in mark deductions or disqualification.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Voice quality",
      "Rhythm and pitch",
      "Folk authenticity",
      "Cultural representation",
      "Coordination",
      "Stage presentation"
    ]
  },
  {
    id: "qawwali",
    name: "Qawwali",
    category: "CULTURAL",
    description: "Traditional Sufi and devotional group-singing presentation.",
    teamSize: "Group (8–10 participants)",
    duration: "8–10 minutes",
    theme: "Sufi & Devotional Qawwali Traditions",
    rules: [
      "Team Size: Each team must consist of 8–10 participants.",
      "Time Limit: Each performance must be between 8–10 minutes.",
      "Performance: Teams must present a Qawwali that reflects the traditional group-singing style.",
      "Language: Performances may be in Urdu, Hindi, Punjabi, or another suitable language.",
      "Musical Accompaniment: Harmonium, tabla, dholak, hand clapping, and other suitable traditional instruments are permitted.",
      "Coordination: Teams should maintain proper rhythm, vocal coordination, and interaction among singers.",
      "Content: Lyrics must be respectful and appropriate for a university-level cultural competition.",
      "Backing Tracks: Pre-recorded vocals are not permitted. Instrumental tracks require prior approval.",
      "Discipline: Teams must follow organizer instructions and avoid unnecessary delays.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Vocal quality",
      "Rhythm and improvisation",
      "Group coordination",
      "Traditional style",
      "Expression",
      "Overall impact"
    ]
  },
  {
    id: "international-music",
    name: "International Music",
    category: "CULTURAL",
    description: "Vocal or instrumental presentations representing diverse global musical traditions and cultures outside India.",
    teamSize: "Solo (1), Duet (2), or Group (6–8 participants)",
    duration: "Solo: 3–5 mins | Duet: 4–5 mins | Group: 5–8 mins",
    theme: "Global & International Musical Traditions",
    rules: [
      "Team Categories: Solo, duet, and group performances are permitted. Group performances must consist of 6–8 participants.",
      "Time Limit: Solo: 3–5 minutes | Duet: 4–5 minutes | Group: 5–8 minutes.",
      "Theme: Performances must represent the vocal or instrumental musical traditions of a country other than India.",
      "Language: Participants may perform in any international language.",
      "Music Style: Western pop, international folk, world music, and other recognized international musical styles are permitted.",
      "Musical Accompaniment: Live instruments or approved instrumental backing tracks may be used.",
      "Authenticity: Performances should reflect the selected country's musical style and cultural character.",
      "Backing Vocals: Pre-recorded lead vocals are not permitted. Main vocals must be performed live.",
      "Content Restrictions: Vulgar, abusive, discriminatory, or offensive content is prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Musical quality",
      "Originality",
      "International representation",
      "Rhythm",
      "Vocal or instrumental technique",
      "Coordination and presentation"
    ]
  },
  {
    id: "indian-classical",
    name: "Indian Classical / Semi-Classical",
    category: "CULTURAL",
    description: "Classical and semi-classical Indian compositions in Hindustani or Carnatic traditions.",
    teamSize: "Solo, Duet, or Group (2–8 participants)",
    duration: "Solo: 3–5 mins | Duet: 4–5 mins | Group: 5–8 mins",
    theme: "Hindustani & Carnatic Classical Traditions",
    rules: [
      "Categories: Participants may compete in solo, duet, or group formats.",
      "Time Limit: Solo: 3–5 minutes | Duet: 4–5 minutes | Group: 5–8 minutes.",
      "Performance Style: Participants may present Hindustani or Carnatic classical or semi-classical compositions.",
      "Musical Accompaniment: Harmonium, tabla, tanpura, mridangam, violin, and other suitable instruments are permitted.",
      "Technical Excellence: Performances should demonstrate knowledge of raga, tala, sur, rhythm, and style characteristics.",
      "Authenticity: Participants must maintain the essential features of Indian classical or semi-classical music.",
      "Backing Tracks: Pre-recorded lead vocals are not permitted. Instrumental backing tracks may be used with prior approval.",
      "Content: Compositions must be appropriate and respectful.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Voice quality",
      "Pitch accuracy",
      "Rhythm and tala",
      "Raga / composition presentation",
      "Technical skill",
      "Improvisation & musicality"
    ]
  },
  {
    id: "instrumental-music",
    name: "Instrumental Music",
    category: "CULTURAL",
    description: "Live solo and ensemble musical performances on Indian or Western instruments.",
    teamSize: "Solo (1), Duet (2), or Group (6–8 participants)",
    duration: "Solo: 3–5 mins | Duet: 4–5 mins | Group: 5–8 mins",
    theme: "Live Instrumental Excellence",
    rules: [
      "Team Categories: Solo, duet, and group performances are permitted. Group performances must consist of 6–8 participants.",
      "Time Limit: Solo: 3–5 minutes | Duet: 4–5 minutes | Group: 5–8 minutes.",
      "Instruments: Participants may perform on Indian or Western instruments (guitar, keyboard, flute, tabla, violin, drums, sitar, etc.).",
      "Performance: The presentation must primarily demonstrate live instrumental music. Vocal accompaniment, if any, must be approved in advance.",
      "Equipment: Participants must arrange their own instruments, accessories, and essential equipment.",
      "Setup Time: Instrument setup and sound checks must be completed within the time allotted by organizers.",
      "Backing Tracks: Instrumental backing tracks permitted with prior approval; must not replace live lead performance.",
      "Safety: All electrical instruments and equipment must be used safely.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Technical skill",
      "Rhythm",
      "Tone and accuracy",
      "Creativity",
      "Coordination",
      "Musical expression",
      "Overall performance"
    ]
  },
  {
    id: "bhangra-dhol",
    name: "Bhangra - Dhol",
    category: "CULTURAL",
    description: "Traditional Punjabi Bhangra performed live to the beating of authentic dhols.",
    teamSize: "Group (8–10 participants)",
    duration: "8–10 minutes",
    theme: "Traditional Punjabi Folk & Live Dhol Heritage",
    rules: [
      "Team Size: Each team must consist of 8–10 participants.",
      "Time Limit: Each performance must be between 8–10 minutes.",
      "Performance Style: The performance must represent traditional Punjabi Bhangra with live dhol accompaniment, highlighting energetic movements and cultural identity.",
      "Costumes: Traditional Punjabi attire (Chhadra, Kurta, Pagri/Turle) is strongly encouraged.",
      "Props: Traditional folk props (Saap, Khunda, Chimta, Kato) may be used, provided they are safe.",
      "Originality & Energy: Choreography should demonstrate synchronization, formations, and authentic folk vigour.",
      "Content Restrictions: Vulgarity, obscene gestures, and offensive lyrics or movements are strictly prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Coordination & synchronization",
      "Energy & rhythm",
      "Formations & stage coverage",
      "Expressions & folk spirit",
      "Cultural authenticity"
    ]
  },
  {
    id: "bhangra-empire",
    name: "Bhangra Empire",
    category: "CULTURAL",
    description: "Contemporary competitive Bhangra showcase blending high-intensity choreography and dynamic formations.",
    teamSize: "Group (8–10 participants)",
    duration: "8–10 minutes",
    theme: "Competitive & Contemporary Bhangra",
    rules: [
      "Team Size: Each team must consist of 8–10 participants.",
      "Time Limit: Each performance must be between 8–10 minutes.",
      "Performance Style: High-energy competitive Bhangra demonstrating contemporary stage agility and traditional foundation.",
      "Music: High-tempo Bhangra tracks or live fusion percussion permitted.",
      "Costumes: Uniform traditional Bhangra attire representing the university team.",
      "Props: Safe traditional props permitted.",
      "Content Restrictions: Vulgarity and offensive gestures strictly prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Synchronization & timing",
      "Energy level & stamina",
      "Creative formations",
      "Expressions & stage presence",
      "Overall impact"
    ]
  },
  {
    id: "bhangra-on-music",
    name: "Bhangra on Music",
    category: "CULTURAL",
    description: "Bhangra choreography synchronized seamlessly to recorded music tracks.",
    teamSize: "Group (8–10 participants)",
    duration: "8–10 minutes",
    theme: "Recorded Track Bhangra Synchronization",
    rules: [
      "Team Size: Each team must consist of 8–10 participants.",
      "Time Limit: Each performance must be between 8–10 minutes.",
      "Music Submission: Recorded audio tracks must be submitted in advance in high quality format.",
      "Costumes & Props: Traditional Punjabi dress and approved cultural props.",
      "Choreography: Emphasis on synchronization to track cues, dynamic transitions, and expressive storytelling.",
      "Content Restrictions: Obscene gestures and inappropriate lyrics strictly prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Track synchronization",
      "Energy & coordination",
      "Formations & transitions",
      "Folk authenticity",
      "Overall performance"
    ]
  },
  {
    id: "western-dance",
    name: "Western Dance",
    category: "CULTURAL",
    description: "Western and contemporary dance forms covering Hip-Hop, Jazz, Freestyle, Locking, Popping, and Urban styles.",
    teamSize: "Solo (1), Duet (2), or Group (8–10 participants)",
    duration: "Solo: 4–5 mins | Duet: 4–5 mins | Group: 6–8 mins",
    theme: "Western & Contemporary Dance Expressions",
    rules: [
      "Categories and Team Size: Solo (1), Duet (2), Group (8–10 participants).",
      "Time Limit: Solo: 4–5 minutes | Duet: 4–5 minutes | Group: 6–8 minutes.",
      "Dance Styles: Hip-Hop, Contemporary, Jazz, Freestyle, Locking, Popping, and other Western dance styles.",
      "Music: Suitable Western or fusion tracks submitted in advance.",
      "Choreography: Must demonstrate technique, musicality, creativity, and effective stage usage.",
      "Costumes & Props: Costumes must be safe and appropriate for a university competition. Safe props permitted.",
      "Safety Warning: Dangerous stunts, fire, sharp objects, and hazardous props are strictly prohibited.",
      "Content Restrictions: Vulgarity, obscene gestures, inappropriate lyrics, and offensive choreography are prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Technique and execution",
      "Synchronization & coordination",
      "Creativity and choreography",
      "Musicality and rhythm",
      "Expressions and formations",
      "Stage presence and overall impact"
    ]
  },
  {
    id: "folk-dance",
    name: "Indian Folk Dance",
    category: "CULTURAL",
    description: "Traditional folk dances celebrating the heritage of any Indian state (Garba, Bihu, Ghoomar, Lavani, Kalbelia, etc.).",
    teamSize: "Solo (1), Duet (2), or Group (8–10 participants)",
    duration: "Solo: 4–5 mins | Duet: 4–5 mins | Group: 6–8 mins",
    theme: "Indian Regional Folk Dance Traditions",
    rules: [
      "Categories and Team Size: Solo (1), Duet (2), Group (8–10 participants).",
      "Time Limit: Solo: 4–5 minutes | Duet: 4–5 minutes | Group: 6–8 minutes.",
      "Dance Styles: Folk dances from any Indian state or region (Garba, Bihu, Ghoomar, Lavani, Kalbelia, etc.). Note: Bhangra and Giddha compete in their dedicated categories.",
      "Cultural Authenticity: The performance should authentically represent the selected region's folk traditions, movements, music, and cultural identity.",
      "Music: Traditional folk music or suitable instrumental tracks permitted.",
      "Costumes & Props: Regionally authentic attire and safe cultural props.",
      "Content Restrictions: Offensive lyrics, vulgarity, and inappropriate gestures are strictly prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Cultural authenticity",
      "Technique & rhythm",
      "Synchronization & coordination",
      "Expressions & costumes",
      "Creativity and presentation"
    ]
  },
  {
    id: "international-dance",
    name: "International Dance",
    category: "CULTURAL",
    description: "Global dance styles representing cultures outside India (Salsa, Flamenco, African dance, K-pop, Latin dance, etc.).",
    teamSize: "Solo (1), Duet (2), or Group (8–10 participants)",
    duration: "Solo: 3–4 mins | Duet: 4–5 mins | Group: 5–7 mins",
    theme: "Global & International Dance Heritage",
    rules: [
      "Categories and Team Size: Solo (1), Duet (2), Group (8–10 participants).",
      "Time Limit: Solo: 3–4 minutes | Duet: 4–5 minutes | Group: 5–7 minutes.",
      "Dance Styles: Dance forms representing countries or cultures outside India (Salsa, Flamenco, African dance, K-pop, Latin dance, etc.).",
      "Cultural Representation: Performances should reflect the authentic characteristics and background of the selected international style.",
      "Costumes & Props: Must complement the selected style and remain appropriate for a university competition.",
      "Content Restrictions: Vulgarity, discriminatory expressions, offensive gestures, and inappropriate music are prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Technique and footwork",
      "Cultural representation",
      "Synchronization and rhythm",
      "Creativity and formations",
      "Stage presence and impact"
    ]
  },
  {
    id: "traditional-attire",
    name: "Traditional Attire & Talent Showcase",
    category: "CULTURAL",
    description: "Cultural presentation celebrating regional and traditional costumes, customs, and heritage of India or global cultures.",
    teamSize: "Team (11–13 participants)",
    duration: "12–15 minutes (Strict)",
    theme: "Cultural Heritage, Traditional Attire & Customs",
    rules: [
      "Team Size: Each participating team must consist of 11–13 participants.",
      "One Team per Institution: Only one team from each institute, college, or university is permitted to participate.",
      "Time Limit: Performance must be between 12 and 15 minutes strictly. Performing under 12 minutes or exceeding 15 minutes will result in disqualification.",
      "Theme & Presentation: Must highlight traditional attire, cultural heritage, diversity, and customs.",
      "Costumes & Styling: Decent, elegant attire representing the chosen culture or traditional theme.",
      "Music Tracks: Suitable background music submitted in advance.",
      "Prohibited Items: Real guns, swords, knives, fire, explosives, or hazardous items strictly prohibited (immediate disqualification).",
      "Content Restrictions: Vulgarity, obscene gestures, offensive language strictly prohibited.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Traditional & cultural representation",
      "Costume selection & styling",
      "Creativity & theme interpretation",
      "Stage presence & confidence",
      "Coordination & overall presentation"
    ]
  },
  {
    id: "fashion-modeling-solo",
    name: "Fashion Modeling (Solo)",
    category: "CULTURAL",
    description: "Solo Fashion Modeling inter-university runway competition combining couture, poise, and stage presence.",
    teamSize: "Individual (1 Model)",
    duration: "5–8 minutes",
    theme: "Solo Fashion Modeling",
    rules: [
      "Competition Format: Solo fashion modeling runway competition.",
      "Team Size: Strictly 1 model per entry.",
      "Prohibited Tools: Original gun, sword, knife, fire, and hazardous props are strictly prohibited.",
      "Performance Time: Performance must be 5 to 8 minutes.",
      "College Representation: Multiple entries permitted per college/university/institute.",
      "Exclusivity: A model participating in Solo cannot participate in Duet or Team modeling.",
      "Costumes & Styling: Attire must be elegant, decent, and suitable for a university festival.",
      "Music Submission: Background tracks must be submitted in advance to the event desk.",
      "Reporting: Participants must report to the venue at least 30 minutes before their scheduled slot.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Poise, confidence & stage presence",
      "Costume styling & aesthetic presentation",
      "Ramp walk execution & grace",
      "Adherence to time limit (5–8 mins)",
      "Overall impact & elegance"
    ]
  },
  {
    id: "fashion-modeling-duet",
    name: "Fashion Modeling (Duet)",
    category: "CULTURAL",
    description: "Duet Fashion Modeling (pair of 1 male & 1 female model) runway competition combining couture, coordination, and poise.",
    teamSize: "2 Models (1 Male & 1 Female)",
    duration: "5–8 minutes",
    theme: "Duet Fashion Modeling",
    rules: [
      "Competition Format: Duet fashion modeling competition.",
      "Team Size: Strictly 2 models (1 male and 1 female model).",
      "Prohibited Tools: Original gun, sword, knife, fire, and hazardous props are strictly prohibited.",
      "Performance Time: Performance must be 5 to 8 minutes.",
      "College Representation: Multiple entries permitted per college/university/institute.",
      "Exclusivity: A model participating in Duet cannot participate in Solo or Team modeling.",
      "Costumes & Styling: Attire must be coordinated, elegant, and decent.",
      "Music Submission: Background tracks must be submitted in advance to the event desk.",
      "Reporting: Participants must report to the venue at least 30 minutes before their scheduled slot.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Pair coordination & stage chemistry",
      "Costume harmony & aesthetic presentation",
      "Ramp walk & choreography",
      "Adherence to time limit (5–8 mins)",
      "Overall artistic impact"
    ]
  },
  {
    id: "fashion-modeling-team",
    name: "Fashion Modeling (Team)",
    category: "CULTURAL",
    description: "Team Fashion Modeling (4–13 models) runway showcase combining coordinated couture, choreography, and themed presentations.",
    teamSize: "4–13 Models",
    duration: "5–8 minutes",
    theme: "Team Fashion Modeling",
    rules: [
      "Competition Format: Team fashion modeling runway showcase.",
      "Team Size: Strictly 4 to 13 models.",
      "Prohibited Tools: Original gun, sword, knife, fire, and hazardous props are strictly prohibited.",
      "Performance Time: Performance must be 5 to 8 minutes.",
      "College Representation: Multiple entries permitted per college/university/institute.",
      "Exclusivity: A model participating in Team modeling cannot participate in Solo or Duet modeling.",
      "Costumes & Styling: Coordinated group styling reflecting the chosen theme.",
      "Music Submission: Background tracks must be submitted in advance to the event desk.",
      "Reporting: Participants must report to the venue at least 30 minutes before their scheduled slot.",
      "Judges' Decision: The decision of the judges will be final and binding."
    ],
    judgingCriteria: [
      "Theme conceptualization & team choreography",
      "Costume styling & visual coordination",
      "Ramp walk synchronization & poise",
      "Adherence to time limit (5–8 mins)",
      "Overall group impact & presentation"
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
    teamSize: "2-4 participants",
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
