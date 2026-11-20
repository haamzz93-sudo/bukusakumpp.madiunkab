import { ChatMessage, RAGResponse, SourceItem } from '../types/perizinan';
import { getApiBaseUrl } from './apiConfig';

export const WA_NUM_MPP = '628113778776'; // WhatsApp Resmi Layanan Perizinan MPP Kabupaten Madiun (Buku Saku Hal. 254)
export const TELP_MPP = '(0351) 497206';

/**
 * Pure Real AI & RAG Engine
 * Strictly queries the live backend API (/api/chat) backed by Google Gemini LLM
 * and 254-page official Buku Saku MPP knowledge base.
 * Local dummy/mock fallback is completely deactivated per user instruction.
 */
export async function askHybridAi(
  query: string,
  conversationHistory: ChatMessage[] = []
): Promise<RAGResponse> {
  const cleanQ = query.trim().toLowerCase();

  // 1. Guardrail Client-Side Filter for Model/Vendor Identity Masking
  const isModelQuery = /model|llm|gpt|gemini|claude|llama|openai|deepseek|mistral|ai apa|vendor|arsitektur|system prompt|siapa pembuat/i.test(cleanQ);
  if (isModelQuery) {
    return {
      ok: true,
      layer: 'guardrail',
      via: 'ai',
      answer: `Saya tidak dapat menyampaikan informasi mengenai model maupun penyedia AI yang digunakan.

Saya adalah **Buku Saku**, asisten digital resmi Mal Pelayanan Publik (MPP) Pemerintah Kabupaten Madiun. Tugas utama saya adalah memberikan panduan syarat, alur, dan ketentuan perizinan serta layanan publik di lingkungan Kabupaten Madiun berdasarkan dokumen standar pelayanan resmi.

Silakan sampaikan pertanyaan Anda seputar perizinan usaha (OSS), BPHTB, PBB-P2, SKCK, Paspor, atau administrasi kependudukan lainnya.`,
      source_items: [],
      related: [
        'Apa saja perizinan usaha yang bisa diurus di MPP Madiun?',
        'Bagaimana syarat membuat NIB OSS untuk warung kopi?',
        'Berapa jam layanan di Gedung Mal Pelayanan Publik Kabupaten Madiun?'
      ],
      needs_human: false
    };
  }

  // 2. Hubungi Backend PHP API (Real Gemini LLM + RAG 254 Halaman)
  const baseUrl = getApiBaseUrl();
  const endpoints = baseUrl ? [`${baseUrl}/api/chat`, '/api/chat'] : ['/api/chat'];
  
  let lastError: string | null = null;

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout for live LLM + Voicebox GPU TTS inference

      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          history: conversationHistory.slice(-4).map(m => ({ role: m.role, text: m.text }))
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.ok) {
          return data as RAGResponse;
        } else if (data && data.error) {
          lastError = data.error;
        }
      } else {
        lastError = `Server HTTP error: ${apiRes.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Gagal menghubungi server';
    }
  }

  // 3. Jika backend gagal, tampilkan pesan kesalahan jujur (NO DUMMY / NO FAKE DATA)
  return {
    ok: false,
    layer: 'error',
    via: 'offline',
    answer: `Mohon maaf, sistem AI Gemini & RAG Backend sedang memproses data atau terjadi kendala koneksi ke server (${lastError || 'Timeout'}).

Silakan:
1. Klik tombol **Tanya** kembali untuk mencoba ulang pencarian Anda.
2. Jika masih berkendala, pastikan API Key Gemini di Pengaturan Admin telah aktif atau hubungi Helpdesk Layanan Mal Pelayanan Publik (MPP) Kabupaten Madiun via WhatsApp di **0811-3778-776**.`,
    source_items: [
      {
        name: 'Helpdesk Layanan Terpadu Mal Pelayanan Publik Kabupaten Madiun',
        instansi: 'DPMPTSP Kab. Madiun',
        waktu: 'Senin - Jumat (08.00 - 15.00 WIB)',
        portal: 'https://dpmptsp.id'
      }
    ],
    related: [
      'Berapa jam operasional loket di MPP Kabupaten Madiun?',
      'Bagaimana syarat membuat NIB OSS untuk warung kopi?',
      'Apa saja dokumen untuk permohonan BPHTB waris mandiri?'
    ],
    needs_human: true
  };
}

/**
 * Send voice note (audio blob) to backend /api/voice-chat
 * Real-time Speech-to-Text via Gemini Multimodal + RAG Search + Neural TTS (Spider-Man AI Style)
 */
export async function sendVoiceNoteAi(audioBlob: Blob): Promise<RAGResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoints = baseUrl ? [`${baseUrl}/api/voice-chat`, '/api/voice-chat'] : ['/api/voice-chat'];

  let lastError: string | null = null;

  for (const endpoint of endpoints) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for speech inference

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          return data as RAGResponse;
        } else if (data && data.error) {
          lastError = data.error;
        }
      } else {
        const errorJson = await res.json().catch(() => null);
        lastError = errorJson?.error || `HTTP error: ${res.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Gagal mengirim rekaman suara ke server';
    }
  }

  return {
    ok: false,
    layer: 'error',
    via: 'voice-error',
    answer: `Mohon maaf, rekaman suara Anda tidak dapat diproses (${lastError || 'Kendala jaringan/mikrofon'}).\n\nSilakan coba rekam ulang lebih dekat ke mikrofon, atau ketikkan pertanyaan Anda di kolom pencarian.`,
    source_items: [],
    related: [
      'Syarat izin buka warung kopi',
      'Pengajuan BPHTB waris mandiri',
      'Jam buka layanan MPP Madiun'
    ],
    needs_human: true
  };
}

/**
 * Request on-demand TTS audio synthesis from backend /api/tts
 */
export async function fetchTtsAudio(text: string, voice = 'id-ID-ArdiNeural'): Promise<string | null> {
  const baseUrl = getApiBaseUrl();
  const endpoints = baseUrl ? [`${baseUrl}/api/tts`, '/api/tts'] : ['/api/tts'];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text, voice })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && data.audioUrl) {
          // Normalize URL with baseUrl if relative
          if (baseUrl && data.audioUrl.startsWith('/api/')) {
            return `${baseUrl}${data.audioUrl}`;
          }
          return data.audioUrl;
        }
      }
    } catch {
      // Continue to next endpoint or return null
    }
  }

  return null;
}


