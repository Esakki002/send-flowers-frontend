import React from 'react';
import RoseViewer from '../components/RoseViewer';

const ModelDemo: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--primary)]">
      <div className="w-96 h-96">
        <RoseViewer className="w-full h-full" />
      </div>
    </div>
  );
};

export default ModelDemo;

