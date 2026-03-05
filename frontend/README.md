# Content Management Frontend

Next.js frontend application for the Payload Content Engine.

## Features

- 🔐 User authentication (register & login)
- 📝 Create and publish articles
- 📖 Browse published articles
- 🔒 Protected routes for authenticated users
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- The NestJS backend running on http://localhost:3000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at http://localhost:3001

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Home page (article listing)
│   ├── login/
│   │   └── page.tsx        # Login page
│   ├── register/
│   │   └── page.tsx        # Registration page
│   └── articles/
│       ├── [slug]/
│       │   └── page.tsx    # Article detail page
│       └── create/
│           └── page.tsx    # Create article page (protected)
├── components/
│   ├── Navbar.tsx          # Navigation component
│   └── ProtectedRoute.tsx  # Auth guard component
├── contexts/
│   └── AuthContext.tsx     # Authentication context
└── lib/
    └── api.ts              # Axios API client
```

## API Endpoints Used

### Public Endpoints

- `GET /articles` - Get all published articles
- `GET /articles/:slug` - Get single article by slug

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Protected Endpoints (require JWT token)

- `POST /admin/articles` - Create new article

## Authentication Flow

1. User registers or logs in
2. JWT token and user data stored in localStorage
3. Token included in Authorization header for protected requests
4. ProtectedRoute component guards authenticated pages

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **React Context** - State management for auth
