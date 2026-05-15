import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, BookOpen, User, ArrowRight, LayoutDashboard, Wrench, GraduationCap, X, FileText } from 'lucide-react';
import { fitnessService, Student } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';

interface GlobalSearchProps {
  onNavigate: (tabId: string, data?: any) => void;
}

interface SearchItem {
  type: 'module' | 'resource' | 'student';
  title: string;
  tabId: string;
  subtitle?: string;
  id?: string;
}

const MODULES: SearchItem[] = [
  { type: 'module', title: 'Dashboard', tabId: 'dashboard' },
  { type: 'module', title: 'PE Lesson Plan Generator', tabId: 'planner', subtitle: 'Create CBSE/ICSE lesson plans' },
  { type: 'module', title: 'Question Paper Generator', tabId: 'testpaper', subtitle: 'MCQ & Theory for PE' },
  { type: 'module', title: 'Fitness Tests', tabId: 'fitness', subtitle: 'Khelo India Assessment Data' },
  { type: 'module', title: 'Khelo India Battery Info', tabId: 'khelo', subtitle: 'Details on fitness tests' },
  { type: 'module', title: 'School Fitness Database', tabId: 'school-overview', subtitle: 'Platform overview' },
  { type: 'module', title: 'Fitness Reports', tabId: 'fitness-reports', subtitle: 'Generate PDF reports' },
  { type: 'module', title: 'Live Test Results', tabId: 'school-results', subtitle: 'Monitor assessments' },
  { type: 'module', title: 'Student Directory', tabId: 'school-students', subtitle: 'Manage student records' },
  { type: 'module', title: 'Teams & Classes', tabId: 'school-teams', subtitle: 'Manage groups' },
  { type: 'module', title: 'Parent Letters', tabId: 'parentletters', subtitle: 'Draft emails for parents' },
  { type: 'module', title: 'Yearly Curriculum Planner', tabId: 'yearly', subtitle: '40 week curriculum' },
  { type: 'module', title: 'PE Classroom Widgets', tabId: 'widgets', subtitle: 'Timers & scoreboards' },
  { type: 'module', title: 'Skill Progressions', tabId: 'skillmastery', subtitle: 'Checklists for physical skills' },
  { type: 'module', title: 'Skill Analysis Lab', tabId: 'skill-analysis', subtitle: 'Compare techniques' },
  { type: 'module', title: 'State Compliance', tabId: 'compliance', subtitle: 'NEP 2020 & CBSE norms' },
  { type: 'module', title: 'School Settings', tabId: 'school-admin', subtitle: 'Admin controls' },
  { type: 'module', title: 'System Logs', tabId: 'logs', subtitle: 'Error tracking' },
  { type: 'module', title: 'Game Rules Bot', tabId: 'rules', subtitle: 'Sport rulebook AI' },
  { type: 'module', title: 'Theory Master', tabId: 'theory', subtitle: 'CBSE / ICSE PE Theory' },
  { type: 'module', title: 'AI Tool Center', tabId: 'tools', subtitle: 'Extra AI utilities' },
];

const RESOURCES: SearchItem[] = [
  { type: 'resource', title: 'Changing Trends & Career in PE', tabId: 'theory', subtitle: 'Class 11 - Unit 1' },
  { type: 'resource', title: 'Olympism', tabId: 'theory', subtitle: 'Class 11 - Unit 2' },
  { type: 'resource', title: 'Yoga', tabId: 'theory', subtitle: 'Class 11 - Unit 3 / Class 12 - Unit 3' },
  { type: 'resource', title: 'Physical Education & Sports for CWSN', tabId: 'theory', subtitle: 'Class 11/12 - Unit 4' },
  { type: 'resource', title: 'Physical Fitness, Health and Wellness', tabId: 'theory', subtitle: 'Class 11 - Unit 5' },
  { type: 'resource', title: 'Test, Measurement & Evaluation', tabId: 'theory', subtitle: 'Class 11/12 - Unit 6' },
  { type: 'resource', title: 'Anatomy, Physiology in Sports', tabId: 'theory', subtitle: 'Class 11 - Unit 7 / Class 12 - Unit 7' },
  { type: 'resource', title: 'Kinesiology and Biomechanics', tabId: 'theory', subtitle: 'Class 11 - Unit 8 / Class 12 - Unit 8' },
  { type: 'resource', title: 'Psychology & Sports', tabId: 'theory', subtitle: 'Class 11/12 - Unit 9' },
  { type: 'resource', title: 'Training and Doping in Sports', tabId: 'theory', subtitle: 'Class 11/12 - Unit 10' },
  { type: 'resource', title: 'Management of Sporting Events', tabId: 'theory', subtitle: 'Class 12 - Unit 1' },
  { type: 'resource', title: 'Children & Women in Sports', tabId: 'theory', subtitle: 'Class 12 - Unit 2' },
  { type: 'resource', title: 'Sports & Nutrition', tabId: 'theory', subtitle: 'Class 12 - Unit 5' },
];

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let unsubStudents: (() => void) | undefined;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await fitnessService.getSchoolMember(user.uid);
          const isSuperAdmin = user.email === 'alsamy36@gmail.com';
          const isAdmin = profile?.role === 'admin' || isSuperAdmin;
          const schoolId = profile?.schoolId;
          
          unsubStudents = fitnessService.subscribeToStudents(
            user.uid,
            schoolId,
            isAdmin,
            (data) => setStudents(data)
          );
        } catch (e) {
          console.error("Error fetching students for search", e);
        }
      } else {
        setStudents([]);
        unsubStudents?.();
      }
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unsubAuth();
      unsubStudents?.();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const term = query.toLowerCase().trim();
    const matches: SearchItem[] = [];

    // Match Modules
    MODULES.forEach(mod => {
      if (mod.title.toLowerCase().includes(term) || mod.subtitle?.toLowerCase().includes(term) || mod.tabId.toLowerCase().includes(term)) {
        matches.push(mod);
      }
    });

    // Match Resources
    RESOURCES.forEach(res => {
      if (res.title.toLowerCase().includes(term) || res.subtitle?.toLowerCase().includes(term)) {
        matches.push(res);
      }
    });

    // Match Students
    students.forEach(std => {
      if (std.name.toLowerCase().includes(term) || std.rollNumber?.toLowerCase().includes(term)) {
        matches.push({
          type: 'student',
          title: std.name,
          subtitle: `Roll: ${std.rollNumber || 'N/A'}`,
          tabId: 'fitness-reports',
          id: std.id
        });
      }
    });

    setResults(matches.slice(0, 8));
  }, [query, students]);

  const handleSelect = (item: SearchItem) => {
    setQuery('');
    setIsOpen(false);
    
    if (item.type === 'student') {
      onNavigate(item.tabId, { studentId: item.id });
    } else {
      onNavigate(item.tabId);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50 text-left" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-12 pr-20 py-3 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm font-medium shadow-[0_4px_10px_rgba(0,0,0,0.03)]"
          placeholder="Search modules, theory, or students..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {!query && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Ctrl K</span>
          </div>
        )}
        {query && (
          <button 
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
              {results.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-3 hover:bg-slate-50 flex items-center space-x-3 transition-colors text-left group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                      {item.type === 'module' && <LayoutDashboard size={20} className="text-slate-500 group-hover:text-indigo-600" />}
                      {item.type === 'resource' && <BookOpen size={20} className="text-slate-500 group-hover:text-indigo-600" />}
                      {item.type === 'student' && <User size={20} className="text-slate-500 group-hover:text-indigo-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs font-medium text-slate-500 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-slate-300 group-hover:text-indigo-500 transition-colors">
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-10 text-center">
              <Search size={32} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-black text-slate-900 mb-1">No results found</p>
              <p className="text-xs font-medium text-slate-500">We couldn't find anything matching "{query}". Try checking your spelling or search for something less specific.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
