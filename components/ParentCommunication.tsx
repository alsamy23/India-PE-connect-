import React, { useState } from 'react';
import { Mail, Loader2, Share2, RotateCcw, Copy, CheckCircle2 } from 'lucide-react';
import { generateParentLetter } from '../services/geminiService.ts';
import { Language } from '../types.ts';

const purposes = [
  'Progress Update', 'Injury/Incident Report', 'Sports Day Invitation',
  'Low Attendance Warning', 'Outstanding Achievement', 'Equipment Reminder',
  'Medical Fitness Certificate Required', 'Khelo India Selection',
];

const ParentCommunication: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [purpose, setPurpose] = useState(purposes[0]);
  const [details, setDetails] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [language, setLanguage] = useState<Language>('English');

  const handleGenerate = async () => {
    if (!studentName.trim()) { setError('Please enter student name.'); return; }
    setLoading(true); setError(null);
    try {
      const result = await generateParentLetter(studentName, purpose, details, teacherName || 'PE Teacher', language);
      setLetter(result);
    } catch (e: any) {
      setError(e.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const fullLetterText = letter
    ? `Subject: ${letter.subject}\n\n${letter.greeting}\n\n${letter.body}\n\n${letter.actionRequired ? `Action Required: ${letter.actionRequired}\n\n` : ''}${letter.closingRemarks}\n\n${letter.teacherName}\n${letter.date}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullLetterText)}`, '_blank');
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(letter?.subject || 'PE Communication')}&body=${encodeURIComponent(fullLetterText)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 rounded-xl"><Mail className="text-blue-600" size={20} /></div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Parent Communication Templates</h2>
            <p className="text-sm text-slate-500">AI-written professional letters to parents in seconds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Student Name *</label>
            <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Priya Patel" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Teacher Name</label>
            <input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="e.g. Mr. L. Samy" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Purpose of Letter</label>
            <div className="flex flex-wrap gap-2">
              {purposes.map(p => (
                <button key={p} onClick={() => setPurpose(p)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${purpose === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Additional Details (optional)</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={2} placeholder="Any specific details to include..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              {['English','Hindi','Tamil','Marathi','Bengali'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={18} /> Writing Letter...</> : <><Mail size={18} /> Generate Letter</>}
        </button>
      </div>

      {letter && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">📨 Letter Ready</p>
            <h3 className="text-lg font-black">{letter.subject}</h3>
          </div>

          <div className="p-6">
            <div className="bg-slate-50 rounded-2xl p-5 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-200">
              {fullLetterText}
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3 flex-wrap">
            <button onClick={handleCopy} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Copy size={16} /> Copy Text</>}
            </button>
            <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
              <Share2 size={16} /> WhatsApp
            </button>
            <button onClick={handleEmail} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              <Mail size={16} /> Open in Email
            </button>
            <button onClick={() => setLetter(null)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
              <RotateCcw size={16} /> New Letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentCommunication;
