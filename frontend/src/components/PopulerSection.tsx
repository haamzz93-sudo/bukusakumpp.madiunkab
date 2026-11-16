import React from 'react';
import { TrendingUp, ArrowRight, HelpCircle } from 'lucide-react';

interface PopulerSectionProps {
  onSelectQuery: (q: string) => void;
}

export const PopulerSection: React.FC<PopulerSectionProps> = ({ onSelectQuery }) => {
  const topQueries = [
    {
      rank: 1,
      text: 'Apa saja syarat dan alur izin buka warung kopi atau kafe di Kabupaten Madiun?',
      category: 'Perizinan Usaha (KBLI 56303)',
      time: '0 menit'
    },
    {
      rank: 2,
      text: 'Bagaimana prosedur pengajuan BPHTB atas waris secara mandiri tanpa calo?',
      category: 'Bapenda Kabupaten Madiun',
      time: '7 jam'
    },
    {
      rank: 3,
      text: 'Apa saja syarat dan biaya penerbitan SKCK baru di loket Polres MPP Madiun?',
      category: 'Kepolisian Resor Madiun',
      time: '15 menit'
    },
    {
      rank: 4,
      text: 'Bagaimana cara pendaftaran NPWP baru secara online via sistem Coretax DJP?',
      category: 'KPP Pratama Madiun',
      time: '4 menit'
    },
    {
      rank: 5,
      text: 'Apa syarat Izin Penerapan Cara Produksi Pangan Olahan yang Baik (IP-CPPOB)?',
      category: 'BPOM & Ketahanan Pangan',
      time: 'Online'
    },
    {
      rank: 6,
      text: 'Bagaimana cara aktivasi Identitas Kependudukan Digital (IKD) di MPP Madiun?',
      category: 'Disdukcapil Kabupaten Madiun',
      time: '15 menit'
    },
    {
      rank: 7,
      text: 'Apa syarat rekomendasi Surat Keterangan Miskin untuk Biakes Jamkesda?',
      category: 'Dinas Sosial Kab. Madiun',
      time: '60 menit'
    },
    {
      rank: 8,
      text: 'Apa syarat permohonan paspor baru dan penggantian paspor di MPP Madiun?',
      category: 'Kantor Imigrasi di MPP',
      time: '3 hari'
    }
  ];

  return (
    <section id="populer" className="py-16 px-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-wider uppercase mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Paling Sering Ditanya Warga</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Topik Populer Perizinan Madiun
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Pertanyaan nyata yang paling sering diajukan masyarakat dan pelaku usaha dalam 30 hari terakhir.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Klik topik mana pun untuk langsung melihat jawabannya
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topQueries.map((item) => (
            <button
              key={item.rank}
              onClick={() => onSelectQuery(item.text)}
              className="text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/80 dark:hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-slate-800 shadow-sm transition-all group flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-madiun-forest dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {item.rank}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-madiun-forest dark:group-hover:text-emerald-300 transition-colors leading-snug">
                    {item.text}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
                    <span className="text-emerald-700 dark:text-emerald-400">{item.category}</span>
                    <span>•</span>
                    <span>SLA: {item.time}</span>
                  </div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 group-hover:bg-mpp-bright text-slate-400 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-colors mt-0.5 shadow-sm">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
