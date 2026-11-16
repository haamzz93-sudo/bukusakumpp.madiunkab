# PANDUAN PENGEMBANGAN, UPDATE REVISI & AUTO-DEPLOYMENT VPS
## BUKU SAKU MPP AI KABUPATEN MADIUN
### MAL PELAYANAN PUBLIK — DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU (DPMPTSP) KABUPATEN MADIUN

Dokumen ini adalah instruksi operasional standar bagi Developer untuk melakukan deployment, setup lingkungan produksi, dan pembaruan berkas pada server VPS (Ubuntu 22.04 LTS / aaPanel).

---

## 1. SPESIFIKASI INFRASTRUKTUR SERVER

* **Target Domain:** `bukusaku.madiunkab.go.id` atau subdomain pengujian `mpp.unsmadiun.id`
* **Root Directory Server:** `/www/wwwroot/bukusaku-mpp`
* **Frontend Runtime:** Node.js 20+ / PM2 di Port `3002`
* **Backend Runtime:** PHP 8.2-FPM / Laravel 11 di Port `8002`
* **Database:** MySQL 8.x (`bukusaku_mpp`)
* **Reverse Proxy:** Nginx dengan SSL Let's Encrypt aktif

---

## 2. PROSEDUR UPDATE CEPAT VIA ZIP (RINGAN & INSTAN)

### A. Jika Terjadi Perubahan Frontend (`frontend/`):
1. Lakukan build di lokal:
   ```bash
   cd "D:\Landing Page\Buku Saku\frontend"
   npm run build
   ```
2. Buat arsip update menggunakan script:
   ```bash
   python "D:\Landing Page\Buku Saku\package_deploy.py" --target frontend
   ```
3. Eksekusi perintah terminal 1 baris di VPS:
   ```bash
   cd /www/wwwroot/bukusaku-mpp/frontend && unzip -o update_frontend.zip && pm2 restart bukusaku-frontend && pm2 save
   ```

### B. Jika Terjadi Perubahan Backend (`backend/`):
1. Buat arsip update backend:
   ```bash
   python "D:\Landing Page\Buku Saku\package_deploy.py" --target backend
   ```
2. Eksekusi perintah terminal 1 baris di VPS:
   ```bash
   cd /www/wwwroot/bukusaku-mpp/backend && unzip -o update_backend.zip && php artisan config:clear && php artisan route:clear && pm2 restart bukusaku-backend && pm2 save
   ```

---

## 3. KONFIGURASI NGINX REVERSE PROXY

```nginx
server {
    listen 80;
    server_name bukusaku.madiunkab.go.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bukusaku.madiunkab.go.id;

    ssl_certificate /etc/letsencrypt/live/bukusaku.madiunkab.go.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bukusaku.madiunkab.go.id/privkey.pem;

    # API Backend Laravel
    location /api/ {
        proxy_pass http://127.0.0.1:8002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend React Application
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
