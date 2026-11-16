# DOKUMENTASI LENGKAP & PANDUAN PENGEMBANGAN
# BUKU SAKU MPP AI KABUPATEN MADIUN
### MAL PELAYANAN PUBLIK — DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU (DPMPTSP) KABUPATEN MADIUN

Aplikasi **BUKU SAKU MPP AI** adalah asisten informasi digital terpadu berbasis AI & RAG (*Retrieval-Augmented Generation*) untuk seluruh layanan dan perizinan resmi di **Mal Pelayanan Publik (MPP) Kabupaten Madiun**. 

Aplikasi ini mengadopsi standar antarmuka minimalis, berwibawa, dan aksesibel seperti portal **AIDA UNS**, didesain dengan warna dominan **Hijau, Kuning, dan Putih**, mematuhi standar **Anti-AI Slop**, serta mengimplementasikan **Arsitektur Pemrosesan Hybrid 3 Layer dengan Guardrail Ketat**.

---

## 1. FITUR UTAMA SISTEM

1. **Antarmuka Chat-First Simpel (Ala AIDA UNS):**
   - Kolom pencarian perizinan cepat dengan tombol aksi berwarna kuning keemasan.
   - Contoh pertanyaan dinamis: *izin buka warung kopi, syarat SKCK baru, pengajuan BPHTB waris mandiri, pendaftaran NPWP Coretax, cetak KTP-el*.
   - Efek mengetik responsif (*typewriter effect*), kutipan sumber resmi (*source items*), dan accordion detail regulasi.
2. **Katalog Eksplorasi Topik (#telusuri):**
   - Pemetaan 82 jenis perizinan ke dalam 7 klaster layanan terpadu.
   - Pertanyaan siap klik tanpa perlu mengetik manual.
   - Panel panduan eskalasi WhatsApp Helpdesk MPP jika memerlukan verifikasi berkas langsung.
3. **Arsitektur Pemrosesan Hybrid 3 Layer:**
   - **Layer 1 (FAQ Match):** Pencocokan instan ke 82 SOP resmi (0 ms, hemat biaya token).
   - **Layer 2 (DocRAG):** Pengambilan potongan (*chunks*) regulasi resmi Pemkab Madiun, OSS RBA, BPOM, Bapenda, dan Dukcapil.
   - **Layer 3 (AI General):** Perumusan panduan komprehensif untuk pertanyaan terbuka warga (misal: syarat buka kedai kopi, izin apotek, sertifikasi halal).
4. **Kebijakan Guardrail:**
   - Identitas vendor LLM (OpenAI, Gemini, Claude, Llama) terkunci dan disamarkan secara konsisten sebagai *BUKU SAKU AI MPP Kab. Madiun*.
   - Filter ketat menangkal pertanyaan di luar ruang lingkup perizinan dan layanan publik.
5. **Dukungan Dua Mode (Full-Stack & Standalone Offline Ready):**
   - Frontend React dilengkapi dengan *Embedded Knowledge Engine & Simulation Mode*, sehingga dapat langsung didemokan secara interaktif bahkan sebelum database backend dinyalakan.

---

## 2. STRUKTUR DIREKTORI PROYEK

```
D:\Landing Page\Buku Saku\
├── README.md                           # Dokumentasi teknis & panduan instalasi
├── WORKFLOW_SISTEM.md                  # Alur teknis Hybrid 3 Layer & Guardrail
├── ANTI_AI_SLOP_GUIDE.md               # Standar visual Pemkab Madiun & Zero Emoji
├── PROMPT_MASTER_BUKU_SAKU.md          # Master prompt acuan pengembangan AI
├── PANDUAN_AUTO_DEPLOYMENT_VPS.md      # Panduan setup & deployment VPS aaPanel
├── package_deploy.py                   # Script otomatis pembuatan arsip deployment VPS
│
├── frontend/                           # APLIKASI WEB REACT + VITE + TAILWIND + BOOTSTRAP
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Header resmi Pemkab Madiun & MPP
│   │   │   ├── HeroSearch.tsx          # Hero tanya perizinan ala AIDA
│   │   │   ├── StatBand.tsx            # Strip statistik pelayanan
│   │   │   ├── ChatThread.tsx          # Thread percakapan & bubble AIDA
│   │   │   ├── TelusuriSection.tsx     # Katalog eksplorasi kategori perizinan
│   │   │   ├── PopulerSection.tsx      # Topik perizinan paling sering ditanya
│   │   │   ├── ContactFooter.tsx       # Kontak resmi MPP Caruban & Jam Kerja
│   │   │   └── AdminLoginModal.tsx     # Modal login admin MPP
│   │   ├── data/
│   │   │   └── perizinanMadiunData.ts  # Master data 82 perizinan resmi MPP Madiun
│   │   ├── types/
│   │   │   └── perizinan.ts
│   │   ├── App.tsx
│   │   └── index.css
│   └── ...
│
└── backend/                            # RESTFUL API LARAVEL 11
    ├── app/
    │   ├── Http/Controllers/Api/
    │   │   ├── ChatController.php      # Controller Hybrid 3 Layer & Guardrail
    │   │   ├── PerizinanController.php # Katalog data perizinan
    │   │   └── StatsController.php     # Statistik pertanyaan
    │   └── Services/
    │       ├── GuardrailService.php    # Masking vendor model & out-of-domain filter
    │       └── RagSearchService.php    # Retrieval engine perizinan
    ├── database/
    │   └── seeders/
    │       └── PerizinanMadiunSeeder.php # Seeder 82 izin lengkap
    └── routes/
        └── api.php
```

---

## 3. CARA MENJALANKAN SECARA LOKAL

### Menjalankan Frontend (React):
```bash
cd "D:\Landing Page\Buku Saku\frontend"
npm install
npm run dev
```
Akses di browser: `http://localhost:5173`

### Menjalankan Backend (Laravel):
```bash
cd "D:\Landing Page\Buku Saku\backend"
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
Akses API di: `http://localhost:8000/api`
