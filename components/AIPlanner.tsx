
import React, { useState } from 'react';
import { Sparkles, Loader2, Download, Printer, RotateCcw, CheckCircle2, Image as ImageIcon, Clock, BookOpen, Target, GraduationCap } from 'lucide-react';
import { BoardType, LessonPlan } from '../types.ts';
import { generateLessonPlan, generateLessonDiagram } from '../services/geminiService.ts';

const AIPlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [board, setBoard] = useState<BoardType>(BoardType.CBSE);
  const [grade, setGrade] = useState('9');
  const [sport, setSport] = useState('Basketball');
  const [topic, setTopic] = useState('Defensive Positioning');
  const [plan, setPlan] = useState<LessonPlan | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await generateLessonPlan(board, grade, sport, topic);
      // Generate three diagrams as requested: Warmup, Explanation, and Game
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-8">
          <h3 className="font-black text-2xl text-slate-800 mb-8 tracking-tighter uppercase">Lesson Architect</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Curriculum Board</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" value={board} onChange={e => setBoard(e.target.value as BoardType)}>
                {Object.values(BoardType).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                <input type="text" readOnly className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-slate-500 font-bold" value="45 Mins" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sport Focus</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold" value={sport} onChange={e => setSport(e.target.value)} />
            </div>
            <button onClick={handleGenerate} disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              <span>{loading ? 'Designing...' : 'Build Pro Visual Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        {!plan && !loading ? (
          <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center">
            <ImageIcon className="text-slate-100 w-32 h-32 mb-10" />
            <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">Connected Visual Resource</h3>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed">Generated plans include triple-diagram layouts (Warmup, Theory, Game) aligned with NEP & state frameworks.</p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-[3rem] h-full flex flex-col items-center justify-center p-20">
            <div className="w-20 h-20 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Drafting Triple-Diagram Plan</h3>
            <p className="text-slate-400 font-bold animate-pulse">Consulting board-specific frameworks...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
              <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-10 text-white">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-orange-500 text-white font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-orange-600/20">{board} Standard</span>
                  <div className="flex space-x-2">
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><Printer size={20}/></button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><Download size={20}/></button>
                  </div>
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tighter leading-none">{plan.title}</h2>
                <div className="flex items-center space-x-6 text-indigo-100 text-sm font-bold uppercase tracking-widest">
                  <span className="flex items-center"><GraduationCap size={16} className="mr-2"/> Grade {plan.grade}</span>
                  <span className="flex items-center"><Clock size={16} className="mr-2"/> 45 Mins</span>
                </div>
              </div>

              <div className="p-10 space-y-16">
                {/* 1. WARM UP SECTION */}
                <section>
                  <div className="flex justify-between items-end mb-6">
                    <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">1. Warm-up (5 Minutes)</h4>
                    <span className="bg-orange-100 text-orange-600 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">Strict Timing</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <p className="text-slate-600 font-medium leading-relaxed italic">
                        {plan.activities.find(a => a.time.includes('5'))?.description}
                      </p>
                    </div>
                    {plan.warmupDiagramUrl && (
                      <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                         <img src={plan.warmupDiagramUrl} alt="Warmup Diagram" className="w-full rounded-2xl" />
                         <p className="text-center text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Warm-up Setup</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. EXPLANATION SECTION */}
                <section>
                   <div className="flex justify-between items-end mb-6">
                    <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">2. Explanation (10 Minutes)</h4>
                    <span className="bg-indigo-100 text-indigo-600 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">Technical Focus</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                         <p className="text-indigo-900 font-medium leading-relaxed">
                            {plan.activities.find(a => a.time.includes('10'))?.description}
                         </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {plan.activities.find(a => a.time.includes('10'))?.coachingCues.map((cue, i) => (
                           <span key={i} className="bg-indigo-600 text-white font-black text-[10px] px-3 py-1.5 rounded-full uppercase">" {cue} "</span>
                         ))}
                      </div>
                    </div>
                    {plan.explanationDiagramUrl && (
                      <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                         <img src={plan.explanationDiagramUrl} alt="Explanation Diagram" className="w-full rounded-2xl" />
                         <p className="text-center text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Technical Demo Diagram</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. GAME SECTION */}
                <section>
                   <div className="bg-orange-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-orange-600/20">
                    <h4 className="text-3xl font-black mb-8 uppercase tracking-tighter leading-none">3. Game Execution: {plan.suggestedGame.name}</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-widest text-orange-200">Rules & Flow</p>
                           {plan.suggestedGame.rules.map((rule, i) => (
                             <div key={i} className="flex items-start space-x-3 bg-white/10 p-4 rounded-2xl">
                               <span className="bg-white text-orange-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                               <span className="text-sm font-medium">{rule}</span>
                             </div>
                           ))}
                         </div>
                         <div className="bg-orange-700/50 p-6 rounded-3xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-2">Ground Setup</p>
                            <p className="text-sm font-bold">{plan.suggestedGame.setup}</p>
                         </div>
                      </div>
                      {plan.gameDiagramUrl && (
                        <div className="bg-white p-2 rounded-3xl shadow-2xl h-fit">
                           <img src={plan.gameDiagramUrl} alt="Game Diagram" className="w-full rounded-2xl" />
                           <p className="text-center text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest">Full Field Layout</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <div className="flex justify-center pt-10">
                  <button onClick={() => setPlan(null)} className="px-10 py-5 bg-slate-50 text-slate-400 font-black rounded-full border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center space-x-2 text-sm uppercase tracking-widest">
                    <RotateCcw size={18} />
                    <span>Construct New Visual Plan</span>
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
