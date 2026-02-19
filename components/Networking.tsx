
import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  GraduationCap, 
  UserPlus, 
  MessageCircle,
  MoreVertical,
  Filter,
  CheckCircle2,
  Edit2,
  Plus,
  X
} from 'lucide-react';
import { BoardType, TeacherProfile } from '../types';

const Networking: React.FC = () => {
  const [activeBoard, setActiveBoard] = useState<BoardType | 'All'>('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<TeacherProfile> | null>(null);

  // Initial Dummy Data
  const [teachers, setTeachers] = useState<TeacherProfile[]>([
    { id: '0', name: 'L. Samy', location: 'India', board: BoardType.CBSE, specialization: ['Physical Education', 'Sports Management'], experience: 20, avatar: 'https://ui-avatars.com/api/?name=L+Samy&background=6366f1&color=fff&size=200' },
    { id: '1', name: 'Dr. Manish Pandey', location: 'Ahmedabad, Gujarat', board: BoardType.CBSE, specialization: ['Yoga', 'Athletics'], experience: 15, avatar: 'https://picsum.photos/seed/mp/200' },
    { id: '2', name: 'Priya Sundaram', location: 'Chennai, Tamil Nadu', board: BoardType.STATE, specialization: ['Kho-Kho', 'Nutrition'], experience: 8, avatar: 'https://picsum.photos/seed/ps/200' },
    { id: '3', name: 'Vikram Singh', location: 'Chandigarh, Punjab', board: BoardType.ICSE, specialization: ['Hockey', 'Gymnastics'], experience: 12, avatar: 'https://picsum.photos/seed/vs/200' },
    { id: '4', name: 'Anjali Gupta', location: 'Delhi, NCR', board: BoardType.CBSE, specialization: ['Basketball', 'Wellness'], experience: 5, avatar: 'https://picsum.photos/seed/ag/200' },
    { id: '5', name: 'Rahul Bose', location: 'Kolkata, WB', board: BoardType.STATE, specialization: ['Football', 'Cricket'], experience: 20, avatar: 'https://picsum.photos/seed/rb/200' },
    { id: '6', name: 'Sonia Williams', location: 'Mumbai, MH', board: BoardType.IB, specialization: ['Swim', 'Personal Training'], experience: 10, avatar: 'https://picsum.photos/seed/sw/200' },
  ]);

  const filtered = activeBoard === 'All' 
    ? teachers 
    : teachers.filter(t => t.board === activeBoard);

  const handleEdit = (profile: TeacherProfile) => {
    setEditingProfile(profile);
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setEditingProfile({
      id: Date.now().toString(),
      name: '',
      location: '',
      board: BoardType.CBSE,
      specialization: [],
      experience: 0,
      avatar: `https://picsum.photos/seed/${Date.now()}/200`
    });
    setShowEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.name) return;

    // Check if updating existing or adding new
    const existingIndex = teachers.findIndex(t => t.id === editingProfile.id);
    if (existingIndex >= 0) {
      const updated = [...teachers];
      updated[existingIndex] = editingProfile as TeacherProfile;
      setTeachers(updated);
    } else {
      setTeachers([editingProfile as TeacherProfile, ...teachers]);
    }
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search teachers by name, location or sport..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
          {['All', ...Object.values(BoardType)].map(b => (
            <button
              key={b}
              onClick={() => setActiveBoard(b as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeBoard === b 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {b}
            </button>
          ))}
          <button 
            onClick={handleAddNew}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center space-x-1 hover:bg-emerald-600 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(teacher => (
          <div key={teacher.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative group hover:shadow-xl hover:border-indigo-100 transition-all">
            <div className="absolute top-6 right-6 flex space-x-2">
               <button 
                 onClick={() => handleEdit(teacher)}
                 className="text-slate-300 hover:text-indigo-600 transition-colors p-1 bg-white rounded-full border border-transparent hover:border-indigo-100"
               >
                  <Edit2 size={16} />
               </button>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img 
                  src={teacher.avatar} 
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-50 group-hover:border-indigo-50 transition-all" 
                  alt={teacher.name} 
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg border-4 border-white">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-slate-800 mb-1">{teacher.name}</h3>
              <div className="flex items-center text-slate-400 text-xs mb-4">
                <MapPin size={12} className="mr-1" />
                {teacher.location}
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {teacher.board}
                </span>
                <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {teacher.experience}Yrs Exp
                </span>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-start space-x-2 text-left">
                  <GraduationCap size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-snug">
                    Spec: <span className="font-semibold">{teacher.specialization.join(', ')}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex gap-2">
              <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2">
                <UserPlus size={16} />
                <span>Connect</span>
              </button>
              <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Community Activity Feed */}
      <div className="mt-12 bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-indigo-900">Recent Community Activity</h3>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">View All Updates</button>
        </div>
        <div className="space-y-4">
          {[
            { user: 'L. Samy', action: 'welcomed new members to', target: 'India PE Connect', time: '1h ago' },
            { user: 'Rahul Bose', action: 'shared a new drill for', target: 'Under-14 Football coaching', time: '2h ago' },
            { user: 'Priya Sundaram', action: 'started a discussion on', target: 'Yoga in State Board schools', time: '5h ago' },
            { user: 'Dr. Manish Pandey', action: 'updated his profile', target: 'Ahmedabad PE Network', time: '1d ago' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-indigo-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  {item.user[0]}
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">{item.user}</span> {item.action} <span className="font-bold text-indigo-600">{item.target}</span>
                </p>
              </div>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black text-slate-800 mb-6">
               {teachers.find(t => t.id === editingProfile.id) ? 'Edit Profile' : 'Add New Member'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                  <input 
                    type="text" required
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Experience (Yrs)</label>
                  <input 
                    type="number" 
                    value={editingProfile.experience}
                    onChange={(e) => setEditingProfile({...editingProfile, experience: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                <input 
                  type="text" 
                  value={editingProfile.location}
                  onChange={(e) => setEditingProfile({...editingProfile, location: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Board</label>
                    <select 
                      value={editingProfile.board}
                      onChange={(e) => setEditingProfile({...editingProfile, board: e.target.value as BoardType})}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                    >
                      {Object.values(BoardType).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Specialization (comma sep)</label>
                    <input 
                      type="text" 
                      value={editingProfile.specialization?.join(', ')}
                      onChange={(e) => setEditingProfile({...editingProfile, specialization: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                    />
                 </div>
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg mt-4">
                Save Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Networking;
