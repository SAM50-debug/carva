# CARAVAN ’26 — Website Specification

**Document:** `SPEC.md`  
**Product:** CARAVAN ’26 Inter-University Youth Festival Website  
**Host:** RIMT University  
**Status:** Implementation Specification  
**Version:** 1.0

## 1. Source-of-Truth Policy

### Factual source

`EVENTS CARAVAN'26.pdf` is the sole source of truth for all factual and
operational information:

- Event names and categories
- Descriptions
- Team/participant sizes
- Durations
- Rules
- Deliverables
- Judging criteria
- Eligibility
- Fees
- Awards
- Registration
- General regulations
- AI/digital-tool restrictions
- Materials and equipment
- Official contact information

### Visual reference

`Caravan'26 (2).pdf` is visual/brand reference only. It controls neither
event facts nor operational details.

**Never invent missing information.** Do not fabricate dates, venues,
schedules, coordinators, judges, sponsors, prize amounts, accommodation,
food, deadlines or event-specific contacts.

------------------------------------------------------------------------

## 2. Product Definition

CARAVAN ’26 should be a premium, responsive, information-first
university festival website.

Primary user jobs:

1.  Understand CARAVAN ’26.
2.  Discover competitions.
3.  Browse by category.
4.  Search/filter events.
5.  Open complete event requirements.
6.  Review fees, awards and general rules.
7.  Register through the official registration channel.

This is **not** a PDF viewer, SaaS dashboard, participant portal,
payment system or judge portal.

------------------------------------------------------------------------

## 3. Information Architecture

``` text
/
├── /events
├── /events/[slug]
├── /categories/[slug]
├── /rules
└── /register
```

Future routes may include `/schedule`, `/announcements` and `/contact`
only when official information exists.

------------------------------------------------------------------------

## 4. Homepage

### Header

Navigation:

- Home
- Events
- Categories
- Rules
- Register

Include RIMT/CARAVAN branding and an obvious registration CTA.

### Hero

Establish immediately:

- CARAVAN ’26
- Inter-University Youth Festival
- Primary CTA: Explore Events
- Secondary CTA: Register

The visual reference uses the phrase `CONNECT | CREATE | CELEBRATE`. Do
not invent additional official slogans.

### Category section

Six primary categories:

1.  Cultural Events
2.  Technical Events
3.  Business Battles
4.  Fine Arts Events
5.  Literary Events
6.  Media Events

Category counts must be derived from the centralized event registry.

### Event Trail

Use an editorial vertical event trail for exploration. It is **not an
official chronological schedule**. Never add fabricated event dates or
times.

### Rules preview

Show a concise preview with a link to `/rules`.

### Final CTA

Prominent official registration CTA.

------------------------------------------------------------------------

## 5. Official Event Registry

All event content must live in one structured data source. UI components
must not duplicate event facts.

### Cultural Events

- Mono Acting
- Nukkad Natak / Street Play
- Traditional Attire & Talent Show
- Solo Dance
- Duet Dance
- Group Dance
- Solo Vocal
- Duet Vocal
- Group Vocal
- Solo Instrumental
- Duet/Group Instrumental

Dance categories:

- Bhangra – Dhol
- Bhangra Empire
- Bhangra on Music
- Western Dance
- Folk Dance – Any Indian State
- International Dance – Any Country

Music categories:

- Shabad Gayan
- Folk Singing
- Qawwali
- International Music
- Indian Classical / Semi-Classical
- Instrumental Music

### Technical Events

- Codathon
- Toyathon
- Robothon
- Structurathon
- Gamethon

Common technical competition structure: 4 hours / 240 minutes:

| Phase                                  | Duration |
|----------------------------------------|---------:|
| Registration & Team Verification       |   15 min |
| Technical Briefing & Problem Statement |   15 min |
| Design / Development                   |  150 min |
| Testing & Final Submission             |   30 min |
| Judging / Demonstration                |   30 min |

Technical rules include originality, timely submission, valid ID,
safety, final demonstration and source/project submission as applicable.

### Business Battles

- Mock Stock Market
- Business Venture Challenge
- Best Manager
- Marketing War
- Brand Detective
- Marketing Auction
- Ad-Mad Show

Known source-backed examples:

**Mock Stock Market** - Individual / 2 - 60–90 minutes - ₹10 lakh
virtual capital per participant - Market Knowledge Quiz - Virtual
Trading - Investment Pitch

Judging: Portfolio Returns 40%, Investment Strategy 25%, Risk Management
20%, Market Knowledge & Justification 15%.

**Business Venture Challenge** - Team 2–4 - 8–10 minutes per team - Idea
Submission - Business Pitch - Investor Q&A

**Best Manager** - Individual - 60–90 minutes - Managerial Aptitude -
Case Study - Crisis Management - Leadership/Negotiation Task

**Marketing War** - Team 2–4 - 60–90 minutes - Brand Battle - Marketing
Strategy - Product Promotion - Marketing Crisis

**Brand Detective** - Team 3–4 - 60–75 minutes - Guess the Brand -
Marketing Mystery - 60-Second Marketing Challenge - No mobile phones -
No negative marking - Maximum 3-minute presentation

For Marketing Auction and Ad-Mad Show, expose only fields actually
supported by the source PDF.

### Fine Arts Events

- Colour Storm
- Poster Pulse
- Earth & Form
- Frame the Fest
- Re:Create
- Art from Waste
- Human Canvas

Common Fine Arts rules:

- Bona fide students and valid institutional ID
- Report at least 30 minutes before the event
- Work produced on the spot
- Pre-made, traced, copied and AI-generated visual material prohibited
- Digital reference devices prohibited unless specifically required
- Own consumables/tools unless host-provided
- Hazardous/inflammable/toxic/offensive materials prohibited
- Workspace cleanup required
- Jury decision final

Common judging:

| Criterion                              | Weight |
|----------------------------------------|-------:|
| Creativity & Originality               |    25% |
| Interpretation / Relevance to Theme    |    20% |
| Composition & Visual Impact            |    20% |
| Technique / Craftsmanship              |    20% |
| Presentation, Finish & Time Management |    15% |

**Art from Waste:** 2–3 participants, 2 hr 30 min, discarded/recycled
material, no ready-made craft objects, no open flame/hazardous
chemicals/broken glass/dangerous sharp waste.

**Human Canvas:** 2 members (1 artist + 1 model), 2 hr, live theme,
skin-safe/non-toxic paints, no pre-painted prosthetics or ready-made
transfers.

### Literary Events

- War of Words
- Just a Minute
- Ink & Imagination
- Verse Unplugged

Common rules:

- Bona fide students and valid ID
- Report 30 minutes before
- Originality requirements
- Generative AI/internet/mobile/external assistance prohibited for
  on-the-spot events unless explicitly permitted
- Respectful content
- Language/topic/word/time limits
- Preliminary rounds may occur
- Jury/quizmaster decision final

Common judging:

| Criterion                        | Weight |
|----------------------------------|-------:|
| Content / Ideas                  |    25% |
| Originality & Creativity         |    20% |
| Language / Structure             |    20% |
| Delivery / Expression            |    20% |
| Overall Impact & Time Management |    15% |

### Media Events

- Reel It Real
- 60-Second Story
- Caravan Live
- Sound of Caravan

Common rules:

- Bona fide students and valid ID
- Report 30 minutes before
- Principal media created on the spot unless the event says otherwise
- Bring charged devices, storage, power banks, cables, headphones and
  editing devices
- No downloaded stock footage, unauthorized copyrighted material,
  pre-shot material or generative AI media unless explicitly allowed
- Do not obstruct competitions or enter restricted areas
- Respect identifiable interviewees
- Follow organizer-specified submission
  format/orientation/resolution/deadline

**Reel It Real:** 2 participants, 2 hr 30 min, vertical reel 20–45
seconds, theme announced at venue, no pre-shot/downloaded/AI video.

**60-Second Story:** 3 participants, 3 hours, maximum 60-second short
film, theme/line/object revealed on the spot, no stock/pre-shot/AI
scenes.

**Caravan Live:** 2 participants (reporter + camera person), 2 hours,
2–3 minute report, presenter piece-to-camera, event visuals,
participant/organizer sound bite, verified facts/names.

**Sound of Caravan:** 2 participants, 2 hr 30 min, 3–5 minute audio
story/podcast, primary audio recorded on the spot, approved/royalty-free
music, no pre-recorded narration/interviews or AI voices.

------------------------------------------------------------------------

## 6. Event Card

Each card contains:

- Event name
- Category
- Short descriptor
- Team/participant size
- Duration when officially available
- One or two key requirements
- View Details CTA

Do not put full rules inside cards.

------------------------------------------------------------------------

## 7. Event Detail Page

Route:

``` text
/events/[slug]
```

Sections, rendered only when source-backed data exists:

1.  Event title
2.  Category
3.  Description
4.  Participant/team size
5.  Duration
6.  Objective/concept
7.  Rounds/process
8.  Rules
9.  Materials/equipment
10. Deliverables
11. Judging criteria
12. Restrictions
13. Registration CTA

------------------------------------------------------------------------

## 8. Events Explorer

Route: `/events`

Required:

- Search by event/category/descriptor
- Category filters
- Default order from event registry
- Clear-filter empty state

Never imply chronological order without an official schedule.

------------------------------------------------------------------------

## 9. General Rules

Route: `/rules`

Include the official sections:

1.  Eligibility
2.  Registration
3.  Institutional representation
4.  Reporting time
5.  Event schedule
6.  Event-specific rules
7.  Materials and equipment
8.  Originality and fair practice
9.  AI and digital tools
10. Code of conduct
11. Prohibited items
12. Judging
13. Disqualification
14. Tie-breaking
15. Results and awards
16. Certificates
17. Photography and media coverage
18. Intellectual property
19. Travel, accommodation and food
20. Personal belongings
21. Faculty/team coordinator
22. Grievances
23. Cancellation/modification
24. Host University authority

------------------------------------------------------------------------

## 10. Registration, Fees and Awards

Official registration:

`https://forms.cloud.microsoft/r/3c3TxNrbsM`

Official query email:

`caravan@rimt.ac.in`

### Entry fees

| Participation            |    Fee |
|--------------------------|-------:|
| Solo — 1 participant     |   ₹200 |
| Duet — 2 participants    |   ₹400 |
| Group — 3–8 participants | ₹1,000 |

Fee applies per performance/category.

### Awards

**Winner:** Trophy + Certificate

**Runner-up:** Certificate + Recognition

**Special Recognition:** Certificates may be awarded subject to the
organizing committee/jury.

Do not invent monetary prize values.

------------------------------------------------------------------------

## 11. Visual System

### Palette

- Deep navy
- RIMT red
- Warm off-white
- White
- Light gray

### Typography

Use an editorial serif/display face for major festival titles and a
clean sans-serif for body/UI.

### Visual language

Use:

- Editorial grids
- Thin rules
- Circles/badges
- Category symbols
- Curved line motifs
- Subtle poster/paper texture where appropriate
- Campus/festival imagery
- Controlled red accents
- Navy structural elements
- Large display typography

The reference includes navy brush-stroke treatment, silhouettes, campus
imagery and curved navy/red lines. Adapt these ideas to responsive web
UI rather than copying the poster literally.

Avoid:

- Generic SaaS visuals
- Neon gradients
- Excessive glassmorphism
- Cyberpunk styling
- Heavy WebGL
- Fake photography
- Fake sponsor logos

------------------------------------------------------------------------

## 12. Motion

Use restrained motion:

- Hero reveal
- Category hover
- Timeline line drawing
- Event-card reveal
- Subtle image movement
- Button micro-interactions

Support `prefers-reduced-motion`.

No continuous/distracting animation.

------------------------------------------------------------------------

## 13. Responsive Design

Test at:

- 320px
- 375px
- 768px
- 1024px
- 1440px

Desktop: editorial multi-column layouts and alternating event trail.

Mobile: single-column cards, compact navigation, readable rules and no
horizontal overflow.

------------------------------------------------------------------------

## 14. Accessibility

Required:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Sufficient contrast
- Accessible buttons/links
- Correct alt behavior
- Decorative images marked appropriately
- Reduced-motion support
- Clear link/button labels
- Do not use color alone to communicate meaning

------------------------------------------------------------------------

## 15. SEO

Homepage:

`CARAVAN ’26 | Inter-University Youth Festival | RIMT University`

Event pattern:

`[Event Name] | CARAVAN ’26 | RIMT University`

Implement:

- Unique event metadata
- Canonicals
- Open Graph metadata
- Sitemap
- Robots configuration
- Crawlable event routes
- Structured headings

All SEO copy must remain source-backed.

------------------------------------------------------------------------

## 16. Data Architecture

Recommended:

``` text
src/
  data/
    caravan/
      categories.ts
      events.ts
      rules.ts
      registration.ts
```

### Event model

``` ts
type Event = {
  id: string
  slug: string
  name: string
  categoryId: string
  descriptor?: string
  participation?: {
    type?: "individual" | "duet" | "team" | "group"
    min?: number
    max?: number
    notes?: string
  }
  duration?: {
    minutes?: number
    display?: string
  }
  objective?: string
  formats?: string[]
  rounds?: string[]
  themes?: string[]
  rules?: string[]
  materials?: string[]
  restrictions?: string[]
  deliverables?: string[]
  judging?: {
    criterion: string
    weight?: number
  }[]
  sourceNotes?: string[]
  verificationFlags?: string[]
}
```

### Category model

``` ts
type Category = {
  id: string
  slug: string
  name: string
  descriptor?: string
  icon?: string
  accent?: string
  events: string[]
}
```

Content must be separate from presentation.

------------------------------------------------------------------------

## 17. Architecture

Recommended stack:

- Next.js
- App Router
- TypeScript
- Tailwind CSS or equivalent
- Server/static rendering wherever practical
- Structured local data
- No backend/database required for the initial read-only experience

Suggested structure:

``` text
app/
├── page.tsx
├── events/page.tsx
├── events/[slug]/page.tsx
├── categories/[slug]/page.tsx
├── rules/page.tsx
└── register/page.tsx

components/
├── layout/
├── hero/
├── categories/
├── events/
├── rules/
└── common/
```

Registration is an external Microsoft Forms link.

------------------------------------------------------------------------

## 18. Performance

Target:

- Fast first load
- Optimized images
- Minimal client-side JavaScript
- Static/server-rendered content where possible
- Lazy-loaded below-fold media
- Lightweight event registry
- Immediate search/filter interactions

Avoid unnecessary animation/dependency overhead.

------------------------------------------------------------------------

## 19. Known Source Ambiguity — Robothon

The factual PDF contains a conflict:

- Summary table: **2–4 participants**
- Detailed section: **1–3 participants**

It also references both:

- Line-following/racing
- Enclosed combat arena

Do **not** silently resolve this.

Use `verificationFlags` and expose only unambiguous details until the
organizer confirms the final rule.

------------------------------------------------------------------------

## 20. Missing Information Policy

The source indicates that final details may be announced separately,
including:

- Date
- Venue
- Reporting time
- Practice/rehearsal schedule
- Registration updates
- In-charge/coordinator details
- Contact information
- Event-specific instructions
- Prize structure

If unavailable, either omit the field or display:

> To be announced by the Organizing Committee.

Never create fake values.

------------------------------------------------------------------------

## 21. UX Journey

``` text
Homepage
   ↓
Category discovery
   ↓
Event Explorer
   ↓
Event Card
   ↓
Event Detail
   ↓
Requirements / Rules
   ↓
Register
```

Secondary:

``` text
Homepage
   ↓
Rules
   ↓
Register
```

A user should not need the original PDF to understand basic
participation requirements.

------------------------------------------------------------------------

## 22. Forbidden Implementation Patterns

Do not:

- Invent facts
- Add fake statistics
- Add fake sponsors/judges
- Add fake prize money
- Add fake schedules/venues
- Add fake contacts
- Turn the event trail into a timetable
- Use PDF screenshots as the main UI
- Overuse gradients or glassmorphism
- Use random neon colors
- Use heavy WebGL
- Hide important rules behind excessive interaction
- Duplicate event data in components
- Silently reconcile conflicting source information

------------------------------------------------------------------------

## 23. Acceptance Criteria

### Content

- [ ] All six categories represented.
- [ ] All source-backed competitions represented.
- [ ] Names match source.
- [ ] Team sizes/durations match source or are explicitly flagged.
- [ ] Rules match source.
- [ ] Fees match source.
- [ ] Awards match source.
- [ ] Registration URL and email match source.
- [ ] No unsupported factual claims.

### UX

- [ ] Homepage communicates festival immediately.
- [ ] All events are discoverable.
- [ ] Search works.
- [ ] Category filters work.
- [ ] Every event has a dedicated route.
- [ ] Event pages expose relevant requirements.
- [ ] Registration is always easy to reach.
- [ ] Rules are scannable.
- [ ] Mobile works without horizontal overflow.

### Design

- [ ] Navy/red/off-white direction is consistent.
- [ ] Editorial typography is used.
- [ ] Festival identity is institutional and cultural.
- [ ] Design does not look like a SaaS template.

### Accessibility

- [ ] Keyboard navigation.
- [ ] Visible focus.
- [ ] Contrast.
- [ ] Accessible labels.
- [ ] Reduced motion.

### SEO/performance

- [ ] Unique page metadata.
- [ ] Canonicals.
- [ ] Sitemap.
- [ ] Robots.
- [ ] Optimized imagery.
- [ ] No unnecessary heavy dependencies.

------------------------------------------------------------------------

## 24. Definition of Done

The website is done when a student can:

1.  Understand CARAVAN ’26 from the homepage.
2.  Discover events by category.
3.  Search/filter competitions.
4.  Open a dedicated event page.
5.  Understand the source-backed participation requirements.
6.  Read the general rules.
7.  See official fees and awards.
8.  Register using the official form.

The site must be responsive, accessible, SEO-ready, visually aligned
with the supplied brand reference, and free of invented factual
information.

------------------------------------------------------------------------

## 25. Source Files

### Factual source

`EVENTS CARAVAN'26.pdf`

### Visual reference

`Caravan'26 (2).pdf`

The factual PDF remains authoritative for content. The visual PDF
remains authoritative only for visual direction.
