# MASTER PROMPT: PENGEMBANGAN SISTEM BUKU SAKU MPP AI KABUPATEN MADIUN
## MAL PELAYANAN PUBLIK KABUPATEN MADIUN — DPMPTSP KABUPATEN MADIUN

> **Instruksi untuk AI Assistant / Cursor / Claude Code / Windsurf:**
> Bangun aplikasi web terpadu **BUKU SAKU MPP AI** (Asisten Digital Pelayanan & Perizinan Terpadu) untuk **Mal Pelayanan Publik (MPP) Pemerintah Kabupaten Madiun** menggunakan **React + Vite + Tailwind CSS + Bootstrap (Frontend)** dan **Laravel 11 RESTful API (Backend)**.
> Seluruh implementasi wajib mematuhi panduan ketat **Anti-AI Slop**, **Desain Minimalis & Responsif seperti AIDA UNS**, dan **Arsitektur Pemrosesan Hybrid 3 Layer dengan Guardrail Identitas Model**.

---

## 1. IDENTITAS & KARAKTERISTIK PROYEK
* **Nama Sistem:** BUKU SAKU MPP AI (Asisten Digital Pelayanan & Perizinan Terpadu)
* **Institusi:** Pemerintah Kabupaten Madiun — Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP) — Mal Pelayanan Publik (MPP)
* **Website Acuan:** `https://bukusakumpp.madiunkab.go.id/`
* **Desain UI/UX:** Terinspirasi dari portal AIDA UNS (`https://aida.uns.ac.id/`) dengan dominasi warna **Hijau, Kuning, Putih**, bersih, modern, dan bebas emoji.
* **Arsitektur:**
  - **Frontend:** React 18, Vite, TypeScript, Tailwind CSS v3.4, Bootstrap 5 utilities, Lucide React Icons.
  - **Backend:** Laravel 11 (PHP 8.2+), REST API, Rate Limiter, Hybrid Search Engine, Sanitasi CSRF & Input.
  - **Database:** MySQL 8.x / SQLite ready untuk portabilitas tinggi.

---

## 2. STRICT DESIGN SYSTEM & IDENTITAS VISUAL
1. **Palet Warna:**
   - **Madiun Forest Green:** `#065F46` / `#064E3B`
   - **Madiun Vibrant Emerald:** `#059669` / `#10B981`
   - **MPP Action Yellow:** `#F59E0B` / `#EAB308` / `#FFDB07`
   - **Pure White & Slate:** `#FFFFFF` / `#F8FAFC`
2. **Tipografi:** Google Fonts `Plus Jakarta Sans` & `Inter`.
3. **Anti-AI Slop:** Bebas Unicode Emoji pada UI. Gunakan ikon vektor `lucide-react`.

---

## 3. CAKUPAN KNOWLEDGE BASE (82 PERIZINAN RESMI MPP MADIUN)
Tergolong ke dalam 7 Kategori Utama:
1. **Perizinan Berusaha & Kesehatan/POM:** Notifikasi Kosmetika, IP-CPPOB, CPOBAB Bertahap, CPKB Kosmetik, CDOB Distribusi Obat.
2. **Perpajakan & Pendapatan Daerah (Bapenda):** BPHTB (Jual Beli, Waris Mandiri, Pelepasan Hak), PBB-P2 (Pengurangan, Keberatan, Salinan, Pembetulan, Mutasi, Pecah Objek, NOP Baru), NPWPD Daerah.
3. **Administrasi Kependudukan (Disdukcapil):** KTP-el Baru/Rusak, Kartu Keluarga, KIA, Akta Kelahiran, Akta Kematian, Surat Pindah Datang/Keluar, IKD (Identitas Kependudukan Digital).
4. **Kepolisian & Hukum:** SKCK Baru & Perpanjangan (Polres Madiun), Rekomendasi Catatan Kriminal, Pengembalian Barang Bukti & Tilang (Kejari Kab Madiun), Pelayanan Hukum, Akta Cerai & Salinan Putusan (PA Kab Madiun), Surat Bebas Pidana (PN).
5. **Perpajakan Nasional (KPP Pratama):** Pendaftaran NPWP Coretax, SPT Tahunan Online & Kertas, Konsultasi Pajak.
6. **Sosial, Ketenagakerjaan & Pensiun:** Adopsi Anak, Bansos DTSEN (PKH, BPNT, PBI Daerah), Rekomendasi Biakes, BPJS Kesehatan & Ketenagakerjaan (Klaim JHT), Pensiun Taspen (Yatim/Piatu, Janda/Duda, THT, ASN Meninggal Aktif), Kartu Kuning AK 1, Rekomendasi PMI.
7. **Infrastruktur, Perbankan & Umum:** Site Plan Perumahan (Disperkim), Izin Pemakaman/Krematorium, Pendaftaran Haji (Kemenag), Pengesahan STNK Samsat, Bank Jatim, Bank Daerah Madiun (BPR), LPSE Pengadaan.
