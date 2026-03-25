
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
  Microscope
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storageService, SavedItem } from '../services/storageService.ts';

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
    <div className="space-y-16 animate-slide-up pb-20">
      {/* Editorial Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden rounded-[3rem] bg-slate-950 text-white p-8 md:p-20 shadow-2xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 backdrop-blur-xl">
              <Sparkles size={16} className="text-orange-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">The Future of PE Education</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              Plan <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Smarter.</span> <br/>
              Teach <br/>
              <span className="text-indigo-400">Better.</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
              SmartPE India is the first integrated digital platform built exclusively for Physical Education professionals in India. Empowering 2,500+ educators.
            </p>
            
            <div className="flex flex-wrap gap-6 pt-4">
              <button 
                onClick={() => onNavigate?.('planner')}
                className="group relative px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center space-x-3">
                  <Sparkles size={18} />
                  <span>Get Started Free</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={() => onNavigate?.('theory')}
                className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center space-x-3 backdrop-blur-sm"
              >
                <GraduationCap size={18} />
                <span>Explore Theory</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative z-10 bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Lesson Preview</div>
              </div>
              
              <div className="space-y-6">
                <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                <div className="h-4 bg-white/5 rounded-full w-full"></div>
                <div className="h-4 bg-white/5 rounded-full w-5/6"></div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="h-20 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 flex items-center justify-center">
                    <Target className="text-indigo-400" />
                  </div>
                  <div className="h-20 bg-orange-500/20 rounded-2xl border border-orange-500/30 flex items-center justify-center">
                    <Trophy className="text-orange-400" />
                  </div>
                  <div className="h-20 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 flex items-center justify-center">
                    <Activity className="text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-10 -right-10 bg-white text-slate-950 p-6 rounded-3xl shadow-2xl animate-bounce-slow">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Active Users</p>
              <p className="text-3xl font-black">2.5k+</p>
            </div>
            <div className="absolute -bottom-10 -left-10 bg-orange-500 text-white p-6 rounded-3xl shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Success Rate</p>
              <p className="text-3xl font-black">98%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">The Ecosystem</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Everything you need <br/>
              <span className="text-slate-400">in one place.</span>
            </h2>
          </div>
          <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
            From curriculum planning to biomechanics analysis, we provide the tools to elevate your teaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Big Feature Card */}
          <div 
            onClick={() => onNavigate?.('planner')}
            className="md:col-span-2 group relative bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                <Sparkles size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">AI Lesson Planner</h3>
                <p className="text-slate-500 font-medium max-w-md">Generate comprehensive, board-compliant lesson plans in seconds. Tailored for CBSE, ICSE, and State Boards.</p>
              </div>
              <div className="flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                <span>Try Planner</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>

          {/* Small Feature Card */}
          <div 
            onClick={() => onNavigate?.('theory')}
            className="group bg-slate-900 text-white rounded-[2.5rem] p-10 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <GraduationCap size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Theory Master</h3>
              <p className="text-slate-400 text-sm font-medium">MCQs, Case Studies, and Notes for CBSE Physical Education.</p>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

          {/* Another Small Feature Card */}
          <div 
            onClick={() => onNavigate?.('biomechanics')}
            className="group bg-orange-500 text-white rounded-[2.5rem] p-10 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Microscope size={32} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">Visual Physics</h3>
              <p className="text-orange-100 text-sm font-medium">Understand the biomechanics of sports through visual AI analysis.</p>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

          {/* Wide Feature Card */}
          <div 
            onClick={() => onNavigate?.('fitness')}
            className="md:col-span-2 group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col md:flex-row items-center gap-10"
          >
            <div className="w-full md:w-1/3 h-48 bg-slate-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
              <Activity size={64} className="text-indigo-600 relative z-10" />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Fitness Assessments</h3>
              <p className="text-slate-500 font-medium">Track student progress with Khelo India battery tests and automated reporting.</p>
              <div className="flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                <span>Start Assessment</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Social Proof */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-slate-200">
        {[
          { label: 'Educators', value: '2.5k+', icon: Users },
          { label: 'Resources', value: '500+', icon: FileText },
          { label: 'Success Rate', value: '98%', icon: Trophy },
          { label: 'AI Models', value: '3+', icon: Sparkles },
        ].map((stat, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="flex justify-center text-slate-300 mb-2">
              <stat.icon size={20} />
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Recent Activity / History */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase tracking-tight">Recent History</h3>
            <button className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.length === 0 ? (
              <div className="col-span-2 p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <Clock className="mx-auto text-slate-300 mb-4" size={32} />
                <p className="text-slate-400 font-bold">No saved items yet. Start creating to see them here.</p>
              </div>
            ) : (
              history.slice(0, 4).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'Lesson Plan') onNavigate?.('planner');
                    if (item.type === 'Theory') onNavigate?.('theory');
                    if (item.type === 'Skill') onNavigate?.('skillmastery');
                    if (item.type === 'Tool') onNavigate?.('fitness');
                  }}
                  className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 truncate max-w-[150px]">{item.title}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.type}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Community / Network */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Users size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Join the <br/>Community</h3>
            <p className="text-indigo-100 font-medium text-sm leading-relaxed">Connect with 2,500+ PE teachers across India. Share resources, ideas, and grow together.</p>
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center font-black text-[10px]">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white text-indigo-600 flex items-center justify-center font-black text-[10px]">
                +2k
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('networking')}
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
            >
              Join Network
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
    