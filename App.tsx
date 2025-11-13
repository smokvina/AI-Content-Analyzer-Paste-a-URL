
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { analyzeUrl } from './services/geminiService';
import { UrlInputForm } from './components/UrlInputForm';
import { AnalysisResult } from './components/AnalysisResult';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GoogleIcon } from './components/icons/GoogleIcon';
import { WelcomeMessage } from './components/WelcomeMessage';
import { HistoryList } from './components/HistoryList';
import { RefreshIcon } from './components/icons/ActionIcons';

const RATE_LIMIT_COUNT = 5; // 5 requests
const RATE_LIMIT_MINUTES = 10; // per 10 minutes

const checkAndSetRateLimit = (): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_MINUTES * 60 * 1000;
  
  try {
    const historyString = localStorage.getItem('rateLimitHistory');
    const timestamps: number[] = historyString ? JSON.parse(historyString) : [];

    const recentTimestamps = timestamps.filter(ts => ts > windowStart);
    
    if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
      const oldestRequestInWindow = recentTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldestRequestInWindow + RATE_LIMIT_MINUTES * 60 * 1000 - now) / 1000);
      return { allowed: false, retryAfter: Math.max(0, retryAfterSeconds) };
    }

    const updatedTimestamps = [...recentTimestamps, now];
    localStorage.setItem('rateLimitHistory', JSON.stringify(updatedTimestamps));
    return { allowed: true };
  } catch (e) {
    console.error("Failed to process rate limit from localStorage", e);
    // If localStorage is broken, fail open to not block the user.
    return { allowed: true };
  }
};


const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('analysisHistory');
    }
  }, []);

  const validateUrl = (value: string): boolean => {
    if (!value) {
      setUrlError('Please enter a URL.');
      return false;
    }
    try {
      const parsedUrl = new URL(value);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        setUrlError('URL must start with http:// or https://');
        return false;
      }
      setUrlError(null);
      return true;
    } catch (_) {
      setUrlError('Please enter a valid URL format.');
      return false;
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (urlError) {
      validateUrl(newUrl);
    }
  };

  const runAnalysis = useCallback(async (urlToAnalyze: string) => {
    if (!validateUrl(urlToAnalyze)) {
      return;
    }
    
    setAnalysisResult(null);
    setError(null);

    const rateLimit = checkAndSetRateLimit();
    if (!rateLimit.allowed) {
        const retryMinutes = Math.ceil((rateLimit.retryAfter || 0) / 60);
        const friendlyRetryTime = retryMinutes > 0 ? `${retryMinutes} minute(s)` : 'a few moments';
        setError(`You have made too many requests. Please try again in ${friendlyRetryTime}.`);
        return;
    }

    setIsLoading(true);

    try {
      const result = await analyzeUrl(urlToAnalyze);
      setAnalysisResult(result);
      setHistory(prevHistory => {
        const updated = [urlToAnalyze, ...prevHistory.filter(h => h !== urlToAnalyze)].slice(0, 10);
        localStorage.setItem('analysisHistory', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
        let friendlyMessage = 'An unexpected error occurred during analysis. Please try again later.';
        if (e instanceof Error) {
            const lowerCaseMessage = e.message.toLowerCase();
            if (lowerCaseMessage.includes('api key')) {
                friendlyMessage = 'There seems to be an issue with the API configuration. Please contact support.';
            } else if (lowerCaseMessage.includes('rate limit exceeded')) {
                friendlyMessage = 'The analysis service is currently busy. Please try again in a few moments.';
            } else if (lowerCaseMessage.includes('network') || lowerCaseMessage.includes('fetch')) {
                friendlyMessage = 'A network error occurred. Please check your connection and try again.';
            } else if (lowerCaseMessage.includes('400') || lowerCaseMessage.includes('bad request')) {
                friendlyMessage = 'The request was malformed or the URL could not be processed. Please check the URL and try again.';
            } else if (lowerCaseMessage.includes('500') || lowerCaseMessage.includes('internal error')) {
                friendlyMessage = 'The analysis service is currently unavailable. Please try again later.';
            }
        }
        setError(friendlyMessage);
        console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleFormSubmit = () => {
    runAnalysis(url);
  };

  const handleHistorySelect = (historyUrl: string) => {
    setUrl(historyUrl);
    setUrlError(null);
    runAnalysis(historyUrl);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('analysisHistory');
  };

  const handleAnalyzeAnother = () => {
    setAnalysisResult(null);
    setUrl('');
    setError(null);
    setUrlError(null);
    inputRef.current?.focus();
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-4 mb-2">
            <GoogleIcon className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              AI Content Analyzer
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Paste a URL to get an in-depth analysis powered by Gemini and Google Search for up-to-date insights.
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <UrlInputForm
            ref={inputRef}
            url={url}
            setUrl={handleUrlChange}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            error={urlError}
          />

          {analysisResult && !isLoading && (
            <div className="mt-4 text-center">
              <button
                onClick={handleAnalyzeAnother}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 rounded-md font-semibold hover:bg-slate-600 disabled:bg-slate-800 transition-colors"
              >
                <RefreshIcon className="w-5 h-5" />
                Analyze Another URL
              </button>
            </div>
          )}

          {!analysisResult && !isLoading && (
            <HistoryList
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
              isLoading={isLoading}
            />
          )}

          <div className="mt-8 min-h-[400px] bg-slate-800/30 rounded-lg p-6 ring-1 ring-slate-700/50 backdrop-blur-sm transition-all duration-300">
            {isLoading && <LoadingSpinner />}
            {error && <div className="text-center text-red-400 p-4">{error}</div>}
            {analysisResult && <AnalysisResult result={analysisResult} />}
            {!isLoading && !error && !analysisResult && <WelcomeMessage />}
          </div>
        </div>
      </main>
       <footer className="text-center py-6 text-slate-500 text-sm">
          <p>Powered by Google Gemini</p>
        </footer>
    </div>
  );
};

export default App;
