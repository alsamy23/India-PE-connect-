
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
      <section className="bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden border-4 border-slate-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="inline-flex items-center px-4 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">New Teacher Guide</div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Welcome to smartpeindia</h3>
              <p className="text-slate-400 text-sm max-w-md font-medium">Follow these 3 steps to streamline your PE department today.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1 max-w-3xl">
              {[
                { step: '01', title: 'Setup Planner', desc: 'Map your yearly curriculum.', tab: 'yearly' },
                { step: '02', title: 'Question Paper', desc: 'CBSE Question papers.', tab: 'testpaper' },
                { step: '03', title: 'Record Tests', desc: 'Track Fitness/Khelo results.', tab: 'fitness' }
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => onNavigate?.(item.tab)}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left animate-pulse-subtle"
                >
                  <div className="text-2xl font-black text-indigo-500 opacity-50">{item.step}</div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">{item.title}</h4>
                    <p className="text-[9px] text-slate-400 leading-tight font-medium">{item.desc}</p>
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

      {/* Split Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center overflow-hidden rounded-[2rem] md:rounded-[4rem] bg-white border-2 border-slate-900 p-6 md:p-20 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)] md:shadow-[16px_16px_0px_0px_rgba(15,23,42,0.05)]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        
        <div className="relative z-10 space-y-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-3 bg-slate-900 text-white rounded-full px-6 py-2 shadow-lg"
          >
            <Sparkles size={16} className="text-[#FF6B00]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">smartpeindia v4.0</span>
          </motion.div>
          
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.85] text-slate-900 uppercase"
            >
              MOVE. TRACK. <br/>
              <span className="text-[#005BFF]">GROW.</span> <br/>
              <span className="text-[#FF6B00]">TOGETHER.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-slate-500 max-w-xl leading-relaxed font-medium"
            >
              The ultimate AI architect for Physical Education in India. Fully aligned with <span className="text-slate-900 font-black underline decoration-[#005BFF]">CBSE</span>, <span className="text-slate-900 font-black underline decoration-[#FF6B00]">NEP 2020</span>, and <span className="text-slate-900 font-black underline decoration-indigo-500">Khelo India</span>.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6"
          >
            <button 
              onClick={() => onNavigate?.('planner')}
              className="group w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 bg-[#001D3D] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-[#005BFF] hover:-translate-y-1 active:translate-y-0 shadow-[8px_8px_0px_0px_rgba(0,91,255,0.2)]"
            >
              <span className="flex items-center justify-center space-x-3">
                <span>Start Planning</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={() => onNavigate?.('theory')}
              className="w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              View Resources
            </button>
          </motion.div>
          
          <div className="pt-8 border-t border-slate-100 italic font-medium text-slate-400 text-xs">
            "Reimagining PE for the modern Indian classroom. Built with passion for teachers."
          </div>
        </div>

        {/* Right Side - Interactive Sports Animation Area */}
        <div className="relative h-[600px] hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-50 rounded-[3rem] border-2 border-slate-900/5 rotate-3"></div>
          <div className="absolute inset-0 bg-white rounded-[3rem] border-2 border-slate-900 -rotate-3 overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
               
               {/* Floating Elements (Background) */}
               <div className="absolute inset-0 pointer-events-none">
                 {/* Soccer Ball */}
                 <motion.div 
                   animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: 360 }}
                   transition={{ duration: 6, repeat: Infinity }}
                   className="absolute top-20 left-20 text-slate-400"
                 >
                   <Activity size={40} className="opacity-20" />
                 </motion.div>

                 {/* Drone/Tracking Point */}
                 <motion.div 
                   animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute bottom-40 right-20 text-[#005BFF]"
                 >
                   <div className="w-4 h-4 rounded-full bg-[#005BFF] animate-ping" />
                 </motion.div>

                 {/* Whistle */}
                 <motion.div 
                   animate={{ rotate: [-10, 10, -10] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute top-1/4 right-1/4 text-[#FF6B00] opacity-30"
                 >
                   <Trophy size={48} />
                 </motion.div>

                 {/* Stopwatch */}
                 <motion.div 
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="absolute bottom-20 left-1/4 text-indigo-400 opacity-20"
                 >
                   <Timer size={56} />
                 </motion.div>
               </div>

               <motion.div 
                animate={{ scale: [0.95, 1, 0.95], y: [-10, 10, -10] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
               >
                 <Logo showText={false} className="scale-[4] mb-20" />
               </motion.div>

               <div className="space-y-4 pt-12 relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#005BFF]">Next-Gen PE OS</p>
                 <div className="flex flex-wrap justify-center gap-3">
                   {['Curriculum', 'Data', 'AI', 'Reports'].map(tag => (
                     <span key={tag} className="px-4 py-2 bg-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-[#001D3D] border border-slate-200">
                       {tag}
                     </span>
                   ))}
                 </div>
               </div>

               {/* Grid Overlay */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
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
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">Classroom <br/> <span className="text-slate-300">Excellence.</span></h2>
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
              className="lg:col-span-2 group bg-slate-900 text-white rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(79,70,229,0.3)] transition-all cursor-pointer relative overflow-hidden"
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
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">Fitness <br/> <span className="text-slate-300">Metrology.</span></h2>
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
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">03. ADMIN & COMMUNICATE</p>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">Bureaucracy <br/> <span className="text-slate-300">Automated.</span></h2>
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
    