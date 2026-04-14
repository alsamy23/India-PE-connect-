
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
  Zap
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
      default: return <Wrench className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      {/* Split Hero Section - Brutalist / Editorial Look */}
      <section className="relative min-h-[60vh] lg:min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center overflow-hidden rounded-[2rem] md:rounded-[4rem] bg-white border-2 border-slate-900 p-6 md:p-20 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)] md:shadow-[16px_16px_0px_0px_rgba(15,23,42,0.05)]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        
        <div className="relative z-10 space-y-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-3 bg-slate-900 text-white rounded-full px-6 py-2 shadow-lg"
          >
            <Sparkles size={16} className="text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">SmartPE India v4.0</span>
          </motion.div>
          
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900 uppercase"
            >
              Smart <br/>
              <span className="text-indigo-600">PE.</span> <br/>
              <span className="text-orange-500">SmartPE India.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-slate-500 max-w-xl leading-relaxed font-medium"
            >
              The ultimate AI-powered architect for Physical Education in India. Plan smarter, teach better, and lead with precision.
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
              className="group w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-600 hover:-translate-y-1 active:translate-y-0 shadow-[8px_8px_0px_0px_rgba(79,70,229,0.3)]"
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
          
          <div className="flex items-center space-x-8 pt-8 opacity-50">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"></div>
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Trusted by 2,500+ Schools</p>
          </div>
        </div>

        {/* Right Side - Interactive Sports Animation Area */}
        <div className="relative h-[600px] hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-50 rounded-[3rem] border-2 border-slate-900/5 rotate-3"></div>
          <div className="absolute inset-0 bg-white rounded-[3rem] border-2 border-slate-900 -rotate-3 overflow-hidden">
            {/* Animated Sports Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Basketball */}
              <motion.div 
                animate={{ 
                  y: [0, 300, 0],
                  scale: [1, 0.9, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-20 text-orange-500"
              >
                <div className="w-24 h-24 rounded-full bg-orange-100 border-4 border-orange-500 flex items-center justify-center shadow-xl">
                  <Dumbbell size={40} className="rotate-45" />
                </div>
              </motion.div>

              {/* Tennis Ball */}
              <motion.div 
                animate={{ 
                  x: [0, 400, 0],
                  y: [0, 100, 0],
                  rotate: [0, 720]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 left-10 text-lime-500"
              >
                <div className="w-16 h-16 rounded-full bg-lime-100 border-4 border-lime-500 flex items-center justify-center shadow-lg">
                  <Activity size={24} />
                </div>
              </motion.div>

              {/* Football */}
              <motion.div 
                animate={{ 
                  x: [400, 0, 400],
                  rotate: [0, -360]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-10 text-slate-900"
              >
                <div className="w-20 h-20 rounded-full bg-white border-4 border-slate-900 flex items-center justify-center shadow-xl">
                  <Target size={32} />
                </div>
              </motion.div>

              {/* Cricket Ball */}
              <motion.div 
                animate={{ 
                  y: [400, 0, 400],
                  x: [200, 250, 200]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 right-40 text-rose-600"
              >
                <div className="w-12 h-12 rounded-full bg-rose-100 border-4 border-rose-600 flex items-center justify-center shadow-md">
                  <Trophy size={18} />
                </div>
              </motion.div>

              {/* Central Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative"
                >
                  <Logo showText={false} className="scale-[3]" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Redesign - Brutalist / High Contrast Look */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-slate-900 pb-8 md:pb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">The Core Modules</p>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
              Specialist <br/>
              <span className="text-slate-300">Infrastructure.</span>
            </h2>
          </motion.div>
          <p className="text-slate-500 max-w-sm font-black text-xs uppercase tracking-widest leading-relaxed italic opacity-50">
            "Professional grade tools for the modern Physical Education department."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 [perspective:1000px]">
          {/* PE Lesson Plan - Large Card */}
          <motion.div 
            whileHover={{ rotateY: -5, rotateX: 5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('planner')}
            className="md:col-span-2 group bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 hover:shadow-[20px_20px_0px_0px_rgba(79,70,229,0.3)] transition-all cursor-pointer overflow-hidden relative border-4 border-slate-900"
          >
            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={120} className="md:w-[160px] md:h-[160px]" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between space-y-8 md:space-y-12">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl"
            >
              <Sparkles size={32} className="md:w-[40px] md:h-[40px]" />
            </motion.div>
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight">PE Lesson Plan</h3>
                <p className="text-slate-400 font-medium text-base md:text-lg">Design board-compliant curriculum plans with precision. The ultimate architect for your PE department.</p>
              </div>
              <div className="flex items-center space-x-3 text-indigo-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                <span>Enter Module</span>
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Theory Hub */}
          <motion.div 
            whileHover={{ rotateY: 5, rotateX: 5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('theory')}
            className="md:col-span-2 group bg-white border-4 border-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(244,63,94,0.3)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg"
            >
              <GraduationCap size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Theory Master</h3>
              <p className="text-slate-500 text-sm font-medium">MCQs, Case Studies, and Notes for CBSE Physical Education.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Khelo India */}
          <motion.div 
            whileHover={{ rotateY: -5, rotateX: -5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('khelo')}
            className="group bg-orange-500 border-4 border-slate-900 text-white rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,0.3)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-white text-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Trophy size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Khelo India</h3>
              <p className="text-orange-100 text-sm font-medium">Official battery tests and student fitness profiles.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-orange-600 transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Yearly Planner */}
          <motion.div 
            whileHover={{ rotateY: 5, rotateX: -5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('yearly')}
            className="group bg-indigo-600 border-4 border-slate-900 text-white rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(79,70,229,0.3)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Calendar size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Yearly Planner</h3>
              <p className="text-indigo-100 text-sm font-medium">Long-term curriculum mapping and academic scheduling.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Test Generator */}
          <motion.div 
            whileHover={{ rotateY: -5, rotateX: 5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('testpaper')}
            className="group bg-slate-100 border-4 border-slate-900 text-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,0.1)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"
            >
              <ClipboardList size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Test Generator</h3>
              <p className="text-slate-500 text-sm font-medium">Create professional test papers and question banks instantly.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Tool Center */}
          <motion.div 
            whileHover={{ rotateY: 5, rotateX: 5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('tools')}
            className="group bg-amber-400 border-4 border-slate-900 text-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(251,191,36,0.3)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -11, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Wrench size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Tool Center</h3>
              <p className="text-amber-900 text-sm font-medium">AI-powered advisors and specialized PE utilities.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Fitness Assessments - Wide Card */}
          <motion.div 
            whileHover={{ rotateX: -5, translateZ: 30, scale: 1.01 }}
            onClick={() => onNavigate?.('school-overview')}
            className="md:col-span-4 group bg-indigo-900 border-4 border-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 hover:shadow-[24px_24px_0px_0px_rgba(79,70,229,0.2)] transition-all cursor-pointer flex flex-col md:flex-row items-center gap-8 md:gap-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            
            <div className="w-full md:w-1/3 h-48 md:h-64 bg-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center relative overflow-hidden border-4 border-slate-900 shadow-xl">
              <Activity size={60} className="md:w-[80px] md:h-[80px] text-indigo-600 relative z-10" />
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>
            
            <div className="flex-1 space-y-4 md:space-y-6 text-left relative z-10">
              <div className="inline-flex px-4 py-1 bg-white text-indigo-900 rounded-full text-[10px] font-black uppercase tracking-widest">School Fitness Management</div>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Manage Your School's <br/> Fitness Database</h3>
              <p className="text-indigo-200 font-medium text-lg md:text-xl leading-relaxed">The professional toolkit for Indian PE Teachers. Create student directories, track live results, and generate automated progress reports.</p>
              <div className="flex items-center space-x-3 text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                <span>View Guide & Setup</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Skill Mastery */}
          <motion.div 
            whileHover={{ rotateY: -5, rotateX: 5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('skillmastery')}
            className="group bg-rose-50 border-4 border-slate-900 text-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(244,63,94,0.2)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Target size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Skill Mastery</h3>
              <p className="text-slate-500 text-sm font-medium">Step-by-step progressions for technical sports skills.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Compliance */}
          <motion.div 
            whileHover={{ rotateY: 5, rotateX: 5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('compliance')}
            className="group bg-emerald-50 border-4 border-slate-900 text-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(16,185,129,0.2)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"
            >
              <ShieldCheck size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Compliance</h3>
              <p className="text-slate-500 text-sm font-medium">Ensure your curriculum meets state and board standards.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Parent Letters */}
          <motion.div 
            whileHover={{ rotateY: -5, rotateX: -5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('parentletters')}
            className="group bg-blue-50 border-4 border-slate-900 text-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(59,130,246,0.2)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Mail size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Parent Letters</h3>
              <p className="text-slate-500 text-sm font-medium">Automated communication for sports events and health.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Widgets */}
          <motion.div 
            whileHover={{ rotateY: 5, rotateX: -5, translateZ: 20, scale: 1.02 }}
            onClick={() => onNavigate?.('widgets')}
            className="group bg-purple-50 border-4 border-slate-900 text-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(168,85,247,0.2)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <motion.div 
              animate={{ y: [0, -11, 0] }}
              transition={{ duration: 3.3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Zap size={32} />
            </motion.div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Classroom Widgets</h3>
              <p className="text-slate-500 text-sm font-medium">Interactive timers, scoreboards, and group makers.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Activity / History - Brutalist List Look */}
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.type}</p>
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
    