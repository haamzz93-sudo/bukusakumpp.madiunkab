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

        // Construct source items citing actual PDF pages with authentic portal URLs
        $sourceItems = [];
        foreach ($topChunks as $chunk) {
            $portal = 'https://bukusakumpp.madiunkab.go.id';
            $agencyLower = mb_strtolower($chunk['agency'] ?? '');
            if (str_contains($agencyLower, 'pertanahan') || str_contains($agencyLower, 'bpn')) {
                $portal = 'https://atrbpn.go.id';
            } elseif (str_contains($agencyLower, 'bapenda') || str_contains($agencyLower, 'pajak')) {
                $portal = 'https://bapenda.madiunkab.go.id';
            } elseif (str_contains($agencyLower, 'dpmptsp') || str_contains($agencyLower, 'usaha')) {
                $portal = 'https://oss.go.id';
            } elseif (str_contains($agencyLower, 'polres') || str_contains($agencyLower, 'skck')) {
                $portal = 'https://skck.polri.go.id';
            } elseif (str_contains($agencyLower, 'kependudukan') || str_contains($agencyLower, 'disdukcapil')) {
                $portal = 'https://dukcapil.madiunkab.go.id';
            } elseif (str_contains($agencyLower, 'imigrasi') || str_contains($agencyLower, 'paspor')) {
                $portal = 'https://mpaspor.imigrasi.go.id';
            } elseif (str_contains($agencyLower, 'bpom') || str_contains($agencyLower, 'obat')) {
                $portal = 'https://e-sertifikasi.pom.go.id';
            }

            $sourceItems[] = [
                'name' => "Standar Pelayanan: {$chunk['title']}",
                'instansi' => $chunk['agency'],
                'waktu' => "Halaman {$chunk['page']} (Buku Saku MPP 2026)",
                'portal' => $portal
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
        $cleanContent = trim(preg_replace('/\s+/', ' ', $primaryChunk['content']));
        if (mb_strlen($cleanContent) > 1200) {
            $lastPeriod = mb_strrpos(mb_substr($cleanContent, 0, 1200), '.');
            $cleanContent = mb_substr($cleanContent, 0, $lastPeriod > 400 ? $lastPeriod + 1 : 1200) . '...';
        }

        $fallbackAnswer = "Berdasarkan rujukan resmi **Buku Saku Mal Pelayanan Publik (MPP) Kabupaten Madiun 2026** (Halaman {$primaryChunk['page']}):\n\n"
            . "### {$primaryChunk['title']}\n"
            . "* **Instansi Pelaksana:** {$primaryChunk['agency']}\n"
            . "* **Dokumen Rujukan:** Standar Pelayanan Publik MPP Kabupaten Madiun 2026 (Hal. {$primaryChunk['page']})\n\n"
            . "---\n\n"
            . "### Ringkasan Standar Pelayanan:\n"
            . "{$cleanContent}\n\n"
            . "---\n\n"
            . "**Informasi Operasional Gedung Mal Pelayanan Publik (MPP) Kabupaten Madiun:**\n"
            . "* **Alamat:** Jl. Aloon-Aloon Utara No. 4, Pangongangan, Kec. Manguharjo, Kota Madiun, Jawa Timur 63121.\n"
            . "* **Jam Layanan:** Senin s/d Jumat, pukul 08.00 – 15.00 WIB (Buka pukul 08.00 WIB. Libur Nasional & Akhir Pekan Tutup).\n"
            . "* **Kontak Resmi:** Telepon (0351) 497206 / 4773980 | WhatsApp Perizinan 0811-3778-776 | WA Pengaduan 0811-3783-785.";

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
