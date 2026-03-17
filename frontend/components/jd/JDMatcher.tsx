'use client';

import { useState } from 'react';
import { Link2, Sparkles, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JDMatcherProps {
  sessionId: string;
}

export function JDMatcher({ sessionId }: JDMatcherProps) {
  const [jdInput, setJdInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [inputType, setInputType] = useState<'url' | 'text'>('url');

  const handleAnalyze = async () => {
    if (!jdInput.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/jd/match`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            jd_url: inputType === 'url' ? jdInput : undefined,
            jd_text: inputType === 'text' ? jdInput : undefined,
          }),
        }
      );

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setMatchScore(data.match_score);
      setMissingKeywords(data.missing_keywords || []);
      setMatchedKeywords(data.matched_keywords || []);
    } catch (error) {
      console.error('JD match error:', error);
      alert('Failed to analyze job description. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Type Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setInputType('url')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            inputType === 'url'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Link2 className="w-4 h-4" />
          URL
        </button>
        <button
          onClick={() => setInputType('text')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            inputType === 'text'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Target className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        {inputType === 'url' ? (
          <input
            type="url"
            placeholder="Paste job description URL (LinkedIn, Indeed, company site...)"
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <textarea
            placeholder="Paste the full job description here..."
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        )}

        <button
          onClick={handleAnalyze}
          disabled={!jdInput.trim() || isAnalyzing}
          className={cn(
            'w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
            jdInput.trim() && !isAnalyzing
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze Match
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {matchScore !== null && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
          {/* Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Job Match Score</div>
            <div
              className={cn(
                'text-5xl font-bold',
                matchScore >= 80
                  ? 'text-green-500'
                  : matchScore >= 60
                  ? 'text-yellow-500'
                  : 'text-red-500'
              )}
            >
              {matchScore}%
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {matchScore >= 80
                ? '🎉 Excellent match! Your resume aligns well with this role.'
                : matchScore >= 60
                ? '👍 Good match. Add missing keywords to improve.'
                : '⚠️ Low match. Consider adding more relevant skills.'}
            </div>
          </div>

          {/* Keywords */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Matched Keywords */}
            {matchedKeywords.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Matched Keywords ({matchedKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchedKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {missingKeywords.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Missing Keywords ({missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
