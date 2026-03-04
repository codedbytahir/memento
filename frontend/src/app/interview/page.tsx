'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WaveformAnimation from '@/components/WaveformAnimation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Image from 'next/image';

export default function InterviewPage() {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('memento_session_id');
    if (!storedSessionId) {
      router.push('/');
    } else {
      setSessionId(storedSessionId);
    }
  }, [router]);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const currentTranscript = localStorage.getItem('memento_transcript') || "";
    const updatedTranscript = currentTranscript + "\n" + answer;
    localStorage.setItem('memento_transcript', updatedTranscript);
    setAnswer('');
  };

  const handleFinish = async () => {
    const transcript = localStorage.getItem('memento_transcript') || "";
    if (transcript.trim() === "" && answer.trim() !== "") {
      localStorage.setItem('memento_transcript', answer);
    } else if (answer.trim() !== "") {
      localStorage.setItem('memento_transcript', transcript + "\n" + answer);
    }

    const finalTranscript = localStorage.getItem('memento_transcript') || "";

    // Trigger Nova processing (don't wait for it here, loading page will poll status)
    fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, transcript: finalTranscript })
    });

    router.push('/loading');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-navy text-white p-6 rounded-t-xl flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">🎙️ Recording...</span>
        </div>
        <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={handleFinish}>
          End Session
        </Button>
      </div>

      <div className="flex-1 w-full max-w-lg flex flex-col items-center space-y-12 animate-fade-in pt-12">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Memento"
            width={256}
            height={75}
            className="h-8 w-auto mb-4"
          />
          <div className="h-24 flex items-center justify-center">
            <WaveformAnimation active={true} />
          </div>
        </div>

        <div className="text-center px-4">
          <h2 className="text-3xl font-serif font-bold text-navy mb-4">
            "Tell me about your earliest memory at the beach..."
          </h2>
          <p className="text-charcoal-light font-medium italic">
            AI Biographer is listening...
          </p>
        </div>

        <div className="w-full space-y-6">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer goes here..."
            className="min-h-[120px] resize-none"
            multiline
          />
          <div className="flex flex-col space-y-4">
            <Button onClick={handleSubmit} variant="copper" size="lg" className="w-full font-bold">
              Submit Answer
            </Button>
            <Button onClick={handleFinish} variant="outline" size="lg" className="w-full font-bold">
              Finish My Story
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
