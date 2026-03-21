import React from 'react';

// New Sleek Logo for SmartPE India
const Logo: React.FC<{ size?: number; showText?: boolean }> = ({ size = 48, showText = true }) => {
  const isCompact = size < 40;

  return (
    <div className="flex items-center gap-3">
      {/* Logo Mark */}
      <div style={{ width: size, height: size }} className="relative flex-shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo-600 */}
              <stop offset="100%" stopColor="#312E81" /> {/* Indigo-900 */}
            </linearGradient>
            <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" /> {/* Orange-500 */}
              <stop offset="100%" stopColor="#E11D48" /> {/* Rose-600 */}
            </linearGradient>
            <linearGradient id="sGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDBA74" /> {/* Orange-300 */}
              <stop offset="100%" stopColor="#F97316" /> {/* Orange-500 */}
            </linearGradient>
          </defs>

          {/* Background hexagonal shield shape */}
          <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="url(#shieldGrad)" />
          
          {/* Inner Accent Path for dynamic feel */}
          <path d="M50 12 L82 28 L82 72 L50 88 L18 72 L18 28 Z" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          
          {/* Central 'S' shaped like a dynamic abstract athlete/flame integrated */}
          <path d="M65 30 C 65 30 55 20 40 25 C 25 30 30 45 45 50 C 60 55 70 70 55 80 C 40 90 28 80 28 80" stroke="url(#sGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M65 30 C 65 30 55 20 40 25 C 25 30 30 45 45 50 C 60 55 70 70 55 80 C 40 90 28 80 28 80" stroke="url(#sGradLight)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

          {/* Minimalist target/knowledge circles at the endpoints of 'S' */}
          <circle cx="65" cy="30" r="4" fill="#FFFFFF" />
          <circle cx="28" cy="80" r="4" fill="#FFFFFF" />

          {/* AI / Tech elements - glowing dots connected */}
          <circle cx="80" cy="50" r="3" fill="#60A5FA" />
          <circle cx="20" cy="50" r="3" fill="#60A5FA" />
          <path d="M80 50 L70 50" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M20 50 L30 50" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="2 2" />

        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="min-w-0 flex flex-col justify-center">
          <span
            className="whitespace-nowrap font-black text-slate-900"
            style={{ fontSize: Math.max(size * 0.26, 14), letterSpacing: '-0.04em', lineHeight: 1 }}
          >
            SMART <span className="text-orange-500">PE</span> INDIA
          </span>
          {!isCompact && (
            <span
              className="mt-1 whitespace-nowrap font-semibold uppercase text-indigo-500"
              style={{ fontSize: Math.max(size * 0.115, 9), letterSpacing: '0.18em', lineHeight: 1.15 }}
            >
              Empowering PE Teachers &amp; Coaches
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
