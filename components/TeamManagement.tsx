
import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  ChevronRight, 
  Users, 
  Trophy,
  ArrowRight,
  Settings,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { fitnessService, Team, Student, SchoolMember } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [userProfile, setUserProfile] = useState<SchoolMember | null>(null);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: '',
    grade: '',
    section: '',
    studentIds: []
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchProfileAndData = async () => {
      try {
        const profile = await fitnessService.getSchoolMember(auth.currentUser!.uid);
        setUserProfile(profile);

        if (profile) {
          const isAdmin = profile.role === 'admin';
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
            unsubTeams();
            unsubStudents();
          };
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    let unsub: (() => void) | undefined;
    fetchProfileAndData().then(u => { if (u) unsub = u; });
    
    return () => unsub?.();
  }, []);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !auth.currentUser || !userProfile) return;

    try {
      const team: Team = {
        ...newTeam as Team,
        id: Math.random().toString(36).substr(2, 9),
        teacherId: auth.currentUser.uid,
        schoolId: userProfile.schoolId,
        studentIds: [] // Initially empty
      };

      await fitnessService.saveTeam(team);
      setIsAdding(false);
      setNewTeam({ name: '', grade: '', section: '', studentIds: [] });
    } catch (err) {
      console.error(err);
      alert('Failed to add team. Please try again.');
    }
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
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Teams & Classes</h2>
          <p className="text-slate-500 font-medium">Group students into classes or sports squads.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-indigo-600 text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.length === 0 ? (
          <div className="md:col-span-3 bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck size={32} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No teams yet</h3>
            <p className="text-slate-400 font-medium mb-8 max-w-sm mx-auto">Create teams to organize your students and start seeing live results during testing sessions.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Create Your First Team
            </button>
          </div>
        ) : (
          teams.map(team => (
            <motion.div 
              key={team.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2.5rem] border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)] hover:shadow-[8px_8px_0px_0px_rgba(79,70,229,0.1)] transition-all group"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Users size={28} />
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <Settings size={18} className="text-slate-300" />
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">{team.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Grade {team.grade}</span>
                  <span>•</span>
                  <span>Section {team.section}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex -space-x-3">
                  {[...Array(Math.min(4, team.studentIds.length))].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                      S
                    </div>
                  ))}
                  {team.studentIds.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white uppercase">
                      +{team.studentIds.length - 4}
                    </div>
                  )}
                  {team.studentIds.length === 0 && (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Empty Team</span>
                  )}
                </div>
                <button className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  <span>View Team</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Team Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] border-4 border-slate-900 p-10 max-w-xl w-full shadow-2xl"
          >
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">Create New Team</h3>
            <form onSubmit={handleAddTeam} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Team/Class Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Class 10-A or Football Under-14"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                  value={newTeam.name}
                  onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Grade</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newTeam.grade}
                    onChange={e => setNewTeam({...newTeam, grade: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Section</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newTeam.section}
                    onChange={e => setNewTeam({...newTeam, section: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                >
                  Create Team
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
