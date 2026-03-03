# Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Errors

#### Error: "connection refused" or "ECONNREFUSED"

**Problem:** PostgreSQL is not running or not accessible.

**Solutions:**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Or on macOS with Homebrew
brew services start postgresql
```

#### Error: "database does not exist"

**Problem:** Database hasn't been created yet.

**Solution:**

```bash
# Create the database
createdb payload_nestjs

# Or using psql
psql -U postgres
CREATE DATABASE payload_nestjs;
\q
```

#### Error: "password authentication failed"

**Problem:** Incorrect database credentials in `.env`.

**Solution:**
Update your `.env` file with correct credentials:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/payload_nestjs
```

### 2. Module Import Errors

#### Error: "Cannot find module '@nestjs/config'"

**Problem:** Dependencies not installed.

**Solution:**

```bash
npm install
```

#### Error: "Module not found: Error: Can't resolve 'payload'"

**Problem:** Payload CMS not properly installed.

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. TypeScript Compilation Errors

#### Error: "Cannot find name 'payload'"

**Problem:** Global Payload type declaration issue.

**Solution:**
The `payload-instance.ts` file already includes the global declaration. Make sure you're importing it in `main.ts`:

```typescript
import { getPayloadInstance } from "./payload/payload-instance";
```

#### Error: "Decorator errors"

**Problem:** TypeScript configuration issue.

**Solution:**
Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 4. JWT Authentication Issues

#### Error: "Unauthorized" when accessing protected routes

**Problem:** Missing or invalid token.

**Solutions:**

1. **Check token format:**

```bash
# Correct format
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NOT this
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Verify token is valid:**

```bash
# Login again to get a fresh token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

3. **Check JWT_SECRET consistency:**
   Make sure `JWT_SECRET` in `.env` hasn't changed since token was issued.

### 5. Payload CMS Errors

#### Error: "Payload is not defined"

**Problem:** Payload not initialized before use.

**Solution:**
Ensure the application has fully started before making requests. Wait for:

```
✓ Payload CMS initialized as content engine
🚀 Application is running on: http://localhost:3000
```

#### Error: "Collection 'articles' not found"

**Problem:** Payload collections not properly registered.

**Solution:**

1. Check `payload/payload.config.ts` imports the Articles collection
2. Verify the collection slug matches: `'articles'`
3. Restart the application

### 6. Validation Errors

#### Error: "email must be an email"

**Problem:** Invalid email format in request.

**Solution:**
Ensure email is valid:

```json
{
  "email": "user@example.com",  // ✓ Valid
  "password": "password123"
}

// NOT
{
  "email": "userexample.com",  // ✗ Invalid
  "password": "password123"
}
```

#### Error: "password must be longer than or equal to 6 characters"

**Problem:** Password too short.

**Solution:**
Use at least 6 characters:

```json
{
  "email": "user@example.com",
  "password": "password123" // ✓ Valid (11 chars)
}
```

### 7. Port Already in Use

#### Error: "EADDRINUSE: address already in use :::3000"

**Problem:** Port 3000 is already occupied.

**Solutions:**

1. **Change port in `.env`:**

```env
PORT=3001
```

2. **Kill process using port 3000:**

```bash
# Find process
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

3. **Use a different port temporarily:**

```bash
PORT=3001 npm run start:dev
```

### 8. Article Creation Issues

#### Error: "slug must be unique"

**Problem:** Article with that slug already exists.

**Solution:**
Use a different slug:

```json
{
  "title": "My Article",
  "slug": "my-article-2",  // Change this
  "content": { ... },
  "status": "published"
}
```

#### Error: "title is required"

**Problem:** Missing required field.

**Solution:**
Include all required fields:

```json
{
  "title": "Article Title",     // Required
  "slug": "article-slug",        // Required
  "content": { ... },            // Optional
  "status": "draft"              // Optional (defaults to draft)
}
```

### 9. Draft Articles Not Showing

**This is NOT an error!** It's expected behavior.

**Explanation:**

- Draft articles are only visible through admin endpoints
- Public `/articles` endpoint only returns published articles
- Change status to "published" to make them public

**Solution:**
Update article status when creating:

```json
{
  "title": "My Article",
  "slug": "my-article",
  "content": { ... },
  "status": "published"  // ← Set this to "published"
}
```

### 10. Rich Text Content Format

#### Error: Invalid content structure

**Problem:** Incorrect Lexical format.

**Solution:**
Use proper Lexical structure:

```json
{
  "content": {
    "root": {
      "children": [
        {
          "children": [
            {
              "text": "Your text here",
              "type": "text"
            }
          ],
          "type": "paragraph"
        }
      ],
      "type": "root"
    }
  }
}
```

## Debugging Tips

### 1. Enable Detailed Logging

Add to `main.ts`:

```typescript
app.useLogger(["error", "warn", "log", "debug", "verbose"]);
```

### 2. Check Database Tables

```bash
psql -U postgres -d payload_nestjs

# List all tables
\dt

# Check users table
SELECT * FROM users;

# Check articles table
SELECT id, title, slug, status FROM articles;

# Exit
\q
```

### 3. Verify Environment Variables

```bash
# In the application directory
cat .env

# Make sure DATABASE_URL, JWT_SECRET, and PAYLOAD_SECRET are set
```

### 4. Test with cURL

```bash
# Test health (if you add a health endpoint)
curl http://localhost:3000/

# Test public endpoint
curl http://localhost:3000/articles

# Test with verbose output
curl -v http://localhost:3000/articles
```

### 5. Check Application Logs

```bash
# Run in development mode with detailed logs
npm run start:dev

# Watch for:
# - Database connection status
# - Payload initialization
# - Any error messages
```

## Still Having Issues?

### Checklist

1. ✓ PostgreSQL is running
2. ✓ Database exists
3. ✓ `.env` file is configured correctly
4. ✓ Dependencies are installed (`npm install`)
5. ✓ Port 3000 is available
6. ✓ TypeScript compiles without errors
7. ✓ Application shows "Payload CMS initialized"

### Clean Restart

If all else fails, try a complete restart:

```bash
# 1. Stop the application (Ctrl+C)

# 2. Clean install
rm -rf node_modules package-lock.json dist
npm install

# 3. Reset database (CAUTION: deletes all data)
dropdb payload_nestjs
createdb payload_nestjs

# 4. Verify .env
cat .env

# 5. Start fresh
npm run start:dev
```

### Get Help

If you're still stuck:

1. Check the logs for specific error messages
2. Search GitHub issues for similar problems
3. Review the [Payload CMS docs](https://payloadcms.com/docs)
4. Review the [NestJS docs](https://docs.nestjs.com)

## Performance Tips

### 1. Database Connection Pooling

Update `app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  synchronize: false,  // Always false in production
  poolSize: 10,        // Add connection pooling
}),
```

### 2. Caching

For production, consider adding Redis caching for frequently accessed articles.

### 3. Indexes

The Articles collection already has an index on `slug`. Monitor query performance and add more indexes as needed.

## Security Reminders

1. Never commit `.env` to version control
2. Use strong secrets in production
3. Set `synchronize: false` in TypeORM for production
4. Enable CORS only for trusted origins
5. Add rate limiting for production
6. Keep dependencies updated
7. Use HTTPS in production
8. Implement refresh tokens for better security

---

**Last Updated:** 2024
