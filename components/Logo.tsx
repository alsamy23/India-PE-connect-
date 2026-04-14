
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
        {/* Custom SVG Logo Mark */}
        <div className="w-12 h-12 relative z-10 transition-transform duration-300 hover:scale-110">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            {/* Hexagon Background */}
            <path 
              d="M50 5L89.5 27.5V72.5L50 95L10.5 72.5V27.5L50 5Z" 
              fill="#003ec7" 
              stroke="#0052ff" 
              strokeWidth="2"
            />
            
            {/* Side Accents */}
            <line x1="15" y1="50" x2="30" y2="50" stroke="#6cf8bb" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="12" cy="50" r="2" fill="#6cf8bb" />
            
            <line x1="70" y1="50" x2="85" y2="50" stroke="#6cf8bb" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="88" cy="50" r="2" fill="#6cf8bb" />

            {/* Gradient S Shape */}
            <defs>
              <linearGradient id="sGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#6cf8bb" />
              </linearGradient>
            </defs>
            
            <path 
              d="M65 30C65 20 35 20 35 35C35 50 65 50 65 65C65 80 35 80 35 70" 
              stroke="url(#sGradient)" 
              strokeWidth="10" 
              strokeLinecap="round"
              fill="none"
            />
            
            {/* End Dots */}
            <circle cx="65" cy="30" r="3" fill="white" />
            <circle cx="35" cy="70" r="3" fill="white" />
          </svg>
        </div>
        
        {/* Decorative background shape */}
        <div className={`
          absolute inset-0 rounded-2xl -rotate-6 opacity-20
          ${variant === 'color' ? 'bg-secondary' : variant === 'light' ? 'bg-white' : 'bg-slate-400'}
        `}></div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-2xl font-black tracking-tighter uppercase font-display ${textColor}`}>
            SmartPE <span className={accentColor}>India</span>
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
