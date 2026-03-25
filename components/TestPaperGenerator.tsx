import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Printer, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Settings,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { BoardType, QuestionPaper, Language } from '../types.ts';
import { generateQuestionPaper } from '../services/geminiService.ts';
import { storageService } from '../services/storageService.ts';

const TestPaperGenerator: React.FC = () => {
  const [grade, setGrade] = useState('12');
  const [board, setBoard] = useState<BoardType>(BoardType.CBSE);
  const [topic, setTopic] = useState('');
  const [testType, setTestType] = useState('Unit Test');
  const [timeAllowed, setTimeAllowed] = useState('1.5 Hours');
  const [maxMarks, setMaxMarks] = useState(35);
  const [language, setLanguage] = useState<Language>('English');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuestionPaper | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or chapter name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await generateQuestionPaper(grade, topic, board, testType, timeAllowed, maxMarks, language);
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate test paper.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    storageService.saveItem({
      type: 'TestPaper',
      title: `${result.title} - ${result.grade}`,
      content: result,
      metadata: { grade, board, topic, testType }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const reset = () => {
    setResult(null);
    setTopic('');
    setError(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full">
              <FileText size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Assessment Engine</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Test Paper <span className="text-emerald-500">Generator</span></h1>
            <p className="text-slate-400 text-sm font-medium max-w-md">
              Create professional, board-aligned question papers in seconds using AI.
            </p>
          </div>
          
          <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setGrade('11')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${grade === '11' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Class 11
            </button>
            <button 
              onClick={() => setGrade('12')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${grade === '12' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Class 12
            </button>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center">
                <Settings className="mr-2 text-emerald-500" size={20} />
                Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Board</label>
                  <select 
                    value={board}
                    onChange={e => setBoard(e.target.value as BoardType)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-slate-700"
                  >
                    <option value={BoardType.CBSE}>CBSE</option>
                    <option value={BoardType.ICSE}>ICSE</option>
                    <option value={BoardType.STATE}>State Board</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Test Type</label>
                  <select 
                    value={testType}
                    onChange={e => setTestType(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-slate-700"
                  >
                    <option>Unit Test</option>
                    <option>Half Yearly</option>
                    <option>Pre-Board</option>
                    <option>Final Exam</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Time</label>
                    <input 
                      type="text"
                      value={timeAllowed}
                      onChange={e => setTimeAllowed(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Marks</label>
                    <input 
                      type="number"
                      value={maxMarks}
                      onChange={e => setMaxMarks(Number(e.target.value))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Language</label>
                  <select 
                    value={language}
                    onChange={e => setLanguage(e.target.value as Language)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-slate-700"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-full flex flex-col">
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">What should the test cover?</h3>
                  <p className="text-slate-500 text-sm font-medium">
                    Enter the chapter name, specific topics, or paste a syllabus outline.
                  </p>
                  <textarea 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Management of Sporting Events, Children and Women in Sports..."
                    className="w-full h-48 p-8 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-emerald-200 font-bold text-slate-700 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600">
                    <AlertTriangle size={20} />
                    <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center space-x-4 shadow-xl shadow-slate-900/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Generating Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={24} className="text-emerald-400" />
                    <span>Generate Question Paper</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Result Header */}
          <div className="flex items-center justify-between">
            <button onClick={reset} className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 font-black text-xs uppercase tracking-widest">
              <ArrowLeft size={16} />
              <span>Generate New</span>
            </button>
            <div className="flex space-x-3">
              <button 
                onClick={handleSave}
                disabled={isSaved}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center space-x-2 ${isSaved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center space-x-2">
                <Download size={16} />
                <span>Export DOCX</span>
              </button>
              <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center space-x-2">
                <Printer size={16} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Question Paper Preview */}
          <div className="bg-white rounded-[3rem] p-16 border border-slate-100 shadow-2xl max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
            <div className="text-center space-y-4 mb-12 border-b-2 border-slate-900 pb-12">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{result.title}</h2>
              <div className="flex justify-center items-center space-x-8 text-sm font-black uppercase tracking-widest text-slate-500">
                <span>Class: {result.displayGrade || result.grade}</span>
                <span>Subject: Physical Education</span>
                <span>Marks: {result.maxMarks}</span>
                <span>Time: {result.timeAllowed}</span>
              </div>
            </div>

            <div className="space-y-12">
              {/* Instructions */}
              <div className="space-y-4">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">General Instructions:</h4>
                <ul className="space-y-2">
                  {result.generalInstructions.map((inst, idx) => (
                    <li key={idx} className="text-sm text-slate-600 font-medium flex items-start">
                      <span className="mr-3 text-slate-400">•</span>
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sections */}
              {result.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                      Section {section.sectionId} {section.heading && `- ${section.heading}`}
                    </h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.instructions}</span>
                  </div>

                  <div className="space-y-10">
                    {section.questions.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-6">
                        <div className="flex justify-between items-start gap-6">
                          <div className="flex-1 space-y-4">
                            <p className="text-lg font-bold text-slate-800 leading-tight">
                              <span className="mr-4 text-slate-400">{q.questionNumber || qIdx + 1}.</span>
                              {q.question}
                            </p>
                            
                            {q.options && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="text-sm text-slate-600 font-medium flex items-center">
                                    <span className="w-6 h-6 bg-slate-50 rounded-md flex items-center justify-center text-[10px] font-black mr-3 border border-slate-100">
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.caseStudyText && (
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm text-slate-600 italic leading-relaxed">
                                {q.caseStudyText}
                              </div>
                            )}
                          </div>
                          <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                            {q.marks} Mark{q.marks > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPaperGenerator;
