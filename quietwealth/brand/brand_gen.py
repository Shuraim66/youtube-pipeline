from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
OUT="/home/alpha/products/youtube-pipeline/quietwealth/brand"
SERIF="/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"
SERIF_BI="/usr/share/fonts/truetype/noto/NotoSerifDisplay-BoldItalic.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
# quiet-luxury palette
BG1=(11,12,15); BG2=(22,24,29); GOLD=(198,166,100); CREAM=(226,216,190)

def radial_bg(W,H,c1,c2,vig=1.0):
    img=Image.new("RGB",(W,H),c1); px=img.load()
    cx,cy=W/2,H/2; mx=math.hypot(cx,cy)
    for y in range(H):
        for x in range(0,W,2):
            t=(math.hypot(x-cx,y-cy)/mx)*vig
            t=min(1,t)
            r=int(c2[0]+(c1[0]-c2[0])*t); g=int(c2[1]+(c1[1]-c2[1])*t); b=int(c2[2]+(c1[2]-c2[2])*t)
            px[x,y]=(r,g,b)
            if x+1<W: px[x+1,y]=(r,g,b)
    return img

def spaced_text(draw, cx, cy, text, font, fill, tracking):
    # measure total width with tracking, draw centered
    widths=[draw.textlength(ch,font=font) for ch in text]
    total=sum(widths)+tracking*(len(text)-1)
    x=cx-total/2
    asc,desc=font.getmetrics(); h=asc+desc
    for ch,w in zip(text,widths):
        draw.text((x,cy-h/2),ch,font=font,fill=fill)
        x+=w+tracking
    return total

# ---------- AVATAR (1000x1000) ----------
A=1000
av=radial_bg(A,A,(9,10,13),(28,30,36),vig=1.15)
d=ImageDraw.Draw(av)
# thin gold ring
for r,wd,al in [(455,3,255),(430,1,90)]:
    d.ellipse([A/2-r,A/2-r,A/2+r,A/2+r],outline=(GOLD[0],GOLD[1],GOLD[2]),width=wd)
# monogram A
mf=ImageFont.truetype(SERIF,560)
bb=d.textbbox((0,0),"A",font=mf); w=bb[2]-bb[0]; h=bb[3]-bb[1]
d.text((A/2-w/2-bb[0], A/2-h/2-bb[1]-10),"A",font=mf,fill=GOLD)
av.save(f"{OUT}/avatar.png")
print("avatar saved")

# ---------- BANNER (2560x1440, safe center ~1546x423) ----------
W,H=2560,1440
bn=radial_bg(W,H,(9,10,13),(26,28,34),vig=1.0)
d=ImageDraw.Draw(bn)
# subtle top/bottom vignette bars for cinematic feel
grad=Image.new("L",(1,H),0)
for y in range(H):
    e=max(0, 1-abs(y-H/2)/(H/2))  # center bright
    grad.putpixel((0,y), int(30*(1-e)))
dark=Image.new("RGB",(W,H),(0,0,0))
bn=Image.composite(dark,bn,grad.resize((W,H)))
d=ImageDraw.Draw(bn)
cx=W//2; cy=H//2
# wordmark AURELIS
wf=ImageFont.truetype(SERIF,150)
spaced_text(d,cx,cy-40,"AURELIS",wf,CREAM,26)
# thin gold divider
d.line([cx-150,cy+55,cx+150,cy+55],fill=GOLD,width=2)
# tagline
tf=ImageFont.truetype(SANS,40)
spaced_text(d,cx,cy+110,"REAL WEALTH DOESN'T SHOUT",tf,(GOLD[0],GOLD[1],GOLD[2]),14)
bn.save(f"{OUT}/banner.png")
print("banner saved", bn.size)

# preview composite (avatar + banner stacked)
prev=Image.new("RGB",(1280,940),(20,20,24))
prev.paste(bn.resize((1280,720)),(0,0))
prev.paste(av.resize((200,200)),(60,730))
prev.save(f"{OUT}/preview.png")
print("done")
