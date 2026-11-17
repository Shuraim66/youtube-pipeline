#!/bin/bash
# Render → two-pass loudnorm to -14 LUFS (TP -1.5, LRA 11) → report LUFS + duration → Whisper transcript.
# Tracked copy of the session helper used for every archival Short (behaviour unchanged).
# usage: scripts/finish.sh <CompId> <outname>   → out/<outname>-raw.mp4, out/<outname>.mp4
cd "$(dirname "$0")/.."
npx remotion render $1 out/$2-raw.mp4 --log=error 2>&1 | grep -vi deprecat | tail -2
J=$(ffmpeg -i out/$2-raw.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'); g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i out/$2-raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -c:a aac -b:a 192k -ar 48000 out/$2.mp4
ffmpeg -i out/$2.mp4 -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
ffprobe -v error -show_entries format=duration -of csv=p=0 out/$2.mp4
/home/alpha/products/whop-clipper/.venv/bin/python -c "
from faster_whisper import WhisperModel
s,_=WhisperModel('small',device='cpu',compute_type='int8').transcribe('out/$2.mp4'); print(' '.join(x.text for x in s))"
