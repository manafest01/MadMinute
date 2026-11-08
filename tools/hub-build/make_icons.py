"""Draw the Mad Minute Hub home-screen icons (four tiles, one per app family, plus the word HUB).
Run: python3 make_icons.py <repo_dir>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

REPO = sys.argv[1]
OUT = os.path.join(REPO, "hub", "icons")
os.makedirs(OUT, exist_ok=True)
BG, AMBER, TEAL, WHITE, SLATE = (18, 22, 27), (242, 167, 59), (63, 184, 174), (236, 240, 243), (60, 72, 86)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def draw(size, pad=0.0):
    s = 1024
    im = Image.new("RGB", (s, s), BG)
    d = ImageDraw.Draw(im)
    k = 1 - 2 * pad                      # shrink the art for maskable icons
    def P(x, y): return (s / 2 + (x - s / 2) * k, s / 2 + (y - s / 2) * k)
    # 2 x 2 tiles: one per app family
    tile, gap, top = 230, 40, 170
    left = 512 - tile - gap / 2
    colors = [AMBER, TEAL, SLATE, AMBER]
    for i, c in enumerate(colors):
        x = left + (i % 2) * (tile + gap)
        y = top + (i // 2) * (tile + gap)
        a, b = P(x, y), P(x + tile, y + tile)
        d.rounded_rectangle([a, b], radius=int(48 * k), fill=c)
    # label
    f = ImageFont.truetype(FONT, int(150 * k))
    w = d.textlength("HUB", font=f)
    d.text((s / 2 - w / 2, P(0, 720)[1]), "HUB", font=f, fill=WHITE)
    return im.resize((size, size), Image.LANCZOS)

draw(192).save(os.path.join(OUT, "icon-192.png"))
draw(512).save(os.path.join(OUT, "icon-512.png"))
draw(180).save(os.path.join(OUT, "apple-touch-icon.png"))
draw(512, pad=0.1).save(os.path.join(OUT, "maskable-512.png"))
print("icons written to", OUT)
