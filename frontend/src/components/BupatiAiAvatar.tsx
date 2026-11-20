import React from 'react';

interface BupatiAiAvatarProps {
  isSpeaking?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BupatiAiAvatar: React.FC<BupatiAiAvatarProps> = ({
  isSpeaking = false,
  size = 'md',
  showLabel = false,
  className = '',
  onClick
}) => {
  // Dimensions map
  const sizeClasses = {
    xs: 'w-7 h-7 sm:w-8 sm:h-8',
    sm: 'w-9 h-9 sm:w-10 sm:h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28'
  }[size];

  return (
    <div 
      className={`inline-flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Outer Glow Halo & Circular Frame */}
      <div className={`relative ${sizeClasses} shrink-0`}>
        {/* Animated Soundwave Pulse Ring when Speaking */}
        {isSpeaking && (
          <>
            <span className="absolute -inset-1.5 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
            <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Circular Avatar Shell with Gold & Emerald Trim */}
        <div 
          className="w-full h-full rounded-full overflow-hidden relative shadow-lg transition-transform duration-300"
          style={{
            border: isSpeaking ? '2.5px solid #10b981' : '2px solid #34d399',
            boxShadow: isSpeaking 
              ? '0 0 20px rgba(16, 185, 129, 0.65), 0 4px 12px rgba(0, 0, 0, 0.4)'
              : '0 0 10px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Active Speaking State: Video Loop of Bupati Lip-Sync */}
          <video
            src="/avatar/bupati_talking.mp4"
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isSpeaking ? 'opacity-100 scale-105' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          />

          {/* Idle / Standby State: Crisp Official High-Res Photo */}
          <img
            src="/avatar/bupati_photo1.png"
            alt="Bapak Bupati Madiun"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isSpeaking ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          />

          {/* Micro Live Indicator Dot */}
          <div 
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 transition-colors ${
              isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
            }`}
            title={isSpeaking ? 'Sedang Berbicara' : 'Siaga Melayani'}
          />
        </div>
      </div>

      {/* Optional Dignified Civic Label */}
      {showLabel && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
              H. Hari Wuryanto, S.H., M.Ak.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bupati Madiun · Asisten AI Resmi</span>
          </div>
        </div>
      )}
    </div>
  );
};
