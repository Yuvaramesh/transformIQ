'use client';

import { useEffect, useState } from 'react';
import { FileText, Zap, Loader } from 'lucide-react';
import { DocumentFile } from '@/types/documents';
import { createClient } from '@supabase/ssr';

interface FilesDiscoveryProps {
  onDocumentSelected: (documentId: string) => void;
  refreshTrigger: number;
}

export default function FilesDiscovery({
  onDocumentSelected,
  refreshTrigger,
}: FilesDiscoveryProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzeStates, setAnalyzeStates] = useState<Record<string, boolean>>({});

  // TODO: Replace with actual user ID from auth
  const userId = 'temp-user-id';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (documentId: string) => {
    setAnalyzeStates((prev) => ({ ...prev, [documentId]: true }));

    try {
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      onDocumentSelected(documentId);
    } catch (err) {
      console.error('Analysis error:', err);
      alert(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAnalyzeStates((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-text-muted">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No documents yet
          </h3>
          <p className="text-text-muted">
            Upload a PDF document to get started with AI analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-foreground truncate">
                    {doc.file_name}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span>
                    {(doc.file_size / 1024).toFixed(2)} KB
                  </span>
                  <span>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleAnalyze(doc.id)}
                disabled={analyzeStates[doc.id]}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {analyzeStates[doc.id] ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyse with AI
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
