"""Generate phrase-matched cinematic stills for 2 Aurelis business shorts (Nokia, Xerox) via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
BASE="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", cinematic still, dramatic lighting, 35mm film photography, highly detailed, moody, vertical composition"
CASES={
 "nokia":{
  "nk_phone_hand":"a person proudly holding up an early 2000s candybar mobile phone, warm light",
  "nk_factory":"a mobile phone manufacturing assembly line in a bright factory, early 2000s",
  "nk_crowd_phones":"a busy crowd of people on a city street all using old candybar mobile phones, 2000s",
  "nk_boardroom":"confident corporate executives in suits smiling around a boardroom table, early 2000s",
  "nk_smartphone_stage":"a sleek modern glass touchscreen smartphone glowing alone on a dark stage",
  "nk_touchscreen":"a finger swiping a glowing modern smartphone touchscreen in the dark",
  "nk_decline_chart":"a steep red falling stock market chart on a large glowing screen in a dark room",
  "nk_empty_office":"an empty abandoned corporate office with vacant desks and dim light",
  "nk_ceo_podium":"a somber executive standing at a press conference podium under harsh light",
  "nk_old_phones_pile":"a large pile of discarded obsolete old mobile phones in shadow",
  "nk_handshake":"two businessmen shaking hands over a acquisition deal in a dim office",
  "nk_glass_hq":"a corporate glass headquarters tower under a grey overcast sky",
  "nk_sign_down":"workers removing a large corporate sign from the side of a building",
 },
 "xerox":{
  "xr_lab_70s":"a 1970s research laboratory full of early bulky computers and engineers, warm light",
  "xr_gui_screen":"a vintage boxy computer monitor from the 1970s showing a primitive graphical interface with windows",
  "xr_mouse":"an early wooden computer mouse prototype on a cluttered engineer's desk, 1970s",
  "xr_copier":"a large corporate office photocopier machine humming under fluorescent light",
  "xr_executives":"corporate executives in 1970s suits looking dismissive around a boardroom table",
  "xr_visitor_lab":"an excited young man in glasses touring a futuristic 1970s computer research lab",
  "xr_idea_glow":"a single glowing lightbulb above an old computer terminal in a dark room",
  "xr_money_copier":"tall stacks of cash next to an office photocopier, wealth, dramatic light",
  "xr_personal_computer":"a sleek early 1980s beige personal computer glowing on a desk in the dark",
  "xr_empty_chair":"a single empty executive chair at the head of a long dark boardroom table, regret",
  "xr_stock_soar":"a soaring green stock market chart climbing on a giant glowing screen in the dark",
  "xr_faded_hq":"a faded old corporate office building under a grey overcast sky, decline",
  "xr_museum":"a dusty obsolete vintage computer sitting alone in a dim museum, forgotten legacy",
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
print("AURELIS2 IMAGES DONE",flush=True)
