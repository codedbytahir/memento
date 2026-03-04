import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  multiline?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  multiline = false,
  className = '',
  ...props
}) => {
  const baseStyles = "w-full px-4 py-4 rounded-lg border border-navy/20 focus:outline-none focus:ring-2 focus:ring-copper bg-white transition-all text-charcoal placeholder-charcoal/30";

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-semibold text-navy uppercase tracking-wider">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          className={`${baseStyles} ${className}`}
          rows={4}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={`${baseStyles} ${className}`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
};

export default Input;
