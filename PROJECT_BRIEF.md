# Payload CMS + NestJS Integration POC

## What We Achieved

Successfully embedded **Payload CMS v3 as a pure content engine** inside a NestJS application, creating a single-process architecture where:

- ✅ **Single Node.js application** running on port 3000
- ✅ **NestJS handles authentication** (JWT + Passport) with TypeORM user management
- ✅ **Payload manages content** via Local API (no admin panel, zero HTTP overhead)
- ✅ **Shared PostgreSQL** with schema isolation (`public` for users, `payload` for content)
- ✅ **Rich content model** with SEO metadata, tags, scheduled publishing, sitemap settings
- ✅ **Protected admin routes** (JWT-guarded) and public endpoints for published content

### API Endpoints Delivered

- `POST /auth/register` & `/auth/login` - User authentication with bcrypt
- `POST /admin/articles` (protected) - Create articles with full metadata
- `GET /articles` (public) - Paginated published articles with scheduling filters
- `GET /articles/:slug` (public) - Single article retrieval

## Technical Challenges Faced & Resolved

### 1. **ESM/CommonJS Incompatibility**

**Problem**: Payload v3 uses top-level `await` (ESM-only). Node threw `ERR_REQUIRE_ASYNC_MODULE` when NestJS compiled to CommonJS.  
**Solution**: Migrated entire project to ESM (`"type": "module"`, `module: "NodeNext"`), added `.js` extensions to all relative imports.

### 2. **Database Table Collisions**

**Problem**: TypeORM's `users` table conflicted with Payload's default `users` collection, causing migration prompts and `ALTER TABLE` errors.  
**Solution**: Configured Payload with `schemaName: "payload"` to isolate all Payload tables into a separate PostgreSQL schema.

### 3. **JWT Secret Mismatch (401 on Every Request)**

**Problem**: `JwtModule.register()` read `process.env.JWT_SECRET` during ESM module evaluation (before `dotenv.config()`), falling back to default. Tokens signed with one secret, verified with another.  
**Solution**: Switched to `JwtModule.registerAsync()` to defer factory execution until after ConfigModule loads environment variables.

### 4. **Payload Admin Panel Conflict**

**Problem**: Initial requirement was "no admin panel," but Payload v3 always creates a `users` auth collection by default.  
**Solution**: Disabled admin panel entirely (`admin.disable = true`) and created isolated `payload-users` collection to prevent interference with NestJS auth.

## Stack

**NestJS 10** (ESM) • **Payload CMS 3** (Local API) • **PostgreSQL** (schema isolation) • **TypeORM** + **Drizzle** • **JWT** + **Passport** • **Lexical Editor**

## Result

A production-ready architecture demonstrating how to use Payload CMS as a headless content engine within an existing NestJS application, with complete separation of concerns and zero HTTP overhead for content operations.
