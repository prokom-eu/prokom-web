// Wzorzec z planszy Main (v23): przewijanie szyny sekcji z łagodnym hamowaniem + „przyjazd” nagłówka.
// W kodzie: przenieś do komponentu szyny (home/rail), z tą samą logiką i reduced motion.
    if (!window.pkScroll) window.pkScroll = function (el) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var top = el.getBoundingClientRect().top + window.scrollY - 84, from = window.scrollY, dist = top - from;
      var arrive = function () { el.classList.remove('pk-arrive'); void el.offsetWidth; el.classList.add('pk-arrive'); setTimeout(function () { el.classList.remove('pk-arrive'); }, 1400); };
      if (reduce || Math.abs(dist) < 4) { window.scrollTo(0, top); arrive(); return; }
      var dur = Math.min(1100, Math.max(520, Math.abs(dist) * 0.35)), t0 = null;
      var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      var step = function (ts) { if (t0 === null) t0 = ts; var k = Math.min(1, (ts - t0) / dur); window.scrollTo(0, from + dist * ease(k)); if (k < 1) requestAnimationFrame(step); else arrive(); };
      requestAnimationFrame(step);
    };
