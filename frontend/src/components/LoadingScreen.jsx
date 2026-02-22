import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book } from 'lucide-react';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Organizing your memories...');

  const statusMessages = [
    'Organizing your memories...',
    'Matching photos to stories...',
    'Editing for clarity...',
    'Formatting your biography...',
    'Adding the finishing touches...'
  ];

  useEffect(() => {
    // Progress for 30 seconds
    const duration = 30000;
    const intervalTime = 100;
    const increment = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    // Change status message every 6 seconds
    const statusInterval = setInterval(() => {
      setStatus(prev => {
        const idx = statusMessages.indexOf(prev);
        return statusMessages[(idx + 1) % statusMessages.length];
      });
    }, 6000);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-memento-cream flex items-center justify-center p-4">
      <div className="text-center space-y-12 max-w-md w-full">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-memento-navy">Your biographer is at work...</h2>
          <p className="text-lg text-memento-charcoal/70">{status}</p>
        </div>

        <motion.div
          animate={{ rotateY: [0, 180, 360], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="perspective-1000"
        >
          <Book size={100} className="text-memento-navy mx-auto drop-shadow-lg" />
        </motion.div>

        <div className="w-full space-y-4">
          <div className="bg-memento-navy/10 rounded-full h-4 overflow-hidden shadow-inner">
            <motion.div
              className="bg-memento-copper h-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-sm font-medium text-memento-navy">
            <span>PRESERVING LEGACY</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <p className="text-sm text-memento-charcoal/40 italic">
          "Everyone has a story — we're honored to help preserve yours."
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
