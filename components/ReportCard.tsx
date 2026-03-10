import React, { useState, useRef } from 'react';
import { FileText, Loader2, Download, Share2, RotateCcw, Star, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateReportCard } from '../services/geminiService.ts';
import { Language } from '../types.ts';

declare var html2pdf: any;

const ratingColor = (r: string) => {
  if (r === 'Outstanding') return 'bg-purple-100 text-purple-700';
  if (r === 'Excellent') return 'bg-emerald-100 text-emerald-700';
  if (r === 'Good') return 'bg-blue-100 text-blue-700';
  if (r === 'Satisfactory') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const ReportCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('6');
  const [sport, setSport] = useState('Football');
  const [performance, setPerformance] = useState('Good participation, improving technique');
  const [attendance, setAttendance] = useState('90%');
  const [language, setLanguage] = useState<Language>('English');

  const handleGenerate = async () => {
    if (!studentName.trim()) { setError('Please enter student name.'); return; }
    setLoading(true); setError(null);
    try {
      const result = await generateReportCard(studentName, grade, sport, performance, attendance, language);
      setReport(result);
    } catch (e: any) {
      setError(e.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!printRef.current || typeof html2pdf === 'undefined') { window.print(); return; }
    html2pdf().set({ margin: 10, filename: `${studentName}_Report.pdf`, html2canvas: { scale: 2 }, jsPDF: { format: 'a4' } }).from(printRef.current).save();
  };

  const handleWhatsApp = () => {
    if (!report) return;
    const text = `📋 PE Report Card — ${report.studentName}\n\n🏆 Overall: ${report.overallGrade}\n💪 Strength: ${report.areasOfStrength}\n📈 Target: ${report.targetForNextTerm}\n\nTeacher: ${report.teacherName || 'PE Teacher'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-1 flex items-center gap-2"><FileText className="text-indigo-600" size={22} /> Student Report Card Generator</h2>
        <p className="text-sm text-slate-500 mb-6">Generate professional PE progress reports for parents</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Student Name *</label>
            <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Arjun Sharma" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Grade / Class</label>
            <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              {['1','2','3','4','5','6','7','8','9','10','11','12'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Sport / Activity Focus</label>
            <input value={sport} onChange={e => setSport(e.target.value)} placeholder="e.g. Football, Kabaddi, Athletics" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Attendance</label>
            <input value={attendance} onChange={e => setAttendance(e.target.value)} placeholder="e.g. 90%" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Performance Notes</label>
            <textarea value={performance} onChange={e => setPerformance(e.target.value)} rows={2} placeholder="Brief notes on student's performance this term..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              {['English','Hindi','Tamil','Marathi','Bengali'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

        <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-wide hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={18} /> Generating Report...</> : <><FileText size={18} /> Generate Report Card</>}
        </button>
      </div>

      {report && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Physical Education Report</p>
                <h3 className="text-2xl font-black">{report.studentName}</h3>
                <p className="text-indigo-200 text-sm mt-1">Class {report.grade || grade} · {report.subject || 'Physical Education'} · {report.academicYear || '2024-25'}</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-2xl px-4 py-2">
                  <p className="text-xs text-indigo-200 font-bold">Overall Grade</p>
                  <p className="text-xl font-black">{report.overallGrade}</p>
                </div>
              </div>
            </div>
          </div>

          <div ref={printRef} className="p-6 space-y-6">
            {report.skills && (
              <div>
                <h4 className="font-black text-slate-700 text-sm uppercase tracking-wider mb-3">Skills Assessment</h4>
                <div className="space-y-3">
                  {report.skills.map((s: any, i: number) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{s.skillName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.comment}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${ratingColor(s.rating)}`}>{s.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1"><Star size={12} /> Areas of Strength</p>
                <p className="text-sm text-emerald-800">{report.areasOfStrength}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> Areas for Improvement</p>
                <p className="text-sm text-amber-800">{report.areasForImprovement}</p>
              </div>
            </div>

            {report.teacherRemarks && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs font-black text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={12} /> Teacher's Remarks</p>
                <p className="text-sm text-indigo-900 italic">"{report.teacherRemarks}"</p>
              </div>
            )}

            {report.targetForNextTerm && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs font-black text-purple-700 uppercase tracking-wider mb-1">Target for Next Term</p>
                <p className="text-sm text-purple-800">{report.targetForNextTerm}</p>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3 flex-wrap">
            <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
              <Download size={16} /> Download PDF
            </button>
            <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
              <Share2 size={16} /> Share on WhatsApp
            </button>
            <button onClick={() => setReport(null)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
              <RotateCcw size={16} /> New Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
