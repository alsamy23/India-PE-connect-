import React, { useState, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Download, 
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  CalendarDays,
  FileJson,
  AlertCircle,
  FileSpreadsheet,
  FileType,
  RotateCcw,
  Languages
} from 'lucide-react';
import { BoardType, YearlyPlan, Language } from '../types.ts';
import { generateYearlyPlan } from '../services/aiService.ts';

declare var html2pdf: any;

const SAMPLE_CALENDAR_TEXT = `01.04.2026 Commencement
15.08.2026 Independence Day
02.10.2026 Gandhi Jayanti
14.10.2026 Pooja Holidays
24.12.2026 Christmas Holidays`;

const YearlyPlanner: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [grade, setGrade] = useState('6');
  const [board, setBoard] = useState<BoardType>(BoardType.CBSE);
  const [frequency, setFrequency] = useState('2');
  const [duration, setDuration] = useState('40 min');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [language, setLanguage] = useState<Language>('English');
  const [calendarText, setCalendarText] = useState(SAMPLE_CALENDAR_TEXT);
  const [term1Focus, setTerm1Focus] = useState('Locomotor Skills & Basic Fitness');
  const [term2Focus, setTerm2Focus] = useState('Football & Team Games');
  
  const [plan, setPlan] = useState<YearlyPlan | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateYearlyPlan(grade, board, frequency, calendarText, term1Focus, term2Focus, startDate, duration, language);
      setPlan(result);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = (t: number, m: number, w: number, field: any, value: string) => {
    if (!plan || !plan.terms) return;
    const newPlan = { ...plan };
    if (newPlan.terms[t]?.months?.[m]?.weeks?.[w]) {
        newPlan.terms[t].months[m].weeks[w] = { ...newPlan.terms[t].months[m].weeks[w], [field]: value };
        setPlan(newPlan);
    }
  };

  const handleExportPdf = () => {
    if (!contentRef.current) {
      alert("Error: Print area not found.");
      return;
    }

    // @ts-ignore
    if (typeof html2pdf === 'undefined') {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    const opt = {
      margin: 10,
      filename: `PE_Yearly_Plan_Grade${grade}_${board}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    // @ts-ignore
    html2pdf().set(opt).from(contentRef.current).save();
  };

  const handleExportWord = () => {
    if (!plan || !plan.terms || plan.terms.length === 0) {
      alert("No data available to export.");
      return;
    }

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>PE Yearly Plan</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        h1 { color: #1e3a8a; text-transform: uppercase; }
        h2 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        h3 { color: #374151; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 11px; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .holiday { background-color: #fff7ed; color: #9a3412; }
      </style>
      </head>
      <body>
        <h1>PE Yearly Planner - Grade ${plan.grade} (${plan.board})</h1>
        <p>Academic Year: ${plan.academicYear} | Sessions: ${frequency}/week | Duration: ${plan.duration}</p>
        <p>Generated on: ${plan.generatedDate}</p>
    `;

    plan.terms.forEach(term => {
      html += `<h2>${term.termName}</h2>`;
      term.months?.forEach(month => {
        html += `<h3>${month.monthName}</h3>`;
        html += `
          <table>
            <thead>
              <tr>
                <th width="50">Week</th>
                <th width="100">Dates</th>
                <th width="80">Status</th>
                <th width="150">Topic</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
        `;
        month.weeks?.forEach(week => {
          const isHoliday = week.status !== 'Instructional';
          html += `
            <tr class="${isHoliday ? 'holiday' : ''}">
              <td>${week.weekNumber}</td>
              <td>${week.dates || '-'}</td>
              <td>${week.status}</td>
              <td><b>${week.topic || '-'}</b></td>
              <td>${week.details || '-'}</td>
            </tr>
          `;
        });
        html += `</tbody></table>`;
      });
    });

    html += `</body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `PE_Yearly_Plan_Grade${grade}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (!plan || !plan.terms || plan.terms.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csv = "\uFEFF"; // BOM for UTF-8
    csv += "Term,Month,Week,Dates,Status,Topic,Details\n";
    
    plan.terms.forEach(term => {
      const safeTerm = term.termName.replace(/"/g, '""');
      term.months?.forEach(month => {
        const safeMonth = month.monthName.replace(/"/g, '""');
        month.weeks?.forEach(week => {
          const row = [
            `"${safeTerm}"`,
            `"${safeMonth}"`,
            `"${week.weekNumber}"`,
            `"${(week.dates || '').replace(/"/g, '""')}"`,
            `"${week.status}"`,
            `"${(week.topic || '').replace(/"/g, '""')}"`,
            `"${(week.details || '').replace(/"/g, '""')}"`
          ];
          csv += row.join(",") + "\n";
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `PE_Yearly_Plan_Grade${grade}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 print:shadow-none print:p-0">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Yearly Planner</h2>
          {step === 4 && (
             <button onClick={() => {setStep(1); setPlan(null);}} className="flex items-center space-x-2 text-slate-400 font-bold hover:text-indigo-600 transition-colors">
                <RotateCcw size={18} />
                <span>Start New Plan</span>
             </button>
          )}
        </div>

        <div className="mt-8">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
              <div className="space-y-6">
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase mb-2">Target Grade</label>
                   <input type="text" value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" />
                </div>
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase mb-2">Board</label>
                   <select value={board} onChange={e => setBoard(e.target.value as BoardType)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold">
                     {Object.values(BoardType).map(b => <option key={b} value={b}>{b}</option>)}
                   </select>
                </div>
              </div>
              <div className="space-y-6">
                <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Duration</label>
                <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" /></div>
                <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" /></div>
                
                {/* Language Selector */}
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase mb-2 flex items-center">
                     <Languages size={14} className="mr-1" /> Language
                   </label>
                   <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold">
                     <option value="English">English</option>
                     <option value="Hindi">Hindi</option>
                     <option value="Marathi">Marathi</option>
                     <option value="Tamil">Tamil</option>
                     <option value="Bengali">Bengali</option>
                   </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="animate-in fade-in">
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Calendar Text (Holidays & Events)</label>
                <textarea value={calendarText} onChange={e => setCalendarText(e.target.value)} className="w-full h-64 p-4 bg-slate-50 border rounded-xl font-mono text-sm" placeholder="Paste school calendar here..." />
             </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-4">Term 1 Focus</h4>
                    <input type="text" value={term1Focus} onChange={e => setTerm1Focus(e.target.value)} className="w-full p-4 bg-white border rounded-xl font-bold" />
                 </div>
                 <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 mb-4">Term 2 Focus</h4>
                    <input type="text" value={term2Focus} onChange={e => setTerm2Focus(e.target.value)} className="w-full p-4 bg-white border rounded-xl font-bold" />
                 </div>
              </div>
              <div className="flex justify-center">
                 <button onClick={handleGenerate} disabled={loading} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center space-x-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                   <span>{loading ? 'Designing Master Plan...' : 'Generate Plan'}</span>
                 </button>
              </div>
            </div>
          )}

          {step === 4 && plan && (
             <div className="animate-in fade-in slide-in-from-bottom-12 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-6 print:hidden gap-4">
                   <div>
                     <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Grade {plan.grade} Plan</h3>
                     <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{plan.academicYear} | ${plan.board}</p>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     <button onClick={handleExportExcel} className="flex items-center space-x-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors">
                        <FileSpreadsheet size={18} />
                        <span>Excel</span>
                     </button>
                     <button onClick={handleExportWord} className="flex items-center space-x-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                        <FileText size={18} />
                        <span>Word</span>
                     </button>
                     <button onClick={handleExportPdf} className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        <Download size={18} />
                        <span>PDF</span>
                     </button>
                   </div>
                </div>

                <div ref={contentRef} className="print:p-4">
                  <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-tighter">PE Yearly Planner: Grade {plan.grade}</h1>
                    <p className="font-bold text-slate-500">{plan.board} | Academic Year: {plan.academicYear}</p>
                  </div>

                  {plan.terms?.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                      <p className="text-slate-400 font-bold uppercase tracking-widest">No plan data generated. Please try again.</p>
                    </div>
                  ) : (
                    plan.terms?.map((term, tIdx) => (
                      <div key={tIdx} className="mb-16 last:mb-0">
                        <div className="flex items-center space-x-4 mb-8">
                           <div className="h-8 w-2 bg-indigo-600 rounded-full"></div>
                           <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{term.termName}</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {term.months?.map((month, mIdx) => (
                            <div key={mIdx} className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                               <h5 className="font-black text-indigo-600 mb-6 uppercase tracking-widest text-sm border-b pb-4">{month.monthName}</h5>
                               <div className="space-y-4">
                                 {month.weeks?.map((week, wIdx) => (
                                   <div key={wIdx} className={`p-5 rounded-2xl border transition-colors ${week.status === 'Instructional' ? 'bg-slate-50/50 border-slate-100 hover:bg-white' : 'bg-orange-50/50 border-orange-100'}`}>
                                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                        <span className="flex items-center"><CalendarDays size={10} className="mr-1" /> Week {week.weekNumber}</span>
                                        <span>{week.dates}</span>
                                      </div>
                                      <input 
                                        className="w-full font-black text-slate-800 bg-transparent outline-none focus:text-indigo-600 transition-colors" 
                                        value={week.topic} 
                                        onChange={(e) => handleUpdatePlan(tIdx, mIdx, wIdx, 'topic', e.target.value)} 
                                      />
                                      <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{week.details}</p>
                                      <div className="mt-3 flex items-center">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${week.status === 'Instructional' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                                          {week.status}
                                        </span>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          )}

          {step < 4 && (
            <div className="flex justify-between mt-12 pt-8 border-t print:hidden">
              <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-800 transition-colors disabled:opacity-30">Back</button>
              {step < 3 && (
                <button onClick={() => setStep(s => s + 1)} className="bg-indigo-50 text-indigo-600 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-100 transition-all flex items-center space-x-2">
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearlyPlanner;