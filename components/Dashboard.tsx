
import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Video, 
  Calendar,
  ChevronRight,
  Trophy,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  Clock,
  Trash2,
  Download,
  BookOpen,
  Target,
  Wrench,
  Book,
  Activity,
  Loader2,
  RotateCcw,
  Microscope,
  Dumbbell,
  ClipboardList,
  ShieldCheck,
  Mail,
  Zap,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar } from 'recharts';
import { storageService, SavedItem } from '../services/storageService.ts';
import Logo from './Logo.tsx';
import { WeeklyCalendarView } from './WeeklyCalendarView.tsx';

const data = [
  { name: 'Mon', connections: 4 },
  { name: 'Tue', connections: 7 },
  { name: 'Wed', connections: 5 },
  { name: 'Thu', connections: 12 },
  { name: 'Fri', connections: 8 },
  { name: 'Sat', connections: 15 },
  { name: 'Sun', connections: 10 },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    }
  }
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 100, 
      damping: 15 
    } 
  }
} as const;

const classProgressData = {
  '8-A': [
    { checkpoint: 'Baseline (July)', speed: 9.8, flexibility: 14.5, endurance: 185 },
    { checkpoint: 'Midline (Nov)', speed: 9.2, flexibility: 16.8, endurance: 165 },
    { checkpoint: 'Year-End (Mar)', speed: 8.5, flexibility: 19.2, endurance: 148 },
  ],
  '7-C': [
    { checkpoint: 'Baseline (July)', speed: 10.4, flexibility: 12.0, endurance: 205 },
    { checkpoint: 'Midline (Nov)', speed: 9.9, flexibility: 14.2, endurance: 182 },
    { checkpoint: 'Year-End (Mar)', speed: 9.1, flexibility: 17.5, endurance: 162 },
  ],
  '9-B': [
    { checkpoint: 'Baseline (July)', speed: 8.9, flexibility: 16.0, endurance: 155 },
    { checkpoint: 'Midline (Nov)', speed: 8.4, flexibility: 18.5, endurance: 140 },
    { checkpoint: 'Year-End (Mar)', speed: 7.9, flexibility: 21.0, endurance: 125 },
  ],
};

const cbseNepStrands = [
  { id: 'S1', name: 'Strand 1: Games & Sports', desc: 'Athletics, team sports, and adventure play.' },
  { id: 'S2', name: 'Strand 2: Health & Fitness', desc: 'Yoga, nutrition, physical literacy checklists, and health checkups.' },
  { id: 'S3', name: 'Strand 3: SEWA', desc: 'Social empowerment, student leadership, hygiene campaigns, and first-aid.' },
  { id: 'S4', name: 'Strand 4: Health Card', desc: 'Ongoing diagnostic health cards and BMI fitness audits.' }
];

const curriculumUnits = [
  {
    id: 'U1',
    term: 1,
    title: 'Athletics & Fundamental Movement Skills',
    strandId: 'S1',
    strandName: 'Games & Sports (Strand 1)',
    description: 'Master sprint block starts, running mechanics, jumping, throwing, and continuous pacing.',
    targetLessons: 4,
    keywords: ['sprint', 'run', 'athletics', 'jump', 'throw', 'speed', 'start', 'relay', 'pacing', 'track', 'field'],
    timeline: 'April - June'
  },
  {
    id: 'U2',
    term: 1,
    title: 'Ball Handling & Sports Mechanics (Football / Basketball)',
    strandId: 'S1',
    strandName: 'Games & Sports (Strand 1)',
    description: 'Drills for ball control, passing, dribbling technique, coordination, and defensive stance.',
    targetLessons: 4,
    keywords: ['football', 'basketball', 'dribble', 'pass', 'layup', 'soccer', 'shooting', 'ball', 'defense', 'handling'],
    timeline: 'July - August'
  },
  {
    id: 'U3',
    term: 1,
    title: 'Nutritional Hygiene & Injury Response First Aid',
    strandId: 'S2',
    strandName: 'Health & Fitness (Strand 2)',
    description: 'Basics of balanced diets, macro/micro nutrients, safe sports warm-ups, and treating minor sprains.',
    targetLessons: 3,
    keywords: ['nutrition', 'diet', 'food', 'sprain', 'injury', 'first aid', 'warm-up', 'hydration', 'hygiene', 'safety'],
    timeline: 'September'
  },
  {
    id: 'U4',
    term: 2,
    title: 'Yoga Asanas & Postural Corrections',
    strandId: 'S2',
    strandName: 'Health & Fitness (Strand 2)',
    description: 'Flexibility development through Surya Namaskar, core strengthening asanas, and correcting slouching postures.',
    targetLessons: 4,
    keywords: ['yoga', 'asana', 'surya', 'stretch', 'posture', 'flexibility', 'slouch', 'breathing', 'pranayama'],
    timeline: 'October - December'
  },
  {
    id: 'U5',
    term: 2,
    title: 'Advanced Team Strategy & Intra-mural Rules',
    strandId: 'S3',
    strandName: 'SEWA (Strand 3)',
    description: 'Offensive and defensive formations, understanding referee hand gestures, and organizing fair-play games.',
    targetLessons: 4,
    keywords: ['referee', 'tactics', 'strategy', 'defense', 'offense', 'formation', 'rules', 'tournament', 'umpire', 'leadership'],
    timeline: 'January'
  },
  {
    id: 'U6',
    term: 2,
    title: 'SEWA Projects & Individual Health Cards',
    strandId: 'S4',
    strandName: 'Health Card (Strand 4)',
    description: 'Completing individual physical literacy profiles, BMI mapping, and conducting physical fitness audits.',
    targetLessons: 3,
    keywords: ['sewa', 'health card', 'profile', 'bmi', 'audit', 'leadership', 'report', 'card', 'scoring', 'record', 'sheet'],
    timeline: 'February - March'
  }
];

const Dashboard: React.FC<{ 
  apiStatus?: 'checking' | 'ok' | 'missing' | 'quota',
  debugInfo?: any,
  onTestConnection?: () => Promise<void>,
  isTesting?: boolean,
  onNavigate?: (tab: any) => void
}> = ({ apiStatus, debugInfo, onTestConnection, isTesting, onNavigate }) => {
  const [history, setHistory] = React.useState<SavedItem[]>([]);
  
  // Interactive Dashboard States
  const [selectedClassProgress, setSelectedClassProgress] = React.useState<'8-A' | '7-C' | '9-B'>('8-A');
  const [selectedMetricType, setSelectedMetricType] = React.useState<'fitness' | 'skills' | 'interventions'>('fitness');
  const [downloadStatus, setDownloadStatus] = React.useState<string | null>(null);
  const [activeDeptTab, setActiveDeptTab] = React.useState<'metrics' | 'inventory' | 'substitutions' | 'house-points'>('metrics');
  const [housePoints, setHousePoints] = React.useState({ Agni: 420, Jal: 380, Prithvi: 450, Vayu: 410 });
  const [sampleOutputTab, setSampleOutputTab] = React.useState<'lesson' | 'rubric' | 'report'>('lesson');

  // Curriculum & Strand Overview States
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = React.useState(false);
  const [selectedCurriculumTerm, setSelectedCurriculumTerm] = React.useState<'all' | '1' | '2'>('all');
  const [selectedCurriculumClass, setSelectedCurriculumClass] = React.useState<string>('Grade 8');

  // Populate realistic CBSE lesson plans to demonstrate full strand progress tracking instantly
  const handleSimulateSyllabus = () => {
    const demoItems = [
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 Athletics - 100m Sprint Block Start & Acceleration mechanics',
        content: { sport: 'Athletics', topic: 'Sprint Block Starts', grade: '8' },
        metadata: { strand: 'Strand 1' }
      },
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 Athletics - Long Jump Takeoff Technique & Landing safety',
        content: { sport: 'Athletics', topic: 'Long Jump Mechanics', grade: '8' },
        metadata: { strand: 'Strand 1' }
      },
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 Football - Inside-of-the-foot Passing & Dynamic Spacing',
        content: { sport: 'Football', topic: 'Passing Drills', grade: '8' },
        metadata: { strand: 'Strand 1' }
      },
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 Basketball - Chest Pass & Triple Threat Stance Practice',
        content: { sport: 'Basketball', topic: 'Chest Pass and Stance', grade: '8' },
        metadata: { strand: 'Strand 1' }
      },
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 Health - Balanced Diets, Macro-Nutrients & Hydration Plans',
        content: { topic: 'Nutrition and Energy', grade: '8' },
        metadata: { strand: 'Strand 2' }
      },
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 Yoga - Surya Namaskar Sequence, Core Stretches & Alignment',
        content: { sport: 'Yoga', topic: 'Surya Namaskar Stretches', grade: '8' },
        metadata: { strand: 'Strand 2' }
      },
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 SEWA - Peer First-Aid Responders & Soft Tissue Injury Care',
        content: { topic: 'First Aid Protocols', grade: '8' },
        metadata: { strand: 'Strand 3' }
      },
      {
        type: 'Lesson Plan' as const,
        title: 'Grade 8 Record Keeping - Individual Physical Health Card Audits',
        content: { topic: 'Health Cards & BMI checks', grade: '8' },
        metadata: { strand: 'Strand 4' }
      }
    ];

    demoItems.forEach(item => {
      storageService.saveItem(item);
    });

    // Refresh history
    setHistory(storageService.getAllItems());
  };

  React.useEffect(() => {
    setHistory(storageService.getAllItems());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteItem(id);
    setHistory(storageService.getAllItems());
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Lesson Plan': return <FileText className="text-indigo-500" />;
      case 'Theory': return <GraduationCap className="text-rose-500" />;
      case 'Skill': return <Target className="text-emerald-500" />;
      case 'Rule': return <Book className="text-amber-500" />;
      case 'Tool': return <Activity className="text-indigo-600" />;
      case 'TestPaper': return <ClipboardList className="text-emerald-500" />;
      default: return <Wrench className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-16 pb-32 overflow-x-hidden">
      {/* Split Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-[#FFFDF9] border-4 border-slate-900 p-6 md:p-16 shadow-[12px_12px_0px_0px_rgba(10,28,42,1)]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Left Side: Copy and details conforming to Image 1 */}
        <div className="lg:col-span-7 relative z-10 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-ping"></span>
            <span className="text-[10px] font-black uppercase text-[#FF6B00] tracking-widest">Lesson Planning • Free for PE Teachers</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.9] text-slate-900 uppercase">
              The PE <br className="hidden md:block"/>
              department.<br/>
              <span className="text-slate-400">In one app.</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl leading-relaxed font-semibold">
              <strong className="text-slate-900 font-bold">Lesson plans</strong>, classroom tools, Khelo India fitness scoring, question papers and parent reports — every part of an Indian PE teacher's day, in one place. <strong className="text-slate-900 font-bold">Plan. Teach. Track. New track grow together.</strong> Free for PE teachers.
            </p>
          </div>

          {/* Action Buttons to match Image 1 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavigate?.('planner')}
              className="group w-full sm:w-auto px-8 py-5 bg-[#FF6B00] text-white rounded-full font-black text-xs uppercase tracking-widest transition-all hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 text-center flex items-center justify-center space-x-2"
            >
              <span>Start planning &mdash; free</span>
              <span className="font-sans font-black text-sm">&rarr;</span>
            </button>
            
            <button 
              onClick={() => onNavigate?.('tools')}
              className="w-full sm:w-auto px-8 py-5 bg-white border-2 border-slate-205 text-slate-800 rounded-full font-black text-xs uppercase tracking-widest hover:border-slate-900 hover:text-slate-950 hover:bg-slate-50 transition-all text-center flex items-center justify-center"
            >
              See the platform
            </button>
          </div>

          {/* Underneath columns representing three keys */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
            {[
              { num: '01', title: 'Plan', desc: 'Lessons in 60s' },
              { num: '02', title: 'Teach', desc: 'Field-ready tools' },
              { num: '03', title: 'Track', desc: 'Fitness & reports' }
            ].map((col, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block">{col.num}</span>
                <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs md:text-sm">{col.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: High fidelity mock scene matching Image 1 */}
        <div className="lg:col-span-5 relative h-[500px] w-full flex items-center justify-center">
          <div className="absolute inset-0 bg-[#E2F1FF] rounded-[2.5rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
            {/* Simulation of a school field atmosphere */}
            <div className="absolute inset-0 bg-cover bg-center opacity-85" style={{ backgroundImage: 'linear-gradient(rgba(10,28,42,0.1), rgba(10,28,42,0.4)), url("https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=1000")' }}></div>
            
            {/* Top-Left transparent pill: PLAN-TEACH-TRACK */}
            <div className="absolute top-6 left-6 py-1 px-3 bg-white/25 backdrop-blur-md rounded-full border border-white/20">
              <span className="text-[9px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]"></span>
                Plan • Teach • Track
              </span>
            </div>

            {/* Float generated card at top-right */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white max-w-[200px] md:max-w-[240px] z-20 animate-bounce-subtle">
              <div className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#FF6B00] font-black">
                  <Sparkles size={16} />
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none">Lesson generated</h4>
                  <p className="text-[9px] text-slate-500 font-semibold leading-tight">Grade 8 &bull; Athletics &bull; 47s</p>
                </div>
              </div>
              {/* Progress bar simulation */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  initial={{ width: "2%" }}
                  animate={{ width: ["10%", "95%", "95%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-[#FF6B00] h-full rounded-full"
                ></motion.div>
              </div>
            </div>

            {/* Beautiful illustration layers */}
            <div className="absolute inset-x-6 bottom-6 flex justify-between items-end">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#001D3D] border border-white shadow-md">
                🇮🇳 Indian classroom
              </div>
              <div className="bg-[#001D3D]/95 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-800 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live v4.0</span>
              </div>
            </div>
            
            {/* Big center action logo watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <Logo showText={false} className="scale-[3.5] rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* 🛑 THE PROBLEM & THE SOLUTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-slate-900 border-4 border-slate-900 rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden text-white shadow-[12px_12px_0px_0px_rgba(255,107,0,1)]">
        <div className="lg:col-span-5 space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF6B00]">THE PROBLEM</p>
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[1.0] text-white">
            PE Departments are drowning in <span className="text-slate-400">manual paperwork.</span>
          </h3>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            PE teachers spend hours drafting syllabus maps, recording fitness scores in separate excel sheets, managing equipment inventories, and manually creating CBSE health card records. It steals precious focus away from the field.
          </p>
          <div className="space-y-3 pt-4 border-t border-slate-800">
            {[
              "Hours wasted drafting daily lesson files",
              "Manual and chaotic Khelo India score logging",
              "Lack of structured reporting for school inspectors & parents"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 font-bold">
                <span className="text-[#FF6B00]">✕</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#FFFDF9] border-4 border-slate-900 rounded-[2.5rem] p-6 md:p-10 text-slate-900 flex flex-col justify-between space-y-8 shadow-[4px_4px_0px_0px_rgba(255,107,0,1)]">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">THE SOLUTIONS (SMARTPE INDIA)</p>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-[1.0] text-slate-900">
              The Complete Operating System for modern school PE.
            </h3>
            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              SmartPE India automates your complete PE department administrative workload. From curriculum mapping to multi-sport practical rubric builders, longitudinal fitness database, parent reports, and substituting alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "AI-Drafted Plans in 60s", desc: "Instantly compliant with CBSE/NEP strands." },
              { title: "Digital Fitness Metrology", desc: "No more paper logsheets on the field." },
              { title: "Live Inspector Audits", desc: "Print-ready compliance files for leadership." },
              { title: "Automated Communication", desc: "Parent letters drafted by AI automatically." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span>
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 HOW IT WORKS */}
      <section className="space-y-12 bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="text-center space-y-3 max-w-xl mx-auto border-b-4 border-slate-900 pb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#005BFF]">01.1 OPERATIONAL FLOW</p>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">How smartpe works <br/><span className="text-[#005BFF]">for your school.</span></h2>
          <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
            Three simple phases to transition your PE department from chaotic spreadsheets to structured excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            { 
              step: "01", 
              title: "Initialize & Customize", 
              desc: "Choose your board (CBSE/ICSE) and class ranges. Auto-populate realistic lessons or map your school's unique 40-week academic calendar milestones in seconds.",
              pill: "Phase 1: SETUP" 
            },
            { 
              step: "02", 
              title: "Run Daily Field Operations", 
              desc: "Utilize pre-loaded Khelo India fitness tests to record scores, access class-wise lesson plans on your mobile, and track real-time athletic gear checkout logs.",
              pill: "Phase 2: DEPLOY" 
            },
            { 
              step: "03", 
              title: "1-Click Board Reporting", 
              desc: "Generate professional report cards, print parent notification slips, and provide administrators with instant compliant inspection reports.",
              pill: "Phase 3: CONSOLIDATE" 
            }
          ].map((phase, idx) => (
            <div key={idx} className="bg-slate-50 border-4 border-slate-900 rounded-[2.5rem] p-8 space-y-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-5xl font-black text-indigo-600">{phase.step}</span>
                  <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-wider">{phase.pill}</span>
                </div>
                <h4 className="text-lg font-black uppercase text-slate-900">{phase.title}</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">{phase.desc}</p>
              </div>
              <div className="pt-4 border-t border-slate-200 flex items-center gap-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                <span>Seamless Integration</span>
                <span>&bull;</span>
                <span>No data overhead</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Onboarding / Start Here Strip */}
      <section className="bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border-4 border-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 xl:gap-12">
            <div className="space-y-3 lg:max-w-sm xl:max-w-lg">
              <div className="inline-flex items-center px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Interactive Onboarding</div>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-[1.1]">
                New here? Your first <br/>
                <span className="text-[#FF6B00]">lesson plan</span> in 60 seconds.
              </h3>
              <p className="text-slate-400 text-sm max-w-lg font-medium leading-relaxed">
                Pick your topic, let AI draft the plan, customize contents to your standard, and start teaching with absolute confidence.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 w-full">
              {[
                { step: '01', title: 'Pick topic', desc: 'Select any sport or curriculum target.', tab: 'planner' },
                { step: '02', title: 'AI drafts plan', desc: 'AI creates fully custom syllabus.', tab: 'planner' },
                { step: '03', title: 'Edit & save', desc: 'Refine and customize with ease.', tab: 'planner' },
                { step: '04', title: 'Teach', desc: 'Deliver best-in-class sports theory.', tab: 'planner' }
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => onNavigate?.(item.tab)}
                  className="flex flex-col justify-between p-5 lg:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6B00] hover:bg-white/10 transition-all text-left group"
                >
                  <div className="text-3xl lg:text-4xl font-black text-[#005BFF] mb-4 group-hover:text-[#FF6B00] transition-colors">{item.step}</div>
                  <div>
                    <h4 className="text-xs lg:text-sm font-black uppercase tracking-wider text-white mb-2">{item.title}</h4>
                    <p className="text-[11px] lg:text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Today / Summary Block */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white border-4 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 flex items-center gap-4 md:gap-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)]">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 flex-shrink-0">
            <Calendar className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Active Plans</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{history.filter(h => h.type === 'Lesson Plan').length} Planned Today</p>
          </div>
        </div>
        <div className="bg-white border-4 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 flex items-center gap-4 md:gap-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)]">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 flex-shrink-0">
            <Activity className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Assessments</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 leading-tight">12 Pending Tasks</p>
          </div>
        </div>
        <div className="bg-indigo-600 border-4 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 flex items-center gap-4 md:gap-6 shadow-[8px_8px_0px_0px_rgba(79,70,229,0.1)]">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
            <Zap className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="text-white">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Quick Action</p>
            <p className="text-sm md:text-base font-black uppercase leading-tight">Record scores for 7B</p>
          </div>
        </div>
      </section>

      {/* Weekly PE Timetable & Calendar */}
      <section className="relative">
        <WeeklyCalendarView />
      </section>

      {/* Module Groups */}
      <div className="space-y-32">
        {/* TEACH Group */}
        <section className="space-y-12">
          <div className="flex items-end justify-between border-b-4 border-slate-900 pb-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">01. TEACH</p>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">Classroom <br/> <span className="text-[#005BFF]">Excellence.</span></h2>
              <p className="text-sm text-slate-500 font-extrabold uppercase tracking-widest mt-2 block">Classroom excellence, in 60 seconds.</p>
            </div>
            <p className="hidden md:block text-slate-500 max-w-xs text-right font-black text-[10px] uppercase tracking-widest leading-relaxed">
              "Generate lessons, manage widgets, and master skill progressions in seconds."
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* PE Lesson Plan */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onNavigate?.('planner')}
              className="lg:col-span-2 group bg-slate-900 text-white rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(79,70,229,0.3)] transition-all cursor-pointer relative overflow-hidden animate-pulse-subtle"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles size={32} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tight">PE Lesson Plan</h3>
                  <p className="text-slate-400 font-medium">Generate today's PE lesson in under 60 seconds. AI-powered and curriculum aligned.</p>
                </div>
                <div className="flex items-center space-x-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em]">
                  <span>Build Lesson Now</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>

            {/* Widgets */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onNavigate?.('widgets')}
              className="group bg-purple-50 border-4 border-slate-900 rounded-[3rem] p-8 hover:shadow-[12px_12px_0px_0px_rgba(168,85,247,0.2)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-16 h-16 bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Zap size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tight">Classroom Widgets</h3>
                <p className="text-slate-500 text-sm font-medium">Interactive timers, scoreboards, and group makers for the field.</p>
                <ArrowRight className="text-slate-300 group-hover:text-purple-600 transition-colors" size={24} />
              </div>
            </motion.div>

            {/* Skill Mastery */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onNavigate?.('skillmastery')}
              className="group bg-emerald-50 border-4 border-slate-900 rounded-[3rem] p-8 hover:shadow-[12px_12px_0px_0px_rgba(16,185,129,0.2)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Target size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tight">Skill Progressions</h3>
                <p className="text-slate-500 text-sm font-medium">Long-term curriculum mapping and technical checklists.</p>
                <ArrowRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" size={24} />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 📚 CBSE/NEP CURRICULUM OVERVIEW & ACADEMIC YEAR MAP */}
        <section className="space-y-12 bg-[#FFFDF9] border-4 border-slate-900 rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-slate-900 pb-8 relative z-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">01.5 ACADEMIC YEAR MAPPING</p>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Curriculum & <br/> <span className="text-indigo-600">Strand Progress.</span></h2>
              <p className="text-sm text-slate-600 font-semibold leading-relaxed max-w-xl">
                Track unit milestones across Term 1 & 2. Completed metrics dynamically sync with generated lesson plans, automatically verifying compliance with CBSE HPE Strands 1 to 4.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <button
                onClick={handleSimulateSyllabus}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-dashed border-indigo-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                title="Inject realistic completed lesson plans to demonstrate full strand tracking instantly"
              >
                ⚡ Populate Demo Syllabus
              </button>
              
              <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                CBSE/NEP Compliant
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            {cbseNepStrands.map((strand) => {
              // Count plans matching this strand in history
              const plans = history.filter(item => item.type === 'Lesson Plan');
              const matchedCount = plans.filter(p => {
                const titleLower = p.title.toLowerCase();
                const contentStr = typeof p.content === 'string' ? p.content.toLowerCase() : JSON.stringify(p.content || '').toLowerCase();
                
                if (strand.id === 'S1') {
                  return ['sprint', 'run', 'athletics', 'jump', 'throw', 'speed', 'start', 'football', 'basketball', 'dribble', 'pass', 'layup', 'soccer', 'play', 'tactics', 'formation'].some(k => titleLower.includes(k) || contentStr.includes(k));
                }
                if (strand.id === 'S2') {
                  return ['nutrition', 'diet', 'food', 'yoga', 'asana', 'surya', 'stretch', 'posture', 'flexibility', 'slouch', 'breathing'].some(k => titleLower.includes(k) || contentStr.includes(k));
                }
                if (strand.id === 'S3') {
                  return ['sewa', 'referee', 'rules', 'tournament', 'leadership', 'volunteer', 'community'].some(k => titleLower.includes(k) || contentStr.includes(k));
                }
                if (strand.id === 'S4') {
                  return ['health card', 'profile', 'bmi', 'audit', 'report', 'card', 'scoring', 'record'].some(k => titleLower.includes(k) || contentStr.includes(k));
                }
                return false;
              }).length;

              return (
                <div key={strand.id} className="bg-white border-4 border-slate-900 rounded-2xl p-5 space-y-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{strand.id}</span>
                    <span className="text-xs font-black text-slate-900">{matchedCount} Active Plans</span>
                  </div>
                  <h4 className="text-sm font-black uppercase text-slate-800 leading-tight">{strand.name.split(':')[1] || strand.name}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{strand.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Academic Term Mapping & Unit Progress Bars */}
          <div className="space-y-6 relative z-10 pt-4 border-t-2 border-dashed border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Filter Overview:</span>
                <div className="flex gap-1.5">
                  {(['all', '1', '2'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedCurriculumTerm(t)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-slate-900 transition-all ${
                        selectedCurriculumTerm === t 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t === 'all' ? 'Full Year' : `Term ${t}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Class:</span>
                <select
                  value={selectedCurriculumClass}
                  onChange={(e) => setSelectedCurriculumClass(e.target.value)}
                  className="bg-white border-2 border-slate-900 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((gradeOpt) => (
                    <option key={gradeOpt} value={gradeOpt}>{gradeOpt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Render filtered units */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curriculumUnits
                .filter(unit => selectedCurriculumTerm === 'all' || unit.term.toString() === selectedCurriculumTerm)
                .map((unit) => {
                  // Get progress details dynamically
                  const lessonPlans = history.filter(item => item.type === 'Lesson Plan');
                  const matchedPlans = lessonPlans.filter(plan => {
                    const titleLower = plan.title.toLowerCase();
                    const contentStr = typeof plan.content === 'string' ? plan.content.toLowerCase() : JSON.stringify(plan.content || '').toLowerCase();
                    return unit.keywords.some(kw => titleLower.includes(kw) || contentStr.includes(kw));
                  });
                  const count = matchedPlans.length;
                  const percentage = Math.min(100, Math.round((count / unit.targetLessons) * 100));

                  return (
                    <div 
                      key={unit.id} 
                      className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 space-y-4 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] px-2 py-0.5 rounded-full">
                            Term {unit.term} • {unit.timeline}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">Unit {unit.id}</span>
                        </div>
                        <h4 className="text-lg font-black uppercase text-slate-900 leading-tight pt-1">{unit.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{unit.description}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">{unit.strandName}</span>
                          <span className="font-black text-slate-900">{count} / {unit.targetLessons} Lessons</span>
                        </div>
                        
                        {/* Interactive Progress Bar */}
                        <div className="w-full h-3 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden p-[1px]">
                          <div 
                            className="h-full bg-[#005BFF] rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[10px] font-black text-indigo-600">{percentage}% COMPLETE</span>
                          <button
                            onClick={() => onNavigate?.('planner')}
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-900 hover:text-[#FF6B00] transition-colors"
                          >
                            <span>Draft Plan</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Trigger Details Button */}
          <div className="flex justify-center pt-4 relative z-10">
            <button
              onClick={() => setIsCurriculumModalOpen(true)}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-900 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(255,107,0,1)] hover:-translate-y-0.5 active:translate-y-0"
            >
              📊 Expand Interactive Curriculum Matrix
            </button>
          </div>
        </section>

        {/* 📋 CURRICULUM OVERVIEW HIGH-FIDELITY MODAL OVERLAY */}
        <AnimatePresence>
          {isCurriculumModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 140 }}
                className="bg-[#FFFDF9] border-4 border-slate-900 w-full max-w-5xl rounded-[3rem] shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] overflow-hidden max-h-[85vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="bg-slate-900 text-white p-6 md:p-8 flex items-center justify-between border-b-4 border-slate-900 flex-shrink-0">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#FF6B00] font-black uppercase tracking-[0.4em]">BOARD MATRIX AUDIT</span>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">CBSE/NEP Syllabus Progress Mapping</h3>
                  </div>
                  <button 
                    onClick={() => setIsCurriculumModalOpen(false)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all flex items-center justify-center"
                    aria-label="Close Modal"
                  >
                    <span className="font-bold text-sm">✕</span>
                  </button>
                </div>

                {/* Modal Main Content Container (Scrollable) */}
                <div className="p-6 md:p-10 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                  {/* Global Overview Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-indigo-50 border-4 border-slate-900 rounded-[2rem] p-6 text-center space-y-1">
                      <span className="text-xs font-black text-indigo-400 uppercase">Selected Class</span>
                      <p className="text-3xl font-black text-indigo-900 uppercase">{selectedCurriculumClass}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Academic Cycle: 2026-27</p>
                    </div>

                    <div className="bg-emerald-50 border-4 border-slate-900 rounded-[2rem] p-6 text-center space-y-1">
                      <span className="text-xs font-black text-emerald-400 uppercase">Total Target Units</span>
                      <p className="text-3xl font-black text-emerald-950 uppercase">6 Blocks</p>
                      <p className="text-[10px] text-slate-400 font-bold">Full Syllabus Covered</p>
                    </div>

                    <div className="bg-orange-50 border-4 border-slate-900 rounded-[2rem] p-6 text-center space-y-1">
                      <span className="text-xs font-black text-orange-400 uppercase">Active Generated Plans</span>
                      <p className="text-3xl font-black text-orange-950 uppercase">
                        {history.filter(h => h.type === 'Lesson Plan').length} Plans
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">Saved in Local Vault</p>
                    </div>

                    {/* Overall Progress Calculator */}
                    {(() => {
                      let totalCount = 0;
                      let totalTarget = 0;
                      curriculumUnits.forEach(unit => {
                        const lessonPlans = history.filter(item => item.type === 'Lesson Plan');
                        const matchedCount = lessonPlans.filter(plan => {
                          const titleLower = plan.title.toLowerCase();
                          const contentStr = typeof plan.content === 'string' ? plan.content.toLowerCase() : JSON.stringify(plan.content || '').toLowerCase();
                          return unit.keywords.some(kw => titleLower.includes(kw) || contentStr.includes(kw));
                        }).length;
                        totalCount += matchedCount;
                        totalTarget += unit.targetLessons;
                      });
                      const totalPercentage = Math.min(100, Math.round((totalCount / totalTarget) * 100));

                      return (
                        <div className="bg-blue-50 border-4 border-slate-900 rounded-[2rem] p-6 text-center space-y-1">
                          <span className="text-xs font-black text-blue-400 uppercase">Overall Completion</span>
                          <p className="text-3xl font-black text-blue-950 uppercase">{totalPercentage}%</p>
                          <div className="w-full h-2 bg-slate-200 border border-slate-900 rounded-full overflow-hidden p-[1px] mt-1">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${totalPercentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Syllabus Timeline Milestones (Term 1 & 2 Visual Map) */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-black uppercase text-slate-900 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                      <span>📆 Academic Timeline & Compliance Audit</span>
                    </h4>

                    <div className="space-y-6">
                      {/* Term 1 */}
                      <div className="bg-slate-50 border-4 border-slate-900 rounded-[2.5rem] p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <h5 className="text-base font-black uppercase text-indigo-700">Term 1 (April &mdash; September)</h5>
                          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase rounded-lg">FMove, Skill mechanics & Safety</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {curriculumUnits.filter(u => u.term === 1).map(unit => {
                            const matched = history.filter(item => item.type === 'Lesson Plan').filter(plan => {
                              const titleLower = plan.title.toLowerCase();
                              const contentStr = typeof plan.content === 'string' ? plan.content.toLowerCase() : JSON.stringify(plan.content || '').toLowerCase();
                              return unit.keywords.some(kw => titleLower.includes(kw) || contentStr.includes(kw));
                            });

                            return (
                              <div key={unit.id} className="bg-white border-2 border-slate-900 rounded-2xl p-4 space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-[8px] font-mono font-bold text-slate-400">Unit {unit.id}</span>
                                  <span className="text-[9px] font-black uppercase text-indigo-600">{unit.timeline}</span>
                                </div>
                                <h6 className="text-sm font-black uppercase text-slate-900 leading-tight">{unit.title}</h6>
                                
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">Lessons Completed:</span>
                                    <span>{matched.length} / {unit.targetLessons}</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, Math.round((matched.length / unit.targetLessons) * 100))}%` }}></div>
                                  </div>
                                </div>

                                {matched.length > 0 ? (
                                  <div className="pt-2 border-t border-slate-100 space-y-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Matched generated plans:</span>
                                    {matched.map((m, idx) => (
                                      <div key={idx} className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold truncate">
                                        <span>✓</span>
                                        <span className="truncate">{m.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[9px] text-slate-400 font-semibold italic">No generated plans yet</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Term 2 */}
                      <div className="bg-slate-50 border-4 border-slate-900 rounded-[2.5rem] p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <h5 className="text-base font-black uppercase text-[#FF6B00]">Term 2 (October &mdash; March)</h5>
                          <span className="px-2.5 py-1 bg-orange-100 text-[#FF6B00] text-[9px] font-black uppercase rounded-lg">Asanas, Team tactics & SEWA</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {curriculumUnits.filter(u => u.term === 2).map(unit => {
                            const matched = history.filter(item => item.type === 'Lesson Plan').filter(plan => {
                              const titleLower = plan.title.toLowerCase();
                              const contentStr = typeof plan.content === 'string' ? plan.content.toLowerCase() : JSON.stringify(plan.content || '').toLowerCase();
                              return unit.keywords.some(kw => titleLower.includes(kw) || contentStr.includes(kw));
                            });

                            return (
                              <div key={unit.id} className="bg-white border-2 border-slate-900 rounded-2xl p-4 space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-[8px] font-mono font-bold text-slate-400">Unit {unit.id}</span>
                                  <span className="text-[9px] font-black uppercase text-[#FF6B00]">{unit.timeline}</span>
                                </div>
                                <h6 className="text-sm font-black uppercase text-slate-900 leading-tight">{unit.title}</h6>
                                
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400">Lessons Completed:</span>
                                    <span>{matched.length} / {unit.targetLessons}</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#FF6B00]" style={{ width: `${Math.min(100, Math.round((matched.length / unit.targetLessons) * 100))}%` }}></div>
                                  </div>
                                </div>

                                {matched.length > 0 ? (
                                  <div className="pt-2 border-t border-slate-100 space-y-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Matched generated plans:</span>
                                    {matched.map((m, idx) => (
                                      <div key={idx} className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold truncate">
                                        <span>✓</span>
                                        <span className="truncate">{m.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[9px] text-slate-400 font-semibold italic">No generated plans yet</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-100 border-t-2 border-slate-900 p-6 flex justify-end gap-3 flex-shrink-0">
                  <button
                    onClick={() => setIsCurriculumModalOpen(false)}
                    className="px-6 py-3 bg-white border-2 border-slate-900 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Close Overview
                  </button>
                  <button
                    onClick={() => {
                      setIsCurriculumModalOpen(false);
                      onNavigate?.('planner');
                    }}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                  >
                    Create New Plan Now &rarr;
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ASSESS Group */}
        <section className="space-y-12">
          <div className="flex items-end justify-between border-b-4 border-slate-900 pb-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">02. ASSESS</p>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">Fitness <br/> <span className="text-[#FF6B00]">Metrology.</span></h2>
              <p className="text-sm text-slate-500 font-extrabold uppercase tracking-widest mt-2 block">School Fitness Database</p>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* School Fitness Database */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.01, y: -5 }}
              onClick={() => onNavigate?.('school-overview')}
              className="lg:col-span-2 group bg-indigo-900 border-4 border-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(79,70,229,0.2)] transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
                <div className="w-16 h-16 bg-white text-indigo-900 rounded-2xl flex items-center justify-center shadow-xl">
                  <Wrench size={32} />
                </div>
                <div className="space-y-4">
                  <div className="inline-flex px-3 py-1 bg-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-2">Primary Module</div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">School Fitness Database</h3>
                  <p className="text-indigo-200 font-medium">Store and track every student's fitness test and Khelo India scores in one central vault.</p>
                </div>
                <div className="flex items-center space-x-3 text-white font-black text-[10px] uppercase tracking-[0.2em]">
                  <span>Access Database</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>

            {/* Fitness Tests */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onNavigate?.('fitness')}
              className="group bg-rose-50 border-4 border-slate-900 rounded-[3rem] p-8 hover:shadow-[12px_12px_0px_0px_rgba(244,63,94,0.2)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Activity size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tight">Fitness Tests</h3>
                <p className="text-slate-500 text-sm font-medium">Record daily fitness battery scores. All Khelo India tests pre-loaded.</p>
                <ArrowRight className="text-slate-300 group-hover:text-rose-600 transition-colors" size={24} />
              </div>
            </motion.div>

            {/* Test Generator */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onNavigate?.('testpaper')}
              className="group bg-slate-100 border-4 border-slate-900 rounded-[3rem] p-8 hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,0.1)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardList size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tight">Question Paper Generator (CBSE)</h3>
                <p className="text-slate-500 text-sm font-medium">Create MCQ and theory tests for PE in one click. Fully CBSE aligned.</p>
                <ArrowRight className="text-slate-300 group-hover:text-slate-900 transition-colors" size={24} />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 📊 CLINICAL EVIDENCE: Student Progress & Longitudinal Analytics Hub */}
        <section className="space-y-12 bg-white border-4 border-slate-900 rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-slate-900 pb-8 relative z-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF6B00]">02.5 CLINICAL EVIDENCE & PERFORMANCE</p>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Student Progress & <br/> <span className="text-[#FF6B00]">Longitudinal Dashboards.</span></h2>
              <p className="text-sm text-slate-600 font-semibold leading-relaxed max-w-xl">
                Demonstrate tangible physical literacy growth. Compare baseline vs midline vs year-end fitness batteries, track skill progressions, and trigger health interventions instantly.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-4 py-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
                Longitudinal Analytics Active
              </span>
            </div>
          </div>

          {/* Interactive Core Dashboard Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Control Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-50 border-4 border-slate-900 rounded-[2rem] p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">1. Select Grade/Class</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(['8-A', '7-C', '9-B'] as const).map((grade) => (
                      <button
                        key={grade}
                        onClick={() => {
                          setSelectedClassProgress(grade);
                          if (downloadStatus) setDownloadStatus(null);
                        }}
                        className={`py-2 px-3 text-xs font-black rounded-xl border-2 border-slate-900 transition-all ${
                          selectedClassProgress === grade 
                            ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(255,107,0,1)]' 
                            : 'bg-white text-slate-800 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">2. Select Analytics View</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'fitness', label: '📊 Fitness Trends', desc: 'Compare 50m sprint times & flexibility.' },
                      { id: 'skills', label: '🎯 Skill Progression Mastery', desc: 'Assess sports mechanics and grades.' },
                      { id: 'interventions', label: '⚠️ Intervention Flags', desc: 'Identify students at obesity/cardio risk.' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setSelectedMetricType(btn.id as any)}
                        className={`text-left p-3.5 rounded-xl border-2 border-slate-900 transition-all flex flex-col space-y-1 ${
                          selectedMetricType === btn.id 
                            ? 'bg-indigo-600 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]' 
                            : 'bg-white text-slate-800 hover:bg-indigo-50 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">{btn.label}</span>
                        <span className={`text-[10px] leading-relaxed ${selectedMetricType === btn.id ? 'text-indigo-200' : 'text-slate-500'}`}>{btn.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parent Report Card Trigger */}
                <div className="pt-4 border-t-2 border-dashed border-slate-200">
                  <button
                    onClick={() => {
                      setDownloadStatus('generating');
                      setTimeout(() => {
                        setDownloadStatus('success');
                      }, 1500);
                    }}
                    disabled={downloadStatus === 'generating'}
                    className="w-full py-3.5 px-5 bg-[#FF6B00] hover:bg-orange-600 text-white border-2 border-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
                  >
                    {downloadStatus === 'generating' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Compiling Progress Log...</span>
                      </>
                    ) : downloadStatus === 'success' ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Downloaded Report Card!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Class Report Card</span>
                      </>
                    )}
                  </button>
                  {downloadStatus === 'success' && (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-emerald-600 font-bold mt-2 text-center"
                    >
                      ✓ Downloaded: smartpe_grade_{selectedClassProgress}_term_report.pdf
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Display Pane */}
            <div className="lg:col-span-8 bg-slate-950 border-4 border-slate-900 rounded-[2rem] p-6 text-white min-h-[350px] flex flex-col justify-between">
              {selectedMetricType === 'fitness' && (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Live Dataset &bull; Grade {selectedClassProgress}</span>
                      <h4 className="text-lg font-black uppercase text-white">Khelo India Fitness Battery Progress</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-white/10 text-white rounded-lg text-[9px] font-mono">3 Terms Consolidated</span>
                  </div>

                  <p className="text-xs text-slate-400 max-w-xl">
                    Longitudinal assessment comparing student performance across July (Baseline), November (Midline), and March (Year-End) for Grade {selectedClassProgress}.
                  </p>

                  <div className="h-[180px] w-full bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={classProgressData[selectedClassProgress]} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                        <XAxis dataKey="checkpoint" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="#94A3B8" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        <Line name="50m Sprint (Lower = Faster, secs)" type="monotone" dataKey="speed" stroke="#FF6B00" strokeWidth={3} activeDot={{ r: 8 }} />
                        <Line name="Sit & Reach (Higher = Better, cm)" type="monotone" dataKey="flexibility" stroke="#4F46E5" strokeWidth={3} />
                        <Line name="600m Run/Walk (Lower = More Endurance, secs)" type="monotone" dataKey="endurance" stroke="#10B981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black">50m Speed Improvement</p>
                      <p className="text-sm font-black text-[#FF6B00]">-1.1s (Average)</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black">Flexibility Delta</p>
                      <p className="text-sm font-black text-indigo-400">+4.8 cm</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black">Endurance Time Drop</p>
                      <p className="text-sm font-black text-emerald-400">-37s (Average)</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMetricType === 'skills' && (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Technique & Play Mechanics &bull; Grade {selectedClassProgress}</span>
                      <h4 className="text-lg font-black uppercase text-white">CBSE Practical Skill Progression</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-[#10B981]/20 text-[#10B981] rounded-lg text-[9px] font-mono">10-Point Rubric</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Average student ratings based on continuous practical rubrics generated for curriculum sports modules.
                  </p>

                  <div className="space-y-3 flex-1 justify-center flex flex-col">
                    {[
                      { skill: 'Football: Ball Control & Dribbling Technique', start: 4.5, end: 8.8, color: 'bg-indigo-500' },
                      { skill: 'Basketball: Chest Pass & Layup Mechanics', start: 5.2, end: 8.2, color: 'bg-purple-500' },
                      { skill: 'Athletics: Sprint Block Start Position', start: 3.8, end: 7.9, color: 'bg-[#FF6B00]' },
                    ].map((s, idx) => (
                      <div key={idx} className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{s.skill}</span>
                          <span className="text-slate-400">Baseline {s.start} &rarr; <strong className="text-white">{s.end} / 10</strong></span>
                        </div>
                        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`absolute top-0 left-0 h-full bg-slate-700`} style={{ width: `${s.start * 10}%` }}></div>
                          <div className={`absolute top-0 left-0 h-full ${s.color}`} style={{ width: `${s.end * 10}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 uppercase font-black">
                          <span>Initial Level</span>
                          <span>Year-end Mastery Growth: +{Math.round(((s.end - s.start) / s.start) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMetricType === 'interventions' && (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Health Risk Trigger Indicators &bull; Grade {selectedClassProgress}</span>
                      <h4 className="text-lg font-black uppercase text-white">AI-Flagged Nutritional & Fitness Gaps</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-[9px] font-mono">4 Flags Active</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    SmartPE's analytics engine flags students outside healthy weight envelopes or trailing cardiovascular benchmarks, suggesting immediate modifications.
                  </p>

                  <div className="space-y-2.5 flex-1 justify-center flex flex-col">
                    {[
                      { student: 'Amit R. (Roll 04)', zone: 'Obesity Class 1 (BMI 30.2)', alert: 'Cardio endurance trials trailed 25% below age average.', action: 'Introduce low-impact aerobic intervals & modified shuttle walks.' },
                      { student: 'Priya K. (Roll 17)', zone: 'Underweight Range (BMI 15.4)', alert: 'Core and leg strength batteries indicating fatigue.', action: 'Focus on functional bodyweight balance drills & endurance logs.' },
                    ].map((st, i) => (
                      <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-rose-300">{st.student}</span>
                          <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[9px] font-black uppercase">{st.zone}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-medium">
                          <strong>Gap Identified:</strong> {st.alert}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-bold">
                          <strong>💡 Prescribed Intervention:</strong> {st.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ADMIN Group */}
        <section className="space-y-12">
          <div className="flex items-end justify-between border-b-4 border-slate-900 pb-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">03. COMMUNICATE & ADMIN</p>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">Bureaucracy, <br/> <span className="text-[#005BFF]">Automated.</span></h2>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Parent Letters */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate?.('parentletters')}
              className="group bg-blue-50 border-4 border-slate-900 rounded-[2.5rem] p-8 hover:shadow-[12px_12px_0px_0px_rgba(59,130,246,0.1)] transition-all cursor-pointer"
            >
               <div className="flex items-center gap-6 mb-6">
                 <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center"><Mail size={24}/></div>
                 <h3 className="text-xl font-black uppercase">Parent Letters</h3>
               </div>
               <p className="text-slate-500 text-xs font-medium mb-6">Draft ready-to-print letters and emails for parents about PE and fitness events.</p>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                 <span>Draft a letter</span>
                 <ArrowRight size={14} />
               </div>
            </motion.div>

            {/* Yearly Planner */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate?.('yearly')}
              className="group bg-indigo-50 border-4 border-slate-900 rounded-[2.5rem] p-8 hover:shadow-[12px_12px_0px_0px_rgba(79,70,229,0.1)] transition-all cursor-pointer"
            >
               <div className="flex items-center gap-6 mb-6">
                 <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center"><Calendar size={24}/></div>
                 <h3 className="text-xl font-black uppercase">Yearly Planner</h3>
               </div>
               <p className="text-slate-500 text-xs font-medium mb-6">Auto-map 40 weeks of PE for your classes based on school calendar.</p>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                 <span>Map Curriculum</span>
                 <ArrowRight size={14} />
               </div>
            </motion.div>

            {/* Compliance */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate?.('compliance')}
              className="group bg-amber-50 border-4 border-slate-900 rounded-[2.5rem] p-8 hover:shadow-[12px_12px_0px_0px_rgba(245,158,11,0.1)] transition-all cursor-pointer"
            >
               <div className="flex items-center gap-6 mb-6">
                 <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center"><ShieldCheck size={24}/></div>
                 <h3 className="text-xl font-black uppercase">Compliance</h3>
               </div>
               <p className="text-slate-500 text-xs font-medium mb-6">Ensure your department meets CBSE, NEP 2020, and Khelo India norms.</p>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                 <span>Verify Status</span>
                 <ArrowRight size={14} />
               </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 🏆 LEADERSHIP & OVERSIGHT: The Principal & HoD Suite */}
        <section className="space-y-12 bg-[#F8FAFC] border-4 border-slate-900 rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-slate-900 pb-8 relative z-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF6B00]">04. LEADERSHIP & OVERSIGHT</p>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Principal & <br/> <span className="text-[#005BFF]">School Office.</span></h2>
              <p className="text-sm text-slate-600 font-semibold leading-relaxed max-w-xl">
                Real-time dashboard reporting and physical education governance for school boards, inspectors, and leadership.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Board Audit Compliant
              </span>
            </div>
          </div>

          {/* Interactive Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Card 1: Principal Dashboard */}
            <motion.div 
              whileHover={{ scale: 1.01, y: -4 }}
              onClick={() => onNavigate?.('principal-dashboard')}
              className="group bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 hover:shadow-[12px_12px_0px_0px_rgba(0,91,255,0.25)] transition-all cursor-pointer relative overflow-hidden border-4 border-slate-900"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between space-y-8">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
                    <ShieldCheck size={28} />
                  </div>
                  <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider">Board Inspection Ready</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Principal Dashboard</h3>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                    A secure overview for school leaders to track physical education compliance, CBSE event progress, medical logs, and real-time student fitness metrics across the entire school academy.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-[#FF6B00] group-hover:text-white transition-colors font-black text-xs uppercase tracking-[0.2em] pt-4">
                  <span>Enter Principal Suite</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>

            {/* Card 2: PE Department Office */}
            <motion.div 
              whileHover={{ scale: 1.01, y: -4 }}
              onClick={() => onNavigate?.('department-office')}
              className="group bg-white text-slate-900 rounded-[2.5rem] p-8 md:p-10 hover:shadow-[12px_12px_0px_0px_rgba(255,107,0,0.2)] transition-all cursor-pointer relative overflow-hidden border-4 border-slate-900"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-slate-400">
                <Wrench size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between space-y-8">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-lg text-white">
                    <Wrench size={28} />
                  </div>
                  <span className="text-[10px] font-black bg-orange-100 text-[#FF6B00] border border-orange-200 px-3 py-1 rounded-full uppercase tracking-wider">Administrative Hub</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Department Office</h3>
                  <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
                    The operational nerve center for the PE department. Manage substitute teaching plans, monitor athletic equipment logs, and award Inter-House Championship Points (Agni, Jal, Prithvi, Vayu).
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-indigo-600 group-hover:text-indigo-800 transition-colors font-black text-xs uppercase tracking-[0.2em] pt-4">
                  <span>Enter Department Office</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* 🔄 INTERACTIVE TEACHER-TO-PRINCIPAL DATA FLOW PIPELINE */}
          <div className="bg-white border-4 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-8 relative z-10">
            <div className="space-y-2 text-left">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="text-[#FF6B00]" size={22} />
                How School Data Synchronizes in Real-Time
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                No manual data entry for school leadership is required! Learn exactly how daily physical education inputs on the field propagate automatically into certified inspector reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="p-5 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl space-y-3 relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">1</div>
                <h4 className="text-sm font-black uppercase text-indigo-950">1. Teacher Inputs (Daily)</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Teachers click on <strong className="text-indigo-900 font-bold">Fitness Tests</strong> to log student times/scores, or open the <strong className="text-indigo-900 font-bold">Department Office</strong> to update inventory and award inter-house points.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-2xl space-y-3 relative">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md">2</div>
                <h4 className="text-sm font-black uppercase text-amber-950">2. smartpeindia Aggregates</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Our secure cloud engine analyzes individual records, calculates class BMI averages, counts completed lesson compliance logs, and compiles verified sports day brackets.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-2xl space-y-3 relative">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-xs shadow-md">3</div>
                <h4 className="text-sm font-black uppercase text-rose-950">3. Live Principal Review</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  School Principals and CBSE inspectors view the <strong className="text-rose-900 font-bold">Principal Dashboard</strong> to instantly find compliant, print-ready summaries, audit logs, and performance metrics.
                </p>
              </div>
            </div>
          </div>

          {/* 🏢 DEPARTMENT OPERATIONS: Live Nerve Center Preview */}
          <div className="bg-slate-900 border-4 border-slate-900 rounded-[2.5rem] p-6 md:p-8 text-white relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] text-[#FF6B00] font-black uppercase tracking-widest">Interactive Operations Hub</span>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Wrench size={22} className="text-[#FF6B00]" />
                  PE Department Nerve Center
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xl">
                  Simulate core departmental workflows: attendance logs, class coverage ratios, sports gear inventory control, and inter-house tallies.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {(['metrics', 'inventory', 'substitutions', 'house-points'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDeptTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeDeptTab === tab
                        ? 'bg-[#FF6B00] text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Tabs Pane */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 min-h-[220px] flex flex-col justify-between">
              {activeDeptTab === 'metrics' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">📊 Live Department Metrics & Attendance</h4>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-mono">Auto-Compiling</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Daily Attendance</p>
                      <p className="text-2xl font-black text-emerald-400">96.4%</p>
                      <p className="text-[8px] text-slate-500 mt-1">412/427 students active</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Class Coverage</p>
                      <p className="text-2xl font-black text-[#005BFF]">100%</p>
                      <p className="text-[8px] text-slate-500 mt-1">All 14 PE periods staffed</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Syllabus Completed</p>
                      <p className="text-2xl font-black text-amber-400">78.5%</p>
                      <p className="text-[8px] text-slate-500 mt-1">On schedule with CBSE blueprint</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Active Medical Flags</p>
                      <p className="text-2xl font-black text-rose-500">2 Gaps</p>
                      <p className="text-[8px] text-rose-400 font-bold mt-1">✓ Logged with first-aid ward</p>
                    </div>
                  </div>
                </div>
              )}

              {activeDeptTab === 'inventory' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">📦 Athletic Equipment & Resource Ledger</h4>
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      All Stocks Calibrated
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-black uppercase">
                          <th className="pb-2">Sport Item</th>
                          <th className="pb-2">Total Stock</th>
                          <th className="pb-2">Checked Out</th>
                          <th className="pb-2">Available</th>
                          <th className="pb-2">Condition Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        <tr>
                          <td className="py-2 font-black text-white">Nivia Footballs (Size 5)</td>
                          <td className="py-2">35</td>
                          <td className="py-2 text-[#FF6B00]">5 (Grade 8-A)</td>
                          <td className="py-2 text-emerald-400 font-bold">30</td>
                          <td className="py-2"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">Excellent</span></td>
                        </tr>
                        <tr>
                          <td className="py-2 font-black text-white">English Willow Cricket Kits</td>
                          <td className="py-2">12</td>
                          <td className="py-2 text-[#FF6B00]">2 (Grade 10-C)</td>
                          <td className="py-2 text-emerald-400 font-bold">10</td>
                          <td className="py-2"><span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-bold">1 Grips Damaged</span></td>
                        </tr>
                        <tr>
                          <td className="py-2 font-black text-white">Anti-Slip PVC Yoga Mats</td>
                          <td className="py-2">150</td>
                          <td className="py-2 text-slate-500">0</td>
                          <td className="py-2 text-emerald-400 font-bold">150</td>
                          <td className="py-2"><span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">Clean & Rolled</span></td>
                        </tr>
                        <tr>
                          <td className="py-2 font-black text-white">Yonex Badminton Rackets</td>
                          <td className="py-2">40</td>
                          <td className="py-2 text-[#FF6B00]">14 (Grade 7-C)</td>
                          <td className="py-2 text-emerald-400 font-bold">26</td>
                          <td className="py-2"><span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[9px] font-bold">2 Broken Strings</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeDeptTab === 'substitutions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">🔄 AI-Automated Substitution Scheduler</h4>
                    <span className="px-2 py-0.5 bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] rounded text-[9px] font-mono">1 Active Notice</span>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div>
                        <span className="text-[9px] text-rose-400 font-black uppercase">Teacher Absent (On Sick Leave)</span>
                        <p className="text-xs font-black text-white">Mr. Devanshu Malhotra (Senior School PE HoD)</p>
                      </div>
                      <div className="text-right sm:text-right">
                        <span className="text-[9px] text-indigo-400 font-black uppercase">Schedule Impacted</span>
                        <p className="text-xs font-mono text-slate-300">Period 3 (Grade 8-A Basketball Practical)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">AI</div>
                      <div>
                        <p className="text-xs font-black text-white">Recommended Match Replacement Assigned</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                          <strong>Ms. Meera Nair</strong> has a free slot in Period 3 and is certified in Basketball drills. Substitution roster auto-updated, notification broadcasted to high-school wing coordinator, and lesson plan shared with Ms. Meera Nair's phone app.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDeptTab === 'house-points' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">🏆 Inter-House Championship Standings</h4>
                    <span className="text-[9px] text-amber-400 font-bold">Points sync directly with Board Audit Ledgers</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {[
                        { house: 'Agni House (Red)', points: housePoints.Agni, color: 'bg-rose-500', max: 500 },
                        { house: 'Jal House (Blue)', points: housePoints.Jal, color: 'bg-blue-500', max: 500 },
                        { house: 'Prithvi House (Green)', points: housePoints.Prithvi, color: 'bg-emerald-500', max: 500 },
                        { house: 'Vayu House (Yellow)', points: housePoints.Vayu, color: 'bg-amber-400', max: 500 },
                      ].map((h, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-black">
                            <span>{h.house}</span>
                            <span>{h.points} pts</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${h.color} transition-all duration-300`} style={{ width: `${(h.points / h.max) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Demonstrate data flow capability. Click the trigger below to simulate awarding victory points to any house and watch the tallies update on the board dynamically.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setHousePoints(prev => ({ ...prev, Agni: prev.Agni + 20 }))}
                          className="py-2 px-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          +20 Agni
                        </button>
                        <button
                          onClick={() => setHousePoints(prev => ({ ...prev, Jal: prev.Jal + 20 }))}
                          className="py-2 px-1 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 hover:border-transparent rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          +20 Jal
                        </button>
                        <button
                          onClick={() => setHousePoints(prev => ({ ...prev, Prithvi: prev.Prithvi + 20 }))}
                          className="py-2 px-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-transparent rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          +20 Prithvi
                        </button>
                        <button
                          onClick={() => setHousePoints(prev => ({ ...prev, Vayu: prev.Vayu + 20 }))}
                          className="py-2 px-1 bg-amber-500/10 hover:bg-[#FF6B00] text-amber-400 hover:text-white border border-amber-500/20 hover:border-transparent rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          +20 Vayu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📋 CURRICULUM & BOARD COMPLIANCE MATRIX */}
          <div className="bg-[#FFFDF9] border-4 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6 relative z-10">
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">
                Pre-Loaded Curriculum Standards Aligned inside smartpeindia
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-xl leading-relaxed">
                We satisfy physical literacy mandates out of the box. No manual curriculum mapping is required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">CBSE HPE Strand 1-4</span>
                <h4 className="text-xs font-black uppercase text-slate-900">Mandatory HPE Policy</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Fully integrates Games/Sports, Health & Fitness, SEWA projects, and the mandatory Health & Activity Card generation.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <span className="text-[9px] font-black uppercase text-[#FF6B00] tracking-wider">NEP 2020 Guidelines</span>
                <h4 className="text-xs font-black uppercase text-slate-900">Sports-Integrated Learning</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Leverages physical movement as pedagogical tool. Supports holistic 360-degree assessment cards for report cards.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Khelo India SPARKS</span>
                <h4 className="text-xs font-black uppercase text-slate-900">National Fitness Battery</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Pre-loads fitness tests for age bands 5-8 (BMI, Balance, Co-ordination) and 9-18 (Speed, Strength, Endurance, Flexibility).
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Dynamic CTA Banner matching Repaint Mockup */}
      <section className="bg-[#FF6B00] text-white rounded-[3rem] p-12 md:p-16 border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-black/20 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <span className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Active Generator Ready</span>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[1.1]">Your next lesson is <br className="hidden md:block"/> 47 seconds away.</h3>
            <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Run our AI Lesson Architect in real-time instantly.</p>
          </div>
          <div>
            <button 
              onClick={() => onNavigate?.('planner')}
              className="px-10 py-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest border-2 border-slate-900 hover:bg-slate-800 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
            >
              <Sparkles size={20} className="text-[#FF6B00]" />
              <span>Launch Builder now</span>
            </button>
          </div>
        </div>
      </section>

      {/* 🤝 TRUST & SYSTEM PROOF: Why 420+ Schools Trust smartpeindia */}
      <section className="space-y-16 bg-[#FFFDF9] border-4 border-slate-900 rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-slate-900 pb-8 relative z-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#005BFF]">05. TRUST & EVIDENCE</p>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Why PE Directors <br/> <span className="text-[#005BFF]">Choose smartpeindia.</span></h2>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed max-w-xl">
              From school inspectoral revisions to daily curriculum tracking, discover how smartpeindia delivers verified, board-compliant value to physical educators.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="px-4 py-2 bg-indigo-600/10 border border-indigo-600/30 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Verified School Network
            </span>
          </div>
        </div>

        {/* Part 1: Who It Is For (Bento Grid) */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest text-center">🎯 Tailored Roles & Stakeholders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'PE Teachers', role: 'Daily Operations', benefit: 'Instantly assemble CBSE/NCERT-aligned lesson structures. Eliminate manual spreadsheet preparation and save 5+ hours weekly.', color: 'bg-[#FF6B00]/5 text-[#FF6B00]' },
              { title: 'HoDs & Directors', role: 'Department Control', benefit: 'Direct supervisor access. Track student growth trends, coordinate substitute coverage plans, and log sports inventory.', color: 'bg-indigo-600/5 text-indigo-700' },
              { title: 'School Principals', role: 'Governance & Brand', benefit: 'Zero-effort board compliance audits. Access print-ready fitness summaries, medical logs, and official performance stats.', color: 'bg-emerald-500/5 text-emerald-700' },
              { title: 'Board Inspectors', role: 'Policy & Compliance', benefit: 'Auditable record accuracy. Instant validation against CBSE strands, NEP 2020 mandates, and Khelo India criteria.', color: 'bg-rose-500/5 text-rose-700' },
            ].map((role, idx) => (
              <div key={idx} className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${role.color}`}>{role.role}</span>
                <h4 className="text-xl font-black uppercase text-slate-900 pt-2">{role.title}</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">{role.benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: Interactive Real Output Previews */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest text-center">📄 Real Product Output Previews</h3>
          <div className="bg-slate-950 border-4 border-slate-900 rounded-[2.5rem] p-6 text-white space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">Click below to review real system deliverables</span>
                <h4 className="text-lg font-black uppercase">Document & Report Previews</h4>
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'lesson', label: '📄 AI Lesson Plan' },
                  { id: 'rubric', label: '📋 CBSE Skill Rubric' },
                  { id: 'report', label: '📊 Student Report' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSampleOutputTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                      sampleOutputTab === tab.id
                        ? 'bg-[#FF6B00] text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                        : 'bg-slate-900 text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Sandbox Showcase */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[250px] flex flex-col justify-between">
              {sampleOutputTab === 'lesson' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-mono border-b border-slate-800 pb-2 text-slate-400">
                    <span>DOCUMENT ID: SMP-LP-8427</span>
                    <span>STANDARDS: CBSE HPE STRAND 1 (GAMES)</span>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-base font-black text-white uppercase">TOPIC: Football Dribbling & Ball Control Basics (Grade 7)</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Objectives:</strong> Students will learn ball handling mechanics with inside and outside edges of the foot, maintaining close control within a 10m grid.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[#FF6B00] font-black uppercase text-[9px]">Warm-Up (10 Mins)</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Jogging with dynamic joint circles; slow-paced ball-taps.</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-indigo-400 font-black uppercase text-[9px]">Main Practice (20 Mins)</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Slalom dribbling between 6 cones set 1.5m apart. 3 sets each foot.</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-emerald-400 font-black uppercase text-[9px]">Cool-down (10 Mins)</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Lower back static stretches; peer feedback & score logging.</p>
                    </div>
                  </div>
                </div>
              )}

              {sampleOutputTab === 'rubric' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-mono border-b border-slate-800 pb-2 text-slate-400">
                    <span>RUBRIC ID: SMP-RB-9941</span>
                    <span>CURRICULUM ALIGNED: HIGH SCHOOL PRACTICAL EXAM</span>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-base font-black text-white uppercase">CBSE Physical Education Rubric: Basketball (Class 12)</h5>
                    <p className="text-xs text-slate-400">Certified practical grading parameters distributed across customized student skills.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="text-slate-500 font-black uppercase border-b border-slate-800 pb-1">
                          <th>Parameter Checked</th>
                          <th>Excellent (4-5 pts)</th>
                          <th>Proficient (2-3 pts)</th>
                          <th>Beginner (0-1 pts)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr>
                          <td className="py-2 font-black text-white">Ball Handling</td>
                          <td className="py-2">Clean finger-tip control, eyes up, fluid speed changes.</td>
                          <td className="py-2">Palms ball occasionally, eyes glued to the court.</td>
                          <td className="py-2">Loses control frequently, cannot dribble in motion.</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-black text-white">Shooting Form</td>
                          <td className="py-2">Perfect elbow tuck, high release angle, smooth wrist snap.</td>
                          <td className="py-2">Inconsistent guide-hand usage, flat ball arc.</td>
                          <td className="py-2">Pushes ball from chest, lacks lower-body integration.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {sampleOutputTab === 'report' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-mono border-b border-slate-800 pb-2 text-slate-400">
                    <span>REPORT ID: SMP-REP-003</span>
                    <span>STUDENT CARD: INDIVIDUAL KHELO INDIA PROFILE</span>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs uppercase">KD</div>
                    <div>
                      <h5 className="text-sm font-black text-white uppercase">Student: Kabir Dutt (Class 8-A, Roll 12)</h5>
                      <p className="text-[10px] text-slate-400">Academic Year: 2026-27 &bull; Stamped by smartpeindia</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 font-black text-[9px] uppercase">Baseline (July)</span>
                      <p className="text-sm font-black text-slate-200 mt-1">Sit & Reach: 14 cm</p>
                      <p className="text-[10px] text-[#FF6B00] font-bold">BMI Zone: Obese</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 font-black text-[9px] uppercase">Midline (Nov)</span>
                      <p className="text-sm font-black text-slate-200 mt-1">Sit & Reach: 16.5 cm</p>
                      <p className="text-[10px] text-emerald-400 font-bold">BMI Zone: Overweight</p>
                    </div>
                    <div className="p-2.5 bg-[#10B981]/10 border border-emerald-500/20 rounded-lg">
                      <span className="text-emerald-400 font-black text-[9px] uppercase">Year-End (March)</span>
                      <p className="text-sm font-black text-white mt-1">Sit & Reach: 19.2 cm</p>
                      <p className="text-[10px] text-emerald-400 font-bold">BMI Zone: Healthy BMI ✓</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Part 3: Testimonials & Case Studies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 pt-4 border-t-2 border-dashed border-slate-200">
          {[
            { quote: "smartpeindia transformed our PE department completely. Submitting accurate student fitness data to the CBSE and Khelo India portal took days of excel spreadsheet entry — now it takes 15 seconds.", author: "L. Samy, Director of Physical Education", school: "Delhi Public School, New Delhi" },
            { quote: "Having all physical literacy metrics, lesson schedules, inventory alerts, and medical history sheets in a single dashboard is exactly what modern schools need. Absolute game changer.", author: "Mr. Devanshu Malhotra, Department Head", school: "Army Public School, Pune" },
            { quote: "We mapped our full 40-week progressive multi-sport curriculum inside smartpeindia in minutes. The compliance auditor was highly impressed with our transparent, verifiable records.", author: "Ms. Priya Nair, Lead Physical Educator", school: "The Doon School, Dehradun" },
          ].map((testimonial, idx) => (
            <div key={idx} className="bg-slate-50 border-4 border-slate-900 rounded-[2rem] p-6 space-y-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <p className="text-xs text-slate-600 font-semibold italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-black uppercase text-slate-900">{testimonial.author}</p>
                <p className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider">{testimonial.school}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity / History */}
      <section className="max-w-4xl mx-auto">
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b-4 border-slate-900 pb-6">
            <h3 className="text-4xl font-black uppercase tracking-tight text-slate-900">Recent Activity</h3>
            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 hover:text-indigo-700">Audit Log</button>
          </div>
          
          <div className="space-y-6">
            {history.length === 0 ? (
              <div className="p-20 bg-white rounded-[3rem] border-4 border-slate-900 border-dashed text-center">
                <Clock className="mx-auto text-slate-200 mb-6" size={64} />
                <p className="text-slate-400 font-black text-xl uppercase tracking-tight">No activity recorded</p>
              </div>
            ) : (
              <AnimatePresence>
                {history.slice(0, 5).map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => {
                      if (item.type === 'Lesson Plan') onNavigate?.('planner');
                      if (item.type === 'Theory') onNavigate?.('theory');
                      if (item.type === 'Skill') onNavigate?.('skillmastery');
                      if (item.type === 'Tool') onNavigate?.('fitness');
                    }}
                    className="group bg-white p-8 rounded-[2rem] border-4 border-slate-900 hover:shadow-[12px_12px_0px_0px_rgba(79,70,229,0.2)] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-8">
                      <div className="p-5 bg-slate-900 text-white rounded-2xl group-hover:bg-indigo-600 transition-colors">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{item.title}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {item.type === 'TestPaper' ? 'Question Paper (CBSE)' : item.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-600 transition-colors">Open Resource</span>
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-4 text-slate-200 hover:text-white hover:bg-rose-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border-2 border-transparent hover:border-slate-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
    