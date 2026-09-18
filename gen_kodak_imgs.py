"""Generate the 15 phrase-matched cinematic stills for the Kodak short via Pollinations Flux (keyless)."""
import urllib.request, urllib.parse, os, time, random
IMG="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/kodak/img"
os.makedirs(IMG,exist_ok=True)
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", cinematic still, dramatic lighting, 35mm film photography, highly detailed, moody, vertical composition"
SHOTS={
 "kd_engineer":"a young engineer in a 1970s laboratory holding a bulky prototype electronic camera device, vintage lab equipment, warm light",
 "kd_bosses":"stern corporate executives in 1970s suits frowning dismissively at a new invention on a boardroom table, dramatic",
 "kd_film_factory":"a vast industrial factory producing endless rolls of photographic film, 1980s, wide shot",
 "kd_film_rolls":"close up of many 35mm film canisters and unspooled film rolls piled together, nostalgic warm light",
 "kd_golden_goose":"tall stacks of cash and gold coins next to rolls of photographic film on a dark table, wealth",
 "kd_locked":"a mysterious prototype device locked away inside a dark steel safe, secrecy, dramatic shadow",
 "kd_digital_world":"people in the early 2000s happily taking photos with small digital cameras, modern city",
 "kd_phone_camera":"a hand holding up a smartphone taking a photo, glowing bright screen, modern night",
 "kd_empty_shelf":"empty dusty shelves in an old camera store where film boxes used to be, melancholy",
 "kd_bankruptcy":"an abandoned red brick factory building with broken windows and weeds, decline and decay",
 "kd_empty_factory":"a huge empty abandoned industrial factory floor with dust and shafts of light through the roof",
 "kd_future_hands":"a pair of open hands cradling a glowing sphere of futuristic light, symbolic of the future, dark background",
 "kd_past_road":"a lone silhouetted figure walking away down an old empty road at dusk looking back, regret",
 "kd_hq_decline":"a large corporate headquarters building under an overcast grey sky, faded and declining, wide shot",
 "kd_shutter":"an extreme close up of a vintage camera lens and shutter mechanism, metallic, dramatic light",
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
