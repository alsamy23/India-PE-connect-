
import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, variant = 'color' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-on-surface';
  const accentColor = variant === 'light' ? 'text-secondary-container' : 'text-primary';
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Logo Mark */}
        <div className={`
          w-12 h-12 rounded-2xl flex items-center justify-center relative z-10
          ${variant === 'color' ? 'bg-primary text-white' : variant === 'light' ? 'bg-white/10 backdrop-blur-md text-white border border-white/20' : 'bg-on-surface text-white'}
          shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300
        `}>
          <Trophy size={24} className="animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <Sparkles size={14} className={accentColor} />
          </div>
        </div>
        
        {/* Decorative background shape */}
        <div className={`
          absolute inset-0 rounded-2xl -rotate-6 opacity-30
          ${variant === 'color' ? 'bg-secondary' : variant === 'light' ? 'bg-white' : 'bg-slate-400'}
        `}></div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-2xl font-black tracking-tighter uppercase font-display ${textColor}`}>
            Smart PE <span className={accentColor}>in India</span>
          </span>
          <span className={`text-[8px] font-bold uppercase tracking-[0.3em] mt-1 ${variant === 'light' ? 'text-white/50' : 'text-on-surface-variant'}`}>
            The PE Architect
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
