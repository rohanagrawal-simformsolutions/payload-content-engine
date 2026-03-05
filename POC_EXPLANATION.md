# Payload CMS as Content Engine - POC Explanation & Analysis

## Executive Summary

This POC demonstrates a **headless Payload CMS** embedded in a **NestJS backend**, with a **Next.js frontend** that provides:

- User authentication (register/login)
- Create, read, update, delete (CRUD) articles via UI
- Rich text editing with image support
- Article versioning and draft management

**Key Question Answered**: Does Payload CMS provide ready-made benefits, or does the overhead outweigh the gains?

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    POC Application Stack                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Next.js 14)                                          │
│  ├─ /pages (App Router)                                         │
│  │  ├─ page.tsx (Article List)                                  │
│  │  ├─ /articles/[slug] (Article Detail + Edit/Delete)         │
│  │  ├─ /articles/create (Create Article)                        │
│  │  ├─ /login (Authentication)                                  │
│  │  └─ /register (Authentication)                               │
│  ├─ /components                                                 │
│  │  ├─ RichTextEditor (TipTap WYSIWYG)                          │
│  │  ├─ Navbar (Auth state UI)                                   │
│  │  ├─ ProtectedRoute (Auth guard)                              │
│  │  └─ AuthContext (JWT token management)                       │
│  └─ /lib/api.ts (Axios HTTP client)                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Backend (NestJS)                                               │
│  ├─ /auth                                                       │
│  │  ├─ auth.controller.ts → POST /auth/register, /auth/login   │
│  │  ├─ auth.service.ts → User CRUD via Prisma ORM              │
│  │  └─ jwt.strategy.ts → Bearer token validation               │
│  │                                                              │
│  ├─ /content                                                    │
│  │  ├─ content.controller.ts                                    │
│  │  │  ├─ GET /articles (list)                                  │
│  │  │  ├─ GET /articles/:slug (detail)                          │
│  │  │  ├─ POST /admin/articles (create) — JWT required          │
│  │  │  ├─ PUT /admin/articles/:id (update) — JWT required       │
│  │  │  └─ DELETE /admin/articles/:id (delete) — JWT required    │
│  │  ├─ content.service.ts → Article CRUD via Payload local API  │
│  │  └─ create-article.dto.ts → Validation (title, slug, etc)    │
│  │                                                              │
│  └─ /prisma                                                     │
│     ├─ prisma.service.ts → Database connection (@prisma/pg)    │
│     └─ prisma.module.ts → Dependency injection                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Database (PostgreSQL)                                          │
│  ├─ users (TypeORM/Prisma) → id, email, password, name         │
│  └─ articles (Payload CMS) → via Payload's local API            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## UI Flow & User Journey

### 1️⃣ **Authentication Flow** (No CMS involvement)

```
User → [Register Page] → NestJS /auth/register → Prisma → users table
         ↓ (email, password, name)
         [Create user, hash password, generate JWT]
         ↓
       [Token stored in localStorage]
         ↓
    [Redirect to /articles]
```

**What's Built Custom**: User registration, password hashing with bcrypt, JWT token generation, localStorage management.

**What CMS Provides**: Nothing (auth is outside CMS scope in this POC).

---

### 2️⃣ **Article Listing Page** (`/`)

```
┌────────────────────────────────────────────┐
│           Home / Articles Page             │
├────────────────────────────────────────────┤
│                                            │
│  ┌─ Articles Grid (3 columns) ─────────┐  │
│  │                                      │  │
│  │  ┌──────────────┐ ┌──────────────┐  │  │
│  │  │[Image]       │ │[Image]       │  │  │
│  │  │Article Title │ │Article Title │  │  │
│  │  │Summary...    │ │Summary...    │  │  │
│  │  │Date: 2026    │ │Date: 2026    │  │  │
│  │  │[✏️ Edit]     │ │[✏️ Edit]     │  │  │
│  │  │[🗑️ Delete]  │ │[🗑️ Delete]  │  │  │
│  │  │(visible only │ │(visible only │  │  │
│  │  │ if logged in)│ │ if logged in)│  │  │
│  │  └──────────────┘ └──────────────┘  │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  [+ Create Article] (Navbar, logged in)    │
│                                            │
└────────────────────────────────────────────┘

HTTP Flow:
  GET /articles → NestJS → Payload.find() → PostgreSQL → Response

Data Returned:
  {
    docs: [
      {
        id: "uuid",
        title: "Article Title",
        slug: "article-slug",
        summaryTitle: "Short summary",
        featuredImage: "data:image/png;base64,...",  ← Base64 stored
        tags: ["AI", "CMS"],
        createdAt: "2026-03-05T...",
        status: "published"
      }
    ]
  }
```

**What's CMS-Ready**:

- ✅ Draft/Published status filtering
- ✅ `createdAt` timestamp automatic
- ✅ Slug uniqueness enforcement
- ✅ Tags as array field

**What's Custom**:

- ❌ Featured image as base64 string (should use Payload's media library)
- ❌ Edit/Delete buttons handled by frontend
- ❌ Tag display logic to handle both string and `{id, tag}` formats

---

### 3️⃣ **Article Detail Page** (`/articles/[slug]`)

```
┌─────────────────────────────────────────────────────────┐
│         Article Detail View                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [← Back] [✏️ Edit] [🗑️ Delete]                        │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │                                                │   │
│  │      [Featured Image - Full Width h-96]       │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  Title: Article Title                                   │
│  Date: March 5, 2026                                    │
│  Tags: [AI] [CMS] [Prisma]                             │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  <h1>Article Headline</h1>                   │     │
│  │  <p>Rendered HTML from Lexical format</p>    │     │
│  │  <blockquote>                                │     │
│  │    Code blocks, lists, bold, italic work     │     │
│  │  </blockquote>                               │     │
│  │                                              │     │
│  │  HTML is parsed and displayed safely with    │     │
│  │  dangerouslySetInnerHTML (TipTap output)     │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘

HTTP Flow:
  GET /articles/article-slug → NestJS → Payload.findBySlug() → Response

Data Challenge (The Lexical Problem):
  content: {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "<h1>Bold Title</h1>",  ← HTML as text node
              format: 0
            }
          ]
        }
      ]
    }
  }

  → Custom renderLexicalContent() needed on frontend
  → detectHTML() to handle mixed content
  → dangerouslySetInnerHTML for safe rendering
```

**What's CMS-Ready**:

- ✅ Rich text Lexical format (structured, transformable)
- ✅ Slug-based retrieval (unique constraint enforced)
- ✅ Publish date + status logic

**What's Custom**:

- ❌ Lexical → HTML conversion (a 100-line renderer function)
- ❌ Handling HTML stored in text nodes (TipTap quirk)
- ❌ Edit/Delete button state and handlers
- ❌ Delete confirmation dialog

---

### 4️⃣ **Create Article Page** (`/articles/create`)

```
┌────────────────────────────────────────────────────┐
│         Create New Article                         │
├────────────────────────────────────────────────────┤
│                                                    │
│ Title: [Input field]                              │
│ Auto-generated slug: article-title                 │
│                                                    │
│ Featured Image:                                    │
│ [Upload Image] → Convert to base64 → Preview      │
│ [Remove Image]                                     │
│                                                    │
│ Summary Title: [Textarea]                         │
│                                                    │
│ Content (Rich Text Editor):                        │
│ ┌──────────────────────────────────────────────┐  │
│ │ [B] [I] [H1] [H2] [• List] [1. List] [</>]  │  │
│ ├──────────────────────────────────────────────┤  │
│ │  Type here... (TipTap editor)                │  │
│ │                                              │  │
│ │  Formatting: Bold, Italic, Headings,        │  │
│ │  Lists, Code blocks, Blockquotes            │  │
│ │                                              │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ Tags (comma-separated): [Input]                   │
│ Example: AI, CMS, NestJS                          │
│                                                    │
│ Status: [Dropdown: draft / published]             │
│                                                    │
│ ☑ Search Exclude (robots.txt)                     │
│ ☑ Promoted (featured section)                     │
│                                                    │
│ [Save Article] [Cancel]                           │
│                                                    │
└────────────────────────────────────────────────────┘

HTTP Flow:
  POST /admin/articles (JWT required)

Payload Sent:
  {
    title: "My New Article",
    slug: "my-new-article",
    summaryTitle: "Brief summary",
    content: {  ← Converted to Lexical format
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              { type: "text", text: "<h1>Title</h1>" }
            ]
          }
        ]
      }
    },
    featuredImage: "data:image/png;base64,iVBORw0KGg...",
    tags: ["AI", "CMS"],
    status: "published",
    searchExclude: false,
    promoted: true
  }

Response:
  { id: "uuid", createdAt: "...", status: "published" }
```

**What's CMS-Ready**:

- ✅ Status field (draft/published) — built into Payload
- ✅ Tag array handling
- ✅ Timestamp auto-generation (`createdAt`)
- ✅ Slug uniqueness validation

**What's Custom**:

- ❌ Rich text editor UI (TipTap component)
- ❌ Image upload + base64 encoding
- ❌ `convertToLexical()` function (wraps TipTap output)
- ❌ Slug auto-generation from title
- ❌ Form validation (DTO handles this)

---

### 5️⃣ **Edit Article Page** (`/articles/[slug]/edit`)

```
┌────────────────────────────────────────────────────┐
│         Edit Article                               │
├────────────────────────────────────────────────────┤
│                                                    │
│ [Same form as Create, pre-filled with data]       │
│                                                    │
│ Title: [My New Article]                           │
│ Slug: my-new-article (read-only)                   │
│                                                    │
│ Featured Image:                                    │
│ [Thumbnail preview]                               │
│ [Change Image] [Remove Image]                      │
│                                                    │
│ Content (Rich Text):                              │
│ [Pre-filled with existing content]                │
│                                                    │
│ [Update Article] [Cancel]                         │
│                                                    │
└────────────────────────────────────────────────────┘

HTTP Flow:
  1. GET /articles/my-new-article → Fetch current data
  2. PUT /admin/articles/uuid (JWT required) → Update

Challenge:
  Extracting HTML from Lexical for editing:
  - Must traverse nested structure
  - Collect text nodes
  - Re-wrap in TipTap format
  - Handle mixed content (HTML + plain text)
```

**What's CMS-Ready**:

- ✅ Payload handles the PUT update internally

**What's Custom**:

- ❌ Extracting content from Lexical for TipTap re-editing
- ❌ Image handling (fetch, preview, replace)
- ❌ Form state management

---

### 6️⃣ **Delete Article**

```
User clicks [🗑️ Delete] → Confirmation dialog appears

  "Are you sure you want to delete 'Article Title'?"
  [Cancel] [Confirm Delete]

If confirmed:
  DELETE /admin/articles/uuid (JWT required)
  → Payload deletes from DB
  → Frontend removes card from list
  → Redirect to home
```

**What's CMS-Ready**:

- ✅ Payload cascades deletes (if any relationships)

**What's Custom**:

- ❌ Confirmation UX
- ❌ Optimistic UI update

---

## Payload CMS: What's Ready-Made vs Custom

### 📦 What Payload Provides (Ready-Made)

| Feature                          | How It Appears                          | Custom Work Needed?          |
| -------------------------------- | --------------------------------------- | ---------------------------- |
| **Content Collection Schema**    | `Articles.ts` define once               | Minimal                      |
| **CRUD Operations**              | Via `globalThis.payload` API            | None                         |
| **Status Field (Draft/Publish)** | `status: 'draft' \| 'published'`        | None                         |
| **Timestamp Fields**             | `createdAt`, `updatedAt` auto-generated | None                         |
| **Slug Uniqueness**              | Index on slug field                     | None                         |
| **Validation**                   | Built-in validators                     | None                         |
| **Hooks/Lifecycle**              | `beforeChange`, `afterChange`           | Only if you use them         |
| **Rich Text Editor**             | Lexical (structured format)             | Convert to HTML for frontend |
| **Array Fields**                 | Tags, categories                        | Comes with DB support        |
| **Media Library**                | File upload & storage                   | **We bypassed this**         |

### ❌ What We Had to Build Custom

| Feature                     | Why                                         | Lines of Code |
| --------------------------- | ------------------------------------------- | ------------- |
| **Lexical → HTML Renderer** | POC architecture needs frontend to render   | ~80           |
| **Rich Text UI (TipTap)**   | Frontend editing needs a WYSIWYG editor     | ~100          |
| **Image Upload**            | Bypassed Payload media library (workaround) | ~50           |
| **Article Detail Page**     | Custom Next.js page + state                 | ~150          |
| **Edit/Delete Buttons**     | UI state + API calls                        | ~100          |
| **Authentication**          | User registration, JWT, Prisma              | ~200          |
| **Forms & Validation**      | NestJS DTOs, frontend form logic            | ~300          |

**Total Custom Code: ~1000 lines**  
**Payload Overhead: ~100 lines** (schema definition, service calls)

---

## CMS as Content Engine: Benefits Assessment

### ✅ **Actual Benefits in This POC**

1. **Zero Database Schema Migrations**
   - Define `Articles.ts` → Payload auto-creates table
   - No `CREATE TABLE` SQL or Prisma migrations
   - Add a field → Payload updates schema automatically

2. **Built-in Status & Publishing**

   ```ts
   // Payload handles this automatically
   { status: 'draft' } // hidden from public
   { status: 'published', publishAt: new Date() } // scheduled
   ```

3. **Rich Text as Structured Data**
   - Lexical AST format allows future transformation to Markdown, plain text, etc.
   - Raw TipTap HTML is harder to repurpose

4. **Relationship Fields** (could add in future)

   ```ts
   {
     name: 'author',
     type: 'relationship',
     relationTo: 'users'
   }
   // Payload auto-joins, prevents orphaned data
   ```

5. **Field-Level Access Control**
   ```ts
   fields: [
     {
       name: "title",
       type: "text",
       access: { create: isAdmin },
     },
   ];
   ```

### ❌ **Costs of This Approach**

| Cost                     | Impact                                            |
| ------------------------ | ------------------------------------------------- |
| **Two ORMs**             | Payload + Prisma coexist (complexity)             |
| **Lexical Rendering**    | Extra frontend work to display content            |
| **No Admin UI**          | You built your own UI anyway (defeat the purpose) |
| **Local API Wrapper**    | `globalThis.payload` feels hacky in NestJS        |
| **Media Library Unused** | Images as base64 strings instead                  |
| **Learning Curve**       | Payload schema syntax + Lexical format            |

---

## Verdict: When Payload CMS Earns Its Keep

### ✅ Use Payload CMS as Content Engine IF:

1. **You have content editors** who need a UI to create/edit content
2. **You need draft workflows** or scheduled publishing
3. **Content versioning** is important
4. **Media management** is critical
5. **You want multi-language support** without building it

**Example**: Blog platform where editors log into `/admin` → Use Payload's built-in UI

### ❌ Skip Payload CMS IF:

1. **All content is API-driven** (like this POC)
2. **No editors need a UI** (all devs or programmatic)
3. **You need custom content flows** that don't fit CMS paradigms
4. **Database schema is frequently custom** (complex relationships)

**Example**: This POC — use plain Prisma instead

---

## If We Rebuilt This Without Payload CMS

```prisma
// prisma/schema.prisma
model Article {
  id            String   @id @default(uuid())
  title         String
  slug          String   @unique
  content       String   // plain HTML from TipTap
  summaryTitle  String?
  featuredImage String?  // or URL to S3
  tags          String[] // plain array
  status        String   @default("draft")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Result**:

- ✅ No Lexical rendering needed
- ✅ Single ORM (just Prisma)
- ✅ Simpler service logic
- ✅ No `globalThis.payload` wrapper
- ❌ No built-in versioning
- ❌ No admin UI (still need to build one)
- ❌ No field-level access control (build custom)

---

## Summary: POC Conclusion

| Aspect               | This POC                    | Best Practice             |
| -------------------- | --------------------------- | ------------------------- |
| **CMS Admin UI**     | Disabled                    | Enable it (main benefit)  |
| **Content Storage**  | Payload                     | Use if editors exist      |
| **User Management**  | Prisma (separate)           | Correct choice            |
| **Rich Text Format** | Lexical                     | OK, adds complexity       |
| **Image Storage**    | Base64 strings              | Use Payload media library |
| **Frontend Effort**  | ~400 lines UI code          | Same regardless           |
| **Backend Effort**   | ~300 lines wrapping Payload | Lighter with plain Prisma |

**Recommendation for Real Project**:

```
If you have content editors:     → Use Payload CMS fully (enable admin UI)
If all API/developer-driven:     → Use plain Prisma (simpler stack)
If mixed (editors + API devs):   → Payload CMS for content + Prisma for users
```

This POC answered its question: **Payload CMS is only valuable if you use its built-in Admin UI.** Otherwise, the boilerplate isn't worth the benefits.

---

## Next Steps

1. **Decision**: Does your actual project have content editors?
2. **If YES**: Enable Payload's `/admin` route, use its media library, and connect your Next.js directly to its REST API
3. **If NO**: Replace Payload with plain Prisma Article model, store TipTap HTML directly, simplify the stack
