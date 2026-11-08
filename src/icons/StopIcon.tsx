import React from 'react';

interface IconProps {
  className?: string;
}

export const StopIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="5" y="5" width="14" height="14" rx="2" />
  </svg>
);

export default StopIcon;
