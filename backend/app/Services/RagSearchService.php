<?php

namespace App\Services;

class RagSearchService
{
    private array $pages = [];
    private LlmService $llm;

    public function __construct()
    {
        $this->llm = new LlmService();
        $this->loadKnowledgeBase();
    }

    public function search(string $query): array
    {
        $cleanQ = mb_strtolower(trim($query));
        $tokens = array_filter(explode(' ', preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $cleanQ)));
        
        // Exclude common stop words
        $stopWords = ['apa', 'saja', 'syarat', 'cara', 'bagaimana', 'alur', 'izin', 'perizinan', 'di', 'ke', 'dari', 'dan', 'yang', 'untuk', 'madiun', 'kabupaten', 'buku', 'saku', 'mpp'];
        $meaningfulTokens = array_values(array_filter($tokens, fn($t) => !in_array($t, $stopWords) && mb_strlen($t) > 2));

        if (empty($meaningfulTokens)) {
            $meaningfulTokens = $tokens;
        }

        // Rank pages based on token hits in title, agency, and full content
        $scoredPages = [];
        foreach ($this->pages as $page) {
            $score = 0;
            $titleLower = mb_strtolower($page['title'] ?? '');
            $agencyLower = mb_strtolower($page['agency'] ?? '');
            $contentLower = mb_strtolower($page['content'] ?? '');

            // Exact phrase match bonus
            if (str_contains($contentLower, $cleanQ)) {
                $score += 25;
            }

            foreach ($meaningfulTokens as $token) {
                if (str_contains($titleLower, $token)) {
                    $score += 15;
                }
                if (str_contains($agencyLower, $token)) {
                    $score += 8;
                }
                if (str_contains($contentLower, $token)) {
                    $score += 3;
                }
            }

            // Specific high-frequency service boosters
            if ((str_contains($cleanQ, 'warung kopi') || str_contains($cleanQ, 'kedai')) && str_contains($contentLower, '56303')) {
                $score += 30;
            }
            if (str_contains($cleanQ, 'skck') && (str_contains($contentLower, 'skck') || str_contains($agencyLower, 'polres'))) {
                $score += 30;
            }
            if (str_contains($cleanQ, 'bphtb') && (str_contains($contentLower, 'bphtb') || str_contains($agencyLower, 'bapenda'))) {
                $score += 30;
            }
            if (str_contains($cleanQ, 'pbb') && (str_contains($contentLower, 'pbb') || str_contains($agencyLower, 'bapenda'))) {
                $score += 30;
            }
            if (str_contains($cleanQ, 'paspor') && str_contains($contentLower, 'paspor')) {
                $score += 30;
            }
            if ((str_contains($cleanQ, 'ktp') || str_contains($cleanQ, 'kk') || str_contains($cleanQ, 'ikd')) && str_contains($agencyLower, 'kependudukan')) {
                $score += 30;
            }
            if (str_contains($cleanQ, 'kosmetik') && str_contains($contentLower, 'kosmetik')) {
                $score += 30;
            }

            if ($score > 0) {
                $scoredPages[] = [
                    'page' => $page['page'],
                    'agency' => $page['agency'],
                    'title' => $page['title'],
                    'content' => $page['content'],
                    'score' => $score
                ];
            }
        }

        // Sort descending by relevance score
        usort($scoredPages, fn($a, $b) => $b['score'] <=> $a['score']);
        $topChunks = array_slice($scoredPages, 0, 4);

        // Fallback default chunks if no specific match found
        if (empty($topChunks)) {
            $topChunks = array_slice($this->pages, 3, 3);
        }

        // Construct source items citing actual PDF pages
        $sourceItems = [];
        foreach ($topChunks as $chunk) {
            $sourceItems[] = [
                'name' => "Standar Pelayanan: {$chunk['title']}",
                'instansi' => $chunk['agency'],
                'waktu' => "Halaman {$chunk['page']} (Buku Saku MPP 2026)",
                'portal' => 'Mal Pelayanan Publik Caruban'
            ];
        }

        // Check if query is personal verification
        $isPersonal = str_contains($cleanQ, 'punya saya') || str_contains($cleanQ, 'tagihan saya') || 
                      str_contains($cleanQ, 'kenapa belum') || str_contains($cleanQ, 'status berkas');

        // Layer 2: LLM Synthesis with Context Chunks
        $llmAnswer = $this->llm->generateAnswer($query, $topChunks);

        if (!empty($llmAnswer)) {
            return [
                'ok' => true,
                'layer' => 'docrag',
                'via' => 'gemini-llm-rag',
                'answer' => $llmAnswer,
                'source_items' => $sourceItems,
                'related' => $this->generateRelatedQuestions($query, $topChunks),
                'needs_human' => $isPersonal
            ];
        }

        // Deterministic Fallback if LLM API is unavailable
        $primaryChunk = $topChunks[0];
        $fallbackAnswer = "Berdasarkan rujukan resmi **Buku Saku Mal Pelayanan Publik (MPP) Kabupaten Madiun 2026** (Halaman {$primaryChunk['page']}):\n\n"
            . "### {$primaryChunk['title']}\n"
            . "* **Instansi Pelaksana:** {$primaryChunk['agency']}\n"
            . "* **Sumber Resmi:** Buku Saku MPP Kabupaten Madiun 2026\n\n"
            . "---\n\n"
            . "### Ringkasan Standar Pelayanan:\n"
            . substr($primaryChunk['content'], 0, 900) . "...\n\n"
            . "> Untuk pengajuan perizinan dan verifikasi berkas, Anda dapat datang langsung ke loket **{$primaryChunk['agency']}** di Gedung MPP Caruban (Jl. Alun-Alun Timur No.3 Caruban) atau hubungi WhatsApp resmi MPP di 0851-1740-5460.";

        return [
            'ok' => true,
            'layer' => 'docrag',
            'via' => 'pdf-rag-offline',
            'answer' => $fallbackAnswer,
            'source_items' => $sourceItems,
            'related' => $this->generateRelatedQuestions($query, $topChunks),
            'needs_human' => $isPersonal
        ];
    }

    private function generateRelatedQuestions(string $query, array $chunks): array
    {
        $related = [];
        $agency = $chunks[0]['agency'] ?? 'MPP Kabupaten Madiun';
        
        $related[] = "Berapa jam operasional loket {$agency} di MPP Caruban?";
        $related[] = "Apakah pengurusan layanan ini dapat diwakilkan dengan surat kuasa?";
        $related[] = "Dokumen asli apa saja yang wajib dibawa saat verifikasi di loket?";

        return $related;
    }

    private function loadKnowledgeBase(): void
    {
        $possiblePaths = [
            __DIR__ . '/../../storage/rag_mpp_knowledge.json',
            __DIR__ . '/../storage/rag_mpp_knowledge.json',
            'D:/Landing Page/Buku Saku/backend/storage/rag_mpp_knowledge.json'
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $raw = file_get_contents($path);
                $data = json_decode($raw, true);
                if (!empty($data['pages'])) {
                    $this->pages = $data['pages'];
                    return;
                }
            }
        }
    }
}
