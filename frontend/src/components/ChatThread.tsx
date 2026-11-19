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
  Cpu,
  Type,
  CheckCircle2,
  Volume2,
  Loader2
} from 'lucide-react';
import { ChatMessage } from '../types/perizinan';
import { WA_NUM_MPP, TELP_MPP, fetchTtsAudio } from '../services/hybridAiService';
import { WhatsAppIcon } from './WhatsAppIcon';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';

interface ChatThreadProps {
  messages: ChatMessage[];
  currentQuery: string;
  isLoading: boolean;
  onSendFollowup: (query: string, isFollowup?: boolean) => void;
  onSendVoiceFollowup?: (audioBlob: Blob, durationSeconds: number, isFollowup?: boolean) => void;
  onBackToHome: () => void;
}

const renderInlineMarkdown = (str: string): React.ReactNode => {
  if (!str) return null;
  const clean = str.replace(/\\\*/g, '*');

  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(clean)) !== null) {
    if (match.index > lastIndex) {
      parts.push(clean.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-slate-950 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-800 dark:text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-400 font-semibold underline underline-offset-2 hover:text-emerald-600"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < clean.length) {
    parts.push(clean.substring(lastIndex));
  }

  return parts;
};

const FormattedMessageContent: React.FC<{ text: string; isSerif: boolean }> = ({ text, isSerif }) => {
  // Normalize run-together lists: "Title 1. Step A 2. Step B" or "* Item A * Item B"
  const normalized = text
    .replace(/(\s+)(\d+\.\s+)/g, '\n$2')
    .replace(/(\s+)([\*\-•]\s+)/g, '\n$2')
    .replace(/\s*---\s*/g, '\n---\n');

  const rawLines = normalized.split('\n');

  return (
    <div className={`space-y-2.5 ${isSerif ? "font-['Times_New_Roman',Times,Georgia,serif] text-[15.5px] sm:text-[16.5px] leading-[1.8] text-slate-900 dark:text-slate-100" : "font-sans text-sm sm:text-[15px] leading-relaxed text-slate-800 dark:text-slate-200"}`}>
      {rawLines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return null;

        // Horizontal divider
        if (line === '---' || line === '***' || line === '___') {
          return <hr key={idx} className="my-3.5 border-slate-200 dark:border-slate-800" />;
        }

        // Section Headers: ### Header, ## Header, or # Header
        if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
          const cleanHead = line.replace(/^#+\s*/, '');
          return (
            <div key={idx} className="pt-2.5 pb-1">
              <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white border-l-4 border-emerald-600 dark:border-emerald-400 pl-3 py-0.5">
                {renderInlineMarkdown(cleanHead)}
              </h4>
            </div>
          );
        }

        // Section header like **A. Judul** or **1. Layanan...** on a single line
        const sectionMatch = line.match(/^\*\*([A-Z0-9\.\s\-–\(\)]{2,80})\*\*:?$/i);
        if (sectionMatch && !line.toLowerCase().includes('catatan')) {
          const titleText = sectionMatch[1];
          return (
            <div key={idx} className="pt-3 pb-1 border-b border-emerald-600/20 dark:border-emerald-500/20 mb-1">
              <h4 className="text-base sm:text-[17px] font-bold text-emerald-900 dark:text-emerald-300">
                {renderInlineMarkdown(titleText)}
              </h4>
            </div>
          );
        }

        // Numbered list item: 1. Item
        const numMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const content = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono text-sm shrink-0 min-w-[20px] text-right mt-0.5">
                {num}.
              </span>
              <div className="flex-1">
                {renderInlineMarkdown(content)}
              </div>
            </div>
          );
        }

        // Bullet point: * Item, - Item, • Item
        const bulletMatch = line.match(/^[\*\-•]\s+(.*)/);
        if (bulletMatch) {
          const content = bulletMatch[1];
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 mt-2.5" />
              <div className="flex-1">
                {renderInlineMarkdown(content)}
              </div>
            </div>
          );
        }

        // Note or Important highlight box (e.g. *(Catatan: ...)* or (Catatan: ...))
        if (line.toLowerCase().includes('catatan:') || line.startsWith('>') || line.toLowerCase().includes('penting:')) {
          const cleanNote = line.replace(/^[\*\(\>]\s*|\s*[\*\)]$/g, '');
          return (
            <div key={idx} className="p-3 my-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
              {renderInlineMarkdown(cleanNote)}
            </div>
          );
        }

        // Regular paragraph text
        return (
          <p key={idx} className="my-1.5">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
};

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  currentQuery,
  isLoading,
  onSendFollowup,
  onSendVoiceFollowup,
  onBackToHome
}) => {
  const [useTimesNewRoman, setUseTimesNewRoman] = useState(true);
  const [headerSearchText, setHeaderSearchText] = useState('');
  const [bottomFollowupText, setBottomFollowupText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openSources, setOpenSources] = useState<{ [key: string]: boolean }>({});
  const [votes, setVotes] = useState<{ [key: string]: 'up' | 'down' }>({});
  const [localAudioUrls, setLocalAudioUrls] = useState<Record<string, string>>({});
  const [loadingSpeech, setLoadingSpeech] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateSpeech = async (msgId: string, text: string) => {
    if (localAudioUrls[msgId] || loadingSpeech[msgId]) return;
    setLoadingSpeech(prev => ({ ...prev, [msgId]: true }));
    try {
      const url = await fetchTtsAudio(text);
      if (url) {
        setLocalAudioUrls(prev => ({ ...prev, [msgId]: url }));
      }
    } finally {
      setLoadingSpeech(prev => ({ ...prev, [msgId]: false }));
    }
  };

  const toggleSource = (msgId: string) => {
    setOpenSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleVote = (msgId: string, type: 'up' | 'down') => {
    setVotes(prev => ({ ...prev, [msgId]: type }));
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchText.trim() && !isLoading) {
      onSendFollowup(headerSearchText.trim(), false);
      setHeaderSearchText('');
    }
  };

  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bottomFollowupText.trim() && !isLoading) {
      onSendFollowup(bottomFollowupText.trim(), false);
      setBottomFollowupText('');
    }
  };

  const latestAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');

  // Auto-generate VoiceAI speech for the latest assistant answer if not pre-generated
  React.useEffect(() => {
    if (
      latestAssistantMessage &&
      !latestAssistantMessage.id.startsWith('tour-') &&
      !latestAssistantMessage.audioUrl &&
      !localAudioUrls[latestAssistantMessage.id] &&
      !loadingSpeech[latestAssistantMessage.id] &&
      latestAssistantMessage.text
    ) {
      handleGenerateSpeech(latestAssistantMessage.id, latestAssistantMessage.text);
    }
  }, [latestAssistantMessage?.id, latestAssistantMessage?.text]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pt-24 sm:pt-28 pb-12 px-4 relative">
      {/* Seamless Top Liquid Glass Backdrop for Navbar */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-emerald-100/50 via-slate-100/20 to-transparent dark:from-emerald-950 dark:via-slate-950/90 dark:to-transparent pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Subheader Toolbar - Sticky under top navbar */}
        <div className="sticky top-16 sm:top-20 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 px-3 sm:px-4 mb-6 border border-slate-200/80 dark:border-emerald-500/20 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-sidebar text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-sm transition-all self-start cursor-pointer hover:scale-[1.02] active:scale-95 border border-slate-200 dark:border-emerald-500/20"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-mpp-bright" />
              <span>Kembali ke Beranda</span>
            </button>

            {/* Active Query Banner */}
            <div className="flex-1 max-w-xl sm:mx-4">
              <form onSubmit={handleHeaderSearchSubmit} className="relative flex items-center gap-1.5">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={headerSearchText}
                    onChange={(e) => setHeaderSearchText(e.target.value)}
                    placeholder="Tanyakan hal lain atau kirim Voice Note..."
                    className="w-full py-2 pl-9 pr-20 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-emerald-500/25 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-mpp-bright shadow-sm"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                  <button
                    type="submit"
                    disabled={!headerSearchText.trim() || isLoading}
                    className="absolute right-1.5 px-3 py-1 bg-mpp-bright hover:bg-mpp-yellow text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Tanya
                  </button>
                </div>
                <VoiceNoteRecorder
                  onSendVoice={(blob, sec) => {
                    if (onSendVoiceFollowup) {
                      onSendVoiceFollowup(blob, sec, false);
                    }
                  }}
                  disabled={isLoading}
                />
              </form>
            </div>
          </div>
        </div>

        {/* Main Grid: Thread on Left, Helpdesk Sidebar on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Chat Conversation Thread */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Buku Saku menjawab: <span className="text-slate-900 dark:text-white font-bold">"{currentQuery}"</span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSourcesOpen = openSources[msg.id];
              const currentVote = votes[msg.id];

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-2xl bg-madiun-forest text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md font-medium text-sm leading-relaxed">
                      {msg.isAudio && msg.audioUrl ? (
                        <div className="space-y-2">
                          <VoiceNotePlayer
                            audioUrl={msg.audioUrl}
                            sender="user"
                            duration={msg.audioDuration}
                          />
                          {msg.text && (
                            <p className="text-xs text-white/90 italic pl-1">{msg.text}</p>
                          )}
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                );
              }

              const audioToPlay = msg.audioUrl || localAudioUrls[msg.id];

              return (
                <div id="tour-chat-result" key={msg.id} className="liquid-glass-sidebar rounded-2xl p-6 space-y-4">
                  
                  {/* Assistant Identity Tag & Typography Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400 font-display">
                        Buku Saku · Panduan Resmi MPP
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Dokumen Standar Pelayanan Resmi</span>
                      </span>
                    </div>
                  </div>

                  {/* Spider-Man / Karen AI Voice Note Player */}
                  {audioToPlay ? (
                    <VoiceNotePlayer
                      audioUrl={audioToPlay}
                      fallbackText={msg.text}
                      sender="assistant"
                      autoPlay={!msg.id.startsWith('tour-') && msg.id === latestAssistantMessage?.id}
                    />
                  ) : (
                    <div className="py-1">
                      <button
                        onClick={() => handleGenerateSpeech(msg.id, msg.text)}
                        disabled={loadingSpeech[msg.id]}
                        type="button"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow-md border border-emerald-500/30 active:scale-95"
                      >
                        {loadingSpeech[msg.id] ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            <span>Menyiapkan VoiceAI Buku Saku...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Putar VoiceAI Buku Saku</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Clean Formatted Message Content (Zero Raw Asterisks, Times New Roman Typo) */}
                  <div className="pt-1">
                    <FormattedMessageContent text={msg.text} isSerif={useTimesNewRoman} />
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
                              {item.portal && item.portal.startsWith('http') && !item.portal.includes('bukusakumpp') && (
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
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Jawaban</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-[11px] text-slate-500 dark:text-slate-400">Membantu?</span>
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

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
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
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Mungkin ini yang ingin Anda tanyakan selanjutnya:
                </div>
                <div className="flex flex-wrap gap-2">
                  {latestAssistantMessage.relatedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendFollowup(q, false)}
                      className="text-left text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/20 text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-50/70 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up input form */}
            <form onSubmit={handleBottomSubmit} className="pt-4">
              <div className="flex items-center gap-2">
                <VoiceNoteRecorder
                  onSendVoice={(blob, sec) => {
                    if (onSendVoiceFollowup) {
                      onSendVoiceFollowup(blob, sec, true);
                    }
                  }}
                  disabled={isLoading}
                />
                <input
                  type="text"
                  value={bottomFollowupText}
                  onChange={(e) => setBottomFollowupText(e.target.value)}
                  placeholder="Ketik pertanyaan lanjutan atau kirim Voice Note..."
                  className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-emerald-500/25 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-mpp-bright shadow-xs"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !bottomFollowupText.trim()}
                  className="px-5 py-3 rounded-xl bg-madiun-forest hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Kirim</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>

          {/* Right Column: Helpdesk & Escalation Sidebar (Mimicking AIDA sidebar) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Helpdesk Card with Clean Sleek Liquid Glass */}
            <div className="rounded-2xl liquid-glass-sidebar p-5 space-y-4 shadow-xl border border-emerald-500/20 text-slate-900 dark:text-white">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-display">
                  Belum Terbantu?
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Hubungi Loket MPP Langsung
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Untuk konsultasi kasus khusus, verifikasi berkas bermasalah, atau percepatan NIB:
                </p>
              </div>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/628113778776?text=${encodeURIComponent(`Halo Mal Pelayanan Publik (MPP) Kabupaten Madiun, saya butuh informasi perizinan terkait: ${currentQuery}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#008060] hover:bg-[#006e52] text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.01]"
              >
                <WhatsAppIcon size={18} className="text-white shrink-0" />
                <span>WhatsApp 0811-3778-776</span>
              </a>

              {/* Direct Phone */}
              <a
                href="tel:0351497206"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-emerald-500/20 font-semibold text-xs transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-mpp-bright" />
                <span>Telepon: (0351) 497206</span>
              </a>

              <div className="border-t border-slate-200 dark:border-emerald-500/20 pt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Jam Layanan Loket:</span><br />
                    Senin – Jumat, 08.00 – 15.00 WIB
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Gedung MPP Kab. Madiun:</span><br />
                    Jl. Aloon-Aloon Utara No. 4, Pangongangan, Kec. Manguharjo, Madiun 63121
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Links Card with Liquid Glass */}
            <div className="liquid-glass-sidebar rounded-2xl p-4 space-y-2 text-xs border border-emerald-500/20 text-slate-900 dark:text-white">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tautan Terintegrasi:</span>
              </div>
              <ul className="space-y-1.5 pl-1 text-slate-600 dark:text-slate-300">
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
