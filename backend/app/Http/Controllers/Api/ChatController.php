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

        // Layer 0: Guardrail Check
        $modelInquiry = $this->guardrail->checkModelInquiry($query);
        if ($modelInquiry) {
            if (!empty($modelInquiry['answer'])) {
                $audioService = new AudioService();
                $modelInquiry['audio_url'] = $audioService->generateTts($modelInquiry['answer']);
            }
            echo json_encode($modelInquiry);
            return;
        }

        $outDomain = $this->guardrail->checkOutOfDomain($query);
        if ($outDomain) {
            if (!empty($outDomain['answer'])) {
                $audioService = new AudioService();
                $outDomain['audio_url'] = $audioService->generateTts($outDomain['answer']);
            }
            echo json_encode($outDomain);
            return;
        }

        // Layer 1 & 2: RAG & Catalog Search
        $response = $this->rag->search($query);
        if (!empty($response['answer'])) {
            $audioService = new AudioService();
            $response['audio_url'] = $audioService->generateTts($response['answer']);
        }
        echo json_encode($response);
    }
}
