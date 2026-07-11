# Smart Document Reader Feature

## Overview
The Smart Document Reader is an AI-powered feature that allows users to upload PDF documents and automatically extract requirements, risks, and constraints using Claude's vision capabilities.

## Architecture

### Components
- **DocumentReaderModal**: Main modal component that manages tabs and state
- **FileUploadZone**: Drag-and-drop file upload interface
- **FilesDiscovery**: Browse and analyze previously uploaded documents
- **ExtractedDataDisplay**: View and manage extracted insights

### API Routes
- `POST /api/documents/upload` - Upload a PDF file to Supabase Storage
- `POST /api/documents/analyze` - Analyze a document with Claude Vision API
- `GET /api/documents/extracted-data` - Fetch extracted data for a document
- `PATCH /api/documents/extracted-data` - Mark analysis as reviewed

### Database Schema
- **documents** table: Stores file metadata and storage paths
- **extracted_data** table: Stores extracted requirements, risks, and constraints

## Setup Instructions

### 1. Environment Variables
Set these in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2. Database Setup
Run the migration SQL in `migrations/001_create_documents_tables.sql`:
1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy and paste the migration SQL
5. Execute the query

### 3. Storage Configuration
Create a `project-files` bucket in Supabase Storage:
1. Go to Storage in Supabase dashboard
2. Create new bucket named `project-files`
3. Set the bucket to **Private**
4. Add RLS policies if needed (examples in the SQL migration)

### 4. Authentication Integration
The current implementation uses a placeholder `temp-user-id`. To integrate with real authentication:

**In FileUploadZone.tsx:**
```typescript
// Replace this:
const userId = 'temp-user-id';

// With this (if using Supabase Auth):
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id || '';
```

**In FilesDiscovery.tsx:**
```typescript
// Same replacement as above
```

**In ExtractedDataDisplay.tsx:**
```typescript
// Same replacement as above
```

## Feature Details

### File Upload
- Maximum file size: 10MB
- Supported format: PDF
- Drag-and-drop support
- Automatic validation and error handling

### AI Analysis
- Uses Claude 3.5 Sonnet model
- Extracts:
  - **Requirements**: Explicit and implicit project needs
  - **Risks**: Potential challenges and issues
  - **Constraints**: Limitations and restrictions
- Response is stored in database for future reference

### Storage
- Files are stored in Supabase Storage
- File paths include user ID and timestamp for uniqueness
- Files are private and only accessible to the uploading user (via RLS)

## Usage

1. **Open the Modal**: Click "Open Document Reader" button on the homepage
2. **Upload File**: Switch to "Upload File" tab, drag and drop or click to select a PDF
3. **View Files**: Switch to "Files & Discovery" tab to see all uploaded documents
4. **Analyze**: Click "Analyse with AI" button on any document
5. **Review Results**: See extracted requirements, risks, and constraints
6. **Mark as Reviewed**: Click "Mark as reviewed" to confirm the analysis

## Troubleshooting

### Upload Fails
- Check file size (max 10MB)
- Verify it's a valid PDF
- Ensure SUPABASE_SERVICE_ROLE_KEY is set

### Analysis Fails
- Verify ANTHROPIC_API_KEY is set
- Check API usage/quota
- Ensure file is readable PDF (not scanned image-only)

### No Documents Show
- Verify user authentication is working
- Check database connection
- Review Supabase RLS policies

## Future Enhancements
- [ ] Support for other document formats (Word, Excel, etc.)
- [ ] Batch file uploads
- [ ] Custom extraction templates
- [ ] Export extracted data to various formats
- [ ] Integration with project timeline and cost tracking
- [ ] Collaboration features for team analysis
