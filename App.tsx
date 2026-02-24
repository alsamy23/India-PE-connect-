
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
  AlertTriangle,
  CalendarRange,
  GraduationCap,
  Trophy,
  Microscope,
  Book,
  Activity,
  Network,
  Award
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import CurriculumHub from './components/CurriculumHub.tsx';
import AIPlanner from './components/AIPlanner.tsx';
import YearlyPlanner from './components/YearlyPlanner.tsx';
import Networking from './components/Networking.tsx';
import SkillMastery from './components/SkillMastery.tsx';
import ComplianceAdvisor from './components/ComplianceAdvisor.tsx';
import AIToolCenter from './components/AIToolCenter.tsx';
import TheoryHub from './components/TheoryHub.tsx';
import KheloIndia from './components/KheloIndia.tsx';
import Biomechanics from './components/Biomechanics.tsx';
import RulesBot from './components/RulesBot.tsx';
import Disclaimer from './components/Disclaimer.tsx';

type Tab = 'dashboard' | 'curriculum' | 'planner' | 'yearly' | 'networking' | 'skillmastery' | 'compliance' | 'tools' | 'theory' | 'khelo' | 'biomechanics' | 'rules';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'missing'>('checking');
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  
  // Static Profile Data (Read-Only)
  const userProfile = {
    name: "L. Samy",
    role: "Founder & Director",
    org: "SmartPE India"
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (data.status === 'ok') {
        setApiStatus('ok');
        setIsKeyDialogOpen(false);
      } else {
        setApiStatus('missing');
        // Check if we need to open the key selection dialog
        if (window.aistudio) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            setIsKeyDialogOpen(true);
          }
        }
      }
    } catch (error) {
      console.error("Health check failed:", error);
      setApiStatus('missing');
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // After opening, we assume success and try to proceed
      setApiStatus('ok');
      setIsKeyDialogOpen(false);
      // Re-check health after a short delay to be sure
      setTimeout(checkApiStatus, 2000);
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'yearly', name: 'Yearly Planner', icon: CalendarRange },
    { id: 'planner', name: 'Lesson Planner', icon: Sparkles },
    { id: 'khelo', name: 'Khelo India Battery', icon: Trophy, isNew: true },
    { id: 'biomechanics', name: 'Visual Physics', icon: Microscope, isNew: true },
    { id: 'rules', name: 'Game Rules Bot', icon: Book, isNew: true },
    { id: 'theory', name: 'Theory Master', icon: GraduationCap },
    { id: 'tools', name: 'AI Tool Center', icon: Wrench },
    { id: 'skillmastery', name: 'Skill Progressions', icon: Target },
    { id: 'compliance', name: 'State Compliance', icon: ShieldCheck },
    { id: 'curriculum', name: 'Library Hub', icon: BookOpen },
    { id: 'networking', name: 'Coach Community', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden h-screen print:h-auto print:overflow-visible font-inter">
      {/* API Key Selection Modal */}
      {isKeyDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-slide-up">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Secure API Access</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              To enable AI-powered lesson planning and fitness assessments, please select a valid Gemini API key from your Google Cloud project.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Requirements</p>
              <ul className="text-xs text-slate-600 space-y-2 font-medium">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                  <span>Paid Google Cloud Project</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                  <span><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Billing enabled</a></span>
                </li>
              </ul>
            </div>
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              Select API Key
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center z-50 shadow-xl print:hidden">
        <div className="flex items-center space-x-2">
          <Activity className="w-8 h-8 text-orange-400" />
          <span className="font-black text-lg tracking-tighter uppercase">SmartPE India</span>
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
        print:hidden
      `}>
        <div className="p-8 hidden md:flex items-center space-x-4">
          <div className="relative">
             <div className="p-3 bg-white rounded-2xl shadow-2xl shadow-orange-600/20 rotate-3 z-10 relative">
               <Activity className="w-8 h-8 text-indigo-700" />
             </div>
             <div className="absolute inset-0 bg-orange-500 rounded-2xl -rotate-6 opacity-50"></div>
          </div>
          <div>
            <h1 className="font-black text-xl leading-none uppercase tracking-tighter">SmartPE<br/><span className="text-orange-400">India</span></h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Plan Smarter. Teach Better. Lead Stronger.</p>
          </div>
        </div>

        {/* API Status Badge */}
        <div className="mx-6 mb-4">
          {apiStatus === 'missing' ? (
            <button 
              onClick={handleSelectKey}
              className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center space-x-3 hover:bg-amber-500/20 transition-colors group"
            >
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                <AlertTriangle size={16} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Action Required</p>
                <p className="text-[9px] text-slate-400 font-medium">Click to select API Key</p>
              </div>
            </button>
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
                w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 relative
                ${activeTab === item.id 
                  ? 'bg-white text-slate-900 shadow-2xl shadow-white/5 scale-[1.02] font-black' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white font-bold'}
              `}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-500'} />
              <span className="text-sm tracking-wide">{item.name}</span>
              {(item as any).isNew && activeTab !== item.id && (
                <span className="absolute right-4 top-4 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              )}
              {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
            </button>
          ))}
        </nav>

        {/* Profile Footer - Static/Read-Only */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
          <div className="w-full bg-slate-800/50 rounded-[2rem] p-4 flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl border-2 border-indigo-500/30 flex items-center justify-center text-white font-black text-lg">
                {userProfile.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="overflow-hidden text-left flex-1">
              <p className="text-sm font-black truncate leading-none mb-1 text-white">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{userProfile.role}</p>
            </div>
            <Award size={16} className="text-orange-500" />
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative print:overflow-visible print:h-auto print:bg-white pb-20">
        <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-full print:p-0">
          {activeTab === 'dashboard' && <Dashboard apiStatus={apiStatus} />}
          {activeTab === 'yearly' && <YearlyPlanner />}
          {activeTab === 'tools' && <AIToolCenter />}
          {activeTab === 'theory' && <TheoryHub />}
          {activeTab === 'curriculum' && <CurriculumHub />}
          {activeTab === 'planner' && <AIPlanner />}
          {activeTab === 'skillmastery' && <SkillMastery />}
          {activeTab === 'compliance' && <ComplianceAdvisor />}
          {activeTab === 'networking' && <Networking />}
          {activeTab === 'khelo' && <KheloIndia />}
          {activeTab === 'biomechanics' && <Biomechanics />}
          {activeTab === 'rules' && <RulesBot />}
        </div>
        <Disclaimer />
      </main>
    </div>
  );
};

export default App;
    