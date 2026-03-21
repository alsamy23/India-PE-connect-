import React from 'react';
import { KeyRound, LifeBuoy, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

interface SettingsPanelProps {
  apiStatus: 'checking' | 'ok' | 'missing' | 'quota';
  isTesting?: boolean;
  onOpenSetup?: () => void;
  onTestConnection?: () => Promise<void>;
  onOpenFeedback?: () => void;
}

const statusCopy = {
  checking: {
    label: 'Checking connection',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ok: {
    label: 'AI tools ready',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  missing: {
    label: 'AI setup needed',
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  quota: {
    label: 'Usage limit reached',
    tone: 'bg-orange-50 text-orange-700 border-orange-200',
  },
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  apiStatus,
  isTesting,
  onOpenSetup,
  onTestConnection,
  onOpenFeedback,
}) => {
  const status = statusCopy[apiStatus];

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-500">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
              {status.label}
            </span>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Settings</h1>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              Keep your Teacher Daily Assistant ready for class with quick access to AI setup, support, and connection checks.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSetup}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <KeyRound size={16} />
            Open AI setup
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'AI connection',
            description: 'Verify that generators are ready before you start planning.',
            icon: ShieldCheck,
            action: 'Check connection',
            onClick: onTestConnection,
            loading: isTesting,
            loadingLabel: 'Checking…',
          },
          {
            title: 'Setup guide',
            description: 'Review the steps to add or refresh your API key.',
            icon: Sparkles,
            action: 'Open guide',
            onClick: onOpenSetup,
          },
          {
            title: 'Feedback & support',
            description: 'Share classroom feedback or ask for help with tools.',
            icon: LifeBuoy,
            action: 'Contact support',
            onClick: onOpenFeedback,
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <item.icon size={20} />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Support</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            <button
              type="button"
              onClick={() => item.onClick?.()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {item.loading ? <RefreshCw size={15} className="animate-spin" /> : <item.icon size={15} />}
              {item.loading ? item.loadingLabel : item.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel;
