import React from 'react';
import { GenerationStatus } from '../types';

interface ControlsProps {
  onGenerate: () => void;
  status: GenerationStatus;
  hasPuppy: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onGenerate, status, hasPuppy }) => {
  return (
    <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onGenerate();
        }}
        disabled={status.isGenerating}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all
          border-2 border-red-800
          ${status.isGenerating 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95'
          }
        `}
      >
        {status.isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5 text-red-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Paper Art...
          </>
        ) : (
          <>
            <span className="text-xl">✂️</span>
            {hasPuppy ? 'New Puppy' : 'Create Puppy'}
          </>
        )}
      </button>
      
      {!hasPuppy && !status.isGenerating && (
        <div className="bg-white/90 p-4 rounded-xl shadow-md border border-red-100 max-w-xs text-center animate-bounce">
          <p className="text-red-900 font-serif">
            Click the button to cut a unique paper puppy!
          </p>
        </div>
      )}

      {status.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm max-w-xs">
          {status.error}
        </div>
      )}
    </div>
  );
};