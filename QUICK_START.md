# Smart Document Reader - Quick Start (5 Minutes)

## 1️⃣ Install & Run (1 minute)
```bash
npm install
npm run dev
```
Open http://localhost:3000

## 2️⃣ Set Environment Variables (2 minutes)
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-api-key
```

Get keys from:
- **Supabase**: Project Settings → API
- **Anthropic**: https://console.anthropic.com/keys

## 3️⃣ Setup Database (1 minute)
1. Go to your Supabase dashboard
2. **Storage** → Create bucket `project-files` (Private)
3. **SQL Editor** → New Query → Paste `migrations/001_create_documents_tables.sql` → Run

## 4️⃣ Enable Auth (1 minute)
Open three files and replace `const userId = 'temp-user-id';`:
- `src/components/document-reader/FileUploadZone.tsx` (line 24)
- `src/components/document-reader/FilesDiscovery.tsx` (line 23)
- `src/components/document-reader/ExtractedDataDisplay.tsx` (line 19)

With:
```typescript
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id || '';
```

## 5️⃣ Test It! ✅
1. Click "Open Document Reader" on homepage
2. Upload a PDF (drag-and-drop)
3. Click "Analyse with AI"
4. See extracted requirements, risks, constraints

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No file provided" | Check it's a valid PDF, < 10MB |
| "SUPABASE_SERVICE_ROLE_KEY is required" | Add it to `.env.local` |
| "API key is invalid" | Verify `ANTHROPIC_API_KEY` in `.env.local` |
| No documents appear | Verify `documents` table exists (run migration) |
| Upload works but analysis fails | Check Anthropic API quota at console.anthropic.com |

## File Structure
```
src/
├── app/page.tsx                          ← Homepage with modal trigger
├── components/document-reader/           ← 4 UI components
├── lib/                                  ← Utilities (Claude, Supabase)
├── styles/globals.css                    ← Design tokens
└── types/documents.ts                    ← TypeScript types

API Routes:
├── /api/documents/upload                 ← Upload PDFs
├── /api/documents/analyze                ← Run AI analysis
└── /api/documents/extracted-data         ← Get results
```

## What It Does

```
User uploads PDF
    ↓
FileUploadZone validates & sends to /api/documents/upload
    ↓
Server saves file to Supabase Storage + metadata to DB
    ↓
User clicks "Analyse with AI"
    ↓
/api/documents/analyze downloads file, sends to Claude Vision API
    ↓
Claude extracts Requirements, Risks, Constraints
    ↓
Results saved to extracted_data table
    ↓
UI shows collapsible sections with results
    ↓
User marks as "Reviewed" if satisfied
```

## Next Steps

1. **Enable real authentication** (see Step 4)
2. **Customize the AI prompt** in `src/lib/claude.ts` (line 14-30)
3. **Connect to Timeline/Cost Model** (future integration)
4. **Deploy to Vercel** (push to main branch)

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage & modal trigger |
| `src/components/document-reader/DocumentReaderModal.tsx` | Main modal UI |
| `src/lib/claude.ts` | AI analysis logic & prompt |
| `src/app/api/documents/analyze/route.ts` | Analysis endpoint |
| `migrations/001_create_documents_tables.sql` | Database schema |

## Full Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **DOCUMENT_READER.md** - Feature overview & architecture
- **FEATURE_SUMMARY.md** - Complete implementation details

## Support

1. Check **SETUP_GUIDE.md** Troubleshooting section
2. Check server logs: `npm run dev` terminal
3. Check browser console: F12 → Console tab
4. Review component code comments

---

**Ready in 5 minutes!** 🚀
