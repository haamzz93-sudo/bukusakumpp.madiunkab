import sys
import os
import re
import argparse
import asyncio
import json

def clean_markdown_for_speech(text: str) -> str:
    # 1. Remove URLs and links: [Title](url) -> Title
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # 2. Remove bare URLs
    text = re.sub(r'https?://\S+', '', text)
    # 3. Remove bold/italic markers
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    # 4. Remove headings and lines
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*[-*_]{3,}\s*$', '', text, flags=re.MULTILINE)
    # 5. Clean up bullet points to sound natural
    text = re.sub(r'^\s*[\*\-•]\s+', 'Poin: ', text, flags=re.MULTILINE)
    # 6. Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # 7. Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Keep it comfortable for audio (up to ~2500 characters so it reads the complete SOP answer)
    if len(text) > 2500:
        cutoff = text[:2500].rfind('.')
        if cutoff > 1200:
            text = text[:cutoff + 1] + " Informasi lengkap dokumen tertera pada teks panduan di layar."
        else:
            text = text[:2500] + "... Informasi lengkap tertera pada teks panduan di layar."
            
    return text

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--text', default=None, help='Text to convert to speech')
    parser.add_argument('--text-file', default=None, help='Path to file containing text')
    parser.add_argument('--output', required=True, help='Output MP3 file path')
    parser.add_argument('--voice', default='id-ID-ArdiNeural', help='Edge TTS Voice')
    parser.add_argument('--rate', default='-4%', help='Speech rate for calm dignified speech')
    parser.add_argument('--pitch', default='-8Hz', help='Pitch adjustment for deep baritone Bupati voice')
    args = parser.parse_args()

    raw_text = ''
    if args.text_file and os.path.exists(args.text_file):
        try:
            with open(args.text_file, 'r', encoding='utf-8') as f:
                raw_text = f.read()
        except Exception as e:
            print(json.dumps({'ok': False, 'error': f'Gagal membaca text-file: {e}'}))
            return
    elif args.text:
        raw_text = args.text
    else:
        print(json.dumps({'ok': False, 'error': 'Teks tidak diberikan'}))
        return

    clean_text = clean_markdown_for_speech(raw_text)
    if not clean_text:
        print(json.dumps({'ok': False, 'error': 'Teks bersih kosong'}))
        return

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    try:
        import edge_tts
        communicate = edge_tts.Communicate(clean_text, voice=args.voice, rate=args.rate, pitch=args.pitch)
        await communicate.save(args.output)
        print(json.dumps({
            'ok': True,
            'file': args.output,
            'characters': len(clean_text)
        }))
    except Exception as e:
        print(json.dumps({
            'ok': False,
            'error': str(e)
        }))

if __name__ == '__main__':
    asyncio.run(main())
