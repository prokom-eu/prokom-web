#!/usr/bin/env python3
# Generator stron „Dla kogo”: Seg*.body.html, Seg*.js, Seg*.meta.json
import json, os, sys, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import SV, LY, scene
import scenes
B = 'ŚCIEŻKA/DO/zrodlo/'  # historyczne: generator stron obiektów z wizualizacji

BODY = '''<!--@pheroA-->
          <div class="card sgsc">
            <div class="sgtop"><span class="sgtt"><!--i:P.layers:16-->{{sg.sceneT}}</span><div class="sgly"><sc-for list="{{sg.ly}}" as="l" hint-placeholder-count="5"><button type="button" class="{{l.cls}}" onClick="{{l.pick}}" aria-pressed="{{l.on}}">{{l.n}}</button></sc-for></div></div>
            <div class="sgart">%%SCENE%%</div>
            <div class="sgleg" aria-label="Lista punktów na przekroju"><sc-for list="{{sg.leg}}" as="h" hint-placeholder-count="10"><button type="button" class="{{h.cls}}" style="{{h.st}}" onClick="{{h.pick}}" aria-pressed="{{h.on}}"><em>{{h.no}}</em><span>{{h.t}}</span></button></sc-for></div>
            <div class="sginfo" key="{{sg.cur.k}}" style="{{sg.cur.st}}">
              <span class="sgno">{{sg.cur.no}}</span>
              <div class="sgit"><b>{{sg.cur.t}}</b><p>{{sg.cur.d}}</p><a href="{{sg.cur.href}}" class="sgchip"><i></i>{{sg.cur.sn}} →</a></div>
              <div class="sgnav"><button type="button" class="iconb" onClick="{{sg.prev}}" aria-label="Poprzedni punkt"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg></button><span>{{sg.pos}}</span><button type="button" class="iconb" onClick="{{sg.next}}" aria-label="Następny punkt"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button></div>
            </div>
          </div>
<!--@pheroB-->

  <section id="problemy" class="{{rv.prob}}" data-rv="prob" style="padding: 104px 0 104px">
    <div class="wrap">
      <div class="shead ri"><div><span class="eye">{{sg.pr.eye}}</span><h2 class="h2">{{sg.pr.h}} <span class="acc">{{sg.pr.ha}}</span></h2></div><p class="lead" style="max-width: 460px">{{sg.pr.lead}}</p></div>
      <div class="sgpg"><sc-for list="{{sg.prob}}" as="p" hint-placeholder-count="6"><article class="card sgpc ri" style="{{p.st}}">
        <span class="sgpi"><!--i:p.ic:20--></span><b class="sgq">{{p.q}}</b><p>{{p.d}}</p>
        <div class="sgfix"><span>Co robimy</span><p>{{p.fix}}</p></div>
        <a href="{{p.href}}" class="sgchip"><i></i>{{p.sn}} →</a>
      </article></sc-for></div>
    </div>
  </section>

  <section id="rok" class="{{rv.rok}}" data-rv="rok" style="padding: 0 0 104px">
    <div class="wrap">
      <div class="shead ri"><div><span class="eye">{{sg.day.eye}}</span><h2 class="h2">{{sg.day.h}}</h2></div><p class="lead" style="max-width: 460px">{{sg.day.lead}}</p></div>
      <div class="sgday ri">
        <div class="sgdl"><sc-for list="{{sg.day.items}}" as="d" hint-placeholder-count="6"><button type="button" class="{{d.cls}}" onClick="{{d.pick}}" aria-pressed="{{d.on}}"><em>{{d.tm}}</em><b>{{d.n}}</b><i class="sgdbar"></i></button></sc-for></div>
        <div class="card sgdc" key="{{sg.day.k}}" style="{{sg.day.cur.st}}">
          <div class="sgdv"><span class="sgdic"><!--i:sg.day.cur.ic:34:1.8--></span><span class="sgdtm">{{sg.day.cur.tm}}</span></div>
          <b class="h3" style="font-size: 28px">{{sg.day.cur.n}}</b><p class="lead" style="font-size: 17px">{{sg.day.cur.d}}</p>
          <div class="sgdch"><sc-for list="{{sg.day.cur.ch}}" as="c" hint-placeholder-count="3"><a href="{{c.href}}" class="sgchip" style="{{c.st}}"><i></i>{{c.n}}</a></sc-for></div>
          <div class="sgdhs"><span>Na przekroju:</span><sc-for list="{{sg.day.cur.hs}}" as="h" hint-placeholder-count="3"><button type="button" class="sgdh" style="{{h.st}}" onClick="{{h.pick}}" aria-label="Pokaż punkt {{h.no}} na przekroju">{{h.no}}</button></sc-for></div>
          <div class="sgprog"><i style="{{sg.day.pg}}"></i></div>
        </div>
      </div>
    </div>
  </section>

  <section id="przepisy" class="{{rv.prz}}" data-rv="prz" style="padding: 0 0 104px">
    <div class="wrap">
      <div class="shead ri"><div><span class="eye">Przepisy i obowiązki</span><h2 class="h2">{{sg.law.h}}</h2></div><p class="lead" style="max-width: 460px">{{sg.law.lead}}</p></div>
      <div class="sglg"><sc-for list="{{sg.law.items}}" as="l" hint-placeholder-count="4"><article class="card sglc ri">
        <div class="sglt"><span class="{{l.wc}}">{{l.who}}</span><code>{{l.a}}</code></div>
        <b class="h3">{{l.t}}</b><p>{{l.d}}</p>
      </article></sc-for></div>
      <p class="src ri" style="margin-top: 12px">Opisujemy przepisy, które dotyczą instalacji. To nie jest porada prawna.</p>
    </div>
  </section>

  <section id="gory" class="{{rv.gory}}" data-rv="gory" style="padding: 0 0 104px">
    <div class="wrap">
      <div class="sggw ri">
        <svg class="sggm" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0 160 L0 110 L120 70 L210 98 L330 30 L420 82 L520 50 L640 104 L760 40 L860 90 L980 56 L1090 96 L1200 64 L1200 160 Z"></path></svg>
        <div class="sggh"><span class="eye" style="color: #4CCBE6">Specyfika Podhala</span><h2 class="h2" style="font-size: clamp(28px, 3vw, 42px)">{{sg.gory.h}}</h2></div>
        <div class="sggg"><sc-for list="{{sg.gory.items}}" as="g" hint-placeholder-count="4"><div class="sggc"><span class="ico s"><!--i:g.ic:20--></span><b>{{g.t}}</b><span>{{g.d}}</span></div></sc-for></div>
      </div>
    </div>
  </section>

  <sc-if value="{{sg.hasReal}}" hint-placeholder-val="{{ true }}">
  <section id="realizacje-s" class="{{rv.real}}" data-rv="real" style="padding: 0 0 104px">
    <div class="wrap">
      <div class="shead ri"><div><span class="eye">Nasze realizacje</span><h2 class="h2">{{sg.realH}}</h2></div><a href="Realizacje.dc.html" class="btn btn-g btn-s">Wszystkie realizacje →</a></div>
      <div class="sgrg"><sc-for list="{{sg.real}}" as="r" hint-placeholder-count="3"><a href="Realizacje.dc.html" class="card sgrc ri"><span class="sgrph"><!--i:P.camera2:26:1.6--><em>Miejsce na zdjęcie</em></span><b class="h3">{{r.t}}</b><span class="mut">{{r.m}}</span><p>{{r.d}}</p></a></sc-for></div>
    </div>
  </section>
  </sc-if>

  <section id="przygotuj" class="{{rv.przyg}}" data-rv="przyg" style="padding: 0 0 104px">
    <div class="wrap">
      <div class="card sgck ri">
        <div class="sgckh"><span class="eye">{{sg.prepEye}}</span><h2 class="h2" style="font-size: clamp(28px, 3vw, 40px)">Przygotuj to, a wycena będzie szybsza.</h2><p class="lead" style="font-size: 17px">{{sg.prepLead}}</p>
          <div class="sgring" style="{{sg.ck.st}}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="sgr0"></circle><circle cx="60" cy="60" r="52" class="sgr1"></circle></svg><span><b>{{sg.ck.n}}</b>z {{sg.ck.t}}</span></div>
          <a href="{{sg.zap}}" class="btn btn-p">{{sg.ck.cta}}</a></div>
        <div class="sgckl"><sc-for list="{{sg.ck.items}}" as="c" hint-placeholder-count="7"><button type="button" class="{{c.cls}}" onClick="{{c.pick}}" aria-pressed="{{c.on}}"><em><!--i:P.check:14:3--></em><span>{{c.t}}</span></button></sc-for></div>
      </div>
    </div>
  </section>

<!--@odbsec-->
<!--@pkgs-->
<!--@faqsec-->
<!--@relsec-->
'''

JS = '''  initState() { return { hs: 0, ly: '', tch: false, dy: 0, dyT: false, ck: {} }; }
  navKey() { return 'seg'; }
  rvIds() { return ['prob', 'rok', 'prz', 'gory', 'real', 'przyg', 'pakiety', 'faq', 'rel']; }
  mountPage() {
    var self = this, N = %%NHS%%, M = %%NDAY%%;
    var calm = function (sel) { try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; var el = document.querySelector(sel); if (!el) return false; var r = el.getBoundingClientRect(); return r.bottom < 0 || r.top > (window.innerHeight || 800); } catch (e) { return false; } };
    this.every(3400, function () { if (!self.state.tch && !calm('.sgsc')) self.setState({ hs: (self.state.hs + 1) % N }); });
    this.every(4600, function () { if (!self.state.dyT && !calm('.sgday')) self.setState({ dy: (self.state.dy + 1) % M }); });
  }
  page(P, c) {
    const st = this.state, self = this, D = %%DATA%%;
    const SVC = %%SVC%%;
    const SIM = { dom: ['apt', 'pens'], apt: ['pens', 'hotel', 'dom'], pens: ['apt', 'hotel', 'rest'], hotel: ['pens', 'rest', 'apt'], rest: ['hotel', 'pens', 'sklep'], sklep: ['rest', 'firma'], firma: ['sklep', 'bud', 'dev'], kosc: ['szk', 'gmina'], szk: ['gmina', 'kosc'], gmina: ['szk', 'kosc'], dev: ['bud', 'firma'], bud: ['dev', 'firma'] };
    const sv = (k) => ({ n: SVC[k][0], href: SVC[k][1], st: '--c:' + SVC[k][2] });
    const N = D.hs.length, cur = D.hs[st.hs] || D.hs[0];
    const hc = {}, hp = {};
    D.hs.forEach((h, i) => { hc['k' + i] = 'hs' + (i === st.hs ? ' on' : '') + (st.ly && SVC[h.s][3] !== st.ly ? ' dim' : ''); hp['k' + i] = () => self.setState({ hs: i, tch: true }); });
    const LY = %%LY%%.filter((l) => !l[0] || D.hs.some((h) => SVC[h.s][3] === l[0]));
    const go = (d) => () => { let i = st.hs; for (let n = 0; n < N; n++) { i = (i + d + N) % N; if (!st.ly || SVC[D.hs[i].s][3] === st.ly) break; } self.setState({ hs: i, tch: true }); };
    const day = D.day.items, dc = day[st.dy] || day[0];
    const ckN = D.prep.filter((x, i) => st.ck[i]).length;
    const sg = {
      sceneT: D.sceneT, hc: hc, hp: hp, zap: 'Zaplanuj.dc.html#obiekt=' + D.k, prepEye: D.prepEye || 'Przed wizytą', prepLead: D.prepLead || (['kosc', 'szk', 'gmina'].indexOf(D.k) >= 0 ? 'Zaznaczenie, co już jest, przyspieszy wycenę. Zdjęcia można wysłać w formularzu albo przez WhatsApp.' : 'Zaznacz, co już masz. Zdjęcia możesz wysłać w formularzu albo przez WhatsApp.'),
      leg: D.hs.map((h, i) => ({ no: String(i + 1), t: h.t, on: i === st.hs ? 'true' : 'false', st: '--c:' + SVC[h.s][2], cls: 'sglgb' + (i === st.hs ? ' on' : '') + (st.ly && SVC[h.s][3] !== st.ly ? ' dim' : ''), pick: () => self.setState({ hs: i, tch: true }) })),
      ly: LY.map((l) => ({ n: l[1], on: st.ly === l[0] ? 'true' : 'false', cls: 'sglyb' + (st.ly === l[0] ? ' on' : ''), pick: () => { const f = D.hs.findIndex((h) => !l[0] || SVC[h.s][3] === l[0]); self.setState({ ly: l[0], tch: true, hs: f < 0 ? 0 : f }); } })),
      cur: { k: 'h' + st.hs, no: String(st.hs + 1), t: cur.t, d: cur.d, sn: SVC[cur.s][0], href: SVC[cur.s][1], st: '--c:' + SVC[cur.s][2] },
      pos: (st.hs + 1) + ' z ' + N, prev: go(-1), next: go(1),
      pr: D.pr, prob: D.prob.map((p) => ({ q: p.q, d: p.d, fix: p.fix, ic: P[p.ic], sn: SVC[p.s][0], href: SVC[p.s][1], st: '--c:' + SVC[p.s][2] })),
      day: { eye: D.day.eye, h: D.day.h, lead: D.day.lead, k: 'd' + st.dy, pg: 'width:' + Math.round((st.dy + 1) / day.length * 100) + '%',
        items: day.map((d, i) => ({ tm: d.tm, n: d.n, on: i === st.dy ? 'true' : 'false', cls: 'sgdb' + (i === st.dy ? ' on' : '') + (i < st.dy ? ' past' : ''), pick: () => self.setState({ dy: i, dyT: true }) })),
        cur: { tm: dc.tm, n: dc.n, d: dc.d, ic: P[dc.ic], st: '--c:' + SVC[dc.s[0]][2], ch: dc.s.map(sv),
          hs: D.hs.map((h, i) => ({ h: h, i: i })).filter((x) => dc.s.indexOf(x.h.s) >= 0).map((x) => ({ no: String(x.i + 1), st: '--c:' + SVC[x.h.s][2], pick: () => { self.setState({ hs: x.i, tch: true, ly: '' }); try { document.querySelector('.sgsc').scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} } })) } },
      law: { h: D.law.h, lead: D.law.lead, items: D.law.items.map((l) => ({ t: l.t, a: l.a, d: l.d, who: l.who, wc: 'sgwho ' + ({ 'Instalator': 'i', 'Razem': 'r' }[l.who] || 'o'), href: l.src[1], sl: l.src[0] })) },
      gory: { h: D.gory.h, items: D.gory.items.map((g) => ({ ic: P[g.ic], t: g.t, d: g.d, hasS: !!g.src, sh: g.src ? g.src[1] : '', sl: g.src ? g.src[0] : '' })) },
      hasReal: !!(D.real && D.real.length), realH: D.realH || '', real: D.real || [],
      ck: { n: ckN, t: D.prep.length, st: '--p:' + (ckN / D.prep.length), cta: ckN === D.prep.length ? 'Gotowe, wyślij zgłoszenie →' : 'Wyślij zdjęcia i opis →',
        items: D.prep.map((t, i) => ({ t: t, on: st.ck[i] ? 'true' : 'false', cls: 'sgci' + (st.ck[i] ? ' on' : ''), pick: () => { const k = Object.assign({}, st.ck); k[i] = !k[i]; self.setState({ ck: k }); } })) }
    };
    return Object.assign(this.sub(c, {
      hero: Object.assign({ mid: true, midT: 'Dla kogo', midH: 'Main.dc.html#dla-kogo', ctaHref: 'Zaplanuj.dc.html#obiekt=' + D.k }, D.hero),
      anc: D.anc, segRel: SIM[D.k] || [], segRelH: 'Podobne obiekty', pkgs: D.pkgs.map((p) => Object.assign({}, p, { ic: P[p.ic] })), faq: D.faq, rel: D.rel, src: D.src,
      sx: { faqH: D.faqH || 'Zanim zadzwonisz.', relH: 'Usługi, które łączymy w tym obiekcie.', pkg: { eye: 'Zestawy dla ' + D.dla, h: D.pkgH, p: '', note: 'To przykłady. Ostateczny zakres i cenę ustalamy po wizji lokalnej i podajemy na piśmie.' } }
    }), { pkSt: '--h:' + D.h, sg: sg, ctaEye: D.cta[0], ctaH: D.cta[1], ctaP: D.cta[2], ctaBtnHref: 'Zaplanuj.dc.html#obiekt=' + D.k });
  }
'''

def build(key):
    data = importlib.import_module('d_' + key).D
    hs = scenes.HS[key]
    assert len(hs) == len(data['hs']), (len(hs), len(data['hs']))
    for a, b in zip(hs, data['hs']):
        b['t'] = a['t']; b['s'] = a['s']
    svg = scene(scenes.ART[key](), hs, getattr(scenes, 'VB', {}).get(key, '0 0 720 470'))
    body = BODY.replace('%%SCENE%%', svg)
    svc = {k: list(v) for k, v in SV.items()}
    js = (JS.replace('%%DATA%%', json.dumps({k: v for k, v in data.items() if k not in ('title', 'desc', 'page', 'fold')}, ensure_ascii=False))
          .replace('%%SVC%%', json.dumps(svc, ensure_ascii=False)).replace('%%LY%%', json.dumps(LY, ensure_ascii=False))
          .replace('%%NHS%%', str(len(hs))).replace('%%NDAY%%', str(len(data['day']['items']))))
    pg = data['page']
    open(B + 'pages/%s.body.html' % pg, 'w').write(body)
    open(B + 'pages/%s.js' % pg, 'w').write(js)
    mp = B + 'pages/%s.meta.json' % pg
    meta = json.load(open(mp)) if os.path.exists(mp) else {'h': 9000, 'mh': 14000}
    meta.update({'title': data['title'], 'desc': data['desc'], 'props': {'ceny': {'editor': 'boolean', 'default': False}}})
    json.dump(meta, open(mp, 'w'), ensure_ascii=False)
    fp = B + 'fold.json'; F = json.load(open(fp)); nf = data.get('fold', ['rok', 'przepisy', 'faq'])
    if F.get(pg) != nf: F[pg] = nf; json.dump(F, open(fp, 'w'), ensure_ascii=False, indent=1)
    print('ok', pg)

if __name__ == '__main__':
    for k in sys.argv[1:]: build(k)
