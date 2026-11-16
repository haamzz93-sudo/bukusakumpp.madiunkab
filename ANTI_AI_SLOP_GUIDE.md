# PANDUAN DESAIN EKSEKUTIF & ANTI-AI SLOP
## SISTEM ASISTEN DIGITAL BUKU SAKU MPP KABUPATEN MADIUN
### MAL PELAYANAN PUBLIK — DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU (DPMPTSP) KABUPATEN MADIUN

Dokumen ini merupakan standar wajib desain antarmuka (*UI/UX Design System*) untuk seluruh pengembang yang membangun atau merawat aplikasi **BUKU SAKU MPP AI KABUPATEN MADIUN**. Standar ini dirancang untuk menjamin tampilan berwibawa, beridentitas resmi Pemerintah Kabupaten Madiun, sederhana dan bersih seperti AIDA, serta bebas total dari ciri khas klise AI yang tidak profesional (*Anti-AI Slop*).

---

## 1. PALET WARNA RESMI PEMKAB MADIUN & MAL PELAYANAN PUBLIK

Aplikasi wajib menggunakan palet warna kepemerintahan yang berwibawa dengan dominasi **Hijau, Kuning, dan Putih**:

| Token Warna | Nilai HEX | Peruntukan Utama | Catatan Penerapan |
| :--- | :--- | :--- | :--- |
| **Madiun Forest Deep** | `#064E3B` / `#065F46` | Header primer, background hero dark/light, aksen judul, bar navigasi atas | Memberikan wibawa resmi institusi Pemkab Madiun |
| **Madiun Emerald Vibrant** | `#047857` / `#059669` / `#10B981` | Tombol simpan/aksi sekunder, badge status "Aktif", status dot | Aksen hijau segar simbol pelayanan prima |
| **MPP Gold Yellow** | `#F59E0B` / `#EAB308` / `#FACC15` | Tombol CTA utama ("Tanya"), tombol submit, highlight query, border sorotan | Kontras tinggi, menarik perhatian aksi utama |
| **Pure White Canvas** | `#FFFFFF` | Latar card perizinan, bubble chat bot, kontainer formulir, dropdown menu | Bersih, elegan, dan kontras tinggi |
| **Slate Clean Light** | `#F8FAFC` / `#F1F5F9` | Latar belakang halaman (*page background* mode terang) | Menghindari silau mata saat membaca teks perizinan panjang |
| **Neutral Border** | `#E2E8F0` / `#CBD5E1` | Garis batas tabel, input field border, pemisah section | Halus (*subtle*), tidak mencolok |
| **Dark Slate Surface** | `#0F172A` / `#022C22` | Mode gelap / latar belakang hero malam | Mengikuti nuansa malam AIDA UNS bernada forest-cyan |

> [!CAUTION]
> **DILARANG KERAS:**
> - Menggunakan gradasi warna klise AI generator: `from-indigo-500 to-purple-600`, `from-fuchsia-500 to-pink-500`, atau gradasi neon sejenis.
> - Menggunakan dark mode hitam pekat AMOLED (`#000000`) sebagai tampilan standar aplikasi pemerintahan.
> - Menggunakan warna primer merah atau ungu yang tidak relevan dengan identitas Pemkab Madiun.

---

## 2. ATURAN BEBAS EMOJI (STRICT ZERO SYSTEM EMOJIS)

Dilarang keras menggunakan emoji sistem Unicode (seperti 🚀, ✨, 🔥, 💡, 📊, 📋, 🌾, 🔔, dll.) pada:
- Tombol aksi (*Button text*)
- Judul menu atau navigasi (*Navbar / Sidebar menu*)
- Judul bab atau heading markdown (*H1, H2, H3*)
- Badge status atau chip label
- Header tabel data

### Standar Pengganti:
Wajib menggunakan **Vektor Ikon Resmi** dari pustaka `lucide-react`:
- Perizinan & OSS: `<FileCheck />`, `<Briefcase />`, `<Store />`, `<FileText />`
- Pajak Daerah & Pertanahan: `<Landmark />`, `<Coins />`, `<Scale />`, `<MapPin />`
- Kependudukan: `<Users />`, `<UserCheck />`, `<CreditCard />`
- Kepolisian & Hukum: `<ShieldCheck />`, `<Gavel />`, `<AlertTriangle />`
- Layanan Sosial & Kesehatan: `<HeartHandshake />`, `<Activity />`, `<Building2 />`
- Waktu & SLA Pelayanan: `<Clock />`, `<Timer />`, `<Calendar />`
- Navigasi & Aksi: `<Search />`, `<ArrowRight />`, `<Copy />`, `<ThumbsUp />`, `<ThumbsDown />`, `<ExternalLink />`

---

## 3. TIPOGRAFI & HIERARKI TEKS

- **Heading Font:** `Plus Jakarta Sans` / `Outfit` (Bobot: 600 Semi-Bold, 700 Bold). Menampilkan ketegasan, modernitas, dan integritas birokrasi yang adaptif.
- **Body & Data Font:** `Inter` (Bobot: 400 Regular, 500 Medium, 600 Semi-Bold). Optimal untuk keterbacaan teks persyaratan izin dan prosedur langkah demi langkah.
- **Monospace Font (KBLI, NIK, NIB, Kode Billing):** `JetBrains Mono` / `Consolas` dengan tracking halus.

---

## 4. KOMPONEN UI BERWIBAWA SEPERTI AIDA UNS

1. **Struktur Hero Chat-First:**
   - Pill instansi di atas judul: "Layanan Resmi Mal Pelayanan Publik Kabupaten Madiun".
   - Headline ramah: "Halo, saya BUKU SAKU AI. Mau tanya apa soal perizinan di Kabupaten Madiun?"
   - Kolom pencarian/pertanyaan tunggal dengan tombol "Tanya" kuning keemasan.
   - Quick pills/chips contoh pertanyaan ("Coba: izin buka warung kopi, syarat SKCK baru, pengajuan BPHTB waris...").
   - Strip statistik 3-4 indikator: "82+ jenis perizinan", "Gratis tanpa biaya", "24 jam kapan saja".

2. **Mode Navigasi Telusuri (#telusuri):**
   - Katalog berbasis kategori (Perizinan Berusaha, Perpajakan/Retribusi, Administrasi Kependudukan, Kepolisian & Kejaksaan, dll.).
   - Setiap kategori menampilkan daftar pertanyaan siap jawab dengan panah kanan.
   - Panel samping kanan: Kontak WhatsApp Helpdesk Resmi MPP Kabupaten Madiun.

3. **Format Jawaban AI (Anti-Halusinasi & Terverifikasi):**
   - Indikator asal jawaban: "Dari SOP resmi MPP Kabupaten Madiun" atau "Dirangkum AI dari dokumen standar pelayanan".
   - Accordion rujukan: "Lihat sumber dokumen (nama izin, OPD pengampu, waktu pelayanan, dasar hukum)".
   - Disclaimer resmi penjaminan data.
   - Tombol copy jawaban dan tombol feedback relevansi (jempol atas/bawah).
   - Tombol eskalasi WhatsApp bila memerlukan verifikasi langsung oleh petugas loket MPP.
