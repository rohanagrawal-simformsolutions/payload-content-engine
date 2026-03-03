# Complete File List

## Root Files

### Configuration Files

- **package.json** - NPM dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **nest-cli.json** - NestJS CLI configuration
- **.gitignore** - Git ignore rules
- **.env.example** - Example environment variables
- **.env** - Local environment variables (git-ignored)

### Documentation Files

- **README.md** - Complete project documentation
- **QUICKSTART.md** - Quick start guide
- **ARCHITECTURE.md** - Architecture overview and diagrams
- **FILES.md** - This file

### Scripts

- **test-api.sh** - Automated API testing script

## Source Code Structure

### src/

Main NestJS application source code

#### Root Level

- **main.ts** - Application entry point, initializes NestJS and Payload CMS
- **app.module.ts** - Root module, imports all feature modules

#### src/auth/

Authentication module with JWT-based auth

- **auth.module.ts** - Auth module configuration
- **auth.service.ts** - Authentication business logic
- **auth.controller.ts** - Auth endpoints (register, login)
- **jwt.strategy.ts** - Passport JWT strategy
- **jwt-auth.guard.ts** - JWT authentication guard

##### src/auth/dto/

- **auth.dto.ts** - DTOs for registration and login

##### src/auth/entities/

- **user.entity.ts** - TypeORM user entity

#### src/content/

Content management module using Payload Local API

- **content.module.ts** - Content module configuration
- **content.service.ts** - Content business logic (uses Payload Local API)
- **content.controller.ts** - Content endpoints (create, list, get)

##### src/content/dto/

- **create-article.dto.ts** - DTO for creating articles

#### src/payload/

Payload CMS integration helpers

- **payload-instance.ts** - Payload instance initialization and caching

### payload/

Payload CMS configuration and collections

- **payload.config.ts** - Main Payload configuration

#### payload/collections/

- **Articles.ts** - Articles collection schema definition

## File Purposes

### Configuration Files

#### package.json

Defines project metadata, dependencies, and npm scripts:

- Dependencies: NestJS, Payload CMS, TypeORM, JWT, bcrypt, etc.
- Scripts: build, start, start:dev, start:debug, start:prod

#### tsconfig.json

TypeScript compiler configuration:

- Target: ES2021
- Module: CommonJS
- Decorators enabled
- Source maps enabled

#### nest-cli.json

NestJS CLI settings:

- Source root: src
- Build output cleanup

### Application Core

#### src/main.ts

Application bootstrap:

- Creates NestJS application
- Gets Express instance
- Initializes Payload CMS with same Express instance
- Makes Payload available globally
- Starts server on port 3000

#### src/app.module.ts

Root module:

- Imports ConfigModule for environment variables
- Configures TypeORM with PostgreSQL
- Imports AuthModule and ContentModule

### Authentication

#### src/auth/auth.module.ts

Auth module setup:

- Imports User entity
- Configures JWT with secret and expiry
- Provides AuthService and JwtStrategy

#### src/auth/auth.service.ts

Authentication logic:

- User registration with password hashing
- User login with credential verification
- JWT token generation
- User validation for protected routes

#### src/auth/auth.controller.ts

Auth endpoints:

- POST /auth/register - Register new user
- POST /auth/login - Login existing user

#### src/auth/jwt.strategy.ts

JWT validation strategy:

- Extracts JWT from Authorization header
- Validates token and retrieves user

#### src/auth/jwt-auth.guard.ts

Route protection:

- Guards protected routes
- Requires valid JWT token

#### src/auth/entities/user.entity.ts

User database schema:

- id (UUID)
- email (unique)
- password (hashed)
- name
- timestamps

### Content Management

#### src/content/content.module.ts

Content module setup:

- Provides ContentService and ContentController

#### src/content/content.service.ts

Content operations using Payload Local API:

- createArticle() - Create new article
- getPublishedArticles() - List published articles with pagination
- getArticleBySlug() - Get single published article

#### src/content/content.controller.ts

Content endpoints:

- POST /admin/articles - Create article (protected)
- GET /articles - List published articles (public)
- GET /articles/:slug - Get article by slug (public)

### Payload CMS

#### payload/payload.config.ts

Payload configuration:

- Admin panel disabled
- PostgreSQL adapter
- Lexical rich text editor
- Collections: Articles
- GraphQL disabled

#### payload/collections/Articles.ts

Articles collection schema:

- title (text, required)
- slug (text, required, unique)
- content (richText)
- status (select: draft/published)

#### src/payload/payload-instance.ts

Payload initialization:

- Caches Payload instance
- Initializes with Express app
- Global type declarations

## Database Structure

### Tables Managed by TypeORM

- **users** - User accounts for authentication

### Tables Managed by Payload

- **articles** - Article content
- **payload_preferences** - Payload system preferences
- **payload_migrations** - Migration history

## Environment Variables

Required in `.env`:

```
DATABASE_URL      - PostgreSQL connection string
JWT_SECRET        - Secret for JWT token signing
PAYLOAD_SECRET    - Secret for Payload encryption
PORT              - Application port (default: 3000)
```

## Scripts

### test-api.sh

Automated testing script that:

1. Registers a user
2. Creates a published article
3. Creates a draft article
4. Lists all published articles
5. Gets a single article by slug

Usage:

```bash
./test-api.sh
```

## Key Dependencies

### NestJS Packages

- @nestjs/common - Core NestJS functionality
- @nestjs/core - NestJS core
- @nestjs/platform-express - Express adapter
- @nestjs/jwt - JWT module
- @nestjs/passport - Passport integration
- @nestjs/typeorm - TypeORM integration
- @nestjs/config - Configuration module

### Payload CMS

- payload - Core Payload CMS
- @payloadcms/db-postgres - PostgreSQL adapter
- @payloadcms/richtext-lexical - Rich text editor

### Database & ORM

- typeorm - TypeORM for users table
- pg - PostgreSQL driver

### Authentication

- passport - Authentication middleware
- passport-jwt - JWT strategy
- bcrypt - Password hashing

### Validation

- class-validator - DTO validation
- class-transformer - Object transformation

## Development Workflow

1. Install dependencies: `npm install`
2. Configure `.env` file
3. Start development server: `npm run start:dev`
4. Test API with `./test-api.sh` or curl commands
5. Build for production: `npm run build`
6. Start production: `npm run start:prod`

## Total Files: 27

- Configuration: 5
- Documentation: 4
- Source code: 16
- Scripts: 1
- Environment: 1
