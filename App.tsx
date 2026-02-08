import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Sparkles, 
  LayoutDashboard, 
  Menu,
  X,
  Dumbbell,
  Target,
  ShieldCheck,
  TrendingUp,
  Wrench,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import CurriculumHub from './components/CurriculumHub.tsx';
import AIPlanner from './components/AIPlanner.tsx';
import Networking from './components/Networking.tsx';
import SkillMastery from './components/SkillMastery.tsx';
import ComplianceAdvisor from './components/ComplianceAdvisor.tsx';
import AIToolCenter from './components/AIToolCenter.tsx';

type Tab = 'dashboard' | 'curriculum' | 'planner' | 'networking' | 'skillmastery' | 'compliance' | 'tools';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'missing'>('checking');

  useEffect(() => {
    // Check if API key is injected correctly
    if (process.env.API_KEY && process.env.API_KEY.length > 10) {
      setApiStatus('ok');
    } else {
      setApiStatus('missing');
    }
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', name: 'Lesson Architect', icon: Sparkles },
    { id: 'tools', name: 'AI Tool Center', icon: Wrench },
    { id: 'skillmastery', name: 'Skill Progressions', icon: Target },
    { id: 'compliance', name: 'State Compliance', icon: ShieldCheck },
    { id: 'curriculum', name: 'Library Hub', icon: BookOpen },
    { id: 'networking', name: 'Coach Community', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden h-screen">
      {/* Mobile Header */}
      <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center z-50 shadow-xl">
        <div className="flex items-center space-x-2">
          <Dumbbell className="w-8 h-8 text-orange-400" />
          <span className="font-black text-lg tracking-tighter uppercase">India PE</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Navigation Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 text-white transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-slate-800
      `}>
        <div className="p-8 hidden md:flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-600/20 rotate-3">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-black text-2xl leading-none uppercase tracking-tighter">India PE</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Connect Platform</p>
          </div>
        </div>

        {/* API Status Badge */}
        <div className="mx-6 mb-4">
          {apiStatus === 'missing' ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Config Required</p>
                <p className="text-[9px] text-slate-400 font-medium">Add API_KEY to Vercel</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500 animate-pulse">
                <Wifi size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">AI Active</p>
                <p className="text-[9px] text-slate-400 font-medium">Gemini Pro connected</p>
              </div>
            </div>
          )}
        </div>

        <nav className="mt-4 px-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-white text-slate-900 shadow-2xl shadow-white/5 scale-[1.02] font-black' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white font-bold'}
              `}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-500'} />
              <span className="text-sm tracking-wide">{item.name}</span>
              {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
            </button>
          ))}
        </nav>

        {/* Profile Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-[2rem] p-4 flex items-center space-x-4">
            <div className="relative">
              <img src="https://picsum.photos/seed/coach/100" className="w-12 h-12 rounded-2xl border-2 border-indigo-500/30 object-cover" alt="Coach" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate leading-none mb-1">Coach Rajesh</p>
              <div className="flex items-center text-[10px] text-slate-500 font-bold">
                <TrendingUp size={10} className="mr-1 text-emerald-500" /> VERCEL PRO ACCESS
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-full">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'tools' && <AIToolCenter />}
          {activeTab === 'curriculum' && <CurriculumHub />}
          {activeTab === 'planner' && <AIPlanner />}
          {activeTab === 'skillmastery' && <SkillMastery />}
          {activeTab === 'compliance' && <ComplianceAdvisor />}
          {activeTab === 'networking' && <Networking />}
        </div>
      </main>
    </div>
  );
};

export default App;