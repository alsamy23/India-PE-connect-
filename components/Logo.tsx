
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
              fill="#312E81" 
              stroke="#4338CA" 
              strokeWidth="2"
            />
            
            {/* Side Accents */}
            <line x1="15" y1="50" x2="30" y2="50" stroke="#6366F1" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="12" cy="50" r="2" fill="#60A5FA" />
            
            <line x1="70" y1="50" x2="85" y2="50" stroke="#6366F1" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="88" cy="50" r="2" fill="#60A5FA" />

            {/* Gradient S Shape */}
            <defs>
              <linearGradient id="sGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            
            <path 
              d="M65 35C65 25 35 25 35 35C35 45 65 55 65 65C65 75 35 75 35 65" 
              stroke="url(#sGradient)" 
              strokeWidth="12" 
              strokeLinecap="round"
              fill="none"
            />
            
            {/* End Dots */}
            <circle cx="65" cy="35" r="4" fill="white" />
            <circle cx="35" cy="65" r="4" fill="white" />
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
