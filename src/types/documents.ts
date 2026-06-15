export interface DocumentFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractedData {
  id: string;
  document_id: string;
  user_id: string;
  requirements: string[];
  risks: string[];
  constraints: string[];
  raw_response: Record<string, unknown>;
  created_at: string;
  reviewed: boolean;
  reviewed_at: string | null;
}

export interface AnalysisResult {
  requirements: string[];
  risks: string[];
  constraints: string[];
}
