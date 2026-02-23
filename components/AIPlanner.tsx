
import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, Download, Printer, RotateCcw, Image as ImageIcon, Clock, GraduationCap, AlertCircle, PlayCircle, Layers, ClipboardList, Target, User, CalendarDays, BookOpen, PenTool, Languages, FileText } from 'lucide-react';
import { BoardType, LessonPlan, Language } from '../types.ts';
import { generateLessonPlan, generateLessonDiagram } from '../services/geminiService.ts';

declare var html2pdf: any;

const AIPlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [teacherName, setTeacherName] = useState('Mr. Coach');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [board, setBoard] = useState<BoardType>(BoardType.CBSE);
  const [grade, setGrade] = useState('6');
  const [sport, setSport] = useState('Football');
  const [topic, setTopic] = useState('Dribbling and Passing');
  const [duration, setDuration] = useState('40 min');
  const [language, setLanguage] = useState<Language>('English');
  
  const [plan, setPlan] = useState<LessonPlan | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setLoadingStep(`Generating in ${language}...`);
    setError(null);
    try {
      const generated = await generateLessonPlan(
        board, 
        grade, 
        sport, 
        topic, 
        teacherName, 
        duration, 
        date,
        language
      );
      
      setPlan({ 
        ...generated, 
        period: "1",
        termWeek: "Term 1 / Wk 2",
        teacher: teacherName,
        date: date,
        duration: duration
      });

      setLoadingStep('Visualizing Drills...');
      
      // Parallel generation for speed
      const [warmupUrl, explanationUrl, gameUrl] = await Promise.all([
        generateLessonDiagram(generated.warmupDiagramPrompt, 'warmup drill'),
        generateLessonDiagram(generated.explanationDiagramPrompt, 'technical skill demonstration'),
        generateLessonDiagram(generated.gameDiagramPrompt, 'small sided game')
      ]);
      
      setPlan(prev => prev ? ({ 
        ...prev, 
        warmupDiagramUrl: warmupUrl, 
        explanationDiagramUrl: explanationUrl,
        gameDiagramUrl: gameUrl 
      }) : null);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "The AI Service failed to respond correctly. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleExportPdf = () => {
    if (!contentRef.current) return;
    
    // @ts-ignore
    if (typeof html2pdf === 'undefined') {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    const opt = {
      margin: 10,
      filename: `LessonPlan_${sport}_${grade}_${language}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    // @ts-ignore
    html2pdf().set(opt).from(contentRef.current).save();
  };

  const handleExportWord = () => {
    if (!plan) return;
    
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>PE Lesson Plan</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        h1 { color: #1e3a8a; text-transform: uppercase; }
        h2 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .section-title { font-weight: bold; color: #1e3a8a; text-transform: uppercase; font-size: 14px; margin-top: 20px; border-bottom: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .label { font-size: 10px; color: #666; text-transform: uppercase; }
      </style>
      </head>
      <body>
        <h1>${sport}: ${plan.topic}</h1>
        <p><b>Grade:</b> ${grade} | <b>Board:</b> ${board} | <b>Teacher:</b> ${plan.teacher}</p>
        <p><b>Date:</b> ${plan.date} | <b>Duration:</b> ${plan.duration} | <b>Period:</b> ${plan.period}</p>
        
        <div class="section-title">Learning Objectives</div>
        <ul>
          <li><b>Know:</b> ${plan.objectives.know}</li>
          <li><b>Understand:</b> ${plan.objectives.understand}</li>
          <li><b>Apply:</b> ${plan.objectives.beAbleTo}</li>
        </ul>

        <div class="section-title">Success Criteria</div>
        <ul>
          <li><b>All:</b> ${plan.successCriteria.all}</li>
          <li><b>Most:</b> ${plan.successCriteria.most}</li>
          <li><b>Some:</b> ${plan.successCriteria.some}</li>
        </ul>

        <div class="section-title">Equipment & Safety</div>
        <p><b>Equipment:</b> ${plan.equipment?.join(', ')}</p>
        <p><b>Teaching Aids:</b> ${plan.teachingAids?.join(', ')}</p>
        <p><b>Safety:</b> ${plan.safety?.join(', ')}</p>
        <p><b>Vocabulary:</b> ${plan.keyVocabulary?.join(', ')}</p>

        <div class="section-title">1. Starter Activity (${plan.starter.time})</div>
        <p><b>${plan.starter.title}</b></p>
        <p>${plan.starter.description}</p>

        <div class="section-title">2. Main Activities (${plan.mainActivity.time})</div>
        ${plan.mainActivity.activities.map((act, i) => `
          <p><b>${i+1}. ${act.title}</b></p>
          <p>${act.description}</p>
          <p><i>Coaching Points: ${act.coachingPoints.join(', ')}</i></p>
        `).join('')}

        <div class="section-title">3. Plenary & Cooling Down (${plan.plenary.time})</div>
        <p><b>${plan.plenary.title}</b></p>
        <p>${plan.plenary.description}</p>

        <div class="section-title">Differentiation & Assessment</div>
        <p><b>Differentiation:</b> ${plan.differentiation}</p>
        <p><b>Assessment:</b> ${plan.criticalThinking}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LessonPlan_${sport}_${grade}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4 space-y-8 animate-slide-up print:hidden">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100 sticky top-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 rotate-2">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800 tracking-tighter uppercase leading-none">Lesson Planner</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Daily Plan Generator</p>
            </div>
          </div>
          
          <div className="space-y-5">
             {/* Language Selector */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <label className="flex items-center text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 px-1">
                    <Languages size={12} className="mr-1" /> Output Language
                </label>
                <select 
                    className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 text-sm"
                    value={language}
                    onChange={e => setLanguage(e.target.value as Language)}
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teacher</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700 text-sm" value={teacherName} onChange={e => setTeacherName(e.target.value)} />
               </div>
               <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Date</label>
                <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700 text-sm" value={date} onChange={e => setDate(e.target.value)} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Board</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700 text-sm"
                  value={board}
                  onChange={e => setBoard(e.target.value as BoardType)}
                >
                  {Object.values(BoardType).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Grade</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700 text-sm"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => <option key={i} value={String(i + 1)}>{i + 1}</option>)}
                </select>
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sport / Activity</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700 text-sm" value={sport} onChange={e => setSport(e.target.value)} />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Specific Topic</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700 text-sm" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              <span className="text-sm uppercase tracking-wider">{loading ? loadingStep || 'Processing...' : 'Generate Plan'}</span>
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-start space-x-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
           {!plan ? (
             <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center">
               <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                 <PenTool size={32} className="text-slate-300" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Lesson Canvas</h3>
               <p className="text-slate-400 font-medium">Your generated plan will appear here.</p>
             </div>
           ) : (
             <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100 print:hidden">
                 <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Plan Preview</h2>
                 <div className="flex space-x-3">
                    <button onClick={() => {setPlan(null); setLanguage('English');}} className="p-3 text-slate-400 hover:text-indigo-600 font-bold flex items-center space-x-2">
                       <RotateCcw size={16} /> <span>Reset</span>
                    </button>
                    <button onClick={handleExportWord} className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-blue-100 transition-all">
                       <FileText size={18} /> <span>Word</span>
                     </button>
                     <button onClick={handleExportPdf} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all">
                        <Download size={18} /> <span>PDF</span>
                    </button>
                 </div>
               </div>

               {/* Printable Area */}
               <div ref={contentRef} className="space-y-8 text-slate-900" id="print-area">
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div>
                      <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{sport}</h1>
                      <input 
                        className="text-xl text-slate-600 font-medium bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none w-full"
                        value={plan.topic}
                        onChange={(e) => setPlan({...plan, topic: e.target.value})}
                      />
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Grade {grade}</div>
                       <div className="text-lg font-black">{board} Curriculum</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:border-slate-300">
                     <div>
                       <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</span>
                       <span className="font-bold">{plan.date}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</span>
                       <span className="font-bold">{plan.duration}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teacher</span>
                       <span className="font-bold">{plan.teacher}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period</span>
                       <span className="font-bold">{plan.period}</span>
                     </div>
                  </div>

                  {/* Equipment & Safety */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-3">Equipment & Teaching Aids</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                           {plan.equipment?.map((item, i) => (
                             <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">{item}</span>
                           ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {plan.teachingAids?.map((item, i) => (
                             <span key={i} className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-600">{item}</span>
                           ))}
                        </div>
                     </div>
                     <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h4 className="font-black text-red-800 uppercase tracking-widest text-xs mb-3">Safety & Vocabulary</h4>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                           {plan.safety?.map((item, i) => (
                             <li key={i} className="text-xs font-bold text-red-700">{item}</li>
                           ))}
                        </ul>
                        <div className="flex flex-wrap gap-2">
                           {plan.keyVocabulary?.map((item, i) => (
                             <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black uppercase tracking-tighter text-slate-500">{item}</span>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Learning Objectives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="space-y-4">
                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-sm border-b pb-2">Learning Objectives</h4>
                        <div className="space-y-3">
                           <div className="flex items-start">
                             <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                             <p className="text-sm"><strong>Know:</strong> {plan.objectives.know}</p>
                           </div>
                           <div className="flex items-start">
                             <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                             <p className="text-sm"><strong>Understand:</strong> {plan.objectives.understand}</p>
                           </div>
                           <div className="flex items-start">
                             <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                             <p className="text-sm"><strong>Apply:</strong> {plan.objectives.beAbleTo}</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="font-black text-emerald-600 uppercase tracking-widest text-sm border-b pb-2">Success Criteria</h4>
                        <div className="space-y-3">
                           <div className="flex items-start">
                             <Target size={14} className="mt-1 mr-3 text-emerald-500 flex-shrink-0" />
                             <p className="text-sm"><strong>All:</strong> {plan.successCriteria.all}</p>
                           </div>
                           <div className="flex items-start">
                             <Target size={14} className="mt-1 mr-3 text-emerald-500 flex-shrink-0" />
                             <p className="text-sm"><strong>Most:</strong> {plan.successCriteria.most}</p>
                           </div>
                           <div className="flex items-start">
                             <Target size={14} className="mt-1 mr-3 text-emerald-500 flex-shrink-0" />
                             <p className="text-sm"><strong>Some:</strong> {plan.successCriteria.some}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Lesson Phases */}
                  <div className="space-y-6">
                    {/* Starter */}
                    <div className="border-l-4 border-indigo-500 pl-6 py-2">
                       <div className="flex justify-between items-center mb-2">
                          <h4 className="font-black text-slate-800 text-lg">1. Starter Activity</h4>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full uppercase">{plan.starter.time}</span>
                       </div>
                       <p className="font-bold text-slate-700 mb-1">{plan.starter.title}</p>
                       <p className="text-slate-600 text-sm mb-4 leading-relaxed">{plan.starter.description}</p>
                       {plan.warmupDiagramUrl && (
                         <div className="w-48 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                           <img src={plan.warmupDiagramUrl} className="w-full h-full object-cover" alt="Warmup" />
                         </div>
                       )}
                    </div>

                    {/* Main */}
                    <div className="border-l-4 border-orange-500 pl-6 py-2">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="font-black text-slate-800 text-lg">2. Main Activities</h4>
                          <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-black rounded-full uppercase">{plan.mainActivity.time}</span>
                       </div>
                       
                       <div className="space-y-6">
                         {plan.mainActivity?.activities?.map((act, i) => (
                           <div key={i} className="bg-slate-50 p-5 rounded-2xl print:bg-transparent print:p-0 print:mb-4">
                              <h5 className="font-bold text-slate-800 mb-2 flex items-center">
                                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs mr-2">{i+1}</span>
                                {act.title}
                              </h5>
                              <p className="text-slate-600 text-sm mb-3 leading-relaxed">{act.description}</p>
                              <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coaching Points</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {act.coachingPoints?.map((cp, cpi) => (
                                    <span key={cpi} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">{cp}</span>
                                  ))}
                                </div>
                              </div>
                           </div>
                         ))}
                       </div>
                       
                       <div className="flex gap-4 mt-4">
                          {plan.explanationDiagramUrl && (
                            <div className="w-1/2 h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                              <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">Technical</span>
                              <img src={plan.explanationDiagramUrl} className="w-full h-full object-cover" alt="Drill" />
                            </div>
                          )}
                          {plan.gameDiagramUrl && (
                            <div className="w-1/2 h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                               <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">Game</span>
                              <img src={plan.gameDiagramUrl} className="w-full h-full object-cover" alt="Game" />
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Plenary */}
                    <div className="border-l-4 border-emerald-500 pl-6 py-2">
                       <div className="flex justify-between items-center mb-2">
                          <h4 className="font-black text-slate-800 text-lg">3. Plenary & Cooling Down</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full uppercase">{plan.plenary.time}</span>
                       </div>
                       <p className="font-bold text-slate-700 mb-1">{plan.plenary.title}</p>
                       <p className="text-slate-600 text-sm leading-relaxed">{plan.plenary.description}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 mt-8">
                     <div>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Differentiation (SEN/High Ability)</h5>
                       <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">{plan.differentiation}</p>
                     </div>
                     <div>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assessment Opportunities</h5>
                       <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">{plan.criticalThinking}</p>
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
