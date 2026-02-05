
import React, { useState } from 'react';
import { 
  Calendar, FileSpreadsheet, FileText, Gamepad2, Users, Accessibility, 
  Dumbbell, Microscope, MessageSquare, Target, Split, Layout, ChevronLeft, Zap, Loader2, Download, Printer, CheckCircle2,
  Trophy, BookOpen, Layers, Info, AlertCircle, Sparkles
} from 'lucide-react';
import { generateAIToolContent } from '../services/geminiService';
import { BoardType } from '../types';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

const tools: Tool[] = [
  { id: 'unit-planner', name: 'Unit Planner', description: 'Generate multi-week curriculum-aligned plans.', icon: Calendar, color: 'bg-blue-500' },
  { id: 'rubric-maker', name: 'Rubric Maker', description: 'Assessment rubrics for any skill and age group.', icon: Layout, color: 'bg-purple-500' },
  { id: 'worksheet-maker', name: 'Worksheet Maker', description: 'Engagement worksheets and theoretical tests.', icon: FileText, color: 'bg-indigo-500' },
  { id: 'report-writer', name: 'Report Writer', description: 'Professional feedback and student report comments.', icon: FileSpreadsheet, color: 'bg-emerald-500' },
  { id: 'game-generator', name: 'PE Games Generator', description: '5 skill-specific games for your class.', icon: Gamepad2, color: 'bg-orange-500' },
  { id: 'round-robin', name: 'Tournament Maker', description: 'Balanced schedules for teams and playing areas.', icon: Split, color: 'bg-pink-500' },
  { id: 'adapted-pe', name: 'Adapted PE', description: 'Inclusion modifications for students with disabilities.', icon: Accessibility, color: 'bg-sky-500' },
  { id: 'differentiator', name: 'Differentiated Instruction', description: 'Tailored modifications for all skill levels.', icon: Target, color: 'bg-red-500' },
  { id: 'progression-builder', name: 'Progression Builder', description: 'Technical skill mastery pathways with cues.', icon: Dumbbell, color: 'bg-cyan-500' },
  { id: 'sports-science', name: 'Sports Science', description: 'Experiential learning connecting PE with science.', icon: Microscope, color: 'bg-yellow-500' },
  { id: 'ask-advisor', name: 'Ask ConnectedPE', description: 'Get tailored advice on any PE teaching query.', icon: MessageSquare, color: 'bg-slate-700' },
];

const AIToolCenter: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    setResult(null);
    setFormData({});
  };

  const runTool = async () => {
    setLoading(true);
    try {
      const data = await generateAIToolContent(selectedTool!.id, formData);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (selectedTool) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 pb-20">
        <button 
          onClick={() => setSelectedTool(null)}
          className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-xs transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Tool Center</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-8">
              <div className={`w-16 h-16 rounded-2xl ${selectedTool.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                <selectedTool.icon size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{selectedTool.name}</h2>
              <p className="text-slate-400 text-sm font-medium mb-8">{selectedTool.description}</p>

              <div className="space-y-4">
                {/* Dynamic Form Generation */}
                {['unit-planner', 'rubric-maker', 'worksheet-maker', 'game-generator', 'progression-builder'].includes(selectedTool.id) && (
                  <>
                    <input className="w-full bg-slate-50 border p-4 rounded-xl font-bold" placeholder="Focus Topic (e.g. Cricket)" onChange={e => setFormData({...formData, topic: e.target.value, sport: e.target.value, skill: e.target.value})} />
                    <input className="w-full bg-slate-50 border p-4 rounded-xl font-bold" placeholder="Grade/Class (e.g. 8)" onChange={e => setFormData({...formData, grade: e.target.value})} />
                    {selectedTool.id === 'unit-planner' && (
                      <select className="w-full bg-slate-50 border p-4 rounded-xl font-bold" onChange={e => setFormData({...formData, duration: e.target.value})}>
                        <option value="">Duration</option>
                        <option value="2">2 Weeks</option>
                        <option value="4">4 Weeks</option>
                        <option value="6">6 Weeks</option>
                      </select>
                    )}
                    <select className="w-full bg-slate-50 border p-4 rounded-xl font-bold" onChange={e => setFormData({...formData, board: e.target.value})}>
                      {Object.values(BoardType).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </>
                )}

                {selectedTool.id === 'round-robin' && (
                  <>
                    <input type="number" className="w-full bg-slate-50 border p-4 rounded-xl font-bold" placeholder="Number of Teams" onChange={e => setFormData({...formData, teams: e.target.value})} />
                    <input type="number" className="w-full bg-slate-50 border p-4 rounded-xl font-bold" placeholder="Available Areas/Courts" onChange={e => setFormData({...formData, courts: e.target.value})} />
                  </>
                )}

                {selectedTool.id === 'report-writer' && (
                  <>
                    <input className="w-full bg-slate-50 border p-4 rounded-xl font-bold" placeholder="Student Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                    <textarea className="w-full bg-slate-50 border p-4 rounded-xl h-24 font-medium" placeholder="Main Strengths..." onChange={e => setFormData({...formData, strengths: e.target.value})} />
                    <textarea className="w-full bg-slate-50 border p-4 rounded-xl h-24 font-medium" placeholder="Areas to Improve..." onChange={e => setFormData({...formData, improvements: e.target.value})} />
                  </>
                )}

                {selectedTool.id === 'ask-advisor' && (
                  <textarea className="w-full bg-slate-50 border p-4 rounded-xl h-40 font-medium" placeholder="Ask anything about PE teaching..." onChange={e => setFormData({...formData, query: e.target.value})} />
                )}

                <button 
                  onClick={runTool}
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                  <span>{loading ? 'Synthesizing...' : 'Build Pro Resource'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            {!result && !loading ? (
              <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
                <selectedTool.icon size={64} className="text-slate-100 mb-6" />
                <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tighter uppercase">Input Required</h3>
                <p className="text-slate-400 font-medium">Complete the form on the left to generate your {selectedTool.name}.</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-[2.5rem] h-full flex flex-col items-center justify-center p-12">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-black tracking-widest text-sm uppercase">Curating High-Performance Content...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 min-h-full animate-in zoom-in-95">
                {/* Result Header */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{selectedTool.name} Output</h3>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">Ready for Print/Export</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors"><Printer size={20}/></button>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors"><Download size={20}/></button>
                  </div>
                </div>

                {/* Specialized UI Renderers */}
                <div className="space-y-8">
                  {/* Unit Planner Renderer */}
                  {selectedTool.id === 'unit-planner' && result.weeklyBreakdown && (
                    <div className="space-y-8">
                      <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
                        <h4 className="text-3xl font-black tracking-tighter mb-2">{result.unitTitle}</h4>
                        <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Timeline: {result.duration}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {result.weeklyBreakdown.map((week: any) => (
                          <div key={week.week} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex items-start space-x-6 hover:shadow-md transition-shadow">
                            <div className="bg-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center border shadow-sm flex-shrink-0">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Week</span>
                              <span className="text-xl font-black text-indigo-600">{week.week}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xl font-black text-slate-800 mb-2">{week.focus}</h5>
                              <p className="text-slate-600 font-medium mb-4 text-sm leading-relaxed">{week.keyLearning}</p>
                              <div className="flex flex-wrap gap-2">
                                {week.suggestedDrills.map((drill: string, i: number) => (
                                  <span key={i} className="bg-white border border-slate-200 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                                    {drill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rubric Maker Renderer */}
                  {selectedTool.id === 'rubric-maker' && result.categories && (
                    <div className="space-y-6">
                      <div className="bg-purple-600 p-6 rounded-3xl text-white mb-6">
                        <h4 className="text-2xl font-black">Skills Rubric: {result.topic}</h4>
                      </div>
                      <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 border-b">
                              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Assessment Criteria</th>
                              {result.categories[0]?.levels.map((level: any, i: number) => (
                                <th key={i} className="p-6 text-[10px] font-black uppercase text-indigo-600">{level.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.categories.map((cat: any, i: number) => (
                              <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="p-6 font-black text-slate-800 text-sm w-1/4">{cat.name}</td>
                                {cat.levels.map((level: any, li: number) => (
                                  <td key={li} className="p-6 text-xs text-slate-500 leading-relaxed font-medium">{level.description}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Game Generator Renderer */}
                  {selectedTool.id === 'game-generator' && result.games && (
                    <div className="grid grid-cols-1 gap-6">
                      {result.games.map((game: any, i: number) => (
                        <div key={i} className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 relative group overflow-hidden">
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                              <h5 className="text-2xl font-black text-orange-600">{i+1}. {game.name}</h5>
                              <Gamepad2 className="text-orange-200 group-hover:text-orange-400 transition-colors" size={32} />
                            </div>
                            <div className="space-y-4 mb-8">
                              {game.rules.map((rule: string, ri: number) => (
                                <div key={ri} className="flex items-start space-x-3 text-orange-900 font-medium text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                  <span>{rule}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {game.equipment.map((item: string, ei: number) => (
                                <span key={ei} className="bg-white border border-orange-200 text-orange-600 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Round Robin Tournament Renderer */}
                  {selectedTool.id === 'round-robin' && result.rounds && (
                    <div className="space-y-8">
                      <div className="bg-pink-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between">
                        <div>
                          <h4 className="text-3xl font-black tracking-tighter">Tournament Bracket</h4>
                          <p className="text-pink-100 text-sm font-bold uppercase tracking-widest mt-1">Balanced Competition Logic</p>
                        </div>
                        <Trophy size={48} className="text-pink-300" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.rounds.map((round: any) => (
                          <div key={round.round || round.roundNumber} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center space-x-2 mb-6 border-b border-slate-50 pb-4">
                              <span className="bg-pink-100 text-pink-600 font-black text-[10px] px-3 py-1 rounded-full uppercase">Round {round.round || round.roundNumber}</span>
                            </div>
                            <div className="space-y-3">
                              {round.matches.map((match: string, mi: number) => (
                                <div key={mi} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-pink-200 transition-all">
                                  <span className="text-sm font-bold text-slate-700">{match}</span>
                                  <div className="w-10 h-6 bg-white border border-slate-200 rounded-lg" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Report Writer Renderer */}
                  {selectedTool.id === 'report-writer' && (
                    <div className="relative">
                      <div className="absolute -top-4 -left-4 p-4 bg-emerald-500 text-white rounded-2xl shadow-xl">
                        <FileSpreadsheet size={24} />
                      </div>
                      <div className="bg-emerald-50 p-12 rounded-[3rem] border-2 border-emerald-100 min-h-[300px] flex items-center justify-center text-center">
                        <p className="text-2xl font-medium text-emerald-900 leading-relaxed italic max-w-2xl">
                          "{result.comment}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Worksheet Maker Renderer */}
                  {selectedTool.id === 'worksheet-maker' && result.content && (
                    <div className="bg-white border-2 border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl">
                      <div className="bg-slate-100 p-10 border-b flex justify-between items-center">
                        <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{result.title}</h4>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-400 uppercase">Student Name: _________________</p>
                          <p className="text-xs font-black text-slate-400 uppercase mt-2">Class/Sec: _________________</p>
                        </div>
                      </div>
                      <div className="p-10 space-y-12">
                        {result.content.map((sec: any, i: number) => (
                          <div key={i} className="space-y-6">
                            <h5 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b-2 border-slate-800 pb-2 flex items-center">
                              <BookOpen size={20} className="mr-2 text-indigo-600" />
                              Section {i+1}: {sec.sectionTitle}
                            </h5>
                            <div className="space-y-10">
                              {sec.questions.map((q: any, qi: number) => (
                                <div key={qi} className="space-y-4">
                                  <p className="font-bold text-slate-800">{qi+1}. {q.question}</p>
                                  {q.options ? (
                                    <div className="grid grid-cols-2 gap-4 pl-4">
                                      {q.options.map((opt: string, oi: number) => (
                                        <div key={oi} className="flex items-center space-x-3 text-sm text-slate-600">
                                          <div className="w-4 h-4 rounded-full border border-slate-400" />
                                          <span>{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-24 w-full border-b border-dashed border-slate-300 ml-4" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Advisor Renderer */}
                  {selectedTool.id === 'ask-advisor' && (
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                          <Users size={24} />
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl rounded-tl-none border border-slate-100 max-w-[80%]">
                          <p className="text-slate-600 font-medium">"{formData.query}"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 flex-row-reverse space-x-reverse">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                          <Sparkles size={24} />
                        </div>
                        <div className="bg-indigo-900 p-8 rounded-[2.5rem] rounded-tr-none text-white max-w-[85%] shadow-2xl">
                          <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">India PE Connect Expert Advice</h5>
                          <div className="prose prose-invert max-w-none text-indigo-50 leading-loose">
                            {result.response || result.advice}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback for general text responses */}
                  {!['unit-planner', 'rubric-maker', 'game-generator', 'round-robin', 'report-writer', 'worksheet-maker', 'ask-advisor'].includes(selectedTool.id) && (
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <Info className="text-indigo-600" size={20} />
                        <h4 className="font-black text-slate-800 uppercase tracking-tighter">Processed Analysis</h4>
                      </div>
                      <div className="prose max-w-none text-slate-600 leading-loose font-medium">
                        {typeof result === 'string' ? result : (
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Print Notice */}
                <div className="mt-12 bg-slate-50 rounded-2xl p-4 flex items-center justify-center space-x-2 text-slate-400">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Designed for professional classroom use</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 mb-6 backdrop-blur-md">
            <Zap size={14} className="text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Premium Mastery Tools</span>
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter leading-none">FREE Professional PE Suite.</h2>
          <p className="text-indigo-200 text-lg mb-0 leading-relaxed font-medium">
            Inspired by premium platforms like ConnectedPE, now available free for the Indian physical education community.
          </p>
        </div>
        <Layers className="absolute -right-20 -bottom-20 w-96 h-96 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group text-left flex flex-col items-start"
          >
            <div className={`p-4 rounded-2xl ${tool.color} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
              <tool.icon size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{tool.name}</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIToolCenter;
