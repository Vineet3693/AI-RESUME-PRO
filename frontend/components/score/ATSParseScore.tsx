'use client';

import { Progress } from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ATSParseScoreProps {
  score: number | null;
}

export function ATSParseScore({ score }: ATSParseScoreProps) {
  if (score === null) return null;

  const getColor = (score: number) => {
    if (score < 60) return 'text-red-500';
    if (score < 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBarColor = (score: number) => {
    if (score < 60) return 'bg-red-500';
    if (score < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-4 bg-card rounded-lg border shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">ATS Parse Score</h3>
      <div className="flex items-end justify-between mb-2">
        <span className={cn("text-3xl font-bold", getColor(score))}>
          {score}/100
        </span>
        <span className="text-xs text-muted-foreground max-w-[150px] text-right">
          Technical compliance - can a machine read this file?
        </span>
      </div>
      <div className="relative h-3 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-500", getBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {/* Breakdown details */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">No tables/columns</span>
          <span className="font-medium">✓</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Standard headings</span>
          <span className="font-medium">✓</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">UTF-8 clean</span>
          <span className="font-medium">✓</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contact info placement</span>
          <span className="font-medium">✓</span>
        </div>
      </div>
    </div>
  );
}
