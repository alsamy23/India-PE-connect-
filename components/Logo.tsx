import React from 'react';
import logoImg from '../src/assets/images/smart_pe_logo_1784962262385.jpg';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  variant = 'color',
  size = 'md' 
}) => {
  const isLight = variant === 'light';

  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const subtitleSizes = {
    sm: 'text-[7px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-[13px]'
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Smart PE India Official Shield Emblem Image */}
      <div className={`relative flex items-center justify-center flex-shrink-0 ${emblemSizes[size]}`}>
        <img 
          src={logoImg} 
          alt="Smart PE India Logo" 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 hover:scale-105"
        />
      </div>

      {/* Brand Wordmark & Tagline Block */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          {/* Main Title: Smart PE India */}
          <div className={`font-extrabold font-sans tracking-tight flex items-center ${textSizes[size]}`}>
            <span className={isLight ? 'text-white' : 'text-[#0F2C59]'}>Smart</span>
            <span className="text-[#2BB673] mx-1">PE</span>
            <span className={isLight ? 'text-slate-100' : 'text-[#0F2C59]'}>India</span>
          </div>

          {/* Tagline: — MANAGE • TRACK • EMPOWER — */}
          <div className="flex items-center gap-1.5 mt-1 leading-none">
            <div className={`h-[1.5px] w-3.5 ${isLight ? 'bg-white/30' : 'bg-[#0F2C59]/30'}`}></div>
            <div className={`flex items-center space-x-1 font-bold uppercase tracking-[0.18em] ${subtitleSizes[size]} ${isLight ? 'text-slate-300' : 'text-[#0F2C59]'}`}>
              <span>MANAGE</span>
              <span className="text-[#FF8C1A] font-black">•</span>
              <span>TRACK</span>
              <span className="text-[#2BB673] font-black">•</span>
              <span>EMPOWER</span>
            </div>
            <div className={`h-[1.5px] w-3.5 ${isLight ? 'bg-white/30' : 'bg-[#0F2C59]/30'}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
