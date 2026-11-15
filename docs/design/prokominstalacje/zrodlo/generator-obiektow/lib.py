# Biblioteka scen „Dla kogo”: przekroje budynków w SVG + hotspoty
SV = {
 'kam': ('Monitoring i kamery', 'Monitoring.dc.html', '#12B6D8', 'bez'),
 'alarm': ('Alarmy i wideodomofony', 'Alarmy.dc.html', '#F07A6A', 'bez'),
 'kd': ('Kontrola dostępu i zamki', 'Dostep.dc.html', '#F2B84B', 'bez'),
 'wifi': ('Sieci i Wi-Fi', 'Sieci.dc.html', '#5B8CF0', 'net'),
 'tel': ('Teletechnika', 'Teletechnika.dc.html', '#8C9CF5', 'net'),
 'ant': ('Anteny RTV/SAT', 'Anteny.dc.html', '#B58CF0', 'net'),
 'smart': ('Smart home Ampio', 'SmartHome.dc.html', '#7BD36A', 'kom'),
 'snd': ('Nagłośnienie', 'Naglosnienie.dc.html', '#F29A4B', 'av'),
 'scr': ('Ekrany i transmisja', 'Multimedia.dc.html', '#E86FB0', 'av'),
 'ev': ('Ładowarki samochodów', 'Ladowarki.dc.html', '#5FD0B0', 'kom'),
}
LY = [('', 'Wszystko'), ('bez', 'Bezpieczeństwo'), ('net', 'Sieć i łączność'), ('av', 'Dźwięk i obraz'), ('kom', 'Komfort i energia')]

def R(x, y, w, h, c, rx=0, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="{c}"{extra}></rect>'
def Pth(d, c, extra=''):
    return f'<path d="{d}" class="{c}"{extra}></path>'
def T(x, y, t, c='sglb', a='start'):
    return f'<text x="{x}" y="{y}" class="{c}" text-anchor="{a}">{t}</text>'
def C(x, y, r, c):
    return f'<circle cx="{x}" cy="{y}" r="{r}" class="{c}"></circle>'
def L(x1, y1, x2, y2, c):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{c}"></line>'
def win(x, y, w, h, lit=True):
    return R(x, y, w, h, 'sgwin' + (' lit' if lit else ''), 2) + L(x + w / 2, y, x + w / 2, y + h, 'sgmull') + L(x, y + h / 2, x + w, y + h / 2, 'sgmull')
def person(x, y, s=1.0, c='sgpp'):
    return f'<g class="{c}" transform="translate({x} {y}) scale({s})"><circle cx="0" cy="-26" r="5"></circle><path d="M-6 -18 h12 l2 18 h-4 l-1 14 h-6 l-1 -14 h-4 z"></path></g>'
def tree(x, y, s=1.0):
    return f'<g class="sgtree" transform="translate({x} {y}) scale({s})"><path d="M0 0 V-14"></path><path d="M-14 -12 L0 -52 L14 -12 Z"></path><path d="M-11 -30 L0 -62 L11 -30 Z"></path></g>'
def car(x, y, s=1.0):
    return f'<g class="sgcar" transform="translate({x} {y}) scale({s})"><path d="M-30 0 v-10 l8 -10 h34 l10 10 h8 v10 z"></path><circle cx="-18" cy="0" r="5" class="sgwh"></circle><circle cx="18" cy="0" r="5" class="sgwh"></circle><path d="M-18 -18 h10 v8 h-16 z M-6 -18 h16 l6 8 h-22 z" class="sgcw"></path></g>'

def fx(kind, x, y, a=0, r=60):
    if kind == 'cone':
        import math
        a1 = math.radians(a - 26); a2 = math.radians(a + 26)
        return f'<path class="hsfx cone" d="M{x} {y} L{x + r * math.cos(a1):.1f} {y + r * math.sin(a1):.1f} A{r} {r} 0 0 1 {x + r * math.cos(a2):.1f} {y + r * math.sin(a2):.1f} Z"></path>'
    if kind == 'ring':
        return ''.join(f'<circle class="hsfx ring r{i}" cx="{x}" cy="{y}" r="{r * (i + 1) / 3:.0f}"></circle>' for i in range(3))
    if kind == 'arc':
        import math
        out = ''
        for i in range(3):
            rr = 16 + i * 12
            a1 = math.radians(a - 35); a2 = math.radians(a + 35)
            out += f'<path class="hsfx arc r{i}" d="M{x + rr * math.cos(a1):.1f} {y + rr * math.sin(a1):.1f} A{rr} {rr} 0 0 1 {x + rr * math.cos(a2):.1f} {y + rr * math.sin(a2):.1f}"></path>'
        return out
    if kind == 'loop':
        return f'<path class="hsfx loopl" d="M{x - r} {y} h{2 * r}"></path>'
    return ''

def hotspot(i, h):
    x, y = h['x'], h['y']
    col = SV[h['s']][2]
    f = fx(h.get('fx', ''), x, y, h.get('a', 0), h.get('r', 60)) if h.get('fx') else ''
    return (f'<g class="{{{{sg.hc.k{i}}}}}" style="--c:{col}" onClick="{{{{sg.hp.k{i}}}}}" role="button" tabindex="0" aria-label="{i + 1}. {h["t"]}">'
            f'{f}<circle class="hsx" cx="{x}" cy="{y}" r="24"></circle><circle class="hsh" cx="{x}" cy="{y}" r="17"></circle><circle class="hsd" cx="{x}" cy="{y}" r="11.5"></circle>'
            f'<text class="hsn" x="{x}" y="{y + 4.2}" text-anchor="middle">{i + 1}</text></g>')

def scene(art, hs, vb='0 0 720 470'):
    pts = ''.join(hotspot(i, h) for i, h in enumerate(hs))
    return (f'<svg class="sgsvg" viewBox="{vb}" role="img" aria-label="Przekrój obiektu z zaznaczonymi instalacjami">'
            f'<defs><linearGradient id="sgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sgs1"></stop><stop offset="1" class="sgs2"></stop></linearGradient>'
            f'<pattern id="sgHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V8" class="sghl" fill="none"></path></pattern>'
            f'<pattern id="sgShin" width="12" height="9" patternUnits="userSpaceOnUse"><path d="M0 9 Q3 3 6 9 Q9 3 12 9" class="sgshl" fill="none"></path></pattern>'
            f'<pattern id="sgPlank" width="9" height="40" patternUnits="userSpaceOnUse"><path d="M0 0V40" class="sgpkl" fill="none"></path></pattern>'
            f'<radialGradient id="sgGlow"><stop offset="0" class="sgg1"></stop><stop offset="1" class="sgg2"></stop></radialGradient></defs>'
            f'<rect x="0" y="0" width="720" height="470" fill="url(#sgSky)"></rect>{stars()}{art}<g class="hsl">{pts}</g></svg>')

def stars():
    import random
    rnd = random.Random(7)
    return '<g class="sgstars">' + ''.join(f'<circle cx="{rnd.randint(4, 716)}" cy="{rnd.randint(4, 200)}" r="{rnd.choice([0.8, 1, 1.3])}"></circle>' for _ in range(46)) + '<circle cx="640" cy="54" r="16" class="sgmoon"></circle></g>'
def glow(x, y, r):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#sgGlow)" class="sgglow"></circle>'
def over(x, y, w, h, pat):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#{pat})" class="sgover"></rect>'
