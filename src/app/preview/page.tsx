'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import PDFPreview from '@/components/PDFPreview';
import Image from 'next/image';

export default function PreviewPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('memento_session_id');
    const storedUserEmail = localStorage.getItem('memento_user_email');
    if (!storedSessionId) {
      router.push('/');
    } else {
      setSessionId(storedSessionId);
      setUserEmail(storedUserEmail);
    }
  }, [router]);

  const handleSendEmail = async () => {
    if (!sessionId) return;
    setIsSending(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await response.json();
      if (data.sent) {
        alert("Your biography has been sent to your email!");
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (error) {
      alert("Error sending email.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = async () => {
    // PDF download logic
    await import('@/lib/pdf/generator').then(({ generatePDF }) => {
      generatePDF("pdf-content", `memento_biography_${sessionId}.pdf`);
    });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center p-4 py-12 animate-fade-in">
      <div className="w-full max-w-4xl space-y-8 flex flex-col items-center">
        <div className="text-center flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Memento"
            width={512}
            height={150}
            className="h-12 w-auto mb-4"
          />
          <h1 className="text-4xl font-serif font-bold text-navy">
            ✓ Your Biography is Ready
          </h1>
          <p className="text-lg text-charcoal-light font-medium italic mt-2">
            Preserved for your family and future generations.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-navy/10 relative overflow-hidden group">
          <div id="pdf-content" className="w-full bg-white">
            <PDFPreview sessionId={sessionId || ""} />
          </div>
        </div>

        <div className="w-full max-w-lg space-y-4">
          <Button
            onClick={handleSendEmail}
            variant="navy"
            size="lg"
            className="w-full font-bold shadow-lg h-16 text-lg"
            isLoading={isSending}
          >
            📧 Send to My Email
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="lg"
            className="w-full font-bold h-16 text-lg text-copper border-copper hover:bg-copper/10"
          >
            ↓ Download PDF
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="lg"
            className="w-full text-charcoal-light font-medium hover:text-navy"
          >
            Start a New Story
          </Button>
        </div>
      </div>
    </div>
  );
}
