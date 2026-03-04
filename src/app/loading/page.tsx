'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingBook from '@/components/LoadingBook';
import Image from 'next/image';

const loadingMessages = [
  "Gathering your precious memories...",
  "Editing your family stories...",
  "Selecting the perfect photos...",
  "Generating your biography...",
  "Finishing your story with care..."
];

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const sessionId = localStorage.getItem('memento_session_id');

    const progressInterval = setInterval(async () => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Stop at 95 until status is completed
        return prev + 1;
      });

      // Poll API status
      if (sessionId) {
        try {
          const response = await fetch(`/api/status/${sessionId}`);
          const data = await response.json();
          if (data.status === 'completed') {
            setProgress(100);
            localStorage.setItem('memento_story', data.editedStory || "");
            localStorage.setItem('memento_matched_images', JSON.stringify(data.matchedImages || []));
            clearInterval(progressInterval);
            router.push('/preview');
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      }
    }, 1000);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 6000); // Change message every 6 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.svg"
          alt="Memento"
          width={512}
          height={150}
          className="h-12 w-auto mb-4"
        />
        <h1 className="text-3xl font-serif font-bold text-navy mb-2">
          Your biographer is at work...
        </h1>
        <p className="text-lg text-charcoal-light italic font-medium">
          {loadingMessages[messageIndex]}
        </p>
      </div>

      <div className="flex flex-col items-center space-y-8 w-full max-w-md">
        <div className="h-40 flex items-center justify-center">
          <LoadingBook />
        </div>

        <div className="w-full space-y-4">
          <div className="h-4 bg-navy/10 rounded-full overflow-hidden border border-navy/20 relative">
            <div
              className="h-full bg-copper transition-all duration-300 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-navy/70">
            <span>PRESERVING STORY</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
