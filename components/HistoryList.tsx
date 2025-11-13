
import React from 'react';
import { ClockIcon, TrashIcon } from './icons/HistoryIcons';

interface HistoryListProps {
  history: string[];
  onSelect: (url: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear, isLoading }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-slate-300 flex items-center gap-2">
           <ClockIcon className="w-6 h-6 text-slate-400" />
           Analysis History
        </h2>
        <button 
            onClick={onClear} 
            className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 disabled:text-slate-600"
            disabled={isLoading}
            aria-label="Clear analysis history"
        >
          <TrashIcon className="w-4 h-4" />
          Clear
        </button>
      </div>
      <div className="bg-slate-800/30 rounded-lg ring-1 ring-slate-700/50 p-4 space-y-2">
          {history.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-md animate-fade-in">
              <span className="text-slate-300 truncate text-sm flex-1 mr-4" title={item}>{item}</span>
              <button
                onClick={() => onSelect(item)}
                disabled={isLoading}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Re-analyze
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};
