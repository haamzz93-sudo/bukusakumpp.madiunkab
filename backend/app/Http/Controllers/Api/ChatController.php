<?php

namespace App\Http\Controllers\Api;

use App\Services\GuardrailService;
use App\Services\RagSearchService;
use App\Services\AudioService;

class ChatController
{
    private GuardrailService $guardrail;
    private RagSearchService $rag;

    public function __construct(GuardrailService $guardrail, RagSearchService $rag)
    {
        $this->guardrail = $guardrail;
        $this->rag = $rag;
    }

    public function chat(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];
        $query = trim($data['q'] ?? $data['query'] ?? '');
        $withAudio = !empty($data['withAudio']);

        if (empty($query)) {
            http_response_code(422);
            echo json_encode([
                'ok' => false,
                'error' => 'Pertanyaan tidak boleh kosong.'
            ]);
            return;
        }

        // Layer 0.1: Fast Sapaan & Salam (Greeting)
        $greeting = $this->guardrail->checkGreeting($query);
        if ($greeting) {
            $audioService = new AudioService();
            $cacheKey = $greeting['audio_cache_key'] ?? 'greeting_official';
            $greeting['audio_url'] = $audioService->generateTts(
                $greeting['answer'],
                'id-ID-ArdiNeural',
                $cacheKey,
                $greeting['spoken_briefing'] ?? null
            );
            echo json_encode($greeting);
            return;
        }

        // Layer 0.2: Fast Jadwal & Jam Operasional Pelayanan MPP
        $schedule = $this->guardrail->checkScheduleInquiry($query);
        if ($schedule) {
            $audioService = new AudioService();
            $cacheKey = $schedule['audio_cache_key'] ?? 'schedule_official';
            $schedule['audio_url'] = $audioService->generateTts(
                $schedule['answer'],
                'id-ID-ArdiNeural',
                $cacheKey,
                $schedule['spoken_briefing'] ?? null
            );
            echo json_encode($schedule);
            return;
        }

        // Layer 0.3: Guardrail Check Model Inquiry
        $modelInquiry = $this->guardrail->checkModelInquiry($query);
        if ($modelInquiry) {
            if (!empty($modelInquiry['answer'])) {
                $audioService = new AudioService();
                $modelInquiry['audio_url'] = $audioService->generateTts($modelInquiry['answer'], 'id-ID-ArdiNeural', 'model_inquiry');
            }
            echo json_encode($modelInquiry);
            return;
        }

        $outDomain = $this->guardrail->checkOutOfDomain($query);
        if ($outDomain) {
            if (!empty($outDomain['answer'])) {
                $audioService = new AudioService();
                $outDomain['audio_url'] = $audioService->generateTts($outDomain['answer'], 'id-ID-ArdiNeural', 'out_of_domain');
            }
            echo json_encode($outDomain);
            return;
        }

        // Layer 1 & 2: RAG & Catalog Search
        $response = $this->rag->search($query);
        if (!empty($response['answer'])) {
            $audioService = new AudioService();
            $cleanQ = mb_strtolower(trim($query));

            // Core SOP Semantic Intent Mapping to Pre-Rendered Bupati Cloned Voice
            if (preg_match('/warung\s*kopi|warkop|kedai\s*kopi|kopi|56303/u', $cleanQ)) {
                $queryKey = 'q_d6eb57660a25e9c2';
            } elseif (preg_match('/skck|catatan\s*kepolisian|sidik\s*jari/u', $cleanQ)) {
                $queryKey = 'q_b8c10a8285c451cf';
            } elseif (preg_match('/bphtb/u', $cleanQ)) {
                $queryKey = 'q_bphtb_official';
            } elseif (preg_match('/pbb|pajak\s*bumi/u', $cleanQ)) {
                $queryKey = 'q_pbb_official';
            } elseif (preg_match('/paspor|imigrasi/u', $cleanQ)) {
                $queryKey = 'q_paspor_official';
            } elseif (preg_match('/ktp|kartu\s*keluarga|disdukcapil|kependudukan|akta/u', $cleanQ)) {
                $queryKey = 'q_ktp_official';
            } else {
                $queryKey = 'q_' . substr(md5($cleanQ), 0, 16);
            }

            $response['audio_url'] = $audioService->generateTts($response['answer'], 'id-ID-ArdiNeural', $queryKey);
        }
        echo json_encode($response);
    }
}
