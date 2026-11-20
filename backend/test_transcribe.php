<?php
require_once __DIR__ . '/app/Services/AudioService.php';
$svc = new \App\Services\AudioService();
$wavPath = 'D:/Landing Page/Buku Saku/frontend/public/avatar/bupati_suara_asli.wav';
if (!file_exists($wavPath)) {
    echo "File not found\n";
    exit();
}
$bytes = file_get_contents($wavPath);
echo "Calling Gemini Multimodal Audio...\n";
$transcription = $svc->transcribeAudio($bytes, 'audio/wav');
echo "TRANSKRIPSI ASLI: " . $transcription . "\n";
