'use client';

import { useParams } from 'next/navigation';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import { ATSParseScore } from '@/components/score/ATSParseScore';
import { HealthScore } from '@/components/score/HealthScore';
import { PrivacyToggle } from '@/components/editor/PrivacyToggle';
import { ExportPanel } from '@/components/export/ExportPanel';
import { JDMatcher } from '@/components/jd/JDMatcher';
import { SectionFeedback } from '@/components/feedback/SectionFeedback';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useResumeStore } from '@/hooks/useResumeStore';
import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EditorPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [content, setContent] = useState('');
  const [showJDMatcher, setShowJDMatcher] = useState(false);
  
  const { 
    atsParseScore, 
    healthScore, 
    privacyMode,
    careerLevel,
    industry,
    setScores,
    setCareerLevel,
    setIndustry 
  } = useResumeStore();

  const { isConnected, error } = useWebSocket({
    sessionId,
    onAnalysisResult: (result) => {
      setScores(result.atsParseScore, result.healthScore);
      // Color tags are applied directly in the editor via the hook
    },
  });

  // Simulate initial data loading (in real app, fetch from API)
  useEffect(() => {
    // These would come from the upload response in a real implementation
    setCareerLevel('mid');
    setIndustry('software_eng');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              
              <div>
                <h1 className="text-xl font-bold text-white">AI Resume Pro</h1>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="capitalize">{careerLevel}</span>
                  <span>•</span>
                  <span className="capitalize">{industry?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-white/70">
                  {isConnected ? 'Live Analysis' : 'Disconnected'}
                </span>
              </div>

              {/* Privacy Mode */}
              <PrivacyToggle />

              {/* Export Button */}
              <ExportPanel sessionId={sessionId} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scores Bar */}
            <div className="grid grid-cols-2 gap-4">
              <ATSParseScore score={atsParseScore} />
              <HealthScore score={healthScore} />
            </div>

            {/* Editor */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Resume Editor</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Real-time AI analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <ResumeEditor
                  sessionId={sessionId}
                  initialContent=""
                  onContentChange={setContent}
                />
              </div>
            </div>

            {/* Job Description Matcher */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <button
                onClick={() => setShowJDMatcher(!showJDMatcher)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">Job Description Matcher</h3>
                    <p className="text-sm text-gray-500">Compare your resume against a job posting</p>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showJDMatcher ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showJDMatcher && (
                <div className="p-6 border-t border-gray-100">
                  <JDMatcher sessionId={sessionId} />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Feedback */}
          <div className="space-y-4">
            <SectionFeedback />
            
            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">Pro Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Green lines are strong - keep them as is</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  <span>Yellow lines can be improved with metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>Red lines need immediate attention</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">✨</span>
                  <span>Click red/yellow lines for AI suggestions</span>
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Lines Analyzed</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Suggestions</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Changes Made</span>
                  <span className="text-white font-medium">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
