"""Generate stills for Rockefeller (Aurelis) + Roanoke (Night File) via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
BASE="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
AUR=", cinematic still, dramatic chiaroscuro lighting, 35mm film, highly detailed, opulent, vertical composition"
HOR=", dark cinematic horror still, moody low-key lighting, deep shadows, fog, heavy film grain, high contrast, ominous dread atmosphere, muted desaturated cold colors, photorealistic, vertical composition"
CASES={
 "rockefeller":(AUR,{
  "rk_oil_field":"a vast 1800s oil field full of wooden derricks under a dramatic smoky sky",
  "rk_refinery":"a sprawling early 1900s oil refinery with smokestacks and pipes at dusk",
  "rk_barrels":"rows of old wooden oil barrels stacked in a dim warehouse, dramatic light",
  "rk_money":"towering stacks of vintage dollar bills and gold coins on a dark table, immense wealth",
  "rk_boardroom":"stern wealthy industrialists in 1900s suits around a dark boardroom table",
  "rk_court":"a grand early 1900s courtroom interior, tense, dramatic light",
  "rk_broken":"a massive cracked stone monument breaking apart, symbolic of a shattered empire, dramatic",
  "rk_gas_station":"a vintage 1930s American gas station at dusk, nostalgic and cinematic",
  "rk_stock":"a soaring green stock chart on an old ticker board, wealth, dramatic light",
  "rk_dimes":"an extreme close up of shiny silver dimes in an open hand, dramatic light",
  "rk_mansion":"a grand opulent gilded age mansion at dusk, immense wealth",
  "rk_tomb":"an ornate marble mausoleum in soft solemn light",
 }),
 "roanoke":(HOR,{
  "ro_colony":"a small isolated 1500s wooden colonial settlement of log cabins at dusk, ominous",
  "ro_carving":"crude letters carved into rough tree bark in a dark forest, extreme close up, eerie",
  "ro_ships":"old 1500s wooden sailing ships on a grey rough sea under a heavy sky",
  "ro_settlement":"the interior of a rough empty 1500s colonial log village, dim and unsettling",
  "ro_ship_sea":"a lone sailing ship far out on a vast dark stormy sea, isolation",
  "ro_storm":"a violent dark storm over the ocean at night with lightning, foreboding",
  "ro_empty_village":"an abandoned deserted 1500s wooden colonial village, overgrown and silent, fog",
  "ro_fog":"thick fog rolling through a dark empty forest at dusk, dread",
  "ro_empty_field":"an empty overgrown clearing where a village once stood, cold grey light, desolate",
  "ro_woods":"a dark dense forest of bare trees at dusk, ominous, fog",
  "ro_post":"an old weathered wooden post standing alone in fog with strange carvings, eerie",
  "ro_woods_dark":"a pitch dark forest at night, faint moonlight through bare branches, terrifying",
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
print("BATCH RR IMAGES DONE",flush=True)
