'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2 } from 'lucide-react';

interface InterviewScreenProps {
  sessionId: string;
  wsUrl: string;
  onFinish: () => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ sessionId, wsUrl, onFinish }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("Hi! I'm your biographer. I've received your photos. Tell me, what memories do they bring back?");
  const [isConnecting, setIsConnecting] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!wsUrl) return;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnecting(false);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.audio_response) {
          const audio = new Audio(`data:audio/wav;base64,${data.audio_response}`);
          audio.play();
        }
        if (data.ai_question) {
          setAiQuestion(data.ai_question);
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    return () => wsRef.current?.close();
  }, [wsUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            wsRef.current?.send(JSON.stringify({
              action: 'message',
              audio_chunk: base64Audio
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      alert("Please allow microphone access to tell your story.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFinish = async () => {
    try {
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
    } catch (e) {
      console.error(e);
    }
    onFinish();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 bg-memento-cream">
      <header className="w-full flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-memento-sage'}`} />
          <span className="font-medium text-memento-navy">{isRecording ? 'Recording...' : 'Connected'}</span>
        </div>
        <button
          onClick={handleFinish}
          className="text-memento-navy font-semibold border-2 border-memento-navy/20 px-4 py-1 rounded-full hover:bg-memento-navy/5 transition-all"
        >
          End Session
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full space-y-12">
        <div className="h-32 flex items-center justify-center space-x-1 w-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: isRecording ? [20, Math.random() * 80 + 20, 20] : 20 }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
              className="w-2 bg-memento-navy/30 rounded-full"
            />
          ))}
        </div>

        <div className="text-center space-y-6">
          <AnimatePresence mode='wait'>
            <motion.p
              key={aiQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-serif font-medium text-memento-navy leading-relaxed italic"
            >
              "{aiQuestion}"
            </motion.p>
          </AnimatePresence>
        </div>
      </main>

      <footer className="w-full max-w-lg flex flex-col items-center space-y-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`w-full py-8 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 shadow-xl transition-all ${
            isRecording ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-memento-navy text-white'
          }`}
        >
          <Mic size={32} />
          <span>{isRecording ? 'Recording...' : 'Hold to Respond'}</span>
        </motion.button>

        <button
          onClick={handleFinish}
          className="w-full bg-white border-2 border-memento-navy text-memento-navy py-4 rounded-xl font-semibold hover:bg-memento-navy/5 transition-all"
        >
          Finish My Story
        </button>
      </footer>

      {isConnecting && (
        <div className="fixed inset-0 bg-memento-cream flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-memento-navy mx-auto" />
            <p className="text-xl font-semibold text-memento-navy">Establishing secure connection...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewScreen;
