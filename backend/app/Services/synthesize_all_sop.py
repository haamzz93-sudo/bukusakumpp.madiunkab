import urllib.request
import json
import os
import time

storage_dir = r"D:\Landing Page\Buku Saku\backend\storage\audio"
public_dir = r"D:\Landing Page\Buku Saku\backend\public\api\audio"
os.makedirs(storage_dir, exist_ok=True)
os.makedirs(public_dir, exist_ok=True)

sop_audio_list = [
    {
        "filename": "tts_q_d6eb57660a25e9c2.mp3",
        "name": "Warung Kopi (KBLI 56303)",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait perizinan berusaha warung kopi KBLI lima enam tiga nol tiga, silakan siapkan KTP, NPWP, serta data lokasi usaha. Prosedurnya daftar mandiri secara daring melalui sistem O S S R B A. Waktu layanan langsung terbit atau nol menit dengan biaya gratis seratus persen. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_b8c10a8285c451cf.mp3",
        "name": "Penerbitan SKCK Baru",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait penerbitan S K C K baru, silakan siapkan dokumen utama seperti KTP, Kartu Keluarga, dan rumus sidik jari. Prosedurnya datang langsung ke loket kepolisian di M P P Madiun. Waktu layanan lima belas menit dengan biaya tiga puluh ribu rupiah. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_bphtb_official.mp3",
        "name": "Validasi BPHTB Bapenda",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait validasi pengesahan B P H T B, silakan siapkan KTP pemohon, bukti bayar P B B lunas, dan berkas peralihan hak. Prosedurnya ajukan berkas ke loket Bapenda di M P P Madiun. Waktu layanan satu hari kerja dengan biaya pengesahan gratis seratus persen. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_pbb_official.mp3",
        "name": "PBB-P2 Bapenda",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait layanan pajak bumi dan bangunan perdesaan dan perkotaan, silakan siapkan fotokopi KTP, bukti kepemilikan tanah, dan S P P T tahun lalu. Prosedurnya datang langsung ke loket Bapenda di M P P Madiun. Waktu layanan cepat dan tanpa dipungut biaya retribusi. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_paspor_official.mp3",
        "name": "Paspor Imigrasi",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait pengurusan paspor baru atau penggantian paspor, silakan siapkan KTP elektronik, Kartu Keluarga, dan akta kelahiran atau ijazah. Prosedurnya daftar antrean daring melalui aplikasi M-Paspor dan datang ke loket imigrasi di M P P Madiun. Biaya sesuai ketentuan resmi P N B P. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_ktp_official.mp3",
        "name": "KTP dan Dukcapil",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait layanan administrasi kependudukan seperti KTP elektronik, Kartu Keluarga, dan Identitas Kependudukan Digital, silakan bawa dokumen pendukung ke loket Disdukcapil di M P P Madiun. Waktu layanan cepat dan seluruh proses gratis seratus persen tanpa pungutan liar. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_oss_official.mp3",
        "name": "NIB & Perizinan Berusaha OSS",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait penerbitan Nomor Induk Berusaha atau N I B untuk pelaku usaha mikro kecil, silakan siapkan KTP, NPWP, dan nomor WhatsApp aktif. Prosedurnya daftar mandiri melalui sistem O S S R B A atau datang ke loket D P M P T S P di M P P Madiun. Waktu layanan langsung terbit dengan biaya nol rupiah atau gratis. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_halal_official.mp3",
        "name": "Sertifikasi Halal Kemenag",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait pengajuan sertifikasi halal produk usaha makanan dan minuman, silakan siapkan data pelaku usaha, N I B, dan daftar bahan baku. Prosedurnya daftar daring melalui aplikasi SiHalal Kemenag atau kunjungi loket Kemenag di M P P Madiun. Biaya program reguler atau gratis melalui skema self declare. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_q_sim_official.mp3",
        "name": "Perpanjangan SIM Polres Madiun",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait perpanjangan Surat Izin Mengemudi SIM A dan SIM C, silakan siapkan KTP asli, SIM lama yang masih berlaku, serta surat hasil tes kesehatan dan psikologi. Prosedurnya datang langsung ke loket pelayanan SIM di M P P Madiun. Biaya sesuai tarif resmi P N B P. Rincian selengkapnya dapat disimak pada teks panduan di layar. Terima kasih. "
    },
    {
        "filename": "tts_bupati_general_sop.mp3",
        "name": "Panduan Umum Pelayanan Publik Bupati Madiun (Universal Fallback)",
        "text": "Halo Bapak dan Ibu warga Kabupaten Madiun. Terkait pertanyaan pelayanan publik yang Anda sampaikan, rincian berkas dan alur selengkapnya telah kami rangkum pada teks panduan di layar. Petugas loket kami di Gedung Mal Pelayanan Publik Kabupaten Madiun juga siaga melayani Anda dengan sepenuh hati. Terima kasih. "
    }
]

print(f"Starting Voicebox synthesis for {len(sop_audio_list)} essential SOP voices...", flush=True)

for i, item in enumerate(sop_audio_list, 1):
    fname = item["filename"]
    storage_path = os.path.join(storage_dir, fname)
    public_path = os.path.join(public_dir, fname)

    # If already exists and size > 50KB, check if we need to regenerate
    if os.path.exists(storage_path) and os.path.getsize(storage_path) > 80000:
        print(f"[{i}/{len(sop_audio_list)}] Already exists: {item['name']} ({fname}, {os.path.getsize(storage_path)} bytes)", flush=True)
        if not os.path.exists(public_path) or os.path.getsize(public_path) != os.path.getsize(storage_path):
            with open(storage_path, "rb") as sf, open(public_path, "wb") as pf:
                pf.write(sf.read())
        continue

    print(f"[{i}/{len(sop_audio_list)}] Synthesizing {item['name']} ({fname})...", flush=True)
    t0 = time.time()
    
    payload = {
        "model": "qwen-tts-0.6B",
        "voice": "Bupati Madiun Asli",
        "input": item["text"],
        "response_format": "mp3"
    }
    
    req = urllib.request.Request(
        "http://127.0.0.1:17493/v1/audio/speech",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            audio_data = resp.read()
            with open(storage_path, "wb") as f:
                f.write(audio_data)
            with open(public_path, "wb") as f:
                f.write(audio_data)
            duration = time.time() - t0
            print(f"    Done {fname}: {len(audio_data)} bytes in {duration:.1f}s", flush=True)
    except Exception as e:
        print(f"    Error {fname}: {e}", flush=True)

print("All essential SOP Bupati audio files completed!", flush=True)
