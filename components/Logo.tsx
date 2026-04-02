
import React from 'react';
import { Sparkles, Activity, Brain } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, variant = 'color' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const accentColor = variant === 'light' ? 'text-orange-300' : 'text-orange-500';
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Logo Mark */}
        <div className={`
          w-12 h-12 rounded-2xl flex items-center justify-center relative z-10
          ${variant === 'color' ? 'bg-indigo-600 text-white' : variant === 'light' ? 'bg-white/10 backdrop-blur-md text-white border border-white/20' : 'bg-slate-900 text-white'}
          shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300
        `}>
          <Brain size={24} className="animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <Sparkles size={14} className={accentColor} />
          </div>
        </div>
        
        {/* Decorative background shape */}
        <div className={`
          absolute inset-0 rounded-2xl -rotate-6 opacity-30
          ${variant === 'color' ? 'bg-orange-500' : variant === 'light' ? 'bg-white' : 'bg-slate-400'}
        `}></div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-2xl font-black tracking-tighter uppercase font-display ${textColor}`}>
            Smarty <span className={accentColor}>India</span>
          </span>
          <span className={`text-[8px] font-bold uppercase tracking-[0.3em] mt-1 ${variant === 'light' ? 'text-white/50' : 'text-slate-400'}`}>
            Intelligence in PE
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
