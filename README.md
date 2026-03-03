# Payload CMS + NestJS POC

A proof of concept demonstrating Payload CMS embedded inside a NestJS application with JWT authentication.

## Architecture

- **Single Node.js application** running on port 3000
- **NestJS** as the main framework
- **Payload CMS** initialized as a content engine (admin panel disabled)
- **PostgreSQL** database shared between NestJS and Payload
- **JWT authentication** for protected routes
- **TypeORM** for user management
- Payload Local API for content operations (no HTTP calls)

## Project Structure

```
payload-content-engine/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   └── auth.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── content/
│   │   ├── dto/
│   │   │   └── create-article.dto.ts
│   │   ├── content.controller.ts
│   │   ├── content.module.ts
│   │   └── content.service.ts
│   ├── payload/
│   │   └── payload-instance.ts
│   ├── app.module.ts
│   └── main.ts
├── payload/
│   ├── collections/
│   │   └── Articles.ts
│   └── payload.config.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up PostgreSQL database:**

Create a PostgreSQL database:

```bash
createdb payload_nestjs
```

3. **Configure environment variables:**

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

4. **Run the application:**

```bash
npm run start:dev
```

The application will run on `http://localhost:3000`

## API Endpoints

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

### Content Management

#### Create Article (Protected)

```bash
POST /admin/articles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "My First Article",
  "slug": "my-first-article",
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
              "text": "This is the article content.",
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
  "status": "published"
}
```

#### Get All Published Articles (Public)

```bash
GET /articles?page=1&limit=10
```

Response:

```json
{
  "docs": [
    {
      "id": "1",
      "title": "My First Article",
      "slug": "my-first-article",
      "content": { ... },
      "status": "published",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

#### Get Article by Slug (Public)

```bash
GET /articles/my-first-article
```

Response:

```json
{
  "id": "1",
  "title": "My First Article",
  "slug": "my-first-article",
  "content": { ... },
  "status": "published",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Testing with cURL

### 1. Register a user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
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
    "status": "published"
  }'
```

### 4. Get published articles (no auth required):

```bash
curl http://localhost:3000/articles
```

### 5. Get article by slug:

```bash
curl http://localhost:3000/articles/hello-world
```

## Key Features

✅ Single Node.js application
✅ NestJS as main framework
✅ Payload CMS embedded (admin panel disabled)
✅ Shared PostgreSQL database
✅ JWT authentication
✅ Protected admin routes
✅ Public article endpoints
✅ Payload Local API (no HTTP calls)
✅ TypeORM for user management
✅ Password hashing with bcrypt
✅ Draft/Published article status

## Technologies Used

- **NestJS** - Main framework
- **Payload CMS 3.x** - Content engine
- **PostgreSQL** - Database
- **TypeORM** - ORM for user management
- **@nestjs/jwt** - JWT authentication
- **@nestjs/passport** - Authentication strategies
- **bcrypt** - Password hashing
- **Lexical** - Rich text editor (Payload)

## Notes

- Payload admin panel is disabled (`admin.disable = true`)
- Payload REST routes are not exposed
- All content operations use Payload Local API
- TypeORM `synchronize: true` is only for development
- Change to `synchronize: false` and use migrations in production
- Both NestJS and Payload share the same PostgreSQL database
- Only authenticated users can create articles
- Only published articles are publicly visible

## Production Considerations

1. Set `synchronize: false` in TypeORM configuration
2. Use proper database migrations
3. Store secrets in secure vault (AWS Secrets Manager, etc.)
4. Enable CORS appropriately
5. Add rate limiting
6. Add proper logging
7. Add error monitoring (Sentry, etc.)
8. Use connection pooling for database
9. Add input sanitization
10. Implement refresh tokens

## License

MIT
