"""Generate stills for Crassus (Aurelis) + Max Headroom intrusion (Night File) via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
BASE="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
AUR=", cinematic still, dramatic chiaroscuro lighting, 35mm film, highly detailed, opulent, vertical composition"
HOR=", dark cinematic horror still, moody low-key lighting, deep shadows, VHS glitch, heavy film grain, high contrast, ominous dread atmosphere, muted desaturated cold colors, photorealistic, vertical composition"
CASES={
 "crassus":(AUR,{
  "cr_rome":"ancient Rome cityscape at golden hour with grand marble temples and columns, epic",
  "cr_fire":"a Roman building engulfed in flames at night in an ancient city street, dramatic",
  "cr_brigade":"ancient Roman men with buckets and a hand pump fighting a fire at night, torchlight",
  "cr_gold":"piles of ancient Roman gold coins and treasure gleaming in dim dramatic light",
  "cr_villa":"an opulent ancient Roman villa interior with mosaics and marble, warm lamplight",
  "cr_senate":"the interior of the ancient Roman senate, marble columns, togas, dramatic light",
  "cr_crowd":"a crowd of ancient Roman citizens in a torchlit street at night, tense",
  "cr_legion":"a Roman legion marching under a dramatic stormy sky, dust and banners",
  "cr_battle":"a chaotic ancient Roman army defeat in a vast desert at dusk, dramatic",
  "cr_moltengold":"molten glowing gold being poured, extreme close up, ominous and menacing",
  "cr_scroll":"an ancient Roman scroll and coins on a dark stone table by candlelight",
  "cr_ruins":"ancient Roman ruins at dusk, fallen columns, solemn and epic",
 }),
 "maxheadroom":(HOR,{
  "mh_static":"an old CRT television screen full of heavy static and glitch in a dark room, eerie glow",
  "mh_masked":"a distorted glitching silhouette of a person in a smooth featureless mask against a glowing screen, unsettling",
  "mh_tv_room":"a dark 1980s living room lit only by a glowing television at night, lonely",
  "mh_tower":"a tall broadcast transmission tower against a dark ominous night sky",
  "mh_control":"a dim 1980s television broadcast control room full of monitors and dials, tense",
  "mh_glitch":"abstract heavy VHS distortion and colorful signal glitch, dark, eerie",
  "mh_studio":"an empty 1980s television news studio at night, dark and abandoned",
  "mh_signal":"a green waveform signal scrolling across a dark monitor in a black room",
  "mh_city":"a 1980s Chicago city skyline at night with glowing windows, moody",
  "mh_antennas":"a cluster of rooftop TV antennas silhouetted against a dark cloudy sky",
  "mh_figure":"a shadowy figure standing in a dark room lit only by flickering television glow",
  "mh_empty_desk":"an abandoned 1980s TV news anchor desk in a dark studio, single spotlight, eerie",
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
print("BATCH CM IMAGES DONE",flush=True)
