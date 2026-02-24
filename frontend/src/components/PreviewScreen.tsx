'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Download, CheckCircle, Loader2 } from 'lucide-react';

interface PreviewScreenProps {
  sessionId: string;
  userEmail: string;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ sessionId, userEmail }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkPDF = async () => {
      try {
        const response = await fetch(`/api/pdf-status/${sessionId}`);
        const data = await response.json();
        if (data.ready) {
          setPdfUrl(data.url);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    interval = setInterval(checkPDF, 3000);
    checkPDF();

    return () => clearInterval(interval);
  }, [sessionId]);

  const sendEmail = async () => {
    setIsSending(true);
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      setSent(true);
    } catch (err) {
      alert("Failed to send email. You can still download the PDF below.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-memento-cream p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle size={48} className="text-memento-sage" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-memento-navy">
            Your Biography is Ready
          </h1>
          <p className="text-lg text-memento-charcoal/70">
            We've carefully crafted your story based on your memories and photos.
          </p>
        </header>

        <div className="bg-white border-8 border-memento-navy/5 rounded-2xl overflow-hidden shadow-2xl min-h-[600px] flex items-center justify-center relative">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[800px]"
              title="Biography Preview"
            />
          ) : (
            <div className="text-center space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-memento-navy mx-auto" />
              <p className="text-xl font-medium text-memento-navy font-serif">Finalizing your PDF...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={sendEmail}
            disabled={sent || isSending || !pdfUrl}
            className="flex items-center justify-center space-x-3 bg-memento-navy text-white py-5 rounded-xl font-bold text-lg hover:bg-memento-navy/90 transition-all disabled:opacity-50 shadow-lg"
          >
            {isSending ? <Loader2 className="animate-spin" /> : sent ? <CheckCircle size={24} /> : <Mail size={24} />}
            <span>{sent ? 'Sent to ' + userEmail : 'Send to My Email'}</span>
          </button>

          <a
            href={pdfUrl || '#'}
            download="my-memento-biography.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center space-x-3 bg-white border-2 border-memento-navy text-memento-navy py-5 rounded-xl font-bold text-lg hover:bg-memento-navy/5 transition-all shadow-lg ${!pdfUrl ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Download size={24} />
            <span>Download PDF</span>
          </a>
        </div>

        <footer className="text-center pt-10 border-t border-memento-navy/10">
          <p className="text-memento-charcoal/50 font-serif italic">
            "Preserving the moments that tell our story."
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PreviewScreen;
