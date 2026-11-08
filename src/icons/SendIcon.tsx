import React from 'react';

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 21l21-9L2 3v7l15 2-15 2v7z"
      fill="currentColor"
    />
  </svg>
);

export default SendIcon;

