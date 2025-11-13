
import React from 'react';

interface UrlInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string | null;
}

const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

export const UrlInputForm = React.forwardRef<HTMLInputElement, UrlInputFormProps>(
  ({ url, setUrl, onSubmit, isLoading, error }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit();
    };
    
    return (
      <form onSubmit={handleSubmit} noValidate>
        <div className={`flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg ring-1 ${error ? 'ring-red-500' : 'ring-slate-700'} focus-within:ring-2 ${error ? 'focus-within:ring-red-500' : 'focus-within:ring-blue-500'} transition-all duration-300`}>
          <input
            ref={ref}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/some/article"
            disabled={isLoading}
            className="w-full bg-transparent p-2 text-slate-200 placeholder-slate-500 focus:outline-none"
            required
            aria-invalid={!!error}
            aria-describedby="url-error"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              'Analyzing...'
            ) : (
               <>
                Analyze
                <ArrowRightIcon className="w-5 h-5" />
               </>
            )}
          </button>
        </div>
         {error && <p id="url-error" className="text-red-400 text-sm mt-2 px-2" role="alert">{error}</p>}
      </form>
    );
  }
);

UrlInputForm.displayName = 'UrlInputForm';
