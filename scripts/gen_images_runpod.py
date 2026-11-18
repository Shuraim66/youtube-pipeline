#!/usr/bin/env python3
"""Generate the Alux-test beat images through RunPod's PUBLIC Qwen-Image-Edit endpoint (no pod, no own endpoint).

  endpoint : POST https://api.runpod.ai/v2/qwen-image-edit-2511-lora/runsync   ($0.025 / image, failed jobs not billed)
  prompts  : empires_short/out/experiments/alux_test/prompts.md  (Prompt A = background plate, Prompt B = mascot cut-out)
  prompt   : "aurelismascot" + the beat prompt from prompts.md (which already starts with the Aurelis style prefix)
  refs     : mascot = assets/mascot/reference_front.png ; background plates get a blank charcoal canvas
  output   : empires_short/public/img/aurelis/alux_test/beatNN_bg.png | beatNN_char.png | beatNN_char2.png (never overwrites unless --force)
             mascot layers are requested on flat #00FF00 and keyed to a transparent PNG (the model cannot output alpha)
  log      : gen_log.json next to this script's output folder: prompt, seed, lora, GPU seconds, cost, pass/fail per image

Usage (python: /home/alpha/products/whop-clipper/.venv/bin/python):
  gen_images_runpod.py --beats 1,6,10                      # backgrounds + mascot layers for those beats
  gen_images_runpod.py --beats 6 --kinds char,char2        # only some layers
  gen_images_runpod.py --beats all --seed 7 --lora <URL-to-lora.safetensors> --lora-scale 0.8   # optional LoRA (public URL)
  gen_images_runpod.py --beats 1 --dry-run                 # print the final prompts, call nothing, spend nothing
Key: RUNPOD_API_KEY from the environment or ./.env (never printed).
"""
import argparse, base64, io, json, re, sys, time, urllib.error, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from runpod_api import _key  # noqa: E402

ENDPOINT = "https://api.runpod.ai/v2/qwen-image-edit-2511-lora/runsync"
PROMPTS = ROOT / "empires_short/out/experiments/alux_test/prompts.md"
OUT = ROOT / "empires_short/public/img/aurelis/alux_test"
LOG = OUT / "gen_log.json"
REF = ROOT / "assets/mascot/reference_front.png"            # built by scripts/make_mascot_references.py from the approved library art (the old training/ copy was deleted)
REF3 = ROOT / "assets/mascot/reference_threeq.png"   # second mascot reference (three-quarter view)
TRIGGER = "aurelismascot"
SIZE = "1536*864"                        # 16:9; the docs list other sizes, so the first call doubles as an acceptance test (failed jobs are not billed)
EXTRA_CHAR2 = {"10": "Pose SHOCKED (wide eyes, O mouth, brows raised), phone lowered in the right hand, facing right."}  # beat 10 'noticing' swap


def parse_prompts():
    beats = {}
    for m in re.finditer(r"## Beat (\d\d) .*?(?=\n## Beat |\Z)", PROMPTS.read_text(), re.S):
        n, body = m.group(1), m.group(0)
        a = re.search(r"\*\*Prompt A[^\n]*\n> ([^\n]+)", body)
        b = re.search(r"\*\*Prompt B[^\n]*\n> ([^\n]+)", body)
        beats[n] = {"A": a.group(1).strip() if a else None, "B": b.group(1).strip() if b else None}
    return beats


def bg_prompt(a):
    a = re.sub(r"The recurring mascot \(use the attached reference image exactly\):.*?black sneakers with white soles\. ", "", a)
    return (f"Redraw the attached blank charcoal paper canvas as this finished flat hand-drawn illustration of an empty location. {a}")


def char_prompts(n, b):
    """-> {kind: prompt}. Handles single pose lines and the '(a) ... (b) ...' two-image lines; asks for flat green for keying."""
    key = "on a flat pure #00FF00 green background, no ground, no shadow, no scene, nothing else"
    b = re.sub(r"on a fully transparent background \(PNG with alpha\), no ground, no shadow, no scene, nothing else\.", key + ".", b)
    head = f"{TRIGGER}. Keep the attached character EXACTLY (same face, hair, outfit, proportions, line style); redraw him in the pose below. "
    two = re.search(r"TWO SEPARATE IMAGES[^:]*: \(a\) [^=]+= (.+?); \(b\) [^=]+= (.+?)\.(?: Same scale as beat 4\.)?$", b)
    if two:
        stem = b[:two.start()].strip()
        return {"char": f"{head}{stem} Pose {two.group(1)}. Same scale in every image.", "char2": f"{head}{stem} Pose {two.group(2)}. Same scale in every image."}
    out = {"char": head + b}
    if n in EXTRA_CHAR2:
        stem = re.sub(r"Pose [A-Z].*$", "", b).strip()
        out["char2"] = f"{head}{stem} {EXTRA_CHAR2[n]}"
    return out


def single_prompt(a, b):
    """plate + mascot(s) in ONE prompt (no green screen)."""
    prefix = a.split("The recurring mascot")[0].strip()
    sc = re.search(r"Scene: (.+?) Empty scene\.", a, re.S)
    scene = sc.group(1).strip() if sc else ""
    two = re.search(r"\(a\) [^=]+= (.+?); \(b\) [^=]+= (.+?)\.(?: Same scale as beat 4\.)?$", b)
    if two:
        cast = (f"Draw TWO copies of the attached mascot (identical to the references: same face, hair, outfit, proportions): on the LEFT floor spot "
                f"{two.group(1)}; on the RIGHT floor spot {two.group(2)}. Same scale, full body, both standing on the ground line.")
    else:
        pose = re.search(r"Pose ([A-Z].*)$", b)
        cast = f"Draw the attached mascot exactly as in the references, full body, standing on the ground line: {pose.group(1) if pose else ''}"
    return f"{TRIGGER}. {prefix} Scene: {scene} {cast} Everything in one finished image: no green screen, no text, letters, numbers or prices."


def blank_canvas():
    return Image.new("RGB", (1536, 864), (0x2B, 0x2B, 0x31))


def to_data_uri(img_or_path):
    buf = io.BytesIO()
    (img_or_path if isinstance(img_or_path, Image.Image) else Image.open(img_or_path).convert("RGB")).save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def key_green(img):
    """Key the flat green backdrop to alpha. Only green that is connected to the image border (or an enclosed backdrop pocket) is removed, so green
    objects on the character (sage cash) survive; despill + soft alpha are applied only on the outline edge ring."""
    from PIL import ImageFilter
    from scipy import ndimage
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)                                           # the actual backdrop colour (the model's green is not pure #00FF00)
    near = np.abs(a - bg).sum(-1) < 70
    lab, n = ndimage.label(near)
    touch = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = ndimage.sum(near, lab, range(1, n + 1))
    keep = [i + 1 for i, sz in enumerate(sizes) if (i + 1) in touch or sz > 30]    # border-connected, or an enclosed pocket of backdrop colour (between arm and body); cash is paler, so it is not "near"
    bgmask = np.isin(lab, keep)
    dom0 = g - np.maximum(r, b)
    ys, xs = np.where(~bgmask)
    if len(ys):                                                                  # the model paints a darker green ground shadow under the feet: drop green in the bottom 12% of the figure
        y1, h = ys.max(), ys.max() - ys.min()
        rows = np.arange(r.shape[0])[:, None] > (y1 - 0.12 * h)
        bgmask = bgmask | (rows & (dom0 > 25) & ~bgmask)
    ring = np.asarray(Image.fromarray((bgmask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0   # ~3 px edge zone
    edge = ring & ~bgmask
    dom = g - np.maximum(r, b)
    alpha = np.full(r.shape, 255, np.int16)
    alpha[bgmask] = 0
    alpha[edge] = np.clip(255 - (dom[edge] - 10) * 8, 0, 255)               # soft edge where the outline still carries a green tint
    g2 = g.copy()
    despill = edge & (dom > 0)
    g2[despill] = np.minimum(g[despill], np.maximum(r, b)[despill] + 4)
    return Image.fromarray(np.dstack([r, g2, b, alpha]).astype(np.uint8), "RGBA")


def fringe_report(rgba, ring=4):
    """green spill metrics on a keyed RGBA: opaque pixels that are still green-dominant, split into edge ring vs interior."""
    from PIL import ImageFilter
    a = np.asarray(rgba).astype(np.int16); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    opaque = al > 0
    hole = Image.fromarray(((al < 255) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * ring + 1))
    edge = (np.asarray(hole) > 0) & opaque
    green = (g - np.maximum(r, b)) > 12
    return {"edge_green_px": int((green & edge).sum()), "edge_px": int(edge.sum()), "interior_green_px": int((green & opaque & ~edge).sum()), "opaque_px": int(opaque.sum())}


def call(prompt, images, seed, lora, scale, retries=2):
    inp = {"prompt": prompt, "images": images, "size": SIZE, "seed": seed, "output_format": "png"}
    if lora:
        inp["loras"] = [{"path": lora, "scale": scale}]
    last = None
    for k in range(retries + 1):
        try:
            req = urllib.request.Request(ENDPOINT, data=json.dumps({"input": inp}).encode(),
                                         headers={"Authorization": f"Bearer {_key()}", "Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=300))
            if r.get("status") == "COMPLETED" and r.get("output", {}).get("result"):
                return r
            last = f"status={r.get('status')} {str(r)[:200]}"
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code} {e.read()[:200]!r}"
        except Exception as e:  # network / timeout
            last = repr(e)[:200]
        time.sleep(3)
    raise RuntimeError(last)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--beats", default="1,6,10", help="comma list of beat numbers or 'all'")
    ap.add_argument("--kinds", default="bg,char,char2", help="subset of bg,char,char2,single")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--lora", default=None, help="public URL of a LoRA .safetensors (optional)")
    ap.add_argument("--lora-scale", type=float, default=0.8)
    ap.add_argument("--suffix", default="", help="added to output names, e.g. _nolora -> beat06_char_nolora.png (for comparisons)")
    ap.add_argument("--force", action="store_true", help="overwrite existing files")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    beats = parse_prompts()
    nums = sorted(beats) if a.beats == "all" else [f"{int(x):02d}" for x in a.beats.split(",")]
    kinds = a.kinds.split(",")
    jobs = []
    for n in nums:
        p = beats[n]
        if "bg" in kinds and p["A"]:
            jobs.append((n, "bg", bg_prompt(p["A"]), "blank"))
        if "single" in kinds and p["A"] and p["B"]:
            jobs.append((n, "single", single_prompt(p["A"], p["B"]), "mascot"))
        if p["B"]:
            for k, txt in char_prompts(n, p["B"]).items():
                if k in kinds:
                    jobs.append((n, k, txt, "mascot"))
    OUT.mkdir(parents=True, exist_ok=True)
    log = json.loads(LOG.read_text()) if LOG.exists() else []
    print(f"{len(jobs)} images x $0.025 = ${len(jobs) * 0.025:.3f} (endpoint price; LoRA: {a.lora or 'none'})")
    total = 0.0
    for n, kind, prompt, refkind in jobs:
        dest = OUT / f"beat{n}_{kind}{a.suffix}.png"
        if a.dry_run:
            print(f"\n--- {dest.name}\n{prompt}\n"); continue
        if dest.exists() and not a.force:
            print("skip (exists, use --force):", dest.name); continue
        entry = {"file": dest.name, "beat": n, "kind": kind, "prompt": prompt, "seed": a.seed, "lora": a.lora, "lora_scale": a.lora if False else (a.lora_scale if a.lora else None),
                 "endpoint": "qwen-image-edit-2511-lora", "size": SIZE, "ts": time.strftime("%Y-%m-%d %H:%M:%S")}
        try:
            refs = [to_data_uri(blank_canvas())] if refkind == "blank" else [to_data_uri(REF), to_data_uri(REF3)]
            r = call(prompt, refs, a.seed, a.lora, a.lora_scale)
            data = urllib.request.urlopen(urllib.request.Request(r["output"]["result"], headers={"User-Agent": "aurelis/1.0"}), timeout=120).read()
            img = Image.open(io.BytesIO(data)).convert("RGB")
            if kind.startswith("char"):
                k = key_green(img); k.save(dest); entry["fringe"] = fringe_report(k)
            else:
                img.save(dest)
            if kind.startswith("char"):
                img.save(dest.with_name(dest.stem + "_raw.png"))   # keep the un-keyed render for inspection
            cost = float(r["output"].get("cost", 0.025)); total += cost
            entry.update(status="pass", gpu_seconds=round(r.get("executionTime", 0) / 1000, 1), delay_seconds=round(r.get("delayTime", 0) / 1000, 1), cost_usd=cost, job_id=r.get("id"))
            print(f"ok   {dest.name}  {entry['gpu_seconds']}s  ${cost}")
        except Exception as e:
            entry.update(status="fail", error=str(e)[:300], cost_usd=0.0)
            print(f"FAIL {dest.name}: {e}")
        log.append(entry)
        LOG.write_text(json.dumps(log, indent=1))
    if not a.dry_run:
        print(f"done. spent ${total:.3f}; log -> {LOG.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
