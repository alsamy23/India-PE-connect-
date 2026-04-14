
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock,
  Trophy,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { fitnessService, FitnessResult, Team, Student, SchoolMember } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';

interface FitnessDashboardProps {
  onNavigate: (tab: any) => void;
}

const FitnessDashboard: React.FC<FitnessDashboardProps> = ({ onNavigate }) => {
  const [results, setResults] = useState<FitnessResult[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<SchoolMember | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchProfileAndData = async () => {
      const profile = await fitnessService.getSchoolMember(auth.currentUser!.uid);
      setUserProfile(profile);

      if (profile) {
        const isAdmin = profile.role === 'admin';
        const unsubResults = fitnessService.subscribeToResults(
          auth.currentUser!.uid,
          profile.schoolId,
          isAdmin,
          setResults
        );
        const unsubTeams = fitnessService.subscribeToTeams(
          auth.currentUser!.uid,
          profile.schoolId,
          isAdmin,
          setTeams
        );
        const unsubStudents = fitnessService.subscribeToStudents(
          auth.currentUser!.uid,
          profile.schoolId,
          isAdmin,
          (data) => {
            setStudents(data);
            setLoading(false);
          }
        );

        return () => {
          unsubResults();
          unsubTeams();
          unsubStudents();
        };
      }
    };

    let unsub: (() => void) | undefined;
    fetchProfileAndData().then(u => unsub = u);
    
    return () => unsub?.();
  }, []);

  const stats = {
    totalStudents: students.length,
    resultsToday: results.filter(r => r.date.startsWith(new Date().toISOString().split('T')[0])).length,
    activeStudentsToday: new Set(results.filter(r => r.date.startsWith(new Date().toISOString().split('T')[0])).map(r => r.studentId)).size,
    totalTracked: results.length
  };

  const getStudentName = (id: string) => {
    const student = students.find(s => s.id === id);
    return student ? student.name : `Student ${id.substring(0, 4)}`;
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Results</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">School Overview</h2>
          <p className="text-slate-500 font-medium">Real-time fitness data from every student in your school.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('school-students')}
            className="px-6 py-3 bg-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
          >
            Manage Students
          </button>
          <button 
            onClick={() => onNavigate('school-teams')}
            className="px-6 py-3 bg-indigo-600 text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(79,70,229,0.1)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Activity size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 24 Hours</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-5xl font-black text-slate-900">{stats.resultsToday}</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Results Today</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.1)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-5xl font-black text-slate-900">{stats.activeStudentsToday}</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active Students</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(249,115,22,0.1)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-5xl font-black text-slate-900">{stats.totalTracked}</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Tracked</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 overflow-hidden">
            <div className="p-8 border-b-2 border-slate-900 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="text-slate-400" size={20} />
                <h3 className="font-black text-lg uppercase tracking-tight">Recent Activity</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search results..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Activity size={32} className="text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-slate-900 uppercase tracking-tight">No results yet</p>
                    <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                      Start a testing session or create a team to see live results here.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('fitness')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
                  >
                    Start Testing
                  </button>
                </div>
              ) : (
                results.slice(0, 10).map((result) => (
                  <div key={result.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                        {getStudentName(result.studentId).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight">{getStudentName(result.studentId)}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{result.testName}</span>
                          <span>•</span>
                          <span>{new Date(result.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">{result.value} {result.unit}</div>
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{result.rating || 'Good'}</div>
                      </div>
                      <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Teams & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Teams Overview</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">Manage your classes and sports squads.</p>
              
              <div className="space-y-3">
                {teams.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-slate-800 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">No teams created</p>
                    <button 
                      onClick={() => onNavigate('school-teams')}
                      className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Create First Team
                    </button>
                  </div>
                ) : (
                  teams.map(team => (
                    <div key={team.id} className="p-4 bg-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-700 transition-colors cursor-pointer group">
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight">{team.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{team.studentIds.length} Students</p>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  ))
                )}
              </div>
            </div>
            <Trophy className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/5 -rotate-12" />
          </div>

          <div className="bg-indigo-50 rounded-[2.5rem] p-8 border-2 border-indigo-100">
            <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight mb-4">Quick Reports</h3>
            <div className="space-y-3">
              <button className="w-full p-4 bg-white rounded-2xl border border-indigo-100 text-left hover:shadow-md transition-all group">
                <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Term 1</span>
                <span className="block font-bold text-indigo-900">Class Progress Report</span>
              </button>
              <button className="w-full p-4 bg-white rounded-2xl border border-indigo-100 text-left hover:shadow-md transition-all group">
                <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Health</span>
                <span className="block font-bold text-indigo-900">BMI Distribution</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessDashboard;
