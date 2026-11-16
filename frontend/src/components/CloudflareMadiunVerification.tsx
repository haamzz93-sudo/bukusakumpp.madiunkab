import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface CloudflareMadiunVerificationProps {
  isOpen: boolean;
  onVerified: () => void;
  onCancel?: () => void;
  autoCompleteSeconds?: number;
  rayId?: string;
}

export const CloudflareMadiunVerification: React.FC<CloudflareMadiunVerificationProps> = ({
  isOpen,
  onVerified,
  onCancel,
  autoCompleteSeconds = 1.8,
  rayId = '85b5bd7e1ab024e1'
}) => {
  const [progress, setProgress] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(15);
      setIsCompleted(false);
      return;
    }

    const intervalTime = (autoCompleteSeconds * 1000) / 40;
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(timer);
          setIsCompleted(true);
          setTimeout(() => {
            onVerified();
          }, 400);
          return 100;
        }
        // Smooth random stepping
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, autoCompleteSeconds, onVerified]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      
      {/* Background Hexagonal Wireframe Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30 bg-repeat"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(250, 204, 21, 0.15) 0%, transparent 70%), 
            url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zm0 104L0 86.68V52.04l30 17.32 30-17.32v34.64L30 104z' fill='%23059669' fill-opacity='0.25' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}
      />

      {/* Main Security Verification Card (Matching Screenshot media_1794824214216_1a015345.jpg) */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-900/30 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Optional Cancel/Close Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            title="Tutup / Batalkan"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Card Header (Deep Forest Green with Gold Divider) */}
        <div className="bg-[#144833] pt-7 pb-6 px-6 relative border-b-2 border-[#d97706]/70 flex flex-col items-center">
          
          {/* Madiun Bersahaja Official Emblem Banner */}
          <div className="bg-white rounded-xl shadow-md px-5 py-2.5 flex items-center justify-center border border-slate-200 max-w-xs w-full">
            <img 
              src="/images/madiun_bersahaja_banner_hd.png" 
              alt="Pemerintah Kabupaten Madiun - Madiun Bersahaja" 
              className="h-10 w-auto object-contain"
            />
          </div>

        </div>

        {/* Card Body */}
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-white min-h-[220px]">
          
          {/* Golden Cloudflare Verification Pill Button */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border-2 border-amber-400 bg-amber-50/70 text-amber-900 font-bold text-xs sm:text-sm tracking-wider shadow-sm transition-all">
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
            ) : (
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 animate-ping absolute opacity-60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
            )}
            <span className="uppercase">
              {isCompleted ? 'VERIFIKASI BERHASIL' : 'CLOUDFLARE VERIFICATION'}
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-64 max-w-xs mt-8 mb-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-500 transition-all duration-150 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>Keamanan Jaringan</span>
              <span>{progress}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-sm mt-3 leading-relaxed">
            Memverifikasi integritas koneksi aman Diskominfo Pemerintah Kabupaten Madiun sebelum masuk ke sistem.
          </p>

        </div>

        {/* Card Footer (Deep Forest Green Matching Official Screenshot) */}
        <div className="bg-[#144833] text-white py-4 px-6 text-center border-t border-emerald-800/40">
          <p className="text-xs text-slate-200">
            Dilindungi oleh <span className="text-[#facc15] font-semibold">Diskominfo</span> | &copy; Pemerintah Kabupaten Madiun
          </p>
          <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-slate-300/80 font-mono">
            <span>Ray: {rayId}</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1 text-[#f97316] font-sans font-medium">
              <span className="w-2 h-2 rounded-full bg-[#f97316]" />
              Madiun Bersahaja
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
