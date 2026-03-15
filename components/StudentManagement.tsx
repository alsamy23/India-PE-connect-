import React, { useState } from 'react';
import { 
  Users, Trophy, Activity, Check, X, Plus, Trash2, Star, 
  ChevronRight, Calendar, UserPlus, FileText, Download, Share2
} from 'lucide-react';

// ─── 1. Attendance & Class Register ──────────────────────────────────────────
const AttendanceRegister: React.FC = () => {
  const [students, setStudents] = useState([
    { id: 1, name: 'Aditya Karma', status: 'present' },
    { id: 2, name: 'Ishaan Reddy', status: 'present' },
    { id: 3, name: 'Sanya Malhotra', status: 'absent' },
    { id: 4, name: 'Vihaan Singh', status: 'present' },
    { id: 5, name: 'Ananya Gupta', status: 'present' },
  ]);
  const [newStudent, setNewStudent] = useState('');

  const toggleStatus = (id: number) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
    ));
  };

  const addStudent = () => {
    if (newStudent.trim()) {
      setStudents([...students, { id: Date.now(), name: newStudent.trim(), status: 'present' }]);
      setNewStudent('');
    }
  };

  const presentCount = students.filter(s => s.status === 'present').length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-800">Class Register</h3>
            <p className="text-sm text-slate-400 font-medium">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Attendance: </span>
            <span className="text-lg font-black text-indigo-900">{presentCount} / {students.length}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <input 
            value={newStudent} 
            onChange={e => setNewStudent(e.target.value)}
            placeholder="Student Name..." 
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
          />
          <button onClick={addStudent} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><UserPlus size={20} /></button>
        </div>

        <div className="space-y-2">
          {students.map(student => (
            <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${student.status === 'present' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${student.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={`font-bold ${student.status === 'present' ? 'text-emerald-900' : 'text-rose-900'}`}>{student.name}</span>
              </div>
              <button 
                onClick={() => toggleStatus(student.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  student.status === 'present' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-rose-600 text-white'
                }`}
              >
                {student.status === 'present' ? 'Present' : 'Absent'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 2. Student Achievement Tracker ──────────────────────────────────────────
const AchievementTracker: React.FC = () => {
  const [achievements, setAchievements] = useState([
    { id: 1, student: 'Ishaan Reddy', award: 'Gold Medal', activity: '100m Sprint', date: '12 Mar 2024' },
    { id: 2, student: 'Ananya Gupta', award: 'Player of the Match', activity: 'Cricket', date: '10 Mar 2024' },
    { id: 3, student: 'Aditya Karma', award: 'Most Improved', activity: 'Basketball', date: '08 Mar 2024' },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-slate-800">Achievement Wall</h3>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2">
            <Plus size={14} /> Add Achievement
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(a => (
            <div key={a.id} className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
              <Star className="absolute right-[-10px] top-[-10px] w-20 h-20 text-amber-500/10 group-hover:scale-125 transition-transform" />
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl w-fit mb-4">
                <Trophy size={24} />
              </div>
              <h4 className="font-black text-slate-800 text-lg mb-1">{a.student}</h4>
              <p className="text-amber-600 font-black text-xs uppercase tracking-widest mb-4">{a.award}</p>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto">
                <span>{a.activity}</span>
                <span>{a.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 3. Class Fitness Profile ────────────────────────────────────────────────
const FitnessProfile: React.FC = () => {
  const metrics = [
    { label: 'Avg BMI Status', value: 'Healthy', color: 'text-emerald-500' },
    { label: 'Endurance Score', value: '7.8/10', color: 'text-indigo-500' },
    { label: 'Flexibility', value: '65%', color: 'text-purple-500' },
    { label: 'Strength Avg', value: '42 reps', color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Class Fitness Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map(m => (
            <div key={m.label} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
              <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <Activity className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5" />
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-4">Fitness Trends</h4>
            <div className="space-y-4">
              {[
                { label: 'Cardio Fitness', progress: 75, color: 'bg-emerald-500' },
                { label: 'Agility Skills', progress: 58, color: 'bg-orange-500' },
                { label: 'Teamwork & Sportmanship', progress: 88, color: 'bg-indigo-500' },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
                    <span className="text-slate-400">{bar.label}</span>
                    <span className="text-white">{bar.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full transition-all duration-1000`} style={{ width: `${bar.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Student Management Component ───────────────────────────────────────
const StudentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'achievements' | 'fitness'>('attendance');

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'fitness', label: 'Fitness Profile', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in slide-in-from-bottom-5 duration-500">
      {/* Tab Navigation */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm gap-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? `${tab.bg} ${tab.color} shadow-sm border border-slate-100` 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <tab.icon size={20} className={isActive ? 'animate-bounce' : ''} />
              <span className="text-xs font-black uppercase tracking-widest leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in zoom-in-95 duration-500">
        {activeTab === 'attendance' && <AttendanceRegister />}
        {activeTab === 'achievements' && <AchievementTracker />}
        {activeTab === 'fitness' && <FitnessProfile />}
      </div>

      {/* Footer Info */}
      <div className="bg-indigo-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl ring-1 ring-white/20">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="font-black text-lg leading-tight">Student Reports</h4>
            <p className="text-xs text-indigo-300 font-medium">Generate comprehensive reports for entire class or individual students.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/10">
            <Download size={14} /> Export CSV
          </button>
          <button className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
            <Share2 size={14} /> Share PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
