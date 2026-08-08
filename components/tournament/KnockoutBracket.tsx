import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Users, Calendar, Clock, Printer, Trash2, Plus, RefreshCw, 
  ChevronRight, ArrowRight, Shield, Download, Sparkles, AlertCircle, CheckCircle2, HelpCircle,
  ExternalLink, Share2, FileText, Check, Copy
} from 'lucide-react';
import { toast } from '../../services/toast.ts';
import { trackEvent } from '../../services/analytics.ts';

export interface Match {
  id: number;
  name: string; // e.g. "Match - 1"
  roundName: string; // e.g. "I - Round"
  team1: string; // "School A" or "Winner of Match X"
  team2: string; // "School B" or "Winner of Match Y"
  time: string; // "08:15 AM"
  date: string;
  isBye?: boolean;
}

export const PRESET_SCHOOLS = [
  "Shraddha Children’s Academy, Kottivakkam",
  "San Academy velachery",
  "A.A Public School CBSE",
  "Sri Chaitanya Techno school perumbakkam",
  "Chettinad Vidyashram, R.A Puram",
  "bvm global perungudi",
  "PS Senior secondary school",
  "PSBB Siruseri",
  "PSBB KK Nagar",
  "Hiranandani Upscale School",
  "Vidya mandir Adyar",
  "Vaels International school",
  "DAV Boys Sr. Sec. School, Gopalapuram",
  "Velammal Bodhi Campus Kanchipuram",
  "Vellore International School, Kayar",
  "KC High International School",
  "Sankara - Adyar",
  "GTA Vidhya Mandir",
  "Vels Vidyashram Sr. Sec. School Pallavaram"
];

interface KnockoutBracketProps {
  tournamentName: string;
  setTournamentName: (val: string) => void;
  subTitle: string;
  setSubTitle: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  numTeams: number;
  setNumTeams: (val: number) => void;
  teamsList: string[];
  setTeamsList: React.Dispatch<React.SetStateAction<string[]>>;
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({
  tournamentName,
  setTournamentName,
  subTitle,
  setSubTitle,
  category,
  setCategory,
  startDate,
  setStartDate,
  numTeams,
  setNumTeams,
  teamsList,
  setTeamsList
}) => {
  // Timings & Durations
  const [firstHalf, setFirstHalf] = useState<number>(15);
  const [secondHalf, setSecondHalf] = useState<number>(15);
  const [halfTime, setHalfTime] = useState<number>(5);
  const [restGap, setRestGap] = useState<number>(10);
  const [startTime, setStartTime] = useState('08:15');

  // Third Place Preference
  const [thirdPlaceMode, setThirdPlaceMode] = useState<'none' | 'same' | 'different'>('same');
  const [thirdPlaceDate, setThirdPlaceDate] = useState(new Date().toISOString().split('T')[0]);
  const [thirdPlaceTime, setThirdPlaceTime] = useState('15:15');

  // Multi-Day Tournament States
  interface DailyConfig {
    date: string;
    startTime: string;
    endTime: string;
  }
  const [numDays, setNumDays] = useState<number>(1);
  const [dailyConfigs, setDailyConfigs] = useState<DailyConfig[]>(() => [
    { date: new Date().toISOString().split('T')[0], startTime: '08:15', endTime: '16:30' }
  ]);
  const [roundDayAssignments, setRoundDayAssignments] = useState<Record<string, number>>({});

  // Keep dailyConfigs in sync with numDays, startDate, and startTime
  useEffect(() => {
    setDailyConfigs(prev => {
      const arr = [...prev];
      if (numDays > arr.length) {
        for (let i = arr.length; i < numDays; i++) {
          const baseDate = new Date(startDate || new Date());
          baseDate.setDate(baseDate.getDate() + i);
          const dayStr = baseDate.toISOString().split('T')[0];
          arr.push({
            date: dayStr,
            startTime: startTime || '08:15',
            endTime: '16:30'
          });
        }
      } else if (numDays < arr.length) {
        arr.length = numDays;
      }
      if (arr[0]) {
        arr[0].date = startDate;
        arr[0].startTime = startTime;
      }
      return arr;
    });
  }, [numDays, startDate, startTime]);

  const getDefaultRoundDay = (roundName: string, totalRoundsCount: number, roundIndex: number, days: number): number => {
    if (days <= 1) return 1;
    if (days === 2) {
      if (roundName.includes("Final") || roundName.includes("Semi") || roundName.includes("Third")) {
        return 2;
      }
      return 1;
    }
    if (days === 3) {
      if (roundName.includes("Final") || roundName.includes("Third")) {
        return 3;
      }
      if (roundName.includes("Semi")) {
        return 2;
      }
      if (roundIndex < Math.floor(totalRoundsCount / 2)) {
        return 1;
      }
      return 2;
    }
    return Math.min(days, Math.floor((roundIndex / totalRoundsCount) * days) + 1);
  };

  // Generation status
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  
  // Computed Schedule Bracket Data
  const [generatedRounds, setGeneratedRounds] = useState<any[]>([]);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<Match | null>(null);

  const [svgPaths, setSvgPaths] = useState<string[]>([]);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update teams array length when numTeams changes
  const handleNumTeamsChange = (n: number) => {
    setNumTeams(n);
    setTeamsList(prev => {
      const currentList = [...prev];
      if (n > currentList.length) {
        for (let i = currentList.length; i < n; i++) {
          currentList.push(PRESET_SCHOOLS[i % PRESET_SCHOOLS.length]);
        }
      } else {
        currentList.length = n;
      }
      return currentList;
    });
  };

  const handleTeamNameChange = (idx: number, value: string) => {
    setTeamsList(prev => {
      const update = [...prev];
      update[idx] = value;
      return update;
    });
  };

  const handleBulkPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const list = e.target.value
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean);
    if (list.length > 0) {
      setNumTeams(list.length);
      setTeamsList(list);
    }
  };

  const calculateCBNKSetup = (teams: string[]) => {
    const N = teams.length;
    const P = Math.pow(2, Math.ceil(Math.log2(N || 2)));
    const byesCount = P - N;
    const Nu = N % 2 === 0 ? N / 2 : (N + 1) / 2;
    const Nl = N % 2 === 0 ? N / 2 : (N - 1) / 2;

    const byeIndices = new Set<number>();
    let botLower = N - 1;
    let topUpper = 0;
    let topLower = Nu;
    let botUpper = Nu - 1;

    for (let b = 0; b < byesCount; b++) {
      const step = b % 4;
      if (step === 0) {
        byeIndices.add(botLower);
        botLower--;
      } else if (step === 1) {
        byeIndices.add(topUpper);
        topUpper++;
      } else if (step === 2) {
        byeIndices.add(topLower);
        topLower++;
      } else if (step === 3) {
        byeIndices.add(botUpper);
        botUpper--;
      }
    }

    return { N, P, byesCount, Nu, Nl, byeIndices };
  };

  const addMinutesToTime = (timeStr: string, minutes: number): string => {
    const [h, m] = (timeStr || '08:15').split(':').map(Number);
    const date = new Date();
    date.setHours(h || 8);
    date.setMinutes((m || 15) + minutes);
    
    let hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  };

  const buildKnockoutBrackets = () => {
    const N = teamsList.length;
    if (N < 2) return;

    const P = Math.pow(2, Math.ceil(Math.log2(N)));
    const byesCount = P - N;

    const Nu = N % 2 === 0 ? N / 2 : (N + 1) / 2;
    const Nl = N % 2 === 0 ? N / 2 : (N - 1) / 2;

    const byeIndices = new Set<number>();
    let botLower = N - 1;
    let topUpper = 0;
    let topLower = Nu;
    let botUpper = Nu - 1;

    for (let b = 0; b < byesCount; b++) {
      const step = b % 4;
      if (step === 0) {
        byeIndices.add(botLower);
        botLower--;
      } else if (step === 1) {
        byeIndices.add(topUpper);
        topUpper++;
      } else if (step === 2) {
        byeIndices.add(topLower);
        topLower++;
      } else if (step === 3) {
        byeIndices.add(botUpper);
        botUpper--;
      }
    }

    const matchBlockDuration = firstHalf + secondHalf + halfTime + restGap;
    let matchCounter = 1;

    const formatDateObj = (dateStr: string) => {
      const dateObj = new Date(dateStr);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[dateObj.getDay()];
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return { 
        formatted: `${day}-${month}-${year}`,
        dayName: dayName
      };
    };

    const round1Matches: Match[] = [];
    const nonByeIndicesInOrder: number[] = [];
    for (let i = 0; i < N; i++) {
      if (!byeIndices.has(i)) {
        nonByeIndicesInOrder.push(i);
      }
    }

    for (let i = 0; i < nonByeIndicesInOrder.length; i += 2) {
      if (i + 1 < nonByeIndicesInOrder.length) {
        const idx1 = nonByeIndicesInOrder[i];
        const idx2 = nonByeIndicesInOrder[i + 1];
        const currentMatchId = matchCounter++;

        round1Matches.push({
          id: currentMatchId,
          name: `Match - ${currentMatchId}`,
          roundName: "I - Round",
          team1: teamsList[idx1],
          team2: teamsList[idx2],
          time: "",
          date: "",
          isBye: false
        });
      }
    }

    const roundsSchedules: any[] = [];
    if (round1Matches.length > 0) {
      roundsSchedules.push({
        name: "I - Round",
        matches: round1Matches
      });
    }

    const round2Entries: string[] = [];
    const processedR1Matched = new Set<number>();

    for (let i = 0; i < N; i++) {
      if (byeIndices.has(i)) {
        round2Entries.push(teamsList[i]);
      } else {
        const r1Match = round1Matches.find(m => m.team1 === teamsList[i] || m.team2 === teamsList[i]);
        if (r1Match && !processedR1Matched.has(r1Match.id)) {
          processedR1Matched.add(r1Match.id);
          round2Entries.push(`Winner of Match ${r1Match.id}`);
        }
      }
    }

    let currentRoundEntries = [...round2Entries];
    let roundLabelIndex = 2;

    while (currentRoundEntries.length >= 2) {
      const nextRoundEntries: string[] = [];
      const currentRoundMatches: Match[] = [];
      const numSlots = currentRoundEntries.length;

      let roundNameStr = `${String(roundLabelIndex)} - Round`;
      if (numSlots === 4) {
        roundNameStr = "Semi Finals";
      } else if (numSlots === 2) {
        roundNameStr = "Finals";
      }

      for (let i = 0; i < numSlots; i += 2) {
        const s1 = currentRoundEntries[i];
        const s2 = currentRoundEntries[i + 1];
        const currentMatchId = matchCounter++;

        currentRoundMatches.push({
          id: currentMatchId,
          name: `Match - ${currentMatchId}`,
          roundName: roundNameStr,
          team1: s1,
          team2: s2,
          time: "",
          date: "",
          isBye: false
        });

        nextRoundEntries.push(`Winner of Match ${currentMatchId}`);
      }

      roundsSchedules.push({
        name: roundNameStr,
        matches: currentRoundMatches
      });

      currentRoundEntries = nextRoundEntries;
      roundLabelIndex++;
    }

    const updatedAssignments = { ...roundDayAssignments };
    let hasAnyChange = false;
    roundsSchedules.forEach((round, rIdx) => {
      if (updatedAssignments[round.name] === undefined || updatedAssignments[round.name] > numDays) {
        updatedAssignments[round.name] = getDefaultRoundDay(round.name, roundsSchedules.length, rIdx, numDays);
        hasAnyChange = true;
      }
    });

    const semiFinalRound = roundsSchedules.find(r => r.name === "Semi Finals");
    let calculatedThirdPlace: Match | null = null;

    if (semiFinalRound && semiFinalRound.matches.length === 2 && thirdPlaceMode !== 'none') {
      const sf1 = semiFinalRound.matches[0];
      const sf2 = semiFinalRound.matches[1];
      const currentMatchId = matchCounter++;

      if (updatedAssignments["Third Place Play-off"] === undefined || updatedAssignments["Third Place Play-off"] > numDays) {
        updatedAssignments["Third Place Play-off"] = updatedAssignments["Finals"] || numDays;
        hasAnyChange = true;
      }

      calculatedThirdPlace = {
        id: currentMatchId,
        name: `Match - ${currentMatchId}`,
        roundName: "Third Place Play-off",
        team1: `Loser of ${sf1.name}`,
        team2: `Loser of ${sf2.name}`,
        time: "",
        date: ""
      };
    }

    if (hasAnyChange) {
      setRoundDayAssignments(updatedAssignments);
    }

    const currentAssignments = { ...updatedAssignments, ...roundDayAssignments };

    const matchesByDay: Record<number, Match[]> = {};
    for (let d = 1; d <= numDays; d++) {
      matchesByDay[d] = [];
    }

    roundsSchedules.forEach(round => {
      const roundDay = currentAssignments[round.name] || 1;
      round.matches.forEach((m: Match) => {
        if (matchesByDay[roundDay]) {
          matchesByDay[roundDay].push(m);
        } else {
          matchesByDay[1].push(m);
        }
      });
    });

    if (calculatedThirdPlace && thirdPlaceMode !== 'different') {
      const tPlaceDay = currentAssignments["Third Place Play-off"] || numDays;
      if (matchesByDay[tPlaceDay]) {
        matchesByDay[tPlaceDay].push(calculatedThirdPlace);
      } else {
        matchesByDay[1].push(calculatedThirdPlace);
      }
    }

    for (let d = 1; d <= numDays; d++) {
      const dayConfig = dailyConfigs[d - 1];
      const dayDateStr = dayConfig?.date || startDate;
      const dayStartTime = dayConfig?.startTime || startTime;
      const dayHostDate = formatDateObj(dayDateStr);

      let physicalMatchCountOnThisDay = 0;
      if (matchesByDay[d]) {
        matchesByDay[d].forEach((m: Match) => {
          m.date = dayHostDate.formatted;
          if (firstHalf === 0 && secondHalf === 0) {
            m.time = "";
          } else {
            m.time = addMinutesToTime(dayStartTime, physicalMatchCountOnThisDay * matchBlockDuration);
            physicalMatchCountOnThisDay++;
          }
        });
      }
    }

    if (calculatedThirdPlace && thirdPlaceMode === 'different') {
      const customTDateObj = formatDateObj(thirdPlaceDate);
      calculatedThirdPlace.date = customTDateObj.formatted;
      calculatedThirdPlace.time = addMinutesToTime(thirdPlaceTime, 0);
    }

    setGeneratedRounds(roundsSchedules);
    setThirdPlaceMatch(calculatedThirdPlace);
  };

  const handleGenerate = () => {
    buildKnockoutBrackets();
    setHasConfirmed(true);
    setShowChecklist(false);
    toast.success("Knockout bracket generated successfully!");
    trackEvent('tool_used', { tool_name: 'Knockout Bracket Generator' });
  };

  useEffect(() => {
    if (hasConfirmed) {
      buildKnockoutBrackets();
    }
  }, [roundDayAssignments, dailyConfigs, numDays]);

  const [copiedText, setCopiedText] = useState(false);
  const [printPageSize, setPrintPageSize] = useState<'A4' | 'A3'>('A4');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [printScale, setPrintScale] = useState<number>(85);

  const handleTriggerPrint = () => {
    window.print();
  };

  const setup = calculateCBNKSetup(teamsList);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Form Setup Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              <Trophy size={24} className="text-amber-500" />
              <span>Knockout Bracket Configurator</span>
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-1">Single elimination bracket with CBSE systematic bye allocation & match timings.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[10px] font-black uppercase tracking-wider">
              {teamsList.length} Registered Teams
            </span>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-[10px] font-black uppercase tracking-wider">
              {setup.byesCount} Byes Required
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tournament Name</label>
            <input 
              type="text" 
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Subtitle / Sub-category</label>
            <input 
              type="text" 
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Age Category / Division</label>
            <input 
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Number of Teams</label>
            <input 
              type="number" 
              min={2}
              max={64}
              value={numTeams}
              onChange={(e) => handleNumTeamsChange(parseInt(e.target.value) || 2)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tournament Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">First Match Start Time</label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Tournament Duration (Days)</label>
            <select
              value={numDays}
              onChange={(e) => setNumDays(parseInt(e.target.value))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all text-sm"
            >
              <option value={1}>Single Day Event</option>
              <option value={2}>2 Days Championship</option>
              <option value={3}>3 Days Championship</option>
              <option value={4}>4 Days Championship</option>
            </select>
          </div>
        </div>

        {/* Timings breakdown */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              <span>Match Duration & Rest Interval Settings</span>
            </h4>
            <span className="text-[11px] font-bold text-indigo-600">Total Match Block: {firstHalf + secondHalf + halfTime + restGap} mins</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">1st Half (Mins)</label>
              <input 
                type="number" 
                min={0}
                value={firstHalf}
                onChange={(e) => setFirstHalf(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">2nd Half (Mins)</label>
              <input 
                type="number" 
                min={0}
                value={secondHalf}
                onChange={(e) => setSecondHalf(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Half-Time Break (Mins)</label>
              <input 
                type="number" 
                min={0}
                value={halfTime}
                onChange={(e) => setHalfTime(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Gap Between Matches (Mins)</label>
              <input 
                type="number" 
                min={0}
                value={restGap}
                onChange={(e) => setRestGap(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
              />
            </div>
          </div>
        </div>

        {/* Team Roster Customization */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Users size={16} className="text-indigo-600" />
              <span>Participating Team Roster ({teamsList.length} Schools)</span>
            </label>
            <span className="text-[10px] font-bold text-slate-400">Edit individual names or paste full list below</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 custom-scrollbar">
            {teamsList.map((team, idx) => {
              const isBye = setup.byeIndices.has(idx);
              return (
                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input 
                    type="text" 
                    value={team}
                    onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
                  />
                  {isBye && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-black uppercase flex-shrink-0">
                      1st Bye
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Bulk Paste Schools (One team per line)</label>
            <textarea 
              rows={3}
              placeholder="Paste list of participating schools line by line..."
              onChange={handleBulkPaste}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-xs text-slate-800 outline-none focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleGenerate}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-3"
        >
          <Sparkles size={20} />
          <span>Generate Knockout Fixture Schedule</span>
        </button>
      </div>

      {/* CBSE Formula Board */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-900 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Teams (N)</div>
          <div className="text-2xl font-black text-slate-900">{setup.N}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Power of 2 (P)</div>
          <div className="text-2xl font-black text-slate-900">{setup.P}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Byes (P - N)</div>
          <div className="text-2xl font-black text-indigo-600">{setup.byesCount}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upper Half (Nu)</div>
          <div className="text-2xl font-black text-slate-900">{setup.Nu}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center col-span-2 md:col-span-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lower Half (Nl)</div>
          <div className="text-2xl font-black text-slate-900">{setup.Nl}</div>
        </div>
      </div>

      {/* Generated Schedule Display */}
      {hasConfirmed && generatedRounds.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">{tournamentName}</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">{subTitle} • {category}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleTriggerPrint}
                className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Printer size={16} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          <div ref={printAreaRef} className="print-bracket-canvas space-y-8">
            {generatedRounds.map((round: any, rIdx: number) => (
              <div key={rIdx} className="bg-white p-6 rounded-[2rem] border-2 border-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                      R{rIdx + 1}
                    </span>
                    <span>{round.name}</span>
                  </h4>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {round.matches.length} Matches
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {round.matches.map((match: Match) => (
                    <div key={match.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                          {match.name}
                        </span>
                        {match.time && (
                          <span className="text-[10px] font-black text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            <span>{match.time}</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-xs font-bold text-slate-900">{match.team1}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">Team 1</span>
                        </div>
                        <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">VS</div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-xs font-bold text-slate-900">{match.team2}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">Team 2</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {thirdPlaceMatch && (
              <div className="bg-amber-50/50 p-6 rounded-[2rem] border-2 border-amber-300 shadow-sm space-y-4">
                <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight flex items-center gap-2">
                  <Trophy size={20} className="text-amber-600" />
                  <span>3rd Place Play-Off Match</span>
                </h4>

                <div className="bg-white p-4 rounded-2xl border border-amber-200 max-w-md space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                      {thirdPlaceMatch.name}
                    </span>
                    {thirdPlaceMatch.time && (
                      <span className="text-[10px] font-black text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>{thirdPlaceMatch.time}</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900">
                      {thirdPlaceMatch.team1}
                    </div>
                    <div className="text-center text-[10px] font-black text-slate-400 uppercase">VS</div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900">
                      {thirdPlaceMatch.team2}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnockoutBracket;
