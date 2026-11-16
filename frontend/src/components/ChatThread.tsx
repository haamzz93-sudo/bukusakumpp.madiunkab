import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Send,
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { ChatMessage } from '../types/perizinan';
import { WA_NUM_MPP, TELP_MPP } from '../services/hybridAiService';

interface ChatThreadProps {
  messages: ChatMessage[];
  currentQuery: string;
  isLoading: boolean;
  onSendFollowup: (query: string) => void;
  onBackToHome: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  currentQuery,
  isLoading,
  onSendFollowup,
  onBackToHome
}) => {
  const [followupText, setFollowupText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openSources, setOpenSources] = useState<{ [key: string]: boolean }>({});
  const [votes, setVotes] = useState<{ [key: string]: 'up' | 'down' }>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSource = (msgId: string) => {
    setOpenSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleVote = (msgId: string, type: 'up' | 'down') => {
    setVotes(prev => ({ ...prev, [msgId]: type }));
  };

  const handleFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followupText.trim() && !isLoading) {
      onSendFollowup(followupText.trim());
      setFollowupText('');
    }
  };

  const latestAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base transition-colors duration-200 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Subheader Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm shadow-sm transition-all self-start"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Kembali ke Beranda</span>
          </button>

          {/* Active Query Banner */}
          <div className="flex-1 max-w-xl sm:mx-4">
            <form onSubmit={handleFollowupSubmit} className="relative flex items-center">
              <input
                type="text"
                value={followupText}
                onChange={(e) => setFollowupText(e.target.value)}
                placeholder="Tanyakan hal lain seputar perizinan..."
                className="w-full py-2 pl-9 pr-24 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-madiun-forest dark:focus:border-emerald-400 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <button
                type="submit"
                disabled={!followupText.trim() || isLoading}
                className="absolute right-1.5 px-3 py-1 bg-mpp-bright hover:bg-mpp-yellow text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                Tanya
              </button>
            </form>
          </div>
        </div>

        {/* Main Grid: Thread on Left, Helpdesk Sidebar on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Chat Conversation Thread */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Buku Saku menjawab: <span className="text-slate-800 dark:text-slate-100 font-bold">"{currentQuery}"</span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSourcesOpen = openSources[msg.id];
              const currentVote = votes[msg.id];

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-2xl bg-madiun-forest text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md font-medium text-sm leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 space-y-4">
                  
                  {/* Assistant Identity Tag */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 font-display">
                        Buku Saku · Panduan Resmi MPP
                      </span>
                    </div>
                    {msg.via && (
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                        msg.via === 'gemini-llm-rag'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Cpu className="w-3 h-3 text-emerald-500" />
                        <span>
                          {msg.via === 'gemini-llm-rag' 
                            ? 'Gemini LLM · RAG Dokumen Resmi' 
                            : msg.via === 'docrag' || msg.via === 'pdf-rag-offline'
                            ? 'RAG Dokumen Pelayanan MPP'
                            : msg.via === 'faq'
                            ? 'SOP Katalog Resmi'
                            : 'Asistensi Umum'}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-3 prose dark:prose-invert max-w-none">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return <h3 key={pIdx} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                      }
                      if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                        const lines = paragraph.split('\n');
                        return (
                          <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2">
                            {lines.map((l, lIdx) => (
                              <li key={lIdx}>{l.replace(/^[\*\-]\s+/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.match(/^\d+\.\s+/)) {
                        const lines = paragraph.split('\n');
                        return (
                          <ol key={pIdx} className="list-decimal pl-5 space-y-1 my-2">
                            {lines.map((l, lIdx) => (
                              <li key={lIdx}>{l.replace(/^\d+\.\s+/, '')}</li>
                            ))}
                          </ol>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })}
                  </div>

                  {/* Accordion: Source Documents Cited */}
                  {msg.sourceItems && msg.sourceItems.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleSource(msg.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <span>Lihat sumber ({msg.sourceItems.length} dokumen standar pelayanan)</span>
                        {isSourcesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isSourcesOpen && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                          {msg.sourceItems.map((item, sIdx) => (
                            <div key={sIdx} className="flex items-start justify-between gap-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-1.5 last:border-0 last:pb-0">
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</div>
                                <div className="text-slate-500 dark:text-slate-400">{item.instansi} • {item.waktu || 'Standar Pelayanan'}</div>
                              </div>
                              {item.portal && item.portal.startsWith('http') && (
                                <a
                                  href={item.portal}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                                >
                                  <span>Portal Resmi</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions: Copy & Feedback */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Jawaban</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-[11px] text-slate-400">Membantu?</span>
                      <button
                        onClick={() => handleVote(msg.id, 'up')}
                        className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${currentVote === 'up' ? 'text-emerald-600 font-bold' : ''}`}
                        title="Bagus / Membantu"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleVote(msg.id, 'down')}
                        className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${currentVote === 'down' ? 'text-rose-600 font-bold' : ''}`}
                        title="Kurang Membantu"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Yellow Official Disclaimer Box */}
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                    <strong>Penting:</strong> Jawaban disusun otomatis dari dokumen standar pelayanan resmi Mal Pelayanan Publik (MPP) & DPMPTSP Kabupaten Madiun. Untuk keputusan hukum atau kasus administratif pribadi, mohon konfirmasi ke loket pelayanan terkait.
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                    Mohon tidak menuliskan kata sandi, NIK sensitif, atau data rekening pribadi. Percakapan dicatat tanpa nama untuk evaluasi peningkatan pelayanan publik.
                  </p>

                </div>
              );
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-3 text-sm text-slate-500">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>Buku Saku sedang menyiapkan jawaban resmi...</span>
              </div>
            )}

            {/* Related Questions Chips */}
            {latestAssistantMessage?.relatedQuestions && latestAssistantMessage.relatedQuestions.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Mungkin ini yang ingin Anda tanyakan selanjutnya:
                </div>
                <div className="flex flex-wrap gap-2">
                  {latestAssistantMessage.relatedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendFollowup(q)}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 shadow-sm transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up input form */}
            <form onSubmit={handleFollowupSubmit} className="pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={followupText}
                  onChange={(e) => setFollowupText(e.target.value)}
                  placeholder="Ketik pertanyaan lanjutan Anda di sini..."
                  className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-600 shadow-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !followupText.trim()}
                  className="px-5 py-3 rounded-xl bg-madiun-forest hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>Kirim</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>

          {/* Right Column: Helpdesk & Escalation Sidebar (Mimicking AIDA sidebar) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-display">
                  Belum Terbantu?
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Hubungi Loket MPP Langsung
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Untuk konsultasi kasus khusus, verifikasi berkas bermasalah, atau percepatan NIB:
                </p>
              </div>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${WA_NUM_MPP}?text=${encodeURIComponent(`Halo Mal Pelayanan Publik (MPP) Kabupaten Madiun, saya butuh informasi perizinan terkait: ${currentQuery}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp 0851-1740-5460</span>
              </a>

              {/* Direct Phone */}
              <a
                href={`tel:${TELP_MPP}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Telepon: {TELP_MPP}</span>
              </a>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs text-slate-500">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Jam Layanan Loket:</span><br />
                    Senin – Jumat, 08.00 – 15.00 WIB
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Lokasi Gedung MPP:</span><br />
                    1. <strong>MPP Caruban:</strong> Jl. Alun-Alun Timur No.3 Caruban<br />
                    2. <strong>MPP Counter:</strong> Jl. Alun-Alun Utara No.4 Kota Madiun
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Links Card */}
            <div className="bg-emerald-50/70 dark:bg-slate-900/60 rounded-2xl border border-emerald-100 dark:border-slate-800 p-4 space-y-2 text-xs">
              <div className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tautan Terintegrasi:</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-slate-600 dark:text-slate-400">
                <li>• <a href="https://oss.go.id" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline">Sistem OSS RBA (NIB Berusaha)</a></li>
                <li>• <a href="https://coretaxdjp.pajak.go.id" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline">Coretax DJP (NPWP Online)</a></li>
                <li>• <a href="https://e-sertifikasi.pom.go.id" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline">e-Sertifikasi BPOM (CPPOB/CPKB)</a></li>
                <li>• <a href="https://mpaspor.imigrasi.go.id" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline">M-Paspor Ditjen Imigrasi</a></li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
