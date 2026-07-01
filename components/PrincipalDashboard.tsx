import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Award, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Download, 
  TrendingUp, 
  AlertCircle, 
  Printer, 
  Layers, 
  Zap, 
  UserCheck,
  Edit,
  Plus,
  Trash2,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  FileSpreadsheet,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EventItem {
  id: string;
  name: string;
  date: string;
  type: string;
  status: string;
  inCharge: string;
  description: string;
  evidenceFiles: string[];
  fixtures?: {
    round: string;
    teamA: string;
    teamB: string;
    score?: string;
    winner?: string;
  }[];
  roster?: string[];
}

export const PrincipalDashboard: React.FC = () => {
  // Mode selection: Institutional Viewer or Data Input Desk
  const [dashboardMode, setDashboardMode] = useState<'viewer' | 'editor'>('viewer');
  
  // State for collapsible Guidelines Card
  const [showGuidelines, setShowGuidelines] = useState(true);

  // Filter states
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Full Year'>('Full Year');
  const [selectedGradeBand, setSelectedGradeBand] = useState<'All' | 'Primary (1-5)' | 'Middle (6-8)' | 'Secondary (9-12)'>('All');
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventItem | null>(null);
  const [selectedEvidencePreview, setSelectedEvidencePreview] = useState<string | null>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'details' | 'photos' | 'evidence'>('details');

  // 1. DYNAMIC METRICS STATE
  const [lessonCompliance, setLessonCompliance] = useState(96.8);
  const [plannedClasses, setPlannedClasses] = useState(192);
  const [deliveredClasses, setDeliveredClasses] = useState(186);

  const [studentParticipation, setStudentParticipation] = useState(92.4);
  const [assessmentComplete, setAssessmentComplete] = useState(88.5);
  const [complianceStatus, setComplianceStatus] = useState<'Inspection Ready' | 'Highly Compliant' | 'Pending Review'>('Inspection Ready');

  // 2. DYNAMIC FITNESS TEST SCORES STATE (feeds the BarChart)
  const [fitnessData, setFitnessData] = useState([
    { metric: 'Cardio Endurance', Baseline: 64, Current: 78, Improvement: '+21.8%' },
    { metric: 'Abdominal Strength', Baseline: 58, Current: 72, Improvement: '+24.1%' },
    { metric: 'Flexibility', Baseline: 70, Current: 83, Improvement: '+18.5%' },
    { metric: 'Speed (50m Sprint)', Baseline: 52, Current: 65, Improvement: '+25.0%' },
    { metric: 'Agility (Shuttle Run)', Baseline: 60, Current: 74, Improvement: '+23.3%' },
  ]);

  // Edit states for individual fitness metrics
  const [editingFitnessIndex, setEditingFitnessIndex] = useState<number | null>(null);
  const [editBaselineVal, setEditBaselineVal] = useState(0);
  const [editCurrentVal, setEditCurrentVal] = useState(0);

  // 3. DYNAMIC WEEKLY PARTICIPATION STATE (feeds the AreaChart)
  const [participationData, setParticipationData] = useState([
    { name: 'Week 1', 'Grade 1-5': 88, 'Grade 6-8': 92, 'Grade 9-12': 85 },
    { name: 'Week 4', 'Grade 1-5': 90, 'Grade 6-8': 94, 'Grade 9-12': 86 },
    { name: 'Week 8', 'Grade 1-5': 93, 'Grade 6-8': 91, 'Grade 9-12': 89 },
    { name: 'Week 12', 'Grade 1-5': 95, 'Grade 6-8': 95, 'Grade 9-12': 88 },
    { name: 'Week 16', 'Grade 1-5': 92, 'Grade 6-8': 93, 'Grade 9-12': 91 },
    { name: 'Week 20', 'Grade 1-5': 96, 'Grade 6-8': 96, 'Grade 9-12': 92 },
  ]);

  // 4. DYNAMIC CALENDAR EVENTS STATE
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([
    { 
      id: 'evt-1',
      name: 'Annual Sports Day Meet', 
      date: 'August 29, 2026', 
      type: 'School-wide', 
      status: 'Approved & Scheduled', 
      inCharge: 'Coach Suresh Kumar',
      description: 'The major annual athletic showcase featuring track relays, high jump finals, Tug of War, and march-past drills of all four houses (Agni, Jal, Prithvi, Vayu). All sports equipment safety clearance has been fully audited.',
      evidenceFiles: ['sports_day_itinerary.pdf', 'house_marchpast_roster.xlsx', 'track_safety_clearance.pdf'],
      roster: ['Aditya Sen (Agni Captain)', 'Meera Nair (Jal Captain)', 'Rahul Jha (Prithvi Captain)', 'Jaspreet Singh (Vayu Captain)'],
      fixtures: [
        { round: '100m Dash Final', teamA: 'Agni (Pranav)', teamB: 'Vayu (Gurpreet)', score: '11.4s vs 11.6s', winner: 'Agni (Pranav)' },
        { round: 'Inter-House Relay 4x100m', teamA: 'Prithvi House', teamB: 'Jal House', score: '48.2s vs 49.5s', winner: 'Prithvi House' }
      ]
    },
    { 
      id: 'evt-2',
      name: 'CBSE Cluster South Zone Football', 
      date: 'October 12, 2026', 
      type: 'Inter-School', 
      status: 'Registration Complete', 
      inCharge: 'Coach Priya Sharma',
      description: 'South Zone regional qualifiers for secondary boys and girls categories under the CBSE sports affiliation rules. Teams representing 32 top schools will compete on a knockout bracket scheme.',
      evidenceFiles: ['cbse_registration_confirmation.pdf', 'under_17_medical_fitness_logs.pdf', 'travel_consent_slips.zip'],
      roster: ['Devanshu Rao (GK)', 'Kabir Mehrotra (CB)', 'Arjun Saxena (CM)', 'Siddharth Chawla (ST)', 'Rishi Prasad (LM)'],
      fixtures: [
        { round: 'Quarter Final', teamA: 'SmartPE Elite (Our School)', teamB: 'Greenfield Public', score: '3 - 1', winner: 'SmartPE Elite (Our School)' },
        { round: 'Semi Final', teamA: 'SmartPE Elite (Our School)', teamB: 'St. Xavier Academy', score: 'Pending Play', winner: 'To be played' }
      ]
    },
    { 
      id: 'evt-3',
      name: 'Fit India Week Celebrations', 
      date: 'November 14, 2026', 
      type: 'Ministry of Sports', 
      status: 'Activity Draft Ready', 
      inCharge: 'All PE Staff',
      description: 'National wellness campaign spearheaded by the Ministry of Youth Affairs and Sports. Activites include family yoga seminars, indigenous games revival (Kabaddi, Kho-Kho), and daily nutritional guidance letters sent to all parents.',
      evidenceFiles: ['fit_india_activities_draft.pdf', 'nutrition_guidelines_parent_letter.pdf', 'yoga_seminar_speaker_profile.pdf'],
      roster: ['All Students (Grades 1 to 12)', 'PE Faculty Core Committee', 'Parent Volunteers Assoc.'],
      fixtures: [
        { round: 'Day 1: Mass Yoga Session', teamA: 'Primary Wing', teamB: 'Secondary Wing', score: 'Delivered', winner: 'All Compliant' },
        { round: 'Day 3: Kho-Kho League', teamA: 'Jal House', teamB: 'Vayu House', score: '12 - 8', winner: 'Jal House' }
      ]
    },
    { 
      id: 'evt-4',
      name: 'Inter-House Volleyball Tournament', 
      date: 'December 05, 2026', 
      type: 'Internal', 
      status: 'Fixtures Published', 
      inCharge: 'Coach Amit Singh',
      description: 'Intramural seasonal league structured in a double round-robin. Match points will feed directly into the final Agni/Jal/Prithvi/Vayu annual sports trophy tally shown in the PE Department Office.',
      evidenceFiles: ['volleyball_fixtures_bracket.pdf', 'referee_assignment_sheet.pdf'],
      roster: ['Harish Sharma (Ref)', 'Riya Sen (Prithvi Lead)', 'Ananya Roy (Vayu Lead)'],
      fixtures: [
        { round: 'League Match 1', teamA: 'Agni House', teamB: 'Jal House', score: '25-23, 25-21', winner: 'Agni House' },
        { round: 'League Match 2', teamA: 'Prithvi House', teamB: 'Vayu House', score: '25-18, 22-25, 15-11', winner: 'Prithvi House' }
      ]
    },
  ]);

  // States for adding a new Event
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-08-15');
  const [newEventInCharge, setNewEventInCharge] = useState('');
  const [newEventType, setNewEventType] = useState('School-wide');
  const [newEventStatus, setNewEventStatus] = useState('Approved & Scheduled');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Handle printing/PDF generation
  const handlePrintReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      window.print();
    }, 1200);
  };

  // Add new event handler
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName || !newEventInCharge) return;

    const added: EventItem = {
      id: `evt-${Date.now()}`,
      name: newEventName,
      date: newEventDate,
      type: newEventType,
      status: newEventStatus,
      inCharge: newEventInCharge,
      description: newEventDesc || 'No details provided.',
      evidenceFiles: ['event_manifesto.pdf', 'risk_assessment_checklist.xlsx'],
      roster: ['Assigned Class Students', 'Assigned PE Instructor'],
      fixtures: [
        { round: 'Round 1', teamA: 'Team Alpha', teamB: 'Team Beta', score: 'TBD', winner: 'TBD' }
      ]
    };

    setUpcomingEvents([...upcomingEvents, added]);
    // reset form
    setNewEventName('');
    setNewEventInCharge('');
    setNewEventDesc('');
  };

  // Delete event handler
  const handleDeleteEvent = (id: string) => {
    setUpcomingEvents(upcomingEvents.filter(e => e.id !== id));
    if (selectedEventDetails?.id === id) {
      setSelectedEventDetails(null);
    }
  };

  // Update a specific fitness parameter row
  const handleSaveFitnessEdit = () => {
    if (editingFitnessIndex === null) return;
    const updated = [...fitnessData];
    const impValue = editBaselineVal > 0 ? ((editCurrentVal - editBaselineVal) / editBaselineVal) * 100 : 0;
    const impPercentage = impValue.toFixed(1);
    
    updated[editingFitnessIndex] = {
      ...updated[editingFitnessIndex],
      Baseline: editBaselineVal,
      Current: editCurrentVal,
      Improvement: `${impValue >= 0 ? '+' : ''}${impPercentage}%`
    };
    setFitnessData(updated);
    setEditingFitnessIndex(null);
  };

  return (
    <div className="space-y-10 pb-20 print:bg-white print:p-0">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-slate-900 pb-8 print:border-b-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border-2 border-slate-900 rounded-full text-xs font-black uppercase text-indigo-700 tracking-wider">
            <ShieldCheck size={14} />
            <span>School Board & Inspection-Ready</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
            Principal Leadership Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            Institutional Oversight: Curriculum, Compliance, Fitness Evidence, and Audits
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Dashboard Mode Switcher */}
          <div className="bg-slate-100 border-2 border-slate-900 rounded-xl p-1 flex items-center print:hidden">
            <button
              onClick={() => setDashboardMode('viewer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                dashboardMode === 'viewer' 
                  ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(255,107,0,1)]' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Institutional View
            </button>
            <button
              onClick={() => setDashboardMode('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                dashboardMode === 'editor' 
                  ? 'bg-[#FF6B00] text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HoD Control Panel
            </button>
          </div>

          <button
            onClick={handlePrintReport}
            disabled={isGeneratingReport}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center space-x-2"
          >
            {isGeneratingReport ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Preparing Report...</span>
              </>
            ) : (
              <>
                <Printer size={16} />
                <span>Print PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 📘 COLLAPSIBLE BOARD GUIDELINES &setup EXPLANATORY CARD */}
      <div className="bg-[#FFFDF9] border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] space-y-4 print:hidden">
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 bg-amber-100 border-2 border-slate-900 rounded-lg flex items-center justify-center text-amber-600">
              <Info size={18} />
            </span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Principal Dashboard & CBSE Compliance - Setup & Data Guide
            </h2>
          </div>
          <button 
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="p-1 border-2 border-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {showGuidelines ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {showGuidelines && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3 text-xs text-slate-700 font-medium"
            >
              <p className="leading-relaxed">
                Welcome to the <strong className="font-black">Oversight Suite</strong>. Under standard boards (like CBSE or CISCE in India) and guidelines such as <strong className="font-bold text-indigo-700">NEP 2020</strong>, schools must present real, continuous evidence of student health assessments and physical syllabus compliance to inspectors. 
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-indigo-50/50 border-2 border-slate-900 rounded-xl space-y-1">
                  <span className="font-black text-indigo-800 uppercase text-[10px] tracking-wider block">Where does data originate?</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    <li><strong className="text-slate-900">Syllabus Compliance:</strong> Pulled directly from the PE lessons delivered in the <span className="font-bold text-slate-800">Yearly & Weekly Planners</span>.</li>
                    <li><strong className="text-slate-900">Fitness Improvement:</strong> Collated from the standard <span className="font-bold text-slate-800">Khelo India Assessment battery</span> scores taken at baseline and end-term.</li>
                  </ul>
                </div>

                <div className="p-3 bg-emerald-50/50 border-2 border-slate-900 rounded-xl space-y-1">
                  <span className="font-black text-emerald-800 uppercase text-[10px] tracking-wider block">How to update this data?</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    This dashboard can operate in <strong className="text-slate-900">two modes</strong>:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    <li><span className="font-bold">App Integrations:</span> Autoloads metrics recorded by individual teachers.</li>
                    <li><span className="font-bold text-emerald-800">HoD Control Panel:</span> Click the orange toggle on the top right to simulate and input data overrides!</li>
                  </ul>
                </div>

                <div className="p-3 bg-rose-50/50 border-2 border-slate-900 rounded-xl space-y-1">
                  <span className="font-black text-rose-800 uppercase text-[10px] tracking-wider block">How to show Inspectors?</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    <li>Click the green <strong className="text-slate-900">Print PDF Report</strong> to format this into an elegant, official printable document.</li>
                    <li><strong className="text-rose-800">Interactive Modals:</strong> Click on any scheduled event in the calendar list to open match-ready brackets, rosters, and medical evidence files.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ⚙️ HOD DATA INPUT / EDITOR PANEL (Shown only in edit mode) */}
      <AnimatePresence>
        {dashboardMode === 'editor' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-amber-50 border-4 border-slate-900 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] space-y-6 print:hidden"
          >
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <Edit className="text-amber-600" size={20} />
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  PE Head of Department (HoD) Control Desk
                </h2>
              </div>
              <span className="px-2.5 py-1 bg-amber-200 text-amber-800 border-2 border-slate-900 text-[10px] font-black uppercase rounded-lg">
                Edit Mode Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box A: High-Level Institutional Statistics */}
              <div className="bg-white border-2 border-slate-900 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <Activity size={14} /> Key Institutional Metrics
                </h4>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Delivered vs Planned Classes</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={deliveredClasses}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDeliveredClasses(val);
                          setLessonCompliance(Number(((val / plannedClasses) * 100).toFixed(1)));
                        }}
                        className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                        placeholder="Delivered"
                      />
                      <span className="text-xs font-black">/</span>
                      <input 
                        type="number" 
                        value={plannedClasses}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlannedClasses(val);
                          setLessonCompliance(Number(((deliveredClasses / val) * 100).toFixed(1)));
                        }}
                        className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                        placeholder="Planned"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Student Participation Ratio (%)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={studentParticipation}
                      onChange={(e) => setStudentParticipation(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Fitness Battery Complete (%)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={assessmentComplete}
                      onChange={(e) => setAssessmentComplete(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Overall Compliance Status</label>
                    <select
                      value={complianceStatus}
                      onChange={(e) => setComplianceStatus(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-black uppercase text-slate-700 focus:outline-none"
                    >
                      <option value="Inspection Ready">Inspection Ready</option>
                      <option value="Highly Compliant">Highly Compliant</option>
                      <option value="Pending Review">Pending Review</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Box B: Add Custom Calendar Events */}
              <div className="bg-white border-2 border-slate-900 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <Calendar size={14} /> Schedule New Event
                </h4>

                <form onSubmit={handleAddEvent} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Event Name</label>
                      <input 
                        type="text" 
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                        placeholder="Sports Day, Football Meet..."
                        className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">In-Charge</label>
                      <input 
                        type="text" 
                        value={newEventInCharge}
                        onChange={(e) => setNewEventInCharge(e.target.value)}
                        placeholder="e.g. Coach Roy"
                        className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Scheduled Date</label>
                      <input 
                        type="date" 
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Type</label>
                      <select
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-black text-slate-700"
                      >
                        <option value="School-wide">School-wide</option>
                        <option value="Inter-School">Inter-School</option>
                        <option value="Ministry of Sports">Ministry of Sports</option>
                        <option value="Internal">Internal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Short Overview description</label>
                    <textarea
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      placeholder="Enter event brief details..."
                      rows={2}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] font-medium text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-black text-xs uppercase tracking-wider border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                  >
                    Save & Publish to Dashboard
                  </button>
                </form>
              </div>

              {/* Box C: Quick Fitness Score Editor */}
              <div className="bg-white border-2 border-slate-900 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <TrendingUp size={14} /> Edit Fitness Batteries
                </h4>

                {editingFitnessIndex === null ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-black uppercase">Select battery to update scores:</p>
                    <div className="grid grid-cols-1 gap-1 max-h-[160px] overflow-y-auto">
                      {fitnessData.map((f, idx) => (
                        <button
                          key={f.metric}
                          onClick={() => {
                            setEditingFitnessIndex(idx);
                            setEditBaselineVal(f.Baseline);
                            setEditCurrentVal(f.Current);
                          }}
                          className="flex justify-between items-center p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-left"
                        >
                          <span className="font-bold text-slate-800">{f.metric}</span>
                          <span className="text-indigo-600 font-bold">{f.Baseline} → {f.Current}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-800">
                      Modifying: <span className="text-indigo-600">{fitnessData[editingFitnessIndex].metric}</span>
                    </p>
                    <div className="flex gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase">Baseline</label>
                        <input
                          type="number"
                          value={editBaselineVal}
                          onChange={(e) => setEditBaselineVal(Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase">Current Term</label>
                        <input
                          type="number"
                          value={editCurrentVal}
                          onChange={(e) => setEditCurrentVal(Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveFitnessEdit}
                        className="flex-1 py-1.5 bg-emerald-600 text-white font-black text-xs uppercase rounded border border-slate-950"
                      >
                        Apply Row
                      </button>
                      <button
                        onClick={() => setEditingFitnessIndex(null)}
                        className="px-3 py-1.5 bg-white text-slate-600 font-black text-xs uppercase rounded border border-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-emerald-50 border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="w-12 h-12 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase rounded-md">NEP Compliant</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lesson Compliance</p>
            <h3 className="text-3xl font-black text-slate-900 leading-none">{lessonCompliance}%</h3>
            <p className="text-xs text-slate-600 mt-2 font-semibold">
              {deliveredClasses} of {plannedClasses} planned PE classes delivered on schedule.
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-indigo-50 border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="w-12 h-12 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center text-indigo-600">
              <Users size={24} />
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-300 text-[9px] font-black uppercase rounded-md">Healthy KPI</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Participation</p>
            <h3 className="text-3xl font-black text-slate-900 leading-none">{studentParticipation}%</h3>
            <p className="text-xs text-slate-600 mt-2 font-semibold">Active dress-out & participation across physical sessions.</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-amber-50 border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="w-12 h-12 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center text-amber-600">
              <Activity size={24} />
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black uppercase rounded-md">Khelo India</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessment Complete</p>
            <h3 className="text-3xl font-black text-slate-900 leading-none">{assessmentComplete}%</h3>
            <p className="text-xs text-slate-600 mt-2 font-semibold">Term fitness batteries recorded, with active scores locked.</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-rose-50 border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="w-12 h-12 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center text-rose-600">
              <Award size={24} />
            </span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-black uppercase rounded-md">CBSE Goal</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compliance Status</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase">{complianceStatus}</h3>
            <p className="text-xs text-slate-600 mt-2 font-semibold">Annual syllabus, curriculum maps and medical books up-to-date.</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Fitness Progress / Baseline-to-Term Trends */}
        <div className="lg:col-span-7 bg-white border-4 border-slate-900 rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Fitness Improvement Evidence</h3>
              <p className="text-xs text-slate-500 font-bold uppercase">Baseline vs Term Average Physical Fitness Metric Scores (out of 100)</p>
            </div>
            <TrendingUp className="text-indigo-600" size={24} />
          </div>

          <div className="h-80 w-full print:hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={fitnessData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Term Start (Baseline)" />
                <Bar dataKey="Current" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Term-End Progress" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Printable Alternate representation */}
          <div className="hidden print:block md:block space-y-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50">
                  <th className="py-2 font-black">Fitness Parameter</th>
                  <th className="py-2 font-black">Baseline (Term-Start)</th>
                  <th className="py-2 font-black">Mid/End-Term Score</th>
                  <th className="py-2 font-black text-emerald-700">Improvement %</th>
                </tr>
              </thead>
              <tbody>
                {fitnessData.map((fit, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-2 font-semibold text-slate-800">{fit.metric}</td>
                    <td className="py-2 text-slate-600">{fit.Baseline} pts</td>
                    <td className="py-2 font-bold text-slate-900">{fit.Current} pts</td>
                    <td className="py-2 font-black text-emerald-600">{fit.Improvement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 text-xs text-emerald-800 flex items-start space-x-3">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-black uppercase tracking-wider">Evidence of Impact Summary</p>
              <p className="font-medium mt-1">
                Data shows an average improvement across all primary and secondary fitness vectors. The school is fully compliant with CBSE's Health and Physical Education (HPE) mandatory 45-minute daily activity directives.
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Participation Trend */}
        <div className="lg:col-span-5 bg-white border-4 border-slate-900 rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Weekly Participation</h3>
              <p className="text-xs text-slate-500 font-bold uppercase">Average attendance and dress-out % over 20 weeks</p>
            </div>
            <Users className="text-indigo-600" size={24} />
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={participationData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="Grade 6-8" stroke="#4f46e5" fillOpacity={1} fill="url(#colorPrimary)" name="Middle (6-8)" />
                <Area type="monotone" dataKey="Grade 9-12" stroke="#f43f5e" fillOpacity={0} name="Secondary (9-12)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Events & Calendar and Board Compliance Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Conducted & Scheduled */}
        <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-900 uppercase flex items-center">
              <Calendar className="mr-3 text-amber-500" />
              School Calendar & Sports Events
            </h3>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
              Click event for full files & brackets
            </span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {upcomingEvents.map((evt) => (
              <div 
                key={evt.id} 
                onClick={() => setSelectedEventDetails(evt)}
                className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-2xl border-2 border-slate-900 flex justify-between items-start md:items-center flex-col md:flex-row gap-2 transition-all hover:translate-x-1"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    {evt.name}
                    <Zap size={14} className="text-amber-500 animate-pulse" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <span className="font-bold mr-2 text-indigo-600">{evt.date}</span> &bull; {evt.type}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">In-charge: {evt.inCharge}</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 border-2 border-slate-900 font-black text-[9px] uppercase rounded-xl tracking-wider">
                    {evt.status}
                  </span>
                  
                  {dashboardMode === 'editor' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent opening details modal
                        handleDeleteEvent(evt.id);
                      }}
                      className="p-1.5 bg-rose-100 border border-rose-300 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {upcomingEvents.length === 0 && (
              <p className="text-center text-xs font-bold text-slate-400 py-10">No upcoming events listed. Go to HoD Control Panel to add.</p>
            )}
          </div>
        </div>

        {/* Board Compliance Inspections Audit */}
        <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="text-xl font-black text-slate-900 uppercase mb-6 border-b-2 border-slate-100 pb-4 flex items-center">
            <ShieldCheck className="mr-3 text-emerald-600" />
            CBSE / NEP 2020 Compliance Audit
          </h3>

          <div className="space-y-4">
            {[
              { rule: 'Daily HPE Period (Grades 1-12)', detail: 'Direct physical activity scheduled on school timetable.', status: 'COMPLIANT' },
              { rule: 'Khelo India Battery Assessments', detail: 'Fitness scores captured for all students over term 1.', status: 'COMPLIANT' },
              { rule: 'Inclusive PE Accommodations', detail: 'Adaptive lesson modifications compiled for students of mixed abilities.', status: 'COMPLIANT' },
              { rule: 'Theory syllabus (CBSE Class 11-12)', detail: 'Full alignment with NCERT, textbooks & sample papers available.', status: 'INSPECTION READY' },
              { rule: 'Sports Infrastructure & Safety Log', detail: 'Safety guidelines and equipment maintenance lists verified.', status: 'UP-TO-DATE' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-b-0">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{item.rule}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{item.detail}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 border-2 border-emerald-800 text-emerald-800 font-black text-[9px] uppercase rounded-lg">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔍 INTERACTIVE EVENT VIEW MODAL / DRAWER */}
      <AnimatePresence>
        {selectedEventDetails && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-slate-900 rounded-[2.5rem] max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] my-8"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-300 rounded text-[9px] font-black uppercase">
                      {selectedEventDetails.type}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded text-[9px] font-black uppercase">
                      {selectedEventDetails.status}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {selectedEventDetails.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">
                    Date: {selectedEventDetails.date} &bull; Supervisor: {selectedEventDetails.inCharge}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEventDetails(null);
                    setSelectedEvidencePreview(null);
                    setActiveEvidenceTab('details');
                  }}
                  className="p-1.5 border-2 border-slate-900 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Beautiful Tab Bar for Rich Interactive Content */}
              <div className="flex border-b-2 border-slate-900 bg-slate-50 p-1.5 rounded-xl gap-1">
                {[
                  { id: 'details', label: '🏆 Match & Brackets' },
                  { id: 'photos', label: '📸 Action Gallery' },
                  { id: 'evidence', label: '📄 CBSE Evidence Files' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveEvidenceTab(tab.id as any);
                      setSelectedEvidencePreview(null);
                    }}
                    className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                      activeEvidenceTab === tab.id
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Rendering */}
              <div className="space-y-4">
                {activeEvidenceTab === 'details' && (
                  <div className="space-y-6">
                    {/* Event Description */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Event Overview</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {selectedEventDetails.description}
                      </p>
                    </div>

                    {/* Match Fixtures / Brackets section */}
                    {selectedEventDetails.fixtures && selectedEventDetails.fixtures.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                          <Layers size={14} className="text-indigo-600" /> Interactive Match Bracket & Fixtures
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedEventDetails.fixtures.map((fix, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 border-2 border-slate-900 rounded-xl space-y-1 shadow-sm">
                              <span className="text-[9px] font-black uppercase text-indigo-600 block">{fix.round}</span>
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className={`${fix.winner === fix.teamA ? 'text-emerald-700 font-black' : 'text-slate-800'}`}>
                                  {fix.teamA}
                                </span>
                                <span className="text-[10px] text-slate-400 font-black">vs</span>
                                <span className={`${fix.winner === fix.teamB ? 'text-emerald-700 font-black' : 'text-slate-800'}`}>
                                  {fix.teamB}
                                </span>
                              </div>
                              <div className="pt-1.5 flex justify-between items-center border-t border-dashed border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Score / Status:</span>
                                <span className="text-xs font-black bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700">
                                  {fix.score}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Registered Team Roster */}
                    {selectedEventDetails.roster && selectedEventDetails.roster.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                          <UserCheck size={14} className="text-emerald-600" /> Official Athlete & Captain Roster
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEventDetails.roster.map((p, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeEvidenceTab === 'photos' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                      📸 Live Sports Action Gallery & School Media
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Official photographs submitted as evidence of actual event organization. Hover/tap to inspect high-contrast snapshots of students participating.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedEventDetails.id === 'evt-1' && (
                        <>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600" 
                              alt="Running race heats" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">100m Dash Relays</p>
                              <p className="text-[10px] text-slate-400">Official track start & electronic timing verification.</p>
                            </div>
                          </div>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600" 
                              alt="High jump and track event" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">Athletics In-Action</p>
                              <p className="text-[10px] text-slate-400">Principal L. Samy awarding house championship trophy.</p>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedEventDetails.id === 'evt-2' && (
                        <>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600" 
                              alt="Football match" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">Inter-School Knockout</p>
                              <p className="text-[10px] text-slate-400">Quarterfinal kick-off under CBSE regional guidelines.</p>
                            </div>
                          </div>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=600" 
                              alt="Soccer ball action shot" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">Team smartpeindia Roster</p>
                              <p className="text-[10px] text-slate-400">Captain Devanshu executing decisive counter-attack.</p>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedEventDetails.id === 'evt-3' && (
                        <>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600" 
                              alt="Mass Yoga Drill" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">Mass Yoga Demonstration</p>
                              <p className="text-[10px] text-slate-400">Over 400 primary and secondary pupils practicing Surya Namaskar.</p>
                            </div>
                          </div>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600" 
                              alt="Pranayama breathing session" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">Pranayama breathing</p>
                              <p className="text-[10px] text-slate-400">Guided respiratory mechanics for cardiovascular performance.</p>
                            </div>
                          </div>
                        </>
                      )}
                      {!['evt-1', 'evt-2', 'evt-3'].includes(selectedEventDetails.id) && (
                        <>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1592656094267-764a45023301?auto=format&fit=crop&q=80&w=600" 
                              alt="Volleyball court" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">Inter-House Tournament</p>
                              <p className="text-[10px] text-slate-400">Jal vs Vayu House volley championship.</p>
                            </div>
                          </div>
                          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md group relative">
                            <img 
                              src="https://images.unsplash.com/photo-1533443190583-424f914d7405?auto=format&fit=crop&q=80&w=600" 
                              alt="Volleyball player" 
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-3 bg-slate-900 text-white">
                              <p className="text-xs font-black uppercase">Volleyball Smash Action</p>
                              <p className="text-[10px] text-slate-400">Vayu House scoring decisive spike point.</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeEvidenceTab === 'evidence' && (
                  <div className="space-y-4">
                    {!selectedEvidencePreview ? (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                          <FileText size={14} className="text-indigo-600" /> Board Inspection Evidence & Documents
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Click on any document below to view its full high-fidelity, board-certified layout directly inside the app, showing official school registers, health tables, and inspection-ready parameters.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedEventDetails.evidenceFiles.map((f, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setSelectedEvidencePreview(f)} 
                              className="p-4 bg-indigo-50/50 hover:bg-indigo-100 cursor-pointer border-2 border-slate-900 rounded-2xl flex items-center space-x-3 transition-all hover:-translate-y-0.5 shadow-sm"
                            >
                              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">
                                <FileText size={20} />
                              </div>
                              <div className="truncate flex-1">
                                <span className="block text-xs font-black text-indigo-950 truncate uppercase">{f.replace('.pdf', '').replace('.xlsx', '').replace('.zip', '').replace(/_/g, ' ')}</span>
                                <span className="text-[10px] font-bold text-indigo-500 block uppercase">Click to open &rarr;</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-white border-2 border-slate-900 rounded-[2rem] space-y-4 relative shadow-inner"
                      >
                        <div className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Vault PREVIEW</span>
                          </div>
                          <button 
                            onClick={() => setSelectedEvidencePreview(null)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase text-slate-700 border border-slate-300 rounded-lg transition-colors"
                          >
                            &larr; Back to list
                          </button>
                        </div>

                        {/* Interactive Simulated Documents */}
                        {selectedEvidencePreview === 'sports_day_itinerary.pdf' && (
                          <div className="font-mono text-[11px] text-slate-800 space-y-4 border p-4 bg-amber-50/30 rounded-xl">
                            <div className="text-center border-b pb-2">
                              <h5 className="font-black text-sm text-slate-900 uppercase">SMARTPE INDIA SCHOOL ACADEMY</h5>
                              <p className="text-[9px] uppercase tracking-wider text-slate-500">42nd Annual Track & Field Meet 2026</p>
                              <p className="text-[9px] font-bold text-indigo-600 mt-1">AFFILIATION REF: CBSE-PE-ITIN-9082</p>
                            </div>
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b text-[10px] text-slate-500 font-bold">
                                  <th>TIME</th>
                                  <th>EVENT / DISCIPLINE</th>
                                  <th>VENUE</th>
                                </tr>
                              </thead>
                              <tbody className="space-y-1 font-semibold text-slate-700">
                                <tr>
                                  <td className="py-1">08:30 AM</td>
                                  <td>March Past & House Parade</td>
                                  <td>Main Ground</td>
                                </tr>
                                <tr>
                                  <td className="py-1">09:15 AM</td>
                                  <td>100m Athletics Relays (Heats)</td>
                                  <td>Track Lane 1-8</td>
                                </tr>
                                <tr>
                                  <td className="py-1">11:00 AM</td>
                                  <td>Inter-House Tug of War (Semi)</td>
                                  <td>Lawn Area</td>
                                </tr>
                                <tr>
                                  <td className="py-1">03:00 PM</td>
                                  <td>Prize Ceremony & closing address</td>
                                  <td>Main Arena</td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="pt-2 text-[9px] text-slate-400 border-t flex justify-between">
                              <span>VERIFIED EVIDENCE COMPLIANT</span>
                              <span>SIGNED: HEAD COACH</span>
                            </div>
                          </div>
                        )}

                        {selectedEvidencePreview === 'house_marchpast_roster.xlsx' && (
                          <div className="font-mono text-[11px] text-slate-800 space-y-3 border p-4 bg-slate-50 rounded-xl">
                            <div className="text-center border-b pb-2">
                              <h5 className="font-black text-xs text-slate-900 uppercase">INTER-HOUSE MARCH-PAST NOMINATIONS REGISTER</h5>
                              <p className="text-[8.5px] text-slate-500 uppercase tracking-widest">Database Table Export: XLSX Roster Format</p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[10px]">
                                <thead>
                                  <tr className="bg-slate-200 border-b">
                                    <th className="p-1">HOUSE</th>
                                    <th className="p-1">COMMANDER</th>
                                    <th className="p-1 text-center">STUDENTS</th>
                                    <th className="p-1 text-right">UNIFORM CODE</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="p-1 font-bold text-rose-600">Agni House</td>
                                    <td className="p-1">Aditya Sen (G12)</td>
                                    <td className="p-1 text-center font-bold">48 athletes</td>
                                    <td className="p-1 text-right text-emerald-600">APPROVED</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-1 font-bold text-blue-600">Jal House</td>
                                    <td className="p-1">Meera Nair (G11)</td>
                                    <td className="p-1 text-center font-bold">45 athletes</td>
                                    <td className="p-1 text-right text-emerald-600">APPROVED</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-1 font-bold text-emerald-600">Prithvi House</td>
                                    <td className="p-1">Rahul Jha (G12)</td>
                                    <td className="p-1 text-center font-bold">50 athletes</td>
                                    <td className="p-1 text-right text-emerald-600">APPROVED</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-1 font-bold text-amber-500">Vayu House</td>
                                    <td className="p-1">Jaspreet Singh (G11)</td>
                                    <td className="p-1 text-center font-bold">47 athletes</td>
                                    <td className="p-1 text-right text-emerald-600">APPROVED</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2">Database synced over active SSL connection.</p>
                          </div>
                        )}

                        {selectedEvidencePreview === 'track_safety_clearance.pdf' && (
                          <div className="p-5 border-4 border-double border-indigo-900 bg-white space-y-4 rounded-xl text-center shadow-lg relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-50 rounded-full border border-indigo-100 opacity-60"></div>
                            <div>
                              <span className="text-[9px] font-black uppercase text-indigo-700 tracking-[0.2em] block">BOARD AUDIT CLEARANCE</span>
                              <h5 className="font-serif text-lg font-bold text-indigo-950 uppercase mt-1">SPORTS INFRASTRUCTURE SAFETY CERTIFICATE</h5>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm mx-auto">
                              We hereby certify that the physical athletic track, lane layouts, jump sandpits, high jump crash pads, and standard football goalposts have been physically inspected and audited under standard national board guidelines. 
                            </p>
                            <div className="flex justify-around items-center border-t border-b py-3 text-[10px] text-slate-700">
                              <div>
                                <p className="font-bold text-slate-900">APPROVED STATUS</p>
                                <span className="text-[10px] font-bold text-emerald-600">SAFE & READY</span>
                              </div>
                              <div className="w-px h-8 bg-slate-200"></div>
                              <div>
                                <p className="font-bold text-slate-900">EXPIRY DATE</p>
                                <span className="text-[10px] text-slate-500">March 31, 2027</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-end pt-2 text-[9px] text-slate-400">
                              <span className="text-left leading-tight">ISSUED IN COMPLIANCE<br/>WITH NATIONAL PE POLICY</span>
                              <div className="text-right">
                                <span className="font-black text-slate-600">INSPECTOR L. SAMY</span>
                                <p className="text-[8px] italic">PE Lead Auditor</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedEvidencePreview === 'cbse_registration_confirmation.pdf' && (
                          <div className="font-mono text-[11px] text-slate-800 space-y-4 border p-4 bg-slate-50 rounded-xl border-t-8 border-t-indigo-600">
                            <div className="text-center border-b pb-2">
                              <h5 className="font-black text-sm text-slate-900 uppercase">CENTRAL BOARD OF SECONDARY EDUCATION</h5>
                              <p className="text-[9px] font-bold uppercase text-slate-500">Physical Education Division & Regional Clusters</p>
                            </div>
                            <div className="space-y-2 text-xs">
                              <p><span className="font-black">AFFILIATION NUMBER:</span> SmartPE-AFF-2026/CBSE</p>
                              <p><span className="font-black">HOST INSTITUTION:</span> SmartPE India Elite Network</p>
                              <p><span className="font-black">COMPETITION NAME:</span> Under-17 South Zone Soccer Championship</p>
                              <p><span className="font-black">REGISTRATION ID:</span> CBSE-SZ-FTB-802</p>
                            </div>
                            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                              <p className="text-[10px] text-indigo-900 font-bold uppercase tracking-wider mb-1">Status Report:</p>
                              <p className="text-[10px] text-indigo-700">All student documents, medical fitness indexes, and player birth registration certificates verified. Team approved for entry into South Zone Draw.</p>
                            </div>
                            <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-2">Official CBSE Digital Cognizance.</p>
                          </div>
                        )}

                        {selectedEvidencePreview === 'under_17_medical_fitness_logs.pdf' && (
                          <div className="font-mono text-[11px] text-slate-800 space-y-3 border p-4 bg-slate-50 rounded-xl">
                            <div className="text-center border-b pb-2">
                              <h5 className="font-black text-xs text-slate-900 uppercase">OFFICIAL CLINICAL FITNESS CERTIFICATION RECORD</h5>
                              <p className="text-[8.5px] text-slate-500 uppercase tracking-widest">Under-17 Regional Board Compliance Ledger</p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[10px]">
                                <thead>
                                  <tr className="bg-slate-200 border-b">
                                    <th className="p-1">PLAYER NAME</th>
                                    <th className="p-1">CLASS</th>
                                    <th className="p-1 text-center">BMI</th>
                                    <th className="p-1 text-center">HEART RATE</th>
                                    <th className="p-1 text-right">CLEARANCE</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="p-1 font-bold">Devanshu Rao</td>
                                    <td className="p-1 text-slate-500">10-B</td>
                                    <td className="p-1 text-center font-bold">20.4</td>
                                    <td className="p-1 text-center">68 bpm</td>
                                    <td className="p-1 text-right text-emerald-600 font-bold">COMPLIANT</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-1 font-bold">Kabir Mehrotra</td>
                                    <td className="p-1 text-slate-500">11-A</td>
                                    <td className="p-1 text-center font-bold">21.2</td>
                                    <td className="p-1 text-center">64 bpm</td>
                                    <td className="p-1 text-right text-emerald-600 font-bold">COMPLIANT</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="p-1 font-bold">Arjun Saxena</td>
                                    <td className="p-1 text-slate-500">10-C</td>
                                    <td className="p-1 text-center font-bold">19.8</td>
                                    <td className="p-1 text-center">72 bpm</td>
                                    <td className="p-1 text-right text-emerald-600 font-bold">COMPLIANT</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="p-2 bg-emerald-50 text-emerald-800 text-[10px] rounded border border-emerald-200 font-medium">
                              Verified safe for competitive physical exertion by School Resident Physician.
                            </div>
                          </div>
                        )}

                        {/* General fallback view for other evidence files */}
                        {![
                          'sports_day_itinerary.pdf',
                          'house_marchpast_roster.xlsx',
                          'track_safety_clearance.pdf',
                          'cbse_registration_confirmation.pdf',
                          'under_17_medical_fitness_logs.pdf'
                        ].includes(selectedEvidencePreview) && (
                          <div className="font-mono text-[11px] text-slate-800 space-y-4 border p-4 bg-slate-50 rounded-xl">
                            <div className="text-center border-b pb-2">
                              <h5 className="font-black text-xs text-slate-900 uppercase">OFFICIAL CURRICULUM ACTIVITY & GUIDELINE DOCUMENT</h5>
                              <p className="text-[8.5px] text-slate-500 uppercase tracking-widest">{selectedEvidencePreview}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-900 rounded-xl">
                              <p className="text-xs font-black uppercase mb-1">Standard Reference:</p>
                              <p className="text-[11px] leading-relaxed">
                                This file contains the complete activities, timetables, and resource mapping drafts configured directly within our smartpeindia planning tools to satisfy NEP 2020 and SPARKS criteria.
                              </p>
                            </div>
                            <div className="border-t pt-2 flex justify-between text-[9px] text-slate-400 font-bold">
                              <span>VERIFIED DIGITAL SIGNATURE COMPLIANT</span>
                              <span>smartpeindia ENCRYPTED</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button 
                            onClick={() => alert(`Downloading high-resolution official hardcopy of ${selectedEvidencePreview}...`)}
                            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-slate-900 shadow-sm"
                          >
                            <Download size={14} /> Download PDF File
                          </button>
                          <button 
                            onClick={() => alert(`Printing certified physical record of ${selectedEvidencePreview}...`)}
                            className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Close controls */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => {
                    alert(`Evidence checklist verification completed for ${selectedEventDetails.name}. All board requirements locked.`);
                    setSelectedEventDetails(null);
                    setSelectedEvidencePreview(null);
                    setActiveEvidenceTab('details');
                  }}
                  className="px-4 py-2 bg-[#FF6B00] text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                >
                  Verify Compliance
                </button>
                <button
                  onClick={() => {
                    setSelectedEventDetails(null);
                    setSelectedEvidencePreview(null);
                    setActiveEvidenceTab('details');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider border border-slate-300 rounded-xl hover:bg-slate-200"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PrincipalDashboard;
