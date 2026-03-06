# CMS as a Content Engine — POC Report

> **Prepared by**: Rohan  
> **Date**: March 2026  
> **Purpose**: Share learnings from the POC — what we built, what we proved, and which CMS to carry forward

---

## 1. Context & Goal

The project architecture is:

```
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Single App)                   │
│         Public Website · Member Portal · Super Admin         │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API calls
┌─────────────────────────▼───────────────────────────────────┐
│                    NestJS Backend (APIs)                      │
│             Auth · Content · Business Logic                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Local API / HTTP
┌─────────────────────────▼───────────────────────────────────┐
│                CMS — used as a Content Engine                 │
│     (NOT for its admin panel — custom UI is in Next.js)      │
└─────────────────────────────────────────────────────────────┘
```

**Key decision from the team:**

- CMS Admin Panel → **not used** (custom Next.js UI handles everything)
- NestJS APIs → consumed by the Next.js frontend
- CMS → used purely as a **structured content storage and schema engine**

The POC was built to answer: **Does using a CMS as a headless content engine (behind NestJS) give us real value, or is it unnecessary overhead?**

---

## 2. What We Built in This POC

### Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Frontend      | Next.js 14 (App Router)                            |
| Backend       | NestJS 10 (ESM, TypeScript)                        |
| CMS #1        | Payload CMS v3 (Local API, admin disabled)         |
| CMS #2        | Strapi v5 (HTTP API, admin enabled for comparison) |
| Database      | PostgreSQL (shared, schema-isolated)               |
| Auth          | JWT + Passport + bcrypt                            |
| ORM (users)   | Prisma                                             |
| ORM (content) | Payload (Drizzle internally)                       |

### What Was Delivered

| Feature                                        | Status |
| ---------------------------------------------- | ------ |
| User Registration + Login (JWT)                | ✅     |
| Create / Read / Update / Delete Articles       | ✅     |
| Rich Text Editing (TipTap WYSIWYG on frontend) | ✅     |
| Draft / Published status with scheduling       | ✅     |
| Featured Image upload (base64)                 | ✅     |
| Tags, SEO metadata, slug auto-generation       | ✅     |
| Protected admin routes (JWT-guarded)           | ✅     |
| Public endpoints for published content         | ✅     |
| Runtime CMS switching (Payload ↔ Strapi)       | ✅     |
| Unified response format across both CMSs       | ✅     |
| Next.js frontend consuming all APIs            | ✅     |

### Architecture Proven

```
Next.js Frontend
      │
      │  POST /articles, GET /articles/:slug ...
      ▼
NestJS (ContentController)
      │
      │  cms=payload or cms=strapi (query param)
      ▼
ContentService
      │
    ┌─┴─────────────┐
    ▼               ▼
Payload          Strapi
Local API        HTTP API
    │               │
    └──────┬────────┘
           ▼
    PostgreSQL (same DB)
```

---

## 3. Key Technical Challenges & How We Solved Them

| Challenge                                   | Root Cause                                           | Solution                                                                      |
| ------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `ERR_REQUIRE_ASYNC_MODULE`                  | Payload v3 is ESM-only; NestJS defaults to CommonJS  | Migrated full project to ESM (`"type": "module"`, `NodeNext` module)          |
| Table collisions between Prisma and Payload | Both tried to own the `users` table                  | Payload isolated into `payload` PostgreSQL schema via `schemaName: "payload"` |
| JWT 401 on every request                    | `process.env.JWT_SECRET` read before `dotenv` loaded | Switched to `JwtModule.registerAsync()` to defer env reads                    |
| Payload admin panel conflict                | v3 always creates a `users` auth collection          | Disabled admin panel; created isolated `payload-users` collection             |
| Lexical content rendering                   | Payload's Lexical format is an AST, not raw HTML     | Wrote custom `renderLexicalContent()` traversal function on frontend          |

---

## 4. Benefits of CMS as a Content Engine

Even when the CMS admin panel is disabled, using a CMS as the content layer behind NestJS provides the following built-in capabilities:

### ✅ What You Get for Free

| Capability                     | Without CMS                    | With CMS                                          |
| ------------------------------ | ------------------------------ | ------------------------------------------------- |
| Content schema definition      | Write SQL/Prisma migrations    | Define a TypeScript schema file                   |
| Automatic table creation       | `prisma migrate dev` each time | CMS creates/alters tables on startup              |
| Draft / Published workflow     | Build custom status logic      | Built-in `status: draft \| published`             |
| Scheduled publishing           | Build cron + date logic        | Built-in `publishAt` / `unpublishAt` fields       |
| Content versioning             | Build custom version table     | Built-in version history                          |
| Relationship fields            | Write JOIN queries manually    | `type: 'relationship', relationTo: 'collection'`  |
| Field-level access control     | Build custom guards per field  | Declarative `access: { read: isAdmin }` in schema |
| Rich text as structured data   | Raw HTML (hard to reuse)       | Lexical AST (can convert to Markdown, PDF, etc.)  |
| Media library                  | Build S3/local upload logic    | Built-in upload, resize, focal point              |
| Hooks / lifecycle events       | Custom middleware              | `beforeChange`, `afterChange`, `afterRead`        |
| Slug uniqueness enforcement    | Add DB unique index            | `unique: true` on field                           |
| Pagination, sorting, filtering | Write Prisma query builders    | Built-in `find({ limit, sort, where })`           |

### Real Benefit in This POC

- Adding a new content field (e.g. `dashboardUrl`) required **zero database migration** — define it in `Articles.ts`, and Payload handles the rest.
- Draft/publish filtering worked **without a single line of custom filtering logic**.
- Structured Lexical format means content is **portable** — same JSON can render on web, mobile, PDF, or email.

---

## 5. Payload CMS vs Strapi — Detailed Comparison

### 5.1 Overview

| Dimension    | Payload CMS v3                          | Strapi v5                                   |
| ------------ | --------------------------------------- | ------------------------------------------- |
| License      | MIT (fully open source)                 | Free tier (Community) + Paid (Enterprise)   |
| Language     | TypeScript-first                        | JavaScript / TypeScript                     |
| Admin Panel  | Built with Next.js (fully customizable) | Built with React (customizable via plugins) |
| Database     | PostgreSQL, SQLite, MongoDB             | PostgreSQL, MySQL, SQLite, MongoDB          |
| API Style    | Local API (in-process) + REST + GraphQL | REST + GraphQL (via HTTP only)              |
| Hosting      | Self-hosted or Payload Cloud            | Self-hosted or Strapi Cloud                 |
| Config Style | Code-first (TypeScript config files)    | GUI-first (schema built in admin panel)     |
| Rich Text    | Lexical (structured AST)                | Blocks / Markdown / Custom                  |

---

### 5.2 Integration Model

| Aspect                     | Payload CMS                                     | Strapi                                              |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| **How NestJS talks to it** | Local API — direct in-process function calls    | HTTP REST API — network request to `localhost:1337` |
| **Overhead per request**   | Zero (no HTTP, no serialization)                | ~2–10ms per request (HTTP + JSON parse)             |
| **Deployment**             | Embedded in same NestJS process                 | Separate process / container                        |
| **Auth for API calls**     | Not needed (local API is trusted)               | API Token required on every request                 |
| **Startup time**           | ~1–2s extra (Payload initializes inside NestJS) | Separate server starts independently                |

> **Critical point for our architecture**: Payload can run **inside** the NestJS process via its Local API. This means content reads/writes are plain TypeScript function calls — no network, no serialization, no token management. Strapi always requires a separate HTTP call.

---

### 5.3 Developer Experience

| Aspect                    | Payload CMS                                   | Strapi                                            |
| ------------------------- | --------------------------------------------- | ------------------------------------------------- |
| **Schema definition**     | TypeScript files (code-reviewed, git-tracked) | Via admin GUI (generates JSON, harder to review)  |
| **Type safety**           | Full TypeScript types auto-generated          | Types available but schema defined in GUI         |
| **Custom business logic** | Hooks in TypeScript, co-located with schema   | Lifecycle hooks in `src/index.ts`, more separated |
| **Testing**               | Unit-testable (local API is a function)       | Requires HTTP mocking or running the server       |
| **Version control**       | Schema in git = full history                  | GUI changes may not be fully tracked              |
| **Learning curve**        | Steeper (TypeScript config, Lexical format)   | Gentler (GUI-first, visual setup)                 |

---

### 5.4 Feature Comparison

| Feature                    | Payload CMS                          | Strapi                                 |
| -------------------------- | ------------------------------------ | -------------------------------------- |
| Draft / Publish workflow   | ✅ Built-in                          | ✅ Built-in                            |
| Content versioning         | ✅ Built-in                          | ✅ (Enterprise only for some features) |
| Scheduled publishing       | ✅ Built-in (`publishAt` field)      | ⚠️ Requires plugin or custom logic     |
| Media library              | ✅ Built-in (local or cloud)         | ✅ Built-in (local or S3 plugin)       |
| Role-based access control  | ✅ Built-in, field-level             | ✅ Built-in, collection-level          |
| Field-level access control | ✅ Per field in schema               | ⚠️ Limited, requires custom logic      |
| Rich text editor           | ✅ Lexical (structured + extensible) | ✅ Blocks or Markdown                  |
| Multi-language / i18n      | ✅ Built-in                          | ✅ Built-in                            |
| GraphQL                    | ✅ Built-in                          | ✅ Via plugin                          |
| Custom admin views         | ✅ Full React/Next.js components     | ✅ Via injection zones                 |
| Plugin ecosystem           | Growing (newer)                      | Large (mature)                         |
| Webhooks                   | ✅ Built-in                          | ✅ Built-in                            |
| API response shape control | ✅ Via `select`, field config        | ⚠️ Limited without customization       |

---

### 5.5 Operational Comparison

| Aspect               | Payload CMS                                | Strapi                                   |
| -------------------- | ------------------------------------------ | ---------------------------------------- |
| **Infrastructure**   | Single process with NestJS                 | Two separate processes                   |
| **Memory footprint** | Shared with NestJS process                 | Independent ~200–400MB extra             |
| **Scaling**          | Scale NestJS container, CMS scales with it | Must scale NestJS + Strapi independently |
| **Database**         | Single PostgreSQL shared with app          | Separate or shared PostgreSQL            |
| **CI/CD**            | One build, one deploy                      | Two separate build & deploy pipelines    |
| **Docker**           | One Dockerfile                             | Two Dockerfiles or Compose               |
| **Cold start**       | Slightly slower (Payload init)             | Two services must both start             |

---

### 5.6 What We Observed in the POC

| Observation               | Payload                                          | Strapi                                      |
| ------------------------- | ------------------------------------------------ | ------------------------------------------- |
| Setup complexity          | Higher (ESM migration needed, schema collisions) | Lower (standard install, separate server)   |
| API call speed            | Instant (in-process)                             | Fast but adds network hop                   |
| Content normalization     | Lexical format needs custom renderer             | Returns HTML/Markdown, easier to display    |
| Admin for content editors | Disabled in POC; can be re-enabled               | Fully functional admin at `/admin`          |
| Debugging                 | Harder (Payload internals + NestJS)              | Easier (two isolated services)              |
| Code maintainability      | Schema in TypeScript = clean, testable           | Schema in GUI, harder to diff in PR reviews |

---

## 6. Recommendation: Which CMS to Use for Our Project

### Our Architecture Requirements (recap)

- **Frontend**: Next.js (custom built — Public Website, Member Portal, Super Admin)
- **Backend**: NestJS (APIs consumed by frontend)
- **CMS role**: Content Engine only — NestJS calls CMS, stores/fetches content
- **No CMS Admin Panel usage** — all content management UI is custom Next.js

### Decision: **Payload CMS**

---

### Why Payload CMS

#### 1. Zero HTTP Overhead (Local API)

Since CMS admin panel is not used, and NestJS is the sole consumer of the CMS, Payload's Local API is a significant advantage. Every article fetch/create is a **direct TypeScript function call** — no serialization, no token auth, no network latency. At scale, this compounds.

```typescript
// Payload Local API — no HTTP, no token, instant
const articles = await payload.find({
  collection: "articles",
  where: { status: { equals: "published" } },
});
```

#### 2. Code-First Schema = Team-Friendly

Schema is defined in TypeScript files, committed to git, and code-reviewed like any other code. Adding a field is a PR. No one can change the schema via a GUI without it being traceable.

```typescript
// Articles.ts — git-tracked, type-safe, reviewable
{
  name: 'publishAt',
  type: 'date',
  label: 'Scheduled Publish Date',
}
```

#### 3. Single Process = Simpler Infrastructure

One NestJS application, one Docker container, one deployment. No need to manage, monitor, and scale a separate Strapi server. This matters for DevOps simplicity.

#### 4. TypeScript End-to-End

Payload generates TypeScript types from your schema. NestJS is TypeScript. Your custom Next.js frontend is TypeScript. The entire stack is type-safe with no JSON bridge weaknesses.

#### 5. Field-Level Access Control

For a system with Public Website, Member Portal, and Super Admin — different roles need different field visibility. Payload supports this declaratively per field, per collection, without custom guards.

#### 6. Content Versioning Built-In

For articles and pages managed by editors, version history comes for free with Payload. Reverting a published article to a previous draft is handled without any custom code.

---

### Why Not Strapi (For Our Case)

| Reason                        | Detail                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **HTTP overhead**             | Every NestJS → Strapi call is a network request. At 100 requests/sec, this adds measurable latency and a failure point.                    |
| **Two-process deployment**    | NestJS + Strapi must both run, be monitored, scaled, and deployed independently. Doubles infrastructure complexity.                        |
| **GUI-based schema**          | Schema changes happen in the Strapi admin panel, generating JSON files. These are hard to code-review and can be accidentally overwritten. |
| **Admin panel not used**      | The main advantage of Strapi (its polished admin UI) is not used in our architecture. We lose the benefit but keep the cost.               |
| **API token management**      | Every backend call to Strapi requires managing and rotating API tokens across environments. Payload's local API skips this entirely.       |
| **Weaker TypeScript support** | Strapi's type generation is available but less tight than Payload's native TypeScript-first design.                                        |

---

### When Strapi Would Be the Right Choice

Strapi makes more sense if:

- Content editors need a **standalone GUI** to manage content (separate team, non-developers)
- The application does **not have a single backend** (multiple services, microservices)
- You need a **plugin ecosystem** for features like translations, SEO preview, or media CDN that Strapi's marketplace already covers
- The team is more comfortable with **GUI-configured schemas** than TypeScript config files

---

## 7. Summary Table

| Criteria                                                   | Payload CMS                         | Strapi                        |
| ---------------------------------------------------------- | ----------------------------------- | ----------------------------- |
| **Fits our architecture** (NestJS + Next.js, no CMS admin) | ✅ Best fit                         | ⚠️ Works but adds overhead    |
| **Performance** (no HTTP for content ops)                  | ✅ Local API                        | ❌ HTTP call per request      |
| **Infrastructure simplicity**                              | ✅ Single process                   | ❌ Two processes              |
| **TypeScript / Code-first**                                | ✅ Native                           | ⚠️ Partial                    |
| **Version control friendly**                               | ✅ Schema in git                    | ⚠️ GUI schema harder to track |
| **Content editor admin UI**                                | ⚠️ Available but we're not using it | ✅ Polished, mature           |
| **Plugin ecosystem**                                       | ⚠️ Newer, smaller                   | ✅ Large, mature              |
| **Learning curve**                                         | ⚠️ Steeper                          | ✅ Gentler                    |
| **Open source (no paid tier needed)**                      | ✅ MIT                              | ⚠️ Some features are paid     |

---

## 8. CMS Component Library

One of the core deliverables of this POC is a **reusable block/component library** built into the CMS content model and the Next.js frontend. Page content is assembled by composing these blocks — editors (via custom UI) pick and arrange blocks; the CMS stores the structured data; the frontend renders them.

All 13 components below are **already implemented** in the POC (`frontend/components/blocks/`).

---

### How Blocks Work

```
CMS Schema (Payload)           NestJS API           Next.js Frontend
─────────────────────          ──────────           ────────────────
Article.blocks = [             Returns              <BlockRenderer>
  { blockType: 'tabs', … }     blocks[]     →         <TabsBlock />
  { blockType: 'cta', … }      as JSON                <CTASectionBlock />
  { blockType: 'gallery', … }                         <GalleryBlock />
]                                                   </BlockRenderer>
```

Each block is a **typed Payload block definition** (TypeScript) + a **React component** on the frontend. Adding a new block = one schema file + one component.

---

### Existing Components (POC-built)

#### 1. Rich Text

|                     |                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `RichTextEditor.tsx`                                                                                                                                       |
| **Recommended use** | Formatted content — headings, paragraphs, lists, links, inline code                                                                                        |
| **Notes**           | Enforce heading hierarchy (H2 → H3, no skipping); restrict arbitrary inline styles to Super Admin role only; allow anchor `id` attributes for deep-linking |

---

#### 2. Accordion

|                     |                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `AccordionBlock.tsx`                                                                                                        |
| **Recommended use** | FAQs for programs (Insurance, Coaching, Supplier programs)                                                                  |
| **Notes**           | Allow anchor IDs on each item for direct linking; support a limited set of nested blocks per panel (Rich Text, Media/Video) |

---

#### 3. Tabs

|                     |                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `TabsBlock.tsx`                                                                                                            |
| **Recommended use** | Segmented page content — Event pages (Overview / Agenda / Speakers / Hotel), Program pages (Benefits / Offers / Resources) |
| **Notes**           | Each tab panel supports nested blocks: Rich Text, Accordion, Media/Video, Downloads, CTA; do not allow infinite nesting    |

---

#### 4. Two-Column Layout

|                     |                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `TwoColumnBlock.tsx`                                                                                                                                                                           |
| **Recommended use** | Image + explanation (program benefit with supporting image), side-by-side comparisons (membership tiers), callout + resource (left: explanation, right: downloads/CTA)                         |
| **Notes**           | Two variants: **Image + Rich Text** and **Rich Text + Rich Text**; responsive stacking on mobile; each column supports a limited block set (Rich Text, Accordion, Media/Video, Downloads, CTA) |

---

#### 5. Downloads

|                     |                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Component**       | `DownloadsBlock.tsx`                                                                                                                                                                 |
| **Recommended use** | Doctors-only resources; Supplier resources (price lists, warranty docs, promo kits); Event resources (agenda PDF, slide decks, certificates); Member-only gated resources            |
| **Notes**           | Support multiple files per block; permission-aware rendering (public vs. member-only based on user role); document preview where possible; track download analytics (file ID + page) |

---

#### 6. Gallery

|                     |                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `GalleryBlock.tsx`                                                                                                                     |
| **Recommended use** | Event photo recaps (NTE West highlights), training day photo collections                                                               |
| **Notes**           | Bulk upload support; SEO alt text required per image; handle both portrait and landscape orientations; auto-rotate EXIF-flagged images |

---

#### 7. Media / Video

|                     |                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `MediaVideoBlock.tsx`                                                                                                                        |
| **Recommended use** | Training videos (how-to, coaching, benchmarking walkthroughs); Supplier product demos; Leadership announcements; Marketing template previews |
| **Notes**           | Supports both **embed** (YouTube/Vimeo URL) and **direct upload**; responsive player; track plays and completions where feasible             |

---

#### 8. Card Box / Box Container

|                     |                                                                                                                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `CardBoxBlock.tsx`                                                                                                                                                                                                                                                                             |
| **Recommended use** | Program hub/module navigation, speaker profiles                                                                                                                                                                                                                                                |
| **Notes**           | Two variants: **with image** (image + title + description + CTA) and **without image** (title + description + CTA); grid layout (2–4 columns on desktop, stack on mobile); consistent card height/spacing with truncated descriptions; standard image crop/aspect ratio; optional CTA per card |

---

#### 9. CTA Section

|                     |                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Component**       | `CTASectionBlock.tsx`                                                                                         |
| **Recommended use** | Become a member / request a quote / book a call; Register for event / apply for a program                     |
| **Notes**           | One required primary CTA button; one optional secondary CTA; supports heading + supporting text above buttons |

---

### Additional Components (POC-built)

#### 10. Carousel

|                     |                                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `CarouselBlock.tsx`                                                                                                                                             |
| **Recommended use** | Speaker/facilitator cards on event pages; featured resources (top downloads, newest templates); supplier spotlights/promotions                                  |
| **Notes**           | Image carousel where each slide links to a URL; also supports Card Box content in a carousel format; consistent card height/spacing; truncate long descriptions |

---

#### 11. Pull Quote

|                     |                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `PullQuoteBlock.tsx`                                                                                                  |
| **Recommended use** | Member success stories, program testimonials (Insurance, Coaching, Benchmarking), partner/supplier endorsement quotes |
| **Notes**           | Two variants: **text only** (quote + attribution) and **text with image** (quote + attribution + headshot/logo)       |

---

#### 12. Logo Wall / Brands

|                     |                                                                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `LogoWallBlock.tsx`                                                                                                                                                           |
| **Recommended use** | Supplier partner logo grid, event sponsor logos                                                                                                                               |
| **Notes**           | Enforce consistent logo sizing (max height) so the grid stays visually uniform; alt text required on every logo; consistent external link handling; optional linking per logo |

---

#### 13. Code Snippet / Embed

|                     |                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Component**       | `CodeSnippetBlock.tsx`                                                                                                                                        |
| **Recommended use** | Embed partner forms (event registration, surveys, applications); embed third-party tools and widgets (scheduling, calculators, sponsor content)               |
| **Notes**           | Prefer `<iframe>` embeds (safe, sandboxed); script-based embeds restricted to Super Admin role only; responsive embed wrapper that scales correctly on mobile |

---

### Component Summary

| #   | Component            | Status   | Key Constraint                                     |
| --- | -------------------- | -------- | -------------------------------------------------- |
| 1   | Rich Text            | ✅ Built | Restrict inline styles; enforce heading order      |
| 2   | Accordion            | ✅ Built | Anchor IDs; nested Rich Text + Media               |
| 3   | Tabs                 | ✅ Built | Nested block set per panel                         |
| 4   | Two-Column Layout    | ✅ Built | 2 variants; responsive stacking                    |
| 5   | Downloads            | ✅ Built | Permission-aware; analytics tracking               |
| 6   | Gallery              | ✅ Built | Bulk upload; alt text; orientation handling        |
| 7   | Media / Video        | ✅ Built | Embed + upload; play tracking                      |
| 8   | Card Box             | ✅ Built | 2 variants; grid layout                            |
| 9   | CTA Section          | ✅ Built | Primary + optional secondary CTA                   |
| 10  | Carousel             | ✅ Built | Image + card variants                              |
| 11  | Pull Quote           | ✅ Built | Text-only + with-image variants                    |
| 12  | Logo Wall            | ✅ Built | Sizing rules; alt text; optional links             |
| 13  | Code Snippet / Embed | ✅ Built | iframe preferred; script restricted to Super Admin |

---

## 9. Final Verdict

> **Use Payload CMS as the content engine behind NestJS.**

The POC demonstrated that embedding Payload via its Local API inside NestJS eliminates HTTP overhead, keeps the stack to a single deployable process, and provides schema-as-code that fits a developer-first team workflow. All the CMS features we need (draft/publish, versioning, scheduling, rich text, media, access control) are available out of the box without the operational cost of running a second service.

Strapi's admin panel — its strongest differentiator — is not part of our architecture. Without that, we'd be paying the cost of a separate service without using its key benefit.

**Architecture to carry forward:**

```
Next.js (Custom UI — Public / Member Portal / Super Admin)
         ↓
    NestJS Backend (APIs)
         ↓
    Payload CMS (Local API — Content Engine)
         ↓
    PostgreSQL (Single DB)
```

---

_Document covers: POC outcomes, CMS-as-content-engine benefits, Payload vs Strapi comparison, recommendation for the project, and the full CMS component library (13 blocks)._
