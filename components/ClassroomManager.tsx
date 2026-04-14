import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Plus,
  ArrowRight,
  Download,
  Mail,
  Phone,
  GraduationCap,
  Trophy,
  Activity
} from 'lucide-react';
import { Student } from '../types.ts';

const MOCK_STUDENTS: any[] = [
  { id: '1', name: 'Arjun Singh', rollNumber: 'PE-001', grade: '12', section: 'A', attendance: 92, performance: 'Excellent', lastAssessment: '95/100' },
  { id: '2', name: 'Priya Sharma', rollNumber: 'PE-002', grade: '12', section: 'A', attendance: 88, performance: 'Good', lastAssessment: '82/100' },
  { id: '3', name: 'Rahul Verma', rollNumber: 'PE-003', grade: '12', section: 'A', attendance: 75, performance: 'Average', lastAssessment: '65/100' },
  { id: '4', name: 'Ananya Iyer', rollNumber: 'PE-004', grade: '12', section: 'A', attendance: 95, performance: 'Excellent', lastAssessment: '98/100' },
  { id: '5', name: 'Vikram Malhotra', rollNumber: 'PE-005', grade: '12', section: 'A', attendance: 60, performance: 'Needs Improvement', lastAssessment: '45/100' },
];

const ClassroomManager: React.FC = () => {
  const [students, setStudents] = useState<any[]>(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('12-A');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full">
              <Users size={14} className="text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Classroom Management</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Class <span className="text-orange-500">Manager</span></h1>
            <p className="text-slate-400 text-sm font-medium max-w-md">
              Track attendance, monitor performance, and manage student profiles effortlessly.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center space-x-2 shadow-xl">
              <UserPlus size={18} />
              <span>Add Student</span>
            </button>
            <button className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center space-x-2 shadow-xl shadow-orange-500/20">
              <Plus size={18} />
              <span>New Class</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: '124', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg. Attendance', value: '84%', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Top Performers', value: '18', icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Avg. Fitness Score', value: '7.2', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-6">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name or roll number..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 font-bold text-slate-700 text-sm"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-orange-600 transition-colors border border-slate-100">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto">
            <select 
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 font-black text-xs uppercase tracking-widest text-slate-600"
            >
              <option>12-A</option>
              <option>12-B</option>
              <option>11-A</option>
              <option>11-B</option>
            </select>
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center space-x-2">
              <Download size={16} />
              <span>Export List</span>
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Roll No.</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Assessment</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                        {student.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-500 font-mono">{student.rollNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.attendance > 85 ? 'bg-emerald-500' : student.attendance > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${student.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-700">{student.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`
                      px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                      ${student.performance === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : 
                        student.performance === 'Good' ? 'bg-blue-100 text-blue-700' : 
                        student.performance === 'Average' ? 'bg-amber-100 text-amber-700' : 
                        'bg-rose-100 text-rose-700'}
                    `}>
                      {student.performance}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-slate-800">{student.lastAssessment}</span>
                      {student.performance === 'Excellent' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-orange-600 transition-all">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-orange-600 transition-all">
                        <Phone size={16} />
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing 5 of 124 students</p>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Previous</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomManager;
