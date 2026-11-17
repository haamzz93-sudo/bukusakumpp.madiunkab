import React, { useState, useMemo, useEffect } from 'react';
import { Search, Clock, ArrowRight, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Perizinan } from '../types/perizinan';
import { KATEGORI_PERIZINAN } from '../data/perizinanMadiunData';
import { getStoredPerizinan, subscribePerizinan } from '../services/perizinanStore';

interface KatalogPerizinanSectionProps {
  onSelectPerizinan: (p: Perizinan) => void;
  onAskChat: (query: string) => void;
}

export const KatalogPerizinanSection: React.FC<KatalogPerizinanSectionProps> = ({
  onSelectPerizinan,
  onAskChat
}) => {
  const [perizinanList, setPerizinanList] = useState<Perizinan[]>(getStoredPerizinan());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setPerizinanList(getStoredPerizinan());
    const unsubscribe = subscribePerizinan((updated) => {
      setPerizinanList(updated);
    });
    return unsubscribe;
  }, []);

  const filteredItems = useMemo(() => {
    return perizinanList.filter((item) => {
      if (!item) return false;
      const matchCat = selectedCat === 'all' || item.categoryId === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCat;

      const titleMatch = Boolean(item.title && item.title.toLowerCase().includes(q));
      const instansiMatch = Boolean(item.instansi && item.instansi.toLowerCase().includes(q));
      const keywordsMatch = Array.isArray(item.keywords)
        ? item.keywords.some(k => typeof k === 'string' && k.toLowerCase().includes(q))
        : typeof item.keywords === 'string'
        ? (item.keywords as string).toLowerCase().includes(q)
        : false;

      return matchCat && (titleMatch || instansiMatch || keywordsMatch);
    });
  }, [perizinanList, searchQuery, selectedCat]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const el = document.getElementById('katalog-perizinan');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="katalog-perizinan" className="relative py-16 px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-emerald-500/10 transition-colors duration-200 overflow-hidden">
      {/* Ambient Topographic Texture Accent */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.04] dark:opacity-[0.08] pointer-events-none mix-blend-luminosity"
        style={{ backgroundImage: "url('/images/backgrounds/bg_topographic_mesh.jpg')" }}
      />
      
      {/* Soft Ambient Radial Glass Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold tracking-wider uppercase">
            Katalog Layanan Resmi
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white">
            Semua Perizinan MPP Kabupaten Madiun
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Temukan syarat, alur, dan ketentuan seluruh izin berusaha dan pelayanan publik di satu tempat.
          </p>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="liquid-glass-sidebar rounded-2xl p-4 shadow-xl border border-emerald-500/20 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari perizinan... misal: kosmetika, warung kopi, BPHTB, SKCK, akta lahir"
              className="w-full py-3 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-emerald-500/25 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-mpp-bright text-slate-900 dark:text-white placeholder-slate-400 shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedCat('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCat === 'all'
                  ? 'bg-madiun-forest text-white border border-emerald-400/50 shadow-md'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-emerald-100/90 border border-slate-200 dark:border-emerald-500/20 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Semua ({perizinanList.length})
            </button>
            {KATEGORI_PERIZINAN.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCat(cat.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCat === cat.key
                    ? 'bg-madiun-forest text-white border border-emerald-400/50 shadow-md'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-emerald-100/90 border border-slate-200 dark:border-emerald-500/20 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Page status text */}
        <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300/80 font-medium px-1">
          <span>Menampilkan Halaman {currentPage} dari {totalPages} Halaman ({filteredItems.length} perizinan ditemukan)</span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="liquid-glass-card rounded-2xl border border-emerald-500/20 p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                {/* Title */}
                <div>
                  <h3 
                    onClick={() => onSelectPerizinan(item)}
                    className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-mpp-bright transition-colors cursor-pointer line-clamp-2"
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                      {item.jenisPerizinan || 'Perizinan Baru'}
                    </span>
                    <span className="text-emerald-500/40 text-xs">•</span>
                    <span className="text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-mpp-bright" />
                      {item.waktuPelayanan}
                    </span>
                  </div>
                </div>

                {/* Brief Requirements snippet */}
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border-t border-slate-200/80 dark:border-emerald-500/15 pt-3">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                    PERSYARATAN UTAMA:
                  </div>
                  {item.persyaratan.administratif && (
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300 line-clamp-3">
                      {item.persyaratan.administratif.slice(0, 3).map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {item.persyaratan.umum && !item.persyaratan.administratif && (
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300 line-clamp-3">
                      {item.persyaratan.umum.slice(0, 3).map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>

              {/* Card Action Buttons */}
              <div className="pt-5 border-t border-slate-200/80 dark:border-emerald-500/15 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPerizinan(item)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-emerald-100 font-bold text-xs border border-slate-300 dark:border-emerald-500/30 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-mpp-bright" />
                  <span>Cek Detail</span>
                </button>

                <button
                  onClick={() => onAskChat(`Apa saja syarat dan alur ${item.title}?`)}
                  className="px-3.5 py-2 rounded-xl bg-mpp-bright hover:bg-mpp-yellow text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>Tanya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/20 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === p
                      ? 'bg-madiun-forest text-white border border-emerald-400/50 shadow-sm'
                      : 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/20 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
