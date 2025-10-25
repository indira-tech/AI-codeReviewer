import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CodeInput from './components/CodeInput';
import ReviewOutput from './components/ReviewOutput';
import { reviewCode, addCommentsToCode } from './services/geminiService';
import { analyzeCodeOffline } from './services/offlineAnalysisService';

export interface Review {
  summary: string;
  detailed: string;
}

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('auto');
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCommenting, setIsCommenting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isManualOffline, setIsManualOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const effectiveIsOffline = isManualOffline || !isOnline;

  const handleReview = useCallback(async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');
    setReview(null);

    try {
      let result;
      if (effectiveIsOffline) {
        result = analyzeCodeOffline(code, language);
      } else {
        result = await reviewCode(code, language);
      }
      setReview(result);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(`Failed to get code review. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, effectiveIsOffline]);

  const handleAddComments = useCallback(async () => {
    if (!code.trim() || effectiveIsOffline) return;

    setIsCommenting(true);
    setError('');

    try {
      const commentedCode = await addCommentsToCode(code, language);
      setCode(commentedCode);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(`Failed to add comments. ${errorMessage}`);
    } finally {
      setIsCommenting(false);
    }
  }, [code, language, effectiveIsOffline]);


  return (
    <div className="bg-transparent text-slate-200 min-h-screen font-sans">
      <Header 
        isManualOffline={isManualOffline} 
        onToggle={() => setIsManualOffline(prev => !prev)} 
      />
      <main className="container mx-auto p-4 md:p-6 flex flex-col gap-6">
        <CodeInput
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          onReview={handleReview}
          onAddComments={handleAddComments}
          isLoading={isLoading}
          isCommenting={isCommenting}
          isOffline={effectiveIsOffline}
        />
        <ReviewOutput review={review} isLoading={isLoading} error={error} />
      </main>
    </div>
  );
};

export default App;