import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, Printer, Sparkles, Edit3, Check, RefreshCw, 
  Copy, Image as ImageIcon, Eye, Grid, LayoutTemplate, Layers, CheckCircle2,
  Calendar, Clock, Shield, Trophy
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from '../../services/toast.ts';
import { trackEvent } from '../../services/analytics.ts';

export interface ClassicSlot {
  slotIndex: number;
  teamName: string;
  isBye: boolean;
  byeLabel?: string;
}

interface ClassicSheetBracketProps {
  sport?: string;
  tournamentName: string;
  subTitle: string;
  category: string;
  startDate: string;
  teamsList: string[];
  firstHalf: number;
  secondHalf: number;
  halfTime: number;
  restGap: number;
  startTime: string;
  showGridLines?: boolean;
}

export const ClassicSheetBracket: React.FC<ClassicSheetBracketProps> = ({
  sport = 'FOOTBALL',
  tournamentName,
  subTitle,
  category,
  startDate,
  teamsList,
  firstHalf,
  secondHalf,
  halfTime,
  restGap,
  startTime,
  showGridLines: initialShowGrid = true
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [customTitle, setCustomTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTimes, setCustomTimes] = useState<Record<string, string>>({});
  const [customTeamNames, setCustomTeamNames] = useState<Record<number, string>>({});

  // Compute bracket power of 2
  const N = teamsList.length;
  const P = Math.max(4, Math.pow(2, Math.ceil(Math.log2(N || 4))));
  const totalRounds = Math.log2(P); // e.g. 16 -> 4 rounds
  const byesCount = P - N;

  // Format date display for title e.g. [29.08.2026]
  const formattedDateTag = (() => {
    try {
      if (!startDate) return '';
      const [y, m, d] = startDate.split('-');
      if (y && m && d) return `${d}.${m}.${y}`;
      const dt = new Date(startDate);
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const year = dt.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return startDate;
    }
  })();

  const defaultHeader = `${(sport || 'FOOTBALL').toUpperCase()} ${category ? `${category.toUpperCase()} ` : ''}${formattedDateTag ? `[${formattedDateTag}]` : ''}`.trim();
  const displayTitle = customTitle || defaultHeader;

  // Standard CBSE bye allocation logic
  const byeSlots = new Set<number>();
  const Nu = N % 2 === 0 ? N / 2 : (N + 1) / 2;
  let botLower = P - 1;
  let topUpper = 0;
  let topLower = P / 2;
  let botUpper = P / 2 - 1;

  for (let b = 0; b < byesCount; b++) {
    const step = b % 4;
    if (step === 0) {
      byeSlots.add(botLower);
      botLower -= 2;
      if (botLower < P / 2) botLower = P - 2;
    } else if (step === 1) {
      byeSlots.add(topUpper);
      topUpper += 2;
      if (topUpper >= P / 2) topUpper = 1;
    } else if (step === 2) {
      byeSlots.add(topLower);
      topLower += 2;
      if (topLower >= P) topLower = P / 2 + 1;
    } else if (step === 3) {
      byeSlots.add(botUpper);
      botUpper -= 2;
      if (botUpper < 0) botUpper = P / 2 - 2;
    }
  }

  // Populate slots (0 to P-1)
  const slots: ClassicSlot[] = [];
  let teamCursor = 0;
  for (let i = 0; i < P; i++) {
    const isBye = byeSlots.has(i);
    const assignedTeam = customTeamNames[i] || teamsList[teamCursor] || `Team ${i + 1}`;
    if (teamCursor < teamsList.length) {
      teamCursor++;
    }
    slots.push({
      slotIndex: i,
      teamName: assignedTeam,
      isBye: isBye && byesCount > 0,
      byeLabel: 'BYE'
    });
  }

  // Time calculation helper
  const addMinutes = (baseTime: string, mins: number) => {
    const [hStr, mStr] = (baseTime || '08:00').split(':');
    let h = parseInt(hStr, 10) || 8;
    let m = parseInt(mStr, 10) || 0;
    m += mins;
    h += Math.floor(m / 60);
    m = m % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}.${String(m).padStart(2, '0')}${ampm}`;
  };

  const matchDuration = (firstHalf || 15) + (secondHalf || 15) + (halfTime || 5) + (restGap || 10);

  // Pre-calculate round match times
  const roundTimes: string[][] = [];
  let globalMatchIndex = 0;

  for (let r = 0; r < totalRounds; r++) {
    const matchesInRound = Math.pow(2, totalRounds - r - 1);
    const timesForThisRound: string[] = [];
    for (let m = 0; m < matchesInRound; m++) {
      const timeKey = `r${r}_m${m}`;
      if (customTimes[timeKey]) {
        timesForThisRound.push(customTimes[timeKey]);
      } else {
        const calculated = addMinutes(startTime || '08:30', globalMatchIndex * matchDuration);
        timesForThisRound.push(calculated);
      }
      globalMatchIndex++;
    }
    roundTimes.push(timesForThisRound);
  }

  const handleTimeChange = (r: number, m: number, value: string) => {
    setCustomTimes(prev => ({
      ...prev,
      [`r${r}_m${m}`]: value
    }));
  };

  const handleTeamNameChange = (slotIdx: number, value: string) => {
    setCustomTeamNames(prev => ({
      ...prev,
      [slotIdx]: value
    }));
  };

  // Load standard 16-team sample draw with Team 1 - 16 and realistic match timings
  const handleLoad16TeamSample = () => {
    const teams: Record<number, string> = {};
    for (let i = 0; i < 16; i++) {
      teams[i] = `Team ${i + 1}`;
    }
    setCustomTeamNames(teams);
    setCustomTimes({
      // Round 1 (8 matches)
      r0_m0: '9.00AM',
      r0_m1: '9.45AM',
      r0_m2: '10.30AM',
      r0_m3: '11.15AM',
      r0_m4: '12.00PM',
      r0_m5: '12.45PM',
      r0_m6: '1.30PM',
      r0_m7: '2.15PM',
      // Quarter Finals (Round 2, 4 matches)
      r1_m0: '10.45AM',
      r1_m1: '12.30PM',
      r1_m2: '2.30PM',
      r1_m3: '3.15PM',
      // Semi Finals (Round 3, 2 matches)
      r2_m0: '3.45PM',
      r2_m1: '4.30PM',
      // Final (Round 4, 1 match)
      r3_m0: '5.15PM'
    });
    setCustomTitle('FOOTBALL U - 11 [29.08.2026]');
    toast.success("Loaded 16-Team sample draw (Team 1 - 16 with match timings)!");
  };

  // Download as Image (.PNG)
  const handleDownloadImage = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(sheetRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      const cleanFileName = `${(sport || 'Tournament').toLowerCase()}_fixture_bracket_${formattedDateTag || 'sheet'}.png`.replace(/[^a-z0-9_.]/gi, '_');
      link.download = cleanFileName;
      link.href = dataUrl;
      link.click();
      toast.success("Tournament Fixture image downloaded successfully!");
      trackEvent('resource_downloaded', { resource_name: `Fixture Bracket (${sport})`, format: 'png', teamsCount: N });
    } catch (err) {
      console.error("Failed to export image:", err);
      toast.error("Failed to export bracket image. Please try Print / Save PDF instead.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Geometry configuration
  const ROW_HEIGHT = P <= 8 ? 58 : P <= 16 ? 46 : 36;
  const TOTAL_HEIGHT = P * ROW_HEIGHT + 140;
  const SLOT_WIDTH = 260;
  const STEP_COL_WIDTH = 135;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-4 md:p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center font-black">
            <LayoutTemplate size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">Classic Fixture Sheet</h4>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[9px] font-black uppercase">
                Grid / Image Format
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Classic lined tournament tree with spreadsheet background & red match times.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Load 16 Team Sample */}
          <button
            onClick={handleLoad16TeamSample}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border bg-red-600/20 hover:bg-red-600/30 border-red-500/40 text-red-300"
            title="Load standard 16 teams (Team 1 - 16) with sample timings"
          >
            <Sparkles size={14} className="text-red-400" />
            <span>Sample 16 Teams & Timings</span>
          </button>

          {/* Toggle Grid Lines */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showGrid 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle background spreadsheet grid lines"
          >
            <Grid size={14} />
            <span>{showGrid ? 'Grid: ON' : 'Grid: OFF'}</span>
          </button>

          {/* Download Image (.PNG) */}
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <ImageIcon size={14} />}
            <span>Download Image (.PNG)</span>
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/30"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Viewport */}
      <div className="bg-slate-100 p-3 md:p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-inner overflow-x-auto">
        <div 
          ref={sheetRef}
          className={`mx-auto bg-white p-6 md:p-12 rounded-2xl shadow-xl transition-all relative border border-slate-300 min-w-[900px] max-w-[1200px] ${
            showGrid ? 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_24px]' : ''
          }`}
          style={{ minHeight: `${TOTAL_HEIGHT}px` }}
        >
          {/* Header Title (Red, Bold, Left-Aligned like user image) */}
          <div className="mb-8 border-b-2 border-slate-200 pb-4 flex justify-between items-start">
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={customTitle || displayTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. FOOTBALL U - 11 [29.08.2026]"
                    className="text-xl md:text-2xl font-black text-red-600 border-2 border-red-400 p-2 rounded-xl outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => setIsEditingTitle(false)}
                    className="p-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-3">
                  <h1 className="text-xl md:text-3xl font-black tracking-tight text-red-600 uppercase font-sans">
                    {displayTitle}
                  </h1>
                  <button 
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-1 transition-all"
                    title="Click to edit title directly"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}

              {(tournamentName || subTitle) && (
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest mt-1">
                  {tournamentName} {subTitle ? `• ${subTitle}` : ''}
                </p>
              )}
            </div>

            <div className="text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
              <span className="text-indigo-600 font-bold">Knockout Tournament Draw</span>
              <div className="text-slate-900 font-black">{N} Teams • {P} Bracket Lines ({byesCount} Byes)</div>
            </div>
          </div>

          {/* SVG Tree Bracket Engine */}
          <div className="relative w-full" style={{ height: `${P * ROW_HEIGHT}px` }}>
            {/* 1. First Round Team Slot Lines */}
            {slots.map((slot, sIdx) => {
              const isEvenPair = sIdx % 2 === 0;
              const matchIdxInR1 = Math.floor(sIdx / 2);
              const matchTime = roundTimes[0]?.[matchIdxInR1] || '';

              return (
                <div 
                  key={`slot-${sIdx}`}
                  className="absolute left-0 flex flex-col justify-end"
                  style={{ 
                    top: `${sIdx * ROW_HEIGHT}px`, 
                    height: `${ROW_HEIGHT}px`,
                    width: `${SLOT_WIDTH}px`
                  }}
                >
                  {/* Team Name Label sitting directly on the horizontal black line */}
                  <div className="flex items-center justify-between pr-2 mb-0.5">
                    <input
                      type="text"
                      value={slot.teamName}
                      onChange={(e) => handleTeamNameChange(sIdx, e.target.value)}
                      className="text-xs font-black uppercase text-slate-900 tracking-tight bg-transparent outline-none focus:bg-amber-50 rounded px-1 w-[180px] truncate"
                      title="Click to edit team name"
                    />

                    {/* Show Match Time on the second team of each pair in RED font */}
                    {!isEvenPair && matchTime && !slot.isBye && (
                      <input
                        type="text"
                        value={customTimes[`r0_m${matchIdxInR1}`] ?? matchTime}
                        onChange={(e) => handleTimeChange(0, matchIdxInR1, e.target.value)}
                        className="text-[11px] font-black text-red-600 tracking-tighter w-16 text-right bg-transparent outline-none focus:bg-red-50 rounded px-0.5"
                        title="Click to edit match time"
                      />
                    )}

                    {slot.isBye && (
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">
                        (BYE)
                      </span>
                    )}
                  </div>

                  {/* Horizontal solid black line */}
                  <div className="w-full h-[2px] bg-slate-900"></div>
                </div>
              );
            })}

            {/* 2. SVG Connecting Step Lines & Match Times for all Rounds */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-auto"
              style={{ overflow: 'visible' }}
            >
              {Array.from({ length: totalRounds }).map((_, rIdx) => {
                const matchesInThisRound = Math.pow(2, totalRounds - rIdx - 1);
                const stepX = SLOT_WIDTH + rIdx * STEP_COL_WIDTH;
                const colWidth = STEP_COL_WIDTH;

                return Array.from({ length: matchesInThisRound }).map((__, mIdx) => {
                  // Span of slots this match covers
                  const slotsSpan = Math.pow(2, rIdx + 1);
                  const topSlotIdx = mIdx * slotsSpan;
                  const bottomSlotIdx = topSlotIdx + slotsSpan - 1;

                  // Center Y positions of top feeder branch and bottom feeder branch
                  const topBranchY = (topSlotIdx + (slotsSpan / 4 - 0.5)) * ROW_HEIGHT + ROW_HEIGHT / 2;
                  const bottomBranchY = (bottomSlotIdx - (slotsSpan / 4 - 0.5)) * ROW_HEIGHT + ROW_HEIGHT / 2;
                  const centerY = (topBranchY + bottomBranchY) / 2;

                  const nextTime = roundTimes[rIdx + 1]?.[Math.floor(mIdx / 2)] || '';
                  const timeKey = `r${rIdx + 1}_m${Math.floor(mIdx / 2)}`;
                  const displayTime = customTimes[timeKey] ?? nextTime;

                  const isLastRound = rIdx === totalRounds - 1;

                  return (
                    <g key={`round-${rIdx}-match-${mIdx}`}>
                      {/* Vertical bracket connector */}
                      <line 
                        x1={stepX} 
                        y1={topBranchY} 
                        x2={stepX} 
                        y2={bottomBranchY} 
                        stroke="#0f172a" 
                        strokeWidth="2" 
                      />

                      {/* Right horizontal advance line */}
                      <line 
                        x1={stepX} 
                        y1={centerY} 
                        x2={stepX + colWidth} 
                        y2={centerY} 
                        stroke="#0f172a" 
                        strokeWidth="2" 
                      />

                      {/* Match Time on next round line in RED (like the 10.45AM, 12.30PM, 2.30PM in image) */}
                      {!isLastRound && (mIdx % 2 === 1 || matchesInThisRound === 1) && displayTime && (
                        <foreignObject 
                          x={stepX + 6} 
                          y={centerY - 22} 
                          width={95} 
                          height={22}
                        >
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={displayTime}
                              onChange={(e) => handleTimeChange(rIdx + 1, Math.floor(mIdx / 2), e.target.value)}
                              className="text-[11px] font-black text-red-600 tracking-tighter bg-transparent outline-none focus:bg-red-50 px-1 rounded w-full"
                              title="Click to edit round match time"
                            />
                          </div>
                        </foreignObject>
                      )}

                      {/* Final match time right on the championship line */}
                      {isLastRound && displayTime && (
                        <foreignObject 
                          x={stepX + 6} 
                          y={centerY - 22} 
                          width={95} 
                          height={22}
                        >
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={displayTime}
                              onChange={(e) => handleTimeChange(rIdx + 1, 0, e.target.value)}
                              className="text-[11px] font-black text-red-600 tracking-tighter bg-transparent outline-none focus:bg-red-50 px-1 rounded w-full"
                              title="Click to edit final match time"
                            />
                          </div>
                        </foreignObject>
                      )}

                      {/* Grand Final Winner Marker */}
                      {isLastRound && (
                        <foreignObject 
                          x={stepX + colWidth + 8} 
                          y={centerY - 18} 
                          width={150} 
                          height={36}
                        >
                          <div className="bg-amber-100 border-2 border-amber-500 text-amber-950 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                            <Trophy size={14} className="text-amber-600" />
                            <span>WINNER</span>
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                });
              })}
            </svg>
          </div>

          {/* Footer Notes on Sheet */}
          <div className="mt-12 pt-4 border-t border-slate-300 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest gap-2">
            <span>Official Fixture Draw • CBSE & SGFI Standard Bye Allocation</span>
            <span>Generated via SmartPE Tournament Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicSheetBracket;
