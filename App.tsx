
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
  RotateCcw,
  Loader2,
  GraduationCap,
  Trophy,
  Microscope,
  Book,
  Activity,
  AlertCircle,
  FileText,
  Zap,
  Mail,
  MessageSquare
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
import FitnessTests from './components/FitnessTests.tsx';
import Disclaimer from './components/Disclaimer.tsx';
import ReportCard from './components/ReportCard.tsx';
import SubstitutePlan from './components/SubstitutePlan.tsx';
import SportsDayPlanner from './components/SportsDayPlanner.tsx';
import ParentCommunication from './components/ParentCommunication.tsx';
import Logo from './components/Logo.tsx';
import FeedbackModal from './components/FeedbackModal.tsx';

type Tab = 'dashboard' | 'curriculum' | 'planner' | 'yearly' | 'networking' | 'skillmastery' | 'compliance' | 'tools' | 'theory' | 'khelo' | 'biomechanics' | 'rules' | 'fitness' | 'reportcard' | 'substitute' | 'sportsday' | 'parentcomms';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'missing' | 'quota'>('checking');
  const [aiProviders, setAiProviders] = useState<{ gemini: boolean, groq: boolean }>({ gemini: false, groq: false });
  const [apiSource, setApiSource] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // Static Profile Data (Read-Only)
  const userProfile = {
    name: "L. Samy",
    role: "Founder & Director",
    org: "SmartPE India"
  };

  const checkApiStatus = async (retryCount = 0) => {
    try {
      console.log("Checking API health...");
      const response = await fetch(`/api/health?t=${Date.now()}`); // Cache busting
      const text = await response.text();
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Health check returned non-JSON response:", text);
        
        if (retryCount < 3) {
          console.log(`Retrying health check (${retryCount + 1}/3)...`);
          setTimeout(() => checkApiStatus(retryCount + 1), 2000);
          return;
        }
        
        setApiStatus('missing');
        setDebugInfo({ error: "Server returned non-JSON", detail: text.substring(0, 100) });
        return;
      }

      const data = JSON.parse(text);
      console.log("API Health Data:", data);
      
      if (data.status === 'ok') {
        setApiStatus('ok');
        setAiProviders({ gemini: data.hasKey || false, groq: false });
        setApiSource('Claude');
        setDebugInfo(data);
        // If we were missing a key and now have one, close the dialog
        if (isKeyDialogOpen && data.hasKey) {
          setIsKeyDialogOpen(false);
        }
      } else if (data.status === 'error' && (data.message?.toLowerCase().includes('429') || data.message?.toLowerCase().includes('quota'))) {
        setApiStatus('quota');
        setAiProviders({ gemini: false, groq: false });
        setApiSource('');
        setDebugInfo(data);
      } else if (data.status === 'error' && (
        data.message?.toLowerCase().includes('expired') || 
        data.message?.toLowerCase().includes('renew') || 
        data.message?.toLowerCase().includes('invalid') ||
        data.message?.toLowerCase().includes('not valid')
      )) {
        setApiStatus('missing'); 
        setAiProviders({ gemini: false, groq: false });
        setApiSource('Expired Key');
        setDebugInfo(data);
      } else {
        setApiStatus('missing');
        setAiProviders({ gemini: false, groq: false });
        setApiSource('');
        setDebugInfo(data);
      }
    } catch (error: any) {
      console.error("Health check failed:", error);
      if (retryCount < 3) {
        setTimeout(() => checkApiStatus(retryCount + 1), 2000);
      } else {
        setApiStatus('missing');
        setDebugInfo({ error: error.message });
      }
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Check if key was selected if we're still missing it, but less frequently
    const interval = setInterval(async () => {
      if (apiStatus === 'missing' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          checkApiStatus();
        }
      }
    }, 10000); // 10 seconds is enough
    
    return () => clearInterval(interval);
  }, []); // Only run once on mount

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines
      setApiStatus('ok');
      setIsKeyDialogOpen(false);
      // Re-check health after a short delay to be sure
      setTimeout(checkApiStatus, 3000);
    }
  };

  const triggerKeySelector = async () => {
    await handleSelectKey();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setGlobalError(null);
    try {
      const response = await fetch('/api/ai/test');
      const text = await response.text();
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
      }

      if (!text) throw new Error("Empty response from server");
      
      const data = JSON.parse(text);
      if (data.message) {
        alert("Success: " + data.message);
        checkApiStatus();
      } else {
        const err = data.error || "Unknown error";
        setGlobalError(err);
        alert("Error: " + err);
      }
    } catch (error: any) {
      setGlobalError(error.message);
      alert("Test failed: " + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetKey = async () => {
    if (window.aistudio) {
      // There isn't a direct 'clear' but we can re-open or just refresh
      await window.aistudio.openSelectKey();
      checkApiStatus();
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'yearly', name: 'Yearly Planner', icon: CalendarRange },
    { id: 'planner', name: 'Lesson Planner', icon: Sparkles },
    { id: 'fitness', name: 'Fitness Tests', icon: Activity, isNew: true },
    { id: 'khelo', name: 'Khelo India Battery', icon: Trophy },
    { id: 'biomechanics', name: 'Visual Physics', icon: Microscope, isNew: true },
    { id: 'rules', name: 'Game Rules Bot', icon: Book, isNew: true },
    { id: 'theory', name: 'Theory Master (CBSE)', icon: GraduationCap },
    { id: 'tools', name: 'AI Tool Center', icon: Wrench },
    { id: 'skillmastery', name: 'Skill Progressions', icon: Target },
    { id: 'compliance', name: 'State Compliance', icon: ShieldCheck },
    { id: 'curriculum', name: 'Library Hub', icon: BookOpen },
    { id: 'reportcard', name: 'Report Card Generator', icon: FileText, isNew: true },
    { id: 'substitute', name: 'Substitute Plan', icon: Zap, isNew: true },
    { id: 'sportsday', name: 'Sports Day Planner', icon: Trophy, isNew: true },
    { id: 'parentcomms', name: 'Parent Letters', icon: Mail, isNew: true },
    { id: 'networking', name: 'Coach Community', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden h-screen print:h-auto print:overflow-visible font-inter">
      {/* API Key Selection Modal - Enhanced with instructions */}
      {isKeyDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShieldCheck size={32} />
              </div>
              <button onClick={() => setIsKeyDialogOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AI Setup Guide</h2>
            
            <div className="space-y-6 mb-8">
              <div className="p-5 bg-indigo-50 rounded-3xl border-2 border-indigo-100 shadow-sm">
                <p className="text-sm font-black text-indigo-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs mr-3 shadow-lg shadow-indigo-200">1</span>
                  Option A: Paid Gemini Key (Primary)
                </p>
                <p className="text-xs text-indigo-700 mb-5 leading-relaxed font-medium">
                  The standard AI engine. If you see "Expired Key" or "Quota" errors, click below to renew, select, or upgrade to a key from a paid project.
                </p>
                <button 
                  onClick={triggerKeySelector}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-3"
                >
                  <Sparkles size={18} />
                  <span>Renew / Upgrade to Paid Key</span>
                </button>
              </div>

              <div className="p-5 bg-orange-50 rounded-3xl border-2 border-orange-100 shadow-sm">
                <p className="text-sm font-black text-orange-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-600 text-white rounded-xl flex items-center justify-center text-xs mr-3 shadow-lg shadow-orange-200">2</span>
                  Option B: Groq Key (Recommended Fallback)
                </p>
                <div className="mb-4 p-3 bg-white/80 rounded-2xl border border-orange-200">
                  <p className="text-[11px] text-orange-800 font-black flex items-center mb-1">
                    <AlertCircle size={14} className="mr-2" />
                    GETTING A "NO PAID PROJECT" ERROR?
                  </p>
                  <p className="text-[10px] text-orange-700 leading-tight">
                    If Gemini shows a "No Paid Project" error, skip it! Use Groq instead—it's free, 10x faster, and doesn't require a paid Google account.
                  </p>
                </div>
                <p className="text-xs text-orange-800 mb-4 leading-relaxed font-medium">
                  <b>Best for speed!</b> Groq works when Gemini is busy or restricted.
                </p>
                <div className="bg-white/50 p-4 rounded-2xl mb-5 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</div>
                    <p className="text-[11px] text-orange-700 font-bold">Get a free key at <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-2">console.groq.com</a></p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</div>
                    <p className="text-[11px] text-orange-700 font-bold">In the <b>AI Studio sidebar</b> (left), click the <b>Environment Variables</b> icon.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</div>
                    <p className="text-[11px] text-orange-700 font-bold">Add Name: <code className="bg-orange-100 px-1.5 py-0.5 rounded text-orange-900">GROQ_API_KEY</code> and paste your key.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="py-3 bg-white border-2 border-orange-200 text-orange-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center space-x-2"
                  >
                    {isTesting ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                    <span>{isTesting ? 'Verifying...' : 'Verify'}</span>
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="py-3 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <RotateCcw size={14} />
                    <span>Force Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 font-medium">
              Need a key? Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 underline">aistudio.google.com</a>
            </p>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center z-50 shadow-xl print:hidden">
        <div className="flex items-center">
          <Logo size={36} showText={true} />
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
        <div className="p-6 hidden md:flex items-center">
          <Logo size={52} showText={true} />
        </div>

        {/* API Status Badge - Interactive */}
        <div className="mx-6 mb-4">
          {apiStatus === 'ok' ? (
            <button 
              onClick={() => setIsKeyDialogOpen(true)}
              className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between hover:bg-emerald-500/20 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Connected</span>
                  <div className="flex items-center space-x-1">
                    {aiProviders.gemini && <span className="text-[8px] font-bold text-indigo-400 uppercase">Claude AI</span>}
                    
                    
                  </div>
                </div>
              </div>
              <Wifi size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            </button>
          ) : apiStatus === 'quota' ? (
            <button 
              onClick={() => setIsKeyDialogOpen(true)}
              className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between hover:bg-amber-500/20 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Quota Exceeded</span>
              </div>
              <AlertTriangle size={12} className="text-amber-500 group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={() => setIsKeyDialogOpen(true)}
              className="w-full bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center justify-between hover:bg-rose-500/20 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">AI Disconnected</span>
              </div>
              <AlertTriangle size={12} className="text-rose-500 group-hover:scale-110 transition-transform" />
            </button>
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
        {/* Feedback Button */}
        <div className="px-4 mb-2">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-2xl text-indigo-300 text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
          >
            <MessageSquare size={14} />
            Feedback & Support
          </button>
        </div>
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
            <Trophy size={16} className="text-orange-500" />
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative print:overflow-visible print:h-auto print:bg-white pb-20">
        {globalError && (
          <div className="max-w-7xl mx-auto px-6 pt-6 md:px-12">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center space-x-4 text-red-700">
              <AlertTriangle className="flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-tight">System Error Detected</p>
                <p className="text-xs font-medium opacity-80 mb-2">{globalError}</p>
                <button 
                  onClick={() => setIsKeyDialogOpen(true)}
                  className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Setup AI / Fix Connection
                </button>
              </div>
              <button 
                onClick={() => setGlobalError(null)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-full print:p-0">
          {activeTab === 'dashboard' && (
            <Dashboard 
              apiStatus={apiStatus} 
              debugInfo={debugInfo}
              onTestConnection={handleTestConnection}
              isTesting={isTesting}
              onNavigate={setActiveTab}
            />
          )}
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
          {activeTab === 'fitness' && <FitnessTests />}
          {activeTab === 'reportcard' && <ReportCard />}
          {activeTab === 'substitute' && <SubstitutePlan />}
          {activeTab === 'sportsday' && <SportsDayPlanner />}
          {activeTab === 'parentcomms' && <ParentCommunication />}
        </div>
        <Disclaimer onFeedback={() => setIsFeedbackOpen(true)} />
      </main>
    </div>
      {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
  );
};

export default App;
    