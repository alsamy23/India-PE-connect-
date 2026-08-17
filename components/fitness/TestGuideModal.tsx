import React from 'react';
import { X, Clock, Wrench, Award, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { KIFTTest } from '../../types.ts';

interface TestGuideModalProps {
  test: KIFTTest | null;
  categoryName?: string;
  onClose: () => void;
}

export const TestGuideModal: React.FC<TestGuideModalProps> = ({ test, categoryName, onClose }) => {
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
              <p className="text-slate-900 font-black text-sm">{test.duration || 'Standard Trial'}</p>
              <p className="text-slate-600 text-[11px] font-medium mt-0.5">
                {test.id === 'pushups' && 'Must be conducted over exactly 60 seconds (1 Minute). Count all valid reps.'}
                {test.id === 'curl_ups' && 'Must be conducted over exactly 60 seconds (1 Minute) or 20 reps/min cadence.'}
                {test.id === 'plate_tapping' && 'Must be conducted over exactly 30 seconds.'}
                {test.id === 'flamingo' && 'Must be conducted over exactly 60 seconds total balance duration.'}
                {test.id === 'sprint_25m' && 'Recorded in seconds (0.01s accuracy) over 25m straight runway from standing start. Tailored for compact school grounds.'}
                {test.id === 'sprint_30m' && 'Recorded in seconds (0.01s accuracy) over 30m straight runway from standing start. Official CBSE compact sprint metric.'}
                {test.id === 'sprint_50m' && 'Recorded in seconds (0.01s accuracy) from standing start.'}
                {test.id === 'run_600m' && 'Recorded in minutes and seconds (MM:SS) for 600 meters continuous pace.'}
                {test.id === 'bmi' && 'Untimed static measurement of weight (kg) and height (cm).'}
                {!['pushups','curl_ups','plate_tapping','flamingo','sprint_50m','run_600m','bmi'].includes(test.id) && 'Perform as specified under CBSE PE guidelines.'}
              </p>
            </div>

            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200/60">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Award size={16} className="text-indigo-600" />
                <span>Scoring Unit & Format</span>
              </div>
              <p className="text-indigo-900 font-black text-sm">Unit: {test.unit}</p>
              <p className="text-slate-600 text-[11px] font-medium mt-0.5">{test.scoringGuide || 'Enter raw numerical score.'}</p>
            </div>
          </div>

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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
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
