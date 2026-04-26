
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
  ClipboardList,
  UserCheck,
  Mail,
  Zap,
  Shield
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import AIPlanner from './components/AIPlanner.tsx';
import YearlyPlanner from './components/YearlyPlanner.tsx';
import SkillMastery from './components/SkillMastery.tsx';
import ComplianceAdvisor from './components/ComplianceAdvisor.tsx';
import AIToolCenter from './components/AIToolCenter.tsx';
import TheoryHub from './components/TheoryHub.tsx';
import KheloIndia from './components/KheloIndia.tsx';
import RulesBot from './components/RulesBot.tsx';
import FitnessTests from './components/FitnessTests.tsx';
import FitnessDashboard from './components/FitnessDashboard.tsx';
import StudentManagement from './components/StudentManagement.tsx';
import TeamManagement from './components/TeamManagement.tsx';
import TestPaperGenerator from './components/TestPaperGenerator.tsx';
import ParentLetters from './components/ParentLetters.tsx';
import ClassroomWidgets from './components/ClassroomWidgets.tsx';
import Disclaimer from './components/Disclaimer.tsx';
import Logo from './components/Logo.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import Auth from './components/Auth.tsx';
import FitnessManagementIntro from './components/FitnessManagementIntro.tsx';
import SchoolAdmin from './components/SchoolAdmin.tsx';
import { auth } from './services/firebase.ts';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';

type Tab = 'dashboard' | 'planner' | 'yearly' | 'skillmastery' | 'compliance' | 'tools' | 'theory' | 'khelo' | 'rules' | 'fitness' | 'testpaper' | 'parentletters' | 'widgets' | 'school-results' | 'school-students' | 'school-teams' | 'school-overview' | 'school-admin';

import { BoardType, Language } from './types.ts';

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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthView, setIsAuthView] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (window.confirm('Are you sure you want to log out?')) {
        await signOut(auth);
      }
    } catch (err) {
      console.error(err);
    }
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
        setAiProviders({ gemini: data.hasGemini, groq: data.hasGroq });
        setApiSource(data.hasGemini ? 'Gemini' : 'Groq');
        setDebugInfo(data);
        // If we were missing a key and now have one, close the dialog
        if (isKeyDialogOpen && (data.hasGemini || data.hasGroq)) {
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
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (hasKey) {
            checkApiStatus();
          }
        } catch (e) {
          console.error("Error checking API key:", e);
        }
      }
    }, 10000); // 10 seconds is enough
    
    return () => clearInterval(interval);
  }, []); // Only run once on mount

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success as per guidelines
        setApiStatus('ok');
        setIsKeyDialogOpen(false);
        // Re-check health after a short delay to be sure
        setTimeout(checkApiStatus, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerKeySelector = async () => {
    try {
      await handleSelectKey();
    } catch (err) {
      console.error(err);
    }
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
    try {
      if (window.aistudio) {
        // There isn't a direct 'clear' but we can re-open or just refresh
        await window.aistudio.openSelectKey();
        checkApiStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'widgets', name: 'PE Classroom Widgets', icon: Zap, isNew: true },
    { id: 'parentletters', name: 'Parent Letters', icon: Mail, isNew: true },
    { id: 'testpaper', name: 'Test Generator', icon: ClipboardList, isNew: true },
    { id: 'yearly', name: 'Yearly Planner', icon: CalendarRange },
    { id: 'planner', name: 'PE Lesson Plan', icon: Sparkles },
    { 
      section: 'School Fitness Management',
      items: [
        { id: 'school-overview', name: 'Overview & Guide', icon: Zap, isNew: true },
        { id: 'school-results', name: 'Live Results', icon: Activity, isNew: true, protected: true },
        { id: 'school-students', name: 'Student Directory', icon: Users, protected: true },
        { id: 'school-teams', name: 'Teams/Classes', icon: UserCheck, protected: true },
        { id: 'school-admin', name: 'Administration', icon: Shield, protected: true },
        { id: 'fitness', name: 'Fitness Tests', icon: Activity, isNew: true },
      ]
    },
    { id: 'khelo', name: 'Khelo India Battery', icon: Trophy },
    { id: 'rules', name: 'Game Rules Bot', icon: Book, isNew: true },
    { id: 'theory', name: 'Theory Master (CBSE)', icon: GraduationCap },
    { id: 'tools', name: 'AI Tool Center', icon: Wrench },
    { id: 'skillmastery', name: 'Skill Progressions', icon: Target },
    { id: 'compliance', name: 'State Compliance', icon: ShieldCheck },
  ];

  const isProtectedTab = (tabId: string) => {
    for (const item of navigation) {
      if ('section' in item && item.items) {
        if (item.items.some(i => i.id === tabId && i.protected)) return true;
      } else if ('id' in item && (item as any).id === tabId && (item as any).protected) {
        return true;
      }
    }
    return false;
  };

  const renderContent = () => {
    if (isProtectedTab(activeTab)) {
      if (!isAuthReady) {
        return (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-slate-500 font-medium">Verifying access...</p>
          </div>
        );
      }
      if (!user) {
        if (isAuthView) return <Auth onBack={() => setIsAuthView(false)} />;
        return <FitnessManagementIntro onLogin={() => setIsAuthView(true)} onTryDemo={() => setActiveTab('fitness')} />;
      }
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard apiStatus={apiStatus} debugInfo={debugInfo} onTestConnection={handleTestConnection} isTesting={isTesting} onNavigate={setActiveTab} />;
      case 'yearly': return <YearlyPlanner />;
      case 'tools': return <AIToolCenter />;
      case 'theory': return <TheoryHub />;
      case 'planner': return <AIPlanner />;
      case 'skillmastery': return <SkillMastery />;
      case 'compliance': return <ComplianceAdvisor />;
      case 'khelo': return <KheloIndia />;
      case 'rules': return <RulesBot />;
      case 'fitness': return <FitnessTests />;
      case 'school-results': return <FitnessDashboard onNavigate={setActiveTab} />;
      case 'school-students': return <StudentManagement />;
      case 'school-teams': return <TeamManagement />;
      case 'school-admin': return <SchoolAdmin />;
      case 'testpaper': return <TestPaperGenerator />;
      case 'parentletters': return <ParentLetters />;
      case 'widgets': return <ClassroomWidgets />;
      case 'school-overview': return <FitnessManagementIntro onLogin={() => setIsAuthView(true)} onTryDemo={() => setActiveTab('fitness')} />;
      default: return <Dashboard apiStatus={apiStatus} debugInfo={debugInfo} onTestConnection={handleTestConnection} isTesting={isTesting} onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden h-screen print:h-auto print:overflow-visible font-sans">
        {/* API Key Selection Modal - Enhanced with instructions */}
      {isKeyDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShieldCheck size={32} />
              </div>
              <button onClick={() => setIsKeyDialogOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight font-display uppercase">AI Setup Guide</h2>
            
            <div className="space-y-6 mb-8">
              <div className="p-5 bg-primary/5 rounded-3xl border-2 border-primary/10 shadow-sm">
                <p className="text-sm font-black text-primary mb-3 flex items-center uppercase tracking-widest">
                  <span className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center text-xs mr-3 shadow-lg shadow-primary/20">1</span>
                  Option A: Paid Gemini Key
                </p>
                <p className="text-xs text-primary/70 mb-5 leading-relaxed font-medium">
                  The standard AI engine. If you see "Expired Key" or "Quota" errors, click below to renew, select, or upgrade to a key from a paid project.
                </p>
                <button 
                  onClick={triggerKeySelector}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3"
                >
                  <Sparkles size={18} />
                  <span>Renew / Upgrade Key</span>
                </button>
              </div>

              <div className="p-5 bg-orange-50 rounded-3xl border-2 border-orange-100 shadow-sm">
                <p className="text-sm font-black text-orange-900 mb-3 flex items-center uppercase tracking-widest">
                  <span className="w-8 h-8 bg-orange-600 text-white rounded-xl flex items-center justify-center text-xs mr-3 shadow-lg shadow-orange-200">2</span>
                  Option B: Groq Key
                </p>
                <div className="mb-4 p-3 bg-white/80 rounded-2xl border border-orange-200">
                  <p className="text-[11px] text-orange-800 font-black flex items-center mb-1 uppercase tracking-widest">
                    <AlertCircle size={14} className="mr-2" />
                    GETTING A "NO PAID PROJECT" ERROR?
                  </p>
                  <p className="text-[10px] text-orange-700 leading-tight">
                    If Gemini shows a "No Paid Project" error, skip it! Use Groq instead—it's free, 10x faster, and doesn't require a paid Google account.
                  </p>
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
              Need a key? Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">aistudio.google.com</a>
            </p>
          </div>
        </div>
      )}

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-slate-950/90 backdrop-blur-xl text-white p-4 flex justify-between items-center z-50 shadow-xl print:hidden">
          <Logo variant="light" className="scale-90 origin-left" />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl active:scale-90 transition-transform">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Navigation Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-slate-950 text-white transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-white/5
        print:hidden
      `}>
        <div className="p-10 hidden md:flex items-center">
          <Logo variant="light" />
        </div>

        {/* API Status Badge - Interactive */}
        <div className="mx-6 mb-8">
          {apiStatus === 'ok' ? (
            <button 
              onClick={handleSelectKey}
              className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-500/10 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Connected</span>
                </div>
              </div>
              <Wifi size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            </button>
          ) : apiStatus === 'quota' ? (
            <button 
              onClick={handleSelectKey}
              className="w-full bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-center justify-between hover:bg-amber-500/10 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Quota Exceeded</span>
              </div>
              <AlertTriangle size={12} className="text-amber-500 group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={handleSelectKey}
              className="w-full bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex items-center justify-between hover:bg-rose-500/10 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">AI Disconnected</span>
              </div>
              <AlertTriangle size={12} className="text-rose-500 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        <nav className="mt-4 px-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-380px)] custom-scrollbar">
          {navigation.map((item, idx) => {
            if ('section' in item && item.items) {
              return (
                <div key={`section-${idx}`} className="py-4">
                  <p className="px-6 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{item.section}</p>
                  <div className="space-y-1.5">
                    {item.items.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setActiveTab(subItem.id as Tab);
                          setIsSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group
                          ${activeTab === subItem.id 
                            ? 'bg-white text-on-surface shadow-2xl shadow-white/5 scale-[1.02] font-black' 
                            : 'text-slate-500 hover:bg-white/5 hover:text-white font-bold'}
                        `}
                      >
                        <subItem.icon size={20} className={activeTab === subItem.id ? 'text-primary' : 'text-slate-600 group-hover:text-white'} />
                        <span className="text-sm tracking-wide uppercase font-display">{subItem.name}</span>
                        {subItem.isNew && activeTab !== subItem.id && (
                          <span className="absolute right-4 top-4 w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                        )}
                        {activeTab === subItem.id && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            if ('id' in item) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group
                    ${activeTab === item.id 
                      ? 'bg-white text-on-surface shadow-2xl shadow-white/5 scale-[1.02] font-black' 
                      : 'text-slate-500 hover:bg-white/5 hover:text-white font-bold'}
                  `}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'text-primary' : 'text-slate-600 group-hover:text-white'} />
                  <span className="text-sm tracking-wide uppercase font-display">{item.name}</span>
                  {(item as any).isNew && activeTab !== item.id && (
                    <span className="absolute right-4 top-4 w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                  )}
                  {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"></div>}
                </button>
              );
            }
            return null;
          })}
        </nav>

        {/* Profile Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-950 border-t border-white/5">
          {user ? (
            <div className="w-full bg-white/5 rounded-[2rem] p-4 flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-primary rounded-2xl border-2 border-primary/30 flex items-center justify-center text-white font-black text-lg font-display">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary border-2 border-slate-950 rounded-full"></div>
              </div>
              <div className="overflow-hidden text-left flex-1">
                <p className="text-sm font-black truncate leading-none mb-1 text-white font-display uppercase">{user.displayName || 'Teacher'}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-widest">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors"
                title="Logout"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('school-results')}
              className="w-full py-4 bg-primary text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-container transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2"
            >
              <Users size={16} />
              <span>Teacher Login</span>
            </button>
          )}
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
                  onClick={handleSelectKey}
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
          {renderContent()}
        </div>
        <Disclaimer />

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 pb-safe flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] print:hidden">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'planner', icon: Sparkles, label: 'Lesson Plan' },
            { id: 'testpaper', icon: ClipboardList, label: 'Tests' },
            { id: 'tools', icon: Wrench, label: 'Tools' },
            { id: 'theory', icon: GraduationCap, label: 'Theory' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center space-y-1 transition-all active:scale-90 ${activeTab === item.id ? 'text-primary' : 'text-slate-400'}`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'scale-110' : ''} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  </ErrorBoundary>
);
};

export default App;
    