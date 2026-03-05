# Image Upload & Rich Text Editor Integration

## What's New

Your Next.js frontend now includes:

1. **Featured Image Upload**
   - Image file upload in create article form
   - Base64 encoding for easy storage
   - Preview before submission
   - Display on article listings and detail pages

2. **Rich Text Editor (TipTap)**
   - WYSIWYG editor for article content
   - Support for:
     - Text formatting (bold, italic)
     - Headings (H1, H2, H3)
     - Lists (bulleted and numbered)
     - Code blocks
     - Blockquotes
   - Clean toolbar interface
   - Responsive design

3. **Backend Support**
   - Added `featuredImage` field to article DTO
   - Accepts base64 encoded images
   - Stores image data in the database

## Installation

After pulling these changes, install the new dependencies:

```bash
cd frontend
npm install
```

The new packages added:

- `@tiptap/react` - React integration for TipTap
- `@tiptap/starter-kit` - Basic formatting extensions

## How to Use

### Creating an Article with Image

1. Go to **Create Article** page
2. Fill in title, summary
3. **Upload Featured Image**:
   - Click "Choose File" button
   - Select an image from your computer
   - See preview on the form
4. **Write Content** using the Rich Text Editor:
   - Use toolbar buttons to format text
   - B = Bold, I = Italic
   - H1, H2 = Headings
   - • List = Bullet list
   - 1. List = Numbered list
   - </> = Code block
   - " = Blockquote
5. Add tags, set status, and submit

### Viewing Articles

**Home Page:**

- Articles display with featured image thumbnails
- Images are 48px tall with zoom effect on hover
- Title and summary displayed below image

**Article Detail Page:**

- Full-width featured image at the top (396px height)
- Article content with proper formatting
- All metadata (author, date, tags)

## Technical Details

### Frontend Changes

**Files Modified:**

- `app/articles/create/page.tsx` - Added image upload, rich editor
- `app/articles/[slug]/page.tsx` - Display featured image
- `app/page.tsx` - Show thumbnails in listing
- `package.json` - Added TipTap dependencies

**New Files:**

- `components/RichTextEditor.tsx` - TipTap editor component
- `components/RichTextEditor.css` - Editor styling

### Backend Changes

**Files Modified:**

- `src/content/dto/create-article.dto.ts` - Added `featuredImage` field

The DTO now accepts:

```typescript
@IsOptional()
@IsString()
featuredImage?: string;  // Base64 encoded image
```

## API Structure

### Create Article Request

```json
{
  "title": "Article Title",
  "slug": "article-title",
  "summaryTitle": "Brief summary",
  "content": {
    "root": {
      "type": "root",
      "children": [...]
    }
  },
  "featuredImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "tags": ["tag1", "tag2"],
  "status": "published"
}
```

### Get Article Response

```json
{
  "id": 1,
  "title": "Article Title",
  "slug": "article-title",
  "summaryTitle": "Brief summary",
  "content": {...},
  "featuredImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "tags": [...],
  "createdAt": "2026-03-05T07:07:50.490Z"
}
```

## Features

✅ **Image Upload**

- Click to upload featured image
- Live preview on form
- Base64 encoding for database storage
- Display on listing and detail pages

✅ **Rich Text Editor**

- Bold, italic formatting
- Heading styles (H1, H2, H3)
- Lists (unordered and ordered)
- Code blocks
- Blockquotes
- Clean, intuitive toolbar

✅ **Responsive Design**

- Works on mobile, tablet, desktop
- Image scales appropriately
- Editor is touch-friendly

## Customization

### Change Editor Extensions

Edit `components/RichTextEditor.tsx` to add more extensions:

```typescript
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

// Add to extensions array:
extensions: [StarterKit, Link, Image];
```

### Modify Image Display

In `app/articles/[slug]/page.tsx`, adjust image size:

```typescript
<div className="w-full h-96 bg-gray-200 relative">
  {/* Change h-96 to h-80, h-screen, etc. */}
</div>
```

### Change Editor Height

In `components/RichTextEditor.css`:

```css
.editor-content {
  min-height: 500px; /* Change from 300px */
}
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (touch-friendly)

## Performance Notes

- Images are base64 encoded (increases payload size)
- For production, consider:
  - Uploading to cloud storage (S3, Cloudinary)
  - Using image optimization libraries
  - Compressing images before upload
  - Setting max file size limits

## Troubleshooting

### Image not showing

- Check browser console for errors
- Verify file is an image format
- Check file size (very large files may fail)

### Rich editor not appearing

- Run `npm install` in frontend folder
- Clear browser cache and reload
- Check browser console for TypeScript errors

### Images too large

- Compress before uploading
- Use tools like ImageMagick or TinyPNG
- Set max-width CSS on display

## Next Steps

Consider adding:

- Image compression before upload
- Multiple images per article
- Image gallery
- Video embeds
- Link embeds (YouTube, etc.)
- Table support
- Horizontal rules
- Advanced formatting options
