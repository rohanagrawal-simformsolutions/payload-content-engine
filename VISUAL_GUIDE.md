# Visual Guide: Dual CMS Integration

## 🎨 User Interface Changes

### Navbar Update

```
Before:
┌─────────────────────────────────────────────────────┐
│ Content CMS  Articles  [Create Article]  [Logout]  │
└─────────────────────────────────────────────────────┘

After:
┌────────────────────────────────────────────────────────────┐
│ Content CMS  Articles  [Create Article]  CMS:             │
│                                         [Payload] [Strapi]  │
│                                         [User] [Logout]     │
└────────────────────────────────────────────────────────────┘
```

**CMS Switcher Component** appears in top-right navbar

- Active button: Blue background
- Inactive button: Gray background
- Clicking switches CMS + reloads page

## 🔄 Request Flow Diagram

```
User Interaction
    ↓
Frontend (Next.js)
    ├─ Get CMS from localStorage
    ├─ (or from user click on switcher)
    ├─ Store preference in localStorage
    └─ Trigger page reload
    ↓
Axios Interceptor
    ├─ Reads CMS from localStorage
    ├─ Appends ?cms=payload or ?cms=strapi
    ├─ Makes HTTP request
    └─ NestJS backend receives request
    ↓
NestJS Controller
    ├─ Receives cms query parameter
    ├─ Passes to ContentService
    └─ Returns response
    ↓
ContentService Router
    ├─ If cms == "strapi"
    │  └─ Call Strapi methods
    ├─ Else (default "payload")
    │  └─ Call Payload methods
    └─ Normalize response
    ↓
Response Back to Frontend
    ├─ Same format for both CMSs
    ├─ Components don't know source
    └─ Display articles
```

## 💾 Data Flow

### Payload Path

```
Frontend Form
    ↓
POST /admin/articles?cms=payload
    ↓
ContentController
    ↓
ContentService.createArticle(..., "payload")
    ↓
globalThis.payload.create()
    ↓
Payload Local API
    ↓
PostgreSQL (Payload DB)
```

### Strapi Path

```
Frontend Form
    ↓
POST /admin/articles?cms=strapi
    ↓
ContentController
    ↓
ContentService.createArticle(..., "strapi")
    ↓
strapiRequest() [HTTP POST]
    ↓
Strapi REST API (http://localhost:1337/api/articles)
    ↓
Strapi Backend
    ↓
PostgreSQL (Strapi DB)
```

## 🗂️ File Structure

### New/Modified Files

```
payload-content-engine/
├── src/
│   └── content/
│       ├── content.service.ts          [MODIFIED: +300 lines]
│       │   ├─ createArticleInStrapi()
│       │   ├─ updateArticleInStrapi()
│       │   ├─ deleteArticleInStrapi()
│       │   ├─ getPublishedArticlesFromStrapi()
│       │   ├─ getAllArticlesFromStrapi()
│       │   ├─ publishArticleInStrapi()
│       │   ├─ getArticleBySlugFromStrapi()
│       │   ├─ strapiRequest<T>()
│       │   ├─ mapStrapiArticle()
│       │   └─ mapStrapiCollectionResponse()
│       │
│       └── content.controller.ts       [MODIFIED: +cms param]
│           └─ Added @Query("cms") to all endpoints
│
├── frontend/
│   ├── lib/
│   │   ├── api.ts                      [MODIFIED: interceptor]
│   │   │   └─ Added request interceptor for cms param
│   │   │
│   │   └── cms.ts                      [NEW]
│   │       ├─ getCms()
│   │       ├─ setCms()
│   │       └─ localStorage integration
│   │
│   ├── contexts/
│   │   ├── CmsContext.tsx              [NEW]
│   │   │   ├─ CmsProvider component
│   │   │   └─ useCms() hook
│   │   │
│   │   └── AuthContext.tsx             [UNCHANGED]
│   │
│   ├── components/
│   │   ├── CmsSwitcher.tsx             [NEW]
│   │   │   └─ Payload/Strapi buttons
│   │   │
│   │   └── Navbar.tsx                  [MODIFIED: +CmsSwitcher]
│   │
│   └── app/
│       └── layout.tsx                  [MODIFIED: +CmsProvider]
│
├── STRAPI_INTEGRATION.md               [NEW]
├── DUAL_CMS_SUMMARY.md                 [NEW]
├── QUICK_START_STRAPI.md               [NEW]
├── IMPLEMENTATION_VERIFICATION.md      [NEW]
├── setup-strapi.sh                     [NEW]
└── start-all-with-strapi.sh            [NEW]
```

## 🔌 API Endpoint Mapping

### Without CMS Parameter (Default: Payload)

```
GET  /articles                          → Payload
GET  /articles/:slug                    → Payload
GET  /admin/articles                    → Payload
POST /admin/articles                    → Payload
PUT  /admin/articles/:id                → Payload
PUT  /admin/articles/:id/publish        → Payload
DELETE /admin/articles/:id              → Payload
```

### With cms=payload

```
GET  /articles?cms=payload              → Payload
GET  /articles/:slug?cms=payload        → Payload
GET  /admin/articles?cms=payload        → Payload
POST /admin/articles?cms=payload        → Payload
PUT  /admin/articles/:id?cms=payload    → Payload
PUT  /admin/articles/:id/publish?...    → Payload
DELETE /admin/articles/:id?cms=payload  → Payload
```

### With cms=strapi

```
GET  /articles?cms=strapi               → Strapi
GET  /articles/:slug?cms=strapi         → Strapi
GET  /admin/articles?cms=strapi         → Strapi
POST /admin/articles?cms=strapi         → Strapi
PUT  /admin/articles/:id?cms=strapi     → Strapi
PUT  /admin/articles/:id/publish?...    → Strapi
DELETE /admin/articles/:id?cms=strapi   → Strapi
```

## 🎯 Component Hierarchy

```
Root Layout
└── AuthProvider
    └── CmsProvider                     [NEW LAYER]
        └── Navbar
            ├── Navigation Links
            └── CmsSwitcher             [NEW COMPONENT]
        └── Main Content
            └── Page Components
                └── Uses getCms()
                    └── API calls
                        └── Interceptor
                            └── cms param added
```

## 📊 Response Format Comparison

### Payload Response

```json
{
  "id": "uuid-v4",
  "title": "Article Title",
  "slug": "article-slug",
  "content": { "root": { "children": [] } },
  "status": "published",
  "tags": ["tag1", "tag2"],
  "createdAt": "2025-03-05T10:00:00Z",
  "author": { "id": "...", "name": "...", "email": "..." }
}
```

### Strapi Response (raw)

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Article Title",
      "slug": "article-slug",
      "content": { "root": { "children": [] } },
      "publishedAt": "2025-03-05T10:00:00Z",
      "tags": ["tag1", "tag2"],
      "createdAt": "2025-03-05T10:00:00Z",
      "updatedAt": "2025-03-05T10:00:00Z"
    }
  }
}
```

### After Normalization (both)

```json
{
  "id": "1", // Converted to string
  "title": "Article Title",
  "slug": "article-slug",
  "content": { "root": { "children": [] } },
  "status": "published", // Derived from publishedAt
  "tags": ["tag1", "tag2"],
  "createdAt": "2025-03-05T10:00:00Z",
  "author": { "id": "...", "name": "...", "email": "..." }
}
```

**Frontend receives identical responses - no changes needed!**

## 🔐 Environment Setup

```bash
# .env.local (root directory)

# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=abc123xyz789...
```

## 🚀 Service Architecture

```
Port 3001 ─────────────┐
(Next.js)              │
                       ├──→ Port 3000 (NestJS)
Port 1337 ─────────────┤      │
(Strapi Admin)         │      ├──→ Strapi API
                       │      │   (Port 1337)
                       └──────→ Payload Local API
                               (In-process)
```

## 🧪 Testing Matrix

|                    | Payload                             | Strapi                                         |
| ------------------ | ----------------------------------- | ---------------------------------------------- |
| **Create**         | ✅ POST /admin/articles             | ✅ POST /admin/articles?cms=strapi             |
| **Read**           | ✅ GET /articles                    | ✅ GET /articles?cms=strapi                    |
| **Update**         | ✅ PUT /admin/articles/:id          | ✅ PUT /admin/articles/:id?cms=strapi          |
| **Delete**         | ✅ DELETE /admin/articles/:id       | ✅ DELETE /admin/articles/:id?cms=strapi       |
| **Publish**        | ✅ PUT /admin/articles/:id/publish  | ✅ PUT /admin/articles/:id/publish?cms=strapi  |
| **List Drafts**    | ✅ GET /admin/articles?status=draft | ✅ GET /admin/articles?status=draft&cms=strapi |
| **Single Article** | ✅ GET /articles/:slug              | ✅ GET /articles/:slug?cms=strapi              |

## 💭 Decision Flow

```
User clicks article create
    ↓
Frontend renders form
    ↓
User submits
    ↓
Frontend gets CMS from localStorage
    │ (or from button click if switching)
    ↓
API call: POST /admin/articles?cms=payload
    ↓
    ├─ cms=payload? → Payload.create()
    └─ cms=strapi?  → Strapi API POST
    ↓
Response normalized
    ↓
Frontend displays success
    ↓
Article visible in list
```

## 🎨 Browser Storage

```javascript
// What gets stored in localStorage
localStorage.getItem("cmsProvider")  // "payload" or "strapi"

// Visual state in navbar
Payload button:
  - Active: blue bg, white text
  - Inactive: gray bg, dark text

Strapi button:
  - Active: blue bg, white text
  - Inactive: gray bg, dark text
```

## 📈 Request Sequence Diagram

```
User                Frontend            Backend            CMS
 │                    │                   │                  │
 ├─ Click Create ────→ │                   │                  │
 │                    │ Get localStorage   │                  │
 │                    │ (cms="payload")    │                  │
 │                    │                    │                  │
 │                    ├─ POST /admin/articles?cms=payload ──→ │
 │                    │                    │                  │
 │                    │                    ├─ Route to Payload│
 │                    │                    │                  │
 │                    │                    │  Payload.create()
 │                    │                    │ ←─ Success ──────┤
 │                    │                    │                  │
 │                    │ ← Normalized Response                 │
 │                    │                    │                  │
 │ ← Display Success ─┤                    │                  │
 │                    │                    │                  │
```

## 🔄 Auto-Parameter Injection

```typescript
// Before request is sent
const config = {
  method: 'POST',
  url: '/admin/articles',
  data: { title: '...', slug: '...' }
}

// Interceptor runs
const cms = getCms()  // "payload" or "strapi"
config.params = { cms }

// After interceptor
const config = {
  method: 'POST',
  url: '/admin/articles',
  params: { cms: 'payload' },
  data: { title: '...', slug: '...' }
}

// Actual request sent
POST /admin/articles?cms=payload
```

---

This visual guide helps understand how the dual CMS system integrates at every level of the application stack!
