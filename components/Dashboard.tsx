import React from 'react';
import {
  BookOpen,
  CalendarRange,
  Clock3,
  FileText,
  FolderOpen,
  GraduationCap,
  HeartPulse,
  Info,
  Loader2,
  Search,
  Sparkles,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import { storageService, SavedItem } from '../services/storageService.ts';
import ActionCard from './ActionCard.tsx';
import ToolCard from './ToolCard.tsx';
import type { AppTab } from './Sidebar.tsx';

interface DashboardProps {
  apiStatus?: 'checking' | 'ok' | 'missing' | 'quota';
  onNavigate?: (tab: AppTab) => void;
}

interface ToolSection {
  title: string;
  description: string;
  tools: Array<{
    id: AppTab;
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    mostUsed?: boolean;
    keywords: string[];
    tooltip: string;
  }>;
}

const toolSections: ToolSection[] = [
  {
    title: 'Teaching tools',
    description: 'Plan today’s lesson flow and get your class moving quickly.',
    tools: [
      {
        id: 'planner',
        title: 'Lesson Planner',
        description: 'Turn one teaching goal into a full PE lesson with warm-up, drills, and plenary.',
        icon: Sparkles,
        badge: 'Daily use',
        mostUsed: true,
        keywords: ['lesson', 'planner', 'daily', 'teaching'],
        tooltip: 'Create a PE lesson plan with clear structure and coaching cues.',
      },
      {
        id: 'yearly',
        title: 'Year Planner',
        description: 'Map units, sports, and progression across terms.',
        icon: CalendarRange,
        keywords: ['year', 'term', 'curriculum', 'planner'],
        tooltip: 'Organize your PE curriculum over the full academic year.',
      },
      {
        id: 'warmup',
        title: 'Warm-up Generator',
        description: 'Prepare quick movement starters for any age group or sport.',
        icon: HeartPulse,
        keywords: ['warmup', 'starter', 'routine', 'movement'],
        tooltip: 'Generate simple PE warm-ups tailored to your lesson focus.',
      },
    ],
  },
  {
    title: 'Assessment tools',
    description: 'Create papers, evaluate fitness, and finish reporting faster.',
    tools: [
      {
        id: 'testgen',
        title: 'Test Generator',
        description: 'Generate theory papers and quizzes aligned to PE topics.',
        icon: FileText,
        badge: 'Fast prep',
        mostUsed: true,
        keywords: ['test', 'exam', 'question', 'paper'],
        tooltip: 'Build PE theory tests in minutes.',
      },
      {
        id: 'fitness',
        title: 'Fitness Tests',
        description: 'Record and review common PE fitness assessments.',
        icon: Target,
        keywords: ['fitness', 'assessment', 'benchmark', 'scores'],
        tooltip: 'Track student fitness performance using PE test tools.',
      },
      {
        id: 'reportcard',
        title: 'Report Card Generator',
        description: 'Create concise PE progress reports for students.',
        icon: GraduationCap,
        badge: 'Admin saver',
        keywords: ['report', 'card', 'grading', 'comments'],
        tooltip: 'Generate PE report card comments quickly and clearly.',
      },
    ],
  },
  {
    title: 'Students & resources',
    description: 'Keep records handy and access practical materials when needed.',
    tools: [
      {
        id: 'students',
        title: 'Student Management',
        description: 'Review class records, notes, and progress in one place.',
        icon: Users,
        keywords: ['students', 'class', 'records', 'roster'],
        tooltip: 'Manage student records and PE notes.',
      },
      {
        id: 'skillmastery',
        title: 'Skill Progression',
        description: 'Track movement development and next teaching steps.',
        icon: Target,
        keywords: ['skill', 'progress', 'development', 'rubric'],
        tooltip: 'Monitor student skill progression over time.',
      },
      {
        id: 'curriculum',
        title: 'Library Hub',
        description: 'Open curriculum guidance, resources, and classroom references.',
        icon: BookOpen,
        keywords: ['library', 'resources', 'curriculum', 'docs'],
        tooltip: 'Browse your PE resource library and planning materials.',
      },
    ],
  },
];

const analyticsCards = [
  { label: 'Weekly viewers', value: '12,480', trend: '+18%', tone: 'from-violet-500 to-indigo-500' },
  { label: 'Active teachers', value: '1,245', trend: '+9%', tone: 'from-emerald-500 to-teal-500' },
  { label: 'Papers generated', value: '3,812', trend: '+27%', tone: 'from-amber-500 to-orange-500' },
  { label: 'Lesson plans saved', value: '6,940', trend: '+14%', tone: 'from-fuchsia-500 to-pink-500' },
];

const getHistoryMeta = (item: SavedItem): { tab: AppTab; icon: React.ReactNode; label: string } => {
  switch (item.type) {
    case 'Lesson Plan':
      return {
        tab: 'planner',
        icon: <Sparkles size={18} className="text-emerald-600" />,
        label: 'Lesson Planner',
      };
    case 'Theory':
      return {
        tab: 'testgen',
        icon: <FileText size={18} className="text-indigo-600" />,
        label: 'Test Generator',
      };
    case 'Skill':
      return {
        tab: 'skillmastery',
        icon: <Target size={18} className="text-orange-600" />,
        label: 'Skill Progression',
      };
    case 'Tool':
      return {
        tab: 'fitness',
        icon: <FolderOpen size={18} className="text-slate-600" />,
        label: 'Fitness Tests',
      };
    default:
      return {
        tab: 'curriculum',
        icon: <BookOpen size={18} className="text-slate-600" />,
        label: 'Library Hub',
      };
  }
};

const Dashboard: React.FC<DashboardProps> = ({ apiStatus = 'checking', onNavigate }) => {
  const [history, setHistory] = React.useState<SavedItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState<AppTab | null>(null);

  React.useEffect(() => {
    setHistory(storageService.getAllItems());
  }, []);

  const filteredSections = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return toolSections;

    return toolSections
      .map((section) => ({
        ...section,
        tools: section.tools.filter((tool) => {
          const haystack = [tool.title, tool.description, section.title, ...tool.keywords].join(' ').toLowerCase();
          return haystack.includes(query);
        }),
      }))
      .filter((section) => section.tools.length > 0);
  }, [searchQuery]);

  const recentItems = history.slice(0, 4);

  const navigateWithLoading = (tab: AppTab) => {
    setPendingAction(tab);
    window.setTimeout(() => {
      onNavigate?.(tab);
      setPendingAction(null);
    }, 350);
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    storageService.deleteItem(id);
    setHistory(storageService.getAllItems());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 sm:space-y-8 md:space-y-10">
      <section className="motion-panel overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-violet-50 to-cyan-50 p-5 shadow-sm sm:p-6 md:rounded-[2rem] md:p-10">
        <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3 py-1 text-xs font-medium text-indigo-700">
              <Sparkles size={14} className="text-indigo-500" />
              Teacher Daily Assistant
            </span>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Dashboard</p>
              <h1 className="max-w-2xl text-[2rem] font-semibold tracking-tight text-slate-900 leading-[1.08] sm:text-[2.2rem] md:text-[2.6rem] md:leading-[1.05]">
                What do you want to create today?
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
                Start with the task PE teachers use most often. Keep planning simple, move faster, and get back to class.
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-indigo-100 bg-white/90 px-5 py-4 text-sm text-slate-700 sm:px-6 sm:py-5 xl:max-w-sm">
            <div className="flex items-center gap-2 font-medium text-indigo-900">
              <Info size={16} className="text-indigo-500" />
              Today’s workflow
            </div>
            <p className="mt-3 max-w-sm leading-7">
              Choose one primary action, then use search or recent work to continue from where you left off.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {analyticsCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/60 bg-white/90 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                <span className={`rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-bold text-white ${card.tone}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="motion-delay-1">
            <ActionCard
              title="Create Lesson Plan"
              description="Plan a complete PE lesson with objectives, movement tasks, equipment, and teaching cues."
              icon={Sparkles}
              accent="bg-emerald-50 text-emerald-700"
              ctaLabel="Open lesson planner"
              loadingLabel="Generating lesson plan..."
              loading={pendingAction === 'planner'}
              tooltip="Open the lesson planning workflow for today’s PE class."
              onClick={() => navigateWithLoading('planner')}
            />
          </div>
          <div className="motion-delay-2">
            <ActionCard
              title="Generate Test Paper"
              description="Build a PE test paper quickly for classwork, revision, or formal assessment."
              icon={FileText}
              accent="bg-indigo-50 text-indigo-700"
              ctaLabel="Open test generator"
              loadingLabel="Generating test paper..."
              loading={pendingAction === 'testgen'}
              tooltip="Open the PE test generator for worksheets and papers."
              onClick={() => navigateWithLoading('testgen')}
            />
          </div>
          <div className="motion-delay-3">
            <ActionCard
              title="Create Report Card"
              description="Write student-ready PE comments and report summaries without starting from scratch."
              icon={GraduationCap}
              accent="bg-orange-50 text-orange-700"
              ctaLabel="Open report card generator"
              loadingLabel="Preparing report card..."
              loading={pendingAction === 'reportcard'}
              tooltip="Open the report card generator for PE progress comments."
              onClick={() => navigateWithLoading('reportcard')}
            />
          </div>
        </div>
      </section>

      <section className="motion-panel motion-delay-1 rounded-[1.75rem] border border-violet-100 bg-gradient-to-r from-white via-violet-50/40 to-cyan-50/40 p-5 shadow-sm sm:p-6 md:rounded-[2rem] md:p-8">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Search</p>
            <label htmlFor="dashboard-search" className="block text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Search lesson plans, tests, resources...
            </label>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500 sm:leading-7">
            Find the right tool quickly with natural keywords like “warm-up”, “report”, or “fitness”.
          </p>
        </div>

        <div className="relative mt-5 sm:mt-6">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="dashboard-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search lesson plans, tests, resources..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 sm:space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title} className="motion-panel motion-delay-2 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem] md:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tool section</p>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">{section.title}</h2>
                  <p className="text-sm leading-7 text-slate-600">{section.description}</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {section.tools.length} tools
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {section.tools.map((tool) => (
                  <div key={tool.id}>
                    <ToolCard
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                      badge={tool.badge}
                      mostUsed={tool.mostUsed}
                      tooltip={tool.tooltip}
                      onClick={() => onNavigate?.(tool.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-10 md:rounded-[2rem] md:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Search size={22} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">No matching tools found</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                Try a broader search like “lesson”, “fitness”, or “resources” to find the tool you need.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="motion-panel motion-delay-2 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem] md:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Clock3 size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Continue Where You Left Off</h2>
                <p className="text-sm leading-6 text-slate-600">Jump back into your recent work with one tap.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 sm:mt-7">
              {recentItems.length > 0 ? (
                recentItems.map((item) => {
                  const meta = getHistoryMeta(item);
                  return (
                    <div
                      key={item.id}
                      className="group flex items-start justify-between gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3 overflow-hidden sm:gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                          {meta.icon}
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigate?.(meta.tab)}
                          className="min-w-0 text-left"
                        >
                          <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {meta.label} • {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => handleDelete(item.id, event)}
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center sm:px-6 sm:py-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                    {apiStatus === 'checking' ? <Loader2 size={18} className="animate-spin" /> : <Clock3 size={18} />}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">No recent work yet</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Start with a lesson plan or test paper. Your latest items will appear here for quick access.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="motion-panel motion-delay-3 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem] md:p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Guidance</p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Helpful next steps</h2>
            </div>
            <div className="mt-6 space-y-4">
              {[
                {
                  title: 'Plan a class in 3 steps',
                  description: 'Open Lesson Planner, choose your sport or topic, then generate and refine.',
                },
                {
                  title: 'Prepare assessment quickly',
                  description: 'Use Test Generator for theory papers or Fitness Tests for performance checks.',
                },
                {
                  title: 'Finish reporting faster',
                  description: 'Use Report Card Generator once class observations are complete.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
                  <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
