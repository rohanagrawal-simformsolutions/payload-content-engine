# R&D Findings & Proposed Approach

**Date:** March 2026  
**Purpose:** Share POC learnings, approach recommendation, LLD design, and code management plan

---

## 1. What We Set Out to Prove

The core question was: **should we use a CMS at all, and if yes — how?**

The project has two kinds of pages:

- **Fixed-layout pages** — pages where the layout and sections are designed and don't change (e.g. homepage, membership plans, contact page). These don't need a CMS.
- **Content-driven pages** — pages where editors need to add/update text, images, downloads, videos, and resources without a developer involved (e.g. training program details, marketing tips, doctor resource libraries). These benefit from a CMS.

The POC was built to test whether **Payload CMS** could serve as the content layer behind our NestJS backend — and whether that combination is worth it.

---

## 2. What Was Built in the POC

| What                          | Details                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Full stack running end-to-end | Next.js frontend → NestJS backend → Payload CMS → PostgreSQL                                   |
| User authentication           | Register / login with JWT tokens                                                               |
| Content management            | Create, edit, publish, delete articles — with rich text, images, drafts, and scheduled publish |
| Two CMS options compared      | Payload CMS (embedded in NestJS) vs Strapi (separate server)                                   |
| 13 reusable content blocks    | Accordion, Tabs, Downloads, Gallery, Cards, CTA, Video, Two-Column, Carousel, and more         |
| SEO fields                    | Meta title, meta description, Open Graph image — stored per content item                       |
| Role-aware rendering          | Content visible based on user role (public vs. member vs. admin)                               |

---

## 3. Key Findings from the POC

### 3.1 Payload CMS is the Right CMS for Our Architecture

We tested both Payload CMS and Strapi. Here is what stood out:

| What We Tested                  | Payload CMS                              | Strapi                                          |
| ------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| How NestJS talks to the CMS     | Direct function call — no HTTP, no delay | Network request to a separate server every time |
| Deployment                      | One application, one server              | Two applications, two servers to manage         |
| Schema management               | TypeScript files in git — code-reviewed  | Changed via admin UI — harder to track          |
| Built-in draft/publish/schedule | Yes, out of the box                      | Yes, but scheduling needs a plugin              |
| Built-in versioning             | Yes, out of the box                      | Enterprise plan only                            |
| TypeScript support              | Full, native                             | Partial                                         |

**Conclusion:** Strapi's biggest advantage is its polished admin panel. Since our admin panel is built custom in Next.js, we don't use that advantage — but we'd still pay the cost of running it as a separate server. Payload wins for our architecture.

### 3.2 The Block/Component Library Works Well

The 13 reusable content blocks built in the POC directly map to what the live website needs. An editor building a Training program page or a Marketing Tips article can compose the page by selecting blocks — without writing a single line of code. This is the core value of the CMS.

---

## 4. The Two Approaches — Analysis

### Option A: Fully Custom Solution

Build everything ourselves — database design, content schema, admin panel features, SEO handling — all in NestJS + Prisma.

| Pros                                 | Cons                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Complete control over every feature  | We rebuild what CMS gives for free (drafts, versioning, scheduling, hooks) |
| No dependency on a third-party CMS   | More time to build and more code to maintain long-term                     |
| Simpler if content needs are minimal | Any new field or content type = new migration + new API endpoint           |

**Fits if:** content requirements are simple, stable, and unlikely to change.  
**Doesn't fit well if:** editors need to manage rich, varied content — which is the case here.

---

### Option B: Hybrid — Custom + Payload CMS (Recommended)

Use NestJS + Prisma for everything fixed (auth, users, memberships, business logic). Use Payload CMS for the ~5 modules where content varies and editors need control.

| Pros                                                       | Cons                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Fast to build — CMS handles drafts, versioning, SEO fields | Two content strategies in one codebase (needs clear boundaries)   |
| Content editors can update pages without developer         | SEO must be handled consistently across both custom and CMS pages |
| Payload is embedded in NestJS — no second server           | Team must understand when to use CMS vs custom                    |
| All blocks from POC are ready to use                       | Slight learning curve for Payload schema definitions              |

**Fits well for:** this project, because most pages are fixed-layout, but a defined set of modules need content flexibility.

---

## 5. Recommendation: Hybrid Approach

**Use custom NestJS + Prisma for fixed modules. Use Payload CMS for the 5 content-heavy modules.**

The boundary is simple:

- **Custom code** = anything with fixed structure, business logic, or transactional data (users, memberships, orders, etc.)
- **Payload CMS** = anything where an editor needs to update content, add downloads, publish articles, or compose pages from blocks

Both live in the **same NestJS application**. No second server. One codebase, one deployment.

---

## 6. LLD — Module-by-Module Design

### The 5 Modules Going into Payload CMS

Based on the sample URLs provided, here is how each module maps to the technical design:

---

#### Module 1: Doctors Only — Resources

**Sample pages:**

- `/doctors-only/doctors-resources/price-lists`
- `/doctors-only/doctors-resources/employee-benefits`

**What these pages contain:**  
Downloadable documents (price lists, benefit guides), descriptive text, and possibly a two-column layout with explanations.

**How it works:**

```
Payload CMS
└── Collection: DoctorsResources
    ├── title
    ├── slug
    ├── category (price-list | employee-benefits | other)
    ├── description [Rich Text block]
    ├── files [Downloads block — multiple PDFs/docs]
    ├── accessLevel: doctors-only
    ├── seo { metaTitle, metaDescription, ogImage }
    └── status: draft | published
```

**Who manages it:** Admins upload new price lists or benefit docs via the custom admin panel (Next.js). No developer needed.  
**SEO:** Stored per resource in Payload. NestJS API returns SEO fields. Next.js renders them as `<head>` meta tags.

---

#### Module 2: Training Programs

**Sample page:**

- `/member/programs/training/in-office-programs/specialized-training/mastering-myopia`

**What these pages contain:**  
Program title, overview, rich text description, video (embedded or uploaded), downloadable materials, and possibly a CTA to register.

**How it works:**

```
Payload CMS
└── Collection: TrainingPrograms
    ├── title
    ├── slug
    ├── programType (in-office | virtual | specialized)
    ├── blocks [composed from block library]
    │   ├── Rich Text (overview)
    │   ├── Media/Video (training video)
    │   ├── Downloads (workbooks, handouts)
    │   ├── Accordion (FAQs)
    │   └── CTA Section (register / apply)
    ├── accessLevel: member-only
    ├── seo { metaTitle, metaDescription, ogImage }
    └── status: draft | published
```

**Who manages it:** Training team creates a new program, adds content blocks, attaches a video and PDF, and hits Publish.  
**SEO:** Each training program has its own meta title and description. Structured data (schema.org Course) can be added at the NestJS API layer.

---

#### Module 3: Business Coaching

**Sample pages:**

- `/member/programs/practice-support/otto-optics-partnership`
- `/member/programs/business-coaches/business-management/`
- `/member/programs/business-coaches/business-management/big-business-idea-group`

**What these pages contain:**  
A hub overview page (Business Management), individual program pages (Big Business Idea Group), and partnership/support pages (Otto Optics). Mix of descriptive content, cards, and possibly event/group details.

**How it works:**

```
Payload CMS
└── Collection: CoachingPrograms
    ├── title
    ├── slug
    ├── programType (hub | individual | partnership)
    ├── parentProgram [relationship → CoachingPrograms]  ← links sub-programs to hubs
    ├── blocks [composed from block library]
    │   ├── Rich Text (overview)
    │   ├── Card Box (coaches, program options)
    │   ├── Two-Column Layout (program benefit + image)
    │   ├── Pull Quote (testimonial)
    │   └── CTA Section (book a call / apply)
    ├── accessLevel: member-only | public
    ├── seo { metaTitle, metaDescription, ogImage }
    └── status: draft | published
```

**Key design note:** The `parentProgram` relationship field links sub-pages (Big Business Idea Group) to their hub (Business Management). This allows navigation breadcrumbs and sub-page listings to be built dynamically without hardcoding URLs.

---

#### Module 4: Marketing Support

**Sample pages:**

- `/member/programs/marketing/marketing-assets/customizable-video-content`
- `/member/programs/marketing/marketing-tips/should-i-be-tiktok`

**What these pages contain:**  
Two distinct content types — **Marketing Assets** (downloadable/embeddable resources like video templates) and **Marketing Tips** (editorial articles with SEO value).

**How it works:**

```
Payload CMS

└── Collection: MarketingAssets
    ├── title
    ├── slug
    ├── assetType (video | template | guide | toolkit)
    ├── blocks
    │   ├── Media/Video (preview or demo)
    │   ├── Downloads (the asset files)
    │   └── CTA Section (customise / request)
    ├── accessLevel: member-only
    ├── seo { metaTitle, metaDescription, ogImage }
    └── status: draft | published

└── Collection: MarketingTips (Blog/Articles)
    ├── title
    ├── slug
    ├── author
    ├── publishedAt
    ├── tags
    ├── blocks
    │   ├── Rich Text (main article body)
    │   ├── Pull Quote (highlight)
    │   └── CTA Section (related resource or newsletter)
    ├── accessLevel: public | member-only
    ├── seo { metaTitle, metaDescription, ogImage }
    └── status: draft | published | scheduled
```

**Note on Marketing Tips:** These articles have real SEO value. They are the most SEO-sensitive content type. Scheduled publishing, meta fields, canonical URLs, and Open Graph images are critical here.

---

#### Module 5: (Reserved — to be identified)

One more module to be confirmed based on project scope. Likely a candidate: **Events** or **Supplier/Partner Programs**, both of which show the same content composition patterns.

---

### What Stays Custom (NestJS + Prisma)

| Feature                       | Why Custom                                            |
| ----------------------------- | ----------------------------------------------------- |
| User registration & login     | Business logic, password hashing, JWT — not CMS scope |
| Membership tiers and access   | Transactional data — belongs in Prisma/PostgreSQL     |
| Doctor/member profiles        | Structured relational data, not content               |
| Navigation and site structure | Fixed layout — doesn't change with content            |
| Notifications / emails        | Business process — not CMS scope                      |
| Payments / billing (if any)   | Strictly transactional — never inside a CMS           |
| Super Admin — user management | Custom admin panels for managing users and roles      |

---

## 7. SEO Strategy — The Concern Addressed

**The concern:** SEO needs to work consistently whether a page is custom-built or Payload-managed.

**How we solve it:**

Every Payload collection has a dedicated `seo` group field:

```
seo {
  metaTitle      → <title> tag
  metaDescription → <meta name="description">
  ogImage        → Open Graph image for social sharing
  canonicalUrl   → prevents duplicate content issues
  noIndex        → hide from search engines if needed
}
```

Every NestJS API response includes these SEO fields. Every Next.js page — whether it renders a custom fixed page or a CMS-managed content page — uses the **same SEO component** to inject these into the `<head>`.

**One rule for the entire frontend:**

```
Every page (custom or CMS) passes SEO data into <SeoHead /> component.
SeoHead renders: <title>, <meta description>, <og:title>, <og:image>, <canonical>.
```

This means:

- A custom Membership Plans page → developer sets the SEO values in the page component
- A CMS-managed Training Program page → SEO values come from Payload, rendered by the same `<SeoHead />` component
- No inconsistency. Same pattern everywhere.

**Sitemap:** Auto-generated at the NestJS layer. Queries both Prisma (for fixed pages) and Payload (for CMS pages). Returns one unified `/sitemap.xml`.

---

## 8. Code Management Plan

### 8.1 Single Repository, Clear Boundaries

Everything lives in one monorepo. The separation between custom and CMS is structural — not scattered.

```
project/
├── src/                        ← NestJS backend (custom logic)
│   ├── auth/                   ← Login, JWT, user management
│   ├── content/                ← API layer — routes, controllers
│   │   ├── modules/
│   │   │   ├── training/       ← Training module (calls Payload Local API)
│   │   │   ├── coaching/       ← Coaching module
│   │   │   ├── marketing/      ← Marketing assets + tips
│   │   │   └── doctors/        ← Doctors-only resources
│   ├── users/                  ← Custom user/member management
│   └── seo/                    ← Sitemap generation, SEO utilities
│
├── payload/                    ← All Payload CMS schema definitions
│   ├── collections/
│   │   ├── TrainingPrograms.ts
│   │   ├── CoachingPrograms.ts
│   │   ├── MarketingAssets.ts
│   │   ├── MarketingTips.ts
│   │   └── DoctorsResources.ts
│   └── blocks/                 ← 13 reusable block definitions
│
├── prisma/                     ← Custom database schema (users, memberships)
│   └── schema.prisma
│
└── frontend/                   ← Next.js (custom UI for all portals)
    ├── app/
    │   ├── (public)/           ← Public website pages
    │   ├── (member)/           ← Member portal pages
    │   └── (admin)/            ← Super admin pages
    ├── components/
    │   ├── blocks/             ← 13 reusable block components (already built)
    │   └── SeoHead.tsx         ← Shared SEO component used by all pages
    └── lib/
        └── api.ts              ← All API calls to NestJS
```

### 8.2 Rules That Prevent Future Complexity

The concern about mixing modules becoming complicated is valid. Here are the rules we follow:

| Rule                                                                                                              | What It Prevents                                    |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Custom pages don't call Payload directly** — they always go through NestJS                                      | No scattered Payload calls across the frontend      |
| **Payload collections are only for content** — no user data, no memberships, no payments                          | CMS stays clean and focused                         |
| **Every new CMS module gets its own collection file** — never dump everything in one collection                   | Easy to find, easy to delete if a module is retired |
| **All SEO fields follow the same shape** — `{ metaTitle, metaDescription, ogImage, canonicalUrl }`                | Consistent rendering, easy to audit                 |
| **The 13 block components are shared** — the same `<AccordionBlock />` works in Training, Coaching, and Marketing | No duplicate components                             |
| **Access control is defined in the Payload schema** — not scattered in frontend conditionals                      | One place to change permissions                     |

### 8.3 Adding a New Module (How Easy Is It?)

If a new content module is needed in the future:

1. Create a new collection file in `payload/collections/` → defines the schema
2. Create a new NestJS controller + service in `src/content/modules/` → exposes the API
3. Create a new page in `frontend/app/` → calls the API, renders blocks using existing components
4. SEO is automatic — the collection inherits the standard SEO field group

No database migrations. No new infrastructure. The block library is already built — pick and compose.

---

## 9. Summary — Conclusions

| Topic               | Conclusion                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **CMS choice**      | Payload CMS — embedded in NestJS, no second server, TypeScript-first, all features needed are built-in                             |
| **Approach**        | Hybrid — custom for fixed/transactional modules, Payload for the 5 content-heavy modules                                           |
| **SEO**             | Handled consistently via a single SEO field group on every Payload collection and a shared `<SeoHead />` component on the frontend |
| **Code management** | Single repo, clear folder structure, strict rules — custom and CMS never cross into each other's territory                         |
| **Block library**   | 13 components already built in the POC — ready to use across all 5 CMS modules                                                     |
| **Risk of mixing**  | Mitigated by the rules above — clear boundaries prevent the codebase from becoming messy over time                                 |
| **Effort to build** | Hybrid is the fastest path — CMS handles drafts, scheduling, versioning, media, and access control for free                        |

---
