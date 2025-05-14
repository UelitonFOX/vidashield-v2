import React from 'react';

export default function Database({ className = 'w-6 h-6 text-cyan-400' }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M12 2 L12 22 M2 12 L22 12' /> {/* Placeholder */}
    </svg>
  );
}
