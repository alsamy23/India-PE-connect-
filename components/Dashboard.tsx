
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const Dashboard: React.FC<{ 
  apiStatus?: 'checking' | 'ok' | 'missing' | 'quota',
  debugInfo?: any,
  onTestConnection?: () => Promise<void>,
  isTesting?: boolean,
  onNavigate?: (tab: any) => void
}> = ({ apiStatus, debugInfo, onTestConnection, isTesting, onNavigate }) => {
  const [history, setHistory] = React.useState<SavedItem[]>([]);

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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)]">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
            <Calendar size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Active Plans</p>
            <p className="text-2xl font-black text-slate-900">{history.filter(h => h.type === 'Lesson Plan').length} Planned Today</p>
          </div>
        </div>
        <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)]">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Assessments</p>
            <p className="text-2xl font-black text-slate-900">12 Pending Tasks</p>
          </div>
        </div>
        <div className="bg-indigo-600 border-4 border-slate-900 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-[8px_8px_0px_0px_rgba(79,70,229,0.1)]">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white">
            <Zap size={32} />
          </div>
          <div className="text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Quick Action</p>
            <p className="text-xs font-black uppercase">Record scores for 7B</p>
          </div>
        </div>
      </section>

      {/* Weekly PE Timetable & Calendar */}
      <section className="relative">
        <WeeklyCalendarView />
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* PE Lesson Plan */}
            <motion.div 
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
          </div>
        </section>

        {/* ASSESS Group */}
        <section className="space-y-12">
          <div className="flex items-end justify-between border-b-4 border-slate-900 pb-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">02. ASSESS</p>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">Fitness <br/> <span className="text-[#FF6B00]">Metrology.</span></h2>
              <p className="text-sm text-slate-500 font-extrabold uppercase tracking-widest mt-2 block">School Fitness Database</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* School Fitness Database */}
            <motion.div 
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Parent Letters */}
            <motion.div 
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

      {/* Why smartpeindia section - Trust Building */}
      <section className="bg-slate-50 rounded-[3rem] p-12 md:p-20 border-4 border-slate-900 border-dashed">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">Built for Indian Schools</h3>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">smartpeindia isn't just another app. It's a specialized architecture designed to meet the unique challenges of PE departments in India.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-indigo-600 font-black text-2xl tracking-tighter">CBSE/NCERT</div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Curriculum matching out of the box.</p>
            </div>
            <div className="space-y-2">
              <div className="text-orange-500 font-black text-2xl tracking-tighter">NEP 2020</div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Aligned with current education policy.</p>
            </div>
            <div className="space-y-2">
              <div className="text-rose-500 font-black text-2xl tracking-tighter">SPARKS/KHELO</div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Official fitness protocols integrated.</p>
            </div>
          </div>
          <div className="pt-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Developed in Collaboration with Top Sports Academies</p>
          </div>
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
    