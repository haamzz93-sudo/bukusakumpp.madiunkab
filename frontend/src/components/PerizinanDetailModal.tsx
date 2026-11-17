import React, { useState } from 'react';
import { X, Clock, Building2, CheckCircle2, MessageSquare, ExternalLink, Share2, Check } from 'lucide-react';
import { Perizinan } from '../types/perizinan';
import { WA_NUM_MPP } from '../services/hybridAiService';
import { WhatsAppIcon } from './WhatsAppIcon';

interface PerizinanDetailModalProps {
  perizinan: Perizinan | null;
  isOpen: boolean;
  onClose: () => void;
  onAskChat: (query: string) => void;
}

export const PerizinanDetailModal: React.FC<PerizinanDetailModalProps> = ({
  perizinan,
  isOpen,
  onClose,
  onAskChat
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !perizinan) return null;

  const handleAskInChat = () => {
    onClose();
    onAskChat(`Bagaimana syarat dan alur lengkap ${perizinan.title}?`);
  };

  const handleCopyLink = () => {
    const slug = perizinan.slug || String(perizinan.id);
    const fullUrl = `${window.location.origin}/perizinan/${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const pers = perizinan.persyaratan;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card (Matching Screenshot 2) */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950/95 rounded-3xl shadow-2xl border border-emerald-500/25 flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden text-slate-100 backdrop-blur-2xl">
        
        {/* Sticky Header with Close Button & Share SOP */}
        <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md px-6 py-4 border-b border-emerald-500/15 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span>Beranda</span>
            <span>/</span>
            <span>Perizinan</span>
            <span>/</span>
            <span className="text-slate-400">Detail Layanan</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                copiedLink 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-emerald-500/20'
              }`}
              title="Salin tautan permanen SOP perizinan ini"
              aria-label="Salin Tautan"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Tautan Tersalin' : 'Bagikan SOP'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="Tutup Detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 text-slate-200 text-sm leading-relaxed">
          
          {/* Main Title & Badges */}
          <div className="text-center max-w-2xl mx-auto space-y-3 pb-6 border-b border-emerald-500/15">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              {perizinan.title}
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                {perizinan.jenisPerizinan || 'Perizinan Baru'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-mpp-bright" />
                <span>{perizinan.waktuPelayanan}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold text-xs">
                Biaya: {perizinan.biaya || 'Gratis'}
              </span>
            </div>

            <p className="text-xs text-slate-300 flex items-center justify-center gap-1.5 pt-1">
              <Building2 className="w-3.5 h-3.5 text-mpp-bright" />
              <span>Instansi Pelaksana: <strong className="text-white">{perizinan.instansi}</strong></span>
            </p>
          </div>

          {/* Section: Persyaratan */}
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-base tracking-wider uppercase text-white border-b-2 border-emerald-500 pb-1.5 inline-block">
              PERSYARATAN:
            </h3>

            {pers.administratif && pers.administratif.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">
                  A. Dokumen Administratif
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {pers.administratif.map((req, idx) => (
                    <li key={idx} className="leading-relaxed whitespace-pre-line">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {pers.teknis && pers.teknis.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-white text-sm">
                  B. Dokumen Teknis & Operasional
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {pers.teknis.map((req, idx) => (
                    <li key={idx} className="leading-relaxed whitespace-pre-line">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {pers.umum && pers.umum.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-white text-sm">
                  Persyaratan Umum
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {pers.umum.map((req, idx) => (
                    <li key={idx} className="leading-relaxed whitespace-pre-line">{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section: Sistem, Mekanisme & Prosedur */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display font-extrabold text-base tracking-wider uppercase text-white border-b-2 border-emerald-500 pb-1.5 inline-block">
              SISTEM, MEKANISME & PROSEDUR:
            </h3>

            <ol className="list-decimal pl-5 space-y-2 text-slate-300">
              {perizinan.mekanismeProsedur.map((step, idx) => (
                <li key={idx} className="leading-relaxed pl-1">{step}</li>
              ))}
            </ol>

            {perizinan.portalUrl && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-3 mt-4">
                <span>Pengajuan online dapat diakses melalui portal resmi terintegrasi:</span>
                <a
                  href={perizinan.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline flex items-center gap-1 shrink-0 text-emerald-300 hover:text-emerald-100"
                >
                  <span>{perizinan.portalUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="sticky bottom-0 bg-slate-950/95 backdrop-blur-md px-6 py-4 border-t border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <button
            onClick={handleAskInChat}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-madiun-forest hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-mpp-bright" />
            <span>Tanya Buku Saku tentang Izin Ini</span>
          </button>

          {/* WhatsApp Direct Chat Button (Like screenshot 2 'Mulai Chat') */}
          <a
            href={`https://wa.me/${WA_NUM_MPP}?text=${encodeURIComponent(`Halo Mal Pelayanan Publik Kabupaten Madiun, saya ingin bertanya mengenai perizinan: ${perizinan.title}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Mulai Chat</span>
            <WhatsAppIcon size={20} className="text-white shrink-0" />
          </a>

        </div>

      </div>
    </div>
  );
};
