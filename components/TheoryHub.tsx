import React, { useState } from 'react';
import { BookOpen, HelpCircle, FileText, Loader2, Download, CheckCircle2, AlertTriangle, GraduationCap, Languages } from 'lucide-react';
import { BoardType, TheoryContent, Language } from '../types.ts';
import { generateTheoryContent } from '../services/geminiService.ts';

const TheoryHub: React.FC = () => {
  const [grade, setGrade] = useState('12');
  const [board, setBoard] = useState<BoardType>(BoardType.CBSE);
  const [topic, setTopic] = useState('Planning in Sports');
  const [contentType, setContentType] = useState<'Notes' | 'MCQ' | 'CaseStudy'>('Notes');
  const [language, setLanguage] = useState<Language>('English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TheoryContent | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateTheoryContent(grade, topic, board, contentType, language);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-200">
                <GraduationCap size={24} />
              </div>
              <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Theory Master</h3>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Class</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 font-bold text-slate-700" 
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
               </div>
               
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Language</label>
                   <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 font-bold text-slate-700" 
                    value={language}
                    onChange={e => setLanguage(e.target.value as Language)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Bengali">Bengali</option>
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Topic / Chapter</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-200 font-bold text-slate-700 placeholder-slate-400" 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Yoga & Lifestyle"
                  />
               </div>

               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Resource Type</label>
                 <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setContentType('Notes')}
                      className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${contentType === 'Notes' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      Notes
                    </button>
                    <button 
                      onClick={() => setContentType('MCQ')}
                      className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${contentType === 'MCQ' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      MCQs
                    </button>
                    <button 
                      onClick={() => setContentType('CaseStudy')}
                      className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${contentType === 'CaseStudy' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      Case Study
                    </button>
                 </div>
               </div>

               <button 
                  onClick={handleGenerate} 
                  disabled={loading} 
                  className="w-full py-5 bg-slate-900 text-white rounded-xl font-black shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <BookOpen size={20} />}
                  <span className="text-sm uppercase tracking-wider">{loading ? 'Analyzing Curriculum...' : 'Generate Resource'}</span>
                </button>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start space-x-3">
               <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
               <p className="text-xs text-amber-800 font-medium leading-relaxed">
                 <strong>Exam Tip:</strong> For CBSE Class 12, focus heavily on "Planning in Sports" and "Biomechanics" as per the latest blueprint.
               </p>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-8">
           {!result && !loading ? (
             <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
                <FileText className="text-slate-200 w-24 h-24 mb-6" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">Academic Theory Center</h3>
                <p className="text-slate-400 font-medium max-w-sm">Generate high-quality study materials for Senior Secondary Board Exams (CBSE/ICSE/State).</p>
             </div>
           ) : loading ? (
             <div className="bg-white rounded-[2.5rem] h-full min-h-[500px] flex flex-col items-center justify-center p-12">
               <Loader2 className="w-16 h-16 text-rose-500 animate-spin mb-6" />
               <h3 className="text-xl font-bold text-slate-800">Drafting Content...</h3>
             </div>
           ) : (
             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 min-h-full">
                <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
                   <div>
                     <span className="bg-rose-100 text-rose-700 text-[10px] font-black uppercase px-3 py-1 rounded-full mb-2 inline-block">Class {grade} {board}</span>
                     <h2 className="text-2xl font-black text-slate-800">{result?.title}</h2>
                   </div>
                   <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-600 transition-colors">
                     <Download size={20} />
                   </button>
                </div>

                <div className="prose prose-slate max-w-none">
                   {/* Main Content */}
                   {result?.content && (
                     <div className="mb-8 whitespace-pre-wrap leading-relaxed text-slate-600 font-medium">
                       {result.content}
                     </div>
                   )}

                   {/* Questions Section */}
                   {result?.questions && result.questions.length > 0 && (
                     <div className="space-y-6">
                       <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight flex items-center">
                         <HelpCircle className="mr-2 text-rose-500" />
                         Practice Questions
                       </h4>
                       <div className="grid grid-cols-1 gap-4">
                         {result.questions.map((q, idx) => (
                           <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                             <p className="font-bold text-slate-800 mb-2 flex items-start">
                               <span className="mr-2 text-rose-500">{idx + 1}.</span> {q.question}
                             </p>
                             <div className="mt-4 pl-6 border-l-2 border-emerald-200">
                               <p className="text-sm text-emerald-700 font-medium">
                                 <strong>Answer:</strong> {q.answer}
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TheoryHub;