import React, { useState } from 'react';
import { Sparkles, Loader2, Download, Printer, RotateCcw, Image as ImageIcon, Clock, GraduationCap, AlertCircle, PlayCircle, Layers, ClipboardList, Target } from 'lucide-react';
import { BoardType, LessonPlan } from '../types.ts';
import { generateLessonPlan, generateLessonDiagram } from '../services/geminiService.ts';

const AIPlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<BoardType>(BoardType.CBSE);
  const [grade, setGrade] = useState('9');
  const [sport, setSport] = useState('Cricket');
  const [topic, setTopic] = useState('Batting Technique');
  const [plan, setPlan] = useState<LessonPlan | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const generated = await generateLessonPlan(board, grade, sport, topic);
      // Generate diagrams as requested
      const [warmupUrl, explanationUrl, gameUrl] = await Promise.all([
        generateLessonDiagram(generated.warmupDiagramPrompt, 'warmup'),
        generateLessonDiagram(generated.explanationDiagramPrompt, 'technical-demo'),
        generateLessonDiagram(generated.gameDiagramPrompt, 'full-field')
      ]);
      setPlan({ 
        ...generated, 
        warmupDiagramUrl: warmupUrl, 
        explanationDiagramUrl: explanationUrl,
        gameDiagramUrl: gameUrl 
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The AI Service is currently unavailable. Please check your Vercel Environment Variables (API_KEY).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-8 animate-slide-up">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 sticky top-8">
          <div className="flex items-center space-x-4 mb-10">
            <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200 rotate-2">
              <Sparkles size={28} />
            </div>
            <div>
              <h3 className="font-black text-2xl text-slate-800 tracking-tighter uppercase leading-none">Architect</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Lesson Designer</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Board Context</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all appearance-none cursor-pointer" 
                value={board} 
                onChange={e => setBoard(e.target.value as BoardType)}
              >
                {Object.values(BoardType).map(b => <option key={b} value={b}>{b} Curriculum</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Grade</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all" value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
              <div className="group opacity-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Time</label>
                <input type="text" readOnly className="w-full bg-slate-100 border border-slate-100 rounded-[1.5rem] px-6 py-4 text-slate-500 font-bold" value="45 Mins" />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Sport / Activity</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all" value={sport} onChange={e => setSport(e.target.value)} />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Focus Topic</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-start space-x-3 text-red-600 text-xs font-bold leading-relaxed animate-in fade-in zoom-in">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
              <span className="text-lg tracking-tight uppercase">{loading ? 'Synthesizing...' : 'Build Visual Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="lg:col-span-8 min-h-[700px]">
        {!plan && !loading ? (
          <div className="bg-white border-4 border-dashed border-slate-100 rounded-[4rem] h-full flex flex-col items-center justify-center p-16 text-center group transition-all hover:border-indigo-100">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-indigo-500 rounded-full scale-150 blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative w-40 h-40 bg-slate-50 rounded-[3rem] flex items-center justify-center border-2 border-slate-100 group-hover:rotate-3 transition-transform">
                <ImageIcon className="text-slate-200 w-20 h-20 group-hover:text-indigo-200 transition-colors" />
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-800 mb-6 tracking-tighter leading-tight max-w-sm">
              Your Professional <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4">Visual Resource</span>
            </h3>
            <p className="text-slate-400 max-w-md font-bold leading-relaxed mb-10 text-lg">
              Plans include board-aligned timing, technical coaching cues, and AI-generated triple diagrams for class deployment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <ClipboardList className="mx-auto text-slate-300 mb-2" size={20} />
                <p className="text-[10px] font-black text-slate-400 uppercase">NEP Standards</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Layers className="mx-auto text-slate-300 mb-2" size={20} />
                <p className="text-[10px] font-black text-slate-400 uppercase">3 Diagrams</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Clock className="mx-auto text-slate-300 mb-2" size={20} />
                <p className="text-[10px] font-black text-slate-400 uppercase">Strict Timing</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-[4rem] h-full flex flex-col items-center justify-center p-24 text-center border border-slate-100 shadow-sm">
            <div className="relative mb-12">
              <div className="w-32 h-32 border-[12px] border-slate-50 border-t-indigo-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tighter">Drafting Plan...</h3>
            <div className="space-y-3">
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Mapping {board} Framework...</p>
               <p className="text-slate-400 font-medium text-sm">Synthesizing technical diagrams for {sport}...</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-900/10 overflow-hidden border border-slate-100 mb-12">
              {/* Header Gradient */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-900 to-slate-950 p-12 text-white relative">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="bg-orange-500 text-white font-black text-[10px] px-6 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-orange-600/30">Official {board} Format</span>
                      <span className="bg-white/10 text-indigo-100 font-black text-[10px] px-6 py-2 rounded-full uppercase tracking-widest backdrop-blur-md">Grade {plan.grade}</span>
                    </div>
                    <h2 className="text-5xl font-black mb-6 tracking-tighter leading-none">{plan.title}</h2>
                    <div className="flex items-center space-x-10 text-indigo-100 text-sm font-bold uppercase tracking-widest">
                       <span className="flex items-center"><Target size={18} className="mr-3 text-orange-400"/> {plan.sport}</span>
                       <span className="flex items-center"><Clock size={18} className="mr-3 text-orange-400"/> 45 Minute Class</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all shadow-xl backdrop-blur-md"><Printer size={24}/></button>
                    <button className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all shadow-xl backdrop-blur-md"><Download size={24}/></button>
                  </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[150px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
              </div>

              <div className="p-12 space-y-24">
                {/* 1. WARM UP SECTION */}
                <section>
                  <div className="flex items-center space-x-4 mb-10">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-xl shadow-inner">1</div>
                    <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">The Warm-up (05')</h4>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col justify-center">
                      <p className="text-slate-600 font-bold text-lg leading-relaxed italic">
                        {plan.activities.find(a => a.time.includes('5'))?.description || plan.activities[0]?.description}
                      </p>
                    </div>
                    {plan.warmupDiagramUrl && (
                      <div className="bg-white p-3 rounded-[3rem] shadow-2xl border border-slate-50 group hover:scale-[1.02] transition-transform">
                         <img src={plan.warmupDiagramUrl} alt="Warmup Diagram" className="w-full rounded-[2.5rem] shadow-inner" />
                         <div className="py-4 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Visualization: Warm-up</p>
                         </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. THE GAME SECTION */}
                <section>
                   <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-3xl shadow-slate-900/20 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-12">
                         <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">3</div>
                         <h4 className="text-4xl font-black uppercase tracking-tighter leading-none">Game Play: {plan.suggestedGame.name}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                        <div className="space-y-8">
                           <div className="space-y-4">
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Rules of Engagement</p>
                             {plan.suggestedGame.rules.map((rule, i) => (
                               <div key={i} className="flex items-start space-x-4 bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                                 <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i+1}</span>
                                 <span className="text-lg font-bold leading-tight">{rule}</span>
                                </div>
                             ))}
                           </div>
                           <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Tactical Setup</p>
                              <p className="text-lg font-bold leading-relaxed">{plan.suggestedGame.setup}</p>
                           </div>
                        </div>
                        {plan.gameDiagramUrl && (
                          <div className="bg-white p-3 rounded-[3rem] shadow-3xl">
                             <img src={plan.gameDiagramUrl} alt="Game Diagram" className="w-full rounded-[2.5rem]" />
                             <p className="text-center text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest">Master Field Layout</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Visual Accent */}
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-20 -mb-20"></div>
                  </div>
                </section>

                <div className="flex justify-center pt-12">
                  <button onClick={() => setPlan(null)} className="px-12 py-6 bg-slate-50 text-slate-400 font-black rounded-[2.5rem] border-2 border-slate-100 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center space-x-4 text-sm uppercase tracking-widest group">
                    <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                    <span>Construct New Visual Resource</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPlanner;
