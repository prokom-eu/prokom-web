import json, math
d=json.load(open('osm_rabka.json')); G=d['G']
def lab(n, a, b, txt=None, dy=-6, size=12):
    ang=math.degrees(math.atan2(b[1]-a[1], b[0]-a[0]))
    if ang>90: ang-=180
    if ang<-90: ang+=180
    x=(a[0]+b[0])/2; y=(a[1]+b[1])/2
    return '<text class="mlb" transform="translate(%.1f %.1f) rotate(%.1f)" text-anchor="middle" dy="%d" font-size="%d">%s</text>' % (x,y,ang,dy,size,txt or n)
L={l['n']:l for l in d['labels']}
labels=lab('', L['Władysława Orkana']['a'], L['Władysława Orkana']['b'], 'ul. Orkana') + lab('', [282,454.5],[263,502],'ul. Zakopiańska') + lab('', [411.5,144.5],[432.5,101],'ul. Piłsudskiego')
svg='''<svg class="omap" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa: PRO-KOM, ul. Orkana 16B w Rabce-Zdroju, przy dworcu i placu św. Mikołaja">
<rect width="800" height="560" class="mbg"/>
<path class="mgr" d="%(green)s"/><path class="mwd" d="%(wood)s"/><path class="mpk" d="%(park)s"/><path class="mwt" d="%(water)s"/>
<path class="mww" d="%(ww)s"/>
<path class="mb" d="%(b)s"/>
<path class="mr4" d="%(r4)s"/><path class="mr3c" d="%(r3)s"/><path class="mr2c" d="%(r2)s"/><path class="mr1c" d="%(r1)s"/>
<path class="mr3" d="%(r3)s"/><path class="mr2" d="%(r2)s"/><path class="mr1" d="%(r1)s"/>
<path class="mrl" d="%(rail)s"/>
<path class="mtg" d="%(target)s"/>
<g class="mpin" transform="translate(411 256)"><circle class="mpp" r="16"/><path class="mpb" d="M0 0c-9-11-14-17-14-24a14 14 0 0 1 28 0c0 7-5 13-14 24z" transform="translate(0 -6)"/><circle class="mpc" cy="-30" r="5.5"/></g>
%(labels)s
<g class="mpoi" transform="translate(296 318)"><circle r="11"/><path d="M-5 -4h10v6h-10zM-4 4l-1.5 2.5M4 4l1.5 2.5M-5 -1h10" fill="none" stroke-width="1.6" stroke-linecap="round"/></g>
<text class="mlb mlb2" x="282" y="350" text-anchor="end" font-size="12">Dworzec · pl. św. Mikołaja</text>
</svg>''' % dict(G, target=d['target'], labels=labels)
open('map_svg.html','w').write(svg)
css='''.omap{display:block;width:100%;height:100%}
.omap .mbg{fill:var(--mbg)}.omap .mgr{fill:var(--mgr)}.omap .mwd{fill:var(--mwd)}.omap .mpk{fill:var(--mpk)}.omap .mwt{fill:var(--mwt)}
.omap .mww{fill:none;stroke:var(--mwt);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.omap .mb{fill:var(--mbd);stroke:var(--mbs);stroke-width:.8}
.omap .mr4{fill:none;stroke:var(--mr4);stroke-width:1.4;stroke-dasharray:3 3;stroke-linecap:round}
.omap .mr3c,.omap .mr2c,.omap .mr1c{fill:none;stroke:var(--mrc);stroke-linecap:round;stroke-linejoin:round}
.omap .mr3c{stroke-width:7}.omap .mr2c{stroke-width:11}.omap .mr1c{stroke-width:16}
.omap .mr3,.omap .mr2,.omap .mr1{fill:none;stroke:var(--mrd);stroke-linecap:round;stroke-linejoin:round}
.omap .mr3{stroke-width:4.5}.omap .mr2{stroke-width:8}.omap .mr1{stroke-width:12.5;stroke:var(--mr1)}
.omap .mrl{fill:none;stroke:var(--mrl);stroke-width:3;stroke-dasharray:10 6}
.omap .mtg{fill:var(--accent);stroke:var(--card);stroke-width:2}
.omap .mlb{font-family:Manrope,system-ui,sans-serif;font-weight:800;fill:var(--mlb);paint-order:stroke;stroke:var(--mbg);stroke-width:4px;stroke-linejoin:round;letter-spacing:.01em}
.omap .mlb2{font-weight:700}\n.omap .mpb{fill:var(--accent);stroke:#fff;stroke-width:2.5}.omap .mpc{fill:#fff}.omap .mpp{fill:var(--accent);opacity:.25;transform-origin:center;animation:mpulse 2.4s ease-out infinite}\n@keyframes mpulse{0%{transform:scale(.4);opacity:.45}100%{transform:scale(2.2);opacity:0}}\n@media (prefers-reduced-motion:reduce){.omap .mpp{animation:none}}
.omap .mpoi circle{fill:var(--card);stroke:var(--mlb);stroke-width:1.5}.omap .mpoi path{stroke:var(--mlb)}
.pk[data-theme="light"] .omap,.pk .omap{--mbg:#EEF0EA;--mgr:#DCE6D2;--mwd:#CFDDC4;--mpk:#E4E5E0;--mwt:#C9DCE6;--mbd:#DDDFD8;--mbs:#CDD0C7;--mrc:#C9CCC3;--mrd:#FFFFFF;--mr1:#FFFFFF;--mr4:#B4B8AE;--mrl:#9EA39A;--mlb:#2E342F}
.pk[data-theme="dark"] .omap,.pk:not([data-theme="light"]) .omap{--mbg:#161A17;--mgr:#1B241C;--mwd:#1D281E;--mpk:#1B1F1C;--mwt:#1A2A33;--mbd:#232824;--mbs:#2C322D;--mrc:#0E110F;--mrd:#3A403B;--mr1:#4A514B;--mr4:#3E443F;--mrl:#5A615B;--mlb:#D9DDD8}
'''
open('map.css','w').write(css)
print(len(svg))
