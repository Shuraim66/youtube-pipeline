"""Generate atmospheric horror stills for the 3 Night File launch cases via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
BASE="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", dark cinematic horror still, moody low-key lighting, deep shadows, fog, heavy film grain, high contrast, ominous dread atmosphere, muted desaturated cold colors, photorealistic, vertical composition"
CASES={
 "dyatlov":{
  "dy_mountain_night":"a vast snowy Ural mountain slope at night in a blizzard, pale moonlight, desolate and ominous",
  "dy_tent_snow":"a small canvas expedition tent half buried in deep snow at night on a bare mountainside, dark",
  "dy_tent_cut":"a torn canvas tent sliced open from the inside, snow blowing in, dim eerie light",
  "dy_footprints":"a trail of bare footprints in deep snow leading away downhill into total darkness at night",
  "dy_forest_night":"a dark snowy pine forest at night, thick fog between the trees, dread",
  "dy_lights_sky":"strange glowing orange orbs of light floating in a dark night sky above snowy mountains",
  "dy_campfire":"a lone abandoned dying campfire in deep snow at night beside a dead tree, cold and empty",
  "dy_boots":"abandoned worn leather hiking boots and ski gear left in the snow at night, eerie",
  "dy_shapes_snow":"dark indistinct shapes half buried in snow near a bare dead tree at night, unsettling",
 },
 "sodder":{
  "sd_house_fire":"an old two story wooden farmhouse fully engulfed in orange flames at night in winter, silhouette",
  "sd_snow_ruins":"a burned down house foundation covered in snow at dawn, empty and melancholy",
  "sd_ladder":"an old wooden ladder lying abandoned in the snow beside a dark house at night",
  "sd_phone_wire":"a cut telephone wire hanging severed against a grey winter sky, ominous",
  "sd_car_night":"an old 1940s car driving away with red taillights on a dark snowy country road at night",
  "sd_mailbox":"an old black and white photograph of a young man lying inside an open metal mailbox, morning light",
  "sd_billboard":"a weathered blank roadside billboard at dusk beside a lonely empty highway, faded",
  "sd_xmas_dark":"a dark quiet 1940s living room with a dim unlit christmas tree, eerie stillness",
  "sd_ashes":"smoldering ashes and charred burnt wood ruins in the snow at cold dawn",
 },
 "somerton":{
  "so_beach_dusk":"a deserted australian beach at dusk, empty sand, a long stone sea wall, moody and ominous",
  "so_seawall_figure":"a lone dark silhouette of a man slumped against a stone sea wall on an empty beach at night",
  "so_suit":"a neatly pressed vintage 1940s mens suit laid out on a dark surface under a single dim light",
  "so_cut_labels":"extreme close up of a shirt collar with the clothing label cut out, loose threads, dim light",
  "so_old_book":"an old worn leather book of poetry on a dark wooden table lit by one candle",
  "so_cipher":"a page covered in mysterious faint handwritten letters and code in dim candlelight",
  "so_car_book":"the dark interior of an old 1940s car at night with a small book left on the seat",
  "so_grave_unknown":"a plain weathered gravestone in a foggy cemetery at dawn, anonymous and lonely",
  "so_pier_night":"an empty wooden pier stretching into dark water at night, thick fog, isolated",
 },
}
def gen(folder,name,prompt):
    os.makedirs(folder,exist_ok=True); dst=f"{folder}/{name}.jpg"
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
for case,shots in CASES.items():
    folder=f"{BASE}/{case}/img"
    for n,p in shots.items(): gen(folder,n,p)
print("BATCH3 IMAGES DONE",flush=True)
