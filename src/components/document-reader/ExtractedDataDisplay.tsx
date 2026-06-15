'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Zap, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { ExtractedData } from '@/types/documents';

interface ExtractedDataDisplayProps {
  documentId: string;
}

export default function ExtractedDataDisplay({
  documentId,
}: ExtractedDataDisplayProps) {
  const [data, setData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    requirements: true,
    risks: true,
    constraints: true,
  });

  // TODO: Replace with actual user ID from auth
  const userId = 'temp-user-id';

  useEffect(() => {
    fetchExtractedData();
  }, [documentId]);

  const fetchExtractedData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/documents/extracted-data?documentId=${documentId}&userId=${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch extracted data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleReview = async (reviewed: boolean) => {
    if (!data) return;

    try {
      const response = await fetch('/api/documents/extracted-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataId: data.id,
          userId,
          reviewed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update review status');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2">
        <Loader className="w-5 h-5 animate-spin text-primary" />
        <span className="text-text-muted">Loading analysis results...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-text-muted">
        <p>No analysis results yet. Click "Analyse with AI" to analyze this document.</p>
      </div>
    );
  }

  const isReviewed = data.reviewed;

  return (
    <div className="p-6 bg-card">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold text-foreground">
            AI extracted {data.requirements.length + data.risks.length + data.constraints.length} items
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {isReviewed && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Reviewed</span>
            </div>
          )}
          <button
            onClick={() => handleReview(!isReviewed)}
            className={`text-sm font-medium py-1 px-3 rounded transition-colors ${
              isReviewed
                ? 'bg-success/20 text-success hover:bg-success/30'
                : 'bg-border text-foreground hover:bg-border/70'
            }`}
          >
            {isReviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
          </button>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="mb-4 border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('requirements')}
          className="w-full flex items-center justify-between p-4 bg-card hover:bg-border/50 transition-colors font-semibold text-foreground"
        >
          <span>Requirements ({data.requirements.length})</span>
          {expandedSections.requirements ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {expandedSections.requirements && (
          <div className="p-4 border-t border-border bg-background">
            {data.requirements.length > 0 ? (
              <ul className="space-y-2">
                {data.requirements.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-foreground">
                    <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted text-sm">No requirements extracted</p>
            )}
          </div>
        )}
      </div>

      {/* Risks Section */}
      <div className="mb-4 border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('risks')}
          className="w-full flex items-center justify-between p-4 bg-card hover:bg-border/50 transition-colors font-semibold text-foreground"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            <span>Risks ({data.risks.length})</span>
          </div>
          {expandedSections.risks ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {expandedSections.risks && (
          <div className="p-4 border-t border-border bg-background">
            {data.risks.length > 0 ? (
              <ul className="space-y-2">
                {data.risks.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-foreground">
                    <span className="text-error font-bold flex-shrink-0">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted text-sm">No risks extracted</p>
            )}
          </div>
        )}
      </div>

      {/* Constraints Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('constraints')}
          className="w-full flex items-center justify-between p-4 bg-card hover:bg-border/50 transition-colors font-semibold text-foreground"
        >
          <span>Constraints ({data.constraints.length})</span>
          {expandedSections.constraints ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {expandedSections.constraints && (
          <div className="p-4 border-t border-border bg-background">
            {data.constraints.length > 0 ? (
              <ul className="space-y-2">
                {data.constraints.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-foreground">
                    <span className="text-accent font-bold flex-shrink-0">{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted text-sm">No constraints extracted</p>
            )}
          </div>
        )}
      </div>

      {/* Footer with analysis metadata */}
      <div className="mt-4 pt-4 border-t border-border text-xs text-text-muted">
        <p>
          Analysis completed:{' '}
          {new Date(data.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
