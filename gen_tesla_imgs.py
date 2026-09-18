"""Aurelis v2 — Nikola Tesla stills via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
IMG="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/tesla/img"
os.makedirs(IMG,exist_ok=True)
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", cinematic still, dramatic chiaroscuro lighting, 35mm film, highly detailed, moody, vertical composition"
SHOTS={
 "ts_lab":"a vintage 1890s scientific laboratory crackling with electricity, coils and wires, dramatic blue arcs",
 "ts_coil":"a giant Tesla coil throwing huge arcs of electric lightning in a dark laboratory",
 "ts_lightning":"dramatic forks of lightning across a dark night sky, electric energy, ominous",
 "ts_bulbs":"rows of glowing incandescent light bulbs lighting up a dark room, sense of wonder",
 "ts_city_lights":"an early 1900s city skyline at night glowing with new electric lights, cinematic",
 "ts_papers":"scattered old blueprints, scientific notes and diagrams on a dark desk by candlelight",
 "ts_money_torn":"a torn financial contract and scattered banknotes on a dark desk, dramatic light",
 "ts_rival":"a stern wealthy industrialist in a dark 1900s suit standing in shadow, cold and powerful",
 "ts_tower":"a tall wooden electrical transmission tower silhouetted against a dark stormy dusk sky",
 "ts_empty_lab":"an abandoned dusty old laboratory with broken equipment, melancholy, shafts of light",
 "ts_hotel_room":"a lonely dim old 1940s hotel room with a single bed and one window, sad and empty",
 "ts_pigeons":"pigeons perched on an old windowsill in soft dim light, poignant and lonely",
 "ts_window_sil":"a lone elderly man's silhouette standing at a dark window at night, solitary",
 "ts_grave":"a solemn simple grave marker in soft light, quiet and somber",
 "ts_gears":"intricate antique brass machine gears and inventions, industrial, dramatic light",
}
def gen(name,prompt):
    dst=f"{IMG}/{name}.jpg"
    if os.path.exists(dst) and os.path.getsize(dst)>20000: print("skip",name,flush=True); return
    seed=random.randint(1,999999)
    url=f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt+STYLE)}?width=832&height=1472&model=flux&nologo=true&seed={seed}"
    for a in range(6):
        try:
            d=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180).read()
            if len(d)>20000: open(dst,"wb").write(d); print("OK",name,len(d),flush=True); return
        except Exception as e: print("retry",name,a,str(e)[:70],flush=True)
        time.sleep(8*(a+1)+random.random()*4)
    print("FAIL",name,flush=True)
for n,p in SHOTS.items(): gen(n,p)
print("TESLA IMAGES DONE",flush=True)
