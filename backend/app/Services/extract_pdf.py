import sys
import json
import os

def extract_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        return json.dumps({"error": f"File not found: {pdf_path}"})
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        pages_text = []
        for i, page in enumerate(reader.pages):
            txt = page.extract_text() or ''
            clean_txt = txt.strip()
            if clean_txt:
                pages_text.append(f"--- Halaman {i + 1} ---\n{clean_txt}")
        full_content = "\n\n".join(pages_text)
        return json.dumps({
            "ok": True,
            "total_pages": total_pages,
            "char_count": len(full_content),
            "content": full_content
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": f"Gagal mengekstrak PDF: {str(e)}"})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(extract_pdf(sys.argv[1]))
    else:
        print(json.dumps({"error": "Path file PDF diperlukan"}))
