'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const LoadingBook: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center space-y-8 h-40">
      {/* Waveform container */}
      <div className="flex items-center space-x-1 h-12">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-navy/40 rounded-full"
            animate={{
              height: [12, 40, 12],
              backgroundColor: ['#1F386466', '#D4A574', '#1F386466'],
              scaleX: [1, 0.5, 0],
              opacity: [1, 0.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Book Icon appearing */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-navy"
        initial={{ scale: 0, opacity: 0, rotateY: -90 }}
        animate={{
          scale: [0, 1, 1],
          opacity: [0, 1, 1],
          rotateY: [-90, 0, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <BookOpen size={80} className="text-copper" />
      </motion.div>
    </div>
  );
};

export default LoadingBook;
