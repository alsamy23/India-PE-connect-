
import React, { useState } from 'react';
import { 
  Heart, 
  Zap, 
  Dumbbell, 
  Move, 
  Timer, 
  StretchHorizontal, 
  User, 
  ChevronRight, 
  ArrowLeft, 
  Calculator, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Info,
  Trophy,
  History,
  Activity
} from 'lucide-react';
import { evaluateFitnessTests } from '../services/geminiService.ts';
import { FitnessAssessment, KIFTBattery, KIFTTest } from '../types.ts';
import { storageService } from '../services/storageService.ts';
import { fitnessService, Student, KIFT_BATTERIES } from '../services/fitnessService.ts';
import { auth } from '../services/firebase.ts';
import { useEffect } from 'react';

const FitnessTests: React.FC = () => {
  const [selectedBattery, setSelectedBattery] = useState<KIFTBattery | null>(null);
  const [selectedTest, setSelectedTest] = useState<KIFTTest | null>(null);
  const [age, setAge] = useState('10');
  const [gender, setGender] = useState('Male');
  const [testValue, setTestValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitnessAssessment | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    // For testing, we subscribe to teacher's students. 
    // In a full school context, this would be filtered by schoolId if admin.
    const unsub = fitnessService.subscribeToStudents(auth.currentUser.uid, undefined, false, setStudents);
    return () => unsub();
  }, []);

  const handleBatteryClick = (battery: KIFTBattery) => {
    setSelectedBattery(battery);
    setSelectedTest(null);
    setResult(null);
  };

  const handleTestClick = (test: KIFTTest) => {
    setSelectedTest(test);
    setResult(null);
    setTestValue('');
  };

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find(s => s.id === id);
    if (student) {
      setAge(student.age.toString());
      setGender(student.gender);
      
      // Automatically select the correct battery for the student's grade
      const battery = fitnessService.getBatteryForGrade(student.grade);
      if (battery) {
        setSelectedBattery(battery);
      }
    }
  };

  const handleCalculate = async () => {
    if (!selectedBattery || !selectedTest || !testValue) {
      setError("Please enter a result for the test.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await evaluateFitnessTests(age, gender, selectedBattery.category, selectedTest.name, testValue);
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Assessment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    if (!auth.currentUser) {
      setError("Please log in as a teacher to save results to your school database.");
      return;
    }
    
    // Save to general history
    storageService.saveItem({
      type: 'Tool',
      title: `${selectedTest?.name} Assessment`,
      content: result,
      metadata: { age, gender, category: selectedBattery?.category, test: selectedTest?.name, value: testValue }
    });

    // Save to school database if student is selected
    if (selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      await fitnessService.saveResult({
        id: Math.random().toString(36).substr(2, 9),
        teacherId: auth.currentUser.uid,
        schoolId: student?.schoolId || '',
        studentId: selectedStudentId,
        testId: selectedTest?.id || '',
        testName: selectedTest?.name || '',
        value: testValue,
        unit: selectedTest?.unit || '',
        date: new Date().toISOString(),
        term: 'Term 1', // Default
        rating: result.tests[0]?.rating,
        percentile: parseFloat(result.tests[0]?.percentile)
      });
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Header */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">KIFT Testing Suite</h2>
          <p className="text-indigo-200 text-lg font-medium leading-relaxed">
            Khelo India Fitness Test (CBSE Format). Standardized batteries for Primary to Senior Secondary grades.
          </p>
        </div>
        <Trophy className="absolute right-[-20px] bottom-[-40px] w-64 h-64 text-white/10 rotate-12" />
      </div>

      {!selectedBattery ? (
        /* Batteries Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KIFT_BATTERIES.map((battery) => (
            <button
              key={battery.category}
              onClick={() => handleBatteryClick(battery)}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
            >
              <div className="p-4 bg-indigo-50 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Activity size={32} />
              </div>
              <h3 className="font-black text-xl text-slate-800 mb-2 leading-tight uppercase tracking-tight">{battery.category}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Grades: {battery.grades.join(', ')}</p>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{battery.objective}</p>
              <div className="mt-auto flex items-center text-indigo-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View {battery.tests.length} Tests</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Battery View */
        <div className="space-y-8">
          <button 
            onClick={() => setSelectedBattery(null)}
            className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 font-bold uppercase text-xs tracking-widest transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Batteries</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Tests in Battery */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Activity size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{selectedBattery.category} Tests</h3>
                </div>
                <div className="space-y-2">
                  {selectedBattery.tests.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => handleTestClick(test)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between group ${
                        selectedTest?.id === test.id 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-sm">{test.name}</span>
                      <ChevronRight size={16} className={selectedTest?.id === test.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                    </button>
                  ))}
                </div>
              </div>

              {selectedTest && (
                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                  <div className="flex items-center space-x-2 mb-3 text-indigo-600">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Test Protocol</span>
                  </div>
                  <p className="text-indigo-900/70 text-sm leading-relaxed font-medium">
                    {selectedTest.description}
                  </p>
                </div>
              )}
            </div>

            {/* Main Content: Input & Results */}
            <div className="lg:col-span-8">
              {!selectedTest ? (
                <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[400px]">
                  <Activity size={48} className="mb-4 text-slate-200" />
                  <p className="font-bold uppercase tracking-tight">Select a test from the {selectedBattery.category} battery to begin.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Input Card */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="mb-8">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Student (Optional)</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={selectedStudentId}
                        onChange={e => handleStudentChange(e.target.value)}
                      >
                        <option value="">Manual Entry</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (Grade {s.grade} {s.section})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-8">
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Student Age</label>
                        <select 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={age}
                          disabled={!!selectedStudentId}
                          onChange={e => setAge(e.target.value)}
                        >
                          {[...Array(60)].map((_, i) => <option key={i} value={i+5}>{i+5} Years</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                        <select 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={gender}
                          disabled={!!selectedStudentId}
                          onChange={e => setGender(e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="flex-[2] min-w-[250px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Result ({selectedTest.unit})</label>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder={`Enter value in ${selectedTest.unit}`}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={testValue}
                            onChange={e => setTestValue(e.target.value)}
                          />
                          <button 
                            onClick={handleCalculate}
                            disabled={loading || !testValue}
                            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                          >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Calculator size={16} />}
                            <span>Assess</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-start space-x-2">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Result Card */}
                  {result && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 animate-slide-up">
                      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Assessment Report</h3>
                        <button 
                          onClick={handleSave}
                          disabled={isSaved}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            isSaved ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'
                          }`}
                        >
                          {isSaved ? <CheckCircle2 size={16} /> : <History size={16} />}
                          <span>{isSaved ? 'Saved to History' : 'Save Result'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {result.tests.map((res, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{res.testName}</h4>
                            <div className="flex items-baseline space-x-2 mb-3">
                              <span className="text-3xl font-black text-slate-900">{res.score}</span>
                              <span className="text-xs font-bold text-indigo-600">{res.percentile} %ile</span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              res.rating === 'Elite' ? 'bg-yellow-400 text-yellow-900' :
                              res.rating === 'Excellent' ? 'bg-indigo-600 text-white' :
                              res.rating === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                              res.rating === 'Average' ? 'bg-slate-200 text-slate-600' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {res.rating}
                            </span>
                            <p className="mt-4 text-xs text-slate-500 leading-relaxed font-medium">
                              {res.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 flex items-start space-x-6">
                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                          <Trophy className="text-indigo-600" size={32} />
                        </div>
                        <div>
                          <h4 className="font-black text-indigo-900 text-lg mb-2 uppercase tracking-tight">Expert Summary</h4>
                          <p className="text-indigo-800/70 leading-relaxed font-medium">
                            {result.overallSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessTests;
