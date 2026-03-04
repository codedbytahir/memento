'use client';

import React from 'react';
import UploadZone from '@/components/UploadZone';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();

  const handleStart = (data: { sessionId: string; websocket_url: string; email: string }) => {
    // Save to localStorage for persistence across pages
    localStorage.setItem('memento_session_id', data.sessionId);
    localStorage.setItem('memento_user_email', data.email);
    localStorage.setItem('memento_ws_url', data.websocket_url);

    router.push('/interview');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        <div className="text-center flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Memento - Preserve Your Story"
            width={512}
            height={150}
            className="h-12 w-auto mb-2"
            priority
          />
          <h1 className="text-4xl font-serif font-bold text-navy">Preserve Your Story</h1>
          <p className="text-charcoal/70 mt-3 font-medium">Capture the moments that matter, forever.</p>
        </div>

        <UploadZone onStart={handleStart} />

        {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && (
          <div className="mt-8 flex justify-center">
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-300">
              🔧 DEV MODE - No AWS charges
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
