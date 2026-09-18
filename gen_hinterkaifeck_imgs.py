"""Generate the atmospheric horror stills for the Hinterkaifeck mystery short via Pollinations Flux (keyless)."""
import urllib.request, urllib.parse, os, time, random
IMG="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/hinterkaifeck/img"
os.makedirs(IMG,exist_ok=True)
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", dark cinematic horror still, moody low-key lighting, deep shadows, fog, heavy film grain, high contrast, ominous dread atmosphere, muted desaturated cold colors, photorealistic, vertical composition"
SHOTS={
 "hk_farmhouse_snow":"an old isolated Bavarian farmhouse at night in deep winter snow, one dim glowing window, bare black trees, full moon",
 "hk_attic_dark":"a pitch dark creepy wooden attic with a single thin shaft of pale moonlight cutting through dust, old beams",
 "hk_ceiling_steps":"looking straight up at a dark old wooden plank ceiling from below, faint dust falling, someone walking above",
 "hk_footprints_snow":"a single trail of deep fresh footprints in white snow leading toward a dark old farmhouse at dusk",
 "hk_footprints_end":"a lone trail of footprints in snow ending abruptly in the middle of an empty snowy field at twilight",
 "hk_keys":"an old iron ring of antique house keys on a rough wooden table lit by a single dying candle",
 "hk_newspaper":"an old 1920s german newspaper lying on a dark wooden table beside a single flickering candle",
 "hk_farmer_window":"a lone dark silhouette of a farmer standing at a small farmhouse window at night, backlit, uneasy",
 "hk_barn":"the dim interior of an old wooden barn at night with cattle in shadow, a single hanging lantern",
 "hk_pickaxe":"an old rusty pickaxe leaning against a rough dark wooden barn wall in dim light, ominous",
 "hk_kitchen":"an empty rustic 1920s farmhouse kitchen at night, a half-eaten meal left on the table, one candle",
 "hk_chimney_smoke":"thin smoke rising from the chimney of a lonely snow-covered farmhouse at dusk seen from far away",
 "hk_shadow_doorway":"a tall dark shadowy human figure standing motionless in the doorway of an old farmhouse, strong backlight",
 "hk_hallway":"a dark narrow empty old farmhouse hallway at night lit by one weak flickering bulb, dread",
 "hk_attic_eyes":"faint pale glowing eyes barely visible in the total darkness of a wooden attic, extremely subtle, terrifying",
 "hk_graves":"old weathered leaning gravestones in a snowy german village cemetery shrouded in thick fog at dawn",
 "hk_farmhouse_wide":"a wide shot of a single lonely farmhouse under a huge full moon, bare dead trees, winter fog",
}
def gen(name,prompt):
    dst=f"{IMG}/{name}.jpg"
    if os.path.exists(dst) and os.path.getsize(dst)>20000: print("skip",name,flush=True); return
    seed=random.randint(1,999999)
    url=f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt+STYLE)}?width=832&height=1472&model=flux&nologo=true&seed={seed}"
    for attempt in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r: data=r.read()
            if len(data)>20000: open(dst,"wb").write(data); print("OK",name,len(data),flush=True); return
        except Exception as e: print("retry",name,attempt,str(e)[:80],flush=True)
        time.sleep(8*(attempt+1)+random.random()*4)
    print("FAIL",name,flush=True)
for n,p in SHOTS.items(): gen(n,p)
print("IMAGES DONE",flush=True)
