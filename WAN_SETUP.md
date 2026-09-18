# WAN 2.2 I2V setup (RunPod) — the "Alux-tier polish" motion engine

Replaces LTX for image-to-video micro-motion. Same workflow, same output
convention (`<still>_mo.mp4` in `flux_images/<short>/`), **zero builder changes**
(the builders' `img:` branch already prefers `<still>_mo.mp4` over Ken Burns —
see `build_enron_v2.py:228`).

## Why WAN (LTX SKIPPED — decision Sep 17 2026)
WAN 2.2 I2V is the open-source quality leader for photoreal subjects + coherent
motion. **LTX is NOT installed on this pod** (user chose WAN-only). This is a
polish upgrade (~last 10%), not the main quality lever (that's script depth + voice).

## Disk plan (WAN-only, FLUX + WAN)
Volume was EXPANDED (Sep 17 2026); the expansion appears to have WIPED /workspace
(FLUX venv + models likely need re-downloading). WAN-only footprint:
- FLUX-fp16 ~32GB + WAN 2.2 I2V fp8 ~15–18GB ≈ **~49GB** (fits 65–80GB volume), OR
- FLUX-fp8 ~17GB + WAN-fp8 ~17GB ≈ **~34GB** (fits even 50GB).
Everything on the persistent `/workspace` volume so it survives restarts. No LTX,
no container-disk juggling.

## One-time install (per fresh pod; container disk wipes on restart)
```bash
# re-add your pubkey via the web terminal first (container /root/.ssh is wiped):
#   mkdir -p ~/.ssh && echo "<pubkey>" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys

source /workspace/venv_flux/bin/activate          # reuse the FLUX venv
pip install -U diffusers transformers accelerate ftfy imageio imageio-ffmpeg
export HF_HOME=/workspace/hf                       # reuse stored read token
```
WAN 2.2 I2V repos are ungated, so the token isn't required — but reusing
`HF_HOME=/workspace/hf` keeps the cache on the persistent volume. First run
downloads the model (~15–18GB fp8) into `$HF_HOME`.

## Run (batch)
```bash
# 1. FLUX stills already generated into /workspace/out/<name>.jpg
# 2. list the basenames to animate (no extension):
echo '["enron_hq","enron_shred","enron_stock","enron_trader"]' > /workspace/wan_list.json
# 3. animate — writes /workspace/out/<name>_mo.mp4 for each
python /workspace/wan_batch.py
```
Tunables via env (defaults in the script): `WAN_W=720 WAN_H=1280 WAN_FPS=16
WAN_FRAMES=49 WAN_STEPS=30`. Lower `WAN_W/WAN_H` or `WAN_FRAMES=33` if OOM.
Expect ~1–3 min/clip on the 3090 (vs LTX ~50s — the quality is the trade).

## Pull back + assemble (local, pod stopped)
```bash
# from local machine (IP/PORT from the pod Connect panel, change each spin-up):
scp -i ~/.ssh/id_ed25519 -P <PORT> \
  root@<IP>:/workspace/out/'*_mo.mp4' \
  ~/products/youtube-pipeline/flux_images/enron/
# then STOP the pod and rebuild locally:
/home/alpha/products/whop-clipper/.venv/bin/python build_enron_v2.py
```
The builder auto-detects each `<still>_mo.mp4` and uses it instead of Ken Burns.

## Rollout order
1. Expand volume to 80GB (or pick the ephemeral-disk path).
2. Install + pull WAN, run `wan_batch.py` on ONE short's stills, rebuild, eyeball
   the motion vs the LTX version.
3. If better: re-animate the 4 unlisted shorts (WeWork/Bella/Enron/Zodiac) and
   use WAN for all new builds. LTX (`ltx_batch.py`) stays as the fast fallback.
