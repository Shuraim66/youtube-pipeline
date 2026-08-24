#!/usr/bin/env python3
"""
Assemble a finished cut from stills + voiceover.

Two passes:
  1. render each still to a 1080p/30 clip. With --motion, a cheap linear
     crop-pan (Ken Burns without the per-frame rescale that makes zoompan
     unusable on CPU) drifts across a slightly oversized frame.
  2. chain the clips with dissolve crossfades, add fade in/out, mux the audio.

Scene `duration_seconds` are relative weights, scaled so the finished cut lands
on the voiceover length after crossfade overlaps are subtracted.

Usage:
    python3 scripts/assemble_video.py \
        --prompts data/scripts/script_port_royal_validated_prompts.json \
        --images  data/images/port_royal \
        --audio   data/voice/port_royal_voice.wav \
        --output  data/videos/port_royal_final.mp4 --motion
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

FPS = 30
W, H = 1920, 1080
XFADE = 0.6      # crossfade seconds between shots
FADE = 0.8       # open/close fade seconds


def dur(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


# Pan endpoints (start_x, start_y, end_x, end_y) as fractions of the slack,
# cycled per shot so the motion direction varies.
PANS = [
    (0.0, 0.0, 1.0, 1.0), (1.0, 0.0, 0.0, 1.0),
    (0.0, 1.0, 1.0, 0.0), (1.0, 1.0, 0.0, 0.0),
    (0.0, 0.5, 1.0, 0.5), (0.5, 1.0, 0.5, 0.0),
]


def render_clip(img, out, seconds, motion, idx):
    frames = max(1, int(seconds * FPS))
    if motion:
        os_ = 1.12  # oversize so there is slack to pan into
        sw, sh = int(W * os_), int(H * os_)
        sx, sy, ex, ey = PANS[idx % len(PANS)]
        xe = f"(in_w-{W})*({sx}+({ex}-{sx})*t/{seconds:.3f})"
        ye = f"(in_h-{H})*({sy}+({ey}-{sy})*t/{seconds:.3f})"
        vf = (f"scale={sw}:{sh}:force_original_aspect_ratio=increase,"
              f"crop={sw}:{sh},"
              f"crop={W}:{H}:x='{xe}':y='{ye}',setsar=1,fps={FPS}")
    else:
        vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
              f"crop={W}:{H},setsar=1,fps={FPS}")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-loop", "1", "-t", f"{seconds:.3f}",
         "-i", img, "-vf", vf, "-c:v", "libx264", "-preset", "veryfast",
         "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS), out],
        check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", required=True)
    ap.add_argument("--images", required=True)
    ap.add_argument("--audio", required=True)
    ap.add_argument("--output", required=True)
    ap.add_argument("--motion", action="store_true")
    ap.add_argument("--no-crossfade", action="store_true")
    args = ap.parse_args()

    items = json.load(open(args.prompts))["image_prompts"]
    shots = []
    for it in items:
        p = os.path.join(args.images, f"scene_{it['index']:02d}.png")
        if not os.path.exists(p):
            print(f"missing {p}", file=sys.stderr)
            return 1
        shots.append((p, float(it.get("duration_seconds", 5))))

    audio_len = dur(args.audio)
    n = len(shots)
    xf = 0.0 if args.no_crossfade else XFADE
    # after (n-1) crossfades the timeline loses (n-1)*xf, so pad the weights
    target = audio_len + (n - 1) * xf
    wsum = sum(w for _, w in shots)
    scale = target / wsum
    durs = [max(1.2, w * scale) for _, w in shots]
    print(f"audio {audio_len:.1f}s, {n} shots, xfade {xf}s -> "
          f"clip sum {sum(durs):.1f}s")

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        clips = []
        for i, (img, _) in enumerate(shots):
            c = os.path.join(tmp, f"c{i:02d}.mp4")
            render_clip(img, c, durs[i], args.motion, i)
            clips.append(c)
            print(f"  clip {i:02d} {durs[i]:5.1f}s{' pan' if args.motion else ''}")

        if args.no_crossfade:
            listing = os.path.join(tmp, "l.txt")
            open(listing, "w").write("".join(f"file '{c}'\n" for c in clips))
            subprocess.run(
                ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
                 "-i", listing, "-i", args.audio,
                 "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                 "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                 "-shortest", args.output], check=True)
        else:
            # build an xfade chain across all clips, then fade in/out + audio
            cmd = ["ffmpeg", "-y", "-v", "error"]
            for c in clips:
                cmd += ["-i", c]
            cmd += ["-i", args.audio]

            fc, prev, offset = [], "[0:v]", 0.0
            for k in range(1, n):
                offset += durs[k - 1] - xf
                out = f"[x{k}]"
                fc.append(
                    f"{prev}[{k}:v]xfade=transition=dissolve:"
                    f"duration={xf}:offset={offset:.3f}{out}")
                prev = out
            total = sum(durs) - (n - 1) * xf
            fc.append(
                f"{prev}fade=t=in:st=0:d={FADE},"
                f"fade=t=out:st={total - FADE:.3f}:d={FADE}[v]")
            cmd += ["-filter_complex", ";".join(fc),
                    "-map", "[v]", "-map", f"{n}:a",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-shortest", args.output]
            subprocess.run(cmd, check=True)

    print(f"\nsaved {args.output} ({dur(args.output):.1f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
