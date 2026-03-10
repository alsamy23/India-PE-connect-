import React, { useState } from 'react';
import { Zap, Loader2, Share2, RotateCcw, AlertTriangle, Clock, Shield, Lightbulb, ChevronRight } from 'lucide-react';
import { generateSubstitutePlan } from '../services/geminiService.ts';
import { Language } from '../types.ts';

const SubstitutePlan: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [grade, setGrade] = useState('6-8');
  const [duration, setDuration] = useState('40 min');
  const [equipment, setEquipment] = useState('Cones, balls (basic)');
  const [language, setLanguage] = useState<Language>('English');

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try {
      const result = await generateSubstitutePlan(grade, duration, equipment, language);
      setPlan(result);
    } catch (e: any) {
      setError(e.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!plan) return;
    const activities = plan.mainActivities?.map((a: any) => `• ${a.name} (${a.duration}): ${a.instructions}`).join('\n') || '';
    const text = `⚡ Emergency PE Lesson Plan\n\n🏃 ${plan.title}\nGrade: ${plan.gradeLevel} | Time: ${plan.duration}\n\n🔥 Warmup: ${plan.warmup?.activity} (${plan.warmup?.duration})\n\n📋 Activities:\n${activities}\n\n✅ Tips: ${plan.teacherTips?.[0] || ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-amber-100 rounded-xl"><Zap className="text-amber-600" size={20} /></div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Emergency Substitute Plan</h2>
            <p className="text-sm text-slate-500">Quick lesson plan when the regular teacher is absent</p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 mb-6">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-medium">Designed to be easy for any teacher to run — no specialist PE knowledge required!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Grade / Class</label>
            <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              {['1-3','4-5','6-8','9-10','11-12'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              {['30 min','40 min','45 min','60 min'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Available Equipment</label>
            <input value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="e.g. Cones, balls, rope, no equipment" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              {['English','Hindi','Tamil','Marathi','Bengali'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-sm uppercase tracking-wide hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={18} /> Generating Plan...</> : <><Zap size={18} /> Generate Emergency Plan</>}
        </button>
      </div>

      {plan && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
            <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">⚡ Emergency Lesson Ready</p>
            <h3 className="text-xl font-black">{plan.title}</h3>
            <p className="text-amber-100 text-sm mt-1">Grade {plan.gradeLevel} · {plan.duration}</p>
          </div>

          <div className="p-6 space-y-5">
            {plan.warmup && (
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-xs font-black text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock size={12} /> Warmup ({plan.warmup.duration})</p>
                <p className="font-bold text-green-900 text-sm">{plan.warmup.activity}</p>
                <p className="text-xs text-green-700 mt-1">{plan.warmup.instructions}</p>
              </div>
            )}

            {plan.mainActivities?.map((a: any, i: number) => (
              <div key={i} className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{i + 1}</span>
                  <p className="font-black text-indigo-900 text-sm">{a.name}</p>
                  <span className="ml-auto text-xs text-indigo-500 font-bold">{a.duration}</span>
                </div>
                <p className="text-xs text-indigo-800 mb-1">{a.instructions}</p>
                {a.variations && <p className="text-xs text-indigo-600 italic">💡 Variation: {a.variations}</p>}
              </div>
            ))}

            {plan.cooldown && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-black text-blue-700 uppercase tracking-wider mb-2">Cool Down ({plan.cooldown.duration})</p>
                <p className="font-bold text-blue-900 text-sm">{plan.cooldown.activity}</p>
                <p className="text-xs text-blue-700 mt-1">{plan.cooldown.instructions}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.safetyNotes?.length > 0 && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs font-black text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1"><Shield size={12} /> Safety Notes</p>
                  {plan.safetyNotes.map((n: string, i: number) => <p key={i} className="text-xs text-red-800 flex items-start gap-1"><ChevronRight size={12} className="mt-0.5 flex-shrink-0" />{n}</p>)}
                </div>
              )}
              {plan.teacherTips?.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <p className="text-xs font-black text-yellow-700 uppercase tracking-wider mb-2 flex items-center gap-1"><Lightbulb size={12} /> Teacher Tips</p>
                  {plan.teacherTips.map((t: string, i: number) => <p key={i} className="text-xs text-yellow-800 flex items-start gap-1"><ChevronRight size={12} className="mt-0.5 flex-shrink-0" />{t}</p>)}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3 flex-wrap">
            <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
              <Share2 size={16} /> Share on WhatsApp
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
              🖨️ Print
            </button>
            <button onClick={() => setPlan(null)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
              <RotateCcw size={16} /> New Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubstitutePlan;
