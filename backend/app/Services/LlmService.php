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
        $this->model = getenv('GEMINI_MODEL') ?: ($_ENV['GEMINI_MODEL'] ?? 'gemini-3.5-flash-lite');
        $this->fallbackModel = getenv('GEMINI_FALLBACK_MODEL') ?: ($_ENV['GEMINI_FALLBACK_MODEL'] ?? 'gemini-3.5-flash');

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

        // Build context block from retrieved pages
        $contextText = "";
        foreach ($contextChunks as $idx => $chunk) {
            $contextText .= "--- DOKUMEN RUJUKAN RESMI " . ($idx + 1) . " (Buku Saku MPP 2026 - Halaman {$chunk['page']} | Instansi: {$chunk['agency']}) ---\n";
            $contextText .= "Judul/Layanan: {$chunk['title']}\n";
            $contextText .= "Isi Standar Pelayanan:\n" . substr($chunk['content'], 0, 1500) . "\n\n";
        }

        $systemInstruction = $this->customSystemPrompt 
            ? ($this->customSystemPrompt . "\n\n" . "DOKUMEN STANDAR PELAYANAN RESMI BUKU SAKU MPP 2026:\n" . $contextText)
            : ("Anda adalah BUKU SAKU, asisten digital resmi Mal Pelayanan Publik (MPP) Pemerintah Kabupaten Madiun.\n"
            . "Tugas Anda: Memberikan informasi perizinan, persyaratan administratif/teknis, sistem mekanisme alur pengurusan, biaya/retribusi, dan jangka waktu pelayanan secara akurat, lugas, santun, dan mudah dipahami masyarakat.\n\n"
            . "ATURAN UTAMA (WAJIB DITAATI):\n"
            . "1. Gunakan HANYA informasi faktual dari DOKUMEN RUJUKAN RESMI Buku Saku MPP 2026 yang diberikan di bawah ini. Jangan berhalusinasi atau mengarang aturan baru.\n"
            . "2. Format jawaban dengan markdown yang rapi: gunakan judul tebal (###), daftar bernomor untuk alur, dan poin peluru (-) untuk persyaratan.\n"
            . "3. Sebutkan instansi pelaksana resmi (misal: DPMPTSP, Disnaker, Bapenda, Kantor Pertanahan, Disdukcapil, dll.) dan nomor halaman dokumen rujukan.\n"
            . "4. Jika informasi biaya tidak disebutkan atau gratis, tegaskan 'Biaya: Rp0 (Gratis) / Sesuai Ketentuan Retribusi Resmi'.\n"
            . "5. PENTING SOAL IDENTITAS: Jika ditanya mengenai identitas AI, vendor, LLM, atau teknologi (seperti GPT, Gemini, Claude, Llama, OpenAI, Google AI), JANGAN PERNAH mengaku atau menyebut nama-nama tersebut. Tegaskan bahwa Anda adalah BUKU SAKU, asisten digital resmi Mal Pelayanan Publik Pemerintah Kabupaten Madiun.\n"
            . "6. Jika pemohon membutuhkan tindak lanjut kasus berkas pribadi (seperti komplain tagihan atau berkas macet), arahkan untuk berkonsultasi langsung ke WhatsApp Loket Resmi MPP Madiun (0851-1740-5460).\n\n"
            . "DOKUMEN STANDAR PELAYANAN RESMI BUKU SAKU MPP 2026:\n" . $contextText);

        $prompt = "Pertanyaan Pemohon: {$query}\n\nJawablah berdasarkan standar pelayanan resmi Buku Saku MPP Kabupaten Madiun di atas:";

        $response = $this->callGeminiApi($this->model, $systemInstruction, $prompt);

        if (!$response && $this->model !== $this->fallbackModel) {
            $response = $this->callGeminiApi($this->fallbackModel, $systemInstruction, $prompt);
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
                'maxOutputTokens' => 1200,
                'topP' => 0.8
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
            CURLOPT_TIMEOUT => 15,
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
