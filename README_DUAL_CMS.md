# 🎯 Dual CMS Integration: Complete Overview

This project now supports **both Payload CMS and Strapi** seamlessly through a single frontend and backend. Switch between them at runtime without any code changes.

## 🚀 Quick Start

### Option 1: Just Payload (Existing Setup)

```bash
npm run start:dev        # Backend
npm run frontend:dev     # Frontend
```

### Option 2: Both Payload + Strapi

```bash
# Run this once to set up Strapi
./setup-strapi.sh

# Then start everything
./start-all-with-strapi.sh
```

See [QUICK_START_STRAPI.md](QUICK_START_STRAPI.md) for detailed 5-minute setup.

## 📚 Documentation

- **[QUICK_START_STRAPI.md](QUICK_START_STRAPI.md)** ⭐ Start here!
  - 5-minute setup guide
  - Step-by-step Strapi configuration
  - Testing checklist
  - Troubleshooting

- **[STRAPI_INTEGRATION.md](STRAPI_INTEGRATION.md)** - Complete reference
  - Full architecture explanation
  - Installation instructions
  - Collection schema definition
  - API documentation
  - Configuration options
  - Advanced usage

- **[DUAL_CMS_SUMMARY.md](DUAL_CMS_SUMMARY.md)** - Deep dive
  - Detailed architecture
  - Code changes breakdown
  - How CMS routing works
  - Security notes
  - Customization guide
  - Future enhancements

- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Visual reference
  - UI changes
  - Request flow diagrams
  - Component hierarchy
  - Response format examples
  - Testing matrix

- **[IMPLEMENTATION_VERIFICATION.md](IMPLEMENTATION_VERIFICATION.md)** - Technical checklist
  - All features verified
  - Code quality checks
  - Testing procedures
  - Requirements met

## 🎯 What's New

### Frontend

- ✅ CMS Switcher in navbar (Payload/Strapi buttons)
- ✅ localStorage-based CMS selection
- ✅ Automatic `?cms=` parameter injection
- ✅ Works with both CMSs seamlessly

### Backend

- ✅ ContentService routes to correct CMS
- ✅ Strapi HTTP client implementation
- ✅ Response normalization layer
- ✅ Full CRUD support for both CMSs

### Features

- ✅ Create/Read/Update/Delete articles in both CMSs
- ✅ Publish articles in both CMSs
- ✅ Filter by status (draft/published)
- ✅ Pagination support
- ✅ Author population
- ✅ Strapi admin panel fully enabled

## 🔄 How It Works

```
┌─────────────────────────────────────────────────┐
│          Next.js Frontend (Unified)             │
│  ┌─────────────────────────────────────────────┐ │
│  │ CMS Switcher: [Payload] [Strapi]            │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │ ?cms=payload or ?cms=strapi
                   ↓
┌──────────────────────────────────────┐
│    NestJS Backend (Single API)       │
│  ContentService.resolveProvider()    │
└──────────────────┬───────────────────┘
                   │
          ┌────────┴────────┐
          ↓                 ↓
    ┌─────────────┐   ┌──────────────┐
    │   Payload   │   │   Strapi     │
    │   Local API │   │   REST API   │
    └─────────────┘   └──────────────┘
          ↓                 ↓
    ┌─────────────┐   ┌──────────────┐
    │   Payload   │   │   Strapi     │
    │   Database  │   │   Database   │
    └─────────────┘   └──────────────┘
```

## 📝 Key Features

### Seamless Switching

- Click button in navbar to switch CMS
- Preference saved in browser
- Page reloads with new CMS
- All endpoints automatically use selected CMS

### Backward Compatible

- Existing Payload code unchanged
- Default behavior is Payload
- No breaking changes
- Gradual migration path

### Unified Interface

- Same API for both CMSs
- Single frontend component
- No conditional rendering needed
- Response format identical

### Strapi Admin

- Full admin panel enabled
- Manage content in Strapi UI
- Content persists independently
- Both CMSs accessible simultaneously

## 🛠️ Architecture

### Three Layers

**Layer 1: Frontend (Next.js)**

- CMS selection via localStorage
- Auto-inject `?cms=` parameter
- Single UI works with both

**Layer 2: Backend (NestJS)**

- ContentService routes requests
- Payload and Strapi handlers
- Response normalization

**Layer 3: CMS Backends**

- Payload: In-process, PostgreSQL
- Strapi: External API, PostgreSQL

## 📦 What Gets Modified

### Backend Changes

- `src/content/content.service.ts` - Added Strapi implementation (~300 lines)
- `src/content/content.controller.ts` - Added `cms` parameter support

### Frontend Changes

- `frontend/lib/api.ts` - Added axios interceptor
- `frontend/lib/cms.ts` - New CMS management module
- `frontend/contexts/CmsContext.tsx` - New React context
- `frontend/components/CmsSwitcher.tsx` - New UI component
- `frontend/components/Navbar.tsx` - Integrated CmsSwitcher
- `frontend/app/layout.tsx` - Wrapped with CmsProvider

### No Breaking Changes

- All existing endpoints work unchanged
- Payload CMS continues to work
- Authentication system preserved
- Database migrations not needed

## 🚀 API Usage

### Public Endpoints

```bash
# Get published articles
curl "http://localhost:3000/articles?cms=payload"
curl "http://localhost:3000/articles?cms=strapi"

# Get single article
curl "http://localhost:3000/articles/my-slug?cms=strapi"

# Default to Payload if cms param omitted
curl "http://localhost:3000/articles"
```

### Protected Endpoints (requires auth)

```bash
# Create article
curl -X POST "http://localhost:3000/admin/articles?cms=strapi" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"...","slug":"..."}'

# Update article
curl -X PUT "http://localhost:3000/admin/articles/1?cms=payload" \
  -H "Authorization: Bearer $TOKEN"

# Delete article
curl -X DELETE "http://localhost:3000/admin/articles/1?cms=strapi" \
  -H "Authorization: Bearer $TOKEN"

# Publish article
curl -X PUT "http://localhost:3000/admin/articles/1/publish?cms=payload" \
  -H "Authorization: Bearer $TOKEN"
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env.local
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token
```

### Set Default CMS

Edit `frontend/lib/cms.ts`:

```typescript
const DEFAULT_CMS: CmsProvider = "strapi"; // or "payload"
```

### Disable Auto-Reload on Switch

Edit `frontend/contexts/CmsContext.tsx`:

```typescript
// Comment out this line:
// window.location.reload();
```

## 🧪 Testing

### Test Payload (Default)

```bash
# 1. Create article
# 2. Edit article
# 3. Delete article
# 4. Publish article
```

### Test Strapi

```bash
# 1. Click "Strapi" button
# 2. Create article (different data)
# 3. Edit article
# 4. Check Strapi admin: http://localhost:1337/admin
```

### Test Switching

```bash
# 1. Create in Payload
# 2. Switch to Strapi (not visible - different DB)
# 3. Create in Strapi
# 4. Switch to Payload (Strapi article not visible)
# 5. Both CMSs work independently ✓
```

## 📍 Access Points

| Service       | URL                         | Purpose            |
| ------------- | --------------------------- | ------------------ |
| Frontend      | http://localhost:3001       | User interface     |
| Backend       | http://localhost:3000       | API server         |
| Strapi Admin  | http://localhost:1337/admin | Content management |
| Payload Admin | N/A                         | Local API only     |

## 🔐 Security

### API Token

- Store in environment variables
- Never commit to git
- Regenerate for each environment
- Restrict permissions in Strapi

### Authentication

- JWT tokens unchanged
- Protected endpoints require auth
- Public endpoints open
- Admin panel requires Strapi login

## 🐛 Troubleshooting

**"Cannot connect to Strapi"**

- Check if Strapi is running: `npm run develop`
- Verify STRAPI_URL in .env.local

**"Invalid API token"**

- Token might be expired
- Check permissions in Strapi Settings
- Regenerate if needed

**"Articles collection not found"**

- Create Articles collection in Strapi admin
- Content-Type Builder → Create New Collection Type

See [STRAPI_INTEGRATION.md](STRAPI_INTEGRATION.md#troubleshooting) for more.

## 📊 Endpoints Cheat Sheet

```bash
# Public (GET)
GET  /articles
GET  /articles/:slug
GET  /users

# Admin (Protected - requires Bearer token)
GET  /admin/articles
POST /admin/articles
PUT  /admin/articles/:id
DELETE /admin/articles/:id
PUT  /admin/articles/:id/publish

# Add ?cms=payload or ?cms=strapi to any endpoint
# Default is payload if not specified
```

## 🎓 Learning Path

1. **Just want to use it?**
   → Read [QUICK_START_STRAPI.md](QUICK_START_STRAPI.md)

2. **Want to understand the architecture?**
   → Read [DUAL_CMS_SUMMARY.md](DUAL_CMS_SUMMARY.md)

3. **Setting up production?**
   → Read [STRAPI_INTEGRATION.md](STRAPI_INTEGRATION.md)

4. **Debugging issues?**
   → Check [VISUAL_GUIDE.md](VISUAL_GUIDE.md) or troubleshooting sections

5. **Verifying implementation?**
   → Check [IMPLEMENTATION_VERIFICATION.md](IMPLEMENTATION_VERIFICATION.md)

## ✨ Key Benefits

✅ **No Code Changes to Frontend** - Works with both CMSs  
✅ **No Breaking Changes** - Payload works exactly as before  
✅ **Runtime Flexibility** - Switch CMSs without restart  
✅ **Strapi Admin Enabled** - Full content management UI  
✅ **Production Ready** - Comprehensive documentation  
✅ **Easy to Test** - Both CMSs accessible simultaneously  
✅ **Team Friendly** - Clear separation of concerns

## 🚀 Next Steps

1. ✅ Run setup script: `./setup-strapi.sh`
2. ✅ Follow [QUICK_START_STRAPI.md](QUICK_START_STRAPI.md)
3. ✅ Test CMS switching
4. ✅ Deploy to production

## 📞 Support

- **Setup Help**: See [QUICK_START_STRAPI.md](QUICK_START_STRAPI.md)
- **API Questions**: See [STRAPI_INTEGRATION.md](STRAPI_INTEGRATION.md)
- **Architecture**: See [DUAL_CMS_SUMMARY.md](DUAL_CMS_SUMMARY.md)
- **Visuals**: See [VISUAL_GUIDE.md](VISUAL_GUIDE.md)
- **Technical Details**: See [IMPLEMENTATION_VERIFICATION.md](IMPLEMENTATION_VERIFICATION.md)

---

**Ready to go!** 🎉

Start with `./setup-strapi.sh` then read [QUICK_START_STRAPI.md](QUICK_START_STRAPI.md)
