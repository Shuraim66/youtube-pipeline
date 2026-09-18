"""Generate The Night File brand assets: profile picture (800x800) + YouTube banner (2560x1440)."""
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
B="/tmp/claude-1000/-home-alpha-products-youtube-pipeline/d26cef8b-33f8-460d-a296-387d6471b220/scratchpad/brand"
ANTON="/home/alpha/products/openshorts/fonts/Anton-Regular.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
RED=(198,32,32); CREAM=(232,233,236); MANILA=(206,180,122); INK=(15,15,17)

def grain(img,amt=14):
    n=Image.effect_noise(img.size,amt).convert("L")
    return Image.blend(img,Image.merge("RGB",[n,n,n]),0.06)
def vignette(img,strength=0.85):
    w,h=img.size; m=Image.new("L",(w,h),0); d=ImageDraw.Draw(m)
    d.ellipse([-w*0.25,-h*0.25,w*1.25,h*1.25],fill=255); m=m.filter(ImageFilter.GaussianBlur(w*0.12))
    black=Image.new("RGB",(w,h),(0,0,0)); return Image.composite(img,black,m.point(lambda p:int(p*strength+ (255*(1-strength)))))

# ---------- PROFILE PICTURE ----------
S=800; pfp=Image.new("RGB",(S,S),INK); d=ImageDraw.Draw(pfp)
# subtle radial lift in center
for r in range(360,0,-4):
    a=int(22*(1-r/360)); d.ellipse([S/2-r,S/2-r,S/2+r,S/2+r],fill=(INK[0]+a,INK[1]+a,INK[2]+a))
# manila folder (tab + body) drawn on its own layer, slight rotate
fold=Image.new("RGBA",(560,440),(0,0,0,0)); fd=ImageDraw.Draw(fold)
fd.rounded_rectangle([40,70,300,150],radius=18,fill=MANILA)          # back tab
fd.rounded_rectangle([20,120,540,410],radius=26,fill=(220,196,140))  # body
fd.rounded_rectangle([20,120,540,180],radius=26,fill=(198,170,110))  # body top edge
# a few "document" lines peeking
for i,yy in enumerate(range(210,360,34)):
    fd.line([70,yy,490-i*30,yy],fill=(120,100,70),width=6)
fold=fold.rotate(6,expand=True,resample=Image.BICUBIC)
pfp.paste(fold,(int(S/2-fold.width/2),int(S/2-fold.height/2)+10),fold)
# red UNSOLVED stamp
stamp=Image.new("RGBA",(620,200),(0,0,0,0)); sd=ImageDraw.Draw(stamp)
sd.rounded_rectangle([10,10,610,190],radius=16,outline=(*RED,255),width=10)
fst=ImageFont.truetype(ANTON,120)
tw=sd.textlength("UNSOLVED",font=fst); sd.text((310-tw/2,28),"UNSOLVED",font=fst,fill=(*RED,255))
stamp=stamp.rotate(-11,expand=True,resample=Image.BICUBIC)
# distress the stamp with noise mask
mask=Image.effect_noise(stamp.size,90).point(lambda p:255 if p>96 else 0)
sa=stamp.split()[3]; sa=Image.composite(sa,Image.new("L",stamp.size,0),mask); stamp.putalpha(sa)
pfp.paste(stamp,(int(S/2-stamp.width/2),int(S/2-stamp.height/2)+8),stamp)
pfp=grain(vignette(pfp,0.8)); pfp.save(B+"/pfp.png"); print("PFP OK")

# ---------- BANNER (2560x1440, safe area ~1546x423 centered) ----------
W,H=2560,1440
bg=Image.open(B+"/banner_bg.jpg").convert("RGB")
# cover-fit
r=max(W/bg.width,H/bg.height); bg=bg.resize((int(bg.width*r),int(bg.height*r)),Image.LANCZOS)
bg=bg.crop(((bg.width-W)//2,(bg.height-H)//2,(bg.width-W)//2+W,(bg.height-H)//2+H))
bg=ImageEnhance.Color(bg).enhance(0.45); bg=ImageEnhance.Brightness(bg).enhance(0.52)
dark=Image.new("RGB",(W,H),(0,0,0)); bg=Image.blend(bg,dark,0.45)
bg=vignette(bg,0.7); ban=grain(bg); d=ImageDraw.Draw(ban)
cx=W//2; cy=H//2
# title
tf=ImageFont.truetype(ANTON,190)
t1="THE NIGHT "; t2="FILE"
w1=d.textlength(t1,font=tf); w2=d.textlength(t2,font=tf); tot=w1+w2; tx=cx-tot/2; ty=cy-150
for dx in(-3,3):
    for dy in(-3,3): d.text((tx+dx,ty+dy),t1,font=tf,fill=(6,6,8)); d.text((tx+w1+dx,ty+dy),t2,font=tf,fill=(6,6,8))
d.text((tx,ty),t1,font=tf,fill=CREAM); d.text((tx+w1,ty),t2,font=tf,fill=RED)
# red rule
d.rectangle([cx-150,ty+215,cx+150,ty+223],fill=RED)
# tagline (letter-spaced)
sf=ImageFont.truetype(SANS,58); tag="THE CASES NOBODY SOLVED"; sp=14
tw=sum(d.textlength(c,font=sf)+sp for c in tag)-sp; sx=cx-tw/2; sy=ty+250
for c in tag:
    d.text((sx,sy),c,font=sf,fill=(150,152,158)); sx+=d.textlength(c,font=sf)+sp
ban.save(B+"/banner.png"); print("BANNER OK")
