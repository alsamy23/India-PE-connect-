import React, { useState } from 'react';
import { Search, Download, ExternalLink, CheckCircle2, FileText, Video, Info, BookOpen } from 'lucide-react';
import { BoardType } from '../types';

const resources = [
  {
    id: '1', title: 'CBSE Physical Education Curriculum 2024-25 (Class 9-10)',
    board: BoardType.CBSE, grade: '9-10', date: 'Mar 2024', type: 'PDF',
    downloadUrl: 'https://cbseacademic.nic.in/web_material/CurriculumMain24/SecondaryNew/PhysicalEducation_Secondary_2024.pdf',
    viewUrl: 'https://cbseacademic.nic.in/curriculum_2024.html',
  },
  {
    id: '2', title: 'CBSE Physical Education Curriculum 2024-25 (Class 11-12)',
    board: BoardType.CBSE, grade: '11-12', date: 'Mar 2024', type: 'PDF',
    downloadUrl: 'https://cbseacademic.nic.in/web_material/CurriculumMain24/SeniorSecondaryNew/PhysicalEducation_SeniorSecondary_2024.pdf',
    viewUrl: 'https://cbseacademic.nic.in/curriculum_2024.html',
  },
  {
    id: '3', title: 'NCERT Health & Physical Education Textbook Class 11',
    board: BoardType.CBSE, grade: '11', date: 'Jan 2024', type: 'PDF',
    downloadUrl: 'https://ncert.nic.in/textbook.php?kehp1=0-10',
    viewUrl: 'https://ncert.nic.in/textbook.php?kehp1=0-10',
  },
  {
    id: '4', title: 'NCERT Health & Physical Education Textbook Class 12',
    board: BoardType.CBSE, grade: '12', date: 'Jan 2024', type: 'PDF',
    downloadUrl: 'https://ncert.nic.in/textbook.php?lehp1=0-10',
    viewUrl: 'https://ncert.nic.in/textbook.php?lehp1=0-10',
  },
  {
    id: '5', title: 'NCERT Health & Physical Education Class 9',
    board: BoardType.CBSE, grade: '9', date: 'Dec 2023', type: 'PDF',
    downloadUrl: 'https://ncert.nic.in/textbook.php?iehp1=0-9',
    viewUrl: 'https://ncert.nic.in/textbook.php?iehp1=0-9',
  },
  {
    id: '6', title: 'NCERT Health & Physical Education Class 10',
    board: BoardType.CBSE, grade: '10', date: 'Dec 2023', type: 'PDF',
    downloadUrl: 'https://ncert.nic.in/textbook.php?jehp1=0-9',
    viewUrl: 'https://ncert.nic.in/textbook.php?jehp1=0-9',
  },
  {
    id: '7', title: 'Khelo India Programme Guidelines',
    board: BoardType.STATE, grade: 'All', date: 'Apr 2024', type: 'PDF',
    downloadUrl: 'https://kheloindia.gov.in/storage/uploads/guidelines/KheloIndiaGuidelines.pdf',
    viewUrl: 'https://kheloindia.gov.in/',
  },
  {
    id: '8', title: 'ICSE Physical Education Syllabus (Class 9-10)',
    board: BoardType.ICSE, grade: '9-10', date: 'Feb 2024', type: 'PDF',
    downloadUrl: 'https://www.cisce.org/UploadedFiles/PDF/20200311112247___PhysicalEducation_Class9&10.pdf',
    viewUrl: 'https://www.cisce.org/publications.aspx',
  },
  {
    id: '9', title: 'CBSE Sample Paper Physical Education 2024-25',
    board: BoardType.CBSE, grade: '12', date: 'Oct 2024', type: 'PDF',
    downloadUrl: 'https://cbseacademic.nic.in/SampleQuestion2025/classXII/Physical-Education-XII-SQP-2025.pdf',
    viewUrl: 'https://cbseacademic.nic.in/SQP_CLASSXII_2024-25.html',
  },
  {
    id: '10', title: 'Yoga Education in Schools – NCERT Module',
    board: BoardType.CBSE, grade: '6-12', date: 'May 2024', type: 'PDF',
    downloadUrl: 'https://ncert.nic.in/pdf/publication/scienceliterature/YogaEducation.pdf',
    viewUrl: 'https://ncert.nic.in/publication.php',
  },
  {
    id: '11', title: 'CBSE PE Marking Scheme 2024-25',
    board: BoardType.CBSE, grade: '11-12', date: 'Nov 2024', type: 'PDF',
    downloadUrl: 'https://cbseacademic.nic.in/SampleQuestion2025/classXII/Physical-Education-XII-MS-2025.pdf',
    viewUrl: 'https://cbseacademic.nic.in/SQP_CLASSXII_2024-25.html',
  },
  {
    id: '12', title: 'National Curriculum Framework for School Education',
    board: BoardType.STATE, grade: 'All', date: 'Jun 2024', type: 'PDF',
    downloadUrl: 'https://ncfserver.ncert.nic.in/pdf/ncf/NCF-SE-Pre-Draft.pdf',
    viewUrl: 'https://ncert.nic.in/NCF-SE.php',
  },
];

const CurriculumHub: React.FC = () => {
  const [selectedBoard, setSelectedBoard] = useState<BoardType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = resources.filter(res => {
    const matchesBoard = selectedBoard === 'All' || res.board === selectedBoard;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBoard && matchesSearch;
  });

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = title + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {(['All', ...Object.values(BoardType)] as string[]).map((board) => (
            <button
              key={board}
              onClick={() => setSelectedBoard(board as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBoard === board
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {board}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => (
          <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                res.board === BoardType.CBSE ? 'bg-blue-100 text-blue-700' :
                res.board === BoardType.ICSE ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>{res.board}</span>
              <div className="text-slate-400">
                {res.type === 'PDF' && <FileText size={20} />}
                {res.type === 'Video' && <Video size={20} />}
                {res.type === 'Article' && <Info size={20} />}
              </div>
            </div>
            <h4 className="font-bold text-slate-800 mb-2 flex-grow text-sm leading-snug">{res.title}</h4>
            <div className="flex items-center space-x-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center"><CheckCircle2 size={12} className="mr-1 text-emerald-500" /> Grade {res.grade}</span>
              <span>Updated: {res.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(res.downloadUrl, res.title)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >
                <Download size={15} />
                <span>Download</span>
              </button>
              <a
                href={res.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Open official page"
              >
                <ExternalLink size={17} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="max-w-xs mx-auto space-y-3">
            <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">No resources found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or search keywords.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumHub;
