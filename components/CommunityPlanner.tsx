
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  RefreshCw, 
  Copy, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ExternalLink,
  Zap,
  Globe,
  Flag
} from 'lucide-react';
import { generateLessonPlan } from '../services/geminiService.ts';
import { BoardType } from '../types.ts';

const CommunityPlanner: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'setup' | 'alternatives'>('planner');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    board: 'CBSE',
    grade: 'Class 6–8',
    sport: 'Kabaddi',
    duration: '45 Minutes',
    schoolType: 'Government School (Limited Equipment)',
    state: 'Maharashtra',
    students: '40',
    topic: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic) {
      setError("Please enter a lesson topic or focus area.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      // We use the existing robust service which now has key rotation
      const plan = await generateLessonPlan(
        formData.board as BoardType,
        formData.grade,
        formData.sport,
        formData.topic,
        "Teacher",
        formData.duration,
        new Date().toISOString().split('T')[0],
        'English'
      );

      // Convert the structured plan to a readable format matching the LessonPlan interface
      const formattedOutput = `
# ${plan.topic}
**Grade:** ${plan.grade} | **Duration:** ${plan.duration}

## 1. Objectives
- Know: ${plan.objectives.know}
- Understand: ${plan.objectives.understand}
- Be able to: ${plan.objectives.beAbleTo}

## 2. Equipment Needed
${plan.equipment.map((e: string) => `- ${e}`).join('\n')}

## 3. Starter / Warm-up (${plan.starter.time})
**${plan.starter.title}**
${plan.starter.description}

## 4. Main Activity (${plan.mainActivity.time})
${plan.mainActivity.activities.map(act => `
### ${act.title}
${act.description}
**Coaching Points:**
${act.coachingPoints.map(cp => `  - ${cp}`).join('\n')}
`).join('\n')}

## 5. Plenary / Cool Down (${plan.plenary.time})
**${plan.plenary.title}**
${plan.plenary.description}

## 6. Safety & Differentiation
**Safety:** ${plan.safety.join(', ')}
**Differentiation:** ${plan.differentiation}
      `;
      
      setOutput(formattedOutput);
    } catch (err: any) {
      setError(err.message || "Generation failed. Please check your API key status.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      alert("Copied to clipboard!");
    }
  };

  const printPlan = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Tricolor Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-slate-100">
        <div className="h-2 bg-gradient-to-right from-[#FF9933] via-white to-[#138808] w-full" 
             style={{ background: 'linear-gradient(to right, #FF9933 33.3%, #f8fafc 33.3% 66.6%, #138808 66.6%)' }} />
        
        <div className="p-8 md:p-12 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full">
                <Flag size={14} className="text-[#FF9933]" />
                <span className="text-[10px] font-black uppercase tracking-widest">India PE Connect</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter">Community <span className="text-[#FF9933]">Planner</span></h1>
              <p className="text-slate-400 text-sm font-medium max-w-md">
                The integrated AI lesson planning tool for Physical Education teachers across India.
              </p>
            </div>
            <div className="bg-[#138808] px-6 py-3 rounded-2xl shadow-xl shadow-[#138808]/20 flex items-center space-x-3">
              <CheckCircle2 size={20} />
              <span className="font-black text-xs uppercase tracking-widest">100% Free for Teachers</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
          {[
            { id: 'planner', name: 'AI Planner', icon: Sparkles },
            { id: 'setup', name: 'Setup Guide', icon: Settings },
            { id: 'alternatives', name: 'Free Alternatives', icon: RefreshCw }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2
                ${activeSubTab === tab.id 
                  ? 'border-[#FF9933] text-indigo-900 bg-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'}
              `}
            >
              <tab.icon size={14} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="p-8 md:p-12">
          {activeSubTab === 'planner' && (
            <div className="space-y-8">
              {/* Info Banner */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-start space-x-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-black text-emerald-900 uppercase tracking-tight text-sm mb-1">No API Key Needed for Teachers</h3>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    This tool uses a shared backend with key-rotation. Teachers can generate plans instantly. 
                    Administrators can add more keys in the Setup tab to increase daily limits.
                  </p>
                </div>
              </div>

              {/* Form Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Board / Curriculum</label>
                  <select id="board" value={formData.board} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all">
                    <option>CBSE</option>
                    <option>ICSE</option>
                    <option>State Board</option>
                    <option>International / IB</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Class / Grade</label>
                  <select id="grade" value={formData.grade} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all">
                    <option>Class 1–2</option>
                    <option>Class 3–5</option>
                    <option>Class 6–8</option>
                    <option>Class 9–10</option>
                    <option>Class 11–12</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Sport / Activity</label>
                  <select id="sport" value={formData.sport} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all">
                    <option>Kabaddi</option>
                    <option>Kho-Kho</option>
                    <option>Yoga / Wellness</option>
                    <option>Cricket</option>
                    <option>Football</option>
                    <option>Basketball</option>
                    <option>Volleyball</option>
                    <option>Badminton</option>
                    <option>Hockey</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</label>
                  <select id="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all">
                    <option>30 Minutes</option>
                    <option>45 Minutes</option>
                    <option>60 Minutes</option>
                    <option>90 Minutes</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson Topic / Focus</label>
                  <input 
                    type="text" 
                    id="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Basic Kabaddi Raiding Skills"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Special Notes (Optional)</label>
                  <textarea 
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g., Hot weather, limited equipment..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all min-h-[100px]"
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-[#FF9933] to-orange-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>Generating Plan...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>Generate Free Lesson Plan</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
                  <AlertTriangle size={20} />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              {/* Output Display */}
              {output && (
                <div className="mt-12 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-indigo-900 uppercase tracking-tight flex items-center space-x-2">
                      <CheckCircle2 className="text-[#138808]" />
                      <span>Generated Lesson Plan</span>
                    </h2>
                    <div className="flex space-x-2">
                      <button onClick={copyToClipboard} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors">
                        <Copy size={18} />
                      </button>
                      <button onClick={printPlan} className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-colors">
                        <Printer size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-[#138808]/20 rounded-[2.5rem] p-8 md:p-12 shadow-xl prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">
                      {output}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'setup' && (
            <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white border border-slate-800">
                <h2 className="text-2xl font-black mb-2 tracking-tight flex items-center space-x-3">
                  <Settings className="text-[#FF9933]" />
                  <span>Admin Setup Guide</span>
                </h2>
                <p className="text-slate-400 text-sm mb-8">One-time setup to enable high-volume free planning for your school.</p>
                
                <div className="space-y-6">
                  {[
                    { 
                      title: "Create Multiple Keys", 
                      text: "Go to Google AI Studio and create up to 10 free API keys using different Gmail accounts." 
                    },
                    { 
                      title: "Add to Environment", 
                      text: "In your hosting platform (AI Studio or Vercel), add variables named GEMINI_KEY_1, GEMINI_KEY_2, etc." 
                    },
                    { 
                      title: "Automatic Rotation", 
                      text: "The SmartPE backend will automatically rotate these keys to bypass daily limits." 
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="w-8 h-8 bg-[#FF9933] rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight mb-1">{step.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Free Quota Stats</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">Per Key Limit</span>
                      <span className="text-sm font-black text-indigo-600">1,500/day</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">With 10 Keys</span>
                      <span className="text-sm font-black text-emerald-600">15,000/day</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[80%]" />
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex flex-col justify-center">
                  <p className="text-sm font-bold text-indigo-900 mb-2">Need more help?</p>
                  <p className="text-xs text-indigo-700 mb-4">Contact the SmartPE India support team for enterprise setup.</p>
                  <button className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center space-x-2">
                    <span>Contact Support</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'alternatives' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Gemini Flash", icon: "🟡", limit: "1,500/day", desc: "Fastest model, best for lesson plans." },
                  { name: "Groq Cloud", icon: "🟢", limit: "14,400/day", desc: "Ultra-fast, excellent for structured data." },
                  { name: "Mistral AI", icon: "🔵", limit: "Free Tier", desc: "Great fallback for complex reasoning." },
                  { name: "OpenRouter", icon: "🟠", limit: "Variable", desc: "Access multiple free models at once." },
                  { name: "Cohere", icon: "⚫", limit: "1,000/mo", desc: "Good for high-quality text generation." },
                  { name: "Together AI", icon: "🔴", limit: "$1 Credit", desc: "Run open source models like Llama." }
                ].map((alt, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all text-center space-y-3">
                    <div className="text-3xl">{alt.icon}</div>
                    <h4 className="font-black text-indigo-900 uppercase tracking-tight">{alt.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{alt.desc}</p>
                    <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {alt.limit}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white">
                <h3 className="text-xl font-black mb-4 flex items-center space-x-3">
                  <Info className="text-[#FF9933]" />
                  <span>Recommended Strategy</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="w-6 h-6 bg-[#FF9933] rounded-full flex items-center justify-center font-black text-[10px]">1</div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-white">Primary:</strong> Use Gemini Flash with 10 rotated keys for 15k free daily requests.
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <div className="w-6 h-6 bg-[#138808] rounded-full flex items-center justify-center font-black text-[10px]">2</div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-white">Backup:</strong> Integrate Groq as a secondary fallback for high-traffic periods.
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "By distributing load across multiple free providers, we can keep SmartPE India 100% free for teachers indefinitely."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPlanner;
