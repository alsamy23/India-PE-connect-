
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
  Dumbbell
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
      <section className="relative min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center overflow-hidden rounded-[4rem] bg-white border-2 border-slate-900 p-8 md:p-20 shadow-[16px_16px_0px_0px_rgba(15,23,42,0.05)]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        
        <div className="relative z-10 space-y-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-3 bg-slate-900 text-white rounded-full px-6 py-2 shadow-lg"
          >
            <Sparkles size={16} className="text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Smarty India v4.0</span>
          </motion.div>
          
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900 uppercase"
            >
              Smart <br/>
              <span className="text-indigo-600">PE.</span> <br/>
              <span className="text-orange-500">Smarty India.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl text-slate-500 max-w-xl leading-relaxed font-medium"
            >
              The intelligent hub for India's Physical Education professionals. Plan smarter, teach better, and lead with AI-driven insights.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-6"
          >
            <button 
              onClick={() => onNavigate?.('planner')}
              className="group px-12 py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-600 hover:-translate-y-1 active:translate-y-0 shadow-[8px_8px_0px_0px_rgba(79,70,229,0.3)]"
            >
              <span className="flex items-center space-x-3">
                <span>Start Planning</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={() => onNavigate?.('theory')}
              className="px-12 py-6 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-slate-900 pb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">The Core Modules</p>
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
              Specialist <br/>
              <span className="text-slate-300">Infrastructure.</span>
            </h2>
          </motion.div>
          <p className="text-slate-500 max-w-sm font-black text-xs uppercase tracking-widest leading-relaxed italic opacity-50">
            "Professional grade tools for the modern Physical Education department."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* AI Planner - Large Card */}
          <motion.div 
            whileHover={{ y: -10, x: 10 }}
            onClick={() => onNavigate?.('planner')}
            className="md:col-span-2 group bg-slate-900 text-white rounded-[3rem] p-12 hover:shadow-[20px_20px_0px_0px_rgba(79,70,229,0.3)] transition-all cursor-pointer overflow-hidden relative border-4 border-slate-900"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={160} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Sparkles size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black uppercase tracking-tight">AI Lesson Architect</h3>
                <p className="text-slate-400 font-medium text-lg">Generate board-compliant curriculum plans in seconds. Tailored for CBSE, ICSE, and State Boards.</p>
              </div>
              <div className="flex items-center space-x-3 text-indigo-400 font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                <span>Enter Module</span>
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Theory Hub */}
          <motion.div 
            whileHover={{ y: -10, x: 10 }}
            onClick={() => onNavigate?.('theory')}
            className="group bg-white border-4 border-slate-900 rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(244,63,94,0.3)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Theory Master</h3>
              <p className="text-slate-500 text-sm font-medium">MCQs, Case Studies, and Notes for CBSE Physical Education.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Biomechanics */}
          <motion.div 
            whileHover={{ y: -10, x: 10 }}
            onClick={() => onNavigate?.('biomechanics')}
            className="group bg-emerald-500 border-4 border-slate-900 text-white rounded-[3rem] p-10 hover:shadow-[12px_12px_0px_0px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Microscope size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Visual Physics</h3>
              <p className="text-emerald-100 text-sm font-medium">Understand the biomechanics of sports through visual AI analysis.</p>
              <div className="w-12 h-12 rounded-2xl border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-all">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Fitness Tests - Wide Card */}
          <motion.div 
            whileHover={{ y: -10, x: 10 }}
            onClick={() => onNavigate?.('fitness')}
            className="md:col-span-4 group bg-white border-4 border-slate-900 rounded-[3rem] p-12 hover:shadow-[24px_24px_0px_0px_rgba(79,70,229,0.1)] transition-all cursor-pointer flex flex-col md:flex-row items-center gap-16"
          >
            <div className="w-full md:w-1/3 h-64 bg-slate-900 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden border-4 border-slate-900 shadow-xl">
              <Activity size={80} className="text-indigo-400 relative z-10" />
              <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>
            <div className="flex-1 space-y-6 text-left">
              <div className="inline-flex px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">New Module</div>
              <h3 className="text-5xl font-black text-slate-900 uppercase tracking-tight">Fitness Assessments</h3>
              <p className="text-slate-500 font-medium text-xl leading-relaxed">Track student progress with Khelo India battery tests and automated reporting. Professional analytics for every student.</p>
              <div className="flex items-center space-x-3 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                <span>Begin Assessment</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats - Brutalist Look */}
      <section className="py-24 bg-slate-900 text-white rounded-[4rem] border-4 border-slate-900 shadow-[20px_20px_0px_0px_rgba(15,23,42,0.1)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 px-12 md:px-20">
          {[
            { label: 'Active Educators', value: '2.5k+', icon: Users, color: 'text-indigo-400' },
            { label: 'Digital Resources', value: '500+', icon: FileText, color: 'text-emerald-400' },
            { label: 'Platform Success', value: '98%', icon: Trophy, color: 'text-amber-400' },
            { label: 'AI Intelligence', value: 'v3.1', icon: Sparkles, color: 'text-rose-400' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4 border-l-2 border-white/10 pl-8"
            >
              <div className={`${stat.color} mb-4`}>
                <stat.icon size={40} />
              </div>
              <p className="text-6xl font-black tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity / History - Brutalist List Look */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-10">
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

        {/* Community / Network - Bold Sidebar Look */}
        <motion.div 
          whileHover={{ y: -10, x: 10 }}
          className="bg-indigo-600 rounded-[3rem] p-12 text-white space-y-10 relative overflow-hidden flex flex-col justify-between border-4 border-slate-900 shadow-[16px_16px_0px_0px_rgba(79,70,229,0.3)]"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Users size={160} />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="w-20 h-20 bg-white text-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
              <Users size={40} />
            </div>
            <h3 className="text-5xl font-black uppercase tracking-tight leading-[0.9]">Professional <br/>Network.</h3>
            <p className="text-indigo-100 font-medium text-lg leading-relaxed">Connect with 2,500+ PE teachers across India. Peer-to-peer resource sharing and growth.</p>
            <div className="flex -space-x-4">
              {[1,2,3,4,5].map(i => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -8, zIndex: 20 }}
                  className="w-14 h-14 rounded-2xl border-4 border-slate-900 bg-white text-slate-900 flex items-center justify-center font-black text-sm shadow-2xl"
                >
                  {String.fromCharCode(64 + i)}
                </motion.div>
              ))}
              <div className="w-14 h-14 rounded-2xl border-4 border-slate-900 bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-2xl">
                +2k
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate?.('networking')}
            className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-2xl relative z-10 border-4 border-slate-900"
          >
            Join the Network
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default Dashboard;
    