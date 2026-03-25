import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LayoutDashboard, Loader2, Menu, RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import CurriculumHub from './components/CurriculumHub.tsx';
import AIPlanner from './components/AIPlanner.tsx';
import YearlyPlanner from './components/YearlyPlanner.tsx';
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
import ConnectedPEWidgets from './components/ConnectedPEWidgets.tsx';
import { WarmupGenerator, SportsQuiz, InjuryFirstAid, WhatsAppSummary } from './components/NewAITools.tsx';
import StudentManagement from './components/StudentManagement.tsx';
import QuestionPaperGenerator from './components/QuestionPaperGenerator.tsx';
import Logo from './components/Logo.tsx';
import FeedbackModal from './components/FeedbackModal.tsx';
import CommunityPlanner from './components/CommunityPlanner.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import Sidebar, { AppTab } from './components/Sidebar.tsx';

const pageTitles: Record<AppTab, string> = {
  dashboard: 'Home',
  planner: 'Lesson Planner',
  yearly: 'Year Planner',
  warmup: 'Warm-up Generator',
  testgen: 'Test Generator',
  fitness: 'Fitness Tests',
  reportcard: 'Report Card Generator',
  students: 'Student Management',
  skillmastery: 'Skill Progression',
  curriculum: 'Library Hub',
  parentcomms: 'Parent Letters',
  community: 'Community',
  settings: 'Settings',
  compliance: 'State Compliance',
  tools: 'AI Tool Center',
  theory: 'Theory Master',
  khelo: 'Khelo India Battery',
  biomechanics: 'Visual Physics',
  rules: 'Game Rules Bot',
  substitute: 'Substitute Plan',
  sportsday: 'Sports Day Planner',
  pewidgets: 'PE Classroom Widgets',
  sportsquiz: 'Sports Quiz',
  firstaid: 'Injury First Aid',
  lessonsummary: 'Lesson Summary',
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'missing' | 'quota'>('checking');
  const [aiProviders, setAiProviders] = useState<{ gemini: boolean; groq: boolean }>({ gemini: false, groq: false });
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const userProfile = {
    name: 'L. Samy',
    role: 'Founder & Director',
    org: 'SmartPE India',
  };

  const checkApiStatus = async (retryCount = 0) => {
    try {
      const response = await fetch(`/api/health?t=${Date.now()}`);
      const text = await response.text();
      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        if (retryCount < 3) {
          window.setTimeout(() => checkApiStatus(retryCount + 1), 2000);
          return;
        }

        setApiStatus('missing');
        setDebugInfo({ error: 'Server returned non-JSON', detail: text.substring(0, 100) });
        return;
      }

      const data = JSON.parse(text);

      if (data.status === 'ok') {
        setApiStatus('ok');
        setAiProviders({ gemini: false, groq: data.hasKey || false });
        setDebugInfo(data);
        if (isKeyDialogOpen && data.hasKey) {
          setIsKeyDialogOpen(false);
        }
      } else if (data.status === 'error' && (data.message?.toLowerCase().includes('429') || data.message?.toLowerCase().includes('quota'))) {
        setApiStatus('quota');
        setAiProviders({ gemini: false, groq: false });
        setDebugInfo(data);
      } else if (
        data.status === 'error' &&
        (data.message?.toLowerCase().includes('expired') ||
          data.message?.toLowerCase().includes('renew') ||
          data.message?.toLowerCase().includes('invalid') ||
          data.message?.toLowerCase().includes('not valid'))
      ) {
        setApiStatus('missing');
        setAiProviders({ gemini: false, groq: false });
        setDebugInfo(data);
      } else {
        setApiStatus('missing');
        setAiProviders({ gemini: false, groq: false });
        setDebugInfo(data);
      }
    } catch (error: any) {
      if (retryCount < 3) {
        window.setTimeout(() => checkApiStatus(retryCount + 1), 2000);
      } else {
        setApiStatus('missing');
        setDebugInfo({ error: error.message });
      }
    }
  };

  useEffect(() => {
    checkApiStatus();

    const interval = window.setInterval(async () => {
      if (apiStatus === 'missing' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          checkApiStatus();
        }
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setGlobalError(null);

    try {
      const response = await fetch('/api/ai/test');
      const text = await response.text();
      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
      }

      if (!text) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);
      if (data.message) {
        alert(`Success: ${data.message}`);
        checkApiStatus();
      } else {
        const errorMessage = data.error || 'Unknown error';
        setGlobalError(errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error: any) {
      setGlobalError(error.message);
      alert(`Test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const content = useMemo(() => {
    const commonDashboardProps = {
      apiStatus,
      onNavigate: setActiveTab,
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonDashboardProps} />;
      case 'planner':
        return <AIPlanner />;
      case 'yearly':
        return <YearlyPlanner />;
      case 'warmup':
        return <WarmupGenerator />;
      case 'testgen':
        return <QuestionPaperGenerator />;
      case 'fitness':
        return <FitnessTests />;
      case 'reportcard':
        return <ReportCard />;
      case 'students':
        return <StudentManagement />;
      case 'skillmastery':
        return <SkillMastery />;
      case 'curriculum':
        return <CurriculumHub />;
      case 'parentcomms':
        return <ParentCommunication />;
      case 'community':
        return <CommunityPlanner />;
      case 'settings':
        return (
          <SettingsPanel
            apiStatus={apiStatus}
            isTesting={isTesting}
            onOpenSetup={() => setIsKeyDialogOpen(true)}
            onTestConnection={handleTestConnection}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
          />
        );
      case 'compliance':
        return <ComplianceAdvisor />;
      case 'tools':
        return <AIToolCenter />;
      case 'theory':
        return <TheoryHub />;
      case 'khelo':
        return <KheloIndia />;
      case 'biomechanics':
        return <Biomechanics />;
      case 'rules':
        return <RulesBot />;
      case 'substitute':
        return <SubstitutePlan />;
      case 'sportsday':
        return <SportsDayPlanner />;
      case 'pewidgets':
        return <ConnectedPEWidgets />;
      case 'sportsquiz':
        return <SportsQuiz />;
      case 'firstaid':
        return <InjuryFirstAid />;
      case 'lessonsummary':
        return <WhatsAppSummary />;
      default:
        return <Dashboard {...commonDashboardProps} />;
    }
  }, [activeTab, apiStatus, isTesting]);

  return (
    <>
      <div className="flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-50 md:flex-row print:h-auto print:overflow-visible">
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="motion-fade-up fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[1px] md:hidden"
          />
        )}

        {isKeyDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
            <div className="motion-panel w-full max-w-xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 md:rounded-[2rem] md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    AI setup
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Connect your AI tools</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Add a valid Groq API key so lesson planning, assessment, and report generation stay available.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsKeyDialogOpen(false)}
                  className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-4 sm:mt-8">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ShieldCheck size={16} className="text-slate-500" />
                    Recommended setup
                  </h3>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
                    <li>Create a Groq key at console.groq.com.</li>
                    <li>Add it as <code className="rounded bg-white px-1.5 py-0.5 text-slate-800">GROQ_API_KEY</code> in your environment variables.</li>
                    <li>Run a connection check below to confirm your tools are ready.</li>
                  </ol>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://console.groq.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    <Sparkles size={16} />
                    Open Groq console
                  </a>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-wait"
                  >
                    {isTesting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                    {isTesting ? 'Checking connection...' : 'Check connection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="motion-fade-up sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden print:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Logo size={32} showText={true} />
              <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {pageTitles[activeTab]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          apiStatus={apiStatus}
          onOpenSetup={() => setIsKeyDialogOpen(true)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          userProfile={userProfile}
        />

        <main className="relative flex-1 overflow-y-auto bg-slate-100 pb-24 print:h-auto print:overflow-visible print:bg-white">
          {globalError && (
            <div className="mx-auto max-w-7xl px-6 pt-6 md:px-10">
              <div className="flex items-start gap-4 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-rose-700">
                <AlertTriangle className="mt-0.5 flex-shrink-0" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">System error detected</p>
                  <p className="mt-1 text-sm leading-6">{globalError}</p>
                  <button
                    type="button"
                    onClick={() => setIsKeyDialogOpen(true)}
                    className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    Review AI setup
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setGlobalError(null)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-rose-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur md:px-10 print:hidden">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="inline-flex items-center gap-3 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    <LayoutDashboard size={16} />
                  </span>
                  Back to home
                </button>
                <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">
                  {pageTitles[activeTab]}
                </span>
              </div>
            </div>
          )}

          <div className="mx-auto max-w-[1280px] p-4 sm:p-5 md:p-10 xl:p-12 print:p-0">{content}</div>
          <Disclaimer onFeedback={() => setIsFeedbackOpen(true)} />
        </main>
      </div>

      {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
    </>
  );
};

export default App;
