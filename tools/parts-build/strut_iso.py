"""Build the isometric MacPherson Strut Corner for Exploded View (flashcards/parts-brakes.js).

Every part is modeled in 3D (X = outboard, Y = up, Z = forward, hub center at 0,0,0) and projected
to an isometric view seen from the front, outside and above the car. Each part is drawn around its
own anchor point; "e" is where the anchor sits taken apart (anchor + a 3D offset).
Run:  python3 tools/parts-build/strut_iso.py <repo>     (rewrites the strut-corner entry)
"""
import math, json, re, sys, os

C30 = math.cos(math.radians(30))
def P(v):                      # 3D -> 2D isometric
    x, y, z = v
    return (C30 * (x - z), 0.5 * (x + z) - y)
VIEW = (1, 1, 1)               # direction toward the viewer
def add(a, b): return tuple(i + j for i, j in zip(a, b))
def sub(a, b): return tuple(i - j for i, j in zip(a, b))
def mul(a, k): return tuple(i * k for i in a)
def dot(a, b): return sum(i * j for i, j in zip(a, b))
def cross(a, b): return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])
def norm(a): l = math.sqrt(dot(a, a)); return mul(a, 1 / l)

class Part:
    def __init__(self, anchor):
        self.anchor = anchor
        self.ax, self.ay = P(anchor)
        self.items, self.top, self.pts = [], [], []
    def _path(self, pts3, close=True):
        out = []
        for i, p in enumerate(pts3):
            x, y = P(p); x -= self.ax; y -= self.ay
            self.pts.append((x, y))
            out.append(("M" if i == 0 else "L") + "%.1f %.1f" % (x, y))
        return " ".join(out) + (" Z" if close else "")
    def poly(self, pts3, cls, top=False, close=True):
        (self.top if top else self.items).append('<path class="%s" d="%s"/>' % (cls, self._path(pts3, close)))
    def circle(self, c, axis, r, n=44):
        axis = norm(axis)
        h = (0, 1, 0) if abs(axis[1]) < 0.9 else (1, 0, 0)
        e1 = norm(cross(axis, h)); e2 = cross(axis, e1)
        return [add(c, add(mul(e1, r * math.cos(t)), mul(e2, r * math.sin(t)))) for t in [2 * math.pi * i / n for i in range(n)]]
    def ellipse(self, c, axis, r, cls, top=False):
        self.poly(self.circle(c, axis, r), cls, top)
    def cyl(self, c0, c1, r, cls, top=False, cap=None):
        axis = sub(c1, c0)
        near, far = (c1, c0) if dot(axis, VIEW) > 0 else (c0, c1)
        fp, np_ = self.circle(far, axis, r), self.circle(near, axis, r)
        d = sub(P(c1), P(c0)); L = math.hypot(*d)
        self.poly(fp, cls, top)
        if L > 0.01:
            n = (-d[1] / L, d[0] / L)
            proj = [dot(P(p), n) for p in fp]
            i, j = proj.index(max(proj)), proj.index(min(proj))
            self.poly([fp[i], np_[i], np_[j], fp[j]], cls, top)
        self.poly(np_, cap or cls, top)
    def box(self, x0, x1, y0, y1, z0, z1, cls, top=False):
        self.poly([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], cls, top)   # front (+Z)
        self.poly([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], cls, top)   # outboard (+X)
        self.poly([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], cls, top)   # top (+Y)
    def plate_zy(self, pts_zy, x0, x1, cls):        # flat shape in the Z-Y plane, thickness along X
        self.poly([(x0, y, z) for z, y in pts_zy], cls)
        self.poly([(x1, y, z) for z, y in pts_zy], cls)
    def hexagon_xy(self, cx, cy, z, r, cls):
        self.poly([(cx + r * math.cos(math.radians(30 + 60 * k)), cy + r * math.sin(math.radians(30 + 60 * k)), z) for k in range(6)], cls)
    def line(self, pts3, cls, top=False):
        self.poly(pts3, cls, top, close=False)
    def svg(self): return "".join(self.items), "".join(self.top)

LAT = (1, 0, 0)
TILT = math.radians(8)
AX = (-math.sin(TILT), math.cos(TILT), 0)          # strut axis, leaning inboard at the top
BASE = (-55, 118, 0)                                # bottom of the strut tube
def S(s): return add(BASE, mul(AX, s))

parts = {}

# strut mount
p = Part(S(170))
p.cyl(S(158), S(162), 42, "b")
p.cyl(S(162), S(176), 30, "r")
p.cyl(S(176), S(180), 34, "b")
for dz in (-16, 16):
    p.cyl(add(S(180), (0, 0, dz)), add(S(190), (0, 0, dz)), 3, "m")
p.cyl(S(170), S(181), 4, "m")
parts["mount"] = p

# coil spring: back half dimmed, front half solid
p = Part(S(98))
h = (0, 1, 0)
e1 = norm(cross(AX, (0, 0, 1))); e2 = cross(AX, e1)
turns, s0, s1, R = 5.5, 40, 157, 34
pts = []
for i in range(0, 331):
    t = i / 330
    ang = 2 * math.pi * turns * t
    c = S(s0 + (s1 - s0) * t)
    pts.append((add(c, add(mul(e1, R * math.cos(ang)), mul(e2, R * math.sin(ang)))), c))
back, front, cur, curback = [], [], [], None
for q, c in pts:
    isback = dot(sub(q, c), VIEW) < 0
    if curback is None: curback = isback
    if isback != curback:
        (back if curback else front).append(cur); cur = [cur[-1]] if cur else []; curback = isback
    cur.append(q)
(back if curback else front).append(cur)
for seg in back:
    if len(seg) > 1: p.line(seg, "l2 bk")
for seg in front:
    if len(seg) > 1: p.line(seg, "l2")
parts["spring"] = p

# strut
p = Part(S(55))
p.cyl(S(0), S(110), 14, "b")
p.cyl(S(34), S(38), 38, "b")
p.cyl(S(108), S(215), 3.5, "m")
p.cyl(S(110), S(150), 9, "r")
# knuckle clamp bracket: two jaws either side of the knuckle arm, bridged under the tube
p.box(-76, -68, 62, 118, -16, 16, "b")
p.box(-42, -34, 62, 118, -16, 16, "b")
p.box(-76, -34, 108, 118, -16, 16, "b")
parts["strut"] = p

# strut-to-knuckle bolts: run front to back, so the heads face us
p = Part((-55, 88, 0))
for y in (75, 101):                                 # shanks hide inside the clamp; heads sit in front
    p.cyl((-55, y, -22), (-55, y, 18), 5, "m")
for y in (101, 75):
    p.poly([(-55 + 8 * math.cos(math.radians(30 + 60 * k)), y + 8 * math.sin(math.radians(30 + 60 * k)), 18) for k in range(6)], "m", top=True)
    p.poly([(-55 + 8 * math.cos(math.radians(30 + 60 * k)), y + 8 * math.sin(math.radians(30 + 60 * k)), 23) for k in range(6)], "m", top=True)
parts["bolts"] = p

# steering knuckle (plate in the Z-Y plane)
p = Part((-55, 0, 0))
K = [(-12, 118), (12, 118), (14, 58), (32, 28), (38, 0), (30, -30), (14, -60), (10, -95), (-10, -95), (-16, -60),
     (-30, -36), (-90, -34), (-92, -18), (-36, -14), (-38, 0), (-32, 28), (-14, 58)]
p.plate_zy(K, -66, -44, "b")
p.ellipse((-44, 0, 0), LAT, 30, "l")
p.ellipse((-44, 0, 0), LAT, 24, "h")
parts["knuckle2"] = p

# dust shield
p = Part((-40, 0, 0))
p.cyl((-41, 0, 0), (-39, 0, 0), 93, "b")
p.ellipse((-39, 0, 0), LAT, 30, "h")
parts["shield2"] = p

# hub and bearing (studs drawn on top so they show through the rotor hat)
p = Part((-20, 0, 0))
p.cyl((-44, 0, 0), (-2, 0, 0), 24, "b")
p.cyl((-2, 0, 0), (6, 0, 0), 36, "b")
p.cyl((6, 0, 0), (13, 0, 0), 12, "b")
studs = []
for k in range(5):
    a = math.radians(90 + 72 * k)
    y, z = 26 * math.sin(a), 26 * math.cos(a)
    studs.append((y + z, y, z))
for _, y, z in sorted(studs):
    p.cyl((6, y, z), (36, y, z), 3, "m", top=True)
parts["hub2"] = p

# rotor: friction disc inboard, hat out toward the wheel
p = Part((-22, 0, 0))
p.cyl((-30, 0, 0), (-14, 0, 0), 88, "b")
p.ellipse((-14, 0, 0), LAT, 80, "l")
p.ellipse((-14, 0, 0), LAT, 50, "l")
p.cyl((-14, 0, 0), (8, 0, 0), 44, "b")
p.ellipse((8, 0, 0), LAT, 14, "h")
for k in range(5):
    a = math.radians(90 + 72 * k)
    p.ellipse((8, 26 * math.sin(a), 26 * math.cos(a)), LAT, 4.5, "h")
parts["rotor3"] = p

# caliper at the back of the rotor: almost all of it hides behind the disc
p = Part((-34, 10, -86))
p.box(-64, -34, -24, 44, -104, -72, "b")           # inboard body (piston side)
p.box(-64, -2, -20, 40, -110, -96, "b")            # bridge over the disc edge
p.box(-12, -2, -18, 38, -104, -78, "b")            # outboard fingers
p.cyl((-50, 44, -88), (-50, 54, -88), 3, "m")     # bleeder
parts["caliper3"] = p

# outer tie rod end: steering arm points back, tie rod runs inboard to the rack
p = Part((-66, -40, -80))
p.cyl((-66, -34, -80), (-66, -18, -80), 4, "m")
p.cyl((-66, -50, -80), (-66, -36, -80), 10, "b")
p.cyl((-200, -42, -80), (-76, -42, -80), 4, "m")
p.cyl((-150, -42, -80), (-140, -42, -80), 7, "m")
parts["tierod"] = p

# lower ball joint
p = Part((-55, -104, 0))
p.cyl((-55, -116, 0), (-55, -104, 0), 14, "b")
p.cyl((-55, -104, 0), (-55, -94, 0), 10, "r")
p.cyl((-55, -94, 0), (-55, -80, 0), 5, "m")
parts["balljoint"] = p

# lower control arm: runs inboard to two bushings on the subframe
p = Part((-120, -114, 0))
p.poly([(-70, -110, 18), (-70, -110, -18), (-200, -110, -60), (-215, -110, -50), (-215, -110, 40), (-200, -110, 50)], "b")
p.poly([(-70, -110, 18), (-200, -110, 50), (-200, -122, 50), (-70, -122, 18)], "b")
p.poly([(-70, -110, 18), (-70, -110, -18), (-70, -122, -18), (-70, -122, 18)], "b")
p.cyl((-208, -116, 34), (-208, -116, 58), 10, "r")
p.cyl((-208, -116, -64), (-208, -116, -40), 10, "r")
parts["lca"] = p

# CV axle from the transaxle; the axle nut sits on the hub face (drawn on top)
p = Part((-110, 0, 0))
p.cyl((-230, 0, 0), (-120, 0, 0), 6, "m")
for i, x in enumerate(range(-120, -80, 8)):
    p.cyl((x, 0, 0), (x + 8, 0, 0), 14 + (i % 2) * 6 + i * 1.5, "r")
p.cyl((-80, 0, 0), (-50, 0, 0), 26, "b")
p.cyl((13, 0, 0), (22, 0, 0), 10, "m", top=True)
parts["axle"] = p

EXPLODE = {
    "mount": mul(AX, 150), "spring": mul(AX, 100), "strut": mul(AX, 50), "bolts": (0, 0, 70),
    "knuckle2": (0, 0, 0), "shield2": (34, 0, 0), "hub2": (80, 0, 0), "rotor3": (240, 0, 0),
    "caliper3": (0, 40, -80), "tierod": (-30, -60, 60), "balljoint": (0, -46, 0), "lca": (0, -84, 0),
    "axle": (-110, 0, 0),
}
Z = {"axle": -4, "lca": -3, "tierod": -3, "balljoint": -2, "caliper3": -1, "knuckle2": 0, "shield2": 0, "strut": 1,
     "bolts": 0, "spring": 2, "mount": 2, "hub2": 0, "rotor3": 1}

def place(state):
    out = {}
    for k, prt in parts.items():
        a = prt.anchor if state == "a" else add(prt.anchor, EXPLODE[k])
        out[k] = P(a)
    return out
def bounds(pos):
    xs, ys = [], []
    for k, prt in parts.items():
        for x, y in prt.pts:
            xs.append(x + pos[k][0]); ys.append(y + pos[k][1])
    return min(xs), min(ys), max(xs), max(ys)
A, E = place("a"), place("e")
ax0, ay0, ax1, ay1 = bounds(A)
ex0, ey0, ex1, ey1 = bounds(E)
# shift everything so the taken-apart view starts near 0,0
ox, oy = -ex0 + 22, -ey0 + 24
def R(v): return [round(v[0] + ox, 1), round(v[1] + oy, 1)]
pad = 16
viewE = "0 0 %d %d" % (round(ex1 - ex0 + 44), round(ey1 - ey0 + 40))
viewA = "%d %d %d %d" % (round(ax0 + ox - pad), round(ay0 + oy - pad), round(ax1 - ax0 + 2 * pad), round(ay1 - ay0 + 2 * pad))

SIDE = {"spring", "strut", "bolts", "tierod", "knuckle2"}   # these get their number to the right instead of on top
def badge(k):           # taken apart: above the middle of the part, or beside it
    xs = [x + E[k][0] for x, y in parts[k].pts]; ys = [y + E[k][1] for x, y in parts[k].pts]
    if k in SIDE:
        return [round(max(xs) + ox + 12, 1), round((min(ys) + max(ys)) / 2 + oy, 1)]
    return [round((min(xs) + max(xs)) / 2 + ox, 1), round(min(ys) + oy - 12, 1)]
BADGE_FIX = {}

INFO = [
 ("mount", "Strut mount", 1, "Bolts the top of the strut to the strut tower. Its rubber soaks up noise, and its bearing lets the strut and spring turn when you steer.",
  "A clunk or a springy, binding feel when steering at low speed often points to a worn mount or its bearing."),
 ("spring", "Coil spring", 2, "Holds up the car's weight and sets ride height. On a MacPherson strut it sits right on the strut, between the strut mount and the lower spring seat.",
  "Only take a strut apart with a proper strut spring compressor. A loaded spring stores a lot of energy."),
 ("strut", "Strut", 3, "A shock absorber that is also part of the suspension. It damps bounce and holds the top of the knuckle in place, so its angle helps set camber and caster.",
  "Oil on the strut body, a bouncy ride or cupped tires point to a worn strut. Replace them in pairs on an axle."),
 ("bolts", "Strut-to-knuckle bolts", 4, "Two bolts clamp the strut's bracket around the top of the knuckle. They run front to back. On some cars one is a cam bolt for setting camber.",
  "Mark the bolts before you pull them so camber lands close, then get an alignment."),
 ("knuckle2", "Steering knuckle", 5, "The part the wheel turns on. The strut clamps to its top, the ball joint to its bottom and the tie rod to its steering arm; the hub bearing and the brake mount to it.",
  "After a curb strike, check the knuckle and steering arm for cracks or bends. A bent one won't align."),
 ("shield2", "Dust shield", None, "A thin metal shield between the knuckle and the rotor that keeps water, dirt and stones off the brake.",
  "A bent shield rubbing the rotor makes a scraping noise. Bend it back carefully."),
 ("hub2", "Hub and bearing", 6, "Spins on a sealed bearing in the knuckle. The CV axle splines through it, and its flange holds the wheel studs.",
  "A growl that changes as you load the car side to side in a turn often points to a wheel bearing."),
 ("rotor3", "Brake rotor", None, "The disc the pads squeeze. Its hat slips over the hub studs, and the wheel clamps it to the hub flange.",
  "Clean the rust off the hub face before the rotor goes on, or it will run out and pulse the pedal."),
 ("caliper3", "Brake caliper and pads", None, "Clamps the pads onto the rotor when you brake. Here it sits at the back of the rotor, so from the front you only see its edge.",
  "Never let the caliper hang by its brake hose. Hang it from the spring or strut with a hook."),
 ("tierod", "Outer tie rod end", None, "Links the steering rack to the knuckle's steering arm, so turning the steering wheel turns the knuckle. It is where toe is set.",
  "Count the turns when you swap one so toe lands close, then get an alignment."),
 ("balljoint", "Lower ball joint", None, "A ball-and-socket pivot that joins the bottom of the knuckle to the lower control arm, so the knuckle can steer and move up and down.",
  "Check it for play the way the service info says (often with the weight off the joint). A worn one can separate."),
 ("lca", "Lower control arm", None, "Holds the bottom of the knuckle in place front to back and side to side. It pivots on rubber bushings at the subframe.",
  "Torn bushings cause clunks and wander. Tighten bushing bolts with the car at ride height."),
 ("axle", "CV axle", None, "The drive shaft from the transaxle to the wheel (front-wheel drive). The outer CV joint keeps it turning the wheel smoothly while the knuckle steers.",
  "Clicking on tight turns usually means a worn outer CV joint. A torn boot is the early warning."),
]

def js(s): return json.dumps(s, ensure_ascii=False)
rows = []
for k, name, order, meaning, tip in INFO:
    d, top = parts[k].svg()
    row = '    { id: %s, name: %s, order: %s, a: %s, e: %s, n: %s, z: %d,\n      meaning: %s,\n      tip: %s,\n      d: %s%s }' % (
        js(k), js(name), "null" if order is None else order, json.dumps(R(A[k])), json.dumps(R(E[k])),
        json.dumps(BADGE_FIX.get(k) or badge(k)), Z[k], js(meaning), js(tip), js(d), (",\n      dTop: " + js(top)) if top else "")
    rows.append(row)
entry = '''(window.MM_PARTS = window.MM_PARTS || []).push(
{
  key: "strut-corner", pack: "auto", topic: "Steering & Suspension",
  name: "MacPherson Strut Corner", sub: "3/4 view from the front and outside",
  explode: true, startTogether: true, view: %s, viewTogether: %s,
  orderTitle: "Follow the weight down to the wheel",
  orderHint: "Tap the parts in the order the car's weight passes through them, from the strut tower down to the hub.",
  orderNote: "On a MacPherson strut the coil spring sits on the strut, so the weight goes body → strut mount → spring → strut → bolts → knuckle → hub → wheel. The lower control arm and ball joint hold the bottom of the knuckle in place but don't carry the spring's load. Drawn as a 3/4 (isometric) view from the front and outside of the car, so the caliper at the back of the rotor is mostly out of sight. Generated by tools/parts-build/strut_iso.py.",
  parts: [
%s
  ]
}
);
''' % (js(viewE), js(viewA), ",\n".join(rows))

repo = sys.argv[1] if len(sys.argv) > 1 else "."
fp = os.path.join(repo, "flashcards", "parts-brakes.js")
src = open(fp, encoding="utf-8").read()
i = src.index('(window.MM_PARTS = window.MM_PARTS || []).push(\n{\n  key: "strut-corner"')
src = src[:i] + entry
open(fp, "w", encoding="utf-8").write(src)
print("views:", viewE, "|", viewA)
