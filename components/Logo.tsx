import React from 'react';

// SmartPE India — Dynamic athlete + circuit/AI brain logo
const Logo: React.FC<{ size?: number; showText?: boolean }> = ({ size = 48, showText = true }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Mark */}
      <div style={{ width: size, height: size }} className="relative flex-shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
          {/* Outer ring - gradient */}
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.6"/>
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle cx="50" cy="50" r="48" fill="#0f172a" />

          {/* Outer arc ring - orange */}
          <circle cx="50" cy="50" r="44" stroke="url(#ringGrad)" strokeWidth="3" fill="none" strokeDasharray="180 100" strokeLinecap="round" transform="rotate(-120 50 50)" />

          {/* Inner accent ring */}
          <circle cx="50" cy="50" r="37" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="80 200" strokeLinecap="round" transform="rotate(60 50 50)" opacity="0.6"/>

          {/* Running athlete figure */}
          {/* Head */}
          <circle cx="62" cy="22" r="7" fill="url(#bodyGrad)" />

          {/* Torso - leaning forward */}
          <path d="M58 29 L48 52" stroke="url(#bodyGrad)" strokeWidth="5" strokeLinecap="round"/>

          {/* Arms */}
          <path d="M55 38 L68 32" stroke="url(#bodyGrad)" strokeWidth="4" strokeLinecap="round"/>
          <path d="M53 42 L40 36" stroke="#f97316" strokeWidth="4" strokeLinecap="round"/>

          {/* Front leg - stride forward */}
          <path d="M48 52 L58 68 L52 80" stroke="url(#bodyGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Back leg - behind */}
          <path d="M48 52 L36 62 L42 76" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>

          {/* AI circuit dots - representing intelligence */}
          <circle cx="22" cy="30" r="2.5" fill="#f97316" opacity="0.8"/>
          <circle cx="16" cy="42" r="2" fill="#f97316" opacity="0.6"/>
          <circle cx="78" cy="55" r="2.5" fill="#6366f1" opacity="0.8"/>
          <circle cx="84" cy="68" r="2" fill="#6366f1" opacity="0.6"/>

          {/* Circuit lines */}
          <path d="M22 30 L16 42" stroke="#f97316" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
          <path d="M78 55 L84 68" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>

          {/* Speed lines */}
          <path d="M18 58 L30 58" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          <path d="M14 65 L28 65" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <path d="M17 72 L26 72" stroke="#f97316" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>

          {/* India flag colors - small dot accent */}
          <circle cx="50" cy="92" r="3" fill="#f97316"/>
          <circle cx="50" cy="92" r="1.2" fill="white" opacity="0.8"/>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-black text-white tracking-tighter" style={{ fontSize: size * 0.38, letterSpacing: '-0.03em' }}>
            SMART<span className="text-orange-400">PE</span>
          </span>
          <span className="font-bold text-orange-400 tracking-widest uppercase" style={{ fontSize: size * 0.18 }}>
            INDIA
          </span>
          <span className="text-slate-500 font-semibold uppercase tracking-widest" style={{ fontSize: size * 0.12 }}>
            PLAN · TEACH · LEAD
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
