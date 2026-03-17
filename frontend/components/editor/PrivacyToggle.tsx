'use client';

import { useState } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import { useResumeStore } from '@/hooks/useResumeStore';
import { cn } from '@/lib/utils';

export function PrivacyToggle() {
  const { privacyMode, setPrivacyMode } = useResumeStore();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    // In real implementation, this would call API to update session
    setPrivacyMode(!privacyMode);
    setTimeout(() => setIsToggling(false), 500);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
        privacyMode
          ? 'bg-green-500/20 border border-green-500/50 text-green-400'
          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
      )}
    >
      {privacyMode ? (
        <ShieldCheck className="w-4 h-4" />
      ) : (
        <Shield className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {privacyMode ? 'Privacy Mode ON' : 'Privacy Mode OFF'}
      </span>
      {privacyMode && (
        <span className="text-xs opacity-70 ml-1">• Local AI</span>
      )}
    </button>
  );
}
