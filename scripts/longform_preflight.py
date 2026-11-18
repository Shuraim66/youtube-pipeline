#!/usr/bin/env python3
"""Preflight for the Aurelis long-form pipeline: can THIS checkout build a video the way the shipped ones were built?

  python scripts/longform_preflight.py            # checks only
  python scripts/longform_preflight.py --smoke    # + renders one Old Money still (needs src/oldmoney/data.json, i.e. run the pipeline first)

Checks (exit 1 if any FAIL):
  1. tools: node, npm, ffmpeg, ffprobe; empires_short/node_modules (run `npm ci` there); Python modules (kokoro, faster_whisper, soundfile, numpy, PIL)
  2. the code the long-form needs exists (puppet v2.0 locked, card/prop renderer, plan/VO/mix/build-data scripts, rules)
  3. every asset the renderer reads exists AND is not git-ignored (an ignored file is missing from a fresh clone, which is how an AI tool or collaborator would get the repo)
  4. library.json is consistent with the PNGs on disk
Warnings (do not fail): Kokoro weights not cached yet (first voice run downloads them from Hugging Face), no GPU.
"""
import importlib.util, json, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
E = ROOT / "empires_short"
LIBDIR = E / "public/img/aurelis/library"
PUP = E / "public/img/aurelis/puppet"
fails, warns = [], []


def ok(msg): print("  ok   ", msg)
def fail(msg): fails.append(msg); print("  FAIL ", msg)
def warn(msg): warns.append(msg); print("  warn ", msg)


def ignored(p: Path) -> bool:
    return subprocess.run(["git", "-C", str(ROOT), "check-ignore", "-q", str(p.relative_to(ROOT))], capture_output=True).returncode == 0


def need_file(p: Path, label=None):
    label = label or str(p.relative_to(ROOT))
    if not p.exists(): fail(f"missing: {label}")
    elif ignored(p): fail(f"git-ignored (would be missing from a fresh clone): {label}")
    else: return True
    return False


print("1. tools")
for t in ("node", "npm", "ffmpeg", "ffprobe"):
    ok(f"{t}: {shutil.which(t)}") if shutil.which(t) else fail(f"{t} not on PATH")
(ok("empires_short/node_modules present") if (E / "node_modules/.bin/remotion").exists() else fail("empires_short/node_modules missing: run `npm ci` in empires_short/"))
for mod in ("kokoro", "faster_whisper", "soundfile", "numpy", "PIL"):
    ok(f"python module {mod}") if importlib.util.find_spec(mod) else fail(f"python module {mod} missing: pip install -r requirements-longform.txt")
hf = Path.home() / ".cache/huggingface/hub/models--hexgrad--Kokoro-82M"
if not hf.exists(): warn("Kokoro weights not cached: the first voice run downloads hexgrad/Kokoro-82M (needs network)")

print("2. code")
CODE = ["empires_short/src/puppet/Puppet.v2.0.locked.tsx", "empires_short/src/moneypsych/theme.ts", "empires_short/src/moneypsych/props.tsx", "empires_short/src/oldmoney/OldMoney.tsx",
        "empires_short/src/oldmoney/props.tsx", "empires_short/src/oldmoney/entry.tsx", "scripts/beat_rules.py", "scripts/retention_rules.py", "scripts/oldmoney_plan.py",
        "scripts/oldmoney_spec.py", "scripts/oldmoney_vo.py", "scripts/oldmoney_whisper.py", "scripts/oldmoney_check.py", "scripts/oldmoney_mix.py", "scripts/oldmoney_build_data.py",
        "scripts/oldmoney_report.py", "scripts/oldmoney_package.py", "scripts/library_add_image.py", "scripts/make_mascot_references.py", "scripts/puppet_cut_poses.py", "scripts/gen_images_runpod.py", "scripts/moneypsych_build_data.py", "scripts/thumb_finish.py", "playbooks/LONGFORM_BUILD.md",
        "playbooks/PUPPET_BEAT_RULES.md", "playbooks/LONGFORM_RETENTION.md"]
for c in CODE: need_file(ROOT / c)

print("3. assets the renderer reads")
ASSETS = ["assets/audio/aurelis_bed.wav", "brand/aurelis_logo.png", "empires_short/public/emblem.png", "empires_short/package.json", "empires_short/package-lock.json", "empires_short/tsconfig.json",
          "empires_short/public/img/aurelis/puppet/head_front.png", "assets/mascot/reference_front.png", "assets/mascot/reference_threeq.png"]
ASSETS += [f"empires_short/public/img/aurelis/puppet/v2/{n}" for n in (
    "body.png", "upper_L.png", "upper_R.png", "fore_rest_L.png", "fore_rest_R.png", "parts.json", "poses.json", "hands.json",
    "hand_fist.png", "hand_open.png", "hand_point.png", "hand_shrug.png", "hand_spread.png", "hand_thumbs.png",
    "pose_celebrate.png", "pose_explain.png", "pose_pointL.png", "pose_shrug.png", "pose_thumbs.png", "pose_worried.png",
    "pose_p_calendar.png", "pose_p_card.png", "pose_p_car_keys.png", "pose_p_cash.png", "pose_p_clipboard.png", "pose_p_lottery_ticket.png",
    "pose_p_pay_slip.png", "pose_p_phone.png", "pose_p_piggy_bank.png", "pose_p_receipt.png", "pose_p_test_paper.png")]
n = sum(need_file(ROOT / a) for a in ASSETS); print(f"  {n}/{len(ASSETS)} assets ok")

print("4. library")
lj = LIBDIR / "library.json"
if need_file(lj):
    items = json.loads(lj.read_text())["images"]; bad = 0
    for it in items:
        p = LIBDIR / it["filename"]
        if not p.exists(): fail(f"library.json lists {it['filename']} but the file is missing"); bad += 1
        elif ignored(p): fail(f"library file git-ignored: {it['filename']}"); bad += 1
    plates = sum(1 for i in items if i["kind"] == "plate"); cuts = sum(1 for i in items if i["kind"] == "cutout")
    if not bad: ok(f"library: {plates} plates + {cuts} cut-outs, all present and tracked")

if "--smoke" in sys.argv:
    print("5. smoke render")
    data = E / "src/oldmoney/data.json"
    if not data.exists(): warn("src/oldmoney/data.json not built yet (run the pipeline: see playbooks/LONGFORM_BUILD.md)")
    else:
        out = ROOT / "out_smoke.png"
        r = subprocess.run(["npx", "remotion", "still", "src/oldmoney/entry.tsx", "OldMoney", str(out), "--frame=60", "--log=error"], cwd=E, capture_output=True, text=True)
        ok("remotion still rendered") if r.returncode == 0 and out.exists() else fail("remotion still failed: " + (r.stderr or r.stdout)[-300:])
        out.unlink(missing_ok=True)

print()
for w in warns: print("WARN:", w)
if fails:
    print(f"\nPREFLIGHT FAILED: {len(fails)} problem(s)")
    sys.exit(1)
print("PREFLIGHT OK: this checkout can build a long-form video.")
