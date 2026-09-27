# CARAVAN ’26 — System Architecture

**Document:** `ARCHITECTURE.md`  
**Product:** CARAVAN ’26 Inter-University Youth Festival Website  
**Architecture Type:** Static/content-driven web application  
**Primary Framework:** Next.js App Router  
**Language:** TypeScript  
**Status:** Architecture Specification  
**Version:** 1.0

------------------------------------------------------------------------

## 1. Architecture Purpose

This document defines the technical and structural architecture of the
CARAVAN ’26 website.

The architecture is designed around one core principle:

> **Official festival content is structured data; the UI is a reusable
> presentation layer around that data.**

The system should make it easy to:

- Add or update events.
- Add official schedule/venue information later.
- Reuse event data across cards, filters, detail pages and SEO.
- Prevent duplicated or conflicting event information.
- Keep the initial website lightweight.
- Avoid introducing a backend when the product does not require one.

This document explains **system boundaries, data flow, component
responsibilities, routing, rendering strategy, content architecture and
future extensibility.**

------------------------------------------------------------------------

# 2. Architecture Principles

## 2.1 Single Content Source

Event information must have one canonical representation in the
application.

``` text
Official PDF
     ↓
Structured CARAVAN data
     ↓
Reusable UI
     ↓
Homepage / Explorer / Detail / Categories / SEO
```

Do not maintain separate event definitions inside individual components.

------------------------------------------------------------------------

## 2.2 Source Fidelity

The website is an interpretation of the official CARAVAN information,
not a replacement for it.

Architecture must support:

- Exact source-backed values
- Optional fields
- Missing information
- Verification flags
- Event-specific restrictions
- Future organizer updates

The system must not require every event to have the same fields.

------------------------------------------------------------------------

## 2.3 Content/Data Separation

Business/content information belongs in data modules.

Visual behavior belongs in components.

Example:

``` text
events.ts
    ↓
EventCard
    ↓
EventDetail
    ↓
Event SEO
```

Not:

``` text
EventCard
  └── hard-coded event information
```

------------------------------------------------------------------------

## 2.4 Static-First Architecture

The first release is fundamentally a read-only information website.

Therefore:

- No database is required.
- No API server is required.
- No authentication is required.
- No user account system is required.
- No payment backend is required.

The official registration process remains external through Microsoft
Forms.

------------------------------------------------------------------------

## 2.5 Progressive Extensibility

The architecture should support future official data without requiring a
rewrite.

Possible future additions:

``` text
Current
  ├── Events
  ├── Rules
  └── Registration

Future
  ├── Schedule
  ├── Venues
  ├── Announcements
  ├── Coordinators
  └── Live Festival Information
```

These should be additive modules, not reasons to introduce unnecessary
infrastructure now.

------------------------------------------------------------------------

# 3. High-Level System

``` text
                         ┌──────────────────────┐
                         │ Official CARAVAN PDFs│
                         │                      │
                         │ Events = factual     │
                         │ Caravan = visual     │
                         └──────────┬───────────┘
                                    │
                                    │ content extraction
                                    ▼
                         ┌──────────────────────┐
                         │ Structured Content   │
                         │                      │
                         │ categories.ts       │
                         │ events.ts            │
                         │ rules.ts             │
                         │ registration.ts      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │        Next.js App           │
                    │                              │
                    │  App Router                 │
                    │  Server Components          │
                    │  Static Generation           │
                    │  Metadata                    │
                    └─────────────┬────────────────┘
                                  │
             ┌────────────────────┼─────────────────────┐
             ▼                    ▼                     ▼
      ┌─────────────┐      ┌─────────────┐      ┌──────────────┐
      │ Presentation │      │ Navigation  │      │ SEO / Meta   │
      │ Components   │      │ / Routing   │      │ Generation   │
      └──────┬──────┘      └──────┬──────┘      └──────┬───────┘
             │                    │                     │
             └────────────────────┼─────────────────────┘
                                  ▼
                         ┌───────────────────┐
                         │ Public Website    │
                         │                   │
                         │ Home              │
                         │ Events            │
                         │ Event Details     │
                         │ Categories        │
                         │ Rules             │
                         │ Registration      │
                         └───────────────────┘
```

------------------------------------------------------------------------

# 4. Technology Stack

## Required

### Framework

**Next.js with App Router**

Reasons:

- Server-side rendering/static generation support
- Route-based architecture
- Strong SEO support
- Good image optimization
- Easy deployment
- Suitable for content-heavy public pages

### Language

**TypeScript**

Used for:

- Event schemas
- Category schemas
- Rules
- Component props
- Route parameters
- Content validation

### Styling

**Tailwind CSS or equivalent utility/design system**

The implementation should support:

- Responsive breakpoints
- Festival color tokens
- Typography tokens
- Spacing system
- Motion utilities
- Accessibility states

### Rendering

Prefer:

- React Server Components
- Static generation
- Minimal client components

Use client-side React only where interaction requires it.

------------------------------------------------------------------------

# 5. System Boundaries

## Inside the application

The website owns:

- Festival presentation
- Event discovery
- Event information
- Category navigation
- Rules presentation
- Registration CTA
- SEO metadata
- Responsive presentation

## Outside the application

Microsoft Forms owns:

- Registration form submission
- Registration data collection

The organizing committee owns:

- Final schedule
- Venue assignment
- Coordinator information
- Event changes
- Organizer announcements

The architecture must not pretend to own external information that is
not currently available.

------------------------------------------------------------------------

# 6. Application Layers

The application should be understood as five logical layers.

``` text
┌───────────────────────────────┐
│  1. Content Layer             │
│  Events / Categories / Rules  │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│  2. Domain Layer              │
│  Filtering / Lookup / Mapping │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│  3. UI Component Layer        │
│  Cards / Sections / Layouts   │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│  4. Route Layer               │
│  Pages / Dynamic Routes       │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│  5. Delivery Layer            │
│  Next.js / CDN / Browser      │
└───────────────────────────────┘
```

------------------------------------------------------------------------

# 7. Content Architecture

Recommended structure:

``` text
src/
└── data/
    └── caravan/
        ├── categories.ts
        ├── events.ts
        ├── rules.ts
        └── registration.ts
```

## categories.ts

Owns:

- Category ID
- Category slug
- Category name
- Descriptor
- Visual metadata
- Event references

## events.ts

Owns:

- Event identity
- Category relationship
- Participation
- Duration
- Objective
- Rounds
- Rules
- Materials
- Restrictions
- Deliverables
- Judging
- Verification flags

## rules.ts

Owns:

- General rules
- Rule categories
- Rule sections
- Rule items

## registration.ts

Owns:

- Official registration URL
- Official contact email
- Fee information
- Award information

------------------------------------------------------------------------

# 8. Domain Model

## 8.1 Category

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

Relationship:

``` text
Category
   │
   ├── Event
   ├── Event
   └── Event
```

------------------------------------------------------------------------

## 8.2 Event

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

------------------------------------------------------------------------

# 9. Why Optional Event Fields Matter

CARAVAN events are not structurally identical.

For example:

- A technical event may have development phases.
- A literary event may have language/time constraints.
- A media event may have output format requirements.
- A fine arts event may have material restrictions.
- A business event may have multiple judging rounds.

Therefore, forcing every event into one flat mandatory schema would
create empty or misleading UI.

The architecture uses optional sections:

``` text
Event
 ├── participation?
 ├── duration?
 ├── objective?
 ├── rounds?
 ├── themes?
 ├── rules?
 ├── materials?
 ├── restrictions?
 ├── deliverables?
 └── judging?
```

The UI renders a section only when its data exists.

------------------------------------------------------------------------

# 10. Verification Flags

The data layer must support information that requires organizer
confirmation.

Example:

``` ts
verificationFlags: [
  "Participant count requires organizer verification",
  "Competition format requires organizer verification"
]
```

This is particularly important for Robothon because the source contains
conflicting participant counts and conflicting descriptions of the
competition format.

The architecture must preserve this uncertainty instead of silently
converting it into one authoritative value.

------------------------------------------------------------------------

# 11. Data Flow

## Homepage

``` text
page.tsx
   ↓
getCategories()
   ↓
CategoryGrid
   ↓
getFeaturedEvents()
   ↓
EventTrail
```

------------------------------------------------------------------------

## Event Explorer

``` text
/events
   ↓
getAllEvents()
   ↓
EventExplorer
   ↓
Search / Filter
   ↓
EventCard
```

Search and filtering should operate against the centralized event
registry.

------------------------------------------------------------------------

## Event Detail

``` text
/events/[slug]
        ↓
getEventBySlug(slug)
        ↓
EventDetail
        ├── EventHeader
        ├── EventMeta
        ├── Objective
        ├── Rounds
        ├── Rules
        ├── Materials
        ├── Deliverables
        ├── Judging
        └── RegistrationCTA
```

If the event does not exist:

``` text
notFound()
```

------------------------------------------------------------------------

# 12. Routing Architecture

Recommended App Router structure:

``` text
app/
├── layout.tsx
├── page.tsx
├── not-found.tsx
│
├── events/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
│
├── categories/
│   └── [slug]/
│       └── page.tsx
│
├── rules/
│   └── page.tsx
│
└── register/
    └── page.tsx
```

------------------------------------------------------------------------

# 13. Route Responsibilities

## `/`

Responsibilities:

- Festival introduction
- Hero
- Category discovery
- Event Trail
- Rules preview
- Registration CTA

Should not contain the complete event registry directly in the page
component.

------------------------------------------------------------------------

## `/events`

Responsibilities:

- Event discovery
- Search
- Filtering
- Event cards

------------------------------------------------------------------------

## `/events/[slug]`

Responsibilities:

- Single event information
- Event metadata
- Event rules
- Judging
- Requirements
- Registration

------------------------------------------------------------------------

## `/categories/[slug]`

Responsibilities:

- Category introduction
- Category event list
- Category-specific visual treatment
- Links to individual event pages

------------------------------------------------------------------------

## `/rules`

Responsibilities:

- General festival rules
- Scannable rule sections
- Rule hierarchy

------------------------------------------------------------------------

## `/register`

Responsibilities:

- Explain registration briefly
- Link directly to official Microsoft Forms registration
- Show official contact information
- Show applicable fee structure where useful

No internal registration submission system.

------------------------------------------------------------------------

# 14. Component Architecture

``` text
components/
│
├── layout/
│   ├── Header
│   ├── Footer
│   └── MobileNav
│
├── hero/
│   └── FestivalHero
│
├── categories/
│   ├── CategoryGrid
│   ├── CategoryCard
│   └── CategoryHeader
│
├── events/
│   ├── EventExplorer
│   ├── EventCard
│   ├── EventTrail
│   ├── EventHeader
│   ├── EventMeta
│   ├── EventSection
│   ├── EventRules
│   ├── EventJudging
│   ├── RelatedEvents
│   └── EventCTA
│
├── rules/
│   ├── RulesPage
│   ├── RuleSection
│   └── RulesAccordion
│
└── common/
    ├── Button
    ├── Badge
    ├── SectionHeading
    ├── Divider
    └── ExternalLink
```

Component names can change during implementation, but responsibilities
should remain separated.

------------------------------------------------------------------------

# 15. Component Dependency Rules

Components should follow a one-directional dependency flow:

``` text
Data
 ↓
Domain helpers
 ↓
Page
 ↓
Presentation components
```

Avoid:

``` text
EventCard
  ↓
fetch event
  ↓
another API
  ↓
database
```

The first release does not require this complexity.

------------------------------------------------------------------------

# 16. Server vs Client Components

Default:

**Server Component**

Use server components for:

- Homepage sections
- Category pages
- Event detail pages
- Rules
- Footer
- Static navigation
- Metadata

Use client components only for:

- Event search
- Interactive filters
- Mobile navigation if stateful
- Accordion behavior when required
- Animation that requires browser state

Goal:

> Keep the amount of client-side JavaScript as small as practical.

------------------------------------------------------------------------

# 17. Search and Filtering Architecture

Search should operate on the structured event registry.

Conceptual flow:

``` text
allEvents
   ↓
normalize query
   ↓
match:
  name
  category
  descriptor
   ↓
filteredEvents
   ↓
render EventCard[]
```

Category filter:

``` text
All
Cultural
Technical
Business
Fine Arts
Literary
Media
```

The filter must reference `categoryId`, not duplicated category strings.

------------------------------------------------------------------------

# 18. Slug Strategy

Every event needs a stable unique slug.

Examples:

``` text
mono-acting
nukkad-natak
codathon
toyathon
robothon
structurathon
gamethon
mock-stock-market
business-venture-challenge
best-manager
marketing-war
brand-detective
art-from-waste
human-canvas
reel-it-real
60-second-story
caravan-live
sound-of-caravan
```

If a source event has variants, the slug strategy must preserve the
distinction without creating misleading event identities.

------------------------------------------------------------------------

# 19. Related Event Architecture

Related events should be resolved from the same category.

``` text
Current Event
      ↓
categoryId
      ↓
events.filter(categoryId === current.categoryId)
      ↓
exclude current event
      ↓
display limited set
```

Do not introduce popularity ranking or unsupported recommendation logic.

------------------------------------------------------------------------

# 20. Event Trail Architecture

The Event Trail is a presentation layer over event/category data.

It should not create separate event data.

``` text
categories
   ↓
event references
   ↓
EventTrailItem[]
   ↓
visual timeline
```

The trail represents:

> exploration order / editorial sequence

It does **not** represent:

> official event schedule

Therefore it must not contain schedule-specific fields unless an
official schedule is introduced later.

------------------------------------------------------------------------

# 21. Registration Architecture

Registration is an external dependency.

``` text
CARAVAN Website
       │
       │ HTTPS external link
       ▼
Microsoft Forms
       │
       ▼
Organizer registration data
```

Official registration URL:

``` text
https://forms.cloud.microsoft/r/3c3TxNrbsM
```

Official contact:

``` text
caravan@rimt.ac.in
```

The website should not collect participant information itself in version
1.

------------------------------------------------------------------------

# 22. Configuration vs Content

Keep these concerns separate.

### Content

``` text
events.ts
categories.ts
rules.ts
registration.ts
```

### Configuration

Potential:

``` text
site.config.ts
theme.config.ts
navigation.config.ts
```

Configuration may own:

- Site title
- Navigation
- Design tokens
- Feature flags

Event facts must remain in content modules.

------------------------------------------------------------------------

# 23. Design Token Architecture

Centralize core visual tokens.

Conceptually:

``` text
colors
├── navy
├── red
├── cream
├── white
└── gray

typography
├── display
├── heading
└── body

spacing
├── section
├── card
└── content

radius
├── card
└── button

motion
├── fast
├── normal
└── slow
```

Do not scatter arbitrary colors throughout components.

------------------------------------------------------------------------

# 24. Image Architecture

Images should be treated as assets rather than embedded page-specific
hacks.

Recommended:

``` text
public/
└── caravan/
    ├── logo/
    ├── hero/
    ├── categories/
    └── festival/
```

Use Next.js image optimization where appropriate.

Asset hierarchy:

``` text
Official assets
      ↓
Approved supporting imagery
      ↓
Generated decorative graphics
```

Never present generated or generic imagery as official festival
photography.

------------------------------------------------------------------------

# 25. SEO Architecture

Metadata should be generated from structured content.

Example:

``` text
event
  ↓
generateMetadata()
  ↓
title
description
canonical
Open Graph
```

Event pages should be independently discoverable.

Potential future structured data can be added only where the underlying
facts support it.

Do not create fake event dates merely to satisfy structured-data
schemas.

------------------------------------------------------------------------

# 26. Static Generation Strategy

Event routes are ideal candidates for static generation.

Conceptually:

``` text
events.ts
   ↓
generateStaticParams()
   ↓
/events/mono-acting
/events/codathon
/events/robothon
...
```

Benefits:

- Fast delivery
- CDN caching
- Low server overhead
- Reliable event pages
- No runtime database dependency

------------------------------------------------------------------------

# 27. Error Handling

## Unknown event

Use the Next.js `notFound()` flow.

## Unknown category

Use `notFound()`.

## Missing optional event section

Do not render an empty section.

Example:

``` text
judging = undefined
```

means:

``` text
do not render "Judging Criteria"
```

rather than:

``` text
Judging Criteria
No data available
```

unless the product specifically wants an announcement state.

------------------------------------------------------------------------

# 28. Future Schedule Architecture

Do not implement a schedule database now.

If official schedule information becomes available later:

``` text
src/data/caravan/
    schedule.ts
    venues.ts
```

Potential model:

``` ts
type ScheduleItem = {
  id: string
  eventId: string
  date?: string
  startTime?: string
  endTime?: string
  venueId?: string
}
```

This should be introduced only when official data exists.

------------------------------------------------------------------------

# 29. Future Venue Architecture

Potential future structure:

``` ts
type Venue = {
  id: string
  name: string
  description?: string
  location?: string
  mapUrl?: string
}
```

Events could then reference:

``` ts
venueId?: string
```

Do not introduce fake venues to satisfy this model.

------------------------------------------------------------------------

# 30. Future Announcements

If required later:

``` text
src/data/caravan/
    announcements.ts
```

Possible model:

``` ts
type Announcement = {
  id: string
  title: string
  body: string
  publishedAt: string
  category?: string
}
```

Announcements should be independently managed from event content.

------------------------------------------------------------------------

# 31. Content Validation

A validation layer should verify basic data integrity at
development/build time.

Checks should include:

- Unique event IDs
- Unique slugs
- Valid category references
- Valid participant ranges
- Valid judging weights
- No duplicate category IDs
- Required event names
- Registration URL format
- No orphaned events

Conceptually:

``` text
events
   ↓
validateEvents()
   ↓
PASS / BUILD ERROR
```

------------------------------------------------------------------------

# 32. Source Verification Metadata

For sensitive or ambiguous information, data may contain:

``` ts
sourceNotes?: string[]
verificationFlags?: string[]
```

Example:

``` ts
{
  verificationFlags: [
    "Participant count differs between source sections",
    "Competition format requires organizer confirmation"
  ]
}
```

These fields are primarily for development/content governance and do not
automatically need to appear publicly.

------------------------------------------------------------------------

# 33. Content Governance

Before any content update:

``` text
Official source
      ↓
Verify exact value
      ↓
Update structured data
      ↓
Run validation
      ↓
UI automatically updates
```

Do not directly patch individual cards/pages when the underlying event
fact changes.

------------------------------------------------------------------------

# 34. Performance Architecture

Primary strategy:

``` text
Static content
     +
Server Components
     +
Optimized images
     +
Minimal client JS
     =
Fast public website
```

Avoid:

- Client-side fetching for static event content
- Runtime database queries for event details
- Large animation libraries without need
- Global state management
- Heavy visual frameworks
- WebGL for decorative effects

------------------------------------------------------------------------

# 35. State Management

No global state library is required for version 1.

Local UI state is sufficient for:

- Search query
- Category filter
- Mobile navigation
- Accordion open/closed state
- Reduced-motion/UI preferences when required

The event registry itself is immutable application content.

------------------------------------------------------------------------

# 36. Backend Requirements

### Version 1

Backend:

**None required.**

External service:

**Microsoft Forms for registration.**

### Future backend triggers

A backend becomes justified if the product adds:

- Organizer CMS
- Dynamic event updates
- Participant accounts
- Personalized registration
- Live results
- Notifications
- Admin dashboard

Until then, avoid backend infrastructure.

------------------------------------------------------------------------

# 37. Deployment Architecture

Recommended conceptual deployment:

``` text
Git Repository
      ↓
CI / Build
      ↓
Next.js Production Build
      ↓
Hosting / CDN
      ↓
Browser
```

The website should be deployable as a standard Next.js application.

Environment variables should only be introduced for real external
integrations.

Do not create environment variables for static facts that belong in
source-controlled content.

------------------------------------------------------------------------

# 38. Security

Version 1 has a small attack surface because:

- No authentication
- No user database
- No payment processing
- No internal form submission
- No private APIs

Still enforce:

- HTTPS
- Safe external links
- No unsafe HTML injection
- Sanitized dynamic content if future CMS support is added
- Secure dependency management

------------------------------------------------------------------------

# 39. Accessibility Architecture

Accessibility is a system responsibility, not a final visual pass.

Components should provide:

``` text
Semantic HTML
      +
Keyboard behavior
      +
Focus management
      +
Accessible names
      +
Contrast
      +
Reduced motion
```

Interactive client components must preserve keyboard and screen-reader
behavior.

------------------------------------------------------------------------

# 40. Architecture Anti-Patterns

Avoid:

### Hard-coded event cards

``` tsx
<EventCard name="Codathon" ... />
<EventCard name="Toyathon" ... />
```

Prefer:

``` tsx
events.map(event => (
  <EventCard event={event} />
))
```

### Page-specific event data

Do not duplicate event rules inside:

``` text
/events/codathon/page.tsx
```

Resolve them from `events.ts`.

### Runtime fetching of static facts

Do not introduce an API call merely to load event names.

### Global state for static content

Do not introduce Redux/Zustand/etc. for the event registry.

### Premature database

Do not add MongoDB/Firebase solely because the website contains many
events.

------------------------------------------------------------------------

# 41. Architecture Decision Records

Important decisions:

## ADR-001 — Local structured content

**Decision:** Store initial festival content in TypeScript data modules.

**Reason:** The first release is read-only and the source content is
relatively stable.

------------------------------------------------------------------------

## ADR-002 — No database

**Decision:** No database for version 1.

**Reason:** There is no user-generated or dynamically managed
application state.

------------------------------------------------------------------------

## ADR-003 — External registration

**Decision:** Use official Microsoft Forms.

**Reason:** Registration already exists externally and should not be
unnecessarily recreated.

------------------------------------------------------------------------

## ADR-004 — Server-first rendering

**Decision:** Prefer Server Components and static generation.

**Reason:** The website is primarily content and should minimize
client-side JavaScript.

------------------------------------------------------------------------

## ADR-005 — Optional event sections

**Decision:** Event fields are optional.

**Reason:** Different CARAVAN competitions expose different information
structures.

------------------------------------------------------------------------

## ADR-006 — Preserve source ambiguity

**Decision:** Conflicting source information is represented using
verification flags rather than silently resolved.

**Reason:** The website must not manufacture an interpretation of
official rules.

------------------------------------------------------------------------

# 42. Testing Strategy

## Unit tests

Test:

- Event lookup
- Slug lookup
- Category lookup
- Search
- Filtering
- Data validation
- Judging-weight validation

## Integration tests

Test:

- `/events`
- Event navigation
- Category navigation
- Registration link
- Rules navigation

## E2E tests

Critical path:

``` text
Homepage
 → Events
 → Search
 → Event
 → Register
```

## Visual testing

Check:

- Hero
- Category cards
- Event cards
- Event detail
- Rules
- Mobile navigation
- Event Trail

------------------------------------------------------------------------

# 43. Build-Time Validation

Recommended build pipeline:

``` text
Install
  ↓
Typecheck
  ↓
Content validation
  ↓
Lint
  ↓
Build
  ↓
E2E / smoke tests
  ↓
Deploy
```

A content validation failure should block production deployment.

------------------------------------------------------------------------

# 44. Project Structure

Recommended final structure:

``` text
caravan-26/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   │
│   ├── events/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── rules/
│   │   └── page.tsx
│   │
│   └── register/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   ├── hero/
│   ├── categories/
│   ├── events/
│   ├── rules/
│   └── common/
│
├── data/
│   └── caravan/
│       ├── categories.ts
│       ├── events.ts
│       ├── rules.ts
│       └── registration.ts
│
├── lib/
│   └── caravan/
│       ├── events.ts
│       ├── categories.ts
│       ├── search.ts
│       └── validation.ts
│
├── public/
│   └── caravan/
│       ├── logo/
│       ├── hero/
│       ├── categories/
│       └── festival/
│
├── styles/
│   └── ...
│
├── SPEC.md
├── ARCHITECTURE.md
└── README.md
```

------------------------------------------------------------------------

# 45. Responsibility Matrix

| Responsibility           | Location                       |
|--------------------------|--------------------------------|
| Event facts              | `data/caravan/events.ts`       |
| Category definitions     | `data/caravan/categories.ts`   |
| General rules            | `data/caravan/rules.ts`        |
| Registration/fees/awards | `data/caravan/registration.ts` |
| Search logic             | `lib/caravan/search.ts`        |
| Data validation          | `lib/caravan/validation.ts`    |
| Event lookup             | `lib/caravan/events.ts`        |
| Page composition         | `app/**`                       |
| Reusable UI              | `components/**`                |
| Images/assets            | `public/caravan/**`            |
| Visual tokens            | Tailwind/theme/config          |
| Official registration    | Microsoft Forms                |

------------------------------------------------------------------------

# 46. End-to-End System Flow

``` text
                 OFFICIAL SOURCES
                       │
             ┌─────────┴─────────┐
             │                   │
       Events PDF          Visual PDF
             │                   │
             ▼                   ▼
      Factual Content       Design Direction
             │                   │
             └─────────┬─────────┘
                       ▼
                CARAVAN DATA
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Categories     Events       Rules
          │            │            │
          └────────────┼────────────┘
                       ▼
                 Domain Helpers
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       Homepage     Explorer      Detail Pages
          │            │             │
          └────────────┼─────────────┘
                       ▼
                 Next.js Render
                       │
                       ▼
                CDN / Browser
                       │
                       ▼
                 Festival User
                       │
                       ▼
             External Registration
                 Microsoft Forms
```

------------------------------------------------------------------------

# 47. Definition of Architectural Completion

The architecture is complete when:

- Event information has one canonical data source.
- Categories reference events cleanly.
- Routes resolve from structured content.
- Event pages do not contain duplicated factual data.
- Search/filtering uses the same event registry.
- Rules are independently structured.
- Registration remains external.
- Optional fields are supported.
- Source ambiguities can be flagged.
- New official fields can be added without restructuring the entire
  application.
- The first release requires no database or backend.
- The application can statically render the public festival experience.
- The architecture leaves a clean path for future schedule, venue and
  organizer modules.

------------------------------------------------------------------------

# 48. Relationship to SPEC.md

`SPEC.md` defines **what the product must do**.

`ARCHITECTURE.md` defines **how the product is organized to do it**.

``` text
SPEC.md
  ↓
Requirements / behavior / acceptance
  ↓
ARCHITECTURE.md
  ↓
System boundaries / data / routes / components
  ↓
Implementation
  ↓
Working CARAVAN ’26 website
```

The implementation should satisfy both documents.

When a conflict appears:

1.  Official factual source determines content.
2.  `SPEC.md` determines product requirements.
3.  `ARCHITECTURE.md` determines system structure.
4.  Implementation details remain flexible unless explicitly
    constrained.
