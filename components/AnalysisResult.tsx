
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyIcon, CheckIcon } from './icons/ActionIcons';

interface AnalysisResultProps {
  result: string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-slate-700/50 rounded-md text-slate-300 hover:bg-slate-600/70 transition-all focus:opacity-100"
        aria-label="Copy analysis to clipboard"
      >
        {isCopied ? (
          <CheckIcon className="w-5 h-5 text-emerald-400" />
        ) : (
          <CopyIcon className="w-5 h-5" />
        )}
      </button>

      <div className="prose prose-invert prose-slate max-w-none 
                     prose-headings:text-emerald-300 
                     prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-slate-100
                     prose-blockquote:border-l-emerald-400 prose-blockquote:text-slate-400
                     prose-code:text-amber-300 prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-slate-700/50 prose-code:p-1 prose-code:rounded-md
                     prose-li:marker:text-emerald-400
                     prose-table:w-full prose-table:table-auto
                     prose-thead:border-b prose-thead:border-slate-600
                     prose-th:px-4 prose-th:py-2 prose-th:font-semibold prose-th:text-left
                     prose-tbody:divide-y prose-tbody:divide-slate-700
                     prose-td:px-4 prose-td:py-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
      </div>
    </div>
  );
};
