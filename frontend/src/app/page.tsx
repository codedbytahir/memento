'use client';

import React, { useState } from 'react';
import UploadScreen from '@/components/UploadScreen';
import InterviewScreen from '@/components/InterviewScreen';
import LoadingScreen from '@/components/LoadingScreen';
import PreviewScreen from '@/components/PreviewScreen';

type Screen = 'upload' | 'interview' | 'loading' | 'preview';

interface SessionData {
  session_id: string;
  websocket_url: string;
  user_email: string;
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('upload');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const handleStartInterview = (data: SessionData) => {
    setSessionData(data);
    setCurrentScreen('interview');
  };

  const handleFinishInterview = () => {
    setCurrentScreen('loading');
  };

  const handleLoadingComplete = () => {
    setCurrentScreen('preview');
  };

  return (
    <main className="min-h-screen bg-memento-cream">
      {currentScreen === 'upload' && (
        <UploadScreen onStart={handleStartInterview} />
      )}
      {currentScreen === 'interview' && sessionData && (
        <InterviewScreen
          sessionId={sessionData.session_id}
          wsUrl={sessionData.websocket_url}
          onFinish={handleFinishInterview}
        />
      )}
      {currentScreen === 'loading' && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}
      {currentScreen === 'preview' && sessionData && (
        <PreviewScreen
          sessionId={sessionData.session_id}
          userEmail={sessionData.user_email}
        />
      )}
    </main>
  );
}
