import { ChatMessage, RAGResponse, SourceItem } from '../types/perizinan';
import { PERIZINAN_MADIUN_ITEMS } from '../data/perizinanMadiunData';
import { getApiBaseUrl } from './apiConfig';

export const WA_NUM_MPP = '628113778776'; // WhatsApp Resmi Layanan Perizinan MPP Kabupaten Madiun (Buku Saku Hal. 254)
export const TELP_MPP = '(0351) 497206';

export async function askHybridAi(
  query: string,
  conversationHistory: ChatMessage[] = []
): Promise<RAGResponse> {
  const cleanQ = query.trim().toLowerCase();

  // 1. Coba hubungi Backend PHP API terlebih dahulu (LLM Gemini + RAG 254 Hlm)
  const baseUrl = getApiBaseUrl();
  const endpoints = baseUrl ? [`${baseUrl}/api/chat`, '/api/chat'] : ['/api/chat'];
  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for live LLM inference

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
        }
      }
    } catch (e) {
      // Endpoint network issue, continue to next endpoint or local fallback
    }
  }

  // ==========================================
  // 2. CLIENT-SIDE HYBRID 3-LAYER ENGINE
  // ==========================================

  // --- LAYER 0: GUARDRAILS ---
  // A. Guardrail Model Identity Masking (Instruksi Pak Darmawan)
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

  // B. Guardrail Out-of-Domain Filter
  const isOutDomain = /resep|masak|puisi|cerpen|lelucon|lawak|chord|lirik|game|presiden amerika|ramalan|zodiak|coding python/i.test(cleanQ);
  if (isOutDomain && !cleanQ.includes('izin') && !cleanQ.includes('madiun') && !cleanQ.includes('usaha')) {
    return {
      ok: true,
      layer: 'guardrail',
      via: 'ai',
      answer: `Mohon maaf, pertanyaan tersebut di luar ruang lingkup layanan perizinan dan standar pelayanan publik Mal Pelayanan Publik (MPP) Kabupaten Madiun.

Saya hanya dapat membantu informasi resmi seputar:
1. **Perizinan Berusaha (OSS RBA & PB UMKU):** NIB, SPP-IRT, IP-CPPOB, Kosmetika, dll.
2. **Perpajakan Daerah (Bapenda):** BPHTB Jual Beli/Waris, PBB-P2, NPWPD.
3. **Administrasi Kependudukan (Disdukcapil):** KTP-el, KIA, KK, Akta Lahir/Mati, IKD.
4. **Kepolisian & Hukum:** SKCK, Tilang, Barang Bukti, Akta Cerai, Surat Bebas Pidana.
5. **Layanan Instansi Terpadu:** Paspor Imigrasi, Pendaftaran Haji Kemenag, BPJS, Taspen.

Silakan sampaikan pertanyaan Anda yang berkaitan dengan layanan di atas.`,
      source_items: [],
      related: [
        'Bagaimana syarat membuat SKCK baru?',
        'Apa syarat pengajuan BPHTB waris mandiri?',
        'Bagaimana cara aktivasi IKD di ponsel?'
      ],
      needs_human: false
    };
  }

  // --- LAYER 1 & 2: KNOWLEDGE BASE SEARCH (WARUNG KOPI, UMKM, & 82 PERIZINAN) ---
  
  // A. Kasus Spesifik: Warung Kopi / Kedai Kopi / Restoran (Contoh Pak Darmawan)
  if (cleanQ.includes('warung kopi') || cleanQ.includes('warkop') || cleanQ.includes('kedai kopi') || cleanQ.includes('buka kafe') || cleanQ.includes('usaha kopi')) {
    const item = PERIZINAN_MADIUN_ITEMS.find(p => p.id === 101)!;
    return {
      ok: true,
      layer: 'docrag',
      via: 'docrag',
      answer: `Untuk membuka **Warung Kopi, Kedai Minuman, atau Kafe Skala Mikro/Kecil** di Kabupaten Madiun, prosesnya sangat mudah dan **100% Gratis (Rp0)** melalui sistem Online Single Submission (OSS RBA):

### 1. Klasifikasi Usaha (KBLI)
* **KBLI Utama:** **56303** (*Penyediaan Minuman / Kedai Kopi / Rumah Minum*).
* **Tingkat Risiko:** **Rendah (R)**.
* **Legalitas Utama:** Cukup memiliki **Nomor Induk Berusaha (NIB)** yang otomatis berlaku sebagai legalitas operasional dan izin edar di tempat.

### 2. Dokumen Persyaratan
* **KTP Pemilik Usaha** (Warga Madiun atau luar daerah).
* **NPWP Pribadi Pemilik**.
* **Nomor HP (WhatsApp) dan Email aktif**.
* **Alamat lokasi usaha** yang jelas di wilayah Kabupaten Madiun.
* Titik koordinat lokasi warung kopi.

### 3. Alur Pengurusan Izin
1. **Pendaftaran Mandiri:** Akses laman resmi **oss.go.id**, login menggunakan NIK, lalu masukkan data usaha dengan KBLI 56303.
2. **Pendaftaran di MPP:** Anda juga bisa datang langsung ke **Meja Layanan Berbantuan DPMPTSP di Gedung Mal Pelayanan Publik (MPP) Kabupaten Madiun** (Jl. Aloon-Aloon Utara No. 4, Pangongangan, Madiun). Petugas akan membantu proses pembuatan NIB sampai cetak fisik di tempat tanpa antre lama.
3. **Pernyataan Mandiri:** Sistem akan meminta persetujuan pernyataan mandiri K3 dan SPPL (tata lingkungan) secara digital.
4. **NIB Terbit Seketika:** Dokumen NIB berformat PDF bertanda tangan elektronik langsung terbit hari itu juga (0 menit).

### 4. Catatan Tambahan (Jika Menjual Kopi Kemasan Sendiri)
Jika warung kopi Anda juga mengemas kopi bubuk atau biji kopi dengan merek sendiri untuk dijual ke luar toko, Anda disarankan melengkapi izin **SPP-IRT** (Sertifikat Produksi Pangan Industri Rumah Tangga) yang difasilitasi melalui Dinas Kesehatan Kabupaten Madiun di loket MPP.`,
      source_items: [
        {
          name: 'Standar Pelayanan Izin Berusaha KBLI 56303 (Kedai Kopi / Minuman)',
          instansi: 'DPMPTSP Kabupaten Madiun / OSS BKPM RI',
          waktu: 'Langsung Terbit (0 Menit)',
          portal: 'https://oss.go.id'
        },
        {
          name: 'Buku Saku MPP Kabupaten Madiun — Panduan Perizinan Berusaha',
          instansi: 'Pemerintah Kabupaten Madiun',
          waktu: 'Layanan Setiap Hari Kerja'
        }
      ],
      related: [
        'Apakah mengurus NIB di MPP Kabupaten Madiun dipungut biaya?',
        'Bagaimana cara mengurus SPP-IRT untuk kopi bubuk kemasan?',
        'Apa saja KBLI untuk usaha warung makan dan kuliner?'
      ],
      needs_human: false
    };
  }

  // B. Pencocokan ke Item Data Lainnya
  let bestMatch = PERIZINAN_MADIUN_ITEMS.find(item => {
    return item.keywords.some(k => cleanQ.includes(k.toLowerCase())) ||
           cleanQ.includes(item.title.toLowerCase()) ||
           cleanQ.includes(item.slug.replace(/-/g, ' '));
  });

  if (bestMatch) {
    const pers = bestMatch.persyaratan;
    const reqList: string[] = [];
    if (pers.administratif?.length) {
      reqList.push('**Persyaratan Administratif:**\n' + pers.administratif.map(s => `- ${s}`).join('\n'));
    }
    if (pers.teknis?.length) {
      reqList.push('**Persyaratan Teknis:**\n' + pers.teknis.map(s => `- ${s}`).join('\n'));
    }
    if (pers.umum?.length) {
      reqList.push('**Persyaratan Umum:**\n' + pers.umum.map(s => `- ${s}`).join('\n'));
    }

    const alurList = bestMatch.mekanismeProsedur.map((m, idx) => `${idx + 1}. ${m}`).join('\n');

    return {
      ok: true,
      layer: 'docrag',
      via: 'docrag',
      answer: `Berikut rincian standar pelayanan resmi untuk **${bestMatch.title}** di Mal Pelayanan Publik (MPP) Kabupaten Madiun:

* **Instansi Pelaksana:** ${bestMatch.instansi}
* **Estimasi Waktu Pelayanan:** ${bestMatch.waktuPelayanan}
* **Biaya Retribusi:** ${bestMatch.biaya}
* **Jenis Layanan:** ${bestMatch.jenisPerizinan}

---

### Dokumen Persyaratan
${reqList.join('\n\n')}

---

### Sistem, Mekanisme & Prosedur
${alurList}

${bestMatch.portalUrl ? `\n> Layanan ini dapat diakses secara daring melalui portal resmi: [${bestMatch.portalUrl}](${bestMatch.portalUrl})` : ''}`,
      source_items: [
        {
          name: bestMatch.title,
          instansi: bestMatch.instansi,
          waktu: bestMatch.waktuPelayanan,
          portal: bestMatch.portalUrl
        }
      ],
      related: [
        'Berapa jam operasional loket di MPP Kabupaten Madiun?',
        'Apakah pengurusan izin ini bisa diwakilkan dengan surat kuasa?',
        'Ke mana harus menghubungi jika berkas saya mengalami kendala?'
      ],
      needs_human: false
    };
  }

  // --- LAYER 3: GENERAL AI ASSISTANCE WITH HUMAN ESCALATION ---
  const isPersonalCase = cleanQ.includes('punya saya') || cleanQ.includes('tagihan saya') || cleanQ.includes('kenapa belum') || cleanQ.includes('status berkas') || cleanQ.includes('sudah bayar tapi');

  return {
    ok: true,
    layer: 'ai',
    via: 'ai',
    answer: `Terima kasih atas pertanyaan Anda. Untuk informasi terkait **"${query}"** di lingkungan Mal Pelayanan Publik (MPP) Kabupaten Madiun:

1. **Prinsip Pelayanan:** Seluruh proses perizinan dasar di MPP Kabupaten Madiun (seperti NIB OSS, Adminduk KTP/KK, dan PBB) dilayani secara **transparan, cepat, dan bebas pungutan liar**.
2. **Pelayanan Berbantuan:** Jika Anda mengalami kesulitan dalam menentukan KBLI usaha atau mengisi dokumen online, MPP Kabupaten Madiun menyediakan **Fasilitator Berbantuan** di loket MPP yang siap memandu secara langsung.
3. **Dokumen Dasar yang Disiapkan:** Pastikan Anda selalu menyiapkan KTP-el, Kartu Keluarga, NPWP, dan berkas kepemilikan/surat keterangan dari desa sebelum mengajukan perizinan.

${isPersonalCase ? '\n> [!NOTE]\n> Karena pertanyaan Anda berkaitan dengan pengecekan data spesifik perorangan, kami sarankan untuk berkonsultasi langsung dengan petugas loket resmi MPP melalui tautan WhatsApp di bawah.' : ''}`,
    source_items: [
      {
        name: 'Standar Pelayanan Terpadu Mal Pelayanan Publik Kabupaten Madiun',
        instansi: 'DPMPTSP Kabupaten Madiun',
        waktu: 'Senin - Jumat, 08.00 - 15.00 WIB'
      }
    ],
    related: [
      'Apa syarat izin buka warung kopi atau kedai makanan?',
      'Bagaimana cara pengajuan BPHTB waris secara mandiri?',
      'Apa saja dokumen untuk membuat SKCK baru di MPP?'
    ],
    needs_human: isPersonalCase
  };
}
