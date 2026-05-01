
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
    hexagon: isLight ? '#FFFFFF' : '#005BFF',
    accent: '#FF6B00',
    speed: isLight ? 'rgba(255,255,255,0.3)' : '#00A3FF',
    runner: isLight ? '#001D3D' : '#FFFFFF',
    text: isLight ? 'text-white' : 'text-[#001D3D]',
    brandPe: isLight ? 'text-white' : 'text-[#005BFF]',
    tagline: isLight ? 'text-white/50' : 'text-slate-400'
  };
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Main Hexagon Body */}
          <path 
            d="M50 4L89.5 26.5V73.5L50 96L10.5 73.5V26.5L50 4Z" 
            fill={colors.hexagon} 
          />
          
          {/* Orange Accent Segment (Dynamic based on background) */}
          <path 
            d="M89.5 26.5V73.5L50 96L75 80L89.5 50V26.5Z" 
            fill={colors.accent} 
            opacity={isLight ? 1 : 0.9}
          />

          {/* Speed Lines (Left) */}
          <g stroke={colors.speed} strokeWidth="3" strokeLinecap="round">
            <line x1="5" y1="40" x2="30" y2="40" />
            <line x1="2" y1="50" x2="25" y2="50" />
            <line x1="5" y1="60" x2="30" y2="60" />
          </g>
          <g fill={colors.speed}>
            <circle cx="5" cy="40" r="2" />
            <circle cx="2" cy="50" r="2" />
            <circle cx="5" cy="60" r="2" />
          </g>

          {/* Connective Nodes (Right/Bottom) */}
          <g stroke={isLight ? "#001D3D" : "#FF6B00"} strokeWidth="2" strokeLinecap="round" opacity={isLight ? 0.3 : 1}>
            <line x1="55" y1="85" x2="70" y2="75" />
            <line x1="70" y1="75" x2="85" y2="82" />
          </g>
          <g fill={isLight ? "#001D3D" : "#FF6B00"} opacity={isLight ? 0.3 : 1}>
            <circle cx="55" cy="85" r="3" />
            <circle cx="70" cy="75" r="3" />
            <circle cx="85" cy="82" r="3" />
          </g>

          {/* Runner Figure */}
          <path 
            d="M75 35C74 38 68 45 60 48C63 53 66 58 68 62L60 65C58 58 54 50 50 45C45 48 38 52 30 55C35 48 42 42 48 38C44 35 38 32 30 30L35 25C45 28 52 32 58 38C62 30 68 25 75 22L78 28C72 30 68 35 65 42L75 35Z" 
            fill={colors.runner} 
          />
          <circle cx="70" cy="30" r="6" fill={colors.runner} />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className={`text-2xl md:text-3xl font-black tracking-tighter uppercase flex items-baseline ${colors.text}`}>
            Smart<span className={colors.brandPe}>PE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-[2px] ${isLight ? 'bg-white/20' : 'bg-[#FF6B00]'} flex-1`}></div>
            <span className={`text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] ${isLight ? 'text-white' : 'text-[#FF6B00]'}`}>
              India
            </span>
            <div className={`h-[2px] ${isLight ? 'bg-white/20' : 'bg-[#FF6B00]'} flex-1`}></div>
          </div>
          <div className={`text-[6px] md:text-[7px] font-bold uppercase tracking-[0.15em] mt-1 whitespace-nowrap ${colors.tagline}`}>
            MOVE • TRACK • GROW • TOGETHER
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
