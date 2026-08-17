import React, { useState } from 'react';
import { Info, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import { KIFTTest } from '../../types.ts';

interface TestFieldTooltipProps {
  test: KIFTTest;
  onOpenModal: (test: KIFTTest) => void;
  compact?: boolean;
  label?: string;
}

export const TestFieldTooltip: React.FC<TestFieldTooltipProps> = ({
  test,
  onOpenModal,
  compact = false,
  label
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getMethodSummary = (testId: string): string => {
    switch (testId) {
      case 'pushups':
        return '60s Time Limit. Boys: Standard plank posture (elbows to 90°). Girls: Modified push-up with knees on mat.';
      case 'curl_ups':
        return '60s Time Limit. Lie flat, knees at 140°, slide fingers across 10cm strip. Head must touch mat on down phase.';
      case 'plate_tapping':
        return '30s Time Limit. Rapid back-and-forth hand taps between two 20cm discs across center table.';
      case 'flamingo':
        return '60s Total Balance Duration. Pause stopwatch on every stumble or fall. Count total balance breaks.';
      case 'sprint_50m':
        return 'Timed 50m Linear Sprint. Standing start behind line. Record time in seconds to 0.01s accuracy.';
      case 'sprint_25m':
        return 'Timed 25m Linear Race/Sprint. Standing start. Measures explosive acceleration & speed for compact grounds without 100m tracks.';
      case 'sprint_30m':
        return 'Timed 30m Linear Race/Sprint. Standing start. Standard CBSE sprint metric on compact grounds (0.01s accuracy).';
      case 'run_600m':
        return 'Continuous 600m Run/Walk. Record time in MM:SS (Minutes:Seconds) format for aerobic stamina.';
      case 'sit_reach':
        return '2 Attempts. Sit barefoot with knees locked flat. Reach smoothly along box ruler; hold max reach for 2s.';
      case 'broad_jump':
        return '2 Attempts. Two-footed standing takeoff and landing. Measure from line to rear heel landing point.';
      case 'shuttle_run':
      case 'shuttle_4x10':
        return 'Timed 4x10m Shuttle. Sprint 10m 4 times, retrieving two 5x5x10cm wooden blocks across lines.';
      case 'bmi':
        return 'Untimed Measurement. Height in cm using stadiometer + Weight in kg using calibrated scale.';
      default:
        return 'Perform test according to standard CBSE Health & Physical Education (HPE) guidelines.';
    }
  };

  const getDurationBadge = (duration?: string, testId?: string): string => {
    if (testId === 'pushups' || testId === 'curl_ups' || testId === 'flamingo') return '⏱️ 60 Seconds (1 Min)';
    if (testId === 'plate_tapping') return '⏱️ 30 Seconds';
    if (testId === 'sprint_50m') return '⏱️ Timed Dash';
    if (testId === 'run_600m') return '⏱️ MM:SS Format';
    if (testId === 'bmi') return '📐 Untimed';
    return duration ? `⏱️ ${duration}` : '⏱️ Standard Trial';
  };

  return (
    <div className="relative inline-flex items-center group">
      {label && <span className="mr-1 text-slate-700 font-bold">{label}</span>}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal(test);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1 transition-all rounded-lg cursor-pointer ${
          compact
            ? 'p-1 text-[#D4A017] hover:text-white hover:bg-white/20'
            : 'px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
        }`}
        title={`Click for full CBSE ${test.name} Guide & Method`}
      >
        <Info size={compact ? 13 : 14} className="shrink-0" />
        {!compact && (
          <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
            CBSE Guide
          </span>
        )}
      </button>

      {/* Floating Hover Tooltip Popup */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 pointer-events-none text-left border border-slate-700 animate-in fade-in zoom-in-95"
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-800">
            <span className="font-black text-xs text-[#D4A017] uppercase tracking-wider truncate">
              {test.name}
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[9px] font-black uppercase tracking-widest shrink-0 border border-emerald-500/30">
              {getDurationBadge(test.duration, test.id)}
            </span>
          </div>

          {/* Test Method / Standard */}
          <div className="text-[11px] font-medium text-slate-300 space-y-1.5 leading-snug">
            <div className="flex items-start gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>CBSE Method:</strong> {getMethodSummary(test.id)}</span>
            </div>
          </div>

          {/* Tooltip Footer CTA */}
          <div className="mt-2.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-indigo-300 font-bold">
            <span>Unit: {test.unit}</span>
            <span className="flex items-center gap-1 text-[#D4A017] font-black uppercase">
              Click for full guide <ExternalLink size={10} />
            </span>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
