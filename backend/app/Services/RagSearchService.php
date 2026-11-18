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
        $stopWords = ['apa', 'saja', 'syarat', 'cara', 'bagaimana', 'alur', 'izin', 'perizinan', 'di', 'ke', 'dari', 'dan', 'yang', 'untuk', 'madiun', 'kabupaten', 'buku', 'saku', 'mpp', 'mau', 'bisa', 'tolong', 'tanya'];
        $meaningfulTokens = array_values(array_filter($tokens, fn($t) => !in_array($t, $stopWords) && mb_strlen($t) > 2));

        if (empty($meaningfulTokens)) {
            $meaningfulTokens = $tokens;
        }

        // High-precision Domain Intent Boosters & Collision Guards
        $isGeneralMppInfo = (
            preg_match('/(jam|jadwal|operasional|waktu|hari|buka|tutup|kapan|alamat|lokasi|telepon|kontak|nomor|call center|kantor|gedung)/u', $cleanQ)
            && (
                preg_match('/(mpp|mal pelayanan|dpmptsp|kabupaten madiun|pelayanan|kantor|gedung)/u', $cleanQ)
                || preg_match('/(jam berapa|buka jam|tutup jam|hari apa|kapan buka|jam layanan|jam operasional|jam kerja)/u', $cleanQ)
            )
        );

        // Rank pages based on token hits in title, agency, and full content
        $scoredPages = [];
        foreach ($this->pages as $page) {
            $score = 0;
            $titleLower = mb_strtolower($page['title'] ?? '');
            $agencyLower = mb_strtolower($page['agency'] ?? '');
            $contentLower = mb_strtolower($page['content'] ?? '');

            // Exact phrase match bonus
            if (str_contains($contentLower, $cleanQ)) {
                $score += 35;
            }

            foreach ($meaningfulTokens as $token) {
                if (str_contains($titleLower, $token)) {
                    $score += 20;
                }
                if (str_contains($agencyLower, $token)) {
                    $score += 10;
                }
                if (str_contains($contentLower, $token)) {
                    $score += 4;
                }
            }

            // 0. Jam Buka / Jadwal Operasional / Alamat / Kontak Helpdesk MPP Kabupaten Madiun
            if ($isGeneralMppInfo) {
                if (($page['page'] ?? 0) >= 250 || str_contains($titleLower, 'kontak') || str_contains($titleLower, 'jam') || str_contains($contentLower, 'senin') || str_contains($contentLower, 'aloon-aloon')) {
                    $score += 450;
                }
                // Penalty: jangan mencocokkan jadwal angsuran kredit/deposito bank saat bertanya jadwal operasional MPP
                if (str_contains($titleLower, 'bank') || str_contains($titleLower, 'deposito') || str_contains($titleLower, 'kredit') || str_contains($titleLower, 'bpr') || str_contains($titleLower, 'tabungan')) {
                    $score -= 600;
                }
            }
            
            // 1. Usaha Warung Kopi / Usaha Kuliner / Cafe / Makanan & Minuman
            if (preg_match('/warung|kopi|warkop|kedai|kafe|cafe|kuliner|restoran|rumah makan|minuman|56303/u', $cleanQ)) {
                if (str_contains($titleLower, 'warung kopi') || str_contains($titleLower, '56303') || str_contains($contentLower, '56303')) {
                    $score += 180;
                } elseif (str_contains($agencyLower, 'dpmptsp') || str_contains($titleLower, 'oss') || str_contains($titleLower, 'berusaha') || ($page['page'] ?? 0) == 6 || ($page['page'] ?? 0) == 10) {
                    $score += 90;
                }
                // Penalty: jangan mencocokkan rekening/deposito perbankan saat bertanya kuliner/warung
                if (str_contains($titleLower, 'deposito') || str_contains($titleLower, 'tabungan') || str_contains($titleLower, 'bank daerah')) {
                    $score -= 150;
                }
            }

            // 2. Perbankan / Deposito / Simpanan
            if (preg_match('/deposito|tabungan|bpr|bank daerah|rekening|kredit/u', $cleanQ)) {
                if (str_contains($titleLower, 'deposito') || str_contains($titleLower, 'tabungan') || str_contains($agencyLower, 'bank')) {
                    $score += 120;
                }
            }

            // 3. SKCK & Kepolisian
            if (preg_match('/skck|catatan kepolisian|sidik jari/u', $cleanQ)) {
                if (str_contains($titleLower, 'skck') || str_contains($agencyLower, 'polres')) {
                    $score += 120;
                }
            }

            // 4. BPHTB & Waris
            if (preg_match('/bphtb|waris mandiri|pajak waris/u', $cleanQ)) {
                if (str_contains($titleLower, 'bphtb') || (str_contains($agencyLower, 'bapenda') && str_contains($titleLower, 'waris'))) {
                    $score += 120;
                }
            }

            // 5. PBB-P2 & Balik Nama Pajak
            if (preg_match('/pbb|sppt|stts|balik nama pbb|mutasi pbb|njop/u', $cleanQ)) {
                if (str_contains($titleLower, 'pbb') || str_contains($titleLower, 'sppt')) {
                    $score += 120;
                }
            }

            // 6. CPPOB / BPOM / PIRT / Pangan Olahan
            if (preg_match('/cppob|bpom|pangan|pirt|obat|kosmetik/u', $cleanQ)) {
                if (str_contains($titleLower, 'cppob') || str_contains($agencyLower, 'pom') || str_contains($titleLower, 'kosmetik')) {
                    $score += 120;
                }
            }

            // 7. Administrasi Kependudukan (KTP, KK, IKD, Akta)
            if (preg_match('/ktp|kartu keluarga|kia|ikd|akta/u', $cleanQ)) {
                if (str_contains($agencyLower, 'kependudukan') || str_contains($agencyLower, 'dukcapil') || str_contains($titleLower, 'ktp') || str_contains($titleLower, 'akta')) {
                    $score += 120;
                }
            }

            // 8. Paspor & Keimigrasian
            if (preg_match('/paspor|imigrasi|visa/u', $cleanQ)) {
                if (str_contains($agencyLower, 'imigrasi') || str_contains($titleLower, 'paspor')) {
                    $score += 120;
                }
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

        // If asking for general MPP hours, schedule, location or contacts, prioritize official MPP operational chunk
        if ($isGeneralMppInfo) {
            $mppOfficialChunk = [
                'page' => 254,
                'agency' => 'Mal Pelayanan Publik (MPP) & DPMPTSP Kab. Madiun',
                'title' => 'Standar Pelayanan, Jam Operasional & Kontak Resmi MPP',
                'content' => "Informasi Resmi Mal Pelayanan Publik (MPP) Kabupaten Madiun:\n"
                    . "Alamat Gedung: Jl. Aloon-Aloon Utara No. 4, Pangongangan, Kec. Manguharjo, Kota Madiun, Jawa Timur 63121.\n"
                    . "Jam Layanan: Buka setiap hari Senin s/d Jumat, pukul 08.00 – 15.00 WIB (Buka pukul 08.00 WIB, tutup pukul 15.00 WIB. Sabtu, Minggu, & Libur Nasional TUTUP).\n"
                    . "Kontak Kantor: Telepon (0351) 497206 / (0351) 4773980.\n"
                    . "Helpdesk Layanan Perizinan WhatsApp: 0811-3778-776.\n"
                    . "WhatsApp Layanan Pengaduan: 0811-3783-785.\n"
                    . "WhatsApp Layanan LKPM: 0851-5884-5871.\n"
                    . "Email Resmi: dpmptsp.madiunkab@gmail.com | Website: https://dpmptsp.id\n"
                    . "Mal Pelayanan Publik Kabupaten Madiun melayani 80+ standar pelayanan perizinan berusaha OSS RBA, administrasi kependudukan (KTP/KK), perpajakan daerah (PBB/BPHTB), SKCK, Paspor, BPJS, perbankan, dan pengadilan.",
                'score' => 9999
            ];
            array_unshift($scoredPages, $mppOfficialChunk);
        }

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
        
        $related[] = "Berapa jam operasional loket {$agency} di Gedung MPP Kabupaten Madiun?";
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
                    break;
                }
            }
        }

        // Merge custom non-SOP RAG documents from SQLite (PDFs, regulations, guidelines)
        try {
            $customDocs = Database::getAllRagDocumentContents();
            if (is_array($customDocs)) {
                foreach ($customDocs as $cd) {
                    $this->pages[] = [
                        'page' => "DOKUMEN-" . $cd['id'],
                        'agency' => $cd['agency'],
                        'title' => $cd['title'],
                        'content' => $cd['content']
                    ];
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        // Merge official perizinan catalog services into knowledge base (from SQLite DB with fallback to JSON)
        $items = [];
        try {
            $items = Database::getPerizinanList();
        } catch (\Throwable $e) {
            $items = [];
        }

        if (empty($items)) {
            $catalogPaths = [
                __DIR__ . '/../../storage/allPerizinan80.json',
                __DIR__ . '/../storage/allPerizinan80.json',
                'D:/Landing Page/Buku Saku/backend/storage/allPerizinan80.json'
            ];

            foreach ($catalogPaths as $cPath) {
                if (file_exists($cPath)) {
                    $rawCatalog = file_get_contents($cPath);
                    $decoded = json_decode($rawCatalog, true);
                    if (is_array($decoded) && !empty($decoded)) {
                        $items = $decoded;
                        break;
                    }
                }
            }
        }

        if (is_array($items) && !empty($items)) {
            foreach ($items as $item) {
                $adm = is_array($item['persyaratan']['administratif'] ?? null) ? implode("\n", $item['persyaratan']['administratif']) : '';
                $tek = is_array($item['persyaratan']['teknis'] ?? null) ? implode("\n", $item['persyaratan']['teknis']) : '';
                $mek = is_array($item['mekanismeProsedur'] ?? null) ? implode("\n", $item['mekanismeProsedur']) : '';
                $keywords = is_array($item['keywords'] ?? null) ? implode(', ', $item['keywords']) : '';

                $content = "Standar Pelayanan: {$item['title']}\n"
                    . "Instansi Pelaksana: {$item['instansi']}\n"
                    . "Jenis Layanan: {$item['jenisPerizinan']} | Waktu: {$item['waktuPelayanan']} | Biaya: {$item['biaya']}\n"
                    . "Persyaratan Administratif:\n{$adm}\n"
                    . "Persyaratan Teknis:\n{$tek}\n"
                    . "Alur Prosedur & Mekanisme:\n{$mek}\n"
                    . "Kata Kunci Pencarian: {$keywords}";

                $this->pages[] = [
                    'page' => $item['id'] == 101 ? 5 : ($item['id'] ?? 1),
                    'agency' => $item['instansi'],
                    'title' => $item['title'],
                    'content' => $content
                ];
            }
        }
    }
}
