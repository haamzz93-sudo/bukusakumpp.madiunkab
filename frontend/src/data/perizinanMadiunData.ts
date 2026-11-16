import { KategoriPerizinan, Perizinan } from '../types/perizinan';

export const KATEGORI_PERIZINAN: KategoriPerizinan[] = [
  {
    key: 'usaha',
    name: 'Perizinan Usaha, OSS & BPOM',
    desc: 'NIB OSS RBA, Notifikasi Kosmetika, CPPOB, CPKB, CDOB, Warung Kopi, UMKM.',
    iconName: 'Store',
    questionCount: 16,
    questions: [
      'Apa saja syarat dan alur izin buka warung kopi atau kafe di Kabupaten Madiun?',
      'Bagaimana cara mengajukan Rekomendasi sebagai Pemohon Notifikasi Kosmetika?',
      'Apa syarat Izin Penerapan Cara Produksi Pangan Olahan yang Baik (IP-CPPOB)?',
      'Bagaimana prosedur Pemenuhan Aspek CPOBAB Bertahap untuk obat bahan alam?',
      'Apa saja dokumen teknis dan administratif untuk Sertifikasi CPKB Kosmetik baru?',
      'Bagaimana alur Sertifikasi Cara Distribusi Obat yang Baik (CDOB) via OSS RBA?',
      'Berapa lama estimasi waktu verifikasi izin berusaha di Mal Pelayanan Publik Madiun?'
    ]
  },
  {
    key: 'pajak',
    name: 'Pajak Daerah & BPHTB (Bapenda)',
    desc: 'BPHTB Jual Beli & Waris, SPPT PBB-P2, Pengurangan, Pembetulan, dan NPWPD.',
    iconName: 'Landmark',
    questionCount: 18,
    questions: [
      'Bagaimana prosedur pengajuan BPHTB atas waris secara mandiri tanpa calo?',
      'Apa saja syarat pengajuan BPHTB transaksi jual beli tanah di Kabupaten Madiun?',
      'Bagaimana cara mengajukan permohonan pengurangan pembayaran PBB-P2?',
      'Apa langkah mengajukan keberatan atau pembetulan atas SPPT PBB-P2 yang salah?',
      'Bagaimana cara pendaftaran objek pajak PBB-P2 baru atau pemecahan bidang tanah?',
      'Bagaimana cara mendapatkan Salinan SPPT PBB-P2 atau Surat Keterangan NJOP?',
      'Apa syarat pendaftaran NPWPD Pajak Daerah lainnya ke Bapenda Kab Madiun?'
    ]
  },
  {
    key: 'dukcapil',
    name: 'Administrasi Kependudukan',
    desc: 'KTP-el, Kartu Keluarga, KIA, Akta Lahir & Kematian, Surat Pindah, dan IKD.',
    iconName: 'UserCheck',
    questionCount: 15,
    questions: [
      'Bagaimana cara aktivasi Identitas Kependudukan Digital (IKD) di MPP Madiun?',
      'Apa syarat penerbitan KTP-el baru bagi pemula usia 17 tahun di Kabupaten Madiun?',
      'Bagaimana alur dan syarat membuat Kartu Identitas Anak (KIA)?',
      'Apa dokumen yang diperlukan untuk penerbitan Kartu Keluarga (KK) baru?',
      'Bagaimana prosedur pembuatan Akta Kelahiran baru bagi bayi yang baru lahir?',
      'Apa syarat penerbitan Akta Kematian dan berapa lama waktu pelayanannya?',
      'Bagaimana prosedur pendaftaran surat pindah datang dan pindah keluar daerah?'
    ]
  },
  {
    key: 'hukum',
    name: 'Kepolisian, Kejaksaan & Pengadilan',
    desc: 'SKCK Baru & Perpanjangan, Tilang, Barang Bukti, Akta Cerai, dan Bebas Pidana.',
    iconName: 'ShieldCheck',
    questionCount: 14,
    questions: [
      'Apa saja syarat dan biaya penerbitan SKCK baru di loket Polres MPP Madiun?',
      'Bagaimana cara perpanjangan SKCK yang masa berlakunya sudah habis?',
      'Bagaimana alur pengambilan barang bukti dan pelayanan tilang di Kejaksaan Negeri?',
      'Apakah ada layanan pengantaran barang bukti gratis (PERINTIS) ke rumah?',
      'Bagaimana cara mengambil Akta Cerai atau Salinan Putusan di loket Pengadilan Agama?',
      'Apa syarat mendapatkan Surat Keterangan Tidak Pernah Dipidana dari Pengadilan Negeri?'
    ]
  },
  {
    key: 'kpp',
    name: 'Perpajakan Nasional (KPP Pratama)',
    desc: 'Aktivasi NIK jadi NPWP Coretax, Pelaporan SPT Tahunan, dan Konsultasi.',
    iconName: 'Receipt',
    questionCount: 8,
    questions: [
      'Bagaimana cara pendaftaran NPWP baru secara online via sistem Coretax DJP?',
      'Apa langkah pelaporan SPT Tahunan Orang Pribadi secara online di Coretax?',
      'Siapa saja yang masih diperbolehkan menyampaikan SPT Tahunan formulir kertas?',
      'Apakah tersedia layanan konsultasi perpajakan gratis di Mal Pelayanan Publik Madiun?'
    ]
  },
  {
    key: 'sosial',
    name: 'Sosial, Ketenagakerjaan & Pensiun',
    desc: 'DTSEN / Bansos, Rekomendasi Biakes, BPJS, Taspen Pensiun, Kartu Kuning AK 1.',
    iconName: 'HeartHandshake',
    questionCount: 17,
    questions: [
      'Bagaimana alur pengusulan data warga miskin ke DTSEN / Bansos PKH dan BPNT?',
      'Apa syarat rekomendasi Surat Keterangan Miskin untuk Biakes Jamkesda?',
      'Bagaimana prosedur klaim Jaminan Hari Tua (JHT) BPJS Ketenagakerjaan via Lapak Asik?',
      'Bagaimana syarat pengurusan pensiun janda, yatim piatu, dan uang duka wafat Taspen?',
      'Bagaimana alur pembuatan Kartu Antar Kerja (AK 1 / Kartu Kuning) di Disnaker?',
      'Apa syarat rekomendasi pengangkatan atau adopsi anak melalui Dinas Sosial?'
    ]
  },
  {
    key: 'umum',
    name: 'Infrastruktur, Perbankan & Umum',
    desc: 'Site Plan Disperkim, Paspor Imigrasi, Haji Kemenag, Samsat, dan Bank Jatim.',
    iconName: 'Building2',
    questionCount: 12,
    questions: [
      'Apa syarat permohonan paspor baru dan penggantian paspor di MPP Madiun?',
      'Bagaimana langkah pendaftaran porsi haji di loket Kemenag Kabupaten Madiun?',
      'Bagaimana pengesahan Site Plan perumahan pengembang melalui aplikasi Sipedalrum?',
      'Apa syarat pengesahan STNK dan pembayaran pajak kendaraan bermotor di Samsat?',
      'Layanan perbankan apa saja yang tersedia di Bank Jatim dan BPR Bank Daerah Madiun?'
    ]
  }
];

export const PERIZINAN_MADIUN_ITEMS: Perizinan[] = [
  // 1. Usaha Warung Kopi / UMKM (Special requested by Pak Darmawan!)
  {
    id: 101,
    title: 'Perizinan Berusaha Warung Kopi, Kedai Minuman & Restoran Skala Mikro Kecil (KBLI 56303)',
    slug: 'izin-buka-warung-kopi-kbli-56303',
    categoryId: 'usaha',
    categoryName: 'Perizinan Usaha, OSS & BPOM',
    instansi: 'DPMPTSP Kabupaten Madiun / Lembaga OSS BKPM RI',
    waktuPelayanan: 'Langsung Terbit (0 menit via OSS RBA)',
    biaya: 'Gratis (Rp0) — Tanpa Dipungut Biaya Retribusi',
    jenisPerizinan: 'Perizinan Berusaha Baru (Tingkat Risiko Rendah)',
    persyaratan: {
      administratif: [
        'KTP Pemilik Usaha / Penanggung Jawab',
        'Nomor Pokok Wajib Pajak (NPWP) Pemilik Usaha',
        'Nomor Telepon Aktif & Email untuk aktivasi akun OSS-RBA',
        'Nomor Induk Berusaha (NIB) dengan KBLI 56303 (Penyediaan Minuman / Warung Kopi / Kedai Kopi)',
        'Titik koordinat dan alamat lengkap tempat usaha di wilayah Kabupaten Madiun'
      ],
      teknis: [
        'Surat Pernyataan Kesanggupan Pengelolaan dan Pemantauan Lingkungan Hidup (SPPL) otomatis terintegrasi di OSS',
        'Pernyataan kesanggupan menjaga kebersihan dan sanitasi tempat usaha',
        'Jika memproduksi kopi bubuk/biji kemasan sendiri dengan merek dagang, mengurus Sertifikat Pemenuhan Komitmen SPP-IRT ke Dinas Kesehatan Kab. Madiun'
      ]
    },
    mekanismeProsedur: [
      'Pemohon membuat akun di sistem Online Single Submission (OSS RBA) melalui laman oss.go.id atau dibantu langsung oleh petugas loket DPMPTSP di Mal Pelayanan Publik (MPP) Caruban.',
      'Memilih menu Permohonan Baru, mengisi identitas usaha, luas tempat usaha warung kopi, dan modal usaha.',
      'Memilih KBLI 56303 (Restoran/Warung Kopi/Rumah Minum). Karena berstatus Risiko Rendah, izin yang dibutuhkan adalah NIB yang sekaligus berlaku sebagai izin operasional dan legalitas usaha.',
      'Menyetujui surat pernyataan mandiri terkait K3, tata ruang, dan lingkungan secara elektronik.',
      'NIB terbit seketika dalam format PDF bertanda tangan elektronik (BSrE), dapat dicetak mandiri atau dicetak di loket MPP Caruban.',
      'Warung kopi resmi legal dan siap beroperasi tanpa perlu izin tambahan lainnya.'
    ],
    portalUrl: 'https://oss.go.id',
    kbliList: [
      { code: '56303', name: 'Penyediaan Minuman / Kedai Kopi / Rumah Minum' },
      { code: '56101', name: 'Restoran / Rumah Makan' },
      { code: '56102', name: 'Warung Makan' }
    ],
    keywords: ['warung kopi', 'warkop', 'kedai kopi', 'kafe', 'usaha kopi', 'izin usaha mikro', 'kbli 56303', 'nib warung', 'mpp caruban', 'dpmptsp']
  },

  // 2. Permohonan Rekomendasi Pemohon Notifikasi Kosmetika (ID 82 di web)
  {
    id: 82,
    title: 'Izin PERMOHONAN REKOMENDASI SEBAGAI PEMOHON NOTIFIKASI KOSMETIKA',
    slug: 'permohonan-rekomendasi-sebagai-pemohon-notifikasi-kosmetika',
    categoryId: 'usaha',
    categoryName: 'Perizinan Usaha, OSS & BPOM',
    instansi: 'Loka POM / BPOM & DPMPTSP',
    waktuPelayanan: '0 menit Pelayanan',
    biaya: 'Sesuai Ketentuan PNBP BPOM (Pengajuan PB-UMKU via oss.go.id)',
    jenisPerizinan: 'Perizinan Baru',
    persyaratan: {
      administratif: [
        'NIB dengan KBLI sebagai berikut:\n• 46443 : Perdagangan Besar Kosmetik untuk Manusia.\n• 47111 : Perdagangan Eceran Berbagai Macam Barang yang Utamanya Makanan, Minuman atau Tembakau di Minimarket/Supermarket/Hypermarket.\n• 47112 : Perdagangan Eceran Berbagai Macam Barang yang Utamanya Makanan, Minuman atau Tembakau Bukan di Minimarket/Supermarket/Hypermarket (Bahan Alam).\n• 47191 : Perdagangan Eceran Berbagai Macam Barang yang Utamanya Bukan Makanan, Minuman atau Tembakau di Toserba (Department Store).\n• 47911 : Perdagangan Eceran melalui Media untuk Komoditi Makanan, Minuman, Tembakau, Kimia, Farmasi, Kosmetik dan Alat Laboratorium.\n• 47914 : Perdagangan Eceran melalui Media untuk Barang Campuran sebagaimana tersebut dalam 47911 s.d. 47913.\n• 47999 : Perdagangan Eceran bukan di Toko, Kios, Kaki Lima dan Los Pasar Lainnya ytdl.',
        'KTP Direktur dan/atau Pimpinan Perusahaan.',
        'NPWP Perusahaan/Pribadi.',
        'Pernyataan direksi atau pimpinan tidak terlibat dalam tindak pidana di bidang kosmetik.',
        'Status kepemilikan bangunan (milik sendiri/sewa dengan perjanjian sewa minimal 1 tahun) (kontrak sewa bangunan). Pengajuan PB-UMKU Rekomendasi sebagai Pemohon Notifikasi Kosmetika melalui oss.go.id.'
      ],
      teknis: [
        'Surat perjanjian kerja sama antara PJT dan direktur.',
        'KTP Penanggung Jawab Teknis.',
        'Kualifikasi penanggung jawab teknis ditunjukkan dengan ijazah (Importir minimal S1 bidang ilmu farmasi, ilmu kedokteran, ilmu biologi atau ilmu kimia; Usaha Perorangan/Badan Usaha yang melakukan kontrak produksi minimal tenaga teknis kefarmasian).',
        'Terkait pengemasan sekunder/pelabelan:\n• Prosedur Tertulis Pelabelan.\n• Form Catatan Pelabelan.\n• Prosedur Tertulis Pengemasan Sekunder.\n• Form Catatan Pengemasan Sekunder.',
        'Terkait Penanganan Sampel Pertinggal:\n• Prosedur Tertulis Penanganan Sampel Pertinggal.\n• Form Catatan Penanganan Sampel Pertinggal.',
        'Terkait Penanganan Produk Kembalian:\n• Prosedur Penanganan Produk Kembalian.\n• Form Catatan Penanganan Produk Kembalian.',
        'Terkait penyimpanan:\n• Prosedur Tertulis Pengadaan, Penerimaan dan Penyimpanan Kosmetika.\n• Form Catatan Pengadaan Kosmetika.\n• Form catatan persediaan/kartu stok dari setiap Kosmetika (kaidah FIFO/FEFO, minimal memuat keterangan nama produk, nomor batch, tanggal penerimaan dan tanggal pengeluaran, nama penerima, jumlah penerimaan dan jumlah pengeluaran).\n• Tempat penyimpanan dirancang dan disesuaikan untuk memastikan kondisi dan kapasitas penyimpanan memadai.\n• Kosmetika disimpan sesuai dengan kondisi penyimpanan yang tercantum dalam penandaan.\n• Tempat penyimpanan kering, tidak panas, tidak lembab, suhu kamar dan terhindar dari sinar matahari langsung.',
        'Terkait sanitasi:\n• Prosedur tertulis pembersihan sarana.\n• Form catatan pembersihan sarana.\n• Prosedur pengendalian hama.\n• Form catatan pengendalian hama.'
      ]
    },
    mekanismeProsedur: [
      'Pemohon mengajukan Perizinan Berusaha untuk Menunjang Kegiatan Usaha (PB UMKU) Rekomendasi Pemohon Notifikasi Kosmetika dan mengunggah dokumen pendukung secara daring (online) melalui laman https://oss.go.id.',
      'Petugas melakukan evaluasi terhadap kelengkapan dokumen permohonan yang diunggah. Bila dokumen tidak lengkap maka permohonan dikembalikan.',
      'Apabila dokumen lengkap, pemohon akan dihubungi oleh petugas untuk memastikan kesiapan dan penjadwalan audit sarana.',
      'Saat audit sarana, pemohon mendapatkan salinan Berita Acara Pemeriksaan. Pemohon akan mendapatkan surat hasil pemeriksaan sarana setelah audit sarana dilaksanakan.',
      'Rekomendasi Pemohon Notifikasi Kosmetika diterbitkan apabila hasil pemeriksaan sarana memenuhi ketentuan atau hasil pemeriksaan sarana tidak memenuhi ketentuan dalam hal dokumen pengadaan dan distribusi kosmetik serta persyaratan sanitasi sarana dan tempat penyimpanan produk.',
      'Pemohon menyampaikan tambahan data dan/atau tindakan perbaikan dan pencegahan terhadap temuan audit sarana paling lambat 20 (dua puluh) hari kerja setelah surat hasil pemeriksaan sarana dan/atau hasil evaluasi terhadap tambahan data dan/atau tindakan perbaikan dan pencegahan diterima oleh pemohon.',
      'Tindakan perbaikan dan pencegahan terhadap temuan audit sarana dinyatakan selesai setelah hasil evaluasi CAPA memenuhi ketentuan.'
    ],
    portalUrl: 'https://oss.go.id',
    keywords: ['kosmetik', 'notifikasi kosmetika', 'bpom', 'pjt', 'skincare', '46443', 'pb umku', 'loka pom']
  },

  // 3. Pengaduan Obat dan Makanan (ID 81 di web)
  {
    id: 81,
    title: 'Pengaduan Masyarakat dan Informasi Obat dan Makanan',
    slug: 'pengaduan-masyarakat-dan-informasi-obat-dan-makanan',
    categoryId: 'usaha',
    categoryName: 'Perizinan Usaha, OSS & BPOM',
    instansi: 'Loka POM / BPOM di MPP Kabupaten Madiun',
    waktuPelayanan: '0 menit Pelayanan (Respon Langsung)',
    biaya: 'Gratis',
    jenisPerizinan: 'Layanan Pengaduan & Informasi Publik',
    persyaratan: {
      umum: [
        'Identitas Pemohon (nama, nomor telepon, email, alamat, KTP)',
        'Identitas produk yang diadukan (nama produk, produsen, foto sampel)',
        'Tempat mendapatkan produk (nama sarana, alamat, tanggal pembelian)',
        'Tujuan permintaan informasi / aduan'
      ]
    },
    mekanismeProsedur: [
      'Pemohon menyampaikan pengaduan melalui loket MPP, telepon, WhatsApp, atau email.',
      'Petugas menerima pengaduan dan memverifikasi kelengkapan bukti.',
      'Petugas melakukan penelaahan dan investigasi teknis bila diperlukan.',
      'Penyampaian hasil tindak lanjut dan solusi kepada pemohon.'
    ],
    keywords: ['pengaduan obat', 'makanan berbahaya', 'bpom madiun', 'lapor kosmetik ilegal']
  },

  // 4. IP-CPPOB (ID 80 di web)
  {
    id: 80,
    title: 'Izin Penerapan Cara Produksi Pangan Olahan yang Baik (IP-CPPOB)',
    slug: 'izin-penerapan-cara-produksi-pangan-olahan-yang-baik-ip-cppob',
    categoryId: 'usaha',
    categoryName: 'Perizinan Usaha, OSS & BPOM',
    instansi: 'BPOM & Dinas Ketahanan Pangan',
    waktuPelayanan: '0 menit Pelayanan (Registrasi OSS-RBA)',
    biaya: 'Sesuai Regulasi PNBP / Gratis UMK',
    jenisPerizinan: 'Perizinan Baru',
    persyaratan: {
      administratif: [
        'Pengajuan PB-UMKU melalui oss.go.id yang terintegrasi dengan e-sertifikasi.pom.go.id',
        'NIB beserta lampiran kegiatan usaha',
        'Bukti nilai investasi dan KBLI di OSS'
      ],
      teknis: [
        'Surat Pemenuhan Komitmen Penerapan CPPOB (Risiko Rendah) atau hasil penilaian mandiri minimal B (Risiko Sedang)',
        'Peta lokasi sarana dan denah tata letak (layout) ruang pengolahan',
        'Skema dan penjelasan proses produksi pangan',
        'Dokumen deskripsi produk, bahan baku, BTP, dan kemasan',
        'Panduan mutu pengolahan air, sanitasi, limbah, dan pengendalian hama (FIFO/FEFO)'
      ]
    },
    mekanismeProsedur: [
      'Pemohon mengajukan permohonan melalui oss.go.id terintegrasi e-sertifikasi.pom.go.id.',
      'Verifikasi administrasi oleh petugas BPOM.',
      'Pemeriksaan sarana produksi maksimal 10 hari kerja.',
      'Evaluasi tindakan perbaikan (CAPA) jika ada temuan.',
      'Penerbitan Surat Keputusan IP-CPPOB.'
    ],
    portalUrl: 'https://e-sertifikasi.pom.go.id',
    keywords: ['cppob', 'pangan olahan', 'makanan minuman', 'produksi pangan', 'bpom', 'spp-irt']
  },

  // 5. CPOBAB Bertahap (ID 79 di web)
  {
    id: 79,
    title: 'Pemenuhan Aspek Cara Pembuatan Obat Bahan Alam yang Baik Secara Bertahap (CPOBAB)',
    slug: 'pemenuhan-aspek-cara-pembuatan-obat-bahan-alam-yang-baik-secara-bertahap-cpobab',
    categoryId: 'usaha',
    categoryName: 'Perizinan Usaha, OSS & BPOM',
    instansi: 'Badan Pengawas Obat dan Makanan (BPOM)',
    waktuPelayanan: '4 menit Pelayanan',
    biaya: 'Sesuai Ketentuan PNBP',
    jenisPerizinan: 'Perizinan Baru',
    persyaratan: {
      administratif: [
        'Surat permohonan resmi perusahaan',
        'Pengajuan PB-UMKU Sertifikat CPOBAB Bertahap melalui oss.go.id terintegrasi e-sertifikasi.pom.go.id'
      ],
      teknis: [
        'Denah tata ruang bangunan sesuai persyaratan CPOBAB',
        'Surat komitmen pemenuhan aspek mutu',
        'Dokumen mutu: Tahap I (Sanitasi & Dokumentasi), Tahap II (Manajemen mutu, produksi, penyimpanan), Tahap III (Inspeksi diri, penanganan keluhan)'
      ]
    },
    mekanismeProsedur: [
      'Pengajuan PB-UMKU di e-sertifikasi.pom.go.id.',
      'Evaluasi kelengkapan dokumen dan penjadwalan audit sarana.',
      'Audit lapangan dan penyerahan Berita Acara Pemeriksaan.',
      'Perbaikan CAPA maksimal 20 hari kerja (maksimal 3 kali siklus).',
      'Penerbitan Rekomendasi Sertifikat CPOBAB Bertahap.'
    ],
    keywords: ['jamu', 'herbal', 'obat bahan alam', 'cpobab', 'bpom']
  },

  // 6. CPKB Kosmetik (ID 78 di web)
  {
    id: 78,
    title: 'Sertifikasi Pemenuhan Aspek Cara Pembuatan Kosmetik yang Baik (CPKB)',
    slug: 'sertifikasi-pemenuhan-aspek-cara-pembuatan-kosmetik-yang-baik-cpkb',
    categoryId: 'usaha',
    categoryName: 'Perizinan Usaha, OSS & BPOM',
    instansi: 'BPOM RI',
    waktuPelayanan: '4 menit Pelayanan',
    biaya: 'Sesuai PNBP',
    jenisPerizinan: 'Perizinan Baru & Perpanjangan',
    persyaratan: {
      administratif: ['Surat permohonan', 'Persetujuan Denah Bangunan Industri Kosmetika', 'Memiliki Penanggung Jawab Teknis sesuai perundang-undangan'],
      teknis: ['Dokumen penerapan sistem manajemen mutu CPKB', 'Surat persetujuan fasilitas bersama jika ada']
    },
    mekanismeProsedur: [
      'Pengajuan PB-UMKU di oss.go.id.',
      'Verifikasi berkas dan audit sarana oleh BPOM.',
      'Pemberian CAPA perbaikan maksimal 20 hari kerja.',
      'Penerbitan Analisis Hasil Pemeriksaan & Sertifikat CPKB.'
    ],
    keywords: ['pabrik kosmetik', 'cpkb', 'maklon kosmetik', 'bpom']
  },

  // 7. CDOB Distribusi Obat (ID 77 di web)
  {
    id: 77,
    title: 'Sertifikasi Cara Distribusi Obat yang Baik (CDOB)',
    slug: 'sertifikasi-cara-distribusi-obat-yang-baik-cdob',
    categoryId: 'usaha',
    categoryName: 'Perizinan Usaha, OSS & BPOM',
    instansi: 'BPOM & Pedagang Besar Farmasi (PBF)',
    waktuPelayanan: '4 menit Pelayanan',
    biaya: 'Sesuai PNBP',
    jenisPerizinan: 'Perizinan Baru & Perubahan',
    persyaratan: {
      administratif: ['Sertifikat Distribusi Farmasi (PBF)', 'Surat Izin Praktik Apoteker (SIPA)', 'Pernyataan direksi bebas tindak pidana obat'],
      teknis: ['Denah alur pengelolaan obat', 'Daftar alat gudang terkalibrasi', 'Kebijakan mutu dan SOP']
    },
    mekanismeProsedur: ['Pendaftaran akun OSS-RBA', 'Verifikasi BPOM', 'Inspeksi gudang dan CAPA', 'Penerbitan Sertifikat CDOB'],
    keywords: ['distribusi obat', 'pbf', 'apotek', 'cdob', 'farmasi']
  },

  // 8. Pengajuan BPHTB Jual Beli (ID 74 di web)
  {
    id: 74,
    title: 'Pelayanan Pengajuan Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB) Jual Beli',
    slug: 'pengajuan-bphtb-jual-beli',
    categoryId: 'pajak',
    categoryName: 'Pajak Daerah & BPHTB (Bapenda)',
    instansi: 'Badan Pendapatan Daerah (Bapenda) Kabupaten Madiun',
    waktuPelayanan: '3 bulan Pelayanan (Maksimal Proses Selesai)',
    biaya: '5% x (NPOP - NPOPTKP) sesuai Perda Pajak Madiun',
    jenisPerizinan: 'Pelayanan Pajak Daerah',
    persyaratan: {
      administratif: [
        'Gambar Objek Pajak (foto tanah pekarangan, sawah, atau rumah)',
        'SPPT dan Bukti Bayar PBB Tahun Terakhir (lunas)',
        'Sertifikat Tanah asli dan fotokopi',
        'KTP dan KK Pembeli & Penjual',
        'Surat Kuasa jika diwakilkan'
      ]
    },
    mekanismeProsedur: [
      'Notaris/PPAT mendaftarkan berkas pengajuan secara online melalui SIMBPHTB Bapenda Kab Madiun.',
      'Petugas pelayanan menyetujui berkas dan melakukan verifikasi administrasi/lapangan.',
      'Penerbitan Berita Acara Pemeriksaan (BAP) nilai pajak terhutang.',
      'Wajib Pajak melakukan pembayaran BPHTB di Bank Jatim sesuai kode billing.',
      'Validasi SSPD BPHTB lunas di loket Bapenda MPP Madiun.'
    ],
    keywords: ['bphtb', 'jual beli tanah', 'pajak tanah', 'bapenda madiun', 'simbphtb']
  },

  // 9. BPHTB Waris Mandiri (ID 72 di web)
  {
    id: 72,
    title: 'Prosedur Pelayanan Pengajuan BPHTB Atas Waris Secara Mandiri',
    slug: 'prosedur-pelayanan-pengajuan-bphtb-atas-waris-secara-mandiri',
    categoryId: 'pajak',
    categoryName: 'Pajak Daerah & BPHTB (Bapenda)',
    instansi: 'Bapenda Kabupaten Madiun',
    waktuPelayanan: '7 jam Pelayanan',
    biaya: 'Dihitung berdasarkan NPOPTKP Waris (Umumnya Rp300 Juta)',
    jenisPerizinan: 'Pelayanan Pajak Mandiri',
    persyaratan: {
      administratif: [
        'KTP dan KK seluruh ahli waris',
        'Surat Keterangan Waris (mengetahui Kepala Desa dan Camat)',
        'Surat Pembagian Waris bermeterai',
        'Sertifikat Tanah asli/salinan',
        'Surat Kematian dari desa/Dukcapil',
        'Surat Bebas Sengketa mengetahui seluruh ahli waris dan Kepala Desa',
        'SPPT PBB tahun berjalan lunas',
        'Nomor WhatsApp dan email aktif'
      ]
    },
    mekanismeProsedur: [
      'Wajib Pajak datang ke loket Bapenda MPP Caruban menyerahkan berkas.',
      'Petugas pelayanan mendaftarkan ke sistem SIMBPHTB username Mandiri Waris.',
      'Verifikasi berkas & penerbitan BAP (Berita Acara Pemeriksaan) yang dikirim via WhatsApp.',
      'Pembayaran di Bank Jatim jika ada nilai terutang (bisa Rp0 jika di bawah NPOPTKP).',
      'Petugas memvalidasi SSPD Waris sebagai syarat balik nama di BPN.'
    ],
    keywords: ['bphtb waris', 'tanah warisan', 'waris mandiri', 'pajak waris', 'bapenda']
  },

  // 10. Pengurangan PBB-P2 (ID 70 di web)
  {
    id: 70,
    title: 'Permohonan Pengurangan Pajak Bumi dan Bangunan (PBB-P2)',
    slug: 'permohonan-pengurangan-pbb-p2',
    categoryId: 'pajak',
    categoryName: 'Pajak Daerah & BPHTB (Bapenda)',
    instansi: 'Bapenda Kabupaten Madiun',
    waktuPelayanan: '3 bulan Pelayanan',
    biaya: 'Gratis',
    jenisPerizinan: 'Keringanan Pajak',
    persyaratan: {
      administratif: [
        'Surat Permohonan Pengurangan (formulir tersedia di loket Bapenda)',
        'Fotokopi KTP dan KK Wajib Pajak',
        'Fotokopi SPPT PBB-P2 tahun berjalan dan bukti bayar tahun lalu',
        'Surat Keterangan tidak mampu dari Desa/Kelurahan atau SK Pensiun/Daftar Penghasilan'
      ]
    },
    mekanismeProsedur: [
      'Pengajuan berkas ke loket Bapenda di Mal Pelayanan Publik.',
      'Petugas meneliti kelengkapan dan menerbitkan Bukti Penerimaan Surat.',
      'Penelitian lapangan oleh tim penilai Bapenda.',
      'Penerbitan Surat Keputusan Pengurangan PBB-P2.'
    ],
    keywords: ['diskon pbb', 'keringanan pajak', 'pengurangan pbb', 'pensiunan']
  },

  // 11. Salinan & Pembetulan SPPT PBB-P2 (ID 69, 67)
  {
    id: 67,
    title: 'Pengajuan Pembetulan / Salinan SPPT PBB-P2',
    slug: 'pengajuan-pembetulan-sppt-pbb-p2',
    categoryId: 'pajak',
    categoryName: 'Pajak Daerah & BPHTB (Bapenda)',
    instansi: 'Bapenda Kabupaten Madiun',
    waktuPelayanan: '2 hari Pelayanan',
    biaya: 'Gratis',
    jenisPerizinan: 'Pembetulan Data',
    persyaratan: {
      administratif: [
        'Surat Permohonan dan Formulir SPOP/LSPOP',
        'Fotokopi KTP/KK Pemohon',
        'Asli SPPT PBB-P2 yang salah cetak nama/luas',
        'Fotokopi Sertifikat Tanah atau Akta Tanah',
        'Surat Keterangan dari Kepala Desa/Lurah'
      ]
    },
    mekanismeProsedur: ['Penyerahan berkas ke loket MPP', 'Verifikasi data sistem Bapenda', 'Pencetakan SK Pembetulan & SPPT Baru'],
    keywords: ['sppt hilang', 'sppt salah', 'pembetulan pbb', 'salinan sppt', 'nop']
  },

  // 12. SKCK Baru (ID 59 di web)
  {
    id: 59,
    title: 'Penerbitan Surat Keterangan Catatan Kepolisian (SKCK) Baru',
    slug: 'penerbitan-skck-baru',
    categoryId: 'hukum',
    categoryName: 'Kepolisian, Kejaksaan & Pengadilan',
    instansi: 'Polres Madiun di Loket MPP',
    waktuPelayanan: '15 menit Pelayanan',
    biaya: 'Rp30.000 (PNBP Resmi Polri)',
    jenisPerizinan: 'Perizinan Baru',
    persyaratan: {
      administratif: [
        'Fotokopi KTP dan Kartu Keluarga (KK)',
        'Fotokopi Akta Lahir / Ijazah Terakhir',
        'Pas foto 4x6 latar belakang merah 4 lembar (tampak muka utuh, berpakaian sopan)',
        'Rumus sidik jari (bisa rekam di loket jika belum punya)',
        'Tanda bukti kepesertaan aktif program BPJS Kesehatan / JKN'
      ]
    },
    mekanismeProsedur: [
      'Pemohon membawa berkas ke loket Polres Madiun di MPP Caruban.',
      'Petugas melakukan pencatatan dan pengambilan sidik jari (Unit Ident Reskrim).',
      'Pemeriksaan kesesuaian berkas dan catatan kriminal kepolisian.',
      'Membayar biaya PNBP Rp30.000.',
      'SKCK dicetak dan diserahkan (estimasi 15 menit).'
    ],
    keywords: ['skck baru', 'polres madiun', 'sidik jari', 'catatan kepolisian', 'syarat skck']
  },

  // 13. SKCK Perpanjangan (ID 60 di web)
  {
    id: 60,
    title: 'Penerbitan SKCK Perpanjangan',
    slug: 'penerbitan-skck-perpanjangan',
    categoryId: 'hukum',
    categoryName: 'Kepolisian, Kejaksaan & Pengadilan',
    instansi: 'Polres Madiun di Loket MPP',
    waktuPelayanan: '15 menit Pelayanan',
    biaya: 'Rp30.000 (PNBP Polri)',
    jenisPerizinan: 'Perpanjangan',
    persyaratan: {
      administratif: [
        'SKCK lama asli atau fotokopi yang telah dilegalisasi',
        'Fotokopi KTP dan Kartu Keluarga',
        'Pas foto 4x6 latar merah 4 lembar',
        'Bukti aktif BPJS Kesehatan / JKN'
      ]
    },
    mekanismeProsedur: ['Menyerahkan SKCK lama dan berkas', 'Verifikasi data', 'Pembayaran PNBP', 'SKCK baru diterbitkan'],
    keywords: ['perpanjang skck', 'skck mati', 'polres madiun']
  },

  // 14. Tilang & Barang Bukti Kejaksaan (ID 57, 58 di web)
  {
    id: 57,
    title: 'Pelayanan Tilang dan Pengembalian Barang Bukti (Layanan PERINTIS Gratis)',
    slug: 'pelayanan-tilang-dan-pengembalian-barang-bukti',
    categoryId: 'hukum',
    categoryName: 'Kepolisian, Kejaksaan & Pengadilan',
    instansi: 'Kejaksaan Negeri Kabupaten Madiun',
    waktuPelayanan: '7 jam Pelayanan',
    biaya: 'Denda Tilang sesuai Putusan Sidang (Pengantaran Barang Bukti Rp0 Gratis)',
    jenisPerizinan: 'Layanan Hukum & Tilang',
    persyaratan: {
      administratif: [
        'Surat Tilang asli dari pihak Kepolisian',
        'Bukti Pembayaran denda tilang (via Bank/Kantor Pos)',
        'Fotokopi KTP Pemilik dan STNK/SIM yang disita',
        'Surat Kuasa bermeterai Rp10.000 jika diwakilkan'
      ]
    },
    mekanismeProsedur: [
      'Pembayaran denda tilang dilakukan setelah tanggal sidang.',
      'Pengambilan mandiri di loket Kejari MPP atau Kantor Kejaksaan Negeri Kab. Madiun.',
      'Khusus barang bukti kendaraan/tilang, tersedia layanan PERINTIS (Pengantaran Barang Bukti Gratis) ke rumah wilayah Kota/Kabupaten Madiun via WhatsApp 0851-1740-5460.'
    ],
    keywords: ['tilang', 'barang bukti', 'perintis', 'kejari madiun', 'denda tilang']
  },

  // 15. Akta Cerai & Salinan Putusan (ID 55 di web)
  {
    id: 55,
    title: 'Pengambilan Produk Akta Cerai, Salinan Putusan & Salinan Penetapan',
    slug: 'pengambilan-produk-akta-cerai-dan-salinan-putusan',
    categoryId: 'hukum',
    categoryName: 'Kepolisian, Kejaksaan & Pengadilan',
    instansi: 'Pengadilan Agama Kabupaten Madiun',
    waktuPelayanan: '50 menit Pelayanan',
    biaya: 'PNBP Rp10.000',
    jenisPerizinan: 'Layanan Peradilan',
    persyaratan: {
      administratif: [
        'KTP asli pihak yang berperkara (wajib hadir sendiri, tidak dapat diwakilkan)',
        'Buku Nikah asli (apabila masih memiliki)',
        'Bukti nomor perkara Pengadilan Agama'
      ]
    },
    mekanismeProsedur: [
      'Menghubungi WhatsApp Layanan Informasi PA Kab Madiun 08113628118 untuk membuat janji temu di MPP.',
      'Pihak yang berperkara hadir sendiri sesuai jadwal yang ditentukan.',
      'Membayar PNBP Rp10.000 di loket.',
      'Penyerahan kutipan Akta Cerai dan Salinan Putusan.'
    ],
    keywords: ['akta cerai', 'pengadilan agama', 'salinan putusan', 'cerai madiun']
  },

  // 16. Pendaftaran NPWP Online Coretax (ID 51 di web)
  {
    id: 51,
    title: 'Pendaftaran NPWP Baru dan Aktivasi NIK via Coretax DJP',
    slug: 'pendaftaran-npwp-coretax-djp',
    categoryId: 'kpp',
    categoryName: 'Perpajakan Nasional (KPP Pratama)',
    instansi: 'KPP Pratama Madiun / Ditjen Pajak',
    waktuPelayanan: '4 menit Pelayanan',
    biaya: 'Gratis',
    jenisPerizinan: 'Pendaftaran Wajib Pajak Baru',
    persyaratan: {
      administratif: [
        'WNI: KTP (NIK aktif) dan Kartu Keluarga',
        'WNA: Paspor dan KITAS/KITAP',
        'Badan Usaha: Akta Pendirian, NPWP Pengurus, dan NIB'
      ]
    },
    mekanismeProsedur: [
      'Akses portal coretaxdjp.pajak.go.id atau dibantu di meja layanan KPP Pratama MPP Madiun.',
      'Pilih jenis Wajib Pajak dan pilih opsi aktivasi NIK sebagai NPWP.',
      'Lengkapi data diri, Klasifikasi Lapangan Usaha (KLU), dan sumber penghasilan.',
      'Input kode OTP yang dikirim ke email atau nomor handphone.',
      'Kartu NPWP elektronik langsung aktif dan terbit.'
    ],
    portalUrl: 'https://coretaxdjp.pajak.go.id',
    keywords: ['npwp baru', 'coretax', 'nik jadi npwp', 'pajak kpp pratama', 'daftar npwp']
  },

  // 17. Pelaporan SPT Tahunan Online (ID 53 di web)
  {
    id: 53,
    title: 'Pelaporan SPT Tahunan Orang Pribadi & Badan Secara Online',
    slug: 'pelaporan-spt-tahunan-online',
    categoryId: 'kpp',
    categoryName: 'Perpajakan Nasional (KPP Pratama)',
    instansi: 'KPP Pratama Madiun',
    waktuPelayanan: '4 menit Pelayanan',
    biaya: 'Gratis',
    jenisPerizinan: 'Kewajiban Perpajakan Tahunan',
    persyaratan: {
      administratif: ['Akun Coretax / DJP Online aktif', 'Bukti Potong Pajak (Form 1721-A1/A2 dari kantor/instansi)', 'Data harta dan hutang akhir tahun']
    },
    mekanismeProsedur: ['Login akun Coretax di MPP', 'Buat konsep SPT Tahunan', 'Verifikasi status nihil/kurang bayar', 'Kirim SPT dan terima Bukti Penerimaan Elektronik (BPE)'],
    keywords: ['lapor spt', 'spt tahunan', 'pajak nihil', 'coretax online']
  },

  // 18. KTP-el Baru & IKD (ID 27, 34 di web)
  {
    id: 27,
    title: 'Penerbitan KTP-el Baru dan Aktivasi Identitas Kependudukan Digital (IKD)',
    slug: 'penerbitan-ktp-el-baru-dan-aktivasi-ikd',
    categoryId: 'dukcapil',
    categoryName: 'Administrasi Kependudukan',
    instansi: 'Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil) Kab Madiun',
    waktuPelayanan: '15 menit Pelayanan',
    biaya: 'Gratis (Rp0)',
    jenisPerizinan: 'Pelayanan Adminduk',
    persyaratan: {
      administratif: [
        'Telah berusia 17 tahun, sudah kawin, atau pernah kawin',
        'Fotokopi Kartu Keluarga (KK)',
        'Untuk IKD: Membawa smartphone (Android minimal 7.0 / iOS minimal 11.0), email aktif, dan nomor HP aktif'
      ]
    },
    mekanismeProsedur: [
      'Pemohon membawa KK ke loket Disdukcapil di MPP Caruban.',
      'Perekaman biometrik (foto wajah, iris mata, sidik jari).',
      'Pencetakan fisik KTP-el dan aktivasi QR code IKD di smartphone pemohon.',
      'Penyerahan KTP-el dan akun IKD aktif.'
    ],
    keywords: ['ktp baru', 'ikd', 'rekam ktp', 'disdukcapil madiun', 'ktp 17 tahun']
  },

  // 19. Akta Kelahiran & Akta Kematian (ID 31, 32 di web)
  {
    id: 31,
    title: 'Penerbitan Kutipan Akta Kelahiran & Akta Kematian Baru',
    slug: 'penerbitan-akta-kelahiran-dan-kematian-baru',
    categoryId: 'dukcapil',
    categoryName: 'Administrasi Kependudukan',
    instansi: 'Disdukcapil Kabupaten Madiun',
    waktuPelayanan: '15 menit Pelayanan',
    biaya: 'Gratis (Rp0)',
    jenisPerizinan: 'Pencatatan Sipil',
    persyaratan: {
      administratif: [
        'Surat Keterangan Lahir (dari RS/Bidan/Puskesmas) atau Surat Keterangan Kematian dari Dokter/Desa',
        'Buku Nikah orang tua / kutipan akta perkawinan',
        'Kartu Keluarga asli dan KTP-el kedua orang tua / ahli waris',
        'KTP-el 2 orang saksi'
      ]
    },
    mekanismeProsedur: [
      'Pemeriksaan berkas di loket Disdukcapil MPP.',
      'Entry data ke Database SIAK terpusat.',
      'Verifikasi Kabid Capil & Tanda Tangan Elektronik (TTE) Kadis Dukcapil.',
      'Penerbitan kutipan Akta Kelahiran/Kematian sekaligus pembaruan Kartu Keluarga baru.'
    ],
    keywords: ['akta kelahiran', 'akta kematian', 'buat akte', 'bayi baru lahir', 'dukcapil']
  },

  // 20. Permohonan Paspor Baru & Penggantian (ID 23, 24 di web)
  {
    id: 23,
    title: 'Pelayanan Permohonan Paspor Baru & Penggantian Habis Masa Berlaku',
    slug: 'permohonan-paspor-baru-dan-penggantian',
    categoryId: 'umum',
    categoryName: 'Infrastruktur, Perbankan & Umum',
    instansi: 'Kantor Imigrasi di Unit Layanan Paspor MPP Madiun',
    waktuPelayanan: '3 - 5 hari kerja Pelayanan',
    biaya: 'Paspor Biasa Rp350.000 / Paspor Elektronik Rp650.000 (PNBP Imigrasi)',
    jenisPerizinan: 'Dokumen Perjalanan Luar Negeri',
    persyaratan: {
      administratif: [
        'KTP-el asli dan fotokopi',
        'Kartu Keluarga asli dan fotokopi',
        'Akta Kelahiran / Ijazah / Buku Nikah (nama, tanggal lahir, nama orang tua wajib sama)',
        'Paspor lama (bagi yang perpanjangan/penggantian)',
        'Bukti pendaftaran antrean di aplikasi M-Paspor'
      ]
    },
    mekanismeProsedur: [
      'Pemohon mendaftar antrean online via aplikasi M-Paspor di smartphone.',
      'Datang ke Unit Layanan Paspor MPP Madiun membawa berkas asli.',
      'Pemeriksaan berkas, wawancara, foto biometrik wajah, dan rekam sidik jari.',
      'Melakukan pembayaran biaya paspor di Bank/Kantor Pos/m-banking.',
      'Paspor selesai dan dapat diambil 3-4 hari kerja setelah pembayaran.'
    ],
    portalUrl: 'https://mpaspor.imigrasi.go.id',
    keywords: ['paspor', 'imigrasi madiun', 'bikin paspor', 'm-paspor', 'paspor umroh']
  },

  // 21. Adopsi Anak & Bantuan Sosial DTSEN (ID 50, 47 di web)
  {
    id: 47,
    title: 'Pengusulan dan Penerbitan Data Tunggal Sosial Ekonomi Nasional (DTSEN) / Bansos PKH, BPNT, PBI',
    slug: 'pengusulan-data-tunggal-sosial-ekonomi-nasional-dtsen-bansos',
    categoryId: 'sosial',
    categoryName: 'Sosial, Ketenagakerjaan & Pensiun',
    instansi: 'Dinas Sosial Kabupaten Madiun',
    waktuPelayanan: '3 hari Pelayanan (Verifikasi SLRT & Desa)',
    biaya: 'Gratis (Rp0)',
    jenisPerizinan: 'Layanan Sosial Kemasyarakatan',
    persyaratan: {
      administratif: [
        'Fotokopi KTP dan Kartu Keluarga Kabupaten Madiun',
        'Surat Keterangan Miskin dari Desa mengetahui Camat',
        'Hasil cek lokasi/survei lapangan fasilitator Sistem Layanan Rujukan Terpadu (SLRT)'
      ]
    },
    mekanismeProsedur: [
      'Pemohon datang ke loket Dinsos di Mal Pelayanan Publik menyerahkan berkas.',
      'Pengecekan di sistem SIKS-NG Kemensos apakah sudah terdaftar atau belum.',
      'Jika belum, fasilitator SLRT menindaklanjuti survei lapangan ke rumah pemohon.',
      'Musyawarah Desa (Musdes) dan input usulan ke SIKS-NG Kemensos RI untuk penetapan Bansos.'
    ],
    keywords: ['bansos', 'dtsen', 'pkh', 'bpnt', 'pbi bpjs', 'surat miskin', 'dinsos']
  },

  // 22. Pendaftaran Haji Kemenag (ID 20 di web)
  {
    id: 20,
    title: 'Pelayanan Pendaftaran Haji dan Validasi Porsi Haji',
    slug: 'kemenag-pendaftaran-haji-dan-validasi-porsi',
    categoryId: 'umum',
    categoryName: 'Infrastruktur, Perbankan & Umum',
    instansi: 'Kementerian Agama (Kemenag) Kabupaten Madiun',
    waktuPelayanan: '55 menit Pelayanan',
    biaya: 'Setoran Awal BPIH Rp25.000.000 ke Bank Penerima Setoran',
    jenisPerizinan: 'Layanan Ibadah Haji',
    persyaratan: {
      administratif: [
        'Bukti setoran awal BPIH dari Bank Penerima Setoran (BPS) BPIH',
        'Fotokopi KTP dan Kartu Keluarga',
        'Fotokopi Akta Lahir / Ijazah / Buku Nikah',
        'Surat keterangan sehat dan info golongan darah dari Puskesmas'
      ]
    },
    mekanismeProsedur: [
      'Membuka rekening tabungan haji dan menyetor setoran awal Rp25 juta di Bank Syariah.',
      'Membawa bukti setoran ke loket Kemenag di MPP Madiun (Gedung PLHUT).',
      'Verifikasi berkas, foto biometrik ulang, dan penerbitan Surat Pendaftaran Pergi Haji (SPPH) serta Nomor Porsi resmi.'
    ],
    keywords: ['daftar haji', 'porsi haji', 'kemenag madiun', 'setoran haji', 'bpih']
  },

  // 23. Pengesahan Site Plan Perumahan (ID 11, 4 di web)
  {
    id: 11,
    title: 'Pengesahan Gambar Rencana Tapak (Site Plan) Perumahan',
    slug: 'disperkim-pengesahan-site-plan-perumahan',
    categoryId: 'umum',
    categoryName: 'Infrastruktur, Perbankan & Umum',
    instansi: 'Dinas Perumahan dan Kawasan Permukiman (Disperkim) & DPMPTSP',
    waktuPelayanan: '7 hari Pelayanan',
    biaya: 'Gratis',
    jenisPerizinan: 'Perizinan Teknis Pengembang',
    persyaratan: {
      administratif: [
        'KTP dan NPWP Direktur dan Badan Usaha (pindai asli)',
        'Akta Pendirian Perusahaan dan NIB Pengembang',
        'Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) / Keterangan Rencana Kabupaten',
        'Dokumen Lingkungan Hidup (AMDAL / UKL-UPL / SPPL)',
        'Sertipikat tanah dan bukti lunas PBB tahun terakhir'
      ],
      teknis: [
        'Gambar Rencana Tapak / Site Plan format .dwg (AutoCAD) dan format .pdf ukuran A3 landscape',
        'Surat kesanggupan menyediakan sarana utilitas (listrik, air bersih, sampah, saluran air hujan)',
        'Penyediaan lahan tempat pemakaman paling sedikit 2% dari luas perumahan'
      ]
    },
    mekanismeProsedur: [
      'Pelaku usaha membuat akun di aplikasi Sipedalrum (dpmptsp.id).',
      'Mengunggah berkas teknis dan gambar site plan.',
      'Verifikasi oleh tim teknis Disperkim dan survey lapangan.',
      'Pengesahan oleh Kepala Disperkim dan penerbitan surat pengesahan melalui DPMPTSP.'
    ],
    keywords: ['site plan', 'perumahan', 'developer', 'disperkim', 'sipedalrum', 'makam 2 persen']
  },

  // 24. Pensiun Taspen ASN (ID 35, 36, 37, 38, 39, 40 di web)
  {
    id: 38,
    title: 'Pelayanan Klaim Tabungan Hari Tua (THT), Pensiun Pertama, Pensiun Janda/Duda & Uang Duka Wafat',
    slug: 'pelayanan-klaim-taspen-pensiun-asn',
    categoryId: 'sosial',
    categoryName: 'Sosial, Ketenagakerjaan & Pensiun',
    instansi: 'PT Taspen (Persero) di Loket MPP Madiun',
    waktuPelayanan: '45 menit Pelayanan',
    biaya: 'Gratis (Rp0)',
    jenisPerizinan: 'Layanan Jaminan Hari Tua ASN',
    persyaratan: {
      administratif: [
        'Mengisi Formulir Permintaan Pembayaran (FPP)',
        'Fotokopi Surat Keputusan (SK) Pensiun',
        'Lembar asli Surat Keterangan Pemberhentian Pembayaran (SKPP) dari Pemda',
        'Fotokopi KTP dan Buku Rekening pemohon',
        'Fotokopi Akta Kematian (jika pensiun janda/duda atau uang duka wafat)'
      ]
    },
    mekanismeProsedur: ['Menyerahkan berkas ke loket Taspen MPP', 'Verifikasi kelengkapan berkas klim', 'Proses otorisasi dan pencairan dana ke rekening peserta'],
    keywords: ['taspen', 'pensiun', 'tht', 'uang duka', 'asn madiun', 'pensiun janda']
  },

  // 25. Kartu Kuning AK 1 Disnaker (ID 6 di web)
  {
    id: 6,
    title: 'Penerbitan Kartu Tanda Pencari Kerja (Kartu Kuning / AK 1)',
    slug: 'penerbitan-kartu-antar-kerja-ak-1',
    categoryId: 'sosial',
    categoryName: 'Sosial, Ketenagakerjaan & Pensiun',
    instansi: 'Dinas Tenaga Kerja dan Perindustrian (Disnaker)',
    waktuPelayanan: '15 menit Pelayanan',
    biaya: 'Gratis (Rp0)',
    jenisPerizinan: 'Pelayanan Ketenagakerjaan',
    persyaratan: {
      administratif: [
        'Fotokopi KTP Pemohon (warga Kabupaten Madiun)',
        'Fotokopi Ijazah Terakhir dan Transkrip Nilai',
        'Pas foto berwarna 3x4 sebanyak 2 lembar',
        'Telah mendaftarkan akun di portal SiapKerja Kemnaker RI (karirhub.kemnaker.go.id)'
      ]
    },
    mekanismeProsedur: [
      'Pencari kerja mendaftar di portal SiapKerja.',
      'Datang ke loket Disnaker di MPP Madiun membawa berkas persyaratan.',
      'Verifikasi data dan pencetakan fisik kartu AK 1 yang langsung disahkan.'
    ],
    keywords: ['kartu kuning', 'ak 1', 'cari kerja', 'disnaker madiun', 'siapkerja']
  }
];
