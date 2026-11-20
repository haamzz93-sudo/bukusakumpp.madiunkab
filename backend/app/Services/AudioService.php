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
     * Generate high-fidelity Indonesian neural speech audio file via Edge-TTS (id-ID-ArdiNeural)
     * Returns relative URL to the MP3 file
     */
    public function generateTts(string $text, string $voice = 'id-ID-ArdiNeural', ?string $cacheKey = null): ?string
    {
        @set_time_limit(300);
        @ini_set('max_execution_time', '300');
        $text = trim($text);
        if (empty($text)) {
            return null;
        }

        // Cache based on query key or hash of voice + text content
        $hash = $cacheKey ? preg_replace('/[^a-zA-Z0-9_-]/', '', $cacheKey) : substr(md5($voice . '_' . $text), 0, 16);
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

        // Return cached audio if already generated and non-empty
        if (file_exists($filePath) && filesize($filePath) > 1024) {
            if (!file_exists($publicFilePath)) {
                @copy($filePath, $publicFilePath);
            }
            return "/api/audio/{$filename}";
        }

        // 1. Try local Voicebox AI engine (RTX 3050 CUDA local open-source voice cloning of Bupati Madiun)
        if ($this->tryGenerateVoiceboxSpeech($text, $filePath)) {
            @copy($filePath, $publicFilePath);
            return "/api/audio/{$filename}";
        }

        // 2. Fallback to Edge-TTS if Voicebox is offline or uninstalled
        $scriptPath = __DIR__ . '/generate_tts.py';
        if (!file_exists($scriptPath)) {
            return null;
        }

        // Choose python executable (check python3 or python)
        $pythonCmd = 'python3';
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $pythonCmd = 'python';
        }

        // Use temporary file to safely pass text without shell argument truncation/escaping bugs
        $tempTextFile = tempnam(sys_get_temp_dir(), 'tts_');
        file_put_contents($tempTextFile, $text);

        $cmd = sprintf(
            '%s %s --text-file %s --output %s --voice %s 2>&1',
            $pythonCmd,
            escapeshellarg($scriptPath),
            escapeshellarg($tempTextFile),
            escapeshellarg($filePath),
            escapeshellarg($voice)
        );

        // Execute via safeRunCliCommand helper
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
     * Synthesize cloned voice of Bupati Madiun via locally running Voicebox server (RTX 3050 CUDA)
     */
    private function tryGenerateVoiceboxSpeech(string $text, string $filePath): bool
    {
        $voiceboxUrl = 'http://127.0.0.1:17493/v1/audio/speech';

        // Clean text (remove URLs, markdown headers, raw asterisks)
        $cleanText = preg_replace('/https?:\/\/\S+/', '', $text);
        $cleanText = preg_replace('/[*#_`]+/', ' ', $cleanText);
        $cleanText = trim(preg_replace('/\s+/', ' ', $cleanText));
        if (mb_strlen($cleanText) > 280) {
            $cutoff = mb_strrpos(mb_substr($cleanText, 0, 280), '.');
            if ($cutoff !== false && $cutoff > 120) {
                $cleanText = mb_substr($cleanText, 0, $cutoff + 1);
            } else {
                $cleanText = mb_substr($cleanText, 0, 277) . '...';
            }
        }

        if (empty($cleanText)) {
            return false;
        }

        $payload = json_encode([
            'model' => 'qwen-tts-0.6B',
            'voice' => 'Bupati Madiun Asli',
            'input' => $cleanText,
            'response_format' => 'mp3'
        ]);

        $ch = curl_init($voiceboxUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 240,
            CURLOPT_CONNECTTIMEOUT => 3
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
}
