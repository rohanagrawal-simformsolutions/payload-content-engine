# Full Stack Setup Guide

This guide will help you set up and run both the NestJS backend and Next.js frontend.

## Quick Start

### 1. Start the Backend (NestJS API)

```bash
# In the root directory
npm install
npm run start:dev
```

The backend will run on **http://localhost:3000**

### 2. Start the Frontend (Next.js)

```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:3001**

## Usage Guide

### 1. Register a New User

1. Open http://localhost:3001 in your browser
2. Click "Register" in the navigation bar
3. Fill in your name, email, and password
4. Submit the form

You'll be automatically logged in and redirected to the home page.

### 2. Create an Article

1. After logging in, click "Create Article" in the navigation bar
2. Fill in the article details:
   - **Title**: Your article title (slug will be auto-generated)
   - **Summary**: A brief description (optional)
   - **Body**: The main content of your article
   - **Tags**: Comma-separated tags (optional)
   - **Status**: Choose "Published" or "Draft"
3. Click "Create Article"

### 3. View Articles

- The home page displays all published articles
- Click on any article card to view its full content
- Articles show title, summary, author, publication date, and tags

### 4. Logout

- Click "Logout" in the navigation bar to sign out
- You'll still be able to view articles, but not create new ones

## Architecture

```
┌─────────────────────────────────────┐
│     Next.js Frontend (Port 3001)    │
│  - React Components                 │
│  - Auth Context (JWT)               │
│  - Tailwind CSS                     │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
               │ (axios)
┌──────────────▼──────────────────────┐
│     NestJS Backend (Port 3000)      │
│  - Auth Module (JWT)                │
│  - Content Module                   │
│  - Guards & Validation              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Payload CMS (Embedded)       │
│  - Local API Only                   │
│  - PostgreSQL Database              │
│  - Content Engine                   │
└─────────────────────────────────────┘
```

## API Endpoints

### Public Endpoints

| Method | Endpoint          | Description                                |
| ------ | ----------------- | ------------------------------------------ |
| GET    | `/articles`       | Get all published articles with pagination |
| GET    | `/articles/:slug` | Get single article by slug                 |

### Authentication Endpoints

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| POST   | `/auth/register` | Register new user           |
| POST   | `/auth/login`    | Login and receive JWT token |

### Protected Endpoints (Require JWT)

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| POST   | `/admin/articles` | Create new article |

## Features

### Backend (NestJS)

- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Protected routes with guards
- ✅ Article CRUD operations
- ✅ Payload CMS integration
- ✅ Input validation
- ✅ CORS enabled

### Frontend (Next.js)

- ✅ User registration and login
- ✅ JWT token management
- ✅ Protected routes
- ✅ Article listing
- ✅ Article detail view
- ✅ Article creation form
- ✅ Responsive design
- ✅ Auth context for state management

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/payload_db
PAYLOAD_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
PORT=3000
```

### Frontend

No environment variables needed for local development. The API URL is hardcoded to `http://localhost:3000`.

For production, create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Make sure the backend is running on port 3000
2. Check that CORS is enabled in `src/main.ts`
3. Verify the origin is set to `http://localhost:3001`

### Authentication Issues

If login/register doesn't work:

1. Check browser console for error messages
2. Verify the backend `/auth` endpoints are working (test with curl or Postman)
3. Clear localStorage: `localStorage.clear()`

### Article Creation Fails

If you can't create articles:

1. Make sure you're logged in (token in localStorage)
2. Check that the JWT token is being sent in the Authorization header
3. Verify the article data matches the required DTO structure

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:

- Backend: Changes to TypeScript files will restart the server
- Frontend: Changes to components will update instantly

### Debugging

- Backend logs appear in the terminal running `npm run start:dev`
- Frontend logs and errors appear in the browser console
- Use browser DevTools Network tab to inspect API calls

## Next Steps

Consider adding:

- Article editing and deletion
- User profile management
- Article categories
- Search functionality
- Comments system
- File uploads for images
- Rich text editor
- Admin dashboard
