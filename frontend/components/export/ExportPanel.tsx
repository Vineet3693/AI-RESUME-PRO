'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportPanelProps {
  sessionId: string;
}

export function ExportPanel({ sessionId }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'docx' | null>(null);

  const handleExport = async (exportFormat: 'pdf' | 'docx') => {
    setIsExporting(true);
    setFormat(exportFormat);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/export/${exportFormat}?session_id=${sessionId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setFormat(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
          isExporting && format === 'pdf'
            ? 'bg-purple-500/20 text-purple-400'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105'
        )}
      >
        {isExporting && format === 'pdf' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        <span className="text-sm">PDF</span>
      </button>

      <button
        onClick={() => handleExport('docx')}
        disabled={isExporting}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
          isExporting && format === 'docx'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105'
        )}
      >
        {isExporting && format === 'docx' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        <span className="text-sm">DOCX</span>
      </button>
    </div>
  );
}
