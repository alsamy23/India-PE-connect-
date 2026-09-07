import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, RefreshCw, Split, Sparkles, Shield, Info, HelpCircle, Layers, CheckCircle2 
} from 'lucide-react';
import KnockoutBracket, { PRESET_SCHOOLS } from './KnockoutBracket.tsx';
import RoundRobinLeague from './RoundRobinLeague.tsx';

export type FixtureMode = 'knockout' | 'roundrobin' | 'combination';

export const TournamentFixtures: React.FC = () => {
  const [fixtureMode, setFixtureMode] = useState<FixtureMode>('knockout');

  // Shared Tournament State across formats
  const [tournamentName, setTournamentName] = useState('Football U-11 Championship');
  const [subTitle, setSubTitle] = useState('Official 16-Team Knockout Fixture');
  const [category, setCategory] = useState('U - 11');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [numTeams, setNumTeams] = useState<number>(16);
  const [teamsList, setTeamsList] = useState<string[]>(() => {
    return Array.from({ length: 16 }, (_, i) => `Team ${i + 1}`);
  });

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Top Banner & Tagline Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] border-2 border-slate-900 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Tournament Fixtures</span>
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider">
              CBSE Class 12 Syllabus Ready
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white font-display">
                Tournament Fixtures Studio
              </h1>
              <p className="text-slate-300 text-sm md:text-base font-medium mt-2 max-w-2xl">
                Create official, CBSE-compliant <strong className="text-indigo-300 font-black">Knockout Brackets</strong> and <strong className="text-pink-300 font-black">Round Robin League Schedules</strong> in one single section.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="bg-slate-950/80 p-2 rounded-2xl border border-white/10 flex items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setFixtureMode('knockout')}
                className={`flex-1 md:flex-initial px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  fixtureMode === 'knockout'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy size={16} />
                <span>Knockout Bracket</span>
              </button>

              <button
                onClick={() => setFixtureMode('roundrobin')}
                className={`flex-1 md:flex-initial px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  fixtureMode === 'roundrobin'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <RefreshCw size={16} />
                <span>Round Robin League</span>
              </button>

              <button
                onClick={() => setFixtureMode('combination')}
                className={`flex-1 md:flex-initial px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  fixtureMode === 'combination'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers size={16} />
                <span>Combination</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE MODE */}
      {fixtureMode === 'knockout' && (
        <KnockoutBracket 
          tournamentName={tournamentName}
          setTournamentName={setTournamentName}
          subTitle={subTitle}
          setSubTitle={setSubTitle}
          category={category}
          setCategory={setCategory}
          startDate={startDate}
          setStartDate={setStartDate}
          numTeams={numTeams}
          setNumTeams={setNumTeams}
          teamsList={teamsList}
          setTeamsList={setTeamsList}
        />
      )}

      {fixtureMode === 'roundrobin' && (
        <RoundRobinLeague 
          tournamentName={tournamentName}
          setTournamentName={setTournamentName}
          subTitle={subTitle}
          setSubTitle={setSubTitle}
          category={category}
          setCategory={setCategory}
          startDate={startDate}
          setStartDate={setStartDate}
          numTeams={numTeams}
          setNumTeams={setNumTeams}
          teamsList={teamsList}
          setTeamsList={setTeamsList}
        />
      )}

      {fixtureMode === 'combination' && (
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border-2 border-slate-900 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-black">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Combination Tournament Guide</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">League-cum-Knockout & Knockout-cum-League Formats for CBSE Physical Education</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50/60 p-6 rounded-3xl border border-indigo-200 space-y-4">
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                <span>League-cum-Knockout Format</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Teams are divided into 4 groups (Pool A, Pool B, Pool C, Pool D). Teams play a Round Robin league within their pool, and top 2 teams from each pool qualify for the Knockout Quarter-Finals stage.
              </p>
              <button 
                onClick={() => setFixtureMode('roundrobin')}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all"
              >
                Start Group League Phase →
              </button>
            </div>

            <div className="bg-pink-50/60 p-6 rounded-3xl border border-pink-200 space-y-4">
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Knockout-cum-League Format</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Initial preliminary rounds are played on a Knockout basis to eliminate lower-tier teams quickly, then the top 4 semi-finalists play a Round Robin super-league for final medal standings.
              </p>
              <button 
                onClick={() => setFixtureMode('knockout')}
                className="px-4 py-2.5 bg-pink-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-pink-700 transition-all"
              >
                Start Knockout Preliminary Phase →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentFixtures;
