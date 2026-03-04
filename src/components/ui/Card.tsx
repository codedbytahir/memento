import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'cream' | 'navy';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'white'
}) => {
  const variants = {
    white: "bg-white border-navy/10",
    cream: "bg-cream border-copper/10",
    navy: "bg-navy border-white/10 text-white"
  };

  return (
    <div className={`p-8 rounded-2xl shadow-xl border ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
