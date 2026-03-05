# Quick Start: Dual CMS Integration

## ⚡ 5-Minute Setup

### Step 1: Create Strapi Project

```bash
# In a new terminal, in the root directory
./setup-strapi.sh
```

This creates a `strapi-poc` directory with a fresh Strapi installation.

### Step 2: Start Strapi

```bash
cd strapi-poc
npm run develop
```

Strapi admin opens at `http://localhost:1337/admin`

### Step 3: Create Articles Collection in Strapi

1. In Strapi admin, go to **Content-Type Builder**
2. Click **Create new Collection Type**
3. Name: `articles` (singular and plural both)
4. Click **Continue**
5. Add these fields:

| Field Name    | Type                           | Required |
| ------------- | ------------------------------ | -------- |
| title         | String                         | ✅ Yes   |
| slug          | String                         | ✅ Yes   |
| summaryTitle  | String                         | ❌ No    |
| content       | Rich Text                      | ❌ No    |
| featuredImage | String                         | ❌ No    |
| tags          | JSON                           | ❌ No    |
| author        | String                         | ❌ No    |
| status        | Enumeration (draft, published) | ❌ No    |

6. Click **Save**

### Step 4: Generate API Token

1. Go to **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Name: `Payload POC Token` (or any name)
4. **Token duration**: Choose **Unlimited**
5. **Token type**: Choose **Full access** (this is the simplest and recommended option)
   - Alternative: Choose **Custom** and manually select all CRUD permissions for Article collection
6. Click **Save**
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)

**Troubleshooting Token Permissions:**

- If you get 403 Forbidden errors, your token likely lacks permissions
- Go back to Settings → API Tokens → find your token
- For **Custom** tokens, ensure under **ARTICLE** section you have checked:
  - ✅ find
  - ✅ findOne
  - ✅ create
  - ✅ update
  - ✅ delete
- For simplest setup, just use **Full access** token type

### Step 5: Set Environment Variable

Back in the project root:

```bash
# Create or edit .env.local
echo "STRAPI_URL=http://localhost:1337" >> .env.local
echo "STRAPI_API_TOKEN=your_token_here" >> .env.local
```

Replace `your_token_here` with the token from Step 4.

### Step 6: Start Backend & Frontend

```bash
# Terminal 2
npm run start:dev

# Terminal 3
npm run frontend:dev
```

### Step 7: Test It!

1. Open `http://localhost:3001` in browser
2. Top-right navbar shows CMS switcher (Payload/Strapi)
3. Click "Strapi" button
4. Create a new article
5. Article stored in Strapi
6. View it in Strapi admin: `http://localhost:1337/admin` → Content Manager

## 🎯 What Each Button Does

### Payload Button

- Stores preference in browser
- All API calls go to Payload CMS
- Data persists in Payload database

### Strapi Button

- Stores preference in browser
- All API calls go to Strapi API
- Data persists in Strapi database

**Switch anytime - data stays in each CMS**

## 📝 Test Checklist

- [ ] Create article in Payload
- [ ] Switch to Strapi - article gone (different database)
- [ ] Create article in Strapi via frontend
- [ ] View article in Strapi admin panel
- [ ] Edit article from frontend
- [ ] Delete article from frontend
- [ ] Switch back to Payload - Strapi article not visible
- [ ] Payload article still there
- [ ] Logout/login - CMS selection persists

## 🐛 Troubleshooting

### "Cannot connect to Strapi"

```
Error: Failed to fetch from http://localhost:1337
```

→ Make sure Strapi is running: `npm run develop` in strapi-poc directory

### "Invalid API token"

```
Error: Strapi request failed (401)
```

→ Check `.env.local` has correct token  
→ Make sure token hasn't expired  
→ Regenerate if needed

### "Articles collection not found"

```
Error: Strapi request failed (404)
```

→ Collection might not be created yet  
→ Go to Strapi admin and create Articles collection

### "CMS Switcher not showing"

```
Buttons not visible in navbar
```

→ Clear browser: Ctrl+Shift+Delete → Clear all → F5  
→ Check browser console for errors

## 📚 Full Docs

See these files for detailed information:

- **Setup**: `STRAPI_INTEGRATION.md`
- **Architecture**: `DUAL_CMS_SUMMARY.md`
- **Code Changes**: Check git diff or file modifications list

## 🚀 Production Checklist

Before going live:

- [ ] Generate strong Strapi admin password
- [ ] Use production Strapi URL in env vars
- [ ] Store API token securely (not in repo)
- [ ] Set up HTTPS for Strapi
- [ ] Configure CORS properly
- [ ] Test all CRUD operations
- [ ] Set up backups for both CMS databases
- [ ] Document CMS switching procedure for team

## 💡 Tips

1. **Use Strapi Admin for content**: Better UI than frontend form
2. **Keep token safe**: Never commit `.env.local` to git
3. **Test both CMSs**: Ensure your queries work in both
4. **Monitor logs**: Check Strapi and NestJS logs for issues
5. **Backup data**: Both CMSs have separate databases

## 🎓 Next Steps

1. ✅ Follow this quick start
2. ✅ Test CMS switching
3. ✅ Read STRAPI_INTEGRATION.md for advanced setup
4. ✅ Customize fields/schema as needed
5. ✅ Deploy Strapi to production

---

**Need help?** Check STRAPI_INTEGRATION.md for full troubleshooting guide!
