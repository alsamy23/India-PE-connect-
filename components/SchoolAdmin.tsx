
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserPlus, 
  Mail, 
  Trash2, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { fitnessService, SchoolMember } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';

const SchoolAdmin: React.FC = () => {
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState<{ email: string; displayName: string; role: 'teacher' | 'admin' }>({ 
    email: '', 
    displayName: '', 
    role: 'teacher' 
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<SchoolMember | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchData = async () => {
      try {
        const profile = await fitnessService.getSchoolMember(auth.currentUser!.uid);
        setUserProfile(profile);

        if (profile && profile.role === 'admin') {
          const schoolMembers = await fitnessService.getSchoolMembers(profile.schoolId);
          setMembers(schoolMembers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || userProfile.role !== 'admin') return;

    setLoading(true);
    setError(null);
    try {
      await fitnessService.addTeamMember({
        uid: `pending_${Math.random().toString(36).substr(2, 9)}`,
        schoolId: userProfile.schoolId,
        ...newMember
      });
      
      setSuccess(`Member ${newMember.displayName} added successfully.`);
      setIsAdding(false);
      setNewMember({ email: '', displayName: '', role: 'teacher' });
      
      // Refresh list
      const schoolMembers = await fitnessService.getSchoolMembers(userProfile.schoolId);
      setMembers(schoolMembers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !members.length) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return (
      <div className="p-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <Shield size={32} className="text-red-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Denied</h3>
        <p className="text-slate-500 max-w-md mx-auto">Only school administrators can manage team members and school-wide settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">School Administration</h2>
          <p className="text-slate-500 font-medium">Manage your school's teaching staff and permissions.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-indigo-600 text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2"
        >
          <UserPlus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="hover:underline">Dismiss</button>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-900">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map(member => (
              <tr key={member.uid} className="hover:bg-slate-50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                      {member.displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-black text-slate-900 uppercase tracking-tight">{member.displayName}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="font-bold text-slate-500">{member.email}</span>
                </td>
                <td className="p-6">
                  <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    member.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-6 text-right">
                  {member.uid !== auth.currentUser?.uid && (
                    <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] border-4 border-slate-900 p-10 max-w-xl w-full shadow-2xl"
          >
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">Add Team Member</h3>
            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                      value={newMember.displayName}
                      onChange={e => setNewMember({...newMember, displayName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                      value={newMember.email}
                      onChange={e => setNewMember({...newMember, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newMember.role}
                    onChange={e => setNewMember({...newMember, role: e.target.value as 'teacher' | 'admin'})}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                  disabled={loading}
                  className="flex-1 py-4 bg-indigo-600 text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Add Member'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SchoolAdmin;
