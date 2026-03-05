# Author Relationship Implementation Guide

## Overview

Instead of syncing NestJS users to Payload, we store the author as a **UUID reference** in the articles collection. The backend populates full author details from the NestJS Prisma users table.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js)                 │
│  - Create/Edit form with author dropdown       │
│  - Fetches users from GET /users               │
│  - Sends authorId (UUID) in article payload    │
│  - Displays author name on detail page         │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│          Backend (NestJS)                       │
│                                                │
│  GET /users                                    │
│  └─ Fetch from Prisma users table              │
│     Return: [{id, email, name}, ...]           │
│                                                │
│  POST /admin/articles (with authorId)          │
│  └─ Store authorId (UUID string) in Payload    │
│                                                │
│  GET /articles/:slug                           │
│  └─ Fetch article from Payload (has authorId) │
│  └─ Lookup author in Prisma by ID             │
│  └─ Return article with full author object    │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│          Database (PostgreSQL)                  │
│                                                │
│  public.users (NestJS)                         │
│  ├─ id (UUID)                                  │
│  ├─ email (string, unique)                     │
│  ├─ name (string)                              │
│  └─ password, createdAt, updatedAt             │
│                                                │
│  payload.articles (Payload CMS)                │
│  ├─ id (UUID)                                  │
│  ├─ title, slug, content                       │
│  ├─ author (string/UUID) ← FK to public.users  │
│  └─ ... other fields                           │
│                                                │
│  No Payload users collection needed!           │
└─────────────────────────────────────────────────┘
```

---

## Backend Implementation

### 1. Payload Articles Schema (`payload/collections/Articles.ts`)

```typescript
{
  name: "author",
  type: "text",  // Simple text field, stores UUID string
  admin: {
    description: "User ID (UUID) of the article author",
  },
}
```

**Key Points**:

- Stores just the UUID string, not a relationship
- Payload doesn't validate that the UUID exists (OK, we handle this on NestJS side)

### 2. NestJS Content Service (`src/content/content.service.ts`)

**New Helper Method**:

```typescript
private async populateAuthorData(articles: any[]) {
  // Extract all unique author IDs
  const authorIds = articles
    .map((a) => a.author)
    .filter((id) => id != null);
  const uniqueIds = [...new Set(authorIds)];

  // Fetch all authors from Prisma in ONE query (efficient!)
  const authors = await this.prisma.user.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, email: true, name: true },
  });

  // Build lookup map
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));

  // Enhance each article with full author object
  return articles.map((article) => ({
    ...article,
    author: article.author ? authorMap[article.author] : null,
  }));
}
```

**Updated `getPublishedArticles()` & `getArticleBySlug()`**:

```typescript
// After fetching from Payload, populate author
const articlesWithAuthors = await this.populateAuthorData(articles.docs);
return { ...articles, docs: articlesWithAuthors };
```

**New `getUsers()` Method**:

```typescript
async getUsers() {
  try {
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    return users;
  } catch (error) {
    throw new BadRequestException("Failed to fetch users");
  }
}
```

### 3. NestJS Routes

```
GET    /users                      → Returns user list for dropdown
POST   /admin/articles             → Creates article (accepts authorId UUID)
PUT    /admin/articles/:id         → Updates article
DELETE /admin/articles/:id         → Deletes article
GET    /articles                   → Returns articles with populated author
GET    /articles/:slug             → Returns article with populated author
```

### 4. DTO Validation (`src/content/dto/create-article.dto.ts`)

```typescript
@IsOptional()
@IsString()
@IsUUID()
author?: string; // UUID reference to NestJS users table
```

---

## Frontend Implementation

### 1. Create Article Page (`frontend/app/articles/create/page.tsx`)

**Form State**:

```typescript
const [users, setUsers] = useState<User[]>([]);
const [formData, setFormData] = useState({
  // ... other fields
  author: "", // UUID string
});

interface User {
  id: string;
  email: string;
  name: string;
}
```

**Fetch Users on Mount**:

```typescript
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      // Auto-select current logged-in user
      if (!formData.author && user?.id) {
        setFormData((prev) => ({ ...prev, author: user.id }));
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };
  fetchUsers();
}, [user?.id]);
```

**Author Dropdown**:

```tsx
<select
  id="author"
  value={formData.author}
  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
>
  <option value="">Select an author</option>
  {users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.name} ({user.email})
    </option>
  ))}
</select>
```

### 2. Edit Article Page (`frontend/app/articles/[slug]/edit/page.tsx`)

Same implementation as create, plus fetch existing author:

```typescript
// In fetchArticle():
setFormData({
  // ...
  author: data.author?.id || "", // Handle both string and object formats
  // ...
});
```

### 3. Article Detail Page (`frontend/app/articles/[slug]/page.tsx`)

**Display Author**:

```tsx
{
  article.author && <span>By {article.author.name}</span>;
}
```

The author is already displayed (already implemented in detail page).

---

## API Request/Response Flow

### Create Article

```
POST /admin/articles (JWT required)

Request Body:
{
  "title": "My Article",
  "slug": "my-article",
  "content": {...},
  "author": "550e8400-e29b-41d4-a716-446655440000",
  "tags": ["AI", "CMS"],
  "status": "published"
}

Response:
{
  "id": "...",
  "title": "My Article",
  "author": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-03-05T..."
}
```

### Get Articles with Authors

```
GET /articles?page=1&limit=10

Response:
{
  "docs": [
    {
      "id": "...",
      "title": "Article 1",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john@example.com",
        "name": "John Doe"
      }
    }
  ],
  "totalDocs": 100,
  "page": 1
}
```

### Get Users for Dropdown

```
GET /users

Response:
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "jane@example.com",
    "name": "Jane Smith"
  }
]
```

---

## Benefits of This Approach

### ✅ Advantages

1. **No Data Sync** — Users defined once in Prisma, never duplicated
2. **Clean Separation** — Payload only stores UUID, not user data
3. **Performance** — Single batch query to Prisma (not N+1)
4. **Type Safety** — NestJS DTO validates UUID format
5. **Flexibility** — Author field optional, can be null
6. **Single Source of Truth** — User info always from Prisma

### ❌ Limitations

1. **Manual Population** — Must call `populateAuthorData()` after fetching articles
2. **No Referential Integrity at DB Level** — Payload doesn't enforce FK constraint (but it's OK, we validate)
3. **Deletion Handling** — Deleting a user doesn't automatically clear article authors (decide on your policy: keep author UUID, set to null, or prevent deletion if articles exist)

---

## Example Usage

### Frontend: Creating an Article

```
1. User loads /articles/create
2. Frontend calls GET /users → Dropdown populates
3. User selects "John Doe" (author)
4. User fills in title, content, etc.
5. Frontend sends POST /admin/articles with author="550e8400-..."
6. Backend stores article with authorId in Payload
7. Article created ✅
```

### Frontend: Viewing an Article

```
1. User navigates to /articles/my-article
2. Frontend calls GET /articles/my-article
3. Backend:
   a. Fetches article from Payload (has author="550e8400-...")
   b. Looks up user 550e8400-... in Prisma
   c. Returns article with author={id, email, name} object
4. Frontend displays "By John Doe" ✅
```

---

## Testing the Feature

### 1. Create User (via API or Prisma)

```bash
# Login/Register first
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123","name":"John Doe"}'
```

### 2. Fetch Users

```bash
curl http://localhost:3000/users
```

### 3. Create Article with Author

```bash
curl -X POST http://localhost:3000/admin/articles \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My Article",
    "slug":"my-article",
    "author":"<USER_ID>",
    "content":{...},
    "status":"published"
  }'
```

### 4. View Article with Author

```bash
curl http://localhost:3000/articles/my-article
# Response includes author: {id, email, name}
```

---

## Cleanup

✅ Removed: `payload/collections/Users.ts` (no longer needed)  
✅ Payload now stores only: `payload-users` (for Payload's internal auth, not related to articles)  
✅ NestJS manages: `public.users` (used for article authorship)

---

## Summary

| Aspect          | Before                  | After                                 |
| --------------- | ----------------------- | ------------------------------------- |
| Author Storage  | Relationship in Payload | UUID string in Payload                |
| Author Data     | Synced to Payload       | Lives in NestJS Prisma                |
| User Collection | Payload collection      | None (Payload doesn't manage users)   |
| API Route       | None                    | GET /users                            |
| Queries         | Payload joins           | Batch Prisma lookup                   |
| Data Freshness  | Eventually consistent   | Always fresh (Prisma source of truth) |
