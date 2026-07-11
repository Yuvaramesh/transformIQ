# Smart Document Reader - Complete Setup Guide

## Quick Start

This guide walks you through setting up the Smart Document Reader feature for TransformIQ.

## Prerequisites
- Supabase account with a project
- Anthropic API key (Claude)
- Node.js 18+ and npm/pnpm

## Step 1: Install Dependencies

```bash
npm install
# or
pnpm install
```

All required dependencies are already in package.json.

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the project root with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Where to find these:**
- **Supabase URL & Keys**: Project Settings → API → Project URL & Keys
- **Anthropic API Key**: Create an account at anthropic.com → API Keys section

## Step 3: Set Up Database

### 3a. Create Storage Bucket
1. Open your Supabase project dashboard
2. Go to **Storage** → **New bucket**
3. Name: `project-files`
4. Access: **Private**
5. Click **Create bucket**

### 3b. Run Database Migration
1. Go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `migrations/001_create_documents_tables.sql`
4. Paste into the SQL editor
5. Click **Run**

This creates the `documents` and `extracted_data` tables with proper RLS policies.

## Step 4: Enable Authentication (Important!)

The feature currently uses a placeholder user ID. To enable real authentication:

### Option A: Use Supabase Auth
1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable your preferred provider (Email, Google, GitHub, etc.)
3. Update the three component files to use the actual user ID:

**src/components/document-reader/FileUploadZone.tsx:**
```typescript
// Replace line 24:
const userId = 'temp-user-id';

// With:
const { data: { user }, error } = await supabase.auth.getUser();
const userId = user?.id || '';
if (!userId) {
  setError('You must be logged in to upload files');
  return;
}
```

**src/components/document-reader/FilesDiscovery.tsx:**
```typescript
// Replace line 23:
const userId = 'temp-user-id';

// With:
useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) setUserId(user.id);
  };
  getUser();
}, []);

// Then declare userId as state instead of constant
const [userId, setUserId] = useState('');
```

**src/components/document-reader/ExtractedDataDisplay.tsx:**
```typescript
// Replace line 19:
const userId = 'temp-user-id';

// With:
const [userId, setUserId] = useState('');

useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) setUserId(user.id);
  };
  getUser();
}, []);
```

### Option B: Custom Auth
Implement your own authentication logic and pass the user ID to the components.

## Step 5: Test the Feature

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser
3. Click "Open Document Reader"
4. Upload a test PDF (try the sample provided in the project, or any project document)
5. Click "Analyse with AI"
6. View the extracted requirements, risks, and constraints

## Troubleshooting

### Error: "No file provided"
- Ensure the file is a valid PDF
- Check file size (max 10MB)

### Error: "SUPABASE_SERVICE_ROLE_KEY is required"
- Verify `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
- Service role key must have permissions to manage storage

### Error: "API key is invalid"
- Check that `ANTHROPIC_API_KEY` is correctly set
- Verify the key hasn't expired on anthropic.com

### No documents appear after upload
- Check Supabase SQL and verify `documents` table exists
- Verify RLS policies are not blocking reads

### Analysis fails silently
- Check browser console for error messages
- Verify document is a readable PDF (not image-only)
- Check Anthropic API quota/usage

## Database Schema Reference

### documents table
```sql
id (UUID)            - Primary key
user_id (TEXT)       - User identifier
file_name (TEXT)     - Original filename
file_path (TEXT)     - Path in Supabase Storage
file_size (INTEGER)  - File size in bytes
mime_type (TEXT)     - MIME type (usually application/pdf)
created_at (TIMESTAMP) - Upload timestamp
updated_at (TIMESTAMP) - Last update timestamp
```

### extracted_data table
```sql
id (UUID)            - Primary key
document_id (UUID)   - Reference to documents.id
user_id (TEXT)       - User identifier
requirements (TEXT[]) - Array of extracted requirements
risks (TEXT[])       - Array of extracted risks
constraints (TEXT[]) - Array of extracted constraints
raw_response (JSONB) - Full API response from Claude
created_at (TIMESTAMP) - Analysis timestamp
reviewed (BOOLEAN)   - Whether user marked as reviewed
reviewed_at (TIMESTAMP) - When marked as reviewed
```

## API Endpoints

### POST /api/documents/upload
Upload a PDF file.

**Request:**
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@document.pdf" \
  -F "userId=user123"
```

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "user_id": "user123",
    "file_name": "document.pdf",
    "file_path": "user123/timestamp_document.pdf",
    "file_size": 12345,
    "mime_type": "application/pdf",
    "created_at": "2026-06-15T10:00:00Z"
  }
}
```

### POST /api/documents/analyze
Analyze a document with Claude.

**Request:**
```json
{
  "documentId": "uuid",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "id": "uuid",
    "document_id": "uuid",
    "user_id": "user123",
    "requirements": ["requirement 1", "requirement 2"],
    "risks": ["risk 1", "risk 2"],
    "constraints": ["constraint 1"],
    "raw_response": { ... },
    "created_at": "2026-06-15T10:05:00Z",
    "reviewed": false
  }
}
```

### GET /api/documents/extracted-data
Fetch analysis results for a document.

**Query Parameters:**
- `documentId` (required): UUID of the document
- `userId` (required): User ID

### PATCH /api/documents/extracted-data
Mark analysis as reviewed/unreviewed.

**Request:**
```json
{
  "dataId": "uuid",
  "userId": "user123",
  "reviewed": true
}
```

## Architecture Notes

### File Storage Flow
1. User uploads PDF via modal
2. File sent to `/api/documents/upload`
3. API saves to Supabase Storage under `project-files/{userId}/{timestamp}_{filename}`
4. Metadata saved to `documents` table

### Analysis Flow
1. User clicks "Analyse with AI"
2. API retrieves file from Supabase Storage
3. Converts file to base64
4. Sends to Claude Vision API with analysis prompt
5. Parses JSON response
6. Saves to `extracted_data` table

### Security
- RLS policies ensure users can only access their own documents
- Service role key used only on backend for uploads
- Client uses anon key (read-only via RLS)
- All file paths include user ID for isolation

## Next Steps

1. **Connect Authentication**: Follow Step 4 to enable real user authentication
2. **Customize Prompts**: Edit the analysis prompt in `src/lib/claude.ts` for your use case
3. **Add More Features**:
   - Export extracted data to Excel/PDF
   - Batch file processing
   - Custom extraction templates
   - Integration with project timeline
4. **Deploy**: Push to GitHub and deploy on Vercel

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the component code comments
3. Check browser console and server logs for detailed errors
4. Refer to Supabase and Anthropic documentation

## File Structure
```
src/
├── app/
│   ├── api/
│   │   └── documents/
│   │       ├── upload/route.ts
│   │       ├── analyze/route.ts
│   │       └── extracted-data/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── document-reader/
│       ├── DocumentReaderModal.tsx
│       ├── FileUploadZone.tsx
│       ├── FilesDiscovery.tsx
│       └── ExtractedDataDisplay.tsx
├── lib/
│   ├── supabase.ts
│   └── claude.ts
├── styles/
│   └── globals.css
└── types/
    └── documents.ts

migrations/
└── 001_create_documents_tables.sql
```
