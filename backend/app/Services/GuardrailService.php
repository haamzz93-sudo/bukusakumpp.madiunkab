<?php

namespace App\Services;

class GuardrailService
{
    /**
     * Memeriksa sapaan dasar warga (halo, hai, assalamualaikum, selamat pagi, dll)
     */
    public function checkGreeting(string $query): ?array
    {
        $clean = mb_strtolower(trim($query));
        $pattern = '/^(halo|hai|hi|hey|halo\s*buku\s*saku|halo\s*pak|halo\s*bupati|halo\s*admin|halo\s*mpp|selamat\s*(pagi|siang|sore|malam)|assalamu\s*[\'a-z]*|pagi|siang|sore|malam)[\s\!\?\.]*$/iu';

        if (preg_match($pattern, $clean) || in_array($clean, ['halo', 'hai', 'hi', 'hey', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'tes', 'ping'])) {
            return [
                'ok' => true,
                'layer' => 'greeting',
                'via' => 'direct',
                'answer' => "Halo! Selamat datang di layanan digital **Buku Saku AI**, asisten resmi Mal Pelayanan Publik (MPP) Kabupaten Madiun.\n\nSaya siap membantu Anda memperoleh informasi standar pelayanan resmi, persyaratan berkas, alur perizinan berusaha OSS, administrasi kependudukan, perpajakan daerah, hingga layanan kepolisian dan instansi vertikal lainnya di Kabupaten Madiun.\n\nSilakan ketik layanan yang ingin Anda tanyakan, seperti:\n* *\"Syarat perizinan warung kopi (KBLI 56303)\"*\n* *\"Prosedur pembuatan SKCK baru\"*\n* *\"Jadwal dan jam operasional pelayanan MPP\"*\n* *\"Syarat pengajuan BPHTB waris\"*\n\nAda yang dapat kami bantu untuk mempermudah urusan pelayanan publik Anda hari ini?",
                'spoken_briefing' => "Halo Bapak dan Ibu warga Kabupaten Madiun. Selamat datang di layanan digital Buku Saku Mal Pelayanan Publik Kabupaten Madiun. Silakan sampaikan perizinan atau layanan publik yang Anda butuhkan, kami siap melayani dengan sepenuh hati. Terima kasih.",
                'audio_cache_key' => 'greeting_official',
                'source_items' => [
                    [
                        'name' => 'Standar Pelayanan Terpadu Satu Pintu',
                        'instansi' => 'DPMPTSP & MPP Kabupaten Madiun',
                        'waktu' => 'Senin - Jumat (08.00 - 15.00 WIB)',
                        'portal' => 'https://dpmptsp.id'
                    ]
                ],
                'related' => [
                    'Bagaimana syarat membuat NIB OSS untuk warung kopi?',
                    'Berapa jam operasional loket di Gedung MPP Kabupaten Madiun?',
                    'Apa saja syarat penerbitan SKCK baru di MPP Madiun?'
                ],
                'needs_human' => false
            ];
        }

        return null;
    }

    /**
     * Memeriksa pertanyaan seputar jadwal, hari, dan jam operasional MPP
     */
    public function checkScheduleInquiry(string $query): ?array
    {
        $clean = mb_strtolower(trim($query));
        
        // Exact and flexible intent pattern for schedule & operating hours
        $isSchedule = preg_match('/\b(jadwal|jam buka|jam operasional|jam kerja|tanya jadwal|hari apa buka|buka jam berapa|jam berapa buka|tutup jam berapa|jam berapa tutup|kapan buka|jam layanan|operasional mpp|jadwal mpp|buka hari apa|hari apa saja buka|waktu pelayanan|jam kantor|loket buka|jam pelayanan)\b/iu', $clean)
            || (preg_match('/\b(jam|jadwal|hari|waktu)\b/iu', $clean) && preg_match('/\b(buka|tutup|operasional|kerja|layanan|pelayanan|mpp)\b/iu', $clean) && !preg_match('/\b(warung|kopi|skck|bphtb|pbb|ktp|paspor|nib|oss)\b/iu', $clean));

        if ($isSchedule) {
            return [
                'ok' => true,
                'layer' => 'schedule',
                'via' => 'direct',
                'answer' => "Berikut adalah **Standar Jadwal dan Jam Operasional Pelayanan** di Mal Pelayanan Publik (MPP) Kabupaten Madiun:\n\n* **Hari Pelayanan:** Senin s/d Jumat\n* **Jam Operasional:** Pukul 08.00 – 15.00 WIB\n* **Hari Libur:** Sabtu, Minggu, dan Hari Libur Nasional **TUTUP**\n* **Lokasi Gedung MPP:** Jl. Aloon-Aloon Utara No. 4, Pangongangan, Kec. Manguharjo, Kota Madiun\n\nSeluruh loket perizinan terpadu DPMPTSP (OSS-RBA), administrasi kependudukan Disdukcapil, perpajakan daerah Bapenda, loket kepolisian Polres Madiun, hingga instansi vertikal lainnya siap melayani Anda sesuai jam kerja resmi di atas.\n\nApakah ada berkas persyaratan layanan tertentu yang ingin Anda persiapkan sebelum berkunjung ke MPP?",
                'spoken_briefing' => "Halo Bapak dan Ibu warga Kabupaten Madiun. Mal Pelayanan Publik Kabupaten Madiun melayani warga setiap hari Senin sampai Jumat mulai pukul delapan pagi hingga tiga sore Waktu Indonesia Barat. Hari Sabtu, Minggu, dan hari libur nasional tutup. Gedung MPP berlokasi di Jalan Aloon-Aloon Utara Nomor empat Madiun. Terima kasih.",
                'audio_cache_key' => 'schedule_official',
                'source_items' => [
                    [
                        'name' => 'Standar Operasional Jam Layanan MPP',
                        'instansi' => 'Pemerintah Kabupaten Madiun - DPMPTSP',
                        'waktu' => 'Senin s/d Jumat: 08.00 - 15.00 WIB',
                        'portal' => 'https://dpmptsp.id'
                    ]
                ],
                'related' => [
                    'Apakah pengurusan izin di MPP dapat diwakilkan dengan surat kuasa?',
                    'Bagaimana alur pendaftaran antrean atau loket di MPP Madiun?',
                    'Apa saja layanan instansi yang tersedia di Gedung MPP Madiun?'
                ],
                'needs_human' => false
            ];
        }

        return null;
    }

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
