from lib import *
from lib import glow, over

def mountains():
    return (Pth('M0 360 L70 300 L120 330 L190 262 L260 318 L330 276 L400 326 L470 270 L540 316 L610 280 L680 322 L720 300 V470 H0 Z', 'sgmt1')
            + Pth('M172 274 L190 262 L208 276 L198 272 L190 278 L182 271 Z M454 280 L470 270 L486 282 L476 279 L470 284 L462 279 Z', 'sgsnow')
            + Pth('M0 392 L90 350 L170 376 L260 340 L350 380 L440 346 L530 382 L620 352 L720 380 V470 H0 Z', 'sgmt2'))

def ground(y=430):
    return R(0, y, 720, 470 - y, 'sggr')

def kosciol():
    a = mountains() + ground()
    # wieża
    a += tree(36, 432, 1.1) + tree(706, 432, .8) + tree(22, 436, .7)
    a += R(70, 72, 80, 358, 'sgw') + over(70, 72, 80, 358, 'sgPlank') + Pth('M62 74 L110 10 L158 74 Z', 'sgroof') + Pth('M62 74 L110 10 L158 74 Z', 'sgover', ' fill="url(#sgShin)"') + L(110, 10, 110, -2, 'sgcross') + L(104, 2, 116, 2, 'sgcross')
    a += Pth('M96 120 v-16 a14 14 0 0 1 28 0 v16 z', 'sgwin') + Pth('M102 116 q8 -18 16 0 z', 'sgbell') + R(84, 150, 52, 8, 'sgsill') + Pth('M93 430 v-42 a17 17 0 0 1 34 0 v42 z', 'sgdoor')
    a += R(80, 252, 60, 3, 'sgsill') + T(110, 300, 'Wieża', 'sglb', 'middle')
    # nawa (przekrój)
    a += R(150, 228, 462, 202, 'sgw') + R(160, 238, 442, 192, 'sgin')
    a += Pth('M138 232 L381 126 L624 232 L608 238 L381 142 L154 238 Z', 'sgroof') + Pth('M162 300 Q381 168 600 300', 'sgvault')
    a += glow(381, 330, 170) + glow(575, 360, 70)
    a += L(420, 200, 420, 262, 'sgrail') + Pth('M398 262 q22 12 44 0', 'sgchand') + ''.join(C(398 + i * 11, 258, 2.4, 'sgflame') for i in range(5))
    for x in (282, 392, 502):
        a += Pth(f'M{x} 330 v-50 a14 14 0 0 1 28 0 v50 z', 'sgstain') + L(x + 14, 266, x + 14, 330, 'sgmull')
    for x in (300, 440):
        a += R(x - 4, 238, 8, 192, 'sgpil')
    # chór i organy
    a += R(160, 302, 104, 8, 'sgfl') + L(160, 290, 264, 290, 'sgrail')
    for i, hh in enumerate([34, 46, 58, 66, 58, 46, 34, 40, 52]):
        a += R(172 + i * 9, 300 - hh, 6, hh, 'sgorg', 2)
    a += T(212, 326, 'Chór', 'sglb', 'middle')
    # ławki i wierni
    for i, x in enumerate(range(318, 520, 26)):
        a += Pth(f'M{x} 430 v-24 h18 v8 h-14 v16', 'sgfu')
        if i in (1, 2, 4, 6):
            a += person(x + 9, 420, .62)
    # prezbiterium
    a += R(526, 414, 76, 16, 'sgfl') + R(556, 386, 38, 28, 'sgalt', 2) + C(562, 380, 2.6, 'sgflame') + C(588, 380, 2.6, 'sgflame') + L(562, 383, 562, 386, 'sgrail') + L(588, 383, 588, 386, 'sgrail') + L(575, 300, 575, 352, 'sgcross') + L(564, 314, 586, 314, 'sgcross')
    a += Pth('M520 340 h24 l-3 18 h-18 z', 'sgfu') + L(532, 358, 532, 414, 'sgrail')
    a += R(534, 266, 52, 30, 'sgscr', 3) + L(542, 276, 576, 276, 'sgtx') + L(542, 284, 570, 284, 'sgtx')
    a += T(560, 452, 'Prezbiterium', 'sglb2', 'middle') + T(340, 452, 'Nawa', 'sglb2', 'middle') + Pth('M92 430 l-14 40 h64 l-14 -40 z', 'sgpath')
    a += person(150, 452, .7) + person(170, 456, .66)
    # głośniki kolumnowe, kamera, skarbona
    for x in (306, 446):
        a += R(x, 298, 7, 40, 'sgdev', 2)
    a += R(230, 282, 16, 9, 'sgdev', 2) + R(180, 396, 16, 18, 'sgbox', 2)
    a += Pth('M318 425 h200', 'sgloop')
    # zakrystia
    a += R(612, 332, 80, 98, 'sgw') + over(612, 332, 80, 98, 'sgPlank') + R(620, 340, 64, 90, 'sgin') + Pth('M606 334 L652 302 L698 334 Z', 'sgroof')
    a += R(662, 378, 16, 52, 'sgrack', 2) + R(626, 346, 22, 6, 'sgdev', 2) + T(652, 456, 'Zakrystia', 'sglb2', 'middle')
    # głośnik na wieży
    a += Pth('M118 200 l10 -6 v20 l-10 -6 z', 'sgdev')
    return a

HS = {
 'kosciol': [
  {'x': 309, 'y': 318, 's': 'snd', 'fx': 'arc', 'a': 0, 't': 'Kolumny głośnikowe na filarach'},
  {'x': 532, 'y': 346, 's': 'snd', 't': 'Mikrofony przy ołtarzu i ambonie'},
  {'x': 418, 'y': 441, 's': 'snd', 'fx': 'loop', 'r': 100, 't': 'Pętla indukcyjna w ławkach'},
  {'x': 238, 'y': 280, 's': 'scr', 'fx': 'cone', 'a': 19, 'r': 300, 't': 'Kamera do transmisji mszy'},
  {'x': 560, 'y': 262, 's': 'scr', 't': 'Ekran z tekstami pieśni'},
  {'x': 188, 'y': 382, 's': 'kam', 'fx': 'cone', 'a': -150, 'r': 70, 't': 'Kamera przy wejściu i skarbonie'},
  {'x': 637, 'y': 362, 's': 'alarm', 'fx': 'ring', 'r': 40, 't': 'Alarm w zakrystii'},
  {'x': 118, 'y': 204, 's': 'snd', 'fx': 'arc', 'a': 180, 't': 'Głośniki zewnętrzne na odpust'},
  {'x': 670, 'y': 396, 's': 'wifi', 'fx': 'ring', 'r': 46, 't': 'Szafa: mikser, rejestrator, łącze'},
 ],
}
ART = {'kosciol': kosciol}

def table(x, y, ppl=True):
    s = Pth(f'M{x - 18} {y} h36', 'sgtab') + L(x, y, x, y + 16, 'sgrail') + L(x - 8, y + 16, x + 8, y + 16, 'sgrail')
    if ppl:
        s += person(x - 24, y + 18, .55) + person(x + 24, y + 18, .55)
    return s

def restauracja():
    a = mountains() + ground() + tree(24, 432, .9) + tree(700, 436, .7)
    # budynek góralski
    a += R(60, 205, 500, 225, 'sgw') + over(60, 205, 500, 225, 'sgPlank') + R(70, 215, 480, 215, 'sgin')
    a += Pth('M36 210 L310 84 L584 210 L566 216 L310 100 L54 216 Z', 'sgroof') + Pth('M36 210 L310 84 L584 210 L566 216 L310 100 L54 216 Z', 'sgover', ' fill="url(#sgShin)"')
    a += Pth('M286 150 h48 v-12 l-24 -14 l-24 14 z', 'sgwin lit') + win(200, 162, 30, 26) + win(390, 162, 30, 26) + R(150, 196, 320, 5, 'sgsill')
    a += glow(380, 320, 170)
    # zaplecze / kuchnia
    a += L(172, 215, 172, 430, 'sgwall2') + R(80, 300, 50, 70, 'sgfrig', 3) + L(90, 316, 120, 316, 'sgmull') + R(140, 372, 22, 58, 'sgrack', 2)
    a += R(84, 390, 50, 6, 'sgfl') + T(118, 452, 'Zaplecze', 'sglb2', 'middle') + R(166, 378, 12, 52, 'sgdoor2')
    # bar
    a += R(186, 372, 84, 58, 'sgbar', 4) + R(186, 368, 84, 6, 'sgfl') + R(198, 340, 60, 4, 'sgsill') + ''.join(R(202 + i * 9, 324, 5, 16, 'sgbot', 1) for i in range(6))
    a += R(246, 356, 18, 12, 'sgdev', 2) + R(190, 238, 62, 34, 'sgscr', 3) + L(198, 248, 236, 248, 'sgtx') + L(198, 256, 228, 256, 'sgtx') + L(198, 264, 240, 264, 'sgtx')
    a += person(300, 430, .7) + T(228, 452, 'Bar', 'sglb2', 'middle')
    # sala
    for x in (320, 390, 460):
        a += table(x, 392)
    a += Pth('M352 262 q28 14 56 0', 'sgchand') + L(380, 215, 380, 262, 'sgrail') + ''.join(C(352 + i * 14, 258, 2.6, 'sgflame') for i in range(5))
    for x in (330, 470):
        a += C(x, 218, 5, 'sgdev')
    a += R(434, 214, 14, 5, 'sgdev', 2)
    # DJ / scena
    a += R(500, 380, 46, 50, 'sgfl') + R(508, 360, 26, 20, 'sgdev', 3) + L(536, 330, 536, 380, 'sgrail') + C(536, 328, 3, 'sgdev') + T(380, 452, 'Sala', 'sglb2', 'middle')
    # taras
    a += R(560, 416, 140, 14, 'sgfl') + L(560, 396, 700, 396, 'sgrail') + ''.join(L(570 + i * 16, 396, 570 + i * 16, 416, 'sgrail') for i in range(9))
    a += L(640, 330, 640, 416, 'sgrail') + Pth('M600 334 Q640 300 680 334 Z', 'sgumb') + table(640, 398, False) + person(616, 416, .55) + person(664, 416, .55)
    a += Pth('M562 292 l10 -6 v20 l-10 -6 z', 'sgdev') + T(630, 452, 'Taras', 'sglb2', 'middle')
    a += R(560, 228, 14, 8, 'sgdev', 2) + car(690, 466, .7)
    return a

HS['restauracja'] = [
  {'x': 330, 'y': 222, 's': 'snd', 'fx': 'arc', 'a': 90, 't': 'Głośniki sufitowe w strefach'},
  {'x': 522, 'y': 356, 's': 'snd', 't': 'Panel dla DJ-a i mikrofony'},
  {'x': 590, 'y': 300, 's': 'snd', 'fx': 'arc', 'a': 0, 't': 'Głośniki na tarasie'},
  {'x': 221, 'y': 254, 's': 'scr', 't': 'Menu board nad barem'},
  {'x': 256, 'y': 300, 's': 'kam', 'fx': 'cone', 'a': 100, 'r': 66, 't': 'Kamera nad kasą'},
  {'x': 580, 'y': 232, 's': 'kam', 'fx': 'cone', 'a': 25, 'r': 120, 't': 'Kamera wejścia i parkingu'},
  {'x': 441, 'y': 232, 's': 'wifi', 'fx': 'ring', 'r': 70, 't': 'Wi-Fi gości oddzielone od kasy'},
  {'x': 105, 'y': 330, 's': 'alarm', 'fx': 'ring', 'r': 38, 't': 'Czujki w chłodni i kuchni'},
  {'x': 380, 'y': 278, 's': 'smart', 'fx': 'ring', 'r': 50, 't': 'Sceny światła na sali'},
  {'x': 151, 'y': 360, 's': 'wifi', 't': 'Szafa: router, łącze zapasowe, UPS'},
  {'x': 172, 'y': 404, 's': 'kd', 't': 'Kod do zaplecza dla dostawców'},
]
ART['restauracja'] = restauracja

def shelf(x, y, w=60, h=96, n=4):
    s = R(x, y, w, h, 'sgshelf', 2)
    cols = ['#F07A6A', '#F2B84B', '#7BD36A', '#5B8CF0', '#E86FB0', '#12B6D8']
    for r in range(n):
        yy = y + 6 + r * (h - 8) / n
        s += L(x, yy + (h - 8) / n - 2, x + w, yy + (h - 8) / n - 2, 'sgrail')
        for c in range(5):
            s += f'<rect x="{x + 4 + c * (w - 8) / 5:.1f}" y="{yy + 4:.1f}" width="{(w - 8) / 5 - 2:.1f}" height="{(h - 8) / n - 8:.1f}" rx="1" fill="{cols[(r * 2 + c) % 6]}" opacity=".55"></rect>'
    return s

def sklep():
    a = mountains() + ground() + tree(30, 432, .9)
    a += R(80, 176, 570, 254, 'sgw') + over(80, 176, 570, 254, 'sgPlank')
    a += Pth('M58 182 L365 70 L672 182 L654 188 L365 86 L76 188 Z', 'sgroof') + Pth('M58 182 L365 70 L672 182 L654 188 L365 86 L76 188 Z', 'sgover', ' fill="url(#sgShin)"')
    for x in (140, 250, 460, 570):
        a += win(x, 206, 44, 52, x in (250, 570))
    a += R(80, 284, 570, 8, 'sgsill') + T(365, 246, 'Mieszkania', 'sglb', 'middle')
    a += R(90, 296, 550, 134, 'sgin') + glow(365, 360, 160)
    # witryna
    a += R(92, 300, 108, 120, 'sgglass', 2) + R(110, 322, 70, 48, 'sgscr', 3) + L(120, 336, 160, 336, 'sgtx') + L(120, 346, 150, 346, 'sgtx') + L(120, 356, 166, 356, 'sgtx')
    a += R(92, 410, 108, 10, 'sgfl') + R(202, 330, 36, 100, 'sgdoor2') + C(232, 384, 2.5, 'sgdev')
    a += R(84, 292, 170, 10, 'sgawn')
    # półki
    a += shelf(270, 330) + shelf(345, 330) + shelf(420, 344, 50, 82, 3)
    a += person(318, 430, .7) + person(400, 430, .66)
    # kasa
    a += R(480, 380, 64, 50, 'sgbar', 4) + R(484, 368, 22, 14, 'sgdev', 2) + R(516, 372, 12, 8, 'sgdev', 2) + person(560, 430, .7)
    # przymierzalnia, zaplecze
    a += R(566, 320, 4, 110, 'sgwall2') + Pth('M574 330 h22 v96 h-22 z', 'sgcurt') + L(598, 296, 598, 430, 'sgwall2')
    a += R(608, 360, 22, 70, 'sgrack', 2) + R(612, 330, 26, 24, 'sgbox', 2)
    a += T(146, 452, 'Witryna', 'sglb2', 'middle') + T(360, 452, 'Sala sprzedaży', 'sglb2', 'middle') + T(512, 452, 'Kasa', 'sglb2', 'middle') + T(614, 452, 'Zaplecze', 'sglb2', 'middle')
    a += C(330, 300, 5, 'sgdev') + C(450, 300, 5, 'sgdev')
    return a

HS['sklep'] = [
  {'x': 252, 'y': 336, 's': 'kam', 'fx': 'cone', 'a': 175, 'r': 46, 't': 'Kamera przy wejściu, na wysokości twarzy'},
  {'x': 512, 'y': 304, 's': 'kam', 'fx': 'cone', 'a': 95, 'r': 70, 't': 'Kamera nad kasą'},
  {'x': 360, 'y': 306, 's': 'kam', 'fx': 'cone', 'a': 105, 'r': 96, 't': 'Kamera w alejce z drogim towarem'},
  {'x': 145, 'y': 346, 's': 'scr', 't': 'Ekran w witrynie, czytelny w słońcu'},
  {'x': 450, 'y': 300, 's': 'snd', 'fx': 'arc', 'a': 90, 't': 'Muzyka w strefach i komunikaty z kasy'},
  {'x': 108, 'y': 312, 's': 'alarm', 'fx': 'ring', 'r': 36, 't': 'Czujka zbicia szyby i ruchu'},
  {'x': 540, 'y': 400, 's': 'alarm', 't': 'Przycisk napadowy przy kasie'},
  {'x': 619, 'y': 376, 's': 'wifi', 'fx': 'ring', 'r': 44, 't': 'Sieć kasy i terminala z łączem zapasowym'},
  {'x': 600, 'y': 412, 's': 'kd', 't': 'Kod na zaplecze i dzwonek dla dostaw'},
  {'x': 170, 'y': 296, 's': 'smart', 't': 'Harmonogram światła witryny'},
]
ART['sklep'] = sklep

def truck(x, y, s=1.0):
    return (f'<g class="sgtruck" transform="translate({x} {y}) scale({s})"><rect x="-70" y="-58" width="88" height="48" rx="3" class="sgtrb"></rect>'
            f'<path d="M18 -10 v-34 h22 l14 16 v18 z" class="sgtrc"></path><path d="M24 -40 h14 l10 12 h-24 z" class="sgcw"></path>'
            f'<circle cx="-50" cy="-6" r="7" class="sgwh"></circle><circle cx="-30" cy="-6" r="7" class="sgwh"></circle><circle cx="36" cy="-6" r="7" class="sgwh"></circle></g>')

def firma():
    a = mountains() + ground() + tree(14, 434, .8)
    # biuro 2 kondygnacje
    a += R(40, 220, 196, 210, 'sgw') + R(48, 228, 180, 92, 'sgin') + R(48, 328, 180, 102, 'sgin') + R(36, 214, 204, 8, 'sgroof') + R(40, 320, 196, 8, 'sgsill')
    for x in (70, 120, 170):
        a += R(x, 252, 30, 22, 'sgdesk', 2) + R(x + 8, 240, 14, 12, 'sgdev', 1) + person(x + 15, 316, .55)
    a += R(58, 362, 26, 66, 'sgrack', 2) + R(96, 346, 16, 82, 'sgrack', 2) + T(162, 410, 'Serwerownia', 'sglb', 'middle')
    a += R(186, 352, 36, 78, 'sgdoor2') + T(138, 452, 'Biuro', 'sglb2', 'middle')
    # brama i ogrodzenie
    a += ''.join(L(242 + i * 8, 392, 242 + i * 8, 430, 'sgrail') for i in range(5)) + L(240, 392, 276, 392, 'sgrail') + R(238, 380, 4, 50, 'sgpost') + R(276, 380, 4, 50, 'sgpost')
    # hala
    a += Pth('M282 430 V206 L452 182 L622 206 V430 Z', 'sgw') + Pth('M292 430 V214 L452 192 L612 214 V430 Z', 'sgin')
    a += ''.join(L(282 + i * 34, 206 - (i if i <= 5 else 10 - i) * 4.8, 282 + i * 34, 214 - (i if i <= 5 else 10 - i) * 4.8, 'sgrib') for i in range(11))
    for x in (310, 360, 410):
        a += R(x, 330, 40, 100, 'sgshelf') + ''.join(R(x + 4, 340 + r * 24, 32, 14, 'sgbox', 1) for r in range(4))
    a += L(380, 214, 380, 232, 'sgrail') + Pth('M372 232 h16 l4 8 h-24 z', 'sgdev')
    a += R(498, 320, 48, 30, 'sgscr', 3) + L(506, 330, 538, 330, 'sgtx') + L(506, 338, 530, 338, 'sgtx')
    a += Pth('M470 430 v-22 h30 l8 12 v10 z', 'sgfork') + L(470, 380, 470, 430, 'sgrail') + person(560, 430, .7) + T(452, 452, 'Hala i magazyn', 'sglb2', 'middle')
    # rampa i ciężarówka
    a += R(612, 396, 18, 34, 'sgfl') + R(600, 360, 22, 70, 'sgdoor2') + truck(694, 430, .9)
    a += Pth('M236 446 C 250 452 266 452 282 446', 'sgfib')
    return a

HS['firma'] = [
  {'x': 204, 'y': 384, 's': 'kd', 't': 'Czytnik kart przy wejściu do biura'},
  {'x': 300, 'y': 384, 's': 'kd', 't': 'Karta do hali i magazynu, eksport do RCP'},
  {'x': 610, 'y': 300, 's': 'kam', 'fx': 'cone', 'a': 40, 'r': 96, 't': 'Kamery na rampie'},
  {'x': 292, 'y': 290, 's': 'kam', 'fx': 'cone', 'a': 150, 'r': 70, 't': 'Kamera bramy i placu'},
  {'x': 452, 'y': 238, 's': 'wifi', 'fx': 'ring', 'r': 80, 't': 'Wi-Fi w hali dobrane do regałów'},
  {'x': 259, 'y': 455, 's': 'wifi', 'fx': 'loop', 'r': 28, 't': 'Światłowód między budynkami'},
  {'x': 71, 'y': 352, 's': 'tel', 't': 'Szafa rack i okablowanie z opisem gniazd'},
  {'x': 112, 'y': 330, 's': 'alarm', 'fx': 'ring', 'r': 36, 't': 'Alarm strefowy i czujki w serwerowni'},
  {'x': 380, 'y': 252, 's': 'snd', 'fx': 'arc', 'a': 90, 't': 'Komunikaty i sygnał przerwy w hali'},
  {'x': 522, 'y': 312, 's': 'scr', 't': 'Ekran z informacjami dla zmiany'},
  {'x': 150, 'y': 236, 's': 'smart', 't': 'Ogrzewanie i światło biura według harmonogramu'},
]
ART['firma'] = firma

VB = {'firma': '0 130 720 340'}

def budowa():
    a = mountains() + ground() + tree(16, 432, .8) + tree(704, 434, .9)
    # szkielet budynku
    for y in (360, 290, 220):
        a += R(276, y, 248, 8, 'sgslab')
    for x in (284, 364, 444, 512):
        a += R(x, 220, 8, 210, 'sgslab')
    a += R(292, 368, 72, 62, 'sgblk') + over(292, 368, 72, 62, 'sgHatch') + R(372, 300, 72, 60, 'sgblk') + over(372, 300, 72, 60, 'sgHatch')
    for x in (262, 532):
        a += L(x, 214, x, 430, 'sgscaf') + L(x + 10, 214, x + 10, 430, 'sgscaf') + ''.join(L(x, yy, x + 10, yy + 36, 'sgscaf') + L(x, yy + 36, x + 10, yy + 36, 'sgscaf') for yy in range(214, 430, 36))
    a += person(470, 430, .66) + person(420, 360, .6) + T(400, 452, 'Budynek w stanie surowym', 'sglb2', 'middle')
    # żuraw
    a += R(576, 74, 10, 356, 'sgcrane') + ''.join(L(576, yy, 586, yy + 14, 'sgcrl') for yy in range(80, 430, 14))
    a += Pth('M410 74 H706 V84 H410 Z', 'sgcrane') + ''.join(L(410 + i * 14, 74, 417 + i * 14, 84, 'sgcrl') for i in range(21)) + R(604, 84, 40, 22, 'sgcw2')
    a += R(570, 58, 22, 16, 'sgcrane') + L(470, 84, 470, 196, 'sgrail') + R(456, 196, 28, 10, 'sgsteel')
    # kontener, stal, koparka, rozdzielnica
    a += R(56, 382, 96, 48, 'sgcont', 3) + ''.join(L(64 + i * 12, 386, 64 + i * 12, 426, 'sgcrl') for i in range(7)) + T(104, 452, 'Kontener', 'sglb2', 'middle')
    a += ''.join(R(162, 420 - i * 5, 74, 4, 'sgsteel') for i in range(3))
    a += Pth('M612 430 v-26 h46 v26 z M616 404 l18 -22 h14 l6 22 z', 'sgexc') + Pth('M658 404 l26 -30 l12 6 l-18 34', 'sgexcarm') + C(620, 432, 5, 'sgwh') + C(650, 432, 5, 'sgwh')
    a += R(540, 392, 18, 26, 'sgdev', 2) + L(549, 418, 549, 430, 'sgrail')
    # ogrodzenie
    a += ''.join(R(8 + i * 26, 404, 2, 26, 'sgpost') for i in range(10)) + L(8, 408, 252, 408, 'sgfence') + L(8, 420, 252, 420, 'sgfence')
    # maszt solarny z kamerami
    a += L(214, 430, 214, 250, 'sgmast') + Pth('M196 244 l40 -14 l4 10 l-40 14 z', 'sgsolar') + R(204, 410, 22, 20, 'sgrack', 2)
    a += R(216, 268, 14, 8, 'sgdev', 2) + R(198, 290, 14, 8, 'sgdev', 2) + L(226, 230, 226, 212, 'sgrail') + C(226, 210, 2.5, 'sgdev') + R(220, 300, 10, 10, 'sgsiren', 2)
    return a

HS['budowa'] = [
  {'x': 226, 'y': 268, 's': 'kam', 'fx': 'cone', 'a': 18, 'r': 170, 't': 'Kamery na maszcie solarnym'},
  {'x': 198, 'y': 292, 's': 'kam', 'fx': 'cone', 'a': 155, 'r': 110, 't': 'Zoom na kontener i skład stali'},
  {'x': 236, 'y': 214, 's': 'wifi', 'fx': 'ring', 'r': 46, 't': 'Router LTE z dwiema kartami SIM'},
  {'x': 215, 'y': 404, 's': 'kam', 't': 'Panel i akumulator z grzaniem'},
  {'x': 104, 'y': 372, 's': 'alarm', 'fx': 'ring', 'r': 42, 't': 'Czujki zewnętrzne ze zdjęciem alarmu'},
  {'x': 238, 'y': 314, 's': 'alarm', 'fx': 'ring', 'r': 34, 't': 'Syrena, światło i komunikat głosowy'},
  {'x': 566, 'y': 100, 's': 'scr', 'fx': 'cone', 'a': 140, 'r': 210, 't': 'Timelapse i podgląd dla inwestora'},
  {'x': 400, 'y': 410, 's': 'tel', 'fx': 'loop', 'r': 90, 't': 'Kable pod docelowe instalacje budynku'},
]
ART['budowa'] = budowa

def dom():
    a = mountains() + ground() + tree(24, 432, 1.1) + tree(700, 434, .9) + tree(150, 432, .7)
    # ogrodzenie i furtka
    a += ''.join(R(12 + i * 18, 400, 3, 30, 'sgpost') for i in range(9)) + L(12, 408, 168, 408, 'sgfence') + L(12, 420, 168, 420, 'sgfence') + R(84, 380, 6, 50, 'sgpost') + R(118, 380, 6, 50, 'sgpost')
    # dom
    a += R(180, 226, 340, 204, 'sgw') + over(180, 226, 340, 204, 'sgPlank') + R(190, 236, 320, 90, 'sgin') + R(190, 334, 320, 96, 'sgin') + R(180, 326, 340, 8, 'sgsill')
    a += Pth('M156 232 L350 104 L544 232 L526 238 L350 120 L174 238 Z', 'sgroof') + Pth('M156 232 L350 104 L544 232 L526 238 L350 120 L174 238 Z', 'sgover', ' fill="url(#sgShin)"')
    a += R(410, 120, 18, 40, 'sgw') + glow(250, 380, 90) + glow(360, 280, 90)
    # parter: salon z kominkiem, korytarz, kotłownia
    a += Pth('M214 430 v-56 h46 v56 M222 380 h30 v-24 h-30 z', 'sgfu') + C(237, 410, 7, 'sgflame') + R(270, 404, 60, 24, 'sgsofa', 6) + person(300, 430, .62)
    a += L(390, 334, 390, 430, 'sgwall2') + R(398, 396, 20, 26, 'sgrack', 2) + R(430, 360, 26, 64, 'sgfrig', 3) + R(470, 392, 28, 32, 'sgfrig', 4) + C(484, 408, 7, 'sgmull2')
    a += T(260, 454, 'Salon', 'sglb2', 'middle') + T(452, 454, 'Kotłownia i pralnia', 'sglb2', 'middle')
    # poddasze
    a += R(214, 290, 60, 26, 'sgbed', 4) + R(214, 282, 16, 10, 'sgfu') + R(420, 290, 60, 26, 'sgbed', 4) + win(320, 256, 40, 34)
    a += Pth('M194 238 v40 h22 M486 238 v40 h22', 'sgblind')
    # garaż
    a += R(520, 290, 130, 140, 'sgw') + R(528, 298, 114, 132, 'sgin') + Pth('M512 294 L585 262 L658 294 Z', 'sgroof') + car(585, 430, .9)
    a += R(626, 372, 12, 22, 'sgev', 3) + T(585, 454, 'Garaż', 'sglb2', 'middle')
    # antena
    a += L(470, 168, 470, 132, 'sgrail') + Pth('M456 136 q14 -14 28 0 z', 'sgdish')
    return a

HS['dom'] = [
  {'x': 340, 'y': 360, 's': 'alarm', 'fx': 'ring', 'r': 44, 't': 'Czujki otwarcia i ruchu odporne na zwierzęta'},
  {'x': 484, 'y': 386, 's': 'alarm', 'fx': 'ring', 'r': 30, 't': 'Czujka zalania pod kotłem i pralką'},
  {'x': 237, 'y': 350, 's': 'alarm', 'fx': 'ring', 'r': 34, 't': 'Czujka dymu i czadu przy kominku'},
  {'x': 380, 'y': 252, 's': 'smart', 'fx': 'ring', 'r': 50, 't': 'Temperatura i tryb nieobecności'},
  {'x': 186, 'y': 300, 's': 'kam', 'fx': 'cone', 'a': 165, 'r': 110, 't': 'Kamera furtki i ogrodu'},
  {'x': 650, 'y': 300, 's': 'kam', 'fx': 'cone', 'a': 30, 'r': 70, 't': 'Kamera podjazdu i garażu'},
  {'x': 102, 'y': 370, 's': 'alarm', 't': 'Wideodomofon przy furtce'},
  {'x': 560, 'y': 400, 's': 'kd', 't': 'Brama i furtka z telefonu, kod dla sąsiada'},
  {'x': 408, 'y': 380, 's': 'wifi', 'fx': 'ring', 'r': 54, 't': 'Router z łączem zapasowym i UPS'},
  {'x': 470, 'y': 132, 's': 'ant', 't': 'Antena ustawiona miernikiem'},
  {'x': 632, 'y': 364, 's': 'ev', 't': 'Ładowarka w garażu'},
]
ART['dom'] = dom
VB['dom'] = '0 60 720 410'

def apartament():
    a = mountains() + ground() + tree(40, 432, 1.0) + tree(680, 434, 1.1)
    a += R(120, 150, 480, 280, 'sgw') + R(112, 142, 496, 10, 'sgroof')
    # klatka schodowa
    a += R(128, 160, 72, 270, 'sgin2') + ''.join(Pth(f'M132 {y} l60 -46', 'sgstair') for y in (430, 338, 246)) + T(164, 452, 'Klatka', 'sglb2', 'middle')
    # piętra poza apartamentem
    for y in (160, 346):
        a += R(206, y, 386, 84, 'sgin2')
        for x in (250, 340, 430, 520):
            a += win(x, y + 18, 40, 40, (x + y) % 3 == 0)
    a += R(200, 244, 400, 6, 'sgsill') + R(200, 338, 400, 6, 'sgsill')
    # wyróżniony apartament (1. piętro)
    a += R(206, 252, 386, 84, 'sgin') + glow(380, 300, 120)
    a += R(212, 266, 16, 70, 'sgdoor2') + R(230, 290, 6, 10, 'sgdev', 1)
    a += R(250, 310, 70, 24, 'sgsofa', 6) + R(332, 300, 50, 32, 'sgscr', 3) + L(296, 252, 296, 262, 'sgrail')
    a += L(400, 252, 400, 336, 'sgwall2') + R(412, 302, 70, 30, 'sgbed', 4) + R(412, 294, 18, 10, 'sgfu')
    a += L(492, 252, 492, 336, 'sgwall2') + R(506, 300, 30, 32, 'sgfrig', 4) + C(521, 316, 7, 'sgmull2') + R(548, 304, 36, 6, 'sgfrig') + T(398, 240, 'Apartament na wynajem', 'sglbh', 'middle')
    # wejście i brama garażu
    a += R(136, 380, 30, 50, 'sgdoor2') + R(170, 392, 10, 14, 'sgdev', 2)
    a += R(608, 384, 4, 46, 'sgpost') + Pth('M612 430 v-40 h70 v40', 'sggate') + T(646, 452, 'Brama garażu', 'sglb2', 'middle') + car(650, 428, .6)
    a += person(250, 430, .66) + person(196, 336, .6)
    return a

HS['apartament'] = [
  {'x': 232, 'y': 282, 's': 'kd', 't': 'Zamek z kodem w drzwiach apartamentu'},
  {'x': 175, 'y': 380, 's': 'kd', 't': 'Kod do bramy i klatki, za zgodą wspólnoty'},
  {'x': 521, 'y': 300, 's': 'alarm', 'fx': 'ring', 'r': 30, 't': 'Czujka zalania pod pralką'},
  {'x': 360, 'y': 262, 's': 'alarm', 'fx': 'ring', 'r': 40, 't': 'Czujka dymu, obowiązkowa przy najmie'},
  {'x': 446, 'y': 270, 's': 'smart', 'fx': 'ring', 'r': 40, 't': 'Ogrzewanie: pusty lokal i przyjazd gościa'},
  {'x': 296, 'y': 270, 's': 'wifi', 'fx': 'ring', 'r': 64, 't': 'Punkt Wi-Fi zamiast routera w szafce'},
  {'x': 357, 'y': 316, 's': 'ant', 't': 'Telewizor z DVB-T2 i aplikacjami'},
  {'x': 268, 'y': 300, 's': 'smart', 't': 'Czujnik hałasu bez nagrywania dźwięku'},
  {'x': 646, 'y': 372, 's': 'kd', 't': 'Wjazd do garażu dla gościa'},
]
ART['apartament'] = apartament
VB['apartament'] = '0 110 720 360'

def hotel():
    a = mountains() + ground() + tree(686, 434, 1.0)
    # parking
    a += car(56, 430, .7) + car(118, 430, .7) + R(84, 396, 10, 22, 'sgev', 3) + R(10, 372, 4, 58, 'sgpost') + L(14, 384, 70, 384, 'sgbarrier')
    # bryła główna
    a += R(150, 140, 324, 290, 'sgw') + R(144, 132, 336, 10, 'sgroof')
    for i, y in enumerate((148, 218, 288)):
        a += R(158, y, 308, 64, 'sgin2' if i == 0 else 'sgin')
        for j, x in enumerate((162, 266, 370)):
            a += L(x + 100, y, x + 100, y + 64, 'sgwall2') if j < 2 else ''
            a += R(x + 10, y + 40, 46, 20, 'sgbed', 4) + R(x + 10, y + 34, 12, 8, 'sgfu') + R(x + 66, y + 18, 26, 16, 'sgscr', 2)
        a += R(150, y + 64, 324, 6, 'sgsill')
    a += R(158, 358, 308, 72, 'sgin') + glow(300, 400, 120)
    a += R(176, 396, 70, 34, 'sgbar', 4) + R(232, 366, 34, 22, 'sgscr', 2) + R(290, 404, 50, 22, 'sgsofa', 6) + person(214, 430, .66) + person(372, 430, .66)
    a += R(440, 376, 22, 54, 'sgrack', 2) + R(150, 380, 0, 0, 'sgdev')
    a += T(312, 454, 'Lobby i recepcja', 'sglb2', 'middle') + T(312, 126, 'Pokoje gości', 'sglb', 'middle')
    a += L(440, 132, 440, 112, 'sgrail') + Pth('M426 116 q14 -14 28 0 z', 'sgdish')
    # skrzydło konferencyjne
    a += R(474, 280, 190, 150, 'sgw') + R(482, 288, 174, 142, 'sgin') + R(468, 272, 202, 10, 'sgroof')
    a += R(586, 330, 60, 36, 'sgscr', 3) + L(596, 342, 632, 342, 'sgtx') + L(596, 352, 624, 352, 'sgtx')
    for x in (500, 530, 560):
        a += L(x, 400, x + 18, 400, 'sgtab') + person(x + 9, 426, .5)
    a += C(520, 296, 5, 'sgdev') + C(610, 296, 5, 'sgdev') + T(568, 454, 'Sala konferencyjna', 'sglb2', 'middle')
    return a

HS['hotel'] = [
  {'x': 240, 'y': 236, 's': 'wifi', 'fx': 'ring', 'r': 60, 't': 'Wi-Fi w każdym pokoju i strefie wspólnej'},
  {'x': 349, 'y': 236, 's': 'ant', 't': 'Telewizja w pokojach z jednej szafy'},
  {'x': 424, 'y': 314, 's': 'kd', 't': 'Zamek na kartę albo klucz w telefonie'},
  {'x': 162, 'y': 404, 's': 'kd', 't': 'Samodzielne meldowanie i wideodomofon'},
  {'x': 20, 'y': 360, 's': 'kam', 'fx': 'cone', 'a': 20, 'r': 80, 't': 'Kamera wjazdu na parking'},
  {'x': 300, 'y': 372, 's': 'kam', 'fx': 'cone', 'a': 95, 'r': 56, 't': 'Kamery w lobby i na korytarzach'},
  {'x': 565, 'y': 300, 's': 'snd', 'fx': 'arc', 'a': 90, 't': 'Nagłośnienie i mikrofony w sali'},
  {'x': 616, 'y': 348, 's': 'scr', 't': 'Ekran i prezentacje bez kabli'},
  {'x': 249, 'y': 377, 's': 'scr', 't': 'Ekran powitalny w recepcji'},
  {'x': 410, 'y': 172, 's': 'smart', 'fx': 'ring', 'r': 44, 't': 'Pokój sterowany według obecności'},
  {'x': 89, 'y': 390, 's': 'ev', 't': 'Ładowarki na parkingu'},
  {'x': 451, 'y': 366, 's': 'wifi', 't': 'Szafa: sieć, telewizja, rejestrator, UPS'},
]
ART['hotel'] = hotel
VB['hotel'] = '0 90 720 380'

def desks(x, y, n=3):
    return ''.join(R(x + i * 34, y, 24, 6, 'sgdesk', 1) + L(x + i * 34 + 4, y + 6, x + i * 34 + 4, y + 22, 'sgrail') + person(x + i * 34 + 12, y + 22, .45) for i in range(n))

def szkola():
    a = mountains() + ground() + tree(20, 432, 1.0) + tree(700, 434, .9)
    # boisko
    a += R(10, 424, 80, 6, 'sgpitch') + Pth('M16 424 v-24 h22 v24', 'sggoal') + person(60, 430, .5) + person(76, 430, .48)
    # budynek główny 2 kondygnacje
    a += R(100, 200, 360, 230, 'sgw') + R(94, 192, 372, 10, 'sgroof') + R(108, 208, 344, 104, 'sgin') + R(108, 320, 344, 110, 'sgin') + R(100, 312, 360, 8, 'sgsill')
    a += L(290, 208, 290, 312, 'sgwall2') + desks(130, 280) + desks(318, 280) + R(150, 236, 60, 34, 'sgboard', 2) + R(350, 244, 64, 40, 'sgscr', 3) + L(358, 256, 404, 256, 'sgtx') + L(358, 266, 396, 266, 'sgtx')
    a += T(200, 292, 'Klasa', 'sglb', 'middle') + T(380, 292, 'Klasa', 'sglb', 'middle')
    # parter: wejście, hol, korytarz, sekretariat
    a += R(118, 372, 34, 58, 'sgdoor2') + R(156, 384, 10, 14, 'sgdev', 2) + person(200, 430, .55) + person(230, 430, .5) + person(320, 430, .52)
    a += L(390, 320, 390, 430, 'sgwall2') + R(400, 392, 40, 20, 'sgdesk', 2) + R(418, 362, 18, 30, 'sgrack', 2) + T(256, 454, 'Hol i korytarz', 'sglb2', 'middle') + T(420, 454, 'Sekretariat', 'sglb2', 'middle')
    a += R(340, 360, 30, 50, 'sgdoor2') + T(355, 352, 'WC', 'sglb', 'middle')
    # sala gimnastyczna
    a += R(466, 230, 200, 200, 'sgw') + Pth('M460 234 Q566 196 672 234 Z', 'sgroof') + R(474, 238, 184, 192, 'sgin')
    a += R(474, 410, 184, 20, 'sgpitch') + L(640, 300, 640, 360, 'sgrail') + R(626, 294, 20, 12, 'sggoal2') + person(560, 430, .55) + person(600, 430, .5)
    a += C(520, 248, 5, 'sgdev') + C(610, 248, 5, 'sgdev') + T(566, 454, 'Sala gimnastyczna', 'sglb2', 'middle')
    return a

HS['szkola'] = [
  {'x': 161, 'y': 372, 's': 'kd', 't': 'Wideodomofon i kontrola wejścia'},
  {'x': 186, 'y': 340, 's': 'kam', 'fx': 'cone', 'a': 25, 'r': 80, 't': 'Kamera holu wejściowego'},
  {'x': 318, 'y': 336, 's': 'kam', 'fx': 'cone', 'a': 40, 'r': 50, 't': 'Kamera korytarza przed łazienkami'},
  {'x': 104, 'y': 236, 's': 'kam', 'fx': 'cone', 'a': 150, 'r': 100, 't': 'Kamera boiska i wejścia'},
  {'x': 262, 'y': 330, 's': 'snd', 'fx': 'arc', 'a': 90, 't': 'Dzwonki i komunikaty z sekretariatu'},
  {'x': 250, 'y': 222, 's': 'wifi', 'fx': 'ring', 'r': 64, 't': 'Wi-Fi w klasach na 30 urządzeń'},
  {'x': 382, 'y': 238, 's': 'scr', 't': 'Monitor interaktywny w klasie'},
  {'x': 566, 'y': 260, 's': 'snd', 'fx': 'arc', 'a': 90, 't': 'Nagłośnienie sali i akademii'},
  {'x': 427, 'y': 352, 's': 'wifi', 'fx': 'ring', 'r': 40, 't': 'Szafa za routerem OSE'},
  {'x': 296, 'y': 410, 's': 'alarm', 'fx': 'ring', 'r': 40, 't': 'Alarm po lekcjach'},
]
ART['szkola'] = szkola
VB['szkola'] = '0 120 720 350'

def gmina():
    a = mountains() + ground() + tree(24, 432, 1.0) + tree(110, 434, .8)
    a += R(150, 190, 400, 240, 'sgw') + over(150, 190, 400, 240, 'sgPlank') + Pth('M132 196 L350 120 L568 196 L552 202 L350 134 L148 202 Z', 'sgroof')
    a += Pth('M320 160 h60 v-20 l-30 -16 l-30 16 z', 'sgw') + C(350, 150, 9, 'sgclock') + L(350, 150, 350, 144, 'sgrail') + L(350, 150, 355, 152, 'sgrail')
    a += R(158, 200, 384, 104, 'sgin') + R(158, 312, 384, 118, 'sgin') + R(150, 304, 400, 8, 'sgsill') + glow(350, 260, 140)
    # sala obrad
    a += Pth('M230 290 v-26 h240 v26', 'sgtabu') + ''.join(person(244 + i * 30, 286, .5) + R(238 + i * 30, 262, 4, 6, 'sgdev') for i in range(8))
    a += R(436, 214, 60, 36, 'sgscr', 3) + ''.join(R(444 + i * 9, 240 - (i * 7) % 20, 6, 4 + (i * 7) % 20, 'sgvote', 1) for i in range(5))
    a += R(196, 222, 14, 8, 'sgdev', 2) + T(350, 216, 'Sala obrad', 'sglb', 'middle')
    # parter: punkt obsługi, archiwum, szafa
    a += R(220, 394, 90, 36, 'sgbar', 4) + person(330, 430, .62) + person(240, 392, .55) + L(400, 312, 400, 430, 'sgwall2')
    a += R(420, 350, 40, 80, 'sgshelf') + R(500, 370, 20, 60, 'sgrack', 2) + R(160, 360, 30, 70, 'sgdoor2')
    a += T(270, 454, 'Punkt obsługi', 'sglb2', 'middle') + T(470, 454, 'Archiwum i serwerownia', 'sglb2', 'middle')
    # plac, przystanek, latarnia z kamerą
    a += L(640, 430, 640, 254, 'sgmast') + R(632, 254, 16, 8, 'sgdev', 2) + Pth('M600 430 v-50 h40', 'sgstop') + R(598, 384, 4, 46, 'sgpost') + person(616, 430, .55) + T(640, 454, 'Plac i przystanek', 'sglb2', 'middle')
    return a

HS['gmina'] = [
  {'x': 320, 'y': 246, 's': 'snd', 'fx': 'arc', 'a': 90, 't': 'Mikrofony radnych i nagłośnienie sali'},
  {'x': 204, 'y': 214, 's': 'scr', 'fx': 'cone', 'a': 22, 'r': 230, 't': 'Kamery i transmisja sesji'},
  {'x': 466, 'y': 206, 's': 'scr', 't': 'Ekran z wynikami głosowania'},
  {'x': 392, 'y': 262, 's': 'snd', 't': 'Połączenie z systemem głosowania elektronicznego'},
  {'x': 510, 'y': 356, 's': 'wifi', 'fx': 'ring', 'r': 40, 't': 'Zapis lokalny, łącze zapasowe, UPS'},
  {'x': 640, 'y': 246, 's': 'kam', 'fx': 'cone', 'a': 150, 'r': 110, 't': 'Monitoring placu i przystanku'},
  {'x': 300, 'y': 420, 's': 'snd', 'fx': 'loop', 'r': 48, 't': 'Pętla indukcyjna w punkcie obsługi'},
  {'x': 440, 'y': 340, 's': 'kd', 't': 'Karty do archiwum i serwerowni'},
  {'x': 330, 'y': 336, 's': 'wifi', 'fx': 'ring', 'r': 56, 't': 'Wi-Fi dla mieszkańców osobno od sieci urzędu'},
  {'x': 176, 'y': 350, 's': 'alarm', 'fx': 'ring', 'r': 34, 't': 'Alarm budynku urzędu'},
]
ART['gmina'] = gmina
VB['gmina'] = '0 100 720 370'

def deweloper():
    a = mountains() + ground() + tree(40, 432, 1.0) + tree(110, 434, .8) + tree(690, 434, .9)
    a += R(160, 130, 400, 300, 'sgw') + R(152, 122, 416, 10, 'sgroof')
    for i in range(4):
        y = 140 + i * 72
        a += R(168, y, 384, 62, 'sgin' if i in (1, 2) else 'sgin2') + R(160, y + 62, 400, 8, 'sgsill')
        if i < 3:
            for x in (300, 380, 460):
                a += win(x, y + 12, 40, 36, (x + i) % 3 == 0)
            a += R(254, y + 30, 14, 18, 'sgtbox', 2) + R(274, y + 18, 16, 44, 'sgdoor2')
    a += R(168, 360, 64, 62, 'sgin') + R(184, 372, 22, 50, 'sgrack', 2) + T(188, 354, 'Punkt styku', 'sglb', 'middle')
    a += R(280, 372, 40, 58, 'sgdoor2') + R(326, 388, 10, 16, 'sgdev', 2) + person(360, 430, .6)
    for dx, c in ((0, 'sgfibv'), (5, 'sgutpv'), (10, 'sgcoxv')):
        a += L(236 + dx, 400, 236 + dx, 150, c)
    a += L(236, 400, 206, 400, 'sgfibv')
    # dach: maszt, antena SAT
    a += L(470, 122, 470, 80, 'sgrail') + Pth('M452 92 q18 -18 36 0 z', 'sgdish') + L(440, 122, 440, 92, 'sgrail') + Pth('M430 96 h20 M432 102 h16 M434 108 h12', 'sgant')
    # garaż podziemny
    a += R(160, 432, 400, 36, 'sggar') + car(260, 466, .6) + car(360, 466, .6) + R(520, 436, 30, 30, 'sggate2') + R(500, 444, 8, 12, 'sgdev', 2) + R(452, 448, 10, 16, 'sgev', 2)
    a += R(560, 316, 12, 8, 'sgdev', 2) + T(300, 108, 'Budynek wielorodzinny', 'sglb', 'middle')
    return a

HS['deweloper'] = [
  {'x': 195, 'y': 390, 's': 'tel', 't': 'Punkt styku dla wszystkich operatorów'},
  {'x': 241, 'y': 250, 's': 'tel', 't': 'Pion: światłowód, skrętka i koncentryk'},
  {'x': 261, 'y': 300, 's': 'tel', 't': 'Skrzynka teletechniczna przy każdym mieszkaniu'},
  {'x': 470, 'y': 84, 's': 'ant', 't': 'Zbiorcza antena naziemna i satelitarna'},
  {'x': 331, 'y': 380, 's': 'alarm', 't': 'Panel domofonowy przy wejściu'},
  {'x': 420, 'y': 236, 's': 'alarm', 't': 'Unifon albo wideodomofon w mieszkaniu'},
  {'x': 504, 'y': 432, 's': 'kd', 't': 'Karta do garażu i klatek'},
  {'x': 572, 'y': 312, 's': 'kam', 'fx': 'cone', 'a': 40, 'r': 100, 't': 'Monitoring osiedla'},
  {'x': 380, 'y': 160, 's': 'smart', 'fx': 'ring', 'r': 44, 't': 'Przygotowanie pod smart home'},
  {'x': 457, 'y': 440, 's': 'ev', 't': 'Kanały kablowe pod ładowarki'},
]
ART['deweloper'] = deweloper
VB['deweloper'] = '0 40 720 430'

def ski(x, y):
    return ''.join(L(x + i * 7, y, x + i * 7 + 3, y - 46, 'sgski') for i in range(5))

def pensjonat():
    a = mountains() + ground() + tree(16, 432, 1.0) + tree(706, 434, .8)
    a += R(90, 200, 460, 230, 'sgw') + over(90, 200, 460, 230, 'sgPlank')
    a += Pth('M66 206 L320 70 L574 206 L556 212 L320 86 L84 212 Z', 'sgroof') + Pth('M66 206 L320 70 L574 206 L556 212 L320 86 L84 212 Z', 'sgover', ' fill="url(#sgShin)"')
    a += R(250, 150, 140, 56, 'sgin2') + win(300, 160, 40, 34, True) + R(190, 140, 260, 0, 'sgsill')
    for i, y in enumerate((210, 284)):
        a += R(98, y, 444, 66, 'sgin')
        for j, x in enumerate((102, 250, 398)):
            if j < 2:
                a += L(x + 146, y, x + 146, y + 66, 'sgwall2')
            a += R(x + 12, y + 40, 50, 22, 'sgbed', 4) + R(x + 12, y + 34, 14, 8, 'sgfu') + R(x + 92, y + 22, 28, 18, 'sgscr', 2) + R(x + 66, y + 6, 10, 5, 'sgdev', 2)
        a += R(90, y + 66, 460, 8, 'sgsill')
    a += R(98, 358, 444, 72, 'sgin') + glow(380, 400, 110)
    a += R(108, 372, 70, 58, 'sgin2') + ski(118, 426) + ski(150, 426)
    a += L(184, 358, 184, 430, 'sgwall2') + R(280, 372, 34, 58, 'sgdoor2') + R(318, 388, 10, 14, 'sgdev', 2)
    a += table(380, 404) + R(356, 364, 44, 24, 'sgscr', 2) + L(440, 358, 440, 430, 'sgwall2') + R(452, 372, 26, 50, 'sgfrig', 3) + R(490, 380, 20, 50, 'sgrack', 2)
    a += T(340, 454, 'Jadalnia i recepcja', 'sglb2', 'middle') + T(144, 454, 'Narciarnia', 'sglb2', 'middle') + T(500, 454, 'Kotłownia', 'sglb2', 'middle')
    # dobudówka i parking
    a += R(600, 320, 90, 110, 'sgw') + R(608, 328, 74, 102, 'sgin') + Pth('M592 324 L645 292 L698 324 Z', 'sgroof') + L(645, 292, 645, 250, 'sgrail') + R(638, 246, 14, 10, 'sgdev', 2)
    a += car(600, 466, .6) + R(668, 400, 10, 22, 'sgev', 3) + R(560, 300, 12, 8, 'sgdev', 2)
    return a

HS['pensjonat'] = [
  {'x': 323, 'y': 380, 's': 'kd', 't': 'Kod do drzwi i wideodomofon w telefonie'},
  {'x': 166, 'y': 380, 's': 'kam', 'fx': 'cone', 'a': 160, 'r': 60, 't': 'Kamera narciarni i suszarni'},
  {'x': 566, 'y': 296, 's': 'kam', 'fx': 'cone', 'a': 30, 'r': 110, 't': 'Kamera wjazdu i parkingu'},
  {'x': 249, 'y': 222, 's': 'wifi', 'fx': 'ring', 'r': 60, 't': 'Punkt Wi-Fi w każdym pokoju'},
  {'x': 504, 'y': 232, 's': 'ant', 't': 'Telewizja w pokojach z jednej szafy'},
  {'x': 340, 'y': 300, 's': 'alarm', 'fx': 'ring', 'r': 36, 't': 'Czujka dymu w każdym pokoju'},
  {'x': 465, 'y': 360, 's': 'alarm', 'fx': 'ring', 'r': 34, 't': 'Czujka czadu w kotłowni'},
  {'x': 320, 'y': 176, 's': 'smart', 'fx': 'ring', 'r': 44, 't': 'Ogrzewanie pokoi według obłożenia'},
  {'x': 378, 'y': 360, 's': 'scr', 't': 'Ekran w jadalni: pogoda i stoki'},
  {'x': 645, 'y': 240, 's': 'wifi', 'fx': 'ring', 'r': 40, 't': 'Most radiowy do dobudówki'},
  {'x': 673, 'y': 390, 's': 'ev', 't': 'Ładowarka dla gości'},
]
ART['pensjonat'] = pensjonat
VB['pensjonat'] = '0 50 720 420'
