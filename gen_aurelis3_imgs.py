"""Generate stills for 2 Aurelis business shorts (Yahoo, Sears) via Pollinations Flux."""
import urllib.request, urllib.parse, os, time, random
BASE="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
STYLE=", cinematic still, dramatic lighting, 35mm film photography, highly detailed, moody, vertical composition"
CASES={
 "yahoo":{
  "yh_office_90s":"a bustling late 1990s dot-com startup office full of workers at bulky computers, warm light",
  "yh_search_crt":"a vintage CRT computer monitor showing a simple early web search page, late 1990s desk",
  "yh_boardroom":"confident corporate executives in suits around a boardroom table, late 1990s",
  "yh_garage":"two young founders working late in a cramped garage startup with computers, late 1990s",
  "yh_reject":"a businessman across a table waving his hand to reject a deal, dim office, tense",
  "yh_cash_million":"an open briefcase full of neat stacks of one hundred dollar bills on a dark table",
  "yh_dorm_startup":"a college dorm room at night with a glowing laptop and code on screen, mid 2000s",
  "yh_decline_chart":"a steep red falling stock market chart on a large glowing screen in a dark room",
  "yh_server_room":"a glowing blue data center server room with rows of machines",
  "yh_ceo_window":"a somber executive in a suit staring out a high office window at dusk, regret",
  "yh_glass_hq":"a corporate glass headquarters tower glowing at dusk",
  "yh_billion_cash":"towering stacks of hundred dollar bills, immense wealth, dramatic light",
 },
 "sears":{
  "sr_dept_store":"a grand early 1900s department store interior full of goods and shoppers, cinematic",
  "sr_catalog":"a thick old mail order catalog lying open on a wooden table in warm lamplight",
  "sr_warehouse":"a huge early 1900s mail order warehouse full of packages and workers",
  "sr_kit_house":"a modest early 1900s wooden family house on a quiet street, nostalgic",
  "sr_mailbags":"piles of vintage mail order letters and paper packages on a sorting table",
  "sr_shopper_online":"a person shopping online on a glowing laptop at night in a dark room, modern",
  "sr_empty_mall":"a deserted dead shopping mall interior with closed empty stores, melancholy",
  "sr_closing_sign":"a big red STORE CLOSING liquidation sign in the window of a large department store",
  "sr_boardroom":"mid century corporate executives in suits around a boardroom table",
  "sr_faded_store":"a faded old department store facade under a grey overcast sky, decline",
  "sr_delivery_boxes":"modern cardboard delivery boxes stacked on a doorstep at night",
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
print("AURELIS3 IMAGES DONE",flush=True)
