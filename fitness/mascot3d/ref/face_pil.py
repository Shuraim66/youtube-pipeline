from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
im=Image.open('short_2.png').convert('RGB')
# 1) erase face features: blur + desaturate a feathered ellipse over brow->chin
fb=(218,68,294,154)
face=im.crop(fb)
face=face.filter(ImageFilter.GaussianBlur(6))
face=ImageEnhance.Color(face).enhance(0.35)      # kill lip/eye colour
mask=Image.new('L',face.size,0); ImageDraw.Draw(mask).ellipse((3,3,face.width-3,face.height-3),fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(11))
im.paste(face,(fb[0],fb[1]),mask)
# second light pass to smooth more
face2=im.crop(fb).filter(ImageFilter.GaussianBlur(5))
im.paste(face2,(fb[0],fb[1]),mask)
# 2) add two white rimmed eyes
d=ImageDraw.Draw(im)
for ex in (243,270):
    d.ellipse((ex-11,84,ex+11,108),fill=(22,22,28))      # dark rim
    d.ellipse((ex-8.5,87,ex+8.5,105),fill=(248,248,248)) # white
im.save('char2d.png'); print("DONE")
