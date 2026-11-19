import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredSettings, subscribeSettings, AppSettings } from '../services/settingsStore';

export const ContactFooter: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsub = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return unsub;
  }, []);

  const cleanWaNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const formattedWaNumber = cleanWaNumber.startsWith('0') 
    ? `62${cleanWaNumber.substring(1)}` 
    : cleanWaNumber;

  return (
    <footer id="kontak" className="bg-madiun-deep text-slate-300 pt-16 pb-12 px-4 border-t border-emerald-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-emerald-900/60">
        
        {/* Brand & Mission Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={settings.logoMppUrl || "/images/logo_mpp_madiun_hd.png"} 
              alt="Logo Mal Pelayanan Publik Kabupaten Madiun" 
              className="h-11 w-auto object-contain drop-shadow" 
            />
            <div className="h-7 w-px bg-white/20 rounded-full" />
            <img 
              src={settings.logoWhiteUrl || "/images/logo_buku_saku_white_gold.png"} 
              alt="Logo Buku Saku MPP Kabupaten Madiun" 
              className="h-10 w-auto object-contain" 
            />
          </div>

          <p className="text-xs text-slate-300/80 leading-relaxed max-w-sm">
            {settings.footerAbout}
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-700/40 text-[11px] text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-mpp-bright" />
            <span>Terintegrasi dengan OSS RBA & Standar Pelayanan DPMPTSP</span>
          </div>
        </div>

        {/* Contact Loket MPP */}
        <div id="tour-contact-card" className="md:col-span-4 space-y-3">
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Hubungi Loket MPP
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300/90">
            <li className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span>Telepon: </span>
                <a href={`tel:${settings.phone}`} className="text-white hover:underline">{settings.phone}</a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">WA:</span>
              <div>
                <span>WhatsApp Helpdesk: </span>
                <a 
                  href={`https://wa.me/${formattedWaNumber}?text=${encodeURIComponent('Halo Mal Pelayanan Publik Kabupaten Madiun, saya butuh informasi perizinan.')}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-mpp-bright hover:underline font-semibold"
                >
                  {settings.whatsappNumber}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span>Email: </span>
                <a href={`mailto:${settings.email}`} className="text-white hover:underline">{settings.email}</a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span>Jam Layanan: </span>
                <span className="text-white">{settings.workingHours}</span>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-medium">{settings.address}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Official Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Tautan Resmi
          </h4>
          <ul className="space-y-2 text-xs">
            {settings.footerLinks.map((link, idx) => (
              <li key={idx}>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Legal Band */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
        <p>
          Informasi bersifat panduan digital; ketentuan resmi tetap mengacu pada peraturan perundang-undangan dan verifikasi teknis dinas terkait.
        </p>
        <p className="shrink-0 text-slate-400">
          &copy; 2026 Mal Pelayanan Publik (MPP) Kabupaten Madiun
        </p>
      </div>

    </footer>
  );
};

export default ContactFooter;
