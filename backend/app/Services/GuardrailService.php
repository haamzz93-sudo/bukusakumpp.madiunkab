<?php

namespace App\Services;

class GuardrailService
{
    /**
     * Memeriksa apakah pertanyaan menanyakan model AI / vendor / internal system
     */
    public function checkModelInquiry(string $query): ?array
    {
        $clean = mb_strtolower(trim($query));
        $pattern = '/\b(model|llm|gpt|gemini|claude|llama|openai|deepseek|mistral|ai apa|vendor|arsitektur|system prompt|siapa pembuat)\b/i';

        if (preg_match($pattern, $clean)) {
            return [
                'ok' => true,
                'layer' => 'guardrail',
                'via' => 'ai',
                'answer' => "Saya tidak dapat menyampaikan informasi mengenai model maupun penyedia AI yang digunakan.\n\nSaya adalah **Buku Saku**, asisten digital resmi Mal Pelayanan Publik (MPP) Pemerintah Kabupaten Madiun yang bertugas membantu Anda memperoleh informasi syarat, alur, dan ketentuan perizinan serta layanan publik di Kabupaten Madiun berdasarkan standar pelayanan resmi.\n\nSilakan sampaikan pertanyaan Anda seputar perizinan usaha OSS, BPHTB, PBB-P2, SKCK, Paspor, atau administrasi kependudukan lainnya.",
                'source_items' => [],
                'related' => [
                    'Apa saja jenis perizinan usaha yang dilayani di MPP Madiun?',
                    'Bagaimana syarat membuat NIB OSS untuk warung kopi?',
                    'Berapa jam operasional loket di Gedung MPP Kabupaten Madiun?'
                ],
                'needs_human' => false
            ];
        }

        return null;
    }

    /**
     * Memeriksa apakah pertanyaan di luar ranah perizinan & layanan publik Madiun
     */
    public function checkOutOfDomain(string $query): ?array
    {
        $clean = mb_strtolower(trim($query));
        $pattern = '/\b(resep|masak|puisi|cerpen|lelucon|lawak|chord|lirik|game|presiden amerika|ramalan|zodiak|coding python)\b/i';

        $hasServiceKeywords = preg_match('/\b(izin|madiun|usaha|syarat|dokumen|biaya|loket|layanan|mpp)\b/i', $clean);

        if (preg_match($pattern, $clean) && !$hasServiceKeywords) {
            return [
                'ok' => true,
                'layer' => 'guardrail',
                'via' => 'ai',
                'answer' => "Mohon maaf, pertanyaan tersebut di luar ruang lingkup layanan perizinan dan standar pelayanan Mal Pelayanan Publik (MPP) Kabupaten Madiun.\n\nSaya hanya melayani pertanyaan seputar:\n1. **Perizinan Berusaha (OSS RBA & PB UMKU):** NIB, SPP-IRT, IP-CPPOB, Kosmetika.\n2. **Pajak Daerah (Bapenda):** BPHTB Jual Beli/Waris, PBB-P2, NPWPD.\n3. **Administrasi Kependudukan (Disdukcapil):** KTP-el, KIA, KK, Akta Lahir/Mati, IKD.\n4. **Kepolisian & Hukum:** SKCK, Tilang, Barang Bukti, Akta Cerai, Surat Bebas Pidana.\n5. **Layanan Instansi Terpadu:** Paspor Imigrasi, Pendaftaran Haji Kemenag, BPJS, Taspen.\n\nSilakan sampaikan pertanyaan Anda seputar layanan di atas.",
                'source_items' => [],
                'related' => [
                    'Bagaimana syarat membuat SKCK baru?',
                    'Apa syarat pengajuan BPHTB waris mandiri?',
                    'Bagaimana cara aktivasi IKD di ponsel?'
                ],
                'needs_human' => false
            ];
        }

        return null;
    }
}
