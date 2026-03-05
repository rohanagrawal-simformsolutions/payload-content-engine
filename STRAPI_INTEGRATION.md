# Strapi Integration Setup Guide

This guide explains how to set up and use Strapi CMS alongside the existing Payload CMS setup. The frontend can seamlessly switch between both CMSs without code changes.

## Architecture

The system is designed with **dual-CMS support**:

- **Payload CMS**: Default local-first content engine (existing)
- **Strapi CMS**: Optional external/self-hosted CMS

### Key Features

✅ **Single Frontend** - Works with both Payload and Strapi without changes  
✅ **Runtime CMS Selection** - Switch between Payload and Strapi via UI  
✅ **Payload Preserved** - Existing Payload integration remains unchanged  
✅ **Strapi Admin Enabled** - Strapi admin panel is fully functional for content management  
✅ **Unified API Layer** - NestJS backend abstracts both CMS APIs  
✅ **Browser Storage** - CMS selection persisted in localStorage

## Strapi Setup

### Installation

1. **Install Strapi** (if not already installed):

```bash
# In a separate directory
npx create-strapi-app@latest strapi-poc --quickstart
cd strapi-poc
npm run develop
```

Strapi admin will be available at `http://localhost:1337/admin`

### Create Articles Collection Type

1. Go to Strapi Admin (`http://localhost:1337/admin`)
2. Create Content-Type Builder → Create New Collection Type
3. Name it: **Articles** (slug: `articles`)
4. Add fields matching Payload schema:

| Field Name    | Type           | Required | Notes                      |
| ------------- | -------------- | -------- | -------------------------- |
| title         | String         | Yes      |                            |
| slug          | String         | Yes      | Unique                     |
| summaryTitle  | String         | No       |                            |
| content       | Rich Text      | No       | Lexical format supported   |
| featuredImage | String/Text    | No       | Base64 or URL              |
| tags          | JSON           | No       | Store as array             |
| author        | String/UUID    | No       | Reference to user/author   |
| dashboardUrl  | String         | No       |                            |
| meta          | JSON/Component | No       | title, description, image  |
| searchExclude | Boolean        | No       | Default: false             |
| sitemap       | JSON/Component | No       | inclusion, changeFrequency |
| urlAlias      | String         | No       |                            |
| publishAt     | Date           | No       |                            |
| unpublishAt   | Date           | No       |                            |
| promoted      | Boolean        | No       | Default: false             |
| status        | Enumeration    | No       | Values: draft, published   |

### Generate API Token

1. Go to Settings → API Tokens
2. Click "Create new API token"
3. Set permissions:
   - **Articles**: find, findOne, create, update, delete
   - **Users**: find, findOne
4. Copy the token and set it as environment variable

### Environment Configuration

Create a `.env.local` file in the project root (or update existing):

```bash
# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here
```

For production Strapi:

```bash
STRAPI_URL=https://your-strapi-instance.com
STRAPI_API_TOKEN=your_production_token
```

## Frontend Integration

### CMS Switching

A **CMS Switcher** component is added to the navbar. Users can toggle between:

- **Payload** (default)
- **Strapi**

The selection is stored in browser `localStorage` and automatically passed to all API requests via an axios interceptor.

### How It Works

1. **Frontend (`lib/cms.ts`)**: Manages CMS selection in localStorage
2. **API Layer (`lib/api.ts`)**: Automatically appends `cms` query parameter to requests
3. **Backend (`ContentService`)**: Routes to appropriate CMS implementation
4. **Auto Refresh**: Page reloads when CMS is switched (can be customized)

### Backend CMS Routing

The `ContentService` includes logic to handle both CMSs:

- If `cms=strapi` query param → Use Strapi API
- Otherwise → Use Payload CMS (default)

Example API calls:

```
GET /articles?cms=payload          # Fetch from Payload
GET /articles?cms=strapi           # Fetch from Strapi
POST /admin/articles?cms=strapi    # Create article in Strapi
GET /admin/articles?cms=payload    # Fetch admin articles from Payload
```

## API Compatibility

### Endpoints

All existing endpoints work with both CMSs:

| Endpoint                      | Method | Notes                             |
| ----------------------------- | ------ | --------------------------------- |
| `/articles`                   | GET    | List published articles           |
| `/articles/:slug`             | GET    | Get single article                |
| `/admin/articles`             | GET    | List all articles (authenticated) |
| `/admin/articles`             | POST   | Create article (authenticated)    |
| `/admin/articles/:id`         | PUT    | Update article (authenticated)    |
| `/admin/articles/:id`         | DELETE | Delete article (authenticated)    |
| `/admin/articles/:id/publish` | PUT    | Publish article (authenticated)   |
| `/users`                      | GET    | List users                        |

### Response Format

Both CMSs return normalized responses:

```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "content": "Lexical format or HTML",
  "status": "draft|published",
  "author": { "id", "name", "email" },
  "tags": ["tag1", "tag2"],
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Strapi API Notes

### Query Format

Strapi uses different query syntax than Payload:

- **Filters**: `filters[field][$eq]=value`
- **Pagination**: `pagination[page]=1&pagination[pageSize]=10`
- **Sorting**: `sort=field:desc`
- **Publication State**: `publicationState=preview` (for draft access)

The `ContentService` handles all query translation automatically.

### Publishing in Strapi

- `publishedAt` field determines publish status
- Empty `publishedAt` = Draft
- Set `publishedAt` to timestamp = Published
- Always pass `publicationState=preview` for admin endpoints

## Disabled Features (by design)

- Strapi admin is **NOT disabled** - fully functional
- All Strapi content management features available
- Use Strapi admin for public page content management
- NestJS API provides additional abstraction layer

## Configuration Customization

### Default CMS

To change default CMS from Payload to Strapi, update `frontend/lib/cms.ts`:

```typescript
const DEFAULT_CMS: CmsProvider = "strapi"; // Changed from "payload"
```

### Auto Refresh on Switch

To disable page refresh when switching CMSs, modify `frontend/contexts/CmsContext.tsx`:

```typescript
const changeCms = (newCms: CmsProvider) => {
  setCms(newCms);
  setCmsState(newCms);
  // Remove window.location.reload() to prevent refresh
};
```

### Custom Strapi URL per Environment

The system respects `STRAPI_URL` environment variable. For different environments:

**Development (.env.local)**:

```
STRAPI_URL=http://localhost:1337
```

**Production (.env.production)**:

```
STRAPI_URL=https://api.example.com
```

## Testing

### Test with Payload (Default)

1. Start NestJS backend: `npm run start:dev`
2. Start Next.js frontend: `npm run frontend:dev`
3. Create/edit articles - data stored in Payload CMS

### Test with Strapi

1. Ensure Strapi is running: `npm run develop` (in Strapi directory)
2. Click "Strapi" button in navbar CMS Switcher
3. Articles operations now use Strapi API
4. Access Strapi admin: `http://localhost:1337/admin`

### Test Switching

1. Create article in Payload
2. Switch to Strapi - article not visible (different databases)
3. Create article in Strapi admin
4. Switch back to Payload - Strapi article not visible
5. Both work independently

## Troubleshooting

### "Strapi request failed (401)"

- API token not set or invalid
- Check `STRAPI_API_TOKEN` environment variable
- Verify token permissions in Strapi admin

### "Failed to fetch articles"

- Strapi not running at configured URL
- Check `STRAPI_URL` environment variable
- Verify Strapi Articles collection exists
- Check Strapi logs for errors

### CMS Switcher Not Working

- Clear browser localStorage: `localStorage.clear()`
- Check browser console for errors
- Verify CmsProvider wraps the app in layout.tsx

### Image Upload Issues (Strapi)

- By default, images stored as base64 strings (matching Payload)
- To use Strapi Media Library:
  - Modify `ContentService` to handle Strapi media endpoints
  - Store media URLs instead of base64

## Next Steps

1. ✅ Install and configure Strapi
2. ✅ Create Articles collection
3. ✅ Generate API token
4. ✅ Set environment variables
5. ✅ Test CMS switching in frontend
6. ✅ Verify admin panel access both CMSs
7. ✅ Create content in both systems
8. Deploy to production

## Files Modified/Created

### Backend

- `src/content/content.service.ts` - Added Strapi implementation
- `src/content/content.controller.ts` - Added `cms` query parameter support

### Frontend

- `lib/cms.ts` - CMS selection management
- `lib/api.ts` - Axios interceptor for `cms` parameter
- `contexts/CmsContext.tsx` - React context for CMS state
- `components/CmsSwitcher.tsx` - UI component to switch CMS
- `app/layout.tsx` - Wrapped with CmsProvider

## Support

For issues with:

- **Payload**: See existing documentation
- **Strapi**: https://docs.strapi.io/
- **This integration**: Check ContentService in src/content/content.service.ts
