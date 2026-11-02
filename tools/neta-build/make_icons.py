"""Draw the Mad Minute NETA home-screen icons (a meter needle over a lightning bolt, plus the word NETA).
Run: python3 make_icons.py <repo_dir>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

REPO = sys.argv[1]
OUT = os.path.join(REPO, "neta", "icons")
os.makedirs(OUT, exist_ok=True)
BG, AMBER, TEAL, WHITE = (18, 22, 27), (245, 166, 35), (45, 190, 170), (236, 240, 243)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def draw(size, pad=0.0):
    s = 1024
    im = Image.new("RGB", (s, s), BG)
    d = ImageDraw.Draw(im)
    k = 1 - 2 * pad                      # shrink the art for maskable icons
    def P(x, y): return (s / 2 + (x - s / 2) * k, s / 2 + (y - s / 2) * k)
    # meter arc
    r = 300 * k
    cx, cy = P(512, 560)
    d.arc([cx - r, cy - r, cx + r, cy + r], 200, 340, fill=TEAL, width=int(46 * k))
    # lightning bolt
    bolt = [(560, 190), (390, 520), (500, 520), (450, 720), (650, 400), (535, 400), (600, 190)]
    d.polygon([P(x, y) for x, y in bolt], fill=AMBER)
    # label
    f = ImageFont.truetype(FONT, int(170 * k))
    w = d.textlength("NETA", font=f)
    d.text((s / 2 - w / 2, P(0, 760)[1]), "NETA", font=f, fill=WHITE)
    return im.resize((size, size), Image.LANCZOS)

draw(192).save(os.path.join(OUT, "icon-192.png"))
draw(512).save(os.path.join(OUT, "icon-512.png"))
draw(180).save(os.path.join(OUT, "apple-touch-icon.png"))
draw(512, pad=0.1).save(os.path.join(OUT, "maskable-512.png"))
print("icons written to", OUT)
