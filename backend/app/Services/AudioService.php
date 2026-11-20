<?php

namespace App\Services;

class AudioService
{
    private string $apiKey;
    private string $model = 'gemini-3.1-flash-lite';
    private string $fallbackModel = 'gemini-1.5-flash';

    public function __construct()
    {
        $this->apiKey = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? '');

        $settingsFile = __DIR__ . '/../../storage/settings.json';
        if (file_exists($settingsFile)) {
            $settings = json_decode(file_get_contents($settingsFile), true) ?? [];
            if (!empty($settings['geminiApiKey'])) {
                $this->apiKey = trim($settings['geminiApiKey']);
            }
        }

        if (empty($this->apiKey)) {
            $envFile = __DIR__ . '/../../.env';
            if (file_exists($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    if (str_starts_with(trim($line), 'GEMINI_API_KEY=')) {
                        $this->apiKey = trim(explode('=', $line, 2)[1] ?? '');
                        break;
                    }
                }
            }
        }

        if (empty($this->apiKey)) {
            $this->apiKey = base64_decode('QVEuQWI4Uk42SWh6V0I5Ty13VUQ3OTR1VTVtbE1FaGhLbnhxLXkxV2gwVmVKY2pyTmRsd0E=');
        }
    }

    /**
     * Transcribe speech audio to Indonesian text via Gemini Multimodal API
     */
    public function transcribeAudio(string $audioBytes, string $mimeType = 'audio/webm'): ?string
    {
        if (empty($audioBytes)) {
            return null;
        }

        // Clean MIME type
        $cleanMime = explode(';', $mimeType)[0];
        if (empty($cleanMime)) {
            $cleanMime = 'audio/webm';
        }

        $base64Audio = base64_encode($audioBytes);

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => "Transkripsikan rekaman suara percakapan warga berikut secara persis kata demi kata ke dalam teks bahasa Indonesia. "
                                    . "Konteks percakapan adalah seputar pelayanan publik, perizinan, atau administrasi di Mal Pelayanan Publik (MPP) Kabupaten Madiun (seperti BPHTB, izin usaha, KTP, SKCK, CPPOB, dll). "
                                    . "PENTING: Hanya tuliskan kalimat yang diucapkan tanpa ada kata pengantar, penjelasan, tanda kutip tambahan, atau sapaan."
                        ],
                        [
                            'inline_data' => [
                                'mime_type' => $cleanMime,
                                'data' => $base64Audio
                            ]
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.1,
                'maxOutputTokens' => 300
            ]
        ];

        $models = [$this->model, 'gemini-2.5-flash', 'gemini-1.5-flash'];
        foreach ($models as $m) {
            $result = $this->callGeminiWithPayload($m, $payload);
            if (!empty($result)) {
                $cleaned = trim(preg_replace('/^["\']|["\']$/u', '', trim($result)));
                if (!empty($cleaned)) {
                    return $cleaned;
                }
            }
        }

        return null;
    }

    /**
     * Generate high-fidelity Indonesian neural speech audio file via Voicebox or Edge-TTS
     * Returns relative URL to the MP3 file
     */
    public function generateTts(string $text, string $voice = 'id-ID-ArdiNeural', ?string $cacheKey = null, ?string $explicitScript = null): ?string
    {
        @set_time_limit(300);
        @ini_set('max_execution_time', '300');
        $text = trim($text);
        if (empty($text) && empty($explicitScript)) {
            return null;
        }

        // Prepare briefing text: use explicit script if provided, else condense
        $briefingText = !empty($explicitScript) ? trim($explicitScript) : $this->condenseToBupatiBriefing($text);
        if (empty($briefingText)) {
            return null;
        }

        // Cache based on query key or hash of voice + briefingText content
        $hash = $cacheKey ? preg_replace('/[^a-zA-Z0-9_-]/', '', $cacheKey) : substr(md5($voice . '_' . $briefingText), 0, 16);
        $audioDir = __DIR__ . '/../../storage/audio';
        if (!is_dir($audioDir)) {
            @mkdir($audioDir, 0777, true);
        }

        $filename = "tts_{$hash}.mp3";
        $filePath = "{$audioDir}/{$filename}";
        $publicDir = __DIR__ . '/../../public/api/audio';
        if (!is_dir($publicDir)) {
            @mkdir($publicDir, 0777, true);
        }
        $publicFilePath = "{$publicDir}/{$filename}";

        // Return cached audio if already generated and non-empty (>1KB) in storage or public
        if (file_exists($publicFilePath) && filesize($publicFilePath) > 1024) {
            if (!file_exists($filePath) || filesize($filePath) !== filesize($publicFilePath)) {
                @copy($publicFilePath, $filePath);
            }
            return "/api/audio/{$filename}";
        }
        if (file_exists($filePath) && filesize($filePath) > 1024) {
            if (!file_exists($publicFilePath) || filesize($publicFilePath) !== filesize($filePath)) {
                @copy($filePath, $publicFilePath);
            }
            return "/api/audio/{$filename}";
        }

        // 1. Try local/remote Voicebox AI engine (RTX 3050 CUDA local open-source voice cloning of Bupati Madiun)
        if ($this->tryGenerateVoiceboxSpeech($briefingText, $filePath)) {
            @copy($filePath, $publicFilePath);
            return "/api/audio/{$filename}";
        }

        // 2. High-Performance Dynamic Neural Speech (Edge-TTS) with Dignified Bupati Tone
        // Speaks the EXACT dynamic briefing for the citizen's specific question
        $scriptPath = __DIR__ . '/generate_tts.py';
        if (file_exists($scriptPath)) {
            $pythonCmd = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') ? 'python' : 'python3';
            $tempTextFile = tempnam(sys_get_temp_dir(), 'tts_');
            file_put_contents($tempTextFile, $briefingText);

            $cmd = sprintf(
                '%s %s --text-file %s --output %s --voice %s 2>&1',
                $pythonCmd,
                escapeshellarg($scriptPath),
                escapeshellarg($tempTextFile),
                escapeshellarg($filePath),
                escapeshellarg($voice)
            );

            if (function_exists('safeRunCliCommand')) {
                $output = safeRunCliCommand($cmd);
            } elseif (function_exists('shell_exec')) {
                $output = @shell_exec($cmd);
            } else {
                $output = '';
            }

            @unlink($tempTextFile);

            if (file_exists($filePath) && filesize($filePath) > 500) {
                @copy($filePath, $publicFilePath);
                return "/api/audio/{$filename}";
            }
        }

        // 3. Fallback: If both Voicebox and Edge-TTS are unavailable, serve the universal Bupati audio
        $bupatiUniversal = file_exists("{$publicDir}/tts_bupati_general_sop.mp3") 
            ? "{$publicDir}/tts_bupati_general_sop.mp3" 
            : "{$audioDir}/tts_bupati_general_sop.mp3";
        if (file_exists($bupatiUniversal) && filesize($bupatiUniversal) > 1024) {
            if (!file_exists("{$publicDir}/tts_bupati_general_sop.mp3")) {
                @copy($bupatiUniversal, "{$publicDir}/tts_bupati_general_sop.mp3");
            }
            return "/api/audio/tts_bupati_general_sop.mp3";
        }

        return null;
    }

    private function callGeminiWithPayload(string $modelName, array $payload): ?string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$this->apiKey}";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 25,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $raw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || empty($raw)) {
            return null;
        }

        $res = json_decode($raw, true);
        return $res['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }

    /**
     * Synthesize ultra-realistic speech via ElevenLabs API using cloned Bupati Madiun voice
     */
    private function tryGenerateElevenLabsSpeech(string $text, string $filePath): bool
    {
        $apiKey = getenv('ELEVENLABS_API_KEY') ?: ($_ENV['ELEVENLABS_API_KEY'] ?? '');
        $voiceId = getenv('ELEVENLABS_VOICE_ID') ?: ($_ENV['ELEVENLABS_VOICE_ID'] ?? '');

        $settingsFile = __DIR__ . '/../../storage/settings.json';
        if (file_exists($settingsFile)) {
            $settings = json_decode(file_get_contents($settingsFile), true) ?? [];
            if (!empty($settings['elevenLabsApiKey'])) $apiKey = trim($settings['elevenLabsApiKey']);
            if (!empty($settings['elevenLabsVoiceId'])) $voiceId = trim($settings['elevenLabsVoiceId']);
        }

        if (empty($apiKey) || empty($voiceId)) {
            return false;
        }

        // Clean text for speech
        $cleanText = preg_replace('/https?:\/\/\S+/', '', $text);
        $cleanText = preg_replace('/[*#_`]+/', ' ', $cleanText);
        $cleanText = trim(preg_replace('/\s+/', ' ', $cleanText));
        if (mb_strlen($cleanText) > 600) {
            $cleanText = mb_substr($cleanText, 0, 597) . '...';
        }

        $url = "https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}";
        $payload = json_encode([
            'text' => $cleanText,
            'model_id' => 'eleven_multilingual_v2',
            'voice_settings' => [
                'stability' => 0.55,
                'similarity_boost' => 0.85,
                'style' => 0.15,
                'use_speaker_boost' => true
            ]
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                "xi-api-key: {$apiKey}",
                'Accept: audio/mpeg'
            ],
            CURLOPT_TIMEOUT => 25,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $audioBytes = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && !empty($audioBytes) && strlen($audioBytes) > 1024) {
            file_put_contents($filePath, $audioBytes);
            return true;
        }

        return false;
    }

    /**
     * Condense any standard public service SOP answer into a concise, high-impact speech script (200-300 chars)
     * spoken in the executive voice of Bapak Bupati Madiun ("inti-intinya saja: syarat, alur, waktu, biaya").
     */
    public function condenseToBupatiBriefing(string $text): string
    {
        $clean = preg_replace('/https?:\/\/\S+/', '', $text);
        $clean = preg_replace('/[*#_`\[\]\(\)]+/', ' ', $clean);
        $clean = trim(preg_replace('/\s+/', ' ', $clean));
        if (mb_strlen($clean) <= 240) {
            return $this->formatForSpokenSpeech($clean);
        }

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => "Susun naskah narasi lisan resmi, sopan, santun, dan profesional dengan alur paten untuk dibacakan langsung oleh suara Bapak Bupati Madiun kepada warga terkait standar pelayanan ini:\n\n"
                                    . "Gunakan struktur baku berikut:\n"
                                    . "1. Sapaan hangat: 'Halo Bapak dan Ibu warga Kabupaten Madiun.'\n"
                                    . "2. Layanan & Syarat Utama: 'Terkait [nama layanan], silakan siapkan dokumen utama seperti [2-3 syarat penting].'\n"
                                    . "3. Alur & Mekanisme: 'Prosedurnya [mekanisme singkat: datang langsung ke loket MPP Madiun / daftar mandiri online].'\n"
                                    . "4. Waktu & Biaya: 'Waktu layanan [sebutkan waktu] dengan biaya [sebutkan biaya resmi / gratis seratus persen].'\n"
                                    . "5. Penutup santun: 'Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih.'\n\n"
                                    . "PENTING:\n"
                                    . "- Panjang sekitar 240-300 karakter.\n"
                                    . "- Tuliskan angka dengan ejaan lisan (misal: 'lima belas menit', 'tiga puluh ribu rupiah', 'nol menit atau langsung terbit').\n"
                                    . "- Jangan ada URL link, jangan ada simbol markdown (*), jangan ada kata pengantar tambahan. Langsung kalimat siap dibaca audio.\n"
                                    . "- PENTING SEKALI: Pastikan kalimat terakhir selesai secara tuntas dengan tanda titik (.). JANGAN terpotong di tengah kalimat!\n\n"
                                    . "Teks sumber:\n" . mb_substr($text, 0, 1500)
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.2,
                'maxOutputTokens' => 400
            ]
        ];

        $models = [$this->model, 'gemini-1.5-flash'];
        foreach ($models as $m) {
            $result = $this->callGeminiWithPayload($m, $payload);
            if (!empty($result)) {
                $condensed = trim(preg_replace('/^["\']|["\']$/u', '', trim($result)));
                $condensed = preg_replace('/[*#_`]+/', ' ', $condensed);
                $condensed = trim(preg_replace('/\s+/', ' ', $condensed));
                if (!empty($condensed) && mb_strlen($condensed) > 40) {
                    // Check if truncated at the end
                    $lastChar = mb_substr($condensed, -1);
                    if (!in_array($lastChar, ['.', '!', '?'])) {
                        $lastPeriod = mb_strrpos($condensed, '.');
                        if ($lastPeriod !== false && $lastPeriod > 80) {
                            $condensed = mb_substr($condensed, 0, $lastPeriod + 1);
                        } else {
                            $condensed .= '.';
                        }
                    }
                    if (!str_contains($condensed, 'Terima kasih')) {
                        $condensed .= ' Terima kasih.';
                    }
                    return $this->formatForSpokenSpeech($condensed);
                }
            }
        }

        // Fallback: rule-based summary
        if (mb_strlen($clean) > 260) {
            $cutoff = mb_strrpos(mb_substr($clean, 0, 260), '.');
            if ($cutoff !== false && $cutoff > 120) {
                return $this->formatForSpokenSpeech(mb_substr($clean, 0, $cutoff + 1) . ' Rincian berkas lengkap dapat disimak pada teks panduan di layar. Terima kasih.');
            }
            return $this->formatForSpokenSpeech(mb_substr($clean, 0, 220) . ' Rincian berkas lengkap dapat disimak pada teks panduan di layar. Terima kasih.');
        }

        return $this->formatForSpokenSpeech($clean);
    }

    /**
     * Format and normalize text for flawless spoken speech synthesis (prevent TTS hiccups and cutting off)
     */
    public function formatForSpokenSpeech(string $text): string
    {
        $text = preg_replace('/https?:\/\/\S+/', '', $text);
        $text = preg_replace('/[*#_`\[\]\(\)\{\}\<\>\"\']+/u', ' ', $text);
        
        // Ejaan lisan angka & singkatan umum
        $replacements = [
            '/\bKBLI\s*56303\b/i' => 'KBLI lima enam tiga nol tiga',
            '/\bOSS[-\s]*RBA\b/i' => 'O S S R B A',
            '/\bOSS\b/i' => 'O S S',
            '/\bNIB\b/i' => 'N I B',
            '/\bSKCK\b/i' => 'S K C K',
            '/\bMPP\b/i' => 'M P P',
            '/\bDPMPTSP\b/i' => 'D P M P T S P',
            '/\bBPHTB\b/i' => 'B P H T B',
            '/\bPBB[-\s]*P2\b/i' => 'P B B P 2',
            '/\b0\s*menit\b/i' => 'nol menit atau langsung terbit',
            '/\b15\s*menit\b/i' => 'lima belas menit',
            '/\bRp\.?\s*0\b/i' => 'nol rupiah atau gratis',
            '/\bRp\.?\s*30\.?000\b/i' => 'tiga puluh ribu rupiah',
            '/\bRp\.?\s*([0-9\.]+)\b/i' => 'rupiah $1',
            '/\bs\/d\b/i' => 'sampai dengan',
            '/\bdll\b/i' => 'dan lain-lain',
            '/\s+/' => ' '
        ];

        foreach ($replacements as $pat => $rep) {
            $text = preg_replace($pat, $rep, $text);
        }

        $text = trim($text);
        if (!empty($text)) {
            $last = mb_substr($text, -1);
            if (!in_array($last, ['.', '!', '?'])) {
                $text .= '.';
            }
            // Add trailing space for codec padding so the final phoneme is never clipped
            $text .= ' ';
        }

        return $text;
    }

    /**
     * Synthesize cloned voice of Bupati Madiun via locally running Voicebox server (RTX 3050 CUDA)
     */
    private function tryGenerateVoiceboxSpeech(string $briefingText, string $filePath): bool
    {
        $customUrl = getenv('VOICEBOX_URL') ?: ($_ENV['VOICEBOX_URL'] ?? null);
        $settingsFile = __DIR__ . '/../../storage/settings.json';
        if (file_exists($settingsFile)) {
            $settings = json_decode(file_get_contents($settingsFile), true) ?? [];
            if (!empty($settings['voiceboxUrl'])) {
                $customUrl = trim($settings['voiceboxUrl']);
            }
        }

        $endpoints = array_values(array_filter([
            $customUrl,
            'http://127.0.0.1:17493/v1/audio/speech', // Local CUDA Voicebox (RTX 3050)
            'http://127.0.0.1:17494/v1/audio/speech'  // VPS Lightweight Dynamic Bupati TTS Service
        ]));

        $cleanText = $this->formatForSpokenSpeech($briefingText);
        if (empty($cleanText)) {
            return false;
        }

        $payload = json_encode([
            'model' => 'qwen-tts-0.6B',
            'voice' => 'Bupati Madiun Asli',
            'input' => $cleanText,
            'response_format' => 'mp3'
        ]);

        foreach ($endpoints as $voiceboxUrl) {
            $ch = curl_init($voiceboxUrl);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 60,
                CURLOPT_CONNECTTIMEOUT => 2
            ]);

            $audioBytes = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && !empty($audioBytes) && strlen($audioBytes) > 1024) {
                file_put_contents($filePath, $audioBytes);
                return true;
            }
        }

        return false;
    }
}
