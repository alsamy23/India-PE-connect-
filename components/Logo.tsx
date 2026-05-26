
import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, variant = 'color' }) => {
  const isLight = variant === 'light';
  
  // Color configuration based on variants
  const colors = {
    shieldBg: '#0A1C2A', // Deep dark navy shield as shown in reference
    orangeChevron: '#FF6B00', // Mockup orange chevron
    line1: '#FFFFFF', // White stroke
    line2: '#94A3B8', // Grey stroke
    text: isLight ? 'text-white' : 'text-[#0A1C2A]',
    pe: isLight ? 'text-slate-200' : 'text-[#0A1C2A]/90',
    tagline: isLight ? 'text-white/40' : 'text-slate-400'
  };
  
  return (
    <div className={`flex items-center gap-3 md:gap-4 ${className}`}>
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Main Shield Body matching the mockup */}
          <path 
            d="M18 18 C40 13 60 13 82 18 L82 54 C82 74 50 90 50 90 C50 90 18 74 18 54 Z" 
            fill={colors.shieldBg} 
            stroke="#1E293B"
            strokeWidth="1.5"
          />
          
          {/* Orange Chevron (Pointing Upward) */}
          <path 
            d="M32 50 L50 32 L68 50" 
            stroke={colors.orangeChevron} 
            strokeWidth="11" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* First Horizontal Line (White) */}
          <line 
            x1="32" 
            y1="64" 
            x2="68" 
            y2="64" 
            stroke={colors.line1} 
            strokeWidth="7" 
            strokeLinecap="round" 
          />

          {/* Second Horizontal Line (Grey) */}
          <line 
            x1="40" 
            y1="76" 
            x2="60" 
            y2="76" 
            stroke={colors.line2} 
            strokeWidth="7" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className={`text-2xl md:text-3xl font-black tracking-normal flex items-baseline ${colors.text}`}>
            Smart<span className={isLight ? 'text-indigo-400' : 'text-[#FF6B00]'}>PE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-[2px] ${isLight ? 'bg-white/10' : 'bg-[#FF6B00]/40'} flex-1`}></div>
            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-slate-300' : 'text-[#0A1C2A]/80'}`}>
              India
            </span>
            <div className={`h-[2px] ${isLight ? 'bg-white/10' : 'bg-[#FF6B00]/40'} flex-1`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
