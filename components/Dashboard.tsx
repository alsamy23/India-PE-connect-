
import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Video, 
  Calendar,
  ChevronRight,
  Trophy,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', connections: 4 },
  { name: 'Tue', connections: 7 },
  { name: 'Wed', connections: 5 },
  { name: 'Thu', connections: 12 },
  { name: 'Fri', connections: 8 },
  { name: 'Sat', connections: 15 },
  { name: 'Sun', connections: 10 },
];

const Dashboard: React.FC<{ apiStatus?: 'checking' | 'ok' | 'missing' }> = ({ apiStatus }) => {
  return (
    <div className="space-y-10 animate-slide-up">
      {/* API Setup Alert */}
      {apiStatus === 'missing' && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-orange-200/20 relative overflow-hidden">
          <div className="relative z-10 flex items-center space-x-6 mb-6 md:mb-0">
            <div className="p-4 bg-orange-500 rounded-[1.5rem] text-white shadow-lg shadow-orange-500/40 animate-pulse">
              <Sparkles size={32} />
            </div>
            <div>
              <h3 className="font-black text-2xl text-orange-900 uppercase tracking-tight leading-none mb-2">AI Activation Required</h3>
              <p className="text-sm text-orange-700 font-bold max-w-md leading-relaxed">
                Your API key is missing or not yet detected. To enable AI lesson planning, please click "Connect Now" or add <code className="bg-orange-200/50 px-1 rounded text-orange-900">GEMINI_API_KEY</code> to your environment.
              </p>
            </div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => (window as any).aistudio?.openSelectKey()}
              className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/30 active:scale-95"
            >
              Connect Now
            </button>
          </div>
          
          {/* Decorative background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        </div>
      )}

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {[
              "Create curriculum-aligned lesson plans in minutes.",
              "Access expert-led PE certification courses.",
              "Track student fitness and assessment data effortlessly.",
              "Collaborate with a growing national PE community."
            ].map((feature, i) => (
              <div key={i} className="flex items-start space-x-3 group">
                <div className="mt-1 p-1 bg-orange-400 rounded-full group-hover:scale-110 transition-transform">
                  <Sparkles size={10} className="text-indigo-900" />
                </div>
                <p className="text-sm text-indigo-50 font-medium">{feature}</p>
              </div>
            ))}
          </div>

          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
            <p className="text-sm font-bold tracking-wide text-orange-400 uppercase">
              Less paperwork. More performance. Greater impact.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-400/10 rounded-full blur-[80px]"></div>
      </div>

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

        {/* Top Contributors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="text-orange-500" />
            <h3 className="font-bold text-lg">Top Contributors</h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Dr. Amit Sharma', school: 'DPS Bangalore', points: '1.2k', avatar: 'https://picsum.photos/seed/am/100' },
              { name: 'Sunita Mehra', school: 'KV Delhi', points: '980', avatar: 'https://picsum.photos/seed/sm/100' },
              { name: 'Pritam Singh', school: 'SJS Punjab', points: '850', avatar: 'https://picsum.photos/seed/ps/100' },
              { name: 'Anjali Das', school: 'St. Xavier Kolkata', points: '720', avatar: 'https://picsum.photos/seed/ad/100' },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="font-semibold text-sm group-hover:text-indigo-600">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.school}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-600">{user.points} pts</p>
                  <ChevronRight size={14} className="ml-auto text-slate-300" />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-all">
            View All Contributors
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
    