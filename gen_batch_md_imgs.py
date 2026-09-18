"""Generate stills for J.P. Morgan (Aurelis) + Dancing Plague 1518 (Night File) via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
BASE="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
AUR=", cinematic still, dramatic chiaroscuro lighting, 35mm film, highly detailed, opulent, vertical composition"
HOR=", dark cinematic horror still, moody low-key lighting, deep shadows, fog, heavy film grain, high contrast, ominous dread atmosphere, muted desaturated cold colors, painterly, vertical composition"
CASES={
 "morgan":(AUR,{
  "jm_bank":"a grand early 1900s bank interior with marble columns and gold, dramatic light",
  "jm_panic":"a chaotic 1907 crowd of panicked men outside a bank during a financial crash, dramatic",
  "jm_gold":"a vault of stacked gold bars gleaming in dim dramatic light, immense wealth",
  "jm_office":"a powerful mans dark mahogany office at night with a lit cigar and green desk lamp, 1900s",
  "jm_wallst":"the old New York Stock Exchange building facade at dusk, imposing, 1900s",
  "jm_meeting":"a tense late night meeting of stern industrialists around a dark table, dim lamp light",
  "jm_money":"towering stacks of vintage dollar bills and gold coins on a dark table, immense wealth",
  "jm_railroad":"a massive 1800s steam locomotive and railroad empire at dusk, industrial power",
  "jm_headline":"an old 1907 newspaper with a dramatic PANIC headline on a dark desk, candlelight",
  "jm_capitol":"the United States Capitol building under a dramatic stormy sky, power",
  "jm_cigar":"a mans hand holding a smoking cigar in deep shadow, power and menace",
  "jm_tomb":"an ornate marble mausoleum in soft solemn light",
 }),
 "dancingplague":(HOR,{
  "dp_dancers":"a crowd of medieval peasants dancing frantically in a 1500s European village square, eerie and chaotic",
  "dp_square":"an empty cobblestone medieval town square at dusk, long shadows, ominous",
  "dp_collapse":"exhausted medieval figures collapsed on cobblestones at dusk, somber, no blood",
  "dp_villagers":"fearful medieval villagers watching from doorways by candlelight, uneasy",
  "dp_church":"the dim interior of an old medieval stone church, shafts of pale light, ominous",
  "dp_shoes":"worn tattered medieval shoes abandoned on wet cobblestones at dusk, eerie",
  "dp_night_dance":"silhouettes of people dancing under a pale moon in a medieval square, unsettling",
  "dp_physician":"a medieval physician in dark robes looking gravely concerned by candlelight",
  "dp_crowd_grow":"a growing chaotic crowd of dancing figures filling a medieval street at dusk",
  "dp_graves":"old leaning medieval gravestones in a foggy churchyard at dawn",
  "dp_shadows":"distorted shadows of dancing figures thrown on a stone wall by firelight, eerie",
  "dp_lone_dancer":"a single exhausted figure still dancing alone in an empty square at night, terrifying",
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
print("BATCH MD IMAGES DONE",flush=True)
