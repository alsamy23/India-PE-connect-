
import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Sparkles, 
  LayoutDashboard, 
  Search,
  Bell,
  Menu,
  X,
  Dumbbell,
  Target,
  ShieldCheck,
  TrendingUp,
  Wrench
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CurriculumHub from './components/CurriculumHub';
import AIPlanner from './components/AIPlanner';
import Networking from './components/Networking';
import SkillMastery from './components/SkillMastery';
import ComplianceAdvisor from './components/ComplianceAdvisor';
import AIToolCenter from './components/AIToolCenter';

type Tab = 'dashboard' | 'curriculum' | 'planner' | 'networking' | 'skillmastery' | 'compliance' | 'tools';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('tools');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'tools', name: 'AI Tool Center', icon: Wrench },
    { id: 'planner', name: 'Lesson Architect', icon: Sparkles },
    { id: 'skillmastery', name: 'Skill Progressions', icon: Target },
    { id: 'compliance', name: 'State Compliance', icon: ShieldCheck },
    { id: 'curriculum', name: 'Library Hub', icon: BookOpen },
    { id: 'networking', name: 'Coach Community', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden h-screen">
      <header className="md:hidden bg-indigo-700 text-white p-4 flex justify-between items-center z-50 shadow-lg">
        <div className="flex items-center space-x-2">
          <Dumbbell className="w-8 h-8 text-orange-400" />
          <span className="font-bold text-xl tracking-tight">India PE Connect</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:flex items-center space-x-4 border-b border-indigo-800/50">
          <div className="p-2.5 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl leading-tight uppercase tracking-tighter">India PE</h1>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Mastery Edition</p>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-600/20 scale-[1.02]' 
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}
              `}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-indigo-400'} />
              <span className="font-bold text-sm tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-indigo-950/50 backdrop-blur-md">
          <div className="bg-indigo-800/40 rounded-3xl p-4 flex items-center space-x-3">
            <img src="https://picsum.photos/seed/coach/100" className="w-12 h-12 rounded-2xl border-2 border-indigo-400/50 object-cover" alt="Coach" />
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate leading-none mb-1">Coach Rajesh</p>
              <div className="flex items-center text-[10px] text-indigo-300 font-bold">
                <TrendingUp size={10} className="mr-1 text-emerald-400" /> FREE PRO ACCESS
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-10">
          <div className="animate-in fade-in duration-700">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'tools' && <AIToolCenter />}
            {activeTab === 'curriculum' && <CurriculumHub />}
            {activeTab === 'planner' && <AIPlanner />}
            {activeTab === 'skillmastery' && <SkillMastery />}
            {activeTab === 'compliance' && <ComplianceAdvisor />}
            {activeTab === 'networking' && <Networking />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
