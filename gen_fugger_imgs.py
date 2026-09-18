"""Generate stills for the v2 test short — Jakob Fugger (richest man in history) via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
IMG="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/fugger/img"
os.makedirs(IMG,exist_ok=True)
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", cinematic still, dramatic chiaroscuro lighting, 35mm film, highly detailed, opulent, vertical composition"
SHOTS={
 "fg_gold_pile":"a massive pile of glittering gold coins and bars in a dark vault, single shaft of light, immense wealth",
 "fg_billionaire_sil":"a silhouette of a modern billionaire in a suit standing before a wall of glass city skyline at night",
 "fg_europe_map":"an antique 1500s map of Europe on aged parchment lit by candlelight, dramatic",
 "fg_palace":"a grand opulent Renaissance German merchant palace interior with gold and tapestries, candlelight",
 "fg_silver_mine":"workers deep in a dark 1500s silver and copper mine lit by torches, dramatic",
 "fg_coins_table":"stacks of antique gold and silver coins on a dark wooden merchant table, candlelight",
 "fg_king_begging":"a medieval king in robes anxiously pleading across a table in a dim opulent hall",
 "fg_church_pope":"a grand candlelit Renaissance cathedral interior with a papal throne, dramatic light",
 "fg_emperor":"a stern Holy Roman emperor in crown and robes seated on a throne in shadow, dramatic",
 "fg_letter_seal":"an old wax-sealed letter and quill on a dark desk lit by a single candle, tense",
 "fg_gold_vault":"an enormous treasure vault overflowing with gold coins, jewels and chests, torchlight",
 "fg_ledger":"an open antique accounting ledger covered in figures on a dark desk, candlelight, wealth",
 "fg_grave":"an ornate Renaissance marble tomb and epitaph in a dim candlelit chapel, solemn",
 "fg_city_augsburg":"a 1500s European merchant city skyline at dusk with grand stone buildings, moody",
 "fg_crown_gold":"a golden crown resting on a pile of gold coins in a dark room, single dramatic light",
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
print("FUGGER IMAGES DONE",flush=True)
