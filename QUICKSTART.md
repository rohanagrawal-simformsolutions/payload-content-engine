# Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE payload_nestjs;
\q

# Or using createdb
createdb payload_nestjs
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/payload_nestjs
JWT_SECRET=your-super-secret-jwt-key-change-this
PAYLOAD_SECRET=your-payload-secret-key-change-this
PORT=3000
```

### 4. Run the Application

```bash
npm run start:dev
```

You should see:

```
✓ Payload CMS initialized as content engine
🚀 Application is running on: http://localhost:3000
```

## Test the API

### Step 1: Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

You'll receive a response with an `access_token`. Copy it!

### Step 2: Create an Article (Protected)

Replace `YOUR_TOKEN` with the token from step 1:

```bash
curl -X POST http://localhost:3000/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My First Article",
    "slug": "my-first-article",
    "content": {
      "root": {
        "children": [{
          "children": [{
            "text": "Hello from Payload CMS!",
            "type": "text"
          }],
          "type": "paragraph"
        }],
        "type": "root"
      }
    },
    "status": "published"
  }'
```

### Step 3: Get All Articles (Public)

```bash
curl http://localhost:3000/articles
```

### Step 4: Get Article by Slug (Public)

```bash
curl http://localhost:3000/articles/my-first-article
```

## Common Issues

### Database Connection Error

If you see a database connection error:

1. Make sure PostgreSQL is running
2. Verify your DATABASE_URL in `.env`
3. Check that the database exists

### Port Already in Use

If port 3000 is in use, change it in `.env`:

```env
PORT=3001
```

### JWT Errors

Make sure you're including the Bearer token in the Authorization header:

```
Authorization: Bearer your-token-here
```

## Next Steps

- Try creating draft articles (set `status: "draft"`)
- Draft articles won't appear in the public `/articles` endpoint
- Only published articles are publicly visible
- All admin operations require authentication

## Project Structure Summary

```
src/
├── auth/          # JWT authentication
├── content/       # Content management
├── payload/       # Payload instance helper
├── app.module.ts  # Root module
└── main.ts        # Application entry point

payload/
├── collections/   # Payload collections
└── payload.config.ts  # Payload configuration
```

Enjoy building with Payload CMS + NestJS! 🚀
