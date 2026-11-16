<?php

namespace App\Http\Controllers\Api;

use App\Services\GuardrailService;
use App\Services\RagSearchService;

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
            echo json_encode($modelInquiry);
            return;
        }

        $outDomain = $this->guardrail->checkOutOfDomain($query);
        if ($outDomain) {
            echo json_encode($outDomain);
            return;
        }

        // Layer 1 & 2: RAG & Catalog Search
        $response = $this->rag->search($query);
        echo json_encode($response);
    }
}
