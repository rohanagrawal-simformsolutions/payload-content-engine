# Payload CMS + NestJS POC

A proof of concept demonstrating Payload CMS embedded inside a NestJS application with JWT authentication and a Next.js frontend.

## Architecture

- **NestJS backend** running on port 3000
- **Next.js frontend** running on port 3001
- **Payload CMS** initialized as a content engine (admin panel disabled, Local API only)
- **PostgreSQL** database with two isolated schemas:
  - `public` — owned by NestJS/Prisma (`users` table)
  - `payload` — owned by Payload CMS (`articles`, `blocks`, internal auth tables, etc.)
- **JWT authentication** for protected routes
- **Prisma** for user management (with migrations)
- **Prisma 7 + `@prisma/adapter-pg`** driver adapter
- Payload Local API for all content operations (no HTTP calls to Payload)
- **12 reusable content block types** managed through Payload collections

## Project Structure

```
payload-content-engine/
├── src/                          # NestJS backend
│   ├── auth/
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── content/
│   │   ├── dto/
│   │   │   ├── create-article.dto.ts
│   │   │   └── blocks.dto.ts
│   │   ├── content.controller.ts
│   │   ├── content.module.ts
│   │   ├── content.service.ts
│   │   └── download-proxy.controller.ts
│   ├── payload/
│   │   └── payload-instance.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
├── payload/                      # Payload CMS configuration
│   ├── collections/
│   │   ├── Articles.ts
│   │   └── blocks/
│   │       ├── AccordionBlock.ts
│   │       ├── CardBoxBlock.ts
│   │       ├── CarouselBlock.ts
│   │       ├── CodeSnippetBlock.ts
│   │       ├── CTASectionBlock.ts
│   │       ├── DownloadsBlock.ts
│   │       ├── GalleryBlock.ts
│   │       ├── LogoWallBlock.ts
│   │       ├── MediaVideoBlock.ts
│   │       ├── PullQuoteBlock.ts
│   │       ├── TabsBlock.ts
│   │       ├── TwoColumnBlock.ts
│   │       └── index.ts
│   └── payload.config.ts
├── prisma/                       # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── prisma.config.ts              # Prisma 7 config (datasource URL)
├── frontend/                     # Next.js frontend
│   ├── app/
│   │   ├── articles/
│   │   ├── blocks/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx
│   ├── components/
│   ├── contexts/
│   └── lib/
├── package.json
└── tsconfig.json
```

## Installation

1. **Clone and install backend dependencies:**

```bash
npm install
```

2. **Install frontend dependencies:**

```bash
npm run frontend:install
```

3. **Set up PostgreSQL database:**

Create a PostgreSQL database:

```bash
createdb payload_nestjs
```

4. **Configure environment variables:**

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/payload_nestjs
JWT_SECRET=your-super-secret-jwt-key-change-this
PAYLOAD_SECRET=your-payload-secret-key-change-this
PORT=3000
```

5. **Generate Prisma client:**

```bash
npx prisma generate
```

6. **Run database migrations:**

This creates the `public.users` table managed by Prisma:

```bash
npx prisma migrate dev --name create_users_table
```

> **Note:** The `public` schema (Prisma) and `payload` schema (Payload CMS) are completely isolated. Prisma only manages the `users` table; Payload manages all content tables under the `payload` schema automatically.

7. **Run the backend:**

```bash
npm run start:dev
```

The NestJS API will run on `http://localhost:3000`

8. **Run the frontend (in a separate terminal):**

```bash
npm run frontend:dev
```

The Next.js frontend will run on `http://localhost:3001`

## API Endpoints

All protected routes require `Authorization: Bearer <access_token>`.  
All routes accept an optional `?cms=payload` query parameter.

### Authentication

#### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Content (Articles)

| Method   | Route                         | Auth | Description                         |
| -------- | ----------------------------- | ---- | ----------------------------------- |
| `POST`   | `/admin/articles`             | ✅   | Create an article                   |
| `PUT`    | `/admin/articles/:id`         | ✅   | Update an article                   |
| `PUT`    | `/admin/articles/:id/publish` | ✅   | Publish a draft article             |
| `DELETE` | `/admin/articles/:id`         | ✅   | Delete an article                   |
| `GET`    | `/admin/articles`             | ✅   | Get all articles (any status)       |
| `GET`    | `/articles`                   | ❌   | Get published articles (public)     |
| `GET`    | `/articles/:slug`             | ❌   | Get article by slug (public)        |
| `GET`    | `/users`                      | ❌   | Get all users (for author dropdown) |

### Component Blocks

Each block type exposes four routes (example for `accordion`):

| Method   | Route                         | Auth |
| -------- | ----------------------------- | ---- |
| `POST`   | `/admin/blocks/accordion`     | ✅   |
| `PUT`    | `/admin/blocks/accordion/:id` | ✅   |
| `DELETE` | `/admin/blocks/accordion/:id` | ✅   |
| `GET`    | `/blocks/accordion`           | ❌   |

Available block types: `accordion`, `tabs`, `two-column`, `downloads`, `gallery`, `media-video`, `card-box`, `cta-section`, `carousel`, `pull-quote`, `logo-wall`, `code-snippet`

## Testing with cURL

### 1. Register a user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 2. Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the `access_token` from the response.

### 3. Create an article:

```bash
curl -X POST http://localhost:3000/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Hello World",
    "slug": "hello-world",
    "content": {
      "root": {
        "children": [
          {
            "children": [
              {
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "This is my first article!",
                "type": "text",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "paragraph",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "root",
        "version": 1
      }
    },
    "status": "draft"
  }'
```

### 4. Publish the article:

```bash
curl -X PUT http://localhost:3000/admin/articles/ARTICLE_ID/publish \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get published articles (no auth required):

```bash
curl http://localhost:3000/articles
```

### 6. Get article by slug:

```bash
curl http://localhost:3000/articles/hello-world
```

## Key Features

✅ NestJS backend + Next.js frontend  
✅ Payload CMS embedded as a content engine (admin panel disabled)  
✅ Isolated PostgreSQL schemas — `public` (Prisma) and `payload` (Payload CMS)  
✅ Prisma 7 with `@prisma/adapter-pg` driver adapter  
✅ Prisma migrations for the `users` table  
✅ JWT authentication with bcrypt password hashing  
✅ Protected admin routes, public reader routes  
✅ Payload Local API — no HTTP calls to Payload  
✅ 12 reusable content block types  
✅ Draft/Published article workflow with publish scheduling  
✅ Author data joined from Prisma `users` into Payload articles  
✅ CORS configured for frontend on port 3001

## Technologies Used

- **NestJS** — Main API framework
- **Payload CMS 3.x** — Content engine (Local API)
- **Next.js** — Frontend
- **PostgreSQL** — Database (dual-schema)
- **Prisma 7** — ORM for user management (`@prisma/client`, `@prisma/adapter-pg`)
- **@nestjs/jwt** + **passport-jwt** — JWT authentication
- **bcrypt** — Password hashing
- **Lexical** — Rich text editor (via Payload)

## Database Schema Layout

```
PostgreSQL
├── public schema   (managed by Prisma)
│   └── users
└── payload schema  (managed by Payload CMS)
    ├── articles
    ├── payload_users
    ├── accordion_blocks
    ├── tabs_blocks
    ├── two_column_blocks
    ├── downloads_blocks
    ├── gallery_blocks
    ├── media_video_blocks
    ├── card_box_blocks
    ├── cta_section_blocks
    ├── carousel_blocks
    ├── pull_quote_blocks
    ├── logo_wall_blocks
    └── code_snippet_blocks
```

## Notes

- Payload admin panel is disabled (`admin.disable: true`)
- Payload REST and GraphQL routes are not exposed
- All content operations use Payload Local API via `globalThis.payload`
- Payload CMS uses its own internal `payload-users` collection, completely separate from NestJS `users`
- The `payload` PostgreSQL schema isolates all Payload tables from the `public` schema
- Prisma 7 requires the datasource `url` to be set in `prisma.config.ts`, not in `schema.prisma`
- `gen_random_uuid()` is used for UUID generation (built-in Postgres 13+, no extension needed)
- CORS is configured for `http://localhost:3001` (Next.js frontend)

## Production Considerations

1. Use `npx prisma migrate deploy` instead of `migrate dev` in production
2. Store secrets in a secure vault (AWS Secrets Manager, etc.)
3. Tighten CORS to your actual frontend domain
4. Add rate limiting (`@nestjs/throttler`)
5. Add proper structured logging
6. Add error monitoring (Sentry, etc.)
7. Use connection pooling (PgBouncer or Prisma Accelerate)
8. Add input sanitization
9. Implement refresh tokens
10. Enable SSL for the database connection

## License

MIT
