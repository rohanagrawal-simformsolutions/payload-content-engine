# Payload CMS + NestJS Integration POC

## Overview

This POC demonstrates **Payload CMS v3 embedded inside a NestJS application** as a pure content engine, with JWT-based authentication and a shared PostgreSQL database. The architecture ensures complete separation between user authentication (NestJS) and content management (Payload) while maintaining a single Node.js application.

## Key Architecture Highlights

### 🏗️ Single Application Design

- **One Node.js process** running on port 3000
- NestJS serves as the main framework
- Payload CMS initialized via Local API (no admin panel, no REST routes exposed)
- Shared PostgreSQL database with **schema isolation**:
  - `public` schema → NestJS/TypeORM manages `users` table
  - `payload` schema → Payload manages `articles`, `payload_users`, and system tables

### 🔐 Authentication Architecture

- **JWT-based authentication** using `@nestjs/jwt` and Passport
- Custom user management via TypeORM
- Protected admin routes with `JwtAuthGuard`
- Public endpoints for published content (no auth required)

### 📝 Content Management

- **Payload Local API** for all content operations (no HTTP overhead)
- Rich content model with extended metadata:
  - Core: title, slug, content (Lexical rich text)
  - SEO: meta tags, search exclusion
  - Organization: tags, URL aliases
  - Publishing: draft/published status with scheduled publishing/unpublishing
  - Discoverability: XML sitemap settings, promotion flags
- Only published, scheduled content visible on public endpoints

## Implemented Features

### Authentication Endpoints

- `POST /auth/register` - User registration with bcrypt password hashing
- `POST /auth/login` - JWT token generation

### Content Endpoints

- `POST /admin/articles` (protected) - Create articles with full metadata
- `GET /articles` (public) - List published articles with pagination
- `GET /articles/:slug` (public) - Retrieve single article by slug

### Content Fields

- **Basic**: title, slug, rich text content, status (draft/published)
- **Metadata**: tags, dashboard URL, summary title
- **SEO**: meta title, description, image, search exclusion
- **Sitemap**: inclusion settings, change frequency
- **Publishing**: scheduled publish/unpublish dates
- **Organization**: URL alias, author, promotion flag

## Technical Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | NestJS 10.x (ESM)                       |
| Content Engine | Payload CMS 3.x                         |
| Database       | PostgreSQL with schema isolation        |
| ORM            | TypeORM (user auth) + Drizzle (Payload) |
| Authentication | JWT with Passport                       |
| Rich Text      | Lexical Editor                          |
| Validation     | class-validator, class-transformer      |
| Runtime        | Node.js v18+ with ES Modules            |

## Key Technical Decisions

### 1. ESM-Only Architecture

- Switched from CommonJS to ESM (`"type": "module"`, `module: "NodeNext"`)
- Required for Payload v3 compatibility (uses top-level await)
- All relative imports use explicit `.js` extensions

### 2. Schema Isolation

- Payload configured with `schemaName: "payload"`
- Prevents table name collisions between TypeORM and Payload
- Eliminates migration conflicts and interactive prompts

### 3. Async JWT Configuration

- Used `JwtModule.registerAsync()` to defer secret loading
- Ensures ConfigModule loads `.env` before JWT initialization
- Prevents sign/verify secret mismatch (401 errors)

### 4. Scheduled Publishing Logic

- Public queries filter by `publishAt` ≤ now AND (`unpublishAt` > now OR null)
- Draft articles never appear in public endpoints
- Future-scheduled content automatically becomes visible at publish time

### 5. Local API Only

- `admin.disable = true` in Payload config
- All content operations use `payload.create()`, `payload.find()` (no HTTP)
- Zero network overhead for internal operations

## Project Structure

```
payload-content-engine/
├── src/
│   ├── auth/              # JWT authentication (TypeORM users)
│   ├── content/           # Content management (Payload Local API)
│   ├── payload/           # Payload instance initialization
│   ├── app.module.ts      # Root module (ConfigModule, TypeORM, modules)
│   └── main.ts            # Bootstrap NestJS + Payload
├── payload/
│   ├── collections/       # Payload collection schemas
│   └── payload.config.ts  # Payload configuration
├── package.json           # Dependencies + ESM config
├── tsconfig.json          # TypeScript NodeNext config
└── .env                   # Environment variables
```

## Database Schema

### public.users (TypeORM)

- id (UUID), email (unique), password (bcrypt), name
- Managed by NestJS for authentication

### payload.articles (Payload)

- id, title, slug (unique), content (JSONB)
- tags (array), meta (group), sitemap (group)
- publishAt, unpublishAt, author, promoted
- Managed by Payload Local API

### payload.payload_users (Payload)

- Internal Payload auth collection (isolated from NestJS auth)

## Environment Configuration

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/payload_nestjs
JWT_SECRET=your-jwt-secret
PAYLOAD_SECRET=your-payload-secret
PORT=3000
```

## Success Criteria Met

✅ Single Node.js application (not multiple servers)  
✅ NestJS as main framework  
✅ Payload initialized in `main.ts` via Local API  
✅ Shared PostgreSQL with schema isolation  
✅ Payload admin panel disabled  
✅ REST routes not exposed to frontend  
✅ JWT authentication with protected routes  
✅ TypeORM user management  
✅ bcrypt password hashing  
✅ Draft/published content visibility  
✅ Scheduled publishing support  
✅ Extended metadata (SEO, tags, sitemap, etc.)  
✅ Clean ESM architecture

## Performance Characteristics

- **Startup time**: ~1-2 seconds (includes DB schema sync)
- **Content operations**: Direct function calls (no HTTP serialization)
- **Authentication**: Stateless JWT (no session storage)
- **Scalability**: Horizontal (stateless), database connection pooling

## Future Enhancements

- Add image upload support with cloud storage
- Implement article versioning and revision history
- Add full-text search with PostgreSQL or Elasticsearch
- Create admin dashboard (SPA) using Payload REST API (optional)
- Add caching layer (Redis) for published articles
- Implement webhooks for content change notifications
- Add content localization/internationalization
- Create OpenAPI documentation for REST endpoints

---

**Built with**: TypeScript, NestJS, Payload CMS, PostgreSQL, TypeORM, JWT  
**License**: MIT
