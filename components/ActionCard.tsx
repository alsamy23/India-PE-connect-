import React from 'react';
import { ArrowRight, Loader2, LucideIcon } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  ctaLabel: string;
  tooltip: string;
  loading?: boolean;
  loadingLabel?: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  accent,
  ctaLabel,
  tooltip,
  loading = false,
  loadingLabel,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={tooltip}
      className="motion-card motion-fade-up group flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 text-left shadow-sm hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg disabled:cursor-wait disabled:opacity-80 sm:p-6 md:rounded-[2rem] md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`motion-icon motion-float flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
          <Icon size={22} />
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
          Primary action
        </span>
      </div>

      <div className="mt-6 flex-1 space-y-4 sm:mt-7 md:mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Start here</p>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl md:text-[1.4rem]">{title}</h3>
          <p className="max-w-sm text-sm leading-7 text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 sm:mt-10 sm:pt-5">
        <span className="pr-4 text-sm font-medium text-slate-700">
          {loading ? loadingLabel ?? 'Loading…' : ctaLabel}
        </span>
        <div className="motion-arrow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white sm:h-11 sm:w-11">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </div>
      </div>
    </button>
  );
};

export default ActionCard;
