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
      const matchCat = selectedCat === 'all' || item.categoryId === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        item.title.toLowerCase().includes(q) ||
        item.instansi.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q));
      return matchCat && matchQuery;
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
    <section id="katalog-perizinan" className="relative py-16 px-4 bg-slate-50 dark:bg-darkbg-base transition-colors duration-200 overflow-hidden">
      {/* Ambient Topographic Texture Accent */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.04] dark:opacity-[0.1] pointer-events-none mix-blend-luminosity"
        style={{ backgroundImage: "url('/images/backgrounds/bg_topographic_mesh.jpg')" }}
      />
      <div className="relative max-w-7xl mx-auto space-y-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wider uppercase">
            Katalog Layanan Resmi
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white">
            Semua Perizinan MPP Kabupaten Madiun
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Temukan syarat, alur, dan ketentuan seluruh izin berusaha dan pelayanan publik di satu tempat.
          </p>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari perizinan... misal: kosmetika, warung kopi, BPHTB, SKCK, akta lahir"
              className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-madiun-forest text-slate-900 dark:text-slate-100"
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
                  ? 'bg-madiun-forest text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
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
                    ? 'bg-madiun-forest text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Page status text (Matching screenshot 1 'Menampilkan 1 dari 8 Halaman') */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Menampilkan Halaman {currentPage} dari {totalPages} Halaman ({filteredItems.length} perizinan ditemukan)</span>
        </div>

        {/* Cards Grid (Matching Screenshot 1 of official web) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                {/* Title */}
                <div>
                  <h3 
                    onClick={() => onSelectPerizinan(item)}
                    className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-madiun-forest dark:group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2"
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                      {item.jenisPerizinan || 'Perizinan Baru'}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {item.waktuPelayanan}
                    </span>
                  </div>
                </div>

                {/* Brief Requirements snippet */}
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
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
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPerizinan(item)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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

        {/* Pagination Bar (Matching official website) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
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
                      ? 'bg-madiun-forest text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
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
