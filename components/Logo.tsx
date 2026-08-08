import React from 'react';
import logoImg from '../src/assets/images/smart_pe_logo_1784962262385.jpg';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customLogoUrl?: string | null;
  customSchoolName?: string | null;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  variant = 'color',
  size = 'md',
  customLogoUrl,
  customSchoolName
}) => {
  const isLight = variant === 'light';

  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-xs md:text-sm',
    md: 'text-sm md:text-base',
    lg: 'text-base md:text-lg',
    xl: 'text-xl md:text-2xl'
  };

  const taglineSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[10px]',
    xl: 'text-[12px]'
  };

  const hasCustomLogo = Boolean(customLogoUrl);
  const displayName = customSchoolName || 'SMART PE INDIA';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Smart PE / Custom School Emblem */}
      <div className={`relative flex items-center justify-center flex-shrink-0 ${emblemSizes[size]}`}>
        {hasCustomLogo ? (
          <img 
            src={customLogoUrl!} 
            alt={displayName} 
            className="w-full h-full object-contain transition-transform duration-200 hover:scale-105 drop-shadow-md rounded-lg bg-white p-0.5 border border-slate-200/50"
          />
        ) : logoImg ? (
          <img 
            src={logoImg} 
            alt="Smart PE India Logo" 
            className="w-full h-full object-contain transition-transform duration-200 hover:scale-105 drop-shadow-md rounded-lg"
          />
        ) : (
          /* SVG Shield Emblem matching Brand Sheet */
          <svg viewBox="0 0 100 115" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D2B52" />
                <stop offset="100%" stopColor="#071933" />
              </linearGradient>
              <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F3C649" />
                <stop offset="50%" stopColor="#D4A017" />
                <stop offset="100%" stopColor="#997008" />
              </linearGradient>
            </defs>
            {/* Outer Shield Border */}
            <path d="M 50,4 L 92,18 V 58 C 92,84 72,104 50,111 C 28,104 8,84 8,58 V 18 Z" fill="url(#shieldBg)" stroke="url(#goldBorder)" strokeWidth="6" />
            {/* Circuit Traces */}
            <path d="M 16,30 L 30,30 L 36,40" stroke="#D4A017" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
            <circle cx="36" cy="40" r="2" fill="#D4A017" />
            <path d="M 84,30 L 70,30 L 64,40" stroke="#D4A017" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
            <circle cx="64" cy="40" r="2" fill="#D4A017" />
            {/* Runner Silhouette */}
            <path d="M 54,26 C 56.5,26 58.5,24 58.5,21.5 C 58.5,19 56.5,17 54,17 C 51.5,17 49.5,19 49.5,21.5 C 49.5,24 51.5,26 54,26 Z M 68,36 L 57,32 L 51,26 C 49.5,24.5 47,24.5 45.5,26 L 37,34.5 C 36,35.5 36,37 37,38 C 38,39 39.5,39 40.5,38 L 47,31.5 L 45,43 L 34,49 C 32.5,49.8 32,51.5 32.8,53 C 33.6,54.5 35.3,55 36.8,54.2 L 47,48.5 L 53.5,68 C 54,69.5 55.5,70.5 57,70 C 58.5,69.5 59.5,68 59,66.5 L 53.5,49.5 L 61,42 L 67,53 C 67.8,54.5 69.5,55 71,54.2 C 72.5,53.4 73,51.7 72.2,50.2 L 65.5,38 Z" fill="#D4A017" />
          </svg>
        )}
      </div>

      {/* Brand / Custom School Title */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight max-w-[200px] md:max-w-[260px]">
          <div className={`font-black uppercase tracking-tight truncate ${textSizes[size]} ${isLight ? 'text-white' : 'text-[#0D2B52]'}`}>
            {displayName}
          </div>

          <p className={`font-bold font-sans tracking-wide mt-0.5 leading-none truncate ${taglineSizes[size]} ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>
            {customSchoolName ? 'PE Department Portal' : 'Plan Smarter. Teach Better.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
