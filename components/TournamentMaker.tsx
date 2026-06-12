import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Users, Calendar, Clock, Printer, Trash2, Plus, RefreshCw, 
  ChevronRight, ArrowRight, Shield, Download, Sparkles, AlertCircle, CheckCircle2, HelpCircle,
  ExternalLink, Share2, FileText, Check, Copy
} from 'lucide-react';

interface Match {
  id: number;
  name: string; // e.g. "Match - 1"
  roundName: string; // e.g. "I - Round"
  team1: string; // "School A" or "Winner of Match X"
  team2: string; // "School B" or "Winner of Match Y"
  time: string; // "08:15 AM"
  date: string;
  isBye?: boolean;
}

const PRESET_SCHOOLS = [
  "Shraddha Children’s Academy, Kottivakkam",
  "San Academy velachery",
  "A.A Public School CBSE",
  "Sri Chaitanya Techno school perumbakkam",
  "Chettinad Vidyashram, R.A Puram",
  "bvm global perungudi",
  "PS Senior secondary school",
  "PSBB Sirusery",
  "PSSB KK Nagar",
  "Hiranandani Upscale School",
  "Vidya mandir Adyar",
  "Vaels International school",
  "DAV Boys Sr. Sec. School, Gopalapuram",
  "Velamal bodhi campus Kanchipuram",
  "VELLORE INTERNATIONAL SCHOOL, KAYAR",
  "KC HIGH INTERNATIONAL SCHOOL",
  "Sankra - Adyar",
  "GTA",
  "Vels Vidyashram senior secondary school Pallavaram"
];

const TournamentMaker: React.FC = () => {
  // Input form states
  const [tournamentName, setTournamentName] = useState('Chiranjeevulu Memorial Trophy');
  const [subTitle, setSubTitle] = useState('Inter school boys Five-A-Side Futsal Tournament');
  const [category, setCategory] = useState('U-14');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [numTeams, setNumTeams] = useState<number>(10);
  
  // Initialize teams with some defaults from presets
  const [teamsList, setTeamsList] = useState<string[]>(() => {
    return Array.from({ length: 10 }, (_, i) => PRESET_SCHOOLS[i % PRESET_SCHOOLS.length]);
  });

  // Timings & Durations (broken down as requested)
  const [firstHalf, setFirstHalf] = useState<number>(15);
  const [secondHalf, setSecondHalf] = useState<number>(15);
  const [halfTime, setHalfTime] = useState<number>(5);
  const [restGap, setRestGap] = useState<number>(10);
  const [startTime, setStartTime] = useState('08:15');

  // Third Place Preference
  const [thirdPlaceMode, setThirdPlaceMode] = useState<'none' | 'same' | 'different'>('same');
  const [thirdPlaceDate, setThirdPlaceDate] = useState(new Date().toISOString().split('T')[0]);
  const [thirdPlaceTime, setThirdPlaceTime] = useState('15:15');

  // Generation status
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  
  // Computed Schedule Bracket Data
  const [generatedRounds, setGeneratedRounds] = useState<any[]>([]);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<Match | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Update teams array length when numTeams changes
  const handleNumTeamsChange = (n: number) => {
    setNumTeams(n);
    setTeamsList(prev => {
      const currentList = [...prev];
      if (n > currentList.length) {
        // add elements up to n
        for (let i = currentList.length; i < n; i++) {
          currentList.push(PRESET_SCHOOLS[i % PRESET_SCHOOLS.length]);
        }
      } else {
        // truncate to n
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

    return { N, P, byesCount, Nu, Nl, byeIndices };
  };

  // Helper to convert time "HH:MM" & offset by minutes
  const addMinutesToTime = (timeStr: string, minutes: number): string => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + minutes);
    
    let hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  };

  // Generate exact bracket schedules with standard single elimination formulas and byes
  const buildKnockoutBrackets = () => {
    const N = teamsList.length;
    if (N < 2) return;

    // 1. Determine base power of 2 bracket size
    const P = Math.pow(2, Math.ceil(Math.log2(N))); // 4, 8, 16, 32, etc.
    const byesCount = P - N;

    const Nu = N % 2 === 0 ? N / 2 : (N + 1) / 2;
    const Nl = N % 2 === 0 ? N / 2 : (N - 1) / 2;

    // CBSE systematic bye allocation in strict standard order
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

    // Calculate total duration of one match block
    const matchBlockDuration = firstHalf + secondHalf + halfTime + restGap;

    let matchCounter = 1;
    let physicalMatchCount = 0;

    // Date formatting to "DD-MM-YYYY (Weekday)"
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

    const hostDate = formatDateObj(startDate);

    // Round 1 Matches: only are played by teams without byes
    const round1Matches: Match[] = [];
    const nonByeIndicesInOrder: number[] = [];
    for (let i = 0; i < N; i++) {
      if (!byeIndices.has(i)) {
        nonByeIndicesInOrder.push(i);
      }
    }

    // Pair non-bye teams as they appear vertically matching the CBSE custom seed sheet
    for (let i = 0; i < nonByeIndicesInOrder.length; i += 2) {
      if (i + 1 < nonByeIndicesInOrder.length) {
        const idx1 = nonByeIndicesInOrder[i];
        const idx2 = nonByeIndicesInOrder[i + 1];
        const currentMatchId = matchCounter++;
        const correctTime = addMinutesToTime(startTime, physicalMatchCount * matchBlockDuration);
        physicalMatchCount++;

        round1Matches.push({
          id: currentMatchId,
          name: `Match - ${currentMatchId}`,
          roundName: "I - Round",
          team1: teamsList[idx1],
          team2: teamsList[idx2],
          time: correctTime,
          date: hostDate.formatted,
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

    // Round 2 Entries (always P / 2 entries in vertical order)
    const round2Entries: string[] = [];
    const processedR1Matched = new Set<number>();

    for (let i = 0; i < N; i++) {
      if (byeIndices.has(i)) {
        round2Entries.push(teamsList[i]);
      } else {
        // This team played in Round 1. Find which match they played in.
        const r1Match = round1Matches.find(m => m.team1 === teamsList[i] || m.team2 === teamsList[i]);
        if (r1Match && !processedR1Matched.has(r1Match.id)) {
          processedR1Matched.add(r1Match.id);
          round2Entries.push(`Winner of Match ${r1Match.id}`);
        }
      }
    }

    // Assemble subsequent rounds
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
        const correctTime = addMinutesToTime(startTime, physicalMatchCount * matchBlockDuration);
        physicalMatchCount++;

        currentRoundMatches.push({
          id: currentMatchId,
          name: `Match - ${currentMatchId}`,
          roundName: roundNameStr,
          team1: s1,
          team2: s2,
          time: correctTime,
          date: hostDate.formatted,
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

    // Determine the finals, and the semi-finals index
    const semiFinalRound = roundsSchedules.find(r => r.name === "Semi Finals");
    let calculatedThirdPlace: Match | null = null;

    if (semiFinalRound && semiFinalRound.matches.length === 2 && thirdPlaceMode !== 'none') {
      const sf1 = semiFinalRound.matches[0];
      const sf2 = semiFinalRound.matches[1];
      
      const currentMatchId = matchCounter++;
      let tPlaceDate = hostDate.formatted;
      let tPlaceTime = "";
      
      if (thirdPlaceMode === 'same') {
        tPlaceTime = addMinutesToTime(startTime, physicalMatchCount * matchBlockDuration);
        physicalMatchCount++;
      } else {
        const customTDateObj = formatDateObj(thirdPlaceDate);
        tPlaceDate = customTDateObj.formatted;
        tPlaceTime = addMinutesToTime(thirdPlaceTime, 0);
      }

      calculatedThirdPlace = {
        id: currentMatchId,
        name: `Match - ${currentMatchId}`,
        roundName: "Third Place Play-off",
        team1: `Loser of ${sf1.name}`,
        team2: `Loser of ${sf2.name}`,
        time: tPlaceTime,
        date: tPlaceDate
      };
    }

    // Ensure the main Final is scheduled at the very end
    const lastRound = roundsSchedules[roundsSchedules.length - 1];
    if (lastRound && lastRound.name === "Finals" && lastRound.matches.length === 1) {
      const finalMatch = lastRound.matches[0];
      if (calculatedThirdPlace && thirdPlaceMode === 'same') {
        const finalMatchTime = addMinutesToTime(startTime, physicalMatchCount * matchBlockDuration);
        finalMatch.time = finalMatchTime;
      }
    }

    setGeneratedRounds(roundsSchedules);
    setThirdPlaceMatch(calculatedThirdPlace);
  };

  const handleGenerate = () => {
    buildKnockoutBrackets();
    setHasConfirmed(true);
    setShowChecklist(false);
    
    // Automatically set optimal initial scale based on team count for single-page printing
    const optimal = getOptimalPrintScale(teamsList.length, 'A4', 'landscape');
    setPrintScale(optimal);
  };

  const [copiedText, setCopiedText] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Advanced PDF/Print Configuration states for fitting perfectly onto A4/A3 single page
  const [printPageSize, setPrintPageSize] = useState<'A4' | 'A3'>('A4');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [printScale, setPrintScale] = useState<number>(85);
  const [hideFormulaBoardInPrint, setHideFormulaBoardInPrint] = useState<boolean>(false);
  const [hideRosterInPrint, setHideRosterInPrint] = useState<boolean>(false);
  const [hideRulesFooterInPrint, setHideRulesFooterInPrint] = useState<boolean>(false);

  const getOptimalPrintScale = (teamCount: number, size: 'A4' | 'A3', orientation: 'portrait' | 'landscape') => {
    if (size === 'A4') {
      if (orientation === 'landscape') {
        if (teamCount <= 4) return 100;
        if (teamCount <= 8) return 85;
        if (teamCount <= 16) return 65;
        return 48; // 32 teams/more
      } else { // portrait
        if (teamCount <= 4) return 90;
        if (teamCount <= 8) return 70;
        if (teamCount <= 16) return 48;
        return 38;
      }
    } else { // A3
      if (orientation === 'landscape') {
        if (teamCount <= 4) return 130;
        if (teamCount <= 8) return 110;
        if (teamCount <= 16) return 90;
        return 72;
      } else { // portrait
        if (teamCount <= 4) return 115;
        if (teamCount <= 8) return 90;
        if (teamCount <= 16) return 72;
        return 55;
      }
    }
  };

  const handleApplyAutoFit = () => {
    const optimal = getOptimalPrintScale(teamsList.length, printPageSize, printOrientation);
    setPrintScale(optimal);
  };

  const handleTriggerPrint = () => {
    try {
      // Clean up previous print styles
      const oldStyle = document.getElementById('dynamic-print-style');
      if (oldStyle) oldStyle.remove();

      const estimatedUnscaledHeight = bracketHeight + (hideFormulaBoardInPrint ? 0 : 220) + (thirdPlaceMatch ? 180 : 0) + 120;
      const verticalCompensationValue = Math.round(estimatedUnscaledHeight * (1 - printScale / 100));

      // Create custom page-size and CSS transform styles matching A4 or A3 selection
      const style = document.createElement('style');
      style.id = 'dynamic-print-style';
      style.innerHTML = `
        @media print {
          html, body {
            overflow: hidden !important;
            height: 100% !important;
          }
          @page {
            size: ${printPageSize.toLowerCase()} ${printOrientation.toLowerCase()};
            margin: 0.5cm !important;
          }
          .print-bracket-canvas {
            transform: scale(${printScale / 100}) !important;
            transform-origin: top left !important;
            margin: 0 !important;
            margin-bottom: -${verticalCompensationValue}px !important;
            width: ${100 / (printScale / 100)}% !important;
            max-width: none !important;
            overflow: visible !important;
            --conn-width: 16px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          ${hideFormulaBoardInPrint ? '.print-hide-formula { display: none !important; }' : ''}
          ${hideRosterInPrint ? '.print-hide-roster { display: none !important; }' : ''}
          ${hideRulesFooterInPrint ? '.print-hide-rules { display: none !important; }' : ''}
        }
        @media print and (orientation: landscape) {
          .print-bracket-canvas [class*="md:flex-row"] {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
        }
      `;
      document.head.appendChild(style);

      window.print();
    } catch (e) {
      console.error("Print triggered directly from iframe may have sandbox limitations.", e);
    }
  };

  const handleOpenPrintWindow = () => {
    // Open a style-pure pop-up window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for smartpeindia to open and save the PDF/Print layout.");
      return;
    }

    // CRITICAL: Use outerHTML to capture the parent wrapper div along with its classes (.print-bracket-canvas)
    const printContent = printAreaRef.current ? printAreaRef.current.outerHTML : '';
    
    const estimatedUnscaledHeight = bracketHeight + (hideFormulaBoardInPrint ? 0 : 220) + (thirdPlaceMatch ? 180 : 0) + 120;
    const verticalCompensationValue = Math.round(estimatedUnscaledHeight * (1 - printScale / 100));

    // Construct self-contained page with modern tailwind support and manual printer trigger
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>smartpeindia Bracket System - ${tournamentName}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;600;700;800&display=swap">
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { 
              font-family: "Inter", sans-serif; 
              background: #f8fafc !important; 
              color: #0f172a !important;
              padding: 30px !important;
            }
            h1, h2, h3, h4, .font-display {
              font-family: "Manrope", sans-serif;
            }
            :root {
              --conn-width: 24px;
            }
            
            /* Print rules */
            @media print {
              html, body {
                overflow: hidden !important;
                height: 100% !important;
              }
              body { 
                padding: 0 !important; 
                background: white !important;
                color: #0f172a !important;
              }
              .no-print { display: none !important; }
              
              @page {
                size: ${printPageSize.toLowerCase()} ${printOrientation.toLowerCase()};
                margin: 0.5cm !important;
              }

              .print-bracket-canvas {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: ${100 / (printScale / 100)}% !important;
                max-width: none !important;
                transform: scale(${printScale / 100}) !important;
                transform-origin: top left !important;
                margin-bottom: -${verticalCompensationValue}px !important;
                overflow: visible !important;
                --conn-width: 16px !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              .print-bracket-canvas > div,
              .print-bracket-canvas table,
              .print-bracket-canvas tr,
              .print-bracket-canvas .bg-slate-50,
              .print-bracket-canvas .bg-pink-50,
              .print-bracket-canvas .rounded-xl {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              ${hideFormulaBoardInPrint ? '.print-hide-formula { display: none !important; }' : ''}
              ${hideRosterInPrint ? '.print-hide-roster { display: none !important; }' : ''}
              ${hideRulesFooterInPrint ? '.print-hide-rules { display: none !important; }' : ''}
            }

            @media print and (orientation: landscape) {
              .print-bracket-canvas [class*="md:flex-row"] {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                align-items: stretch !important;
                gap: 0.75rem !important;
              }
            }
          </style>
        </head>
        <body class="bg-slate-50 animate-fade-in">
          <div class="max-w-5xl mx-auto space-y-4 print:max-w-none print:w-full print:p-0 print:m-0">
            <!-- Printing Help Banner -->
            <div class="no-print bg-indigo-50 border-2 border-indigo-200 text-indigo-950 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 class="font-extrabold text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <span>🖨️ Sandbox-Safe ${printPageSize} ${printOrientation.toUpperCase()} Layout Setup</span>
                </h3>
                <p class="text-[11px] text-indigo-850 font-semibold mt-1">This isolated tab contains a fresh, responsive format optimized at <strong>${printScale}% custom scaling</strong>.</p>
                <p class="text-[10px] text-indigo-700/80 mt-0.5">Note: Verify your printer setup lists <strong>"${printPageSize}"</strong> and orientation paper <strong>"${printOrientation.toUpperCase()}"</strong> with background colors enabled.</p>
              </div>
              <button onclick="window.print()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all self-end md:self-auto">
                Trigger Print Panel (Ctrl + P)
              </button>
            </div>
            
            <!-- Styled wrapper for screen viewing which dissolves natively in the print engine -->
            <div class="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-md print:bg-transparent print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
              ${printContent}
            </div>
          </div>
          <script>
            // Auto trigger once scripts and stylesheets settle
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportToWord = () => {
    const setup = calculateCBNKSetup(teamsList);
    
    let roundsHtml = '';
    generatedRounds.forEach((round, rIdx) => {
      roundsHtml += `
        <h2>Round ${rIdx + 1}: ${round.name}</h2>
        <table class="table">
          <thead>
            <tr>
              <th style="width: 15%;">Match ID</th>
              <th style="width: 35%;">Team 1</th>
              <th style="width: 15%;">Time Slot</th>
              <th style="width: 35%;">Team 2</th>
            </tr>
          </thead>
          <tbody>
            ${round.matches.map((m: Match) => `
              <tr>
                <td><strong>Match ${m.id}</strong></td>
                <td>${m.team1 || 'TBD'} ${m.isBye ? '<span class="bye-badge">(BYE)</span>' : ''}</td>
                <td>${m.time || 'AUTO'}</td>
                <td>${m.team2 || 'TBD'} ${m.isBye ? '<span class="bye-badge">(BYE)</span>' : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });

    let thirdPlaceHtml = '';
    if (thirdPlaceMatch) {
      thirdPlaceHtml += `
        <h2>3rd Place Play-Off Match</h2>
        <table class="table">
          <thead>
            <tr>
              <th style="width: 15%;">Match ID</th>
              <th style="width: 35%;">Team 1 (Semi Final 1 Loser)</th>
              <th style="width: 15%;">Time</th>
              <th style="width: 35%;">Team 2 (Semi Final 2 Loser)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>3rd Place</strong></td>
              <td>${thirdPlaceMatch.team1}</td>
              <td>${thirdPlaceMatch.time}</td>
              <td>${thirdPlaceMatch.team2}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    let teamsListHtml = '';
    teamsList.forEach((team, idx) => {
      const isBye = setup.byeIndices.has(idx);
      teamsListHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${team}</strong></td>
          <td>${idx < setup.Nu ? 'Upper Half' : 'Lower Half'}</td>
          <td>${isBye ? 'Exempt (1st Round BYE)' : 'Plays in Round 1'}</td>
        </tr>
      `;
    });

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${tournamentName}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 20px; }
          h1 { color: #db2777; border-bottom: 2px solid #db2712; padding-bottom: 8px; margin-bottom: 4px; }
          .subtitle { font-size: 14px; font-weight: bold; color: #475569; margin-top: 0; margin-bottom: 20px; }
          h2 { color: #4338ca; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 30px; }
          .meta-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
          .meta-table { width: 100%; border-collapse: collapse; }
          .meta-table td { padding: 4px 8px; font-size: 12px; }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          .table th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; }
          .bye-badge { color: #db2777; font-weight: bold; font-size: 10px; background-color: #fdf2f8; padding: 2px 6px; border-radius: 4px; border: 1px solid #fbcfe8; }
        </style>
      </head>
      <body>
        <h1>🏆 ${tournamentName}</h1>
        <p class="subtitle">${subTitle} - ${category}</p>
        
        <div class="meta-box">
          <table class="meta-table">
            <tr>
              <td><strong>Tournament Date:</strong> ${new Date(startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              <td><strong>Total Teams (N):</strong> ${teamsList.length}</td>
            </tr>
            <tr>
              <td><strong>Match Duration:</strong> ${firstHalf} mins | ${secondHalf} mins (Break: ${halfTime} mins)</td>
              <td><strong>Next Power of 2 (P):</strong> ${setup.P}</td>
            </tr>
            <tr>
              <td><strong>Transition Gap:</strong> ${restGap} mins interval</td>
              <td><strong>Total Byes Allocation:</strong> ${setup.byesCount}</td>
            </tr>
          </table>
        </div>

        <h2>Registered Roster & Half Selection</h2>
        <table class="table">
          <thead>
            <tr>
              <th style="width: 10%;">Seed ID</th>
              <th style="width: 40%;">Team Name</th>
              <th style="width: 25%;">CBSE Division Assignment</th>
              <th style="width: 25%;">First-Round Status</th>
            </tr>
          </thead>
          <tbody>
            ${teamsListHtml}
          </tbody>
        </table>

        ${roundsHtml}
        
        ${thirdPlaceHtml}

        <p style="margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center;">
          Document generated automatically with smartpeindia - Interactive Bracket Designer on ${new Date().toLocaleDateString()}
        </p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournamentName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_bracket.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getWhatsAppSummaryText = () => {
    const setup = calculateCBNKSetup(teamsList);
    let text = `🏆 *${tournamentName}* 🏆\n`;
    if (subTitle) text += `_${subTitle}_\n`;
    text += `📅 *Date:* ${new Date(startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    text += `⚽ *Division:* ${category}\n\n`;
    
    text += `📊 *CBSE BRACKET METRICS:*\n`;
    text += `- Total Teams (N): ${teamsList.length}\n`;
    text += `- Allocated Byes (P - N): ${setup.byesCount}\n`;
    text += `- Match Cycle: ${firstHalf}m + ${secondHalf}m (Break: ${halfTime}m, Rest: ${restGap}m)\n\n`;

    text += `📋 *SCHEDULED ROUNDS:*\n`;
    generatedRounds.forEach((round, rIdx) => {
      text += `\n*Round ${rIdx + 1} - ${round.name}*\n`;
      round.matches.forEach((m: Match) => {
        if (m.isBye) {
          text += `🔹 [${m.team1}] has a First Round BYE\n`;
        } else {
          text += `🕒 ${m.time} | Match ${m.id}: ${m.team1} v/s ${m.team2}\n`;
        }
      });
    });

    if (thirdPlaceMatch) {
      text += `\n*🥉 3rd Place Play-Off Match*\n`;
      text += `🕒 ${thirdPlaceMatch.time} | ${thirdPlaceMatch.team1} v/s ${thirdPlaceMatch.team2}\n`;
    }

    text += `\nGenerated via *smartpeindia* Tournament Designer\n`;
    return text;
  };

  const handleShareWhatsApp = () => {
    const summaryText = getWhatsAppSummaryText();
    const encodedText = encodeURIComponent(summaryText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopySummaryText = () => {
    const summaryText = getWhatsAppSummaryText();
    try {
      navigator.clipboard.writeText(summaryText)
        .then(() => {
          setCopiedText(true);
          setTimeout(() => setCopiedText(false), 2000);
        })
        .catch(err => {
          console.error("Could not copy summary:", err);
          fallbackCopyText(summaryText);
        });
    } catch (e) {
      fallbackCopyText(summaryText);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      alert("Please copy text manually from the dialog box.");
    }
  };

  const getBracketHeight = () => {
    const N = teamsList.length;
    if (N <= 4) return 380;
    if (N <= 8) return 580;
    if (N <= 16) return 960;
    return 1880;
  };
  const bracketHeight = getBracketHeight();

  return (
    <div className="space-y-8 pb-24">
      {/* Configuration Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-800 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <Trophy className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 rotate-12" />
        <div className="relative z-10 max-w-3xl">
          <span className="px-4 py-1 bg-white/10 text-white border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4 backdrop-blur-md">
            <Sparkles size={12} className="text-pink-300" />
            Interactive Bracket Designer
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase">Tournament Maker</h2>
          <p className="text-pink-100 text-sm md:text-base font-semibold leading-relaxed mb-0">
            Design highly precise Single-Elimination (Knockout) Brackets based on team counts. Automatically schedule matches, allocate "Byes", calibrate match duration/rest ratios, and generate print-ready diagrams.
          </p>
        </div>
      </div>

      {!hasConfirmed ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls - Left */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Shield size={20} className="text-pink-600" />
                <span>Tournament Details</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tournament Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                    value={tournamentName}
                    onChange={e => setTournamentName(e.target.value)}
                    placeholder="e.g. Chiranjeevulu Memorial Trophy"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category / Bracket Description</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                    value={subTitle}
                    onChange={e => setSubTitle(e.target.value)}
                    placeholder="e.g. Inter school boys Five-A-Side Futsal Tournament"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Age Division</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="e.g. U-14"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Main Play Date</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timings Details */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Clock size={20} className="text-pink-600" />
                <span>Duration Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">First Half (Mins)</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                    value={firstHalf}
                    onChange={e => setFirstHalf(Math.max(1, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Second Half (Mins)</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                    value={secondHalf}
                    onChange={e => setSecondHalf(Math.max(1, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Half Time Break (Mins)</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                    value={halfTime}
                    onChange={e => setHalfTime(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rest Gap to next (Mins)</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                    value={restGap}
                    onChange={e => setRestGap(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tournament Start Time</label>
                  <input 
                    type="time" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-pink-500 transition-all text-slate-800"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-center border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Match Cycle Time</span>
                  <span className="text-base font-black text-slate-700">{firstHalf + secondHalf + halfTime + restGap} minutes</span>
                </div>
              </div>
            </div>

            {/* Third-Place Options */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Trophy size={18} className="text-pink-600" />
                <span>3rd Place Play-Off Setup</span>
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tPlaceRadio" 
                      checked={thirdPlaceMode === 'none'} 
                      onChange={() => setThirdPlaceMode('none')}
                    />
                    <span className="text-xs font-bold text-slate-700">Do Not Play (No Third Place)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tPlaceRadio" 
                      checked={thirdPlaceMode === 'same'} 
                      onChange={() => setThirdPlaceMode('same')}
                    />
                    <span className="text-xs font-bold text-slate-700">Same Day (Scheduled automatically right before finals)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tPlaceRadio" 
                      checked={thirdPlaceMode === 'different'} 
                      onChange={() => setThirdPlaceMode('different')}
                    />
                    <span className="text-xs font-bold text-slate-700">Different Day / Specific Time</span>
                  </label>
                </div>

                {thirdPlaceMode === 'different' && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-pink-50 border border-pink-100 rounded-3xl animate-in zoom-in-95">
                    <div>
                      <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest mb-1 block font-sans">Play Date</label>
                      <input 
                        type="date"
                        className="w-full p-3 bg-white border border-pink-200 rounded-xl text-xs font-bold text-slate-800"
                        value={thirdPlaceDate}
                        onChange={e => setThirdPlaceDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-pink-700 uppercase tracking-widest mb-1 block font-sans">Play Time</label>
                      <input 
                        type="time"
                        className="w-full p-3 bg-white border border-pink-200 rounded-xl text-xs font-bold text-slate-800"
                        value={thirdPlaceTime}
                        onChange={e => setThirdPlaceTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seed list & names - Right */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Users size={20} className="text-pink-600" />
                  <span>Team / School Registry ({numTeams} Teams)</span>
                </h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Number:</span>
                  <input 
                    type="number"
                    min="2"
                    max="32"
                    className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-700"
                    value={numTeams}
                    onChange={e => handleNumTeamsChange(Math.min(32, Math.max(2, parseInt(e.target.value) || 2)))}
                  />
                </div>
              </div>

              {/* Bulk paste option */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Bulk Paste (one school/team per line)</label>
                <textarea 
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Paste long school roster here to auto-populate..."
                  onChange={handleBulkPaste}
                />
              </div>

              {/* Roster list inputs */}
              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {teamsList.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border">
                      {idx + 1}
                    </span>
                    <input 
                      type="text"
                      className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-700 focus:bg-white focus:border-pink-500 transition-all"
                      value={team}
                      onChange={e => handleTeamNameChange(idx, e.target.value)}
                      placeholder={`Enter school or team ${idx + 1}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Trigger */}
            <div className="pt-8 border-t border-slate-100 mt-8">
              {showChecklist ? (
                <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-3xl space-y-4 animate-in slide-in-from-bottom-5">
                  <div className="flex gap-2">
                    <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
                    <h4 className="font-extrabold text-sm text-orange-950 uppercase tracking-wider">Is Everything Correctly Entered?</h4>
                  </div>
                  <ul className="text-xs font-medium text-orange-850 space-y-2 pl-6 list-disc">
                    <li>Is the Tournament Name <strong>"{tournamentName}"</strong> correct?</li>
                    <li>Are the match timers broken down correctly: 1st half ({firstHalf}m), 2nd half ({secondHalf}m), Break ({halfTime}m), Rest ({restGap}m)?</li>
                    <li>Are all {numTeams} teams' school labels precisely typed?</li>
                    <li>Is 3rd place match placement set to <strong>"{thirdPlaceMode === 'none' ? 'No Match' : thirdPlaceMode === 'same' ? 'Same Day' : 'Separate Day'}"</strong>?</li>
                  </ul>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={handleGenerate}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                    >
                      Yes, Generate Fixture
                    </button>
                    <button 
                      onClick={() => setShowChecklist(false)}
                      className="px-6 py-3 bg-white text-orange-700 border border-orange-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-100 transition-all"
                    >
                      Cancel / Edit
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowChecklist(true)}
                  className="w-full py-5 bg-pink-600 text-white rounded-2xl font-black text-base uppercase tracking-wider hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-pink-500/15 flex items-center justify-center gap-3"
                >
                  <Trophy size={20} />
                  <span>Ask and Generate Bracket</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Printable Generation Result View */
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-lg space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 border-2 border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">CBSE Fixture Bracket Generated</h4>
                  <p className="text-xs text-slate-400 font-bold">Successfully populated byes & configured match timings.</p>
                </div>
              </div>

              <button 
                onClick={() => setHasConfirmed(false)}
                className="px-5 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 self-start lg:self-auto shrink-0"
              >
                <RefreshCw size={14} />
                <span>Change Settings</span>
              </button>
            </div>

            {/* 🖨️ Elite PDF Page Sizing & Scale Control Board */}
            <div className="bg-gradient-to-br from-indigo-50/40 via-white to-pink-50/20 p-6 rounded-[2.2rem] border border-indigo-100 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-50">
                <div>
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block flex items-center gap-1.5">
                    <Sparkles size={12} className="text-indigo-500 animate-pulse" />
                    <span>Print Pagination & Fitting Controls</span>
                  </span>
                  <p className="text-xs text-slate-500 font-bold mt-1">Adjust size & scale below to fit your tournament brackets onto a single page (A4/A3) perfectly.</p>
                </div>
                <div className="flex items-center gap-1 bg-indigo-50/70 p-1 rounded-xl text-[10px] font-black text-indigo-900 border border-indigo-100/50">
                  <span className="px-2">Active Format:</span>
                  <span className="px-2 py-0.5 bg-white rounded-md shadow-xs text-rose-600 font-extrabold uppercase">{printPageSize} {printOrientation}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Paper Size & Orientation */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">1. Target Document Dimensions</label>
                  <div className="space-y-2">
                    <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setPrintPageSize('A4');
                          const opt = getOptimalPrintScale(teamsList.length, 'A4', printOrientation);
                          setPrintScale(opt);
                        }}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-md transition-all ${printPageSize === 'A4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
                      >
                        A4 Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPrintPageSize('A3');
                          const opt = getOptimalPrintScale(teamsList.length, 'A3', printOrientation);
                          setPrintScale(opt);
                        }}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-md transition-all ${printPageSize === 'A3' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
                      >
                        A3 Premium
                      </button>
                    </div>

                    <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setPrintOrientation('portrait');
                          const opt = getOptimalPrintScale(teamsList.length, printPageSize, 'portrait');
                          setPrintScale(opt);
                        }}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-md transition-all ${printOrientation === 'portrait' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
                      >
                        Portrait
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPrintOrientation('landscape');
                          const opt = getOptimalPrintScale(teamsList.length, printPageSize, 'landscape');
                          setPrintScale(opt);
                        }}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-md transition-all ${printOrientation === 'landscape' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
                      >
                        Landscape ★
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Scale custom slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">2. Zoom / Sizing Scale</label>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100">{printScale}%</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="30"
                        max="125"
                        value={printScale}
                        onChange={(e) => setPrintScale(Number(e.target.value))}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <button 
                        type="button"
                        onClick={() => setPrintScale(Math.max(30, printScale - 5))}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 active:scale-95 transition-transform"
                      >
                        -5%
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyAutoFit}
                        className="text-[11px] font-black text-indigo-750 hover:underline flex items-center gap-1"
                      >
                        <Sparkles size={10} className="text-indigo-500" />
                        <span>Reset Auto-Fit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintScale(Math.min(125, printScale + 5))}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 active:scale-95 transition-transform"
                      >
                        +5%
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Elements toggles */}
                <div className="space-y-3 lg:col-span-2">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">3. Toggle Printable Panels (To Save Vertical Space)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setHideFormulaBoardInPrint(!hideFormulaBoardInPrint)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-extrabold transition-all flex flex-col justify-between h-20 ${hideFormulaBoardInPrint ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                    >
                      <span className="leading-tight">CBSE PE Formula Block</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600/90">{hideFormulaBoardInPrint ? '❌ Hidden from print' : '✅ Will print'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHideRosterInPrint(!hideRosterInPrint)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-extrabold transition-all flex flex-col justify-between h-20 ${hideRosterInPrint ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                    >
                      <span className="leading-tight">Registered Roster List</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600/90">{hideRosterInPrint ? '❌ Hidden' : '✅ Will print'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHideRulesFooterInPrint(!hideRulesFooterInPrint)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-extrabold transition-all flex flex-col justify-between h-20 ${hideRulesFooterInPrint ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'}`}
                    >
                      <span className="leading-tight">Directives & Signatures</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600/90">{hideRulesFooterInPrint ? '❌ Hidden' : '✅ Will print'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Tools Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* PDF & Printer Direct Options */}
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block">PDF & Print Actions</span>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Print directly using those pagination styles, or open a style-pure pop-up window if sandbox constraints block dialogs.</p>
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={handleTriggerPrint}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-100/50"
                  >
                    <Printer size={14} />
                    <span>Print / Export PDF Now</span>
                  </button>
                  <button 
                    type="button"
                    onClick={handleOpenPrintWindow}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ExternalLink size={14} />
                    <span>Open Printable Tab</span>
                  </button>
                </div>
              </div>

              {/* Word Document Export */}
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Microsoft Word Export</span>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Download a fully formatted DOC file with automatic tables mapping all registered seeds, bye indices, and round timings.</p>
                <div className="pt-2">
                  <button 
                    onClick={handleExportToWord}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileText size={14} />
                    <span>Export to Word Document</span>
                  </button>
                </div>
              </div>

              {/* Instant Social Sharing */}
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Instant Sharing Hub</span>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Broadcast the generated matches directly onto WhatsApp or copy a text-formatted fixture summary containing clear metrics.</p>
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={handleShareWhatsApp}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Share2 size={14} />
                    <span>Share on WhatsApp</span>
                  </button>
                  <button 
                    onClick={handleCopySummaryText}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {copiedText ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Roster Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Text Summary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Interactive Preview for the sharing text */}
            <div className="bg-blue-50/40 p-5 rounded-3xl border border-blue-100/50 text-[11px] text-blue-900/80 space-y-2">
              <span className="font-extrabold uppercase tracking-widest text-[9px] text-blue-800 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>Organizer Tip: Formatted WhatsApp Text Outline</span>
              </span>
              <p className="font-medium">When you use WhatsApp Share or Clipboard Copy, we convert your fixtures timeline into beautiful bullet points with bold metrics, division tags, and computed byes so parents and students can read easily.</p>
            </div>
          </div>

          {/* Interactive Bracket Visual / Print Preview (Matches the user's PDF exact formatting!) */}
          <div 
            ref={printAreaRef}
            className="print-bracket-canvas bg-white p-8 md:p-12 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-5xl print:max-w-none print:w-full mx-auto space-y-10 print:border-0 print:p-0 print:shadow-none"
          >
            {/* PDF Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-slate-900 pb-8 gap-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-slate-900 rounded-3xl text-white flex items-center justify-center border-2 border-slate-900 flex-shrink-0 animate-pulse print:bg-black">
                  <Trophy size={36} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 uppercase tracking-tighter leading-none">{tournamentName}</h1>
                  <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mt-2">{subTitle}</p>
                </div>
              </div>

              <div className="text-left md:text-right flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto border-t md:border-t-0 md:pt-0 pt-4 border-dashed border-slate-200">
                <span className="text-4xl font-black text-slate-950 block tracking-tighter">{category}</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">
                  {new Date(startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
                </span>
              </div>
            </div>

            {/* CBSE PE Draw Mechanics & Systematic Calculations (Subject Matter Expert Board) */}
            <div className={`print-hide-formula bg-slate-50 border-2 border-slate-900 rounded-[2rem] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-900 text-xs shadow-md animate-in slide-in-from-bottom duration-300 transition-all ${hideFormulaBoardInPrint ? 'opacity-35 line-through border-slate-200 select-none bg-slate-50/50' : ''}`}>
              <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                <h5 className="font-black text-[10px] uppercase tracking-wider text-pink-600 flex items-center gap-1">
                  <Shield size={12} />
                  <span>Formulae & Core Bounds</span>
                </h5>
                <ul className="space-y-1 font-bold">
                  <li className="flex justify-between">
                    <span>Teams Count (N):</span> 
                    <span className="font-extrabold">{teamsList.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Next Power of 2 (P):</span> 
                    <span className="font-extrabold">{Math.pow(2, Math.ceil(Math.log2(teamsList.length)))}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Total Byes (P - N):</span> 
                    <span className="font-extrabold text-pink-600">{Math.pow(2, Math.ceil(Math.log2(teamsList.length))) - teamsList.length}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                <h5 className="font-black text-[10px] uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <Users size={12} />
                  <span>Upper Half Draw</span>
                </h5>
                <ul className="space-y-1 font-bold">
                  <li className="flex justify-between">
                    <span>Teams (N<sub>u</sub>):</span> 
                    <span className="font-extrabold">{teamsList.length % 2 === 0 ? teamsList.length / 2 : (teamsList.length + 1) / 2}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Byes (B<sub>u</sub>):</span> 
                    <span className="font-extrabold">
                      {Math.floor((Math.pow(2, Math.ceil(Math.log2(teamsList.length))) - teamsList.length) / 2)}
                    </span>
                  </li>
                </ul>
                <div className="bg-white/70 p-2 rounded-xl text-[10px] font-semibold text-slate-500 border border-slate-100 max-h-16 overflow-y-auto">
                  <span className="font-bold text-slate-800">Recipients:</span>{' '}
                  {(() => {
                    const setup = calculateCBNKSetup(teamsList);
                    const list = teamsList.filter((_, idx) => idx < setup.Nu && setup.byeIndices.has(idx));
                    return list.length > 0 ? list.join(', ') : 'None';
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-black text-[10px] uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <Trophy size={11} />
                  <span>Lower Half Draw</span>
                </h5>
                <ul className="space-y-1 font-bold">
                  <li className="flex justify-between">
                    <span>Teams (N<sub>l</sub>):</span> 
                    <span className="font-extrabold">{teamsList.length % 2 === 0 ? teamsList.length / 2 : (teamsList.length - 1) / 2}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Byes (B<sub>l</sub>):</span> 
                    <span className="font-extrabold">
                      {Math.ceil((Math.pow(2, Math.ceil(Math.log2(teamsList.length))) - teamsList.length) / 2)}
                    </span>
                  </li>
                </ul>
                <div className="bg-white/70 p-2 rounded-xl text-[10px] font-semibold text-slate-500 border border-slate-100 max-h-16 overflow-y-auto">
                  <span className="font-bold text-slate-800">Recipients:</span>{' '}
                  {(() => {
                    const setup = calculateCBNKSetup(teamsList);
                    const list = teamsList.filter((_, idx) => idx >= setup.Nu && setup.byeIndices.has(idx));
                    return list.length > 0 ? list.join(', ') : 'None';
                  })()}
                </div>
              </div>
            </div>

            {/* Core Bracket Layout Renders columns per Round */}
            <div 
              className="grid grid-cols-1 md:flex md:flex-row md:justify-between items-stretch gap-x-12 relative md:space-y-0 space-y-8 overflow-x-auto select-none py-4 h-auto md:h-[var(--bracket-height)] print:flex print:flex-row print:justify-between print:gap-x-2.5 print:space-y-0 print:p-0 print:m-0 print:w-full print:overflow-visible"
              style={{ '--bracket-height': `${bracketHeight}px` } as React.CSSProperties}
            >
              {/* Column 0: Registered Teams List with strict CBSE structural groupings */}
              <div className={`print-hide-roster space-y-6 print:space-y-2.5 flex-1 min-w-[220px] print:min-w-[125px] print:max-w-[155px] flex flex-col h-full border-r-2 border-slate-900 border-dashed pr-6 print:pr-2.5 print:mr-1 transition-all ${hideRosterInPrint ? 'opacity-35 line-through border-slate-100 select-none' : ''}`}>
                <div className="border-b-2 border-slate-900 pb-2 text-center flex-shrink-0">
                  <h5 className="font-black text-xs uppercase tracking-widest text-slate-400">Roster</h5>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">Teams List</h4>
                </div>
                
                <div className="flex-1 flex flex-col justify-around relative">
                  {(() => {
                    const setup = calculateCBNKSetup(teamsList);
                    return teamsList.map((teamName, idx) => {
                      const isUpper = idx < setup.Nu;
                      const isBye = setup.byeIndices.has(idx);
                      
                      return (
                        <React.Fragment key={idx}>
                          <div className="relative flex items-center w-full my-1">
                            <div className={`w-1.5 h-12 rounded-full mr-2 flex-shrink-0 ${isUpper ? 'bg-pink-500' : 'bg-indigo-500'}`} />
                            
                            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 print:p-1.5 print:rounded-lg shadow-xs flex flex-col justify-center gap-1 print:gap-0">
                              <div className="flex justify-between items-center print:hidden">
                                <span className="text-[9px] font-black text-slate-400">Team {idx + 1}</span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isUpper ? 'text-pink-600 bg-pink-50' : 'text-indigo-600 bg-indigo-50'}`}>
                                  {isUpper ? 'Upper Half' : 'Lower Half'}
                                </span>
                              </div>
                              
                              <div className="text-xs font-black text-slate-900 truncate max-w-[170px] print:max-w-[110px] print:text-[10px]" title={teamName}>
                                {teamName}
                              </div>
                              
                              <div className="flex justify-between items-center mt-0.5">
                                {isBye ? (
                                  <span className="text-[9px] print:text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1 leading-none">
                                    <Sparkles size={10} className="text-emerald-500" />
                                    <span>BYE</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] print:text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg leading-none">
                                    Round 1
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Connection line straight to Round 1 */}
                            <div className="hidden md:flex print:flex absolute left-full top-1/2 -translate-y-1/2 items-center pointer-events-none z-0">
                              <div className="h-[2px] bg-slate-900" style={{ width: 'var(--conn-width, 24px)' }}></div>
                            </div>
                          </div>

                          {/* Boundary indicator */}
                          {idx === setup.Nu - 1 && (
                            <div className="w-full flex items-center justify-center py-1 my-1 relative">
                              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t-2 border-dashed border-slate-900" />
                              </div>
                              <div className="relative flex justify-center">
                                <span className="px-3 bg-slate-100 text-slate-800 text-[8px] font-black uppercase tracking-widest rounded-full py-0.5 whitespace-nowrap border border-slate-300">
                                  UPPER HALF / LOWER HALF DIVIDER
                                </span>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>
              </div>

              {generatedRounds.map((roundStrObj: any, rIdx: number) => {
                const totalMatchesInRound = roundStrObj.matches.length;
                return (
                  <div key={rIdx} className="space-y-6 print:space-y-2.5 flex-1 min-w-[210px] print:min-w-[120px] print:max-w-[145px] flex flex-col h-full">
                    {/* Round Header */}
                    <div className="border-b-2 border-slate-900 pb-2 text-center flex-shrink-0">
                      <h5 className="font-black text-xs uppercase tracking-widest text-slate-400">Round {rIdx + 1}</h5>
                      <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">{roundStrObj.name}</h4>
                    </div>

                    {/* Matches list for this Round */}
                    <div className="flex-1 flex flex-col justify-around relative">
                      {roundStrObj.matches.map((match: Match, mIdx: number) => {
                        const hasNextRound = rIdx < generatedRounds.length - 1;
                        const isEven = mIdx % 2 === 0;
                        const hasSibling = isEven ? (mIdx + 1 < totalMatchesInRound) : (mIdx - 1 >= 0);
                        
                        // Vertical distance matches height distribution for meeting at the midpoint exactly
                        const verticalDistance = bracketHeight / (totalMatchesInRound * 2);
                        const isBoundary = mIdx === Math.ceil(totalMatchesInRound / 2) - 1;

                        return (
                          <React.Fragment key={match.id}>
                            <div className="relative flex items-center w-full my-2">
                              {match.isBye ? (
                                <div className="bg-pink-50/20 border-2 border-dashed border-pink-300 p-4 print:p-2 rounded-xl print:rounded-lg flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-xs animate-in fade-in w-full relative z-10 print:border-pink-500">
                                  <div className="flex justify-between items-center pb-2 border-b border-pink-100/50 mb-2">
                                    <span className="text-[10px] print:text-[8px] font-black text-pink-700 uppercase tracking-widest">BYE Assignment</span>
                                    <span className="text-[9px] print:text-[8px] font-black text-pink-500 bg-pink-100/50 px-2.5 py-0.5 rounded-full print:bg-slate-100">
                                      ADVANCED
                                    </span>
                                  </div>

                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between font-black text-slate-900">
                                      <span className="truncate max-w-[170px] print:max-w-[105px] print:text-[10px]">{match.team1}</span>
                                    </div>
                                    <div className="py-1 flex items-center justify-center">
                                      <div className="text-[9px] print:text-[8px] font-black text-pink-600 bg-pink-50 border border-pink-100/70 py-1 px-3 print:py-0.5 print:px-2 rounded-lg uppercase tracking-widest text-center flex items-center gap-1 whitespace-nowrap">
                                        <Sparkles size={10} className="text-pink-500" />
                                        <span>First Round BYE</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2.5 pt-2 border-t border-pink-100/40 flex justify-between text-[8px] print:text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Venue: Exempt</span>
                                    <span>{match.date}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-slate-50 border-2 border-slate-900 p-4 print:p-2 rounded-xl print:rounded-lg flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm animate-in fade-in w-full relative z-10 print:bg-white">
                                  <div className="flex justify-between items-center pb-2 border-b border-slate-150 mb-2">
                                    <span className="text-[10px] print:text-[8px] font-black text-pink-600 uppercase tracking-widest">{match.name}</span>
                                    <span className="text-[10px] print:text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <Clock size={10} />
                                      {match.time}
                                    </span>
                                  </div>

                                  <div className="space-y-1.5 text-xs text-slate-800">
                                    <div className="flex items-center justify-between font-black">
                                      <span className="truncate max-w-[150px] print:max-w-[105px] print:text-[10px]">{match.team1}</span>
                                    </div>
                                    <div className="text-[9px] print:text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center">v/s</div>
                                    <div className="flex items-center justify-between font-black">
                                      <span className="truncate max-w-[150px] print:max-w-[105px] print:text-[10px]">{match.team2}</span>
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[8px] print:text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Match Venue: Arena A</span>
                                    <span>{match.date}</span>
                                  </div>
                                </div>
                              )}

                              {/* Connection Lines (Desktop & Print Only) */}
                              {hasNextRound && (
                                <div className="hidden md:flex print:flex absolute left-full top-1/2 -translate-y-1/2 items-center pointer-events-none z-0">
                                  {/* Left horizontal spur leaving the card */}
                                  <div className="h-[2px] bg-slate-900" style={{ width: 'var(--conn-width, 24px)' }}></div>

                                  {hasSibling ? (
                                    isEven ? (
                                      /* Downward connection line for upper member of pair */
                                      <div 
                                        className="border-slate-900 border-l-2 absolute animate-in fade-in duration-300"
                                        style={{
                                          left: 'var(--conn-width, 24px)',
                                          top: '50%',
                                          width: 'var(--conn-width, 24px)',
                                          height: `${verticalDistance + 2}px`,
                                          borderBottomWidth: '2px', // Outgoing connector
                                        }}
                                      />
                                    ) : (
                                      /* Upward connection line for lower member of pair */
                                      <div 
                                        className="border-slate-900 border-l-2 absolute animate-in fade-in duration-300"
                                        style={{
                                          left: 'var(--conn-width, 24px)',
                                          bottom: '50%',
                                          width: 'var(--conn-width, 24px)',
                                          height: `${verticalDistance + 2}px`,
                                        }}
                                      />
                                    )
                                  ) : (
                                    /* No sibling in this round, project straight to next column center */
                                    <div className="h-[2px] bg-slate-900 absolute" style={{ width: 'var(--conn-width, 24px)', left: 'var(--conn-width, 24px)' }} />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Boundary Split Marker (Upper Half / Lower Half) */}
                            {isBoundary && totalMatchesInRound > 1 && (
                              <div className="w-full flex items-center justify-center py-2 my-2 relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                  <div className="w-full border-t-2 border-dashed border-slate-900" />
                                </div>
                                <div className="relative flex justify-center">
                                  <span className="px-3 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full py-0.5 whitespace-nowrap">
                                    Upper / Lower Half Split
                                  </span>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Third-Place & Runner-Up Footer section styled beautifully inside a bordered box like the PDF */}
            {thirdPlaceMatch && (
              <div className="bg-pink-50 border-4 border-slate-900 rounded-[2rem] p-6 max-w-xl mx-auto shadow-md text-center space-y-4 print:bg-white animate-in zoom-in-95">
                <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span className="text-[10px] font-black text-pink-700 uppercase tracking-widest">{thirdPlaceMatch.name}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">3rd Place Match (Second Runner-Up)</span>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} />
                    {thirdPlaceMatch.time}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 py-2">
                  <div className="text-center">
                    <span className="text-xs font-black text-slate-800 uppercase block">{thirdPlaceMatch.team1}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mt-1">(Semi Finals - I Loser)</span>
                  </div>
                  
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest select-none">Vs</span>
                  
                  <div className="text-center">
                    <span className="text-xs font-black text-slate-800 uppercase block">{thirdPlaceMatch.team2}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mt-1">(Semi Finals - II Loser)</span>
                  </div>
                </div>

                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100">
                  Play Date: {thirdPlaceMatch.date}
                </div>
              </div>
            )}

            {/* Custom school rules and signature note */}
            <div className={`print-hide-rules pt-8 border-t-2 border-dashed border-slate-200 flex flex-col md:flex-row justify-between text-slate-400 text-xs font-medium gap-4 transition-all ${hideRulesFooterInPrint ? 'opacity-35 line-through select-none' : ''}`}>
              <div className="space-y-1">
                <p className="font-extrabold uppercase text-[9px] tracking-widest text-slate-500">Official Tournament Directives</p>
                <p>1. Duration: {firstHalf} Mins + {halfTime} Mins Break + {secondHalf} Mins (Total: {firstHalf + secondHalf + halfTime} mins active cycle).</p>
                <p>2. Transition time between matches: {restGap} Mins interval allocation.</p>
              </div>
              <div className="text-left md:text-right space-y-2 md:self-end">
                <div className="w-32 border-b border-slate-900 md:ml-auto print:border-black"></div>
                <p className="font-black text-[9px] uppercase tracking-widest text-slate-500">Authorized Organizer Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentMaker;
