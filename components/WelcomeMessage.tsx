
import React from 'react';

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);


export const WelcomeMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <InfoIcon className="w-16 h-16 text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2">Ready for Analysis</h2>
            <p className="max-w-md">
                Enter a URL above to begin. The AI will perform a comprehensive analysis of the page's content, providing structured insights, FAQs, and an optimized rewrite of the text.
            </p>
        </div>
    );
}
