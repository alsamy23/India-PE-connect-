import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  User, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award, 
  FileText, 
  ClipboardCheck, 
  ChevronRight, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  BarChart3,
  Flame,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, FitnessResult, PracticalAssessment } from '../../types.ts';
import { fitnessService } from '../../services/fitnessService.ts';
import { calculateExactBMI, parseFitnessValue } from '../../utils/bmiUtils.ts';
import { D3StudentProgressChart } from './D3StudentProgressChart.tsx';
import { BMISpectrumGauge } from './BMISpectrumGauge.tsx';
import { toast } from '../../services/toast.ts';

interface IndividualStudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFitness?: (studentId: string) => void;
  onNavigateToReportCard?: (studentId: string) => void;
  onNavigateToPractical?: (studentId: string) => void;
  practicalAssessment?: PracticalAssessment | null;
}

export const IndividualStudentProfileModal: React.FC<IndividualStudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onNavigateToFitness,
  onNavigateToReportCard,
  onNavigateToPractical,
  practicalAssessment
}) => {
  const [results, setResults] = useState<FitnessResult[]>([]);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'health'>('analytics');

  // Subscribe to / fetch student results whenever the modal opens for this student
  useEffect(() => {
    if (!isOpen || !student?.id) {
      setResults([]);
      return;
    }

    setLoadingResults(true);
    const unsub = fitnessService.subscribeToStudentResults(student.id, student.schoolId, (data) => {
      setResults(data);
      setLoadingResults(false);
    });

    return () => {
      unsub?.();
    };
  }, [isOpen, student?.id, student?.schoolId]);

  // Extract latest BMI result if present
  const latestBmiResult = useMemo(() => {
    const bmiRes = results.filter(r => r.testId === 'bmi');
    return bmiRes.length > 0 ? bmiRes[0] : null;
  }, [results]);

  const bmiDetails = useMemo(() => {
    if (!latestBmiResult) {
      return calculateExactBMI('');
    }
    return calculateExactBMI(latestBmiResult.value);
  }, [latestBmiResult]);

  // Total unique test types tested
  const uniqueTestCount = useMemo(() => {
    return new Set(results.map(r => r.testId)).size;
  }, [results]);

  // Terms tested list
  const assessedTerms = useMemo(() => {
    const terms = Array.from(new Set(results.map(r => r.term || 'Session')));
    return terms;
  }, [results]);

  // Overall progression summary
  const overallProgressionStatus = useMemo(() => {
    if (results.length < 2) return { text: 'Baseline Assessment Active', isPositive: true };
    return { text: 'Consistent Progress Tracked', isPositive: true };
  }, [results]);

  const isSenior = student ? (student.grade === '11' || student.grade === '12' || parseInt(student.grade) >= 11) : false;

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[2.5rem] border-2 border-slate-900 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        >
          {/* Top Banner Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0D2B52] via-slate-900 to-[#0D2B52] text-white relative border-b-2 border-slate-900 flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Profile Modal"
              aria-label="Close Profile Modal"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pr-10">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Student Avatar Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#D4A017] text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/30 shrink-0">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-white/15 text-[#D4A017] rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/10">
                      Grade {student.grade} - {student.section}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 rounded-lg text-[10px] font-bold">
                      Roll No: {student.rollNumber || 'N/A'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 text-slate-300 rounded-lg text-[10px] font-bold">
                      {student.gender} • {student.age} Yrs
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                    {student.name}
                  </h2>

                  <div className="text-xs text-slate-300 font-medium flex flex-wrap items-center gap-3 mt-1">
                    <span>Student ID: <code className="font-mono text-amber-300 font-bold">{student.id.slice(-8)}</code></span>
                    <span>•</span>
                    <span>Attendance: <strong className="text-emerald-400 font-bold">{student.attendance ?? 95}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-center">
                {onNavigateToFitness && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToFitness(student.id);
                    }}
                    className="px-4 py-2.5 bg-[#D4A017] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Activity size={14} />
                    <span>Log Fitness</span>
                  </button>
                )}

                {onNavigateToReportCard && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToReportCard(student.id);
                    }}
                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <FileText size={14} />
                    <span>Report Card</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block">Assessments Logged</span>
                <span className="text-xl font-black text-white">{results.length} Tests</span>
                <span className="text-[10px] text-[#D4A017] font-bold block">{uniqueTestCount} Parameter Types</span>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block">Assessment Terms</span>
                <span className="text-xl font-black text-white">{assessedTerms.length || 1} Terms</span>
                <span className="text-[10px] text-slate-300 font-bold block truncate">{assessedTerms.join(', ') || 'Baseline'}</span>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block">BMI Health Level</span>
                <span className="text-xl font-black text-white">{bmiDetails.bmi > 0 ? `${bmiDetails.bmi} kg/m²` : 'Pending'}</span>
                <span className="text-[10px] text-emerald-300 font-bold block truncate">{bmiDetails.category}</span>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block">
                  {isSenior ? 'CBSE Practical (30M)' : 'Overall Performance'}
                </span>
                <span className="text-xl font-black text-white">
                  {isSenior 
                    ? (practicalAssessment ? `${practicalAssessment.totalMarks}/30` : 'Pending')
                    : (student.performance || 'Good')}
                </span>
                <span className="text-[10px] text-amber-300 font-bold block">
                  {isSenior && practicalAssessment ? `${Math.round((practicalAssessment.totalMarks / 30) * 100)}% Score` : 'Active Trajectory'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-6 sm:px-8 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Activity size={14} className={activeTab === 'analytics' ? 'text-[#D4A017]' : 'text-slate-400'} />
                <span>Visual Progress Curves & Radar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Calendar size={14} className={activeTab === 'history' ? 'text-[#D4A017]' : 'text-slate-400'} />
                <span>Assessment Records ({results.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('health')}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'health'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Scale size={14} className={activeTab === 'health' ? 'text-[#D4A017]' : 'text-slate-400'} />
                <span>BMI Spectrum & Vitals</span>
              </button>
            </div>

            <div className="text-[11px] font-bold text-slate-500 hidden sm:block">
              CBSE HPE Student Portfolio
            </div>
          </div>

          {/* Modal Scrollable Content Area */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            
            {/* TAB 1: VISUAL PROGRESS ANALYTICS (D3 & RECHARTS) */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Embedded High-Resolution D3 & Recharts Visualizer */}
                <D3StudentProgressChart 
                  student={student} 
                  results={results} 
                  showMultiTestComparison={true}
                />

                {/* Additional Quick Growth Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-2 text-indigo-900 font-black text-xs uppercase tracking-wider">
                      <TrendingUp size={16} className="text-indigo-600" />
                      <span>Longitudinal Trajectory</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Tracking student across Baseline, Term 1, Term 2, and Final evaluations allows educators to measure genuine physical adaptation and motor skill retention.
                    </p>
                    <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-indigo-700">
                      Standard Khelo India Protocol
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase tracking-wider">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>CBSE Norm Compliance</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Automated comparison against age-standardized percentile targets ensures early intervention for students developing cardio-respiratory stamina.
                    </p>
                    <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-emerald-700">
                      CBSE Health & Physical Education Norms
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                      <Sparkles size={16} className="text-amber-600" />
                      <span>Holistic Physical Literacy</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Multi-component radar charts evaluate cardiovascular endurance, muscular power, flexibility, neuromuscular balance, and agility simultaneously.
                    </p>
                    <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-amber-700">
                      All-Round Athletic Balance
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMPLETE ASSESSMENT HISTORY LOGS */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                      Historical Physical Test Sessions
                    </h4>
                    <p className="text-xs font-bold text-slate-500">
                      Complete chronological record of all physical fitness assessments for {student.name}.
                    </p>
                  </div>

                  {onNavigateToFitness && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToFitness(student.id);
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <PlusCircle size={14} />
                      <span>Record New Score</span>
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Activity size={36} className="mx-auto text-slate-400 mb-2" />
                    <p className="font-black text-slate-700 text-sm uppercase">No Test Results Logged</p>
                    <p className="text-xs text-slate-500 mt-1">Tap "Record New Score" to log the student's first assessment.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border-2 border-slate-900 overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="p-4">Date & Session</th>
                          <th className="p-4">Fitness Test</th>
                          <th className="p-4">Recorded Value</th>
                          <th className="p-4">CBSE Rating</th>
                          <th className="p-4 text-right">Parameter</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {results.map((r, i) => (
                          <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-700">
                              <div className="font-black text-slate-900">{r.term || 'Session'}</div>
                              <div className="text-[10px] font-mono text-slate-400">{r.date}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-black text-slate-900 uppercase">
                                {r.testName}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono font-black text-slate-900 border border-slate-200">
                                {r.value} {r.unit}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                r.rating === 'Excellent' || r.rating === 'Level 4: Athletic'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.rating === 'Good' || r.rating === 'Level 3: Good'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}>
                                <CheckCircle2 size={11} />
                                <span>{r.rating || 'Standard'}</span>
                              </span>
                            </td>
                            <td className="p-4 text-right text-slate-400 font-mono text-[10px]">
                              {r.testId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BMI SPECTRUM & PHYSICAL VITALS */}
            {activeTab === 'health' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                        <Scale size={18} className="text-indigo-600" />
                        <span>Body Mass Index (BMI) Spectrum</span>
                      </h4>
                      <p className="text-xs font-bold text-slate-500">
                        Evaluated under WHO Pediatric & CBSE Health and Physical Education Guidelines.
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${bmiDetails.badgeBg}`}>
                      {bmiDetails.category}
                    </span>
                  </div>

                  {/* BMI Visual Gauge */}
                  <div className="py-2">
                    <BMISpectrumGauge bmiResult={bmiDetails} studentName={student.name} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">BMI Score</span>
                      <span className="text-2xl font-black text-slate-900">{bmiDetails.bmi || '--'}</span>
                      <span className="text-[10px] text-slate-500 font-bold block">kg/m²</span>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Classification</span>
                      <span className="text-base font-black text-slate-900 truncate block">{bmiDetails.category}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">{bmiDetails.level}</span>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">CBSE Rating</span>
                      <span className="text-base font-black text-slate-900">{bmiDetails.rating}</span>
                      <span className="text-[10px] text-indigo-600 font-bold block">HPE Strand 1 Standard</span>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs text-indigo-900 font-medium">
                    <strong className="font-black uppercase text-indigo-950 block mb-0.5">Clinical Note:</strong>
                    {bmiDetails.details}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Bar */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t-2 border-slate-900 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <ShieldCheck size={16} className="text-indigo-600" />
              <span>SmartPE India Unified Student Profile</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close View
              </button>

              {onNavigateToReportCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToReportCard(student.id);
                  }}
                  className="px-5 py-2.5 bg-[#0D2B52] hover:bg-slate-900 text-[#D4A017] border border-slate-900 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <FileText size={14} />
                  <span>Generate Full PDF Report Card</span>
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
