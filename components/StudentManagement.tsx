
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  UserPlus,
  FileUp,
  FileText,
  Download,
  Filter,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { fitnessService, Student, SchoolMember } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';

interface StudentManagementProps {
  onNavigate?: (tab: any) => void;
  onSelectStudent?: (id: string) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ onNavigate, onSelectStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [userProfile, setUserProfile] = useState<SchoolMember | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent = "Name,Roll Number,Grade,Section,Gender,Age\nJohn Doe,101,1,A,Male,6\nJane Smith,102,1,B,Female,6";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser || !userProfile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const header = lines[0].split(',');
      
      const newStudents: Student[] = [];
      
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < 6 || !auth.currentUser) continue;
        
        const student: Student = {
          id: Math.random().toString(36).substr(2, 9),
          name: values[0].trim(),
          rollNumber: values[1].trim(),
          grade: values[2].trim(),
          section: values[3].trim(),
          gender: values[4].trim() as any,
          age: parseInt(values[5].trim()) || 6,
          teacherId: auth.currentUser.uid,
          schoolId: userProfile.schoolId,
          attendance: 0,
          performance: 'Average'
        };
        newStudents.push(student);
      }

      if (newStudents.length > 0) {
        setLoading(true);
        try {
          await fitnessService.bulkSaveStudents(newStudents);
          alert(`Successfully imported ${newStudents.length} students.`);
          setIsImporting(false);
        } catch (err) {
          console.error(err);
          alert('Failed to import students. Check file format.');
        } finally {
          setLoading(false);
        }
      }
    };
    reader.readAsText(file);
  };
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    rollNumber: '',
    grade: '1',
    section: 'A',
    gender: 'Male',
    age: 6
  });

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const fetchProfileAndStudents = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const profile = await fitnessService.getSchoolMember(auth.currentUser.uid);
        setUserProfile(profile);

        if (profile) {
          const isAdmin = profile.role === 'admin';
          unsub = fitnessService.subscribeToStudents(
            auth.currentUser.uid,
            profile.schoolId,
            isAdmin,
            (data) => {
              setStudents(data);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in StudentManagement data fetch:", err);
        setLoading(false);
      }
    };

    fetchProfileAndStudents().catch(err => console.error("Unhandled error in StudentManagement fetch:", err));
    
    return () => unsub?.();
  }, [auth.currentUser?.uid]);

  const handleDeleteStudent = async (studentId: string) => {
    if (!auth.currentUser || !userProfile) return;
    if (!window.confirm("Are you sure you want to delete this student and all their fitness records? This cannot be undone.")) return;

    setLoading(true);
    try {
      await fitnessService.deleteStudent(studentId);
      // The real-time listener will update the list
    } catch (err) {
      console.error(err);
      alert("Failed to delete student.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNumber || !auth.currentUser || !userProfile) {
      alert('Please ensure you are logged in and your school profile is set up.');
      return;
    }

    try {
      const student: Student = {
        ...newStudent as Student,
        id: Math.random().toString(36).substr(2, 9),
        teacherId: auth.currentUser.uid,
        schoolId: userProfile.schoolId,
        attendance: 0,
        performance: 'Average'
      };

      await fitnessService.saveStudent(student);
      setIsAdding(false);
      setNewStudent({
        name: '',
        rollNumber: '',
        grade: '1',
        section: 'A',
        gender: 'Male',
        age: 6
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add student. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await fitnessService.deleteStudent(id);
      } catch (err) {
        console.error(err);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.includes(searchTerm) ||
    s.grade.includes(searchTerm)
  );

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
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Student Directory</h2>
          <p className="text-slate-500 font-medium">Manage student profiles and academic details.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImporting(true)}
            className="px-6 py-3 bg-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2"
          >
            <FileUp size={16} />
            <span>Import Student Data</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-indigo-600 text-white border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2"
          >
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-900 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, roll number, or grade..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-900">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade/Sec</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender/Age</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Users size={32} className="text-slate-200" />
                    </div>
                    <p className="font-black text-slate-900 uppercase tracking-tight">No students found</p>
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                    >
                      Add your first student
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-black text-slate-900 uppercase tracking-tight">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-bold text-slate-500">{student.rollNumber}</span>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {student.grade} - {student.section}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-slate-600">{student.gender}, {student.age}y</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onSelectStudent?.(student.id)}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors flex items-center gap-1"
                        title="View Performance Report"
                      >
                        <FileText size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Report</span>
                      </button>
                      <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] border-4 border-slate-900 p-10 max-w-xl w-full shadow-2xl"
          >
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newStudent.name}
                    onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Roll Number</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newStudent.rollNumber}
                    onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Age</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newStudent.age}
                    onChange={e => setNewStudent({...newStudent, age: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Grade</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 10"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newStudent.grade}
                    onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Section</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. A"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={newStudent.section}
                    onChange={e => setNewStudent({...newStudent, section: e.target.value})}
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
                  Save Student
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Import Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] border-4 border-slate-900 p-10 max-w-xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Import Students</h3>
                <p className="text-slate-500 font-medium text-sm">Upload a CSV file to add multiple students at once.</p>
              </div>
              <button 
                onClick={() => setIsImporting(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Trash2 size={24} className="text-slate-400 rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-8 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center text-center">
                <FileUp size={48} className="text-indigo-600 mb-4" />
                <p className="font-black text-slate-900 uppercase tracking-tight mb-2">Choose CSV File</p>
                <p className="text-xs text-slate-400 font-bold mb-6">Format: Name, Roll No, Grade, Section, Gender, Age</p>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="csvUpload" 
                />
                <label 
                  htmlFor="csvUpload"
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-800 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                >
                  Select File
                </label>
              </div>

              <div className="p-6 bg-indigo-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Getting Started</p>
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">Need a template?</p>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-white border-2 border-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
                >
                  <Download size={14} />
                  <span>Template</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
