
import React, { useState } from 'react';
import { 
  FileText, 
  Loader2, 
  ChevronRight, 
  Printer, 
  Download, 
  CheckSquare, 
  Square,
  ClipboardCopy,
  Zap,
  Target,
  GraduationCap,
  Calendar,
  Layers
} from 'lucide-react';
import { generateQuestionPaper } from '../services/geminiService.ts';
import { QuestionPaper, Language } from '../types.ts';

const CHAPTERS_11 = [
  "Changing Trends & Career in Physical Education",
  "Olympic Value Education",
  "Yoga",
  "Physical Education & Sports for CWSN",
  "Physical Fitness, Wellness",
  "Test, Measurements & Evaluation",
  "Fundamentals of Anatomy and Physiology in Sports",
  "Fundamentals of Kinesiology and Biomechanics in Sports",
  "Psychology and Sports",
  "Training & Doping in Sports"
];

const CHAPTERS_12 = [
  "Management of Sporting Events",
  "Children and Women in Sports",
  "Yoga as Preventive measure for Lifestyle Disease",
  "Physical Education & Sports for (CWSN)",
  "Sports & Nutrition",
  "Test and Measurement in Sports",
  "Physiology & Injuries in Sport",
  "Biomechanics and Sports",
  "Psychology and Sports",
  "Training in Sports"
];

const TEST_TYPES = [
  { id: 'unit', name: 'Unit Test', marks: 35, icon: Target },
  { id: 'revision', name: 'Revision Test', marks: 35, icon: Layers },
  { id: 'term1', name: 'Term 1 Exam', marks: 70, icon: Calendar },
  { id: 'preboard', name: 'Pre-board Exam', marks: 70, icon: GraduationCap }
];

const QuestionPaperGenerator: React.FC = () => {
  const [grade, setGrade] = useState('12');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [testType, setTestType] = useState('unit');
  const [language, setLanguage] = useState<Language>('English');
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [view, setView] = useState<'setup' | 'preview'>('setup');

  const chapters = grade === '11' ? CHAPTERS_11 : CHAPTERS_12;

  const toggleChapter = (chapter: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(c => c !== chapter) 
        : [...prev, chapter]
    );
  };

  const handleGenerate = async () => {
    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter.");
      return;
    }
    setLoading(true);
    try {
      const type = TEST_TYPES.find(t => t.id === testType)?.name || 'Custom Test';
      const data = await generateQuestionPaper(grade, selectedChapters, type, language);
      setPaper(data);
      setView('preview');
    } catch (error) {
      console.error(error);
      alert("Failed to generate question paper. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!paper) return;
    let text = `${paper.title}\n`;
    text += `Class: ${paper.grade} | Type: ${paper.testType}\n`;
    text += `Time: ${paper.timeAllowed} | Max Marks: ${paper.maxMarks}\n`;
    text += `==========================================\n\n`;

    paper.sections.forEach(section => {
      text += `${section.sectionId}: ${section.instructions}\n`;
      text += `------------------------------------------\n`;
      section.questions.forEach((q, i) => {
        text += `${i + 1}. [${q.marks} Mark${q.marks > 1 ? 's' : ''}] ${q.question}\n`;
        if (q.caseStudyText) text += `   CASE STUDY: ${q.caseStudyText}\n`;
        if (q.options) {
          q.options.forEach((opt, oi) => {
            text += `   ${String.fromCharCode(65 + oi)}) ${opt}\n`;
          });
        }
        text += `\n`;
      });
      text += `\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (view === 'preview' && paper) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm print:hidden">
          <button 
            onClick={() => setView('setup')}
            className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all"
          >
            <ChevronRight className="rotate-180" size={16} />
            <span>Modify Selection</span>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center space-x-2"
            >
              <Download size={14} />
              <span>Download Text</span>
            </button>
            <button 
              onClick={handlePrint}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-lg shadow-indigo-200"
            >
              <Printer size={14} />
              <span>Print Paper</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="text-center space-y-4 mb-12 border-b-2 border-slate-900 pb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">{String(paper.title || 'Question Paper')}</h1>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-black text-slate-500 uppercase tracking-widest">
              <span>Class: {String(paper.grade)}</span>
              <span>Time: {String(paper.timeAllowed)}</span>
              <span>Max Marks: {String(paper.maxMarks)}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400">Strictly Based on NCERT Physical Education Curriculum 2025-26</p>
          </div>

          {/* General Instructions */}
          {paper.generalInstructions && paper.generalInstructions.length > 0 && (
            <div className="mb-12 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">General Instructions:</h3>
              <ul className="space-y-2">
                {paper.generalInstructions.map((ins, idx) => (
                  <li key={idx} className="text-xs font-bold text-slate-500 flex items-start">
                    <span className="mr-2 text-indigo-600">{idx + 1}.</span>
                    {String(ins)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-12">
            {paper.sections && Array.isArray(paper.sections) ? paper.sections.map((section, sidx) => (
              <div key={sidx} className="space-y-6">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-xl inline-block font-black uppercase text-xs tracking-widest">
                  {String(section.sectionId || `Section ${sidx + 1}`)}
                </div>
                <p className="text-xs font-bold text-slate-500 italic border-l-4 border-indigo-500 pl-4">{String(section.instructions || '')}</p>
                <div className="space-y-8 mt-6">
                  {section.questions && Array.isArray(section.questions) && section.questions.map((q, qidx) => (
                    <div key={qidx} className="relative group">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-start space-x-4">
                            <span className="font-black text-slate-400 mt-1">{qidx + 1}.</span>
                            <div className="space-y-4 flex-1">
                               {q.caseStudyText && (
                                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm font-medium leading-relaxed italic text-slate-600 mb-4">
                                   <Zap size={16} className="text-indigo-500 mb-2" />
                                   {String(q.caseStudyText)}
                                 </div>
                               )}
                               <p className="text-lg font-bold text-slate-800 leading-tight pr-12">{String(q.question)}</p>
                               {q.options && Array.isArray(q.options) && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                   {q.options.map((opt, oidx) => (
                                     <div key={oidx} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-medium">
                                       <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black">{String.fromCharCode(65 + oidx)}</span>
                                       <span>{String(opt)}</span>
                                     </div>
                                   ))}
                                 </div>
                               )}
                            </div>
                         </div>
                         <span className="flex-shrink-0 font-black text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">[{String(q.marks)}M]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">No sections generated. Please try again.</p>
              </div>
            )}
          </div>
          
          <div className="mt-16 text-center border-t border-slate-100 pt-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">End of Question Paper</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full">
              <ClipboardCopy size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Question Paper Generator</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Test <span className="text-indigo-400">Master</span></h1>
            <p className="text-slate-400 text-sm font-medium max-w-md">
              Create professional NCERT-aligned question papers for Class 11 & 12 Physical Education in seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Config Panel */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              {/* Grade Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Academic Level</label>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button 
                    onClick={() => { setGrade('11'); setSelectedChapters([]); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${grade === '11' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Class 11
                  </button>
                  <button 
                    onClick={() => { setGrade('12'); setSelectedChapters([]); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${grade === '12' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Class 12
                  </button>
                </div>
              </div>

              {/* Test Type */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Paper Configuration</label>
                <div className="grid grid-cols-1 gap-3">
                  {TEST_TYPES.map(type => (
                    <button 
                      key={type.id}
                      onClick={() => setTestType(type.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${testType === type.id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100 hover:border-indigo-200'}`}
                    >
                      <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-xl transition-colors ${testType === type.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                           <type.icon size={16} />
                         </div>
                         <div className="text-left">
                           <p className={`text-xs font-black uppercase tracking-tight ${testType === type.id ? 'text-indigo-900' : 'text-slate-700'}`}>{type.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{type.marks} Marks</p>
                         </div>
                      </div>
                      {testType === type.id && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || selectedChapters.length === 0}
                className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-3 shadow-xl ${loading || selectedChapters.length === 0 ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200/50 hover:scale-[1.02] active:scale-95'}`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Curating Questions...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Generate Question Paper</span>
                  </>
                )}
              </button>
            </div>
         </div>

         {/* Chapter List */}
         <div className="lg:col-span-2">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Syllabus Coverage</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Select chapters to include in the assessment</p>
                </div>
                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {selectedChapters.length} Selected
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chapters.map((chapter, idx) => (
                  <button 
                    key={idx}
                    onClick={() => toggleChapter(chapter)}
                    className={`flex items-start space-x-4 p-5 rounded-3xl border-2 transition-all text-left group ${selectedChapters.includes(chapter) ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'}`}
                  >
                    <div className={`mt-0.5 transition-colors ${selectedChapters.includes(chapter) ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {selectedChapters.includes(chapter) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit {idx + 1}</span>
                        </div>
                        <h4 className={`text-sm font-bold leading-snug ${selectedChapters.includes(chapter) ? 'text-slate-900' : 'text-slate-500'}`}>{chapter}</h4>
                    </div>
                  </button>
                ))}
              </div>

              {selectedChapters.length === 0 && (
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                    <Zap size={24} />
                  </div>
                  <p className="text-xs font-bold text-indigo-900 flex-1">
                    Pro Tip: Select 3-4 chapters for a Unit Test or all 10 for a Terminal/Pre-board exam for best results.
                  </p>
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default QuestionPaperGenerator;
