import React from 'react';

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded-xl animate-pulse ${className}`} />
);

export const LessonPlanSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <SkeletonBlock className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-16" />)}
      </div>
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-5/6 mb-2" />
      <SkeletonBlock className="h-4 w-4/6" />
    </div>
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <SkeletonBlock className="h-5 w-1/4 mb-4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mb-4">
          <SkeletonBlock className="h-4 w-1/3 mb-2" />
          <SkeletonBlock className="h-3 w-full mb-1" />
          <SkeletonBlock className="h-3 w-5/6 mb-1" />
          <SkeletonBlock className="h-3 w-4/6" />
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <SkeletonBlock className="h-5 w-1/4 mb-4" />
      <SkeletonBlock className="h-32" />
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse space-y-3">
    <SkeletonBlock className="h-4 w-1/4" />
    <SkeletonBlock className="h-5 w-3/4" />
    <SkeletonBlock className="h-3 w-full" />
    <SkeletonBlock className="h-3 w-5/6" />
    <SkeletonBlock className="h-8 w-full mt-2" />
  </div>
);

export const StreamingText: React.FC<{ text: string; label?: string }> = ({ text, label = 'Generating...' }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100">
    <div className="flex items-center gap-2 mb-4">
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <span className="text-sm font-bold text-indigo-600">{label}</span>
    </div>
    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
      {text}
      <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse" />
    </div>
  </div>
);

export default { SkeletonBlock, LessonPlanSkeleton, CardSkeleton, StreamingText };
