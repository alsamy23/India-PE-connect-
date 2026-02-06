
import React, { useState } from 'react';
import { Target, Search, Loader2, ChevronRight, BookOpen, Layers, Zap } from 'lucide-react';
import { generateSkillProgression, generateLessonDiagram } from '../services/geminiService.ts';
import { SkillProgression } from '../types.ts';

const SkillMastery: React.FC = () => {
  const [sport, setSport] = useState('Cricket');
  const [skill, setSkill] = useState('Front Foot Drive');
  const [loading, setLoading] = useState(false);
  const [progression, setProgression] = useState<SkillProgression | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateSkillProgression(sport, skill);
      
      // Generate diagrams for each phase
      const phasesWithImages = await Promise.all(data.phases.map(async (phase: any) => {
        const url = await generateLessonDiagram(phase.diagramPrompt, 'skill');
        return { ...phase, diagramUrl: url };
      }));
      
      setProgression({ ...data, phases: phasesWithImages });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Skill Mastery Progressions</h2>
          <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
            Unlike standard lessons, Skill Progressions focus on the long-term technical development of a specific move or skill.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-400 transition-all placeholder-indigo-300 text-white font-medium"
              placeholder="Sport (e.g. Football)"
              value={sport}
              onChange={e => setSport(e.target.value)}
            />
            <input 
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-400 transition-all placeholder-indigo-300 text-white font-medium"
              placeholder="Specific Skill (e.g. Penalty Kick)"
              value={skill}
              onChange={e => setSkill(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
              <span>{loading ? 'Analyzing...' : 'Map Progression'}</span>
            </button>
          </div>
        </div>
        <Target className="absolute -right-10 -bottom-10 w-96 h-96 text-white/5 rotate-12" />
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Building technical path...</p>
        </div>
      )}

      {progression && !loading && (
        <div className="grid grid-cols-1 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center space-x-4 border-b pb-4 border-slate-200">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">{progression.skillName} Mastery Path</h3>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Level: {progression.level}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {progression.phases.map((phase, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all border-b-4 border-b-indigo-500">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-indigo-50 text-indigo-700 font-black text-xs px-3 py-1 rounded-full uppercase">Phase 0{idx+1}</span>
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                    <Target size={18} />
                  </div>
                </div>
                
                <h4 className="font-black text-slate-800 text-lg mb-2 leading-tight">{phase.phaseName}</h4>
                <p className="text-xs text-indigo-600 font-bold mb-6 uppercase tracking-wider">Focus: {phase.technicalFocus}</p>

                {phase.diagramUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden aspect-square border border-slate-100 shadow-inner bg-slate-50">
                    <img src={phase.diagramUrl} alt="Technical Diagram" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-grow space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Drills</h5>
                  <div className="space-y-2">
                    {phase.drills.map((drill, dIdx) => (
                      <div key={dIdx} className="flex items-start space-x-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <ChevronRight size={14} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                        <span>{drill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillMastery;
