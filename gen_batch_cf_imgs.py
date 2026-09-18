"""Generate stills for Carnegie (Aurelis) + Flight 19/Bermuda (Night File) via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
BASE="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
AUR=", cinematic still, dramatic chiaroscuro lighting, 35mm film, highly detailed, opulent, vertical composition"
HOR=", dark cinematic horror still, moody low-key lighting, deep shadows, fog, heavy film grain, high contrast, ominous dread atmosphere, muted desaturated cold colors, photorealistic, vertical composition"
CASES={
 "carnegie":(AUR,{
  "ca_steel_mill":"a massive 1800s steel mill interior glowing with molten metal and fire, dramatic",
  "ca_workers":"gritty 1800s steel factory workers among sparks and furnaces, dramatic light",
  "ca_money":"towering stacks of vintage dollar bills and gold coins on a dark table, immense wealth",
  "ca_city":"a smoky 1900s industrial city skyline with factory chimneys at dusk",
  "ca_bridge":"a huge 1800s steel railroad bridge spanning a river, industrial, dramatic",
  "ca_mansion":"a grand opulent gilded age mansion at dusk, immense wealth",
  "ca_library":"a grand ornate old public library reading room with warm light, endless books",
  "ca_giving":"open hands releasing gold coins into the light, symbolic of giving wealth away",
  "ca_ledger":"an open antique accounting ledger and fountain pen on a dark desk by candlelight",
  "ca_crowd":"a crowd of poor early 1900s people receiving charity, warm hopeful light",
  "ca_tomb":"an ornate marble mausoleum in soft solemn light",
  "ca_sunset_estate":"a vast estate garden at golden sunset, wealth and solitude",
 }),
 "flight19":(HOR,{
  "fl_planes_dusk":"vintage WWII torpedo bomber planes flying in formation over a vast ocean at dusk, ominous",
  "fl_ocean_storm":"a dark violent stormy ocean under a heavy grey sky, foreboding",
  "fl_cockpit":"the dim interior of a vintage 1940s military plane cockpit at dusk, eerie",
  "fl_compass":"an extreme close up of an old aircraft compass spinning wildly, ominous",
  "fl_radio_room":"a dim 1940s military radio and radar room with glowing dials, tense",
  "fl_empty_sea":"a vast empty dark endless ocean stretching to the horizon, isolation and dread",
  "fl_search_plane":"a large 1940s flying boat search plane over a dark empty sea at dusk",
  "fl_map":"an old nautical map of the ocean lit by a single candle, mysterious",
  "fl_waves_night":"dark churning ocean waves at night under faint moonlight, menacing",
  "fl_fog_sea":"thick fog rolling over a still dark ocean at dusk, eerie and silent",
  "fl_sunset_empty":"an eerie blood-orange sunset over a completely empty ocean, foreboding",
  "fl_radar":"a vintage circular radar screen glowing green in a dark room, a lone blip vanishing",
 }),
}
def gen(folder,name,prompt,style):
    os.makedirs(folder,exist_ok=True); dst=f"{folder}/{name}.jpg"
    if os.path.exists(dst) and os.path.getsize(dst)>20000: print("skip",name,flush=True); return
    seed=random.randint(1,999999)
    url=f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt+style)}?width=832&height=1472&model=flux&nologo=true&seed={seed}"
    for a in range(6):
        try:
            d=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180).read()
            if len(d)>20000: open(dst,"wb").write(d); print("OK",name,len(d),flush=True); return
        except Exception as e: print("retry",name,a,str(e)[:70],flush=True)
        time.sleep(8*(a+1)+random.random()*4)
    print("FAIL",name,flush=True)
for case,(style,shots) in CASES.items():
    folder=f"{BASE}/{case}/img"
    for n,p in shots.items(): gen(folder,n,p,style)
print("BATCH CF IMAGES DONE",flush=True)
