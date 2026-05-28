import React, { useState } from 'react';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';

const UnitPlannerTool: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setComplete(true);
    }, 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in pb-10">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Unit Planner</h2>
            <p className="text-xs text-slate-500 font-medium">Generate comprehensive unit plans with standards alignment</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
          ✨ 5 credits left
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Topic *</label>
          <input required type="text" placeholder="e.g., Basketball, Swimming, Athletics" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Year/Grade Level *</label>
          <input required type="text" placeholder="e.g., Year 5, Grade 8" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-shadow" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Number of Lessons *</label>
          <input required type="number" placeholder="e.g., 6" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-shadow" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Lesson Duration (minutes)</label>
          <input type="number" defaultValue="45" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-shadow" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Curriculum</label>
          <select className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-shadow">
            <option>Australian Curriculum</option>
            <option>CBSE</option>
            <option>ICSE</option>
            <option>SHAPE America</option>
            <option>National Curriculum (UK)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Learning Objectives</label>
          <textarea rows={3} placeholder="Specific objectives for this unit..." className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-shadow resize-y"></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Assessment Strategies</label>
          <textarea rows={2} placeholder="How will you assess?" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-shadow resize-y"></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Available Equipment</label>
          <textarea rows={2} placeholder="List available equipment..." className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-shadow resize-y"></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Prior Knowledge Required</label>
          <textarea rows={2} placeholder="What should students already know?" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-shadow resize-y"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading || complete}
          className={`w-full py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
            complete ? 'bg-emerald-500' : 'bg-red-400 hover:bg-red-500'
          }`}
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Generating AI Plan...</>
          ) : complete ? (
            <><Sparkles size={18} /> Unit Plan Ready</>
          ) : (
            <><Sparkles size={18} /> Generate</>
          )}
        </button>
      </form>
    </div>
  );
};

export default UnitPlannerTool;
