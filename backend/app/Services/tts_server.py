import sys
import os
import re
import json
import asyncio
from http.server import HTTPServer, BaseHTTPRequestHandler

# Port dedicated for VPS Dynamic Bupati TTS Service
PORT = 17494

def clean_markdown_for_speech(text: str) -> str:
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*[-*_]{3,}\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*[\*\-•]\s+', 'Poin: ', text, flags=re.MULTILINE)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) > 2500:
        cutoff = text[:2500].rfind('.')
        if cutoff > 1200:
            text = text[:cutoff + 1] + " Informasi lengkap dokumen tertera pada teks panduan di layar."
        else:
            text = text[:2500] + "... Informasi lengkap tertera pada teks panduan di layar."
    return text

async def synthesize_speech(text: str, voice='id-ID-ArdiNeural', rate='-2%', pitch='-3Hz') -> bytes:
    import edge_tts
    clean = clean_markdown_for_speech(text)
    communicate = edge_tts.Communicate(clean, voice=voice, rate=rate, pitch=pitch)
    audio_chunks = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
    return b"".join(audio_chunks)

class TTSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/health', '/v1/health'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'online', 'service': 'Bupati Madiun Dynamic TTS Service'}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path in ('/v1/audio/speech', '/synthesize'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                text = data.get('input') or data.get('text') or ''
                if not text.strip():
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"error": "input text required"}')
                    return

                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                audio_bytes = loop.run_until_complete(synthesize_speech(text))
                loop.close()

                if not audio_bytes:
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(b'{"error": "synthesis failed"}')
                    return

                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(len(audio_bytes)))
                self.end_headers()
                self.wfile.write(audio_bytes)
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silent logging for speed and clean PM2 output
        return

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), TTSHandler)
    print(f"Bupati Madiun Dynamic TTS Server running on http://127.0.0.1:{PORT}", flush=True)
    server.serve_forever()

if __name__ == '__main__':
    run_server()
