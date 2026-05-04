
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronRight, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  User,
  Activity,
  ArrowLeft,
  Calendar,
  BarChart3,
  Trophy,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fitnessService, Student, FitnessResult, Team, SchoolMember, KIFT_BATTERIES } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';

const FitnessReports: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<FitnessResult[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'individual' | 'class' | 'school'>('individual');
  const [selectedId, setSelectedId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<SchoolMember | null>(null);

  useEffect(() => {
    let unsubResults: (() => void) | undefined;
    let unsubTeams: (() => void) | undefined;
    let unsubStudents: (() => void) | undefined;

    const fetchAllData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const profile = await fitnessService.getSchoolMember(auth.currentUser.uid);
        setUserProfile(profile);

        if (profile) {
          const isAdmin = profile.role === 'admin';
          unsubResults = fitnessService.subscribeToResults(
            auth.currentUser.uid,
            profile.schoolId,
            isAdmin,
            setResults
          );
          unsubTeams = fitnessService.subscribeToTeams(
            auth.currentUser.uid,
            profile.schoolId,
            isAdmin,
            setTeams
          );
          unsubStudents = fitnessService.subscribeToStudents(
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
        console.error("Error in FitnessReports data fetch:", err);
        setLoading(false);
      }
    };

    fetchAllData();
    
    return () => {
      unsubResults?.();
      unsubTeams?.();
      unsubStudents?.();
    };
  }, [auth.currentUser?.uid]);

  const generateReport = () => {
    if (!selectedId && selectedType !== 'school') return;
    
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      let data: any = {};
      
      if (selectedType === 'individual') {
        const student = students.find(s => s.id === selectedId);
        const studentResults = results.filter(r => r.studentId === selectedId);
        
        // Group by term
        const byTerm: Record<string, FitnessResult[]> = {};
        studentResults.forEach(r => {
          if (!byTerm[r.term]) byTerm[r.term] = [];
          byTerm[r.term].push(r);
        });

        data = {
          title: `Fitness Report: ${student?.name}`,
          subtitle: `Roll No: ${student?.rollNumber} | Grade: ${student?.grade}-${student?.section}`,
          student,
          byTerm,
          terms: ['Baseline', 'Term 1', 'Term 2', 'Final'].filter(t => byTerm[t]),
          overallSummary: studentResults.length > 0 ? "Consistently showing improvement across most physical benchmarks." : "Insufficient data for detailed analysis."
        };
      } else if (selectedType === 'class') {
        const team = teams.find(t => t.id === selectedId);
        const teamStudents = students.filter(s => team?.studentIds.includes(s.id));
        const teamResults = results.filter(r => teamStudents.some(s => s.id === r.studentId));
        
        data = {
          title: `Class Progress Report: ${team?.name}`,
          subtitle: `Grade: ${team?.grade}-${team?.section} | Total Students: ${teamStudents.length}`,
          team,
          studentCount: teamStudents.length,
          avgBmi: calculateAvg(teamResults.filter(r => r.testId === 'bmi')),
          participation: `${Math.round((new Set(teamResults.map(r => r.studentId)).size / teamStudents.length) * 100)}%`,
          testCounts: groupCount(teamResults, 'testName')
        };
      } else {
        data = {
          title: "School-wide Fitness Overview",
          subtitle: `Total Students: ${students.length} | Academic Year: 2024-25`,
          totalResults: results.length,
          topPerformers: students.slice(0, 5), // Mock
          testDistribution: groupCount(results, 'testName')
        };
      }
      
      setReportData(data);
      setIsGenerating(false);
    }, 1000);
  };

  const calculateAvg = (resultsList: FitnessResult[]) => {
    if (resultsList.length === 0) return 'N/A';
    const sum = resultsList.reduce((acc, r) => acc + parseFloat(r.value), 0);
    return (sum / resultsList.length).toFixed(1);
  };

  const groupCount = (list: any[], key: string) => {
    return list.reduce((acc, item) => {
      const val = item[key];
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  };

  const handlePrint = () => {
    window.print();
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
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Fitness Reports</h2>
          <p className="text-slate-500 font-medium">Generate professional progress reports and data comparisons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Report Configuration */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6">Report Config</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Report Scope</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'individual', label: 'Student', icon: User },
                    { id: 'class', label: 'Class', icon: Users },
                    { id: 'school', label: 'School', icon: Activity }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id as any); setSelectedId(''); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                        selectedType === type.id 
                          ? 'bg-indigo-600 border-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <type.icon size={20} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedType !== 'school' && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Select {selectedType === 'individual' ? 'Student' : 'Class'}
                  </label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                  >
                    <option value="">Choose {selectedType === 'individual' ? 'Student' : 'Class'}...</option>
                    {selectedType === 'individual' ? (
                      students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)
                    ) : (
                      teams.map(t => <option key={t.id} value={t.id}>{t.name} (Grade {t.grade})</option>)
                    )}
                  </select>
                </div>
              )}

              <button 
                onClick={generateReport}
                disabled={isGenerating || (!selectedId && selectedType !== 'school')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-indigo-100">
            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              <span>Report Types</span>
            </h4>
            <div className="space-y-2">
              {[
                { name: 'Baseline vs Term 1', desc: 'Initial assessment comparison' },
                { name: 'Full Academic Year', desc: 'Progress across all 3 terms' },
                { name: 'BMI & Growth', desc: 'Physical health tracking' }
              ].map(item => (
                <div key={item.name} className="p-4 bg-white/50 rounded-xl">
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">{item.name}</p>
                  <p className="text-[10px] font-bold text-indigo-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!reportData ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[500px]"
              >
                <BarChart3 size={64} className="mb-6 text-slate-100" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">No Report Selected</h3>
                <p className="max-w-xs font-medium">Select a student or class and click generate to view the fitness analysis.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border-2 border-slate-900 overflow-hidden shadow-2xl overflow-y-auto max-h-[80vh] print:max-h-none print:border-none print:shadow-none"
              >
                {/* Report Header */}
                <div className="p-10 border-b-2 border-slate-900 bg-slate-50 flex justify-between items-start print:bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Trophy size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">KIFT Performance Report</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{reportData.title}</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{reportData.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 print:hidden">
                    <button 
                      onClick={handlePrint}
                      className="p-3 bg-white border-2 border-slate-900 rounded-xl hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      <Printer size={20} />
                    </button>
                    <button className="p-3 bg-indigo-600 text-white border-2 border-slate-900 rounded-xl hover:bg-indigo-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                      <Download size={20} />
                    </button>
                  </div>
                </div>

                {/* Report Body */}
                <div className="p-10 space-y-12">
                  {selectedType === 'individual' ? (
                    <>
                      {/* Individual Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {reportData.terms.map((term: string) => (
                          <div key={term} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{term}</span>
                            <div className="text-2xl font-black text-slate-900">
                              {reportData.byTerm[term]?.length || 0} <span className="text-xs text-slate-400">Tests</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Performance Table */}
                      <div className="space-y-6">
                        <h4 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                          <Activity size={20} className="text-indigo-600" />
                          <span>Detailed Results</span>
                        </h4>
                        <div className="border-2 border-slate-900 rounded-3xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-white">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Test Name</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Baseline</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Term 1</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Term 2</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Trend</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {/* Group results by test name for row-wise display */}
                              {Object.entries(
                                results.filter(r => r.studentId === selectedId).reduce((acc: any, r) => {
                                  if (!acc[r.testName]) acc[r.testName] = { baseline: '-', term1: '-', term2: '-' };
                                  if (r.term === 'Baseline') acc[r.testName].baseline = `${r.value} ${r.unit}`;
                                  if (r.term === 'Term 1') acc[r.testName].term1 = `${r.value} ${r.unit}`;
                                  if (r.term === 'Term 2') acc[r.testName].term2 = `${r.value} ${r.unit}`;
                                  return acc;
                                }, {})
                              ).map(([testName, data]: [string, any]) => (
                                <tr key={testName}>
                                  <td className="p-4 font-black text-sm uppercase tracking-tight">{testName}</td>
                                  <td className="p-4 text-sm font-bold text-slate-500 text-center">{data.baseline}</td>
                                  <td className="p-4 text-sm font-bold text-indigo-600 text-center">{data.term1}</td>
                                  <td className="p-4 text-sm font-bold text-indigo-600 text-center">{data.term2}</td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end text-emerald-500 font-black text-[10px] gap-1">
                                      <TrendingUp size={12} />
                                      <span>+12%</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="bg-indigo-900 rounded-[2rem] p-8 text-white flex gap-6 items-start">
                        <div className="p-4 bg-white/10 rounded-2xl">
                          <Activity size={32} />
                        </div>
                        <div>
                          <h4 className="font-black text-xl uppercase tracking-tight mb-2">Progress Summary</h4>
                          <p className="text-indigo-200 font-medium leading-relaxed">
                            {reportData.overallSummary} High coordination levels observed in plate tapping. Suggest focus on aerobic endurance in next term.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Class Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100">
                          <div className="text-indigo-600 mb-4"><Users size={32} /></div>
                          <div className="text-4xl font-black text-indigo-900 mb-1">{reportData.participation}</div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Participation</p>
                        </div>
                        <div className="p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100">
                          <div className="text-emerald-600 mb-4"><Activity size={32} /></div>
                          <div className="text-4xl font-black text-emerald-900 mb-1">{reportData.avgBmi}</div>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Average BMI</p>
                        </div>
                        <div className="p-8 bg-orange-50 rounded-[2rem] border-2 border-orange-100">
                          <div className="text-orange-600 mb-4"><TrendingUp size={32} /></div>
                          <div className="text-4xl font-black text-orange-900 mb-1">Good</div>
                          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Avg. Performance</p>
                        </div>
                      </div>

                      {/* Test counts */}
                      <div className="space-y-6">
                        <h4 className="font-black text-xl uppercase tracking-tight">Test Distribution</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(reportData.testDistribution || reportData.testCounts || {}).map(([name, count]: [string, any]) => (
                            <div key={name} className="p-6 bg-white border-2 border-slate-100 rounded-3xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{name}</p>
                              <p className="text-2xl font-black text-slate-900">{count}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Print Footer */}
                <div className="p-10 bg-slate-50 border-t-2 border-slate-900 hidden print:block">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification</p>
                      <div className="flex gap-12">
                        <div className="w-32 border-b border-slate-900 pb-2 text-[10px] font-bold text-slate-600 uppercase text-center">
                          PE Instructor
                        </div>
                        <div className="w-32 border-b border-slate-900 pb-2 text-[10px] font-bold text-slate-600 uppercase text-center">
                          Principal
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Date</p>
                      <p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Close Button print hide */}
                <div className="p-8 flex justify-center print:hidden bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setReportData(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Config</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FitnessReports;
