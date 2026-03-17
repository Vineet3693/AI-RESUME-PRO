'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const industries = [
  { id: 'ai_ml', name: 'AI & Machine Learning', icon: '🤖', color: 'from-purple-500 to-pink-500' },
  { id: 'software_eng', name: 'Software Engineering', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { id: 'data_science', name: 'Data Science', icon: '📊', color: 'from-green-500 to-emerald-500' },
  { id: 'finance', name: 'Finance', icon: '💰', color: 'from-yellow-500 to-orange-500' },
  { id: 'product_manager', name: 'Product Management', icon: '📱', color: 'from-red-500 to-pink-500' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: 'from-teal-500 to-cyan-500' },
  { id: 'marketing', name: 'Marketing', icon: '📢', color: 'from-pink-500 to-rose-500' },
  { id: 'design_ux', name: 'Design & UX', icon: '🎨', color: 'from-indigo-500 to-purple-500' },
  { id: 'consulting', name: 'Consulting', icon: '💼', color: 'from-slate-500 to-gray-500' },
  { id: 'operations', name: 'Operations', icon: '⚙️', color: 'from-orange-500 to-red-500' },
  { id: 'legal', name: 'Legal', icon: '⚖️', color: 'from-blue-600 to-indigo-600' },
  { id: 'research', name: 'Research', icon: '🔬', color: 'from-violet-500 to-purple-500' },
  { id: 'core_engineering', name: 'Core Engineering', icon: '🏗️', color: 'from-amber-500 to-orange-500' },
  { id: 'general', name: 'General', icon: '📄', color: 'from-gray-500 to-slate-500' },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (!selectedIndustry) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('industry', selectedIndustry);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      router.push(`/editor/${data.session_id}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/80">Powered by AI • 100% Free • No PII Storage</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6">
            AI Resume{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Pro
            </span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Industry-grade resume analyzer with real-time color-coded feedback, 
            dual scoring system, and AI-powered optimization. Better than Resume Worded & Jobscan.
          </p>

          <div className="flex justify-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>ATS Parse Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Health Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>AI Rewrites</span>
            </div>
          </div>
        </div>

        {/* Step 1: Industry Selection */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Step 1: Choose Your Industry
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={cn(
                  'group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105',
                  selectedIndustry === industry.id
                    ? `border-transparent bg-gradient-to-r ${industry.color} shadow-2xl shadow-purple-500/25`
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                )}
              >
                <div className="text-4xl mb-3">{industry.icon}</div>
                <div className={cn(
                  'font-medium',
                  selectedIndustry === industry.id ? 'text-white' : 'text-white/80'
                )}>
                  {industry.name}
                </div>
                {selectedIndustry === industry.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Upload */}
        {selectedIndustry && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Step 2: Upload Your Resume
            </h2>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300',
                dragActive
                  ? 'border-purple-400 bg-purple-500/10 scale-105'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              )}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <p className="text-xl font-semibold text-white mb-2">
                    {isUploading ? 'Uploading...' : 'Drop your resume here'}
                  </p>
                  <p className="text-white/60">
                    PDF, DOCX, or plain text • Max 2MB
                  </p>
                </div>

                <div className="flex justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>DOCX</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>TXT</span>
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Analyzing your resume...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">100ms</div>
                <div className="text-xs text-white/60 mt-1">Analysis Speed</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-pink-400">15+</div>
                <div className="text-xs text-white/60 mt-1">Industries</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-cyan-400">$0</div>
                <div className="text-xs text-white/60 mt-1">Cost to Run</div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Dual Scoring System</h3>
            <p className="text-white/60">
              Separate ATS Parse Score and Resume Health Score. Know exactly what to fix - technical compliance or content quality.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🌈</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Real-Time Color Feedback</h3>
            <p className="text-white/60">
              Green, yellow, red inline highlighting as you edit. Every line tagged with specific rules and AI suggestions.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Privacy First</h3>
            <p className="text-white/60">
              No PII in logs. AES-256 encryption at rest. Local LLM mode with Ollama. Your data never leaves your machine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
