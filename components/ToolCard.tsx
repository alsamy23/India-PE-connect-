import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  mostUsed?: boolean;
  tooltip: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  mostUsed = false,
  tooltip,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className="motion-card motion-fade-up group flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm hover:-translate-y-1 hover:border-slate-300 hover:shadow-md sm:p-6 sm:rounded-[1.75rem]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="motion-icon flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
          <Icon size={20} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {mostUsed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <Star size={12} className="fill-current" />
              Most used
            </span>
          )}
          {badge && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex-1 space-y-3 sm:mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Tool</p>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-sm leading-7 text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900 sm:mt-8">
        Open tool
        <ArrowRight size={15} className="motion-arrow" />
      </div>
    </button>
  );
};

export default ToolCard;
