#!/usr/bin/env python3
"""
Generate a documentary voiceover from a plain-text narration script.

Backends, in preference order:
  1. piper - fully local, natural pace, nothing leaves the machine. This is the
             default. Set narration speed with --length-scale (higher = slower;
             ~1.15 gives a measured ~135 wpm with the amy-low voice).
  2. gtts  - Google Text-to-Speech fallback. Sends the narration text to
             Google's servers, so only for non-sensitive scripts.

IMPORTANT: do not pace the video first and then stretch audio to fill it. gTTS
runs ~250 wpm and stretching it down to documentary pace (0.5-0.6x atempo)
sounds like a slowed record. Generate narration at a NATURAL length, then fit
the video to that length (assemble_video.py already scales the stills to the
audio). The voiceover length is the source of truth, not a preset target.

Usage:
    python3 scripts/generate_tts.py \
        --script data/voice/port_royal_voice_script.txt \
        --output data/voice/port_royal_voice.wav \
        --piper-model /home/alpha/piper-voices/en_US-amy-low.onnx
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile

TARGET_WPM = 140  # documentary narration pace


def duration_seconds(path: str) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def synth_piper(text: str, model: str, out_wav: str) -> None:
    subprocess.run(
        ["piper-tts", "--model", model, "--output_file", out_wav,
         "--sentence_silence", "0.3"],
        input=text, text=True, check=True,
    )


def synth_gtts(text: str, out_mp3: str) -> None:
    from gtts import gTTS
    gTTS(text=text, lang="en", slow=False).save(out_mp3)


def retime(src: str, out_wav: str, tempo: float) -> None:
    """Time-stretch src to out_wav. ffmpeg atempo accepts 0.5-2.0 per filter,
    so chain filters for anything outside that range."""
    filters, remaining = [], tempo
    while remaining < 0.5:
        filters.append("atempo=0.5")
        remaining /= 0.5
    while remaining > 2.0:
        filters.append("atempo=2.0")
        remaining /= 2.0
    filters.append(f"atempo={remaining:.4f}")

    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", src,
         "-filter:a", ",".join(filters),
         "-acodec", "pcm_s16le", "-ar", "44100", out_wav],
        check=True,
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", required=True)
    ap.add_argument("--output", required=True, help="output .wav path")
    ap.add_argument("--wpm", type=int, default=TARGET_WPM)
    ap.add_argument("--piper-model", default=None,
                    help="path to a piper voice .onnx; enables the piper backend")
    args = ap.parse_args()

    if not shutil.which("ffmpeg"):
        print("ffmpeg is required and was not found on PATH", file=sys.stderr)
        return 1

    with open(args.script) as f:
        text = f.read().strip()
    words = len(text.split())
    target = words / args.wpm * 60
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    print(f"{words} words -> target {target:.0f}s at {args.wpm} wpm")

    if args.piper_model:
        if not shutil.which("piper-tts"):
            print("piper-tts binary not on PATH", file=sys.stderr)
            return 1
        if os.path.getsize(args.piper_model) < 1_000_000:
            print(f"{args.piper_model} looks truncated; re-download the voice model",
                  file=sys.stderr)
            return 1
        synth_piper(text, args.piper_model, args.output)
        print(f"saved {args.output} ({duration_seconds(args.output):.0f}s, piper)")
        return 0

    # gTTS fallback. Note: this uploads the narration text to Google.
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "raw.mp3")
        synth_gtts(text, raw)
        raw_dur = duration_seconds(raw)
        tempo = raw_dur / target
        print(f"raw {raw_dur:.0f}s ({words / raw_dur * 60:.0f} wpm), "
              f"retiming by {tempo:.3f}x")
        retime(raw, args.output, tempo)
        shutil.copy(raw, os.path.splitext(args.output)[0] + ".mp3")

    print(f"saved {args.output} ({duration_seconds(args.output):.0f}s, gtts+retime)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
