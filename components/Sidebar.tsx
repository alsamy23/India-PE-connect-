import React from 'react';
import {
  BookOpen,
  ChevronDown,
  FileText,
  GraduationCap,
  HeartPulse,
  Home,
  Library,
  LifeBuoy,
  LucideIcon,
  Settings,
  Sparkles,
  Target,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import Logo from './Logo.tsx';

export type AppTab =
  | 'dashboard'
  | 'curriculum'
  | 'planner'
  | 'yearly'
  | 'skillmastery'
  | 'compliance'
  | 'tools'
  | 'theory'
  | 'khelo'
  | 'biomechanics'
  | 'rules'
  | 'fitness'
  | 'reportcard'
  | 'substitute'
  | 'sportsday'
  | 'parentcomms'
  | 'pewidgets'
  | 'warmup'
  | 'sportsquiz'
  | 'firstaid'
  | 'lessonsummary'
  | 'students'
  | 'testgen'
  | 'community'
  | 'settings';

interface SidebarProps {
  activeTab: AppTab;
  onNavigate: (tab: AppTab) => void;
  isSidebarOpen: boolean;
  onClose: () => void;
  apiStatus: 'checking' | 'ok' | 'missing' | 'quota';
  onOpenSetup?: () => void;
  onOpenFeedback?: () => void;
  userProfile: {
    name: string;
    role: string;
    org: string;
  };
}

interface NavItem {
  id: AppTab;
  name: string;
  icon: LucideIcon;
  description?: string;
}

interface NavGroup {
  id: string;
  name: string;
  icon: LucideIcon;
  items?: NavItem[];
  tab?: AppTab;
}

const navGroups: NavGroup[] = [
  { id: 'home', name: 'Home', icon: Home, tab: 'dashboard' },
  {
    id: 'teaching',
    name: 'Teaching Tools',
    icon: Sparkles,
    items: [
      { id: 'planner', name: 'Lesson Planner', icon: Sparkles, description: 'Build daily PE lessons fast.' },
      { id: 'yearly', name: 'Year Planner', icon: BookOpen, description: 'Map your units across the year.' },
      { id: 'warmup', name: 'Warm-up Generator', icon: HeartPulse, description: 'Create quick class starters.' },
    ],
  },
  {
    id: 'assessment',
    name: 'Assessment Tools',
    icon: FileText,
    items: [
      { id: 'testgen', name: 'Test Generator', icon: FileText, description: 'Create theory papers and assessments.' },
      { id: 'fitness', name: 'Fitness Tests', icon: Target, description: 'Track class fitness benchmarks.' },
      { id: 'reportcard', name: 'Report Card Generator', icon: GraduationCap, description: 'Write PE reports more quickly.' },
    ],
  },
  {
    id: 'students',
    name: 'Students',
    icon: Users,
    items: [
      { id: 'students', name: 'Student Management', icon: Users, description: 'Review class rosters and records.' },
      { id: 'skillmastery', name: 'Skill Progression', icon: Target, description: 'Monitor movement and skill growth.' },
    ],
  },
  {
    id: 'resources',
    name: 'Resources',
    icon: Library,
    items: [
      { id: 'curriculum', name: 'Library Hub', icon: Library, description: 'Browse curriculum and planning resources.' },
      { id: 'parentcomms', name: 'Parent Letters', icon: FileText, description: 'Prepare take-home communication.' },
    ],
  },
  { id: 'community', name: 'Community', icon: LifeBuoy, tab: 'community' },
  { id: 'settings', name: 'Settings', icon: Settings, tab: 'settings' },
];

const apiBadge = {
  checking: {
    label: 'Checking AI',
    classes: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  ok: {
    label: 'AI ready',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  missing: {
    label: 'Setup needed',
    classes: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  quota: {
    label: 'Usage limit',
    classes: 'border-orange-200 bg-orange-50 text-orange-700',
  },
};

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isSidebarOpen,
  onClose,
  apiStatus,
  onOpenSetup,
  onOpenFeedback,
  userProfile,
}) => {
  const defaultOpen = React.useMemo(
    () =>
      navGroups
        .filter((group) => group.items?.some((item) => item.id === activeTab))
        .map((group) => group.id),
    [activeTab],
  );

  const [openGroups, setOpenGroups] = React.useState<string[]>(defaultOpen.length ? defaultOpen : ['teaching']);

  React.useEffect(() => {
    if (defaultOpen.length) {
      setOpenGroups((current) => Array.from(new Set([...current, ...defaultOpen])));
    }
  }, [defaultOpen]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId],
    );
  };

  const status = apiBadge[apiStatus];

  return (
    <aside
      className={`motion-fade-up fixed inset-y-0 left-0 z-40 w-full max-w-[22rem] border-r border-slate-200 bg-white/95 backdrop-blur transition-transform duration-300 md:relative md:h-screen md:w-[320px] md:max-w-none md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } print:hidden`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-5 pb-5 pt-5 sm:px-6 md:pb-6 md:pt-7">
          <div className="flex items-start justify-between gap-3">
            <Logo size={44} showText={true} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 md:hidden"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Your Teacher Daily Assistant for planning, assessment, and class-ready PE resources.
          </p>
        </div>

        <div className="px-5 py-4 sm:px-6 md:py-5">
          <button
            type="button"
            onClick={onOpenSetup}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-sm ${status.classes}`}
          >
            <span className="inline-flex items-center gap-2">
              <Wifi size={15} />
              {status.label}
            </span>
            <span className="text-xs">Manage</span>
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-3 pb-6 sm:px-4 md:pb-8">
          {navGroups.map((group) => {
            const isDirect = !!group.tab;
            const isGroupActive = group.tab === activeTab || group.items?.some((item) => item.id === activeTab);
            const isOpen = openGroups.includes(group.id);

            if (isDirect && group.tab) {
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    onNavigate(group.tab!);
                    onClose();
                  }}
                  className={`motion-card flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                    isGroupActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <group.icon size={18} className={isGroupActive ? 'text-white' : 'text-slate-500'} />
                  {group.name}
                </button>
              );
            }

            return (
              <div key={group.id} className="motion-panel rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-2.5">
                <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.name}
                </p>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`motion-card flex w-full items-center justify-between rounded-[1.1rem] px-3 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                    isGroupActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <group.icon size={18} className={isGroupActive ? 'text-slate-900' : 'text-slate-500'} />
                    {group.name}
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="mt-2 space-y-1.5 px-1 pb-1">
                    {group.items?.map((item) => {
                      const isActive = item.id === activeTab;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          title={item.description}
                          onClick={() => {
                            onNavigate(item.id);
                            onClose();
                          }}
                          className={`motion-card flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-all duration-200 hover:translate-x-1 ${
                            isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                          <div>
                            <div className="text-sm font-medium">{item.name}</div>
                            {item.description && <div className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{item.description}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Need help?</p>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="motion-card mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <LifeBuoy size={16} />
            Feedback & support
          </button>
          <div className="rounded-[1.5rem] bg-slate-900 px-4 py-4 text-white">
            <p className="text-sm font-semibold">{userProfile.name}</p>
            <p className="mt-1 text-xs text-slate-300">{userProfile.role}</p>
            <p className="mt-2 text-xs text-slate-400">{userProfile.org}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
