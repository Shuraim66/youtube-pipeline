#!/usr/bin/env python3
"""
Alternative: Direct Piper TTS client for voiceover generation.
Can be used as a standalone tool or imported as a module.
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from typing import Optional

try:
    import piper
except ImportError:
    print("Warning: piper-tts not installed. Using subprocess mode.", file=sys.stderr)
    piper = None


class PiperGenerator:
    def __init__(self, model_path: str, config_path: Optional[str] = None,
                 sentence_silence: float = 0.3, length_scale: float = 1.0):
        self.model_path = model_path
        self.config_path = config_path or model_path.replace('.onnx', '.json')
        self.sentence_silence = sentence_silence
        self.length_scale = length_scale

    def _split_text(self, text: str, max_length: int = 500) -> list:
        """Split text into chunks for TTS."""
        sentences = text.split('. ')
        chunks = []
        current = []
        length = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            if length + len(sentence) > max_length and current:
                chunks.append('. '.join(current) + '.')
                current = [sentence]
                length = len(sentence)
            else:
                current.append(sentence)
                length += len(sentence)

        if current:
            chunks.append('. '.join(current) + '.')

        return chunks

    def generate(self, text: str, output_path: str) -> dict:
        """Generate voiceover from text."""
        chunks = self._split_text(text)
        print(f"Generating voiceover: {len(chunks)} chunks", file=sys.stderr)

        chunk_files = []
        start = time.time()

        for i, chunk in enumerate(chunks):
            chunk_file = f"temp_chunk_{i}.wav"

            if piper:
                # Use piper module directly
                self._generate_with_module(chunk, chunk_file)
            else:
                # Use piper-tts command line
                self._generate_with_cli(chunk, chunk_file)

            chunk_files.append(chunk_file)
            print(f"  Chunk {i+1}/{len(chunks)} complete", file=sys.stderr)

        # Concatenate chunks
        self._concatenate_chunks(chunk_files, output_path)

        # Clean up temp files
        for f in chunk_files:
            try:
                os.remove(f)
            except OSError:
                pass

        word_count = len(text.split())
        elapsed = time.time() - start

        return {
            "output_path": output_path,
            "duration_minutes": word_count / 150.0,
            "chunks": len(chunks),
            "model": os.path.basename(self.model_path),
            "generation_time_seconds": elapsed,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    def _generate_with_module(self, text: str, output_path: str):
        """Generate using piper module."""
        if not piper:
            raise RuntimeError("piper module not available")

        # Load model
        voice = piper.load_voice(self.model_path)

        # Generate audio
        audio = piper.synthesize(text, voice)

        # Save to file
        with open(output_path, 'wb') as f:
            f.write(audio.tobytes())

    def _generate_with_cli(self, text: str, output_path: str):
        """Generate using piper-tts CLI."""
        cmd = [
            "piper-tts",
            "--model", self.model_path,
            "--config", self.config_path,
            "--output_file", output_path,
            "--sentence_silence", str(self.sentence_silence),
            "--length_scale", str(self.length_scale),
        ]

        result = subprocess.run(
            cmd,
            input=text,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise RuntimeError(f"piper-tts failed: {result.stderr}")

    def _concatenate_chunks(self, files: list, output: str):
        """Concatenate WAV files using ffmpeg."""
        list_file = "concat_list.txt"

        with open(list_file, 'w') as f:
            for file in files:
                f.write(f"file '{file}'\n")

        cmd = [
            "ffmpeg",
            "-f", "concat",
            "-safe", "0",
            "-i", list_file,
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-y", output
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        os.remove(list_file)

        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg concat failed: {result.stderr}")


def main():
    parser = argparse.ArgumentParser(description="Generate voiceover via Piper TTS")
    parser.add_argument("--script", required=True, help="Script text file or JSON")
    parser.add_argument("--output", required=True, help="Output WAV file path")
    parser.add_argument("--model", required=True, help="Piper model path")
    parser.add_argument("--config", help="Piper config path (optional)")
    parser.add_argument("--sentence-silence", type=float, default=0.3, help="Sentence silence in seconds")
    parser.add_argument("--length-scale", type=float, default=1.0, help="Length scale factor")
    args = parser.parse_args()

    # Load script
    if args.script.endswith('.json'):
        with open(args.script, 'r') as f:
            data = json.load(f)
            text = data.get('final', data.get('draft', ''))
    else:
        with open(args.script, 'r') as f:
            text = f.read()

    # Generate voiceover
    generator = PiperGenerator(
        model_path=args.model,
        config_path=args.config,
        sentence_silence=args.sentence_silence,
        length_scale=args.length_scale
    )

    result = generator.generate(text, args.output)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()