import React from 'react';
import { X, Clock, Wrench, Award, CheckCircle2, ShieldCheck, HelpCircle, Play } from 'lucide-react';
import { KIFTTest } from '../../types.ts';

interface TestGuideModalProps {
  test: KIFTTest | null;
  categoryName?: string;
  onClose: () => void;
  onOpenVideo?: (test: KIFTTest) => void;
}

export const TestGuideModal: React.FC<TestGuideModalProps> = ({ test, categoryName, onClose, onOpenVideo }) => {
  if (!test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0D2B52] text-white p-6 sm:p-8 relative flex items-start justify-between border-b-4 border-[#D4A017]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/10 text-[#D4A017] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#D4A017]/30">
                {categoryName || 'CBSE KIFT Protocol'}
              </span>
              {test.duration && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-400/30">
                  <Clock size={12} />
                  {test.duration}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">{test.name}</h2>
            <p className="text-slate-300 text-xs font-medium mt-1 leading-relaxed max-w-lg">{test.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 custom-scrollbar text-slate-800">
          
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/60">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Clock size={16} className="text-amber-600" />
                <span>Test Duration / Time Limit</span>
              </div>
              <p className="text-slate-900 font-black text-sm">
                {test.id === 'curl_ups'
                  ? (categoryName?.includes('Senior') || categoryName?.includes('11') || categoryName?.includes('12')
                      ? '60 Seconds (1 Minute CBSE Board)'
                      : categoryName?.includes('Middle') || categoryName?.includes('6') || categoryName?.includes('7') || categoryName?.includes('8')
                        ? '30 Seconds (Official Khelo India)'
                        : '30s Khelo India / 60s CBSE Practical')
                  : (test.duration || 'Standard Trial')}
              </p>
              <p className="text-slate-600 text-[11px] font-medium mt-0.5">
                {test.id === 'pushups' && 'Must be conducted over exactly 60 seconds (1 Minute). Count all valid reps (Boys: standard plank; Girls: knees on mat).'}
                {test.id === 'curl_ups' && (
                  categoryName?.includes('Senior') || categoryName?.includes('11') || categoryName?.includes('12')
                    ? 'CBSE Senior Secondary (Grades 11 & 12) Physical Education Practical utilizes the 60-Second (1 Minute) timed abdominal test.'
                    : categoryName?.includes('Middle') || categoryName?.includes('6') || categoryName?.includes('7') || categoryName?.includes('8')
                      ? 'Khelo India Middle School (Grades 6-8) uses the 30-Second timed partial curl-up test to evaluate core abdominal endurance without neck strain.'
                      : 'Khelo India National Protocol uses 30 Seconds with a 10cm measuring strip; CBSE Class 9-10 Board Practical also supports 60-Second cadence.'
                )}
                {(test.id === 'shuttle_4x10' || test.id === 'shuttle_run') && 'Timed sprint agility test recorded in seconds to 0.01s precision (typical completion time ~9.0s to 15.0s).'}
                {test.id === 'plate_tapping' && 'Must be conducted over exactly 30 seconds.'}
                {test.id === 'flamingo' && 'Must be conducted over exactly 60 seconds total balance duration.'}
                {test.id === 'sprint_25m' && 'Recorded in seconds (0.01s accuracy) over 25m straight runway from standing start. Tailored for compact school grounds.'}
                {test.id === 'sprint_30m' && 'Recorded in seconds (0.01s accuracy) over 30m straight runway from standing start. Official CBSE compact sprint metric.'}
                {test.id === 'sprint_50m' && 'Recorded in seconds (0.01s accuracy) from standing start.'}
                {test.id === 'run_600m' && 'Recorded in minutes and seconds (MM:SS) for 600 meters continuous pace.'}
                {test.id === 'bmi' && 'Untimed static measurement of weight (kg) and height (cm).'}
                {!['pushups','curl_ups','plate_tapping','flamingo','sprint_50m','sprint_30m','sprint_25m','shuttle_4x10','shuttle_run','run_600m','bmi'].includes(test.id) && 'Perform as specified under CBSE PE guidelines.'}
              </p>
            </div>

            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200/60">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Award size={16} className="text-indigo-600" />
                <span>Scoring Unit & Format</span>
              </div>
              <p className="text-indigo-900 font-black text-sm">Unit: {test.unit}</p>
              <p className="text-slate-600 text-[11px] font-medium mt-0.5">
                {test.id === 'curl_ups' 
                  ? (categoryName?.includes('Senior') || categoryName?.includes('11') || categoryName?.includes('12')
                      ? 'Enter total valid repetitions completed in 60 seconds (1 minute).'
                      : categoryName?.includes('Middle') || categoryName?.includes('6') || categoryName?.includes('7') || categoryName?.includes('8')
                        ? 'Enter total valid repetitions completed in 30 seconds.'
                        : 'Enter raw rep count (30s Khelo India count or 60s CBSE count).')
                  : (test.scoringGuide || 'Enter raw numerical score.')}
              </p>
            </div>
          </div>

          {/* Specialized Curl-Ups Timing Protocol Box for 30s vs 60s */}
          {test.id === 'curl_ups' && (
            <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-amber-50/60 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={15} className="text-indigo-600" />
                  <span>Protocol Timing Standards (30s vs 60s)</span>
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-600 text-white rounded-md">
                  {categoryName || 'Active Category'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 30s Khelo India Box */}
                <div className={`p-3.5 rounded-xl border ${
                  !categoryName?.includes('Senior') && !categoryName?.includes('11') && !categoryName?.includes('12')
                    ? 'bg-white border-indigo-300 ring-2 ring-indigo-400/50 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <strong className="text-indigo-950 font-black text-[11px] uppercase">
                      1. Khelo India (KIFT) Protocol
                    </strong>
                    <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[9px] font-extrabold rounded">
                      30 Seconds
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <strong>Used in:</strong> Grades 6–10 (Ages 11–15).<br />
                    <strong>Action:</strong> Student slides fingers across a 10cm measuring strip on mat for 30 seconds.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 font-semibold">
                    Expected Range: <span className="text-indigo-700 font-black">12–26 reps in 30s</span>
                  </div>
                </div>

                {/* 60s CBSE Board Box */}
                <div className={`p-3.5 rounded-xl border ${
                  categoryName?.includes('Senior') || categoryName?.includes('11') || categoryName?.includes('12')
                    ? 'bg-white border-amber-300 ring-2 ring-amber-400/50 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <strong className="text-slate-900 font-black text-[11px] uppercase">
                      2. CBSE HPE Practical Protocol
                    </strong>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-extrabold rounded">
                      60 Seconds (1 Min)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <strong>Used in:</strong> Grades 11–12 (Ages 16–18+) & Senior Board Exams.<br />
                    <strong>Action:</strong> 1-Minute continuous or 20 reps/min cadence test.
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 font-semibold">
                    Expected Range: <span className="text-amber-800 font-black">20–48 reps in 60s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Required Equipment */}
          {test.equipment && test.equipment.length > 0 && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider mb-3">
                <Wrench size={16} className="text-[#0D2B52]" />
                <span>Required Equipment & Testing Apparatus</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {test.equipment.map((item: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Testing Protocol */}
          {test.protocol && (
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider mb-3">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Official CBSE / Khelo India Testing Procedure</span>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {test.protocol}
              </p>
            </div>
          )}

          {/* Special Guidelines for PE Teachers */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-start gap-3">
            <HelpCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950 font-medium leading-relaxed">
              <strong className="font-bold text-blue-900 uppercase block mb-1">CBSE Subject Expert Note:</strong>
              Ensure students warm up for 5–10 minutes prior to physical trials. Record exact valid repetitions or timed seconds. Scores entered into the grid automatically align with CBSE HPE Strand 1 report card outputs.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {onOpenVideo ? (
            <button
              onClick={() => {
                onClose();
                onOpenVideo(test);
              }}
              className="px-5 py-2.5 bg-[#D4A017] hover:bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <Play size={14} className="fill-slate-950" />
              <span>Watch Official Video Demo</span>
            </button>
          ) : <div />}

          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-[#0D2B52] hover:bg-[#164077] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
