
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
  Book
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
      default: return <Wrench className="text-slate-500" />;
    }
  };
  return (
    <div className="space-y-10 animate-slide-up">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 rounded-[3rem] overflow-hidden p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-800/50 border border-indigo-700 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Sparkles size={14} className="text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">AI-Powered for PE Teachers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">
            Plan Smarter. <span className="text-orange-400">Teach Better.</span> <br/>
            <span className="text-indigo-300">Lead Stronger.</span>
          </h1>
          <p className="text-indigo-100 text-lg mb-8 leading-relaxed font-medium">
            SmartPE India is the first integrated digital platform built exclusively for Physical Education professionals in India.
          </p>
          
          <div className="flex flex-wrap gap-4">
             <button 
                onClick={() => onNavigate?.('theory')}
                className="px-8 py-4 bg-orange-400 text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-300 transition-all flex items-center space-x-2 shadow-xl shadow-orange-500/20"
              >
                <GraduationCap size={18} />
                <span>Theory Master (CBSE)</span>
                <ArrowRight size={16} />
              </button>
              
              <button 
                onClick={() => onNavigate?.('planner')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center space-x-2"
              >
                <Sparkles size={18} />
                <span>AI Lesson Planner</span>
              </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-400/10 rounded-full blur-[80px]"></div>
      </div>

      {apiStatus !== 'ok' && (
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight">AI Connection Required</h4>
              <p className="text-sm text-slate-400 font-medium">Configure your Gemini API key to unlock full AI capabilities.</p>
            </div>
          </div>
          <button 
            onClick={() => (window as any).aistudio?.openSelectKey()}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Connect Now
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Teachers', value: '2,450', icon: Users, color: 'bg-blue-100 text-blue-600' },
          { label: 'Curriculum Docs', value: '458', icon: FileText, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Upcoming Meets', value: '12', icon: Calendar, color: 'bg-orange-100 text-orange-600' },
          { label: 'Video Drills', value: '89', icon: Video, color: 'bg-purple-100 text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Network Activity</h3>
            <select className="text-sm border rounded-lg px-2 py-1 outline-none text-slate-500 bg-slate-50">
              <option>This Week</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="connections" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent History Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="text-indigo-600" />
            <h3 className="font-bold text-lg">Recent History</h3>
          </div>
          
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 text-xs font-medium">No saved items yet.</p>
              </div>
            ) : (
              history.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-100"
                  onClick={() => {
                    if (item.type === 'Lesson Plan') onNavigate?.('planner');
                    if (item.type === 'Theory') onNavigate?.('theory');
                    if (item.type === 'Skill') onNavigate?.('skillmastery');
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 truncate max-w-[120px]">{item.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
          
          {history.length > 5 && (
            <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-500 transition-all">
              View Full History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
    