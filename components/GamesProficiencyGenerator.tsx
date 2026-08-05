import React, { useState } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  ListOrdered, 
  Settings2, 
  Zap,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Calculator,
  Target
} from 'lucide-react';
import { toast } from '../services/toast.ts';
import { generateGamesRubric } from '../services/geminiService.ts';

interface GamesProficiencyGeneratorProps {
  students?: any[];
  userProfile?: any;
}

const GamesProficiencyGenerator: React.FC<GamesProficiencyGeneratorProps> = ({ students = [], userProfile = null }) => {
  const [sport, setSport] = useState('Basketball');
  const [totalMarks, setTotalMarks] = useState('50');
  const [numSkills, setNumSkills] = useState('5');
  const [includeDiscipline, setIncludeDiscipline] = useState(true);
  const [includeRecordFile, setIncludeRecordFile] = useState(true);
  const [includeViva, setIncludeViva] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [evalMode, setEvalMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [fitnessMark, setFitnessMark] = useState<string>('');
  const [scores, setScores] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const components = [];
      if (includeDiscipline) components.push('Discipline & Behavior');
      if (includeRecordFile) components.push('Record File');
      if (includeViva) components.push('Viva Voce');

      const data = await generateGamesRubric(sport, parseFloat(totalMarks), parseInt(numSkills), components);
      setResult(data);
    } catch (err: any) {
      console.error("Failed to generate rubric:", err);
      setError(err.message || "Failed to generate rubric.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (key: string, value: string) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotal = () => {
    let total = parseFloat(fitnessMark) || 0;
    Object.values(scores).forEach(score => {
      total += parseFloat(score) || 0;
    });
    return total.toFixed(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="bg-[#0D2B52] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border-4 border-slate-900">
        <div className="relative z-10 max-w-2xl">
           <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#D4A017]/20 rounded-full border border-[#D4A017]/40 mb-6 backdrop-blur-md">
            <Trophy size={14} className="text-[#D4A017]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017]">CBSE Practical Evaluation</span>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-white font-display">Games & Skills Rubric Maker</h2>
          <p className="text-slate-200 text-lg font-medium leading-relaxed">
            Generate standardized rubrics for game proficiency, dividing marks evenly across selected specific skills.
          </p>
        </div>
        <Gamepad2 className="absolute right-[-20px] bottom-[-40px] w-64 h-64 text-[#D4A017]/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-900 sticky top-8">
            <h3 className="text-lg font-black text-[#0D2B52] uppercase tracking-tight mb-6 flex items-center font-display">
              <Settings2 size={20} className="mr-2 text-[#D4A017]" /> Settings
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Sport / Game</label>
                <input 
                  type="text" 
                  value={sport} 
                  onChange={e => setSport(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl font-bold text-[#0D2B52] outline-none focus:ring-2 focus:ring-[#0D2B52] transition-all"
                  placeholder="e.g., Basketball, Football..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Total Marks</label>
                  <input 
                    type="number" 
                    value={totalMarks} 
                    onChange={e => setTotalMarks(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl font-bold text-[#0D2B52] outline-none focus:ring-2 focus:ring-[#0D2B52] transition-all"
                    placeholder="e.g., 50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block"># of Skills</label>
                  <input 
                    type="number" 
                    value={numSkills} 
                    onChange={e => setNumSkills(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl font-bold text-[#0D2B52] outline-none focus:ring-2 focus:ring-[#0D2B52] transition-all"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#0D2B52]/5 rounded-2xl border-2 border-[#0D2B52]/20 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0D2B52]">Marks per Skill</span>
                <span className="text-lg font-black text-[#0D2B52]">
                  {totalMarks && numSkills && parseInt(numSkills) > 0 ? (parseFloat(totalMarks) / parseInt(numSkills)).toFixed(1) : '0'}
                </span>
              </div>

              <div className="pt-4 space-y-3 border-t border-slate-200">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Additional CBSE Components</label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={includeDiscipline} onChange={e => setIncludeDiscipline(e.target.checked)} className="w-4 h-4 text-[#0D2B52] rounded border-slate-300 focus:ring-[#0D2B52]" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-[#0D2B52] transition-colors">Include Discipline / Behavior</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={includeRecordFile} onChange={e => setIncludeRecordFile(e.target.checked)} className="w-4 h-4 text-[#0D2B52] rounded border-slate-300 focus:ring-[#0D2B52]" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-[#0D2B52] transition-colors">Include Record File</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={includeViva} onChange={e => setIncludeViva(e.target.checked)} className="w-4 h-4 text-[#0D2B52] rounded border-slate-300 focus:ring-[#0D2B52]" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-[#0D2B52] transition-colors">Include Viva Voce</span>
                </label>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !sport || !totalMarks || !numSkills}
                className="w-full py-5 mt-4 bg-[#0D2B52] text-[#D4A017] rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(13,43,82,1)] hover:bg-[#164077] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="animate-spin text-[#D4A017]" size={18} /> : <Zap size={18} className="text-[#D4A017]" />}
                <span>{loading ? 'Synthesizing...' : 'Generate Rubric'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
           {error && (
              <div className="bg-[#0D2B52]/10 border-2 border-[#0D2B52]/30 rounded-[2.5rem] p-8 mb-8 flex items-start space-x-4 text-[#0D2B52] animate-in zoom-in-95">
                <AlertCircle className="flex-shrink-0 mt-1 text-[#D4A017]" />
                <div>
                  <h4 className="font-black text-lg uppercase tracking-tight mb-1 text-[#0D2B52] font-display">Generation Failed</h4>
                  <p className="text-sm font-medium opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!result && !loading ? (
              <div className="bg-white border-4 border-dashed border-slate-300 rounded-[2.5rem] h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <ListOrdered size={64} className="mb-4 text-[#0D2B52]/30" />
                <h3 className="text-xl font-black text-[#0D2B52] mb-2 uppercase tracking-tighter font-display">Configure & Generate</h3>
                <p className="max-w-sm text-sm font-medium text-slate-600">Input the sport, marks, and number of skills to generate a tailored grading rubric.</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 h-full min-h-[500px] flex flex-col items-center justify-center p-12">
                <Loader2 className="w-12 h-12 text-[#0D2B52] animate-spin mb-4" />
                <p className="text-[#0D2B52] font-black tracking-widest text-sm uppercase">Drafting Proficiency Rubric...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-4 border-slate-900 animate-slide-up">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-slate-200">
                  <div>
                    <h3 className="text-2xl font-black text-[#0D2B52] uppercase tracking-tighter font-display">{result.title || `${sport} Assessment Rubric`}</h3>
                    <p className="text-[#D4A017] text-sm font-black uppercase tracking-widest mt-1">
                      Total: {totalMarks} Marks • {numSkills} Skills
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEvalMode(!evalMode)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${evalMode ? 'bg-[#0D2B52] text-[#D4A017] hover:bg-[#164077]' : 'bg-[#D4A017]/15 text-[#0D2B52] border-2 border-[#D4A017]/40 hover:bg-[#D4A017]/30'}`}
                    >
                      <Target size={16} />
                      <span>{evalMode ? 'Exit Evaluation' : 'Evaluate Student'}</span>
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-[#0D2B52] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 border-2 border-slate-900 transition-colors"
                    >
                      <Printer size={16} />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* General Result Content */}
                  {result.overallSummary && (
                    <div className="prose max-w-none text-slate-700 leading-loose font-medium mb-8">
                      {result.overallSummary}
                    </div>
                  )}

                  {evalMode && (
                    <div className="bg-[#0D2B52]/5 border-2 border-[#0D2B52]/20 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="w-full md:w-1/2">
                        <label className="text-[10px] font-black text-[#0D2B52] uppercase tracking-widest mb-2 block">Select Student</label>
                        <select 
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full p-3 bg-white border-2 border-slate-900 rounded-xl font-bold text-[#0D2B52] outline-none focus:ring-2 focus:ring-[#0D2B52]"
                        >
                          <option value="">-- Choose a student --</option>
                          {students.map((student: any) => (
                            <option key={student.id} value={student.id}>
                              {student.name} ({student.grade}-{student.section})
                            </option>
                          ))}
                          <option value="custom">Enter Manually</option>
                        </select>
                      </div>
                      <div className="w-full md:w-1/4">
                         <label className="text-[10px] font-black text-[#0D2B52] uppercase tracking-widest mb-2 block">General Fitness Test Marks</label>
                         <input 
                           type="number"
                           value={fitnessMark}
                           onChange={(e) => setFitnessMark(e.target.value)}
                           className="w-full p-3 bg-white border-2 border-slate-900 rounded-xl font-bold text-[#0D2B52] outline-none focus:ring-2 focus:ring-[#0D2B52] text-center"
                           placeholder="e.g. 20"
                         />
                      </div>
                      <div className="w-full md:w-1/4 bg-[#0D2B52] border-2 border-slate-900 rounded-xl p-4 text-center text-white shadow-md">
                         <div className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] mb-1">Total Mark</div>
                         <div className="text-3xl font-black text-white">{calculateTotal()} <span className="text-lg opacity-80">/ 100</span></div>
                      </div>
                    </div>
                  )}

                  {/* Skills Grid */}
                  {result.skills && Array.isArray(result.skills) && (
                    <div className="space-y-4">
                      {result.skills.map((skill: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-black text-lg text-[#0D2B52] uppercase tracking-tight font-display">
                              {skill.name}
                            </h4>
                            <div className="flex gap-4 items-center">
                              {evalMode && (
                                <div className="flex items-center space-x-2">
                                  <input 
                                    type="number"
                                    value={scores[`skill_${idx}`] || ''}
                                    onChange={(e) => handleScoreChange(`skill_${idx}`, e.target.value)}
                                    className="w-16 p-1.5 bg-white border-2 border-slate-900 rounded font-bold text-[#0D2B52] outline-none focus:ring-2 focus:ring-[#0D2B52] text-center"
                                  />
                                  <span className="text-xs font-bold text-slate-500">/ {skill.maxMarks}</span>
                                </div>
                              )}
                              <span className="px-3 py-1 bg-[#D4A017]/20 text-[#0D2B52] rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap border border-[#D4A017]/40">
                                Max: {skill.maxMarks}
                              </span>
                            </div>
                          </div>
                          
                          {skill.criteria && Array.isArray(skill.criteria) && (
                            <ul className="space-y-2 mt-4">
                              {skill.criteria.map((crit: string, cidx: number) => (
                                <li key={cidx} className="flex text-sm text-slate-700 font-medium">
                                  <span className="w-2 h-2 bg-[#D4A017] rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                  <span>{crit}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Additional Components */}
                  {result.additionalComponents && Array.isArray(result.additionalComponents) && result.additionalComponents.length > 0 && (
                    <div>
                      <h4 className="text-xl font-black text-[#0D2B52] uppercase tracking-tight mb-4 font-display">Other CBSE Components</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.additionalComponents.map((comp: any, idx: number) => (
                          <div key={idx} className="bg-[#0D2B52]/5 border-2 border-[#0D2B52]/20 p-5 rounded-2xl">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-black text-[#0D2B52] uppercase tracking-widest text-xs flex-1">{comp.name}</h5>
                              <div className="flex items-center gap-3">
                                {evalMode && (
                                  <div className="flex items-center space-x-1">
                                    <input 
                                      type="number"
                                      value={scores[`comp_${idx}`] || ''}
                                      onChange={(e) => handleScoreChange(`comp_${idx}`, e.target.value)}
                                      className="w-12 p-1 bg-white border border-slate-300 rounded font-bold text-[#0D2B52] outline-none focus:ring-2 focus:ring-[#0D2B52] text-center text-xs"
                                    />
                                    <span className="text-[10px] font-bold text-slate-500">/ {comp.marks}</span>
                                  </div>
                                )}
                                <span className="font-black text-[#0D2B52] text-xs px-2 py-0.5 bg-[#D4A017]/20 rounded border border-[#D4A017]/40">Max {comp.marks}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">{comp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                   {result.overallSummary && (
                    <div className="bg-[#0D2B52] text-white p-6 rounded-2xl border-2 border-slate-900 flex items-start space-x-4 mt-8">
                      <CheckCircle2 className="flex-shrink-0 text-[#D4A017]" />
                      <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-1 text-[#D4A017]">Evaluating Guidelines</h4>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">Use the specified grading bands above consistently across all students to insure fair practical evaluation according to CBSE standards.</p>
                      </div>
                    </div>
                   )}

                   {evalMode && (
                     <div className="flex justify-end pt-6 mb-8 border-t border-slate-200">
                       <button 
                         className="px-8 py-4 bg-[#D4A017] text-[#0D2B52] border-2 border-slate-900 rounded-xl font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(13,43,82,1)] hover:bg-[#e0ab1e] hover:-translate-y-0.5 transition-all"
                         onClick={() => {
                           toast.success('Evaluation Data saved successfully.');
                           setEvalMode(false);
                           setScores({});
                           setFitnessMark('');
                           setSelectedStudentId('');
                         }}
                       >
                         Save Student Evaluation
                       </button>
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

export default GamesProficiencyGenerator;
