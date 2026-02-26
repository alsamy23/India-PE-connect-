
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
  History
} from 'lucide-react';
import { evaluateFitnessTests } from '../services/geminiService.ts';
import { FitnessAssessment } from '../types.ts';
import { storageService } from '../services/storageService.ts';

interface Test {
  id: string;
  name: string;
  unit: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  tests: Test[];
}

const FITNESS_CATEGORIES: Category[] = [
  {
    id: 'aerobic',
    name: 'Aerobic Endurance/Power',
    icon: Heart,
    tests: [
      { id: 'cooper', name: '12-Minute Run (Cooper Test)', unit: 'meters', description: 'Run as far as possible in 12 minutes.' },
      { id: '1.5mile', name: '1.5 Mile Run', unit: 'min:sec', description: 'Run 1.5 miles as fast as possible.' },
      { id: 'beep', name: 'Beep Test (Multi-Stage Fitness)', unit: 'level.shuttle', description: 'Run 20m shuttles in time with beeps.' },
      { id: '2.4km', name: '2.4km Run', unit: 'min:sec', description: 'Run 2.4km as fast as possible.' }
    ]
  },
  {
    id: 'muscular_endurance',
    name: 'Muscular Endurance',
    icon: Zap,
    tests: [
      { id: 'pushup_1min', name: 'Push-Up Test (1 Minute)', unit: 'reps', description: 'Maximum push-ups in one minute.' },
      { id: 'situp_1min', name: 'Sit-Up Test (1 Minute)', unit: 'reps', description: 'Maximum sit-ups in one minute.' },
      { id: 'squat_1min', name: 'Squat Test (1 Minute)', unit: 'reps', description: 'Maximum bodyweight squats in one minute.' },
      { id: 'plank', name: 'Plank Hold', unit: 'min:sec', description: 'Hold a forearm plank for as long as possible.' }
    ]
  },
  {
    id: 'muscular_strength',
    name: 'Muscular Strength',
    icon: Dumbbell,
    tests: [
      { id: 'bench_1rm', name: '1RM Bench Press', unit: 'kg', description: 'Maximum weight for one repetition of bench press.' },
      { id: 'squat_1rm', name: '1RM Squat', unit: 'kg', description: 'Maximum weight for one repetition of back squat.' },
      { id: 'handgrip', name: 'Handgrip Strength', unit: 'kg', description: 'Maximum grip force using a dynamometer.' },
      { id: 'legpress_1rm', name: '1RM Leg Press', unit: 'kg', description: 'Maximum weight for one repetition of leg press.' }
    ]
  },
  {
    id: 'muscular_power',
    name: 'Muscular Power',
    icon: Zap,
    tests: [
      { id: 'vertical_jump', name: 'Vertical Jump', unit: 'cm', description: 'Measure the height of a vertical jump.' },
      { id: 'standing_long_jump', name: 'Standing Long Jump', unit: 'cm', description: 'Jump as far as possible from a standing start.' },
      { id: 'medball_throw', name: 'Medicine Ball Throw', unit: 'meters', description: 'Throw a 2kg/3kg medicine ball as far as possible.' },
      { id: 'broad_jump', name: 'Broad Jump', unit: 'cm', description: 'Jump forward from a standing position.' }
    ]
  },
  {
    id: 'agility',
    name: 'Agility',
    icon: Move,
    tests: [
      { id: 'illinois', name: 'Illinois Agility Test', unit: 'seconds', description: 'Standard agility course involving weaving and sprinting.' },
      { id: 't_test', name: 'T-Test', unit: 'seconds', description: 'Agility test involving forward, lateral, and backward movement.' },
      { id: '5105', name: '5-10-5 Shuttle (Pro Agility)', unit: 'seconds', description: 'Short shuttle run test of lateral quickness.' },
      { id: 'hexagon', name: 'Hexagon Test', unit: 'seconds', description: 'Jump in and out of a hexagon as fast as possible.' }
    ]
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: Timer,
    tests: [
      { id: '20m_sprint', name: '20m Sprint', unit: 'seconds', description: 'Time taken to sprint 20 meters.' },
      { id: '30m_sprint', name: '30m Sprint', unit: 'seconds', description: 'Time taken to sprint 30 meters.' },
      { id: '40m_sprint', name: '40m Sprint', unit: 'seconds', description: 'Time taken to sprint 40 meters.' },
      { id: '50m_sprint', name: '50m Sprint', unit: 'seconds', description: 'Time taken to sprint 50 meters.' }
    ]
  },
  {
    id: 'flexibility',
    name: 'Flexibility',
    icon: StretchHorizontal,
    tests: [
      { id: 'sit_reach', name: 'Sit and Reach', unit: 'cm', description: 'Measure lower back and hamstring flexibility.' },
      { id: 'shoulder_stretch', name: 'Shoulder Stretch', unit: 'pass/fail', description: 'Reach hands together behind the back.' },
      { id: 'trunk_rotation', name: 'Trunk Rotation', unit: 'cm', description: 'Measure the range of motion of the trunk.' },
      { id: 'groin_flex', name: 'Groin Flexibility', unit: 'cm', description: 'Measure the distance between heels and groin in a butterfly stretch.' }
    ]
  },
  {
    id: 'body_comp',
    name: 'Body Composition',
    icon: User,
    tests: [
      { id: 'bmi', name: 'BMI (Body Mass Index)', unit: 'kg/m²', description: 'Calculate BMI using height and weight.' },
      { id: 'whr', name: 'Waist-to-Hip Ratio', unit: 'ratio', description: 'Measure waist and hip circumference.' },
      { id: 'skinfold_3', name: 'Skinfold (3-Site)', unit: 'mm', description: 'Measure skinfold thickness at three specific sites.' },
      { id: 'bodyfat_bia', name: 'Body Fat % (BIA)', unit: '%', description: 'Estimate body fat using bioelectrical impedance.' }
    ]
  }
];

const FitnessTests: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [age, setAge] = useState('18');
  const [gender, setGender] = useState('Male');
  const [testValue, setTestValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitnessAssessment | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSelectedTest(null);
    setResult(null);
  };

  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setResult(null);
    setTestValue('');
  };

  const handleCalculate = async () => {
    if (!selectedCategory || !selectedTest || !testValue) {
      setError("Please enter a result for the test.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await evaluateFitnessTests(age, gender, selectedCategory.name, selectedTest.name, testValue);
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Assessment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    storageService.saveItem({
      type: 'Tool',
      title: `${selectedTest?.name} Assessment`,
      content: result,
      metadata: { age, gender, category: selectedCategory?.name, test: selectedTest?.name, value: testValue }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Header */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Fitness Testing Suite</h2>
          <p className="text-indigo-200 text-lg font-medium leading-relaxed">
            32 professional fitness tests across 8 categories. Instant analysis and percentile ranking based on international norms.
          </p>
        </div>
        <Timer className="absolute right-[-20px] bottom-[-40px] w-64 h-64 text-white/10 rotate-12" />
      </div>

      {!selectedCategory ? (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FITNESS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
            >
              <div className="p-4 bg-indigo-50 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <cat.icon size={32} />
              </div>
              <h3 className="font-black text-xl text-slate-800 mb-2 leading-tight uppercase tracking-tight">{cat.name}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{cat.tests.length} Tests Available</p>
              <div className="mt-6 flex items-center text-indigo-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore Tests</span>
                <ChevronRight size={14} className="ml-1" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Category View */
        <div className="space-y-8">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 font-bold uppercase text-xs tracking-widest transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Categories</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Tests in Category */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <selectedCategory.icon size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{selectedCategory.name}</h3>
                </div>
                <div className="space-y-2">
                  {selectedCategory.tests.map((test) => (
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
                  <selectedCategory.icon size={48} className="mb-4 text-slate-200" />
                  <p className="font-bold">Select a test from the list to begin assessment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Input Card */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex flex-wrap gap-6 mb-8">
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Student Age</label>
                        <select 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={age}
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
