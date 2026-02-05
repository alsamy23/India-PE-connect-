
import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  FileText,
  Video,
  Info
} from 'lucide-react';
import { BoardType } from '../types';

const CurriculumHub: React.FC = () => {
  const [selectedBoard, setSelectedBoard] = useState<BoardType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const resources = [
    { id: '1', title: 'CBSE Secondary PE Curriculum 2024-25', board: BoardType.CBSE, grade: '9-10', date: 'Mar 2024', type: 'PDF' },
    { id: '2', title: 'Maharashtra State Board Wellness Guidelines', board: BoardType.STATE, grade: '1-8', date: 'Jan 2024', type: 'PDF' },
    { id: '3', title: 'ICSE Sports & Health Policy Framework', board: BoardType.ICSE, grade: 'All', date: 'Feb 2024', type: 'Article' },
    { id: '4', title: 'NCERT PE Syllabus - Primary Phase', board: BoardType.CBSE, grade: '1-5', date: 'Dec 2023', type: 'PDF' },
    { id: '5', title: 'Tamil Nadu Physical Education Textbooks', board: BoardType.STATE, grade: '11-12', date: 'Apr 2024', type: 'PDF' },
    { id: '6', title: 'Yoga Education Module for Schools', board: BoardType.CBSE, grade: '6-12', date: 'May 2024', type: 'Video' },
  ];

  const filtered = resources.filter(res => {
    const matchesBoard = selectedBoard === 'All' || res.board === selectedBoard;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBoard && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Board Selector */}
        <div className="flex flex-wrap gap-2">
          {['All', ...Object.values(BoardType)].map((board) => (
            <button
              key={board}
              onClick={() => setSelectedBoard(board as any)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedBoard === board 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
              `}
            >
              {board}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res, i) => (
          <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                res.board === BoardType.CBSE ? 'bg-blue-100 text-blue-700' :
                res.board === BoardType.ICSE ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {res.board}
              </span>
              <div className="text-slate-400">
                {res.type === 'PDF' && <FileText size={20} />}
                {res.type === 'Video' && <Video size={20} />}
                {res.type === 'Article' && <Info size={20} />}
              </div>
            </div>
            
            <h4 className="font-bold text-slate-800 mb-2 flex-grow">{res.title}</h4>
            
            <div className="flex items-center space-x-4 text-xs text-slate-500 mb-6">
              <span className="flex items-center"><CheckCircle2 size={12} className="mr-1 text-emerald-500" /> Grade {res.grade}</span>
              <span>Updated: {res.date}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                <Download size={16} />
                <span>Download</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="max-w-xs mx-auto space-y-3">
            <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">No resources found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or search keywords to find what you're looking for.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumHub;
