import React from 'react';

interface TrustLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  glowColor?: 'orange' | 'gold' | 'red';
  isAlive?: boolean;
}

export const TrustLogo: React.FC<TrustLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  glowColor = 'orange',
  isAlive = true,
}) => {
  // Determine pixel size
  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 80, height: 80 },
    lg: { width: 140, height: 140 },
    xl: { width: 220, height: 220 },
  };
  const currentSize = sizeMap[size];

  // Glow shadow style matching premium design
  const glowShadows = {
    orange: 'rgba(249, 115, 22, 0.6)',
    gold: 'rgba(234, 179, 8, 0.6)',
    red: 'rgba(239, 68, 68, 0.6)',
  };
  const shadowColor = glowShadows[glowColor];

  return (
    <div className={`relative flex flex-col items-center justify-center text-center ${className}`}>
      {/* Dynamic Animated Stylesheet */}
      <style>{`
        @keyframes trustGlowBreath {
          0%, 100% {
            filter: drop-shadow(0 0 6px ${shadowColor}) drop-shadow(0 0 15px rgba(249, 115, 22, 0.3));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 18px ${shadowColor}) drop-shadow(0 0 35px rgba(239, 68, 68, 0.6));
            transform: scale(1.025);
          }
        }
        @keyframes trustRipple {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @keyframes radarSweep {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .trust-logo-alive {
          animation: trustGlowBreath 3s ease-in-out infinite;
          transform-origin: center;
          will-change: filter, transform;
        }
        .trust-line {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: trustDrawLines 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes trustDrawLines {
          to {
            stroke-dashoffset: 0;
          }
        }
        .ripple-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(249, 115, 22, 0.4);
          background: radial-gradient(circle, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0) 70%);
          pointer-events: none;
          z-index: 0;
        }
        .ripple-1 { animation: trustRipple 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .ripple-2 { animation: trustRipple 3s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s; }
        .ripple-3 { animation: trustRipple 3s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s; }
        
        .radar-scanner {
          position: absolute;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 70%, rgba(239, 68, 68, 0.1) 80%, rgba(249, 115, 22, 0.4) 100%);
          pointer-events: none;
          z-index: 0;
          animation: radarSweep 4s linear infinite;
        }
      `}</style>

      {/* Live Vigilance Shapes (Ripples & Radar) */}
      {isAlive && (
        <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none" style={{ top: variant === 'full' ? '-20px' : '0' }}>
           <div className="ripple-ring ripple-1" style={{ width: currentSize.width * 1.5, height: currentSize.width * 1.5 }} />
           <div className="ripple-ring ripple-2" style={{ width: currentSize.width * 1.5, height: currentSize.width * 1.5 }} />
           <div className="ripple-ring ripple-3" style={{ width: currentSize.width * 1.5, height: currentSize.width * 1.5 }} />
           <div className="radar-scanner" style={{ width: currentSize.width * 2, height: currentSize.width * 2 }} />
        </div>
      )}

      {/* SVG Icon Representation of the Trust T Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <svg
          width={currentSize.width}
          height={currentSize.height}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${isAlive ? 'trust-logo-alive' : ''} transition-all duration-300`}
          id="trust-palestine-svg-logo"
        >
        <defs>
          {/* Official vibrant gradient: Red to Orange to Gold */}
          <linearGradient id="trust-orange-red-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#EAB308" /> {/* Gold */}
            <stop offset="50%" stopColor="#F97316" /> {/* Orange */}
            <stop offset="100%" stopColor="#DC2626" /> {/* Vibrant Red */}
          </linearGradient>
        </defs>

        {/* Thick Top Horizontal Bar of the T */}
        <rect
          x="20"
          y="10"
          width="80"
          height="12"
          fill="url(#trust-orange-red-grad)"
          rx="1"
        />

        {/* Central Vertical Stem Column */}
        <rect
          x="54"
          y="26"
          width="12"
          height="84"
          fill="url(#trust-orange-red-grad)"
          rx="1"
        />

        {/* concentric nested L-shapes on the Left bending to the left */}
        {/* Line 1 (outermost) */}
        <path
          d="M 26 26 L 46 26 L 46 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.1s' }}
        />
        {/* Line 2 */}
        <path
          d="M 26 34 L 40 34 L 40 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.2s' }}
        />
        {/* Line 3 */}
        <path
          d="M 26 42 L 34 42 L 34 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.3s' }}
        />
        {/* Line 4 (innermost left) */}
        <path
          d="M 26 50 L 28 50 L 28 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.4s' }}
        />

        {/* concentric nested L-shapes on the Right bending to the right */}
        {/* Line 1 (outermost right) */}
        <path
          d="M 94 26 L 74 26 L 74 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.1s' }}
        />
        {/* Line 2 */}
        <path
          d="M 94 34 L 80 34 L 80 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.2s' }}
        />
        {/* Line 3 */}
        <path
          d="M 94 42 L 86 42 L 86 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.3s' }}
        />
        {/* Line 4 (innermost right) */}
        <path
          d="M 94 50 L 92 50 L 92 110"
          stroke="url(#trust-orange-red-grad)"
          strokeWidth="4.5"
          strokeLinecap="square"
          fill="none"
          className="trust-line"
          style={{ animationDelay: '0.4s' }}
        />
      </svg>
      {/* Typography variant: "ترست للتأمين" and "فلسطين" */}
      {variant === 'full' && (
        <div className="mt-4 select-none">
          <h3 
            className="text-[#3A3F44] dark:text-white font-extrabold tracking-wide"
            style={{
              fontSize: size === 'xl' ? '1.75rem' : size === 'lg' ? '1.35rem' : '1rem',
              fontFamily: '"Cairo", "system-ui", sans-serif',
              textShadow: isAlive ? `0 0 10px rgba(249, 115, 22, 0.1)` : 'none',
            }}
          >
            ترست للتأمين
          </h3>
          <p 
            className="text-slate-500 dark:text-slate-400 font-medium tracking-widest mt-0.5 uppercase"
            style={{
              fontSize: size === 'xl' ? '1rem' : size === 'lg' ? '0.85rem' : '0.7rem',
              fontFamily: '"Cairo", "system-ui", sans-serif',
            }}
          >
            فلسطين
          </p>
        </div>
      )}
      </div>
    </div>
  );
};
