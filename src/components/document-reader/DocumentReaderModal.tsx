'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FileUploadZone from './FileUploadZone';
import FilesDiscovery from './FilesDiscovery';
import ExtractedDataDisplay from './ExtractedDataDisplay';

interface DocumentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentReaderModal({
  isOpen,
  onClose,
}: DocumentReaderModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'discovery'>('discovery');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Reset to discovery tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('discovery');
    }
  }, [isOpen]);

  const handleFileUploaded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('discovery');
  };

  const handleDocumentSelected = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Smart Document Reader
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Upload PDFs and extract requirements, risks, and constraints using AI
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-card rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-card">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-6 font-medium text-center transition-colors ${
                activeTab === 'upload'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex-1 py-3 px-6 font-medium text-center transition-colors ${
                activeTab === 'discovery'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              Files & Discovery
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'upload' && (
              <FileUploadZone onSuccess={handleFileUploaded} />
            )}

            {activeTab === 'discovery' && (
              <FilesDiscovery
                onDocumentSelected={handleDocumentSelected}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>

          {/* Extracted Data Display - Shows in both tabs */}
          {selectedDocumentId && (
            <div className="border-t border-border">
              <ExtractedDataDisplay documentId={selectedDocumentId} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
