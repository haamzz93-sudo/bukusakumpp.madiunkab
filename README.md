# DOKUMENTASI RESMI & PANDUAN PENGEMBANGAN
# BUKU SAKU DIGITAL MPP AI KABUPATEN MADIUN
### MAL PELAYANAN PUBLIK — DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU (DPMPTSP) KABUPATEN MADIUN

**Buku Saku Digital MPP AI Kabupaten Madiun** adalah platform asisten pelayanan publik cerdas berbasis AI & RAG (*Retrieval-Augmented Generation*) terintegrasi yang menyajikan panduan standar pelayanan resmi dari seluruh instansi di Mal Pelayanan Publik (MPP) Kabupaten Madiun secara transparan, akurat, dan cepat (0 menit hingga hitungan detik).

Platform ini dilengkapi dengan teknologi **Kloning Suara Resmi Bapak Bupati Madiun (Voicebox Open-Source AI)**, **Panduan Suara Interaktif 8 Langkah (VoiceAI Tour)**, dan pemrosesan cerdas tanpa perantara berstandar *Zero AI Slop*.

---

## 1. FITUR UTAMA SISTEM

1. **Kloning Suara Resmi Bapak Bupati Madiun (Voicebox AI):**
   - Menghasilkan narasi lisan berwibawa, santun, dan profesional dengan intonasi khas Bapak Bupati Madiun (*H. Hari Wuryanto, S.H., M.Ak.*).
   - Menggunakan formula naskah ringkasan eksekutif (*5-Point Briefing Formula*): Sapaan hangat, Syarat dokumen utama, Alur prosedur, Waktu & Biaya resmi, serta Penutup santun.
   - Dilengkapi *query caching* instan (< 0,02 detik) untuk pertanyaan umum warga dan *fallback* ke neural speech jika server sintesis offline.

2. **Panduan Suara Interaktif 8 Langkah (*VoiceAI Tour*):**
   - Panduan keliling situs otomatis yang menyorot 8 fitur utama Buku Saku dengan narasi audio resmi Bupati Madiun dan teks karaoke berjalan.
   - Tata letak responsif adaptif (*Split-Screen & Mobile Friendly*) yang otomatis mendeteksi posisi elemen agar tidak menutupi tombol mengambang atau bilah navigasi.

3. **Pencarian Standar Pelayanan Berbasis RAG (DocRAG & Intent Matcher):**
   - Pencarian cerdas menjangkau seluruh SOP resmi DPMPTSP (OSS-RBA), Disdukcapil (KTP, KK, IKD), Bapenda (BPHTB, PBB-P2), Polres Madiun (SKCK, SIM), ATR/BPN, hingga BPR Bank Daerah.
   - Respon instan untuk sapaan dasar (*halo*, *hai*, *selamat pagi*) dan pertanyaan jam operasional MPP (Senin – Jumat 08.00 – 15.00 WIB).

4. **Desain Bersih & Elegan (*Anti-AI Slop*):**
   - Mengusung tema resmi *Civic Emerald & Obsidian Dark*, bebas dari emoji berlebihan dan elemen robotik yang mengganggu.
   - Pemutar pesan suara (*Voice Note Player*) minimalis dengan kendali Play/Pause, pengatur kecepatan, dan animasi gelombang audio dinamis.

5. **Tombol Melayang Siaga 24 Jam (*Floating Action Dock*):**
   - Akses cepat ke WhatsApp Helpdesk Resmi MPP (0811-3778-776) dan tombol rekam suara langsung dari setiap halaman.

---

## 2. ARSITEKTUR & TEKNOLOGI

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **Backend:** PHP 8.2+ / REST API, Python (Audio Synthesizer & NLP), SQLite / MySQL.
* **AI & NLP Engine:** 
  - Google Gemini API (`gemini-3.1-flash-lite` & `gemini-1.5-flash`) untuk penalaran RAG & peringkasan naskah eksekutif.
  - Voicebox Open-Source (Qwen-TTS CUDA) untuk kloning suara asli Bapak Bupati Madiun.
  - Edge-TTS (`id-ID-ArdiNeural`) sebagai mesin audio cadangan.
* **Web Server & Reverse Proxy:** Nginx dengan HTTP/2 dan SSL Let's Encrypt.
* **Process Manager:** PM2 (Node.js & PHP Backend Worker).

---

## 3. STRUKTUR DIREKTORI PROYEK

```
bukusaku.unsmadiun.id/
├── README.md                           # Dokumentasi teknis proyek
├── PANDUAN_AUTO_DEPLOYMENT_VPS.md      # Panduan operasional deployment VPS
├── package_deploy.py                   # Script otomatis packaging update zip
│
├── frontend/                           # APLIKASI WEB REACT + VITE
│   ├── public/
│   │   ├── audio/                      # Audio panduan suara tour 8 langkah
│   │   └── avatar/                     # Aset foto & klip audio referensi Bupati
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Bilah navigasi & tombol panduan suara
│   │   │   ├── HeroSearch.tsx          # Kolom pencarian & input suara
│   │   │   ├── ChatThread.tsx          # Tampilan percakapan & jawaban SOP
│   │   │   ├── VoiceNotePlayer.tsx     # Pemutar pesan suara resmi Bupati
│   │   │   ├── VoiceAiWelcomeTour.tsx  # Modal tour interaktif 8 langkah
│   │   │   ├── TelusuriSection.tsx     # Katalog 82+ standar pelayanan
│   │   │   └── ContactFooter.tsx       # Alamat fisik MPP & jam operasional
│   │   └── ...
│   └── package.json
│
└── backend/                            # RESTFUL API & LAYANAN AUDIO
    ├── app/
    │   ├── Http/Controllers/Api/
    │   │   └── ChatController.php      # Routing RAG, Guardrail, & Voice Cache
    │   └── Services/
    │       ├── AudioService.php        # Engine TTS, Voicebox GPU & Naskah Bupati
    │       ├── GuardrailService.php    # Filter domain & deteksi sapaan/jadwal
    │       └── RagSearchService.php    # Pencocokan dokumen standar pelayanan
    ├── public/
    │   ├── api/audio/                  # Berkas audio publik siap streaming
    │   └── index.php                   # Router API backend
    ├── storage/
    │   ├── audio/                      # Cache audio permanen suara Bupati
    │   └── data/                       # Dokumen PDF SOP resmi MPP 2026
    └── .env.example
```

---

## 4. PANDUAN INSTALASI & UPDATE DI VPS (UBUNTU 22.04 LTS / aaPanel)

### A. Persyaratan Sistem VPS:
* Ubuntu 22.04 LTS (atau 24.04 LTS)
* Node.js v20.x atau lebih baru & npm
* PHP 8.2+ dengan ekstensi: `php-curl`, `php-mbstring`, `php-xml`
* Python 3.10+ (dengan `edge-tts` untuk fallback audio)
* PM2 (`npm install -g pm2`)
* Nginx Web Server

### B. Perintah 1 Baris Update Git & Re-Build (Rekomendasi):
Jalankan perintah ini di Terminal VPS Anda:
```bash
cd /www/wwwroot/bukusaku.unsmadiun.id && \
git pull origin main && \
pip3 install edge-tts --break-system-packages && \
cd frontend && npm install && npm run build && \
cd .. && \
chmod -R 775 backend/storage backend/public/api/audio && \
pm2 restart all && pm2 save
```

### C. Konfigurasi Nginx Reverse Proxy (aaPanel):
Tambahkan konfigurasi berikut pada file konfigurasi Nginx situs Anda:

```nginx
server {
    listen 80;
    server_name bukusaku.unsmadiun.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bukusaku.unsmadiun.id;

    ssl_certificate /etc/letsencrypt/live/bukusaku.unsmadiun.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bukusaku.unsmadiun.id/privkey.pem;

    root /www/wwwroot/bukusaku.unsmadiun.id/frontend/dist;
    index index.html;

    # Frontend Single Page Application (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend & Streaming Audio
    location /api/ {
        proxy_pass http://127.0.0.1:8002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

---

## 5. CARA MENJALANKAN DI KOMPUTER LOKAL (DEVELOPMENT)

### 1. Menjalankan Backend PHP:
```bash
cd "backend"
php -S 127.0.0.1:8002 -t public public/index.php
```

### 2. Menjalankan Frontend React:
```bash
cd "frontend"
npm install
npm run dev
```
Akses di browser pada: `http://localhost:5173`

### 3. Menjalankan Voicebox CUDA (Opsional untuk Generate Suara Baru):
```bash
cd "voicebox-main"
.\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 17493
```

---

## 6. LISENSI & HAK CIPTA

Dikembangkan untuk **Mal Pelayanan Publik (MPP) & Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP) Pemerintah Kabupaten Madiun**. Seluruh data standar pelayanan bersumber dari dokumen resmi Standar Operasional Prosedur (SOP) Pelayanan Publik Kabupaten Madiun Tahun 2026.
