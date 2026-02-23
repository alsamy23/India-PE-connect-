
import React, { useState } from 'react';
import { ShieldCheck, Search, Info, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { BoardType } from '../types.ts';
import { getStateRegulationInsights } from '../services/geminiService.ts';

const ComplianceAdvisor: React.FC = () => {
  const [state, setState] = useState('Maharashtra');
  const [board, setBoard] = useState<BoardType>(BoardType.STATE);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    const text = await getStateRegulationInsights(state, board);
    setInsights(text || "No insights found.");
    setLoading(false);
  };

  const states = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Tamil Nadu", "Uttar Pradesh", "West Bengal"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center">
              <ShieldCheck className="mr-2 text-indigo-600" /> Compliance Finder
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select State</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                  value={state}
                  onChange={e => setState(e.target.value)}
                >
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Education Board</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                  value={board}
                  onChange={e => setBoard(e.target.value as BoardType)}
                >
                  {Object.values(BoardType).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                <span>{loading ? 'Checking Records...' : 'Get Compliance Info'}</span>
              </button>
            </div>
          </div>

          <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-500/20">
            <h4 className="font-black text-lg mb-2 uppercase tracking-tight">Need Manual?</h4>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">Download official HPE (Health and Physical Education) guidelines for CBSE schools.</p>
            <button className="flex items-center space-x-2 bg-white text-orange-600 font-black px-6 py-3 rounded-2xl text-xs hover:bg-orange-50 transition-colors uppercase">
              <FileText size={16} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!insights && !loading ? (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                <ShieldCheck size={48} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Regulatory Analysis Hub</h3>
              <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
                Select your State and Board to get real-time analysis of marks weightage, mandatory hours, and curriculum frameworks based on NEP-2020.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-[2.5rem] h-full min-h-[500px] flex flex-col items-center justify-center p-12">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Consulting State Frameworks</h3>
              <p className="text-slate-400 font-medium">Matching your board with latest regulatory updates...</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 h-full animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
              <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-50">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{state} {board} Insights</h3>
                  <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center">
                    <CheckCircle2 size={12} className="mr-1" /> Live Verified Data
                  </p>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none text-slate-600 font-medium leading-loose space-y-6">
                {insights?.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <div className="mt-12 bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="flex items-start space-x-4 relative z-10">
                  <AlertCircle size={32} className="text-orange-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-lg mb-1 uppercase tracking-tight">Disclaimer</h4>
                    <p className="text-indigo-200 text-sm leading-relaxed">
                      This analysis is based on available public frameworks and AI synthesis. Always verify with your specific school administration or local District Education Officer (DEO).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceAdvisor;
