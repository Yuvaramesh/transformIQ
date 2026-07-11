'use client';

import { useState } from 'react';
import DocumentReaderModal from '@/components/document-reader/DocumentReaderModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">TransformIQ</h1>
          <p className="text-xl text-text-muted">
            Project Intelligence Platform with AI-Powered Document Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature Cards */}
          <div className="bg-white rounded-lg shadow-md p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Smart Document Reader
            </h2>
            <p className="text-text-muted mb-6">
              Upload PDFs and use AI to automatically extract requirements, risks, and constraints. 
              Get instant insights from your project documents.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-md transition-colors"
            >
              Open Document Reader
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              More Features Coming
            </h2>
            <p className="text-text-muted">
              Timeline management, cost tracking, progress tracking, and real-time collaboration 
              features are coming soon.
            </p>
          </div>
        </div>
      </div>

      {/* Document Reader Modal */}
      <DocumentReaderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
