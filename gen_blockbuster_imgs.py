"""Generate the 15 phrase-matched cinematic stills for the Blockbuster short via Pollinations Flux (keyless).
Vertical 832x1472, retries with backoff on 429. Writes to scratchpad/blockbuster/img/*.jpg"""
import urllib.request, urllib.parse, os, time, random
IMG="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/blockbuster/img"
os.makedirs(IMG,exist_ok=True)
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", cinematic still, dramatic lighting, 35mm film photography, highly detailed, moody, vertical composition"
SHOTS={
 "bl_pitch":"two nervous young startup founders in casual clothes pitching to skeptical executives across a glass boardroom table, tense atmosphere, late 1990s corporate office",
 "bl_laugh":"corporate executives in expensive suits laughing dismissively around a boardroom table, late 1990s office",
 "bl_store_night":"exterior of a large 1990s video rental store at night glowing blue and yellow neon light, empty parking lot",
 "bl_busy_store":"a crowded video rental store full of customers browsing shelves of movies in the 1990s, warm fluorescent light",
 "bl_vhs_shelves":"endless tall shelves packed with VHS tapes and DVD cases inside a video rental store, wide shot",
 "bl_startup_office":"a small cramped startup office late at night, a few young people working at bulky computers, 1990s",
 "bl_red_envelope":"a single red DVD mailer envelope sitting inside an open suburban mailbox, soft morning light, close up",
 "bl_cash":"towering neat stacks of hundred dollar bills on a dark table, wealth and money, dramatic light",
 "bl_angry_receipt":"a frustrated angry customer at a store checkout counter staring at a long receipt bill, shocked expression",
 "bl_streaming":"a person relaxing alone on a couch at night watching a large glowing television screen, dark living room, blue light",
 "bl_closing":"an abandoned video rental store with dusty empty shelves and a going out of business sign in the window, melancholy",
 "bl_liquidation":"a big red EVERYTHING MUST GO liquidation sale sign taped inside the window of an empty retail store, sad mood",
 "bl_glass_hq":"a modern glass corporate skyscraper headquarters glowing gold at dusk, powerful and wealthy, low angle",
 "bl_stock":"a soaring green stock market line chart climbing steeply on a giant glowing screen in a dark room, financial success",
 "bl_deal":"an empty executive chair at the head of a long dark boardroom table, a single spotlight, regret and missed opportunity",
}
def gen(name,prompt):
    dst=f"{IMG}/{name}.jpg"
    if os.path.exists(dst) and os.path.getsize(dst)>20000:
        print("skip",name,flush=True); return
    seed=random.randint(1,999999)
    url=f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt+STYLE)}?width=832&height=1472&model=flux&nologo=true&seed={seed}"
    for attempt in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=180) as r:
                data=r.read()
            if len(data)>20000:
                open(dst,"wb").write(data); print("OK",name,len(data),flush=True); return
        except Exception as e:
            print("retry",name,attempt,str(e)[:80],flush=True)
        time.sleep(8*(attempt+1)+random.random()*4)
    print("FAIL",name,flush=True)
for n,p in SHOTS.items():
    gen(n,p)
print("IMAGES DONE",flush=True)
