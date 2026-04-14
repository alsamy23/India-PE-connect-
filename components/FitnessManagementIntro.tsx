
import React from 'react';
import { 
  Users, 
  Activity, 
  Trophy, 
  FileUp, 
  Download, 
  ArrowRight, 
  CheckCircle2,
  ClipboardList,
  UserPlus,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface FitnessManagementIntroProps {
  onLogin: () => void;
  onTryDemo: () => void;
}

const FitnessManagementIntro: React.FC<FitnessManagementIntroProps> = ({ onLogin, onTryDemo }) => {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Build Your Directory",
      description: "Add students manually or upload a CSV. Organize them by Grade and Section instantly.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Users,
      title: "2. Create Teams",
      description: "Group students into classes or sports squads for easier testing and tracking.",
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      icon: Activity,
      title: "3. Run Fitness Tests",
      description: "Conduct 32+ standardized tests. Enter results and get instant AI-powered ratings.",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: Trophy,
      title: "4. Generate Reports",
      description: "Export class-wise progress reports and health cards for parents and school records.",
      color: "bg-orange-50 text-orange-600"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16 animate-in fade-in slide-in-from-bottom-4">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-black text-[10px] uppercase tracking-widest mb-4"
        >
          <Zap size={14} />
          <span>Professional PE Management</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">
          School Fitness <br />
          <span className="text-primary">Management</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          The all-in-one digital toolkit for Indian PE Teachers. Track student health, manage classes, and generate professional reports in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button 
            onClick={onLogin}
            className="w-full sm:w-auto px-10 py-5 bg-primary text-white border-4 border-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary-container transition-all shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </button>
          <button 
            onClick={onTryDemo}
            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-4 border-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)] flex items-center justify-center gap-3"
          >
            <span>Try Manual Test</span>
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)] flex gap-6 group hover:shadow-[8px_8px_0px_0px_rgba(0,62,199,0.1)] transition-all"
          >
            <div className={`flex-shrink-0 w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <step.icon size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Value Proposition */}
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">
              Why use School Fitness Management?
            </h2>
            <div className="space-y-4">
              {[
                "Instant BMI & Fitness Ratings for every student",
                "Class-wise and School-wise data visualization",
                "CSV Bulk Upload for large student databases",
                "One-click PDF Progress Report generation",
                "Secure cloud storage - access from any device"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={20} />
                  <span className="font-bold text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <ClipboardList className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Example Report</p>
                <p className="font-black uppercase tracking-tight">Student Health Card</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
              <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
              <div className="h-20 bg-white/5 rounded-2xl w-full flex items-center justify-center border border-white/5">
                <Trophy className="text-secondary opacity-20" size={40} />
              </div>
            </div>
            <button 
              onClick={onLogin}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Sign Up to Generate Reports
            </button>
          </div>
        </div>
        <Zap className="absolute right-[-40px] top-[-40px] w-64 h-64 text-white/5 -rotate-12" />
      </div>
    </div>
  );
};

export default FitnessManagementIntro;
