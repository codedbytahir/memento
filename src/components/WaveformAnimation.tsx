'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WaveformAnimationProps {
  active?: boolean;
}

const WaveformAnimation: React.FC<WaveformAnimationProps> = ({ active = true }) => {
  const bars = Array.from({ length: 8 });

  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={`w-1.5 rounded-full ${active ? 'bg-copper' : 'bg-navy/20'}`}
          animate={active ? {
            height: [12, 40, 12],
          } : {
            height: 12
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default WaveformAnimation;
