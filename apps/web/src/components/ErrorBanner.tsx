import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore.js';

export const ErrorBanner: React.FC = () => {
  const { errorMessage, clearError } = useGameStore();

  if (!errorMessage) return null;

  return (
    <div className="bg-case-red/20 border-b border-case-red/40 text-case-paper px-4 py-2.5 flex items-center justify-between text-xs font-mono animate-fadeIn">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-case-red flex-shrink-0" />
        <span>{errorMessage}</span>
      </div>
      <button
        onClick={clearError}
        className="p-1 hover:text-case-amber focus:outline-none"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
