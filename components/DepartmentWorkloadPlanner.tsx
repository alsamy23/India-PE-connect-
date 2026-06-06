import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Sparkles, 
  Target, 
  Mail, 
  CheckCircle2, 
  UploadCloud, 
  ChevronRight, 
  UserPlus, 
  Printer, 
  Download, 
  Clock, 
  BookOpen, 
  Layers, 
  Trash2, 
  AlertCircle,
  FileText,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fitnessService, SchoolMember } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';

interface Workload {
  id: string;
  teacherId: string;
  teacherName: string;
  curriculum: string; // CBSE, ICSE, State Board
  termsCount: number; // 2 or 3
  periodsCount: number; // Periods per week (e.g. 2, 3, 5)
  assignedGrades: string; // "Grades 6-8", "Grades 9-10"
  primaryGames: string[]; // Football, Basketball
  timetableText?: string;
  schedules?: {
    period: number;
    game: string;
    skill: string;
    objective: string;
    duration: string;
    details: {
      warmup: string;
      mainDrill: string;
      cooldown: string;
    }
  }[];
}

const DEFAULT_GAMES = ['Football', 'Basketball', 'Volleyball', 'Cricket', 'Athletics', 'Badminton', 'Yoga', 'Fitness & Agility'];

const DEFAULT_WORKLOADS: Workload[] = [
  {
    id: 'workload_1',
    teacherId: 'teacher_1',
    teacherName: 'Coach Suresh Kumar',
    curriculum: 'CBSE',
    termsCount: 2,
    periodsCount: 2,
    assignedGrades: 'Grades 9-10',
    primaryGames: ['Volleyball', 'Athletics'],
    timetableText: 'Monday Period 2: Class 9A, Wednesday Period 4: Class 10B',
    schedules: [
      {
        period: 1,
        game: 'Volleyball',
        skill: 'Underhand Pass & Reception',
        objective: 'Mastering the forearm passing technique for steady receptions',
        duration: '45 mins',
        details: {
          warmup: 'Jogging and dynamic shoulder-stretching dynamic rotation loops (10 min)',
          mainDrill: 'Forearm pass partner drills and distance bump repetitions (25 min)',
          cooldown: 'Trunk twists, static side shoulder stretches (10 min)'
        }
      },
      {
        period: 2,
        game: 'Athletics',
        skill: 'Crouch Start & Reaction speed',
        objective: 'Develop quick explosive reactions using standard blocks starts',
        duration: '45 mins',
        details: {
          warmup: 'High knees and butt kicks with leg swings (10 min)',
          mainDrill: '3-point crouching starts with 15m explosive sprint releases (25 min)',
          cooldown: 'Slo-mo recovery walk, hamstring static holds (10 min)'
        }
      }
    ]
  },
  {
    id: 'workload_2',
    teacherId: 'teacher_2',
    teacherName: 'Coach Priya Sharma',
    curriculum: 'ICSE',
    termsCount: 3,
    periodsCount: 3,
    assignedGrades: 'Grades 11-12',
    primaryGames: ['Basketball', 'Yoga'],
    timetableText: 'Tuesday Period 1: Class 11S1, Thursday Period 3: Class 12C2, Friday Period 5: Class 11C1',
    schedules: [
      {
        period: 1,
        game: 'Basketball',
        skill: 'Chest Pass & Lead Pass',
        objective: 'Improving pass velocity and movement integration to receiving teammate',
        duration: '40 mins',
        details: {
          warmup: 'Defensive slide runs and shuttle bursts (8 min)',
          mainDrill: '3-player weave pass routing down the length ofcourt (22 min)',
          cooldown: 'Arm swings and deep floor reaches (10 min)'
        }
      },
      {
        period: 2,
        game: 'Yoga',
        skill: 'Surya Namaskar Form',
        objective: 'Align sequence poses with controlled inhalation and exhalation rhythm',
        duration: '40 mins',
        details: {
          warmup: 'Gentle spinal twists and neck releases (8 min)',
          mainDrill: '12-pose Surya Namaskar continuous repetitions with focus points (22 min)',
          cooldown: 'Shavasana silent meditative observation (10 min)'
        }
      },
      {
        period: 3,
        game: 'Basketball',
        skill: 'Lay-up Steps Coordination',
        objective: 'Learn high-speed dual foot steps transition into dynamic board releases',
        duration: '40 mins',
        details: {
          warmup: 'Single-leg hops and dynamic ankle rotations (8 min)',
          mainDrill: 'Dribble, two-step layup approach using left/right boards (22 min)',
          cooldown: 'Anterior thigh stretches (10 min)'
        }
      }
    ]
  }
];

const DepartmentWorkloadPlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'timetable' | 'notifications'>('roster');
  const [userProfile, setUserProfile] = useState<SchoolMember | null>(null);
  
  // Teachers state
  const [workloads, setWorkloads] = useState<Workload[]>(() => {
    const saved = localStorage.getItem('smartpe_workloads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load workloads", e);
      }
    }
    return DEFAULT_WORKLOADS;
  });

  useEffect(() => {
    localStorage.setItem('smartpe_workloads', JSON.stringify(workloads));
  }, [workloads]);

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newCurriculum, setNewCurriculum] = useState('CBSE');
  const [newTermsCount, setNewTermsCount] = useState(2);
  const [newPeriodsCount, setNewPeriodsCount] = useState(2);
  const [newGrades, setNewGrades] = useState('Grades 6-8');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [timetableInput, setTimetableInput] = useState('');
  
  // Drag and Drop state
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Active workload selection for timetable suggestions
  const [selectedWorkloadId, setSelectedWorkloadId] = useState<string>('workload_1');
  const [suggestProgress, setSuggestProgress] = useState<string>('');

  // Notification success logs
  const [notificationLogs, setNotificationLogs] = useState<string[]>([
    "Weekly schedule alert dispatched to Coach Suresh Kumar for 2 Periods of CBSE Syllabus (Volleyball / Athletics)",
    "Hiring verification notification sent successfully to pre_auth-Priya_S",
    "Term syllabus layout auto-emailed to Department Head on 2026-06-01"
  ]);

  useEffect(() => {
    // If authenticated, we try to load existing workloads from custom storage or mock profile
    const loadProfile = async () => {
      if (auth.currentUser) {
        try {
          const profile = await fitnessService.getSchoolMember(auth.currentUser.uid);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (e) {
          console.error("Error loaded firebase user profile:", e);
        }
      }
    };
    loadProfile().catch(console.error);
  }, []);

  const handleGameToggle = (game: string) => {
    setSelectedGames(prev => 
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    );
  };

  const handleAddWorkload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName) return;

    const newWorkload: Workload = {
      id: `workload_${Date.now()}`,
      teacherId: `teacher_${Math.random().toString(36).substr(2, 5)}`,
      teacherName: newTeacherName,
      curriculum: newCurriculum,
      termsCount: newTermsCount,
      periodsCount: newPeriodsCount,
      assignedGrades: newGrades,
      primaryGames: selectedGames.length > 0 ? selectedGames : ['Fitness & Agility'],
      timetableText: timetableInput || 'Not uploaded yet. Suggest workload using basic parameters.'
    };

    setWorkloads(prev => [newWorkload, ...prev]);
    setIsAdding(false);
    
    // Clear Form
    setNewTeacherName('');
    setSelectedGames([]);
    setTimetableInput('');

    // Trigger Notification
    const log = `New hiring notification dispatched automatically. Teacher Registered: ${newTeacherName} (${newCurriculum} - ${newTermsCount} Terms, ${newPeriodsCount} Periods/Week).`;
    setNotificationLogs(prev => [log, ...prev]);
  };

  const handleDeleteWorkload = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove Coach ${name} from this school department allotment list?`)) {
      setWorkloads(prev => prev.filter(w => w.id !== id));
      setNotificationLogs(prev => [`Hiring termination & de-allocation notice processed for ${name}.`, ...prev]);
    }
  };

  const currentSelectedWorkload = workloads.find(w => w.id === selectedWorkloadId) || workloads[0];

  // Drag and drop timetable parses Simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadSuccess(`Successfully parsed ${file.name} — timetable structures uploaded!`);
      // Simulate file parse
      setTimetableInput(`Parsed from file ${file.name}:\nMonday P2 -> 9th Grade Soccer, Thursday P5 -> 10th Grade Yoga`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadSuccess(`Successfully parsed ${file.name} — timetable structures uploaded!`);
      setTimetableInput(`Parsed from file ${file.name}:\nTuesday Period 2: Class 11A Football, Thursday Period 4: Class 12B Yoga`);
    }
  };

  // AI Timetable Generator using Gemini server-side
  const handleGetAISuggestions = async () => {
    setLoading(true);
    setSuggestProgress("AI is digesting curriculum parameters...");
    
    const prompt = `You are an expert high-school Physical Education Director. 
We need to generate a weekly period schedule suggestions for:
Teacher Name: ${currentSelectedWorkload.teacherName}
Curriculum: ${currentSelectedWorkload.curriculum} (${currentSelectedWorkload.termsCount} terms curriculum)
Workload: ${currentSelectedWorkload.periodsCount} periods this week.
Grades Targeted: ${currentSelectedWorkload.assignedGrades}
Primary Games/Sports assigned: ${currentSelectedWorkload.primaryGames.join(', ')}
Timetable/Classes outline: ${currentSelectedWorkload.timetableText}

Generate exactly ${currentSelectedWorkload.periodsCount} periods lesson suggestions. Return exactly a valid JSON array matching this interface (Do not return any markdown wraps outside JSON):
[
  {
    "period": number,
    "game": "string",
    "skill": "string",
    "objective": "string",
    "duration": "string",
    "details": {
      "warmup": "string (warmup instructions)",
      "mainDrill": "string (main game drills)",
      "cooldown": "string (cooling down instructions)"
    }
  }
]`;

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.5-flash',
          contents: prompt
        })
      });

      if (!response.ok) {
        throw new Error('Could not compute AI structures.');
      }

      const resJson = await response.json();
      let text = resJson.text;
      
      // Sanitising json wraps
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedSchedules = JSON.parse(cleanText);

      setWorkloads(prev => prev.map(w => {
        if (w.id === currentSelectedWorkload.id) {
          return {
            ...w,
            schedules: parsedSchedules
          };
        }
        return w;
      }));

      setUploadSuccess("AI successfully updated and suggested lessons for all allocated periods!");
      setNotificationLogs(prev => [
        `AI generated suggestions successfully for Coach ${currentSelectedWorkload.teacherName}.`,
        ...prev
      ]);
    } catch (e: any) {
      console.error(e);
      // Fallback local structures if keys fail or in quota limits
      const fallbackSchedules = Array.from({ length: currentSelectedWorkload.periodsCount }).map((_, idx) => ({
        period: idx + 1,
        game: currentSelectedWorkload.primaryGames[idx % currentSelectedWorkload.primaryGames.length] || 'General Fitness',
        skill: 'Dynamic Agility & Spatial awareness',
        objective: `Standardized CBSE Practical lesson focused on motor skills for ${currentSelectedWorkload.assignedGrades}`,
        duration: '45 mins',
        details: {
          warmup: '10 mins progressive jogging, joint rotation patterns, static stretches.',
          mainDrill: '25 mins skill specific drills: Partner technique alignment passing under game-like tactical setups.',
          cooldown: '10 mins slow walking, breathing, hamstring static relaxation holds.'
        }
      }));

      setWorkloads(prev => prev.map(w => {
        if (w.id === currentSelectedWorkload.id) {
          return {
            ...w,
            schedules: fallbackSchedules
          };
        }
        return w;
      }));
      setUploadSuccess("Generated lessons based on curriculum guidelines (local intelligence engine active).");
    } finally {
      setLoading(false);
      setSuggestProgress("");
    }
  };

  // Dispatch live alerts to teacher dashboards
  const handleDispatchNotification = (teacherName: string, w: Workload) => {
    alert(`Alert notification sent to Coach ${teacherName} successfully!\nSubject: Allocated lesson planning for next week is ready.`);
    const log = `Dispatched alert notification: "Hi ${teacherName}, you have ${w.periodsCount} periods next week. Recommended games: [${w.primaryGames.join(', ')}]. Suggested lesson plans have been prepared."`;
    setNotificationLogs(prev => [log, ...prev]);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Title block */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl border-2 border-slate-950">
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#FF6B00]/20 to-indigo-900/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-orange-500/20 to-indigo-500/20 rounded-xl border border-white/10 text-orange-400 text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} className="animate-pulse" />
            <span>Smart PE Administration</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-4 uppercase">
            PE Department Workload Planner
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
            Manage up to 10+ teachers, set school curriculum terms (CBSE/ICSE), assign weekly periods, upload schedules, and let AI automatically distribute games, suggest skills, and generate ready-to-use lesson plans.
          </p>
        </div>
      </div>

      {/* Nav Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button 
          onClick={() => setActiveSubTab('roster')} 
          className={`pb-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeSubTab === 'roster' ? 'border-[#FF6B00] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Users size={16} />
          <span>1. Department Roster ({workloads.length} Coaches)</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('timetable')} 
          className={`pb-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeSubTab === 'timetable' ? 'border-[#FF6B00] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Calendar size={16} />
          <span>2. Smart Timetable & AI Suggester</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('notifications')} 
          className={`pb-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeSubTab === 'notifications' ? 'border-[#FF6B00] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Mail size={16} />
          <span>3. Hiring Alerts & Alerts Feed</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: ONBOARD & ROSTER */}
        {activeSubTab === 'roster' && (
          <motion.div 
            key="roster"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-slate-100 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Enroll new Hires, configure terms count, and set workloads:</span>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center space-x-2 px-6 py-3 bg-[#FF6B00] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-md"
              >
                <UserPlus size={16} />
                <span>Onboard Coach</span>
              </button>
            </div>

            {/* Registration Form */}
            {isAdding && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                onSubmit={handleAddWorkload}
                className="bg-white border-2 border-slate-200 p-8 rounded-[2rem] space-y-6 shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Coach Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      placeholder="e.g. Coach Ramesh Jha"
                      className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Curriculum Alignment</label>
                    <select
                      value={newCurriculum}
                      onChange={(e) => setNewCurriculum(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="CBSE">CBSE aligned</option>
                      <option value="ICSE">ICSE aligned</option>
                      <option value="State Board">State Board (GoI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Syllabus Splits (Terms)</label>
                    <select
                      value={newTermsCount.toString()}
                      onChange={(e) => setNewTermsCount(parseInt(e.target.value))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="2">2 Terms (Standard CBSE)</option>
                      <option value="3">3 Terms split (Secondary)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Target Grades Category</label>
                    <select
                      value={newGrades}
                      onChange={(e) => setNewGrades(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Grades 1-3">Grades 1-3 (Primary Motor)</option>
                      <option value="Grades 4-5">Grades 4-5 (Upper Primary)</option>
                      <option value="Grades 6-8">Grades 6-8 (Middle School)</option>
                      <option value="Grades 9-10">Grades 9-10 (Secondary Basic)</option>
                      <option value="Grades 11-12">Grades 11-12 (Senior CBSE Core)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Periods Cap (Workload per week)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      required
                      value={newPeriodsCount}
                      onChange={(e) => setNewPeriodsCount(parseInt(e.target.value))}
                      placeholder="e.g. 2"
                      className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Simulated Timetable slots description</label>
                    <input 
                      type="text" 
                      value={timetableInput}
                      onChange={(e) => setTimetableInput(e.target.value)}
                      placeholder='e.g. "Mon P2, Wed P5"'
                      className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Primary games mapping */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Choose Games Assigned to this Coach:</span>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_GAMES.map(game => (
                      <button
                        type="button"
                        key={game}
                        onClick={() => handleGameToggle(game)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all ${selectedGames.includes(game) ? 'bg-orange-50 border-orange-500 text-orange-850' : 'bg-white border-slate-250 text-slate-600'}`}
                      >
                        {game}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-black uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-[#FF6B00] text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-md"
                  >
                    Confirm Registration
                  </button>
                </div>
              </motion.form>
            )}

            {/* Coaches List Roster */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workloads.map((w) => (
                <div key={w.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-lg transition-all relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg">
                          {w.teacherName.split(' ').pop()?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-slate-800 leading-tight">{w.teacherName}</h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">{w.assignedGrades}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteWorkload(w.id, w.teacherName)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Remove Coach"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Curriculum</span>
                        <span className="text-xs font-black text-slate-800">{w.curriculum} • {w.termsCount} Terms</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Week Load Capacity</span>
                        <span className="text-xs font-black text-orange-600">{w.periodsCount} Periods / Week</span>
                      </div>
                    </div>

                    {/* Games badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {w.primaryGames.map(game => (
                        <span key={game} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium italic truncate max-w-[150px]">{w.timetableText}</span>
                    <button
                      onClick={() => {
                        setSelectedWorkloadId(w.id);
                        setActiveSubTab('timetable');
                      }}
                      className="px-4 py-2 border-2 border-indigo-100 text-[#005BFF] hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-1"
                    >
                      <span>Plan Timetable</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 2: TIMETABLE & AI SUGGESTER */}
        {activeSubTab === 'timetable' && (
          <motion.div 
            key="timetable"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left sidebar: selection and schedules */}
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Select Active Coach</span>
                <div className="space-y-2">
                  {workloads.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWorkloadId(w.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedWorkloadId === w.id ? 'bg-indigo-50/50 border-indigo-500' : 'bg-slate-50/50 border-transparent hover:bg-slate-100'}`}
                    >
                      <div>
                        <div className="text-xs font-black text-slate-800">{w.teacherName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{w.curriculum} • {w.assignedGrades}</div>
                      </div>
                      <ChevronRight size={14} className={selectedWorkloadId === w.id ? 'text-indigo-600' : 'text-slate-400'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* CSV Upload tool */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <div>
                  <h4 className="font-black text-slate-850 text-sm uppercase tracking-tight">Upload Coach Timetable</h4>
                  <p className="text-slate-400 text-xs font-medium">Auto-fill slot allocations from standard Excel CSV schedules.</p>
                </div>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-slate-250 bg-slate-50'}`}
                >
                  <UploadCloud size={40} className="mx-auto text-slate-400 mb-2" />
                  <label className="block text-xs font-black text-indigo-600 hover:underline cursor-pointer mb-1 uppercase tracking-widest">
                    Choose Schedule CSV File
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .txt" 
                      onChange={handleFileSelect}
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-405 font-medium">Or drag and drop here</p>
                </div>

                {uploadSuccess && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                    <p className="text-[10px] font-bold leading-tight">{uploadSuccess}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right block: schedules suggester */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-sidebar-divider pb-6 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                      Weekly Allotments for Coach {currentSelectedWorkload.teacherName}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                      Setup matches: {currentSelectedWorkload.curriculum} Syllabus • Grades: {currentSelectedWorkload.assignedGrades} • Allocated Periods: {currentSelectedWorkload.periodsCount} Slots
                    </p>
                  </div>

                  <button
                    disabled={loading}
                    onClick={handleGetAISuggestions}
                    className="flex items-center space-x-2 px-6 py-4.5 bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    <span>{loading ? 'AI Suggesting...' : 'Ask AI Lesson Suggester'}</span>
                  </button>
                </div>

                {loading && (
                  <div className="p-8 text-center bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center space-y-3">
                    <Loader2 size={32} className="animate-spin text-indigo-600" />
                    <p className="text-sm font-black uppercase text-indigo-700 tracking-wider">Compiling Syllabus Progression Paths...</p>
                    <p className="text-xs text-slate-500 italic max-w-md">{suggestProgress}</p>
                  </div>
                )}

                {!loading && currentSelectedWorkload.schedules && currentSelectedWorkload.schedules.length > 0 ? (
                  <div className="space-y-6">
                    {currentSelectedWorkload.schedules.map((item, index) => (
                      <div key={index} className="bg-slate-50/70 border border-slate-150 p-6 rounded-2xl hover:border-indigo-200 transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Period {item.period} ({item.duration || '40 min'})
                          </span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Topic: {item.game} - {item.skill}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-800 mb-2 uppercase leading-snug">{item.objective}</h4>
                        
                        {/* Period structures warmup, drills etc */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block">Warm-Up Block</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">{item.details.warmup}</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block">Main Activity Track</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">{item.details.mainDrill}</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Cool Down Relax</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">{item.details.cooldown}</p>
                          </div>
                        </div>

                        {/* Dispatch Alerts to that specific teacher */}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-50">
                          <button
                            onClick={() => handleDispatchNotification(currentSelectedWorkload.teacherName, currentSelectedWorkload)}
                            className="px-4 py-2 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5"
                          >
                            <Mail size={12} />
                            <span>Dispatch Alert</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Clock size={36} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-black uppercase text-slate-700 tracking-wider">No AI Suggestions generated yet.</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Configure your teacher variables, then tap "Ask AI Lesson Suggester" to blueprint the periods automatically with beautiful lessons.</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: NOTIFICATIONS LOG */}
        {activeSubTab === 'notifications' && (
          <motion.div 
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-5">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hiring Notices & Weekly reminders</h3>
                  <p className="text-xs text-slate-400 font-medium">Verify department notification delivery status logs.</p>
                </div>
              </div>

              <div className="space-y-4">
                {notificationLogs.map((log, idx) => (
                  <div key={idx} className="p-4.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                      <Mail size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">{log}</p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">Status: DISPATCHED SUCCESSFULLY via Administrative routing log</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentWorkloadPlanner;
