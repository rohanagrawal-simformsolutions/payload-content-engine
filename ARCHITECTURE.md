# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Node.js Application                │
│                         Port 3000                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   NestJS Framework                     │  │
│  │                                                         │  │
│  │  ┌──────────────┐    ┌──────────────┐                 │  │
│  │  │ AuthModule   │    │ContentModule │                 │  │
│  │  │              │    │              │                 │  │
│  │  │ - Register   │    │ - Create     │                 │  │
│  │  │ - Login      │    │ - List       │                 │  │
│  │  │ - JWT Auth   │    │ - Get By ID  │                 │  │
│  │  └──────┬───────┘    └──────┬───────┘                 │  │
│  │         │                   │                          │  │
│  │         │                   │                          │  │
│  │         ▼                   ▼                          │  │
│  │  ┌──────────────┐    ┌──────────────┐                 │  │
│  │  │   TypeORM    │    │Payload Local │                 │  │
│  │  │   (Users)    │    │     API      │                 │  │
│  │  └──────┬───────┘    └──────┬───────┘                 │  │
│  └─────────┼────────────────────┼─────────────────────────┘  │
│            │                    │                            │
│            │                    │                            │
│            ▼                    ▼                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Payload CMS (Content Engine)              │    │
│  │                                                      │    │
│  │  - Admin Panel: DISABLED                            │    │
│  │  - REST Routes: NOT EXPOSED                         │    │
│  │  - Collections: Articles                            │    │
│  │  - Rich Text: Lexical                               │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL Database  │
              │                        │
              │  ┌─────────────────┐  │
              │  │  users (TypeORM)│  │
              │  └─────────────────┘  │
              │  ┌─────────────────┐  │
              │  │articles (Payload│  │
              │  └─────────────────┘  │
              │  ┌─────────────────┐  │
              │  │Payload metadata │  │
              │  └─────────────────┘  │
              └───────────────────────┘
```

## Request Flow

### 1. Authentication Flow

```
Client
  │
  │ POST /auth/register or /auth/login
  │ { email, password, name }
  ▼
AuthController
  │
  │ Validate DTO
  ▼
AuthService
  │
  │ Hash password (bcrypt)
  │ Check DB via TypeORM
  ▼
PostgreSQL (users table)
  │
  │ Return user
  ▼
AuthService
  │
  │ Generate JWT token
  ▼
Client
  │
  │ Receive { access_token, user }
```

### 2. Create Article Flow (Protected)

```
Client
  │
  │ POST /admin/articles
  │ Authorization: Bearer <token>
  │ { title, slug, content, status }
  ▼
JwtAuthGuard
  │
  │ Verify JWT token
  │ Extract user from payload
  ▼
ContentController
  │
  │ Validate DTO
  ▼
ContentService
  │
  │ Call Payload Local API
  │ payload.create({ collection: 'articles', data: {...} })
  ▼
Payload CMS
  │
  │ Validate against collection schema
  │ Generate ID, timestamps
  ▼
PostgreSQL (articles table)
  │
  │ Insert article
  ▼
Client
  │
  │ Receive created article
```

### 3. Get Articles Flow (Public)

```
Client
  │
  │ GET /articles?page=1&limit=10
  │ (No authentication required)
  ▼
ContentController
  │
  │ Parse query params
  ▼
ContentService
  │
  │ Call Payload Local API
  │ payload.find({
  │   collection: 'articles',
  │   where: { status: 'published' }
  │ })
  ▼
Payload CMS
  │
  │ Query database
  │ Apply filters, pagination
  ▼
PostgreSQL (articles table)
  │
  │ Return published articles
  ▼
Client
  │
  │ Receive paginated articles
```

## Key Design Decisions

### 1. Single Express Instance

- NestJS and Payload share the same Express app
- Initialized in `main.ts`
- No separate servers or ports

### 2. Payload as Content Engine

- Admin panel disabled (`admin.disable = true`)
- REST routes not exposed to frontend
- All operations via Local API
- No HTTP overhead for internal operations

### 3. Shared Database

- Single PostgreSQL database
- TypeORM manages `users` table
- Payload manages `articles` and metadata tables
- No data duplication

### 4. JWT Authentication

- Stateless authentication
- Guards protect admin routes
- Public routes require no auth
- Published articles visible to all

### 5. Status-Based Access Control

- Draft articles: Not publicly accessible
- Published articles: Public endpoint
- All creation/updates: Require authentication

## API Endpoints Summary

| Method | Endpoint        | Auth Required | Description            |
| ------ | --------------- | ------------- | ---------------------- |
| POST   | /auth/register  | No            | Register new user      |
| POST   | /auth/login     | No            | Login user             |
| POST   | /admin/articles | Yes           | Create article         |
| GET    | /articles       | No            | Get published articles |
| GET    | /articles/:slug | No            | Get article by slug    |

## Security Features

✅ Password hashing with bcrypt
✅ JWT token-based authentication
✅ Protected admin routes with guards
✅ Input validation with class-validator
✅ Status-based content visibility
✅ Unique email constraint
✅ Unique slug constraint

## Database Tables

### users (TypeORM)

```sql
- id: UUID (primary key)
- email: VARCHAR (unique)
- password: VARCHAR (hashed)
- name: VARCHAR
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### articles (Payload)

```sql
- id: VARCHAR (primary key)
- title: TEXT
- slug: TEXT (unique)
- content: JSONB
- status: VARCHAR (draft/published)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### Payload Metadata Tables

- payload_preferences
- payload_migrations
- etc.
