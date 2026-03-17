'use client';

import { CheckCircle, AlertCircle, XCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'contact', name: 'Contact Info', icon: CheckCircle },
  { id: 'summary', name: 'Summary', icon: AlertCircle },
  { id: 'skills', name: 'Skills', icon: CheckCircle },
  { id: 'experience', name: 'Experience', icon: AlertCircle },
  { id: 'projects', name: 'Projects', icon: XCircle },
  { id: 'education', name: 'Education', icon: CheckCircle },
];

export function SectionFeedback() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Section Status</h3>
      </div>
      
      <div className="p-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const status = section.id === 'contact' || section.id === 'skills' || section.id === 'education'
            ? 'complete'
            : section.id === 'summary' || section.id === 'experience'
            ? 'warning'
            : 'missing';

          return (
            <button
              key={section.id}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50',
                status === 'complete' && 'bg-green-50/50',
                status === 'warning' && 'bg-yellow-50/50',
                status === 'missing' && 'bg-red-50/50'
              )}
            >
              {status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
              {status === 'missing' && <PlusCircle className="w-5 h-5 text-red-500" />}
              
              <span className={cn(
                'text-sm font-medium',
                status === 'complete' && 'text-green-700',
                status === 'warning' && 'text-yellow-700',
                status === 'missing' && 'text-red-700'
              )}>
                {section.name}
              </span>
              
              <span className={cn(
                'ml-auto text-xs',
                status === 'complete' && 'text-green-600',
                status === 'warning' && 'text-yellow-600',
                status === 'missing' && 'text-red-600'
              )}>
                {status === 'complete' && '✓'}
                {status === 'warning' && '⚠'}
                {status === 'missing' && '+'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
