import os
import zipfile
import sys
import argparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def make_zip(source_dir, output_zip, exclude_dirs=None, exclude_files=None):
    exclude_dirs = exclude_dirs or []
    exclude_files = exclude_files or []
    
    print(f"[*] Membuat arsip: {os.path.basename(output_zip)}...")
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file in exclude_files or file.endswith('.tmp') or file.endswith('.log'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zf.write(file_path, arcname)
    
    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"[+] Selesai! Ukuran: {size_mb:.2f} MB -> {output_zip}")

def main():
    parser = argparse.ArgumentParser(description="Package Deployer Buku Saku MPP Madiun")
    parser.add_argument("--target", choices=["frontend", "backend", "all"], default="all")
    args = parser.parse_args()

    frontend_dir = os.path.join(BASE_DIR, "frontend")
    backend_dir = os.path.join(BASE_DIR, "backend")

    if args.target in ["frontend", "all"]:
        dist_dir = os.path.join(frontend_dir, "dist")
        if not os.path.exists(dist_dir):
            print("[!] Folder dist belum ada. Jalankan 'npm run build' terlebih dahulu.")
        else:
            zip_front = os.path.join(BASE_DIR, "update_frontend.zip")
            make_zip(dist_dir, zip_front)

    if args.target in ["backend", "all"]:
        zip_back = os.path.join(BASE_DIR, "update_backend.zip")
        make_zip(backend_dir, zip_back, exclude_dirs=["vendor", "node_modules", ".git"])

if __name__ == "__main__":
    main()
