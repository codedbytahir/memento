'use client';

import React from 'react';
import Image from 'next/image';

interface PDFPreviewProps {
  sessionId: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ sessionId }) => {
  const story = typeof window !== 'undefined' ? localStorage.getItem('memento_story') : "";
  const matchedImages = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('memento_matched_images') || '[]') : [];

  return (
    <div className="w-full bg-white aspect-[3/4] rounded-lg overflow-hidden flex flex-col items-center justify-start p-12 text-center animate-fade-in border border-gray-100 shadow-inner group-hover:shadow-2xl transition-all">
      <div className="w-full h-full flex flex-col items-center justify-between border-8 border-navy/5 p-8 relative">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-navy">My Story</h1>
          <div className="h-1 w-24 bg-copper mx-auto" />
          <p className="text-charcoal-light font-medium italic">By Memento</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-8">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-navy/10 shadow-lg">
            <div className="w-full h-full bg-navy/5 flex items-center justify-center">
              <span className="text-navy/20 font-serif italic text-4xl">
                {matchedImages.length > 0 ? "📸" : "📸"}
              </span>
            </div>
          </div>
          <p className="text-lg font-serif italic leading-relaxed text-charcoal max-w-sm">
            &quot;{story || "Preserving your story..."}&quot;
          </p>
        </div>

        <div className="text-xs text-charcoal-light font-bold uppercase tracking-widest border-t border-navy/10 w-full pt-4">
          PRESERVED FOREVER • MEMENTO BIOGRAPHY
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
