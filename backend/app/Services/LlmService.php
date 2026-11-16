<?php

namespace App\Services;

class LlmService
{
    private string $apiKey;
    private string $model;
    private string $fallbackModel;
    private float $temperature = 0.2;
    private ?string $customSystemPrompt = null;

    public function __construct()
    {
        $this->apiKey = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? '');
        $this->model = getenv('GEMINI_MODEL') ?: ($_ENV['GEMINI_MODEL'] ?? 'gemini-3.1-flash-lite');
        $this->fallbackModel = getenv('GEMINI_FALLBACK_MODEL') ?: ($_ENV['GEMINI_FALLBACK_MODEL'] ?? 'gemini-flash-lite-latest');

        $settingsFile = __DIR__ . '/../../storage/settings.json';
        if (file_exists($settingsFile)) {
            $settings = json_decode(file_get_contents($settingsFile), true) ?? [];
            if (!empty($settings['geminiModel'])) {
                $this->model = $settings['geminiModel'];
            }
            if (isset($settings['temperature']) && is_numeric($settings['temperature'])) {
                $this->temperature = (float)$settings['temperature'];
            }
            if (!empty($settings['systemPrompt'])) {
                $this->customSystemPrompt = $settings['systemPrompt'];
            }
        }
    }

    /**
     * Generate answer using Gemini LLM with context from PDF RAG
     */
    public function generateAnswer(string $query, array $contextChunks, array $history = []): ?string
    {
        if (empty($this->apiKey)) {
            return null;
        }

        // Build context block from top 2 retrieved pages (optimized for fast LLM inference)
        $contextText = "";
        $topChunks = array_slice($contextChunks, 0, 2);
        foreach ($topChunks as $idx => $chunk) {
            $contextText .= "--- DOKUMEN RUJUKAN RESMI " . ($idx + 1) . " (Buku Saku MPP 2026 - Halaman {$chunk['page']} | Instansi: {$chunk['agency']}) ---\n";
            $contextText .= "Judul/Layanan: {$chunk['title']}\n";
            $contextText .= "Isi Standar Pelayanan:\n" . substr($chunk['content'], 0, 800) . "\n\n";
        }

        $basePrompt = !empty($this->customSystemPrompt) 
            ? $this->customSystemPrompt 
            : ("Anda adalah BUKU SAKU, asisten digital resmi Mal Pelayanan Publik (MPP) Pemerintah Kabupaten Madiun.\n"
            . "Tugas Anda: Memberikan informasi perizinan, persyaratan administratif/teknis, sistem mekanisme alur pengurusan, biaya/retribusi, dan jangka waktu pelayanan secara akurat, lugas, santun, dan mudah dipahami masyarakat.\n\n"
            . "ATURAN UTAMA (WAJIB DITAATI):\n"
            . "1. Gunakan informasi faktual dari DOKUMEN RUJUKAN RESMI Buku Saku MPP 2026 yang diberikan di bawah ini.\n"
            . "2. ATURAN FORMAT PENULISAN (SANGAT PENTING):\n"
            . "   - Format jawaban dengan rapi, berjarak, dan terstruktur.\n"
            . "   - SELALU letakkan setiap poin nomor (1., 2., 3., dst.) dan poin peluru (- atau *) pada BARIS BARU TERSENDIRI. DILARANG KERAS menggabungkan beberapa nomor dalam satu baris kalimat bersambung.\n"
            . "   - Gunakan judul tebal yang jelas (misal: **A. Persyaratan**, **B. Alur Prosedur**, **C. Waktu & Biaya**) dengan jeda baris.\n"
            . "3. Sebutkan instansi pelaksana resmi (misal: DPMPTSP, Disnaker, Bapenda, Kantor Pertanahan, Disdukcapil, dll.) dan nomor halaman dokumen rujukan.\n"
            . "4. Jika informasi biaya tidak disebutkan atau gratis, tegaskan 'Biaya: Rp0 (Gratis) / Sesuai Ketentuan Retribusi Resmi'.\n"
            . "5. PENTING SOAL IDENTITAS: Jika ditanya mengenai identitas AI, vendor, LLM, atau teknologi (seperti GPT, Gemini, Claude, Llama, OpenAI, Google AI), JANGAN PERNAH mengaku atau menyebut nama-nama tersebut. Tegaskan bahwa Anda adalah BUKU SAKU AI Resmi Mal Pelayanan Publik Pemerintah Kabupaten Madiun.\n");

        $operationalFacts = "\n\nINFORMASI RESMI MAL PELAYANAN PUBLIK (MPP) KABUPATEN MADIUN (Buku Saku Hal. 254 & Google Maps Verified):\n"
            . "- Gedung Mal Pelayanan Publik (MPP) Kabupaten Madiun CUMA SATU: Jl. Aloon-Aloon Utara No. 4, Pangongangan, Kec. Manguharjo, Kota Madiun, Jawa Timur 63121.\n"
            . "- Jam Operasional Seluruh Loket Pelayanan: Senin s/d Jumat, buka pukul 08.00 – 15.00 WIB (Sabtu, Minggu & Hari Libur Nasional TUTUP).\n"
            . "- Telepon Kantor Resmi MPP: (0351) 497206 / (0351) 4773980\n"
            . "- Layanan WhatsApp Resmi MPP (Buku Saku Hal. 254):\n"
            . "  * WhatsApp Layanan Perizinan: 0811-3778-776\n"
            . "  * WhatsApp Layanan Pengaduan: 0811-3783-785\n"
            . "  * WhatsApp Layanan LKPM: 0851-5884-5871\n"
            . "  * Helpdesk Layanan Terpadu: 0811-3778-776\n"
            . "- Email Resmi: dpmptsp.madiunkab@gmail.com | Website: https://dpmptsp.id\n"
            . "- KONTAK KHUSUS INSTANSI DI MPP (Dari Buku Saku MPP 2026):\n"
            . "  * Kantor Pertanahan / ATR BPN: 0811-1068-0000 / 0811-3010-5000 (Hal. 150 & 226)\n"
            . "  * Bapenda (Pajak PBB-P2 & BPHTB): (0351) 497206 / WA 0811-3778-776 (Hal. 71)\n"
            . "  * Polres Madiun (SKCK & SIM): 0813-2346-0884 / 0818-0575-1380 (Hal. 96 & 178)\n"
            . "  * Disdukcapil (KTP, KK, Akta, IKD): 0882-3558-6211 / 0811-3716-691 (Hal. 106 & 125)\n"
            . "  * Disnaker & Perindustrian: 0822-2860-0020 (Hal. 49 & 51)\n"
            . "  * Kejaksaan Negeri: 0851-0158-4881 / 0857-8488-4492 (Hal. 134 & 174)\n"
            . "  * BPJS Kesehatan: 0811-8165-165 (Hal. 139) | BPJS Ketenagakerjaan: (0351) 492018 (Hal. 90)\n"
            . "  * Dinas Sosial: (0351) 495355 / 0822-9862-1621 (Hal. 142 & 163)\n"
            . "  * Bank Daerah / Bank Jatim: (0351) 492018 (Hal. 74 & 76)\n"
            . "  * Pengadilan Agama: 0811-3628-118 (Hal. 171)\n"
            . "- INSTRUKSI KELENGKAPAN JAWABAN (DILARANG TERPOTONG):\n"
            . "  * Tuliskan jawaban secara LENGKAP dan TUNTAS sampai selesai. Jangan pernah berhenti di tengah penomoran atau menggantung kalimat.\n"
            . "  * Selalu uraikan nomor 1, 2, 3... pada Persyaratan Berkas secara utuh, lalu uraikan Alur Prosedur, Waktu Layanan, Biaya (Rp0 Gratis jika tidak dipungut biaya), dan cantumkan kontak loket terkait.\n\n";

        $systemInstruction = $basePrompt . $operationalFacts . "DOKUMEN STANDAR PELAYANAN RESMI BUKU SAKU MPP 2026:\n" . $contextText;

        $prompt = "Pertanyaan Pemohon: {$query}\n\nJawablah secara LENGKAP, JELAS, TUNTAS (jangan terpotong), dan rapi berdasarkan standar pelayanan resmi Buku Saku MPP Kabupaten Madiun di atas:";

        $response = $this->callGeminiApi($this->model, $systemInstruction, $prompt);

        if (!$response && $this->model !== $this->fallbackModel) {
            $response = $this->callGeminiApi($this->fallbackModel, $systemInstruction, $prompt);
        }

        if (!$response) {
            $response = $this->callGeminiApi('gemini-3.5-flash-lite', $systemInstruction, $prompt);
        }

        return $response;
    }

    private function callGeminiApi(string $modelName, string $systemInstruction, string $prompt): ?string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemInstruction]
                ]
            ],
            'generationConfig' => [
                'temperature' => $this->temperature,
                'maxOutputTokens' => 1800,
                'topP' => 0.85
            ]
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 12,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $rawResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err || $httpCode !== 200 || empty($rawResponse)) {
            error_log("Gemini API Error (HTTP $httpCode): " . ($err ?: $rawResponse));
            return null;
        }

        $resData = json_decode($rawResponse, true);
        return $resData['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }
}
