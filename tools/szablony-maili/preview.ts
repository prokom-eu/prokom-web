// podglad-szablonow.html — one dependency-free page with every template of every built line.
import { esc } from './html.ts'
import type { Content } from './load.ts'
import type { RenderedLine } from './render.ts'

export interface PreviewLine {
  rendered: RenderedLine
  /** Signature HTML with the logo as a data URI. */
  signature: string
}

/** JSON safe inside <script> (U+2028/2029 are valid in JS strings since ES2019). */
function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function previewHtml(content: Content, lines: PreviewLine[]): string {
  const data = lines.map(({ rendered: r, signature }) => {
    const d = content.dane.linie[r.line]
    return {
      id: r.line,
      name: d.NAZWA,
      acc: d.ACC,
      accTxt: d.ACC_TXT,
      signature,
      missing: r.missing,
      templates: r.templates.map((t) => ({
        group: t.groupTitle,
        name: t.template.nazwa,
        skrot: t.template.skrot,
        kiedy: t.template.kiedy,
        temat: t.subjectText,
        html: t.previewBody,
        search: `${t.template.nazwa} ${t.template.skrot} ${t.text}`.toLowerCase(),
      })),
    }
  })
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Szablony maili PRO-KOM</title>
<style>
:root{--bg:#EEF0EB;--panel:#fff;--line:#DDE2DA;--text:#1F2421;--muted:#5A615B;--acc:#244FB0;--acc-txt:#244FB0}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
header{position:sticky;top:0;z-index:2;background:var(--panel);border-bottom:1px solid var(--line);padding:12px 20px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
header h1{font-size:15px;margin:0 14px 0 0}
.tabs{display:flex;flex-wrap:wrap;gap:6px}
.tab{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;font:inherit;cursor:pointer;display:flex;gap:7px;align-items:center;color:var(--text)}
.tab[aria-selected=true]{border-color:var(--c);box-shadow:inset 0 0 0 1px var(--c);font-weight:700}
.tab .dot{width:9px;height:9px;border-radius:5px;background:var(--c)}
.tab .n{color:var(--muted);font-weight:400}
.search{margin-left:auto;min-width:220px;flex:1;max-width:340px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;font:inherit}
.tab:focus-visible,.search:focus-visible,.item:focus-visible{outline:2px solid var(--acc-txt);outline-offset:2px}
main{display:grid;grid-template-columns:320px minmax(0,1fr);gap:20px;padding:20px;max-width:1400px;margin:0 auto}
nav{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px;align-self:start;position:sticky;top:76px;max-height:calc(100vh - 96px);overflow:auto}
nav h2{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:12px 8px 4px}
.item{display:flex;justify-content:space-between;gap:8px;width:100%;text-align:left;border:0;background:none;padding:7px 8px;border-radius:8px;font:inherit;cursor:pointer;color:var(--text)}
.item:hover{background:#F3F4F1}.item[aria-current=true]{background:color-mix(in srgb,var(--acc) 10%,#fff);font-weight:600}
.item code{color:var(--muted);font-size:12px;white-space:nowrap}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px 26px}
.meta{color:var(--muted);font-size:12px;letter-spacing:.06em;text-transform:uppercase}
.card h3{font-size:22px;margin:4px 0 12px}
.note{background:#FFF8D6;border:1px solid #F0DC8A;border-radius:10px;padding:10px 14px;margin:0 0 12px}
.subject{margin:0 0 14px;color:var(--muted)}.subject b{color:var(--text)}
.mail{max-width:640px;border:1px solid var(--line);border-radius:12px;padding:26px 30px;background:#fff;overflow-x:auto}
.missing{background:#FDECEA;border:1px solid #F3B6AE;color:#8C1D12;border-radius:10px;padding:10px 14px;margin:0 0 14px}
.legend{margin-top:16px;color:var(--muted);font-size:13px}
.legend span{margin-right:14px}
.empty{color:var(--muted);padding:8px}
@media (max-width:860px){header{position:static}main{grid-template-columns:minmax(0,1fr);padding:12px 16px}nav{position:static;max-height:none}.search{max-width:none;margin-left:0}.card{padding:16px}.mail{padding:16px}}
</style></head><body>
<header><h1>Szablony maili PRO-KOM</h1><div class="tabs" role="tablist" id="tabs"></div>
<input class="search" id="q" type="search" placeholder="Szukaj: nazwa, skrót, treść…" aria-label="Szukaj szablonu"></header>
<main><nav id="list" aria-label="Szablony"></nav><section class="card" id="card" aria-live="polite"></section></main>
<script>
const LINES=${scriptJson(data)};
const $=(s)=>document.querySelector(s);
let line=0,sel=0;
function esc(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function tabs(){$('#tabs').innerHTML=LINES.map((l,i)=>'<button class="tab" role="tab" style="--c:'+l.acc+'" aria-selected="'+(i===line)+'" data-i="'+i+'"><span class="dot"></span>'+esc(l.name)+' <span class="n">'+l.templates.length+'</span></button>').join('');
document.documentElement.style.setProperty('--acc',LINES[line].acc);document.documentElement.style.setProperty('--acc-txt',LINES[line].accTxt)}
function list(){const q=$('#q').value.trim().toLowerCase();const L=LINES[line];let html='',group='',any=false;
L.templates.forEach((t,i)=>{if(q&&!t.search.includes(q))return;any=true;if(t.group!==group){group=t.group;html+='<h2>'+esc(group)+'</h2>'}
html+='<button class="item" data-t="'+i+'" aria-current="'+(i===sel)+'"><span>'+esc(t.name)+'</span><code>'+esc(t.skrot)+'</code></button>'});
$('#list').innerHTML=any?html:'<p class="empty">Brak wyników.</p>'}
function card(){const L=LINES[line],t=L.templates[sel];if(!t){$('#card').innerHTML='';return}
$('#card').innerHTML=(L.missing.length?'<div class="missing"><b>Dane do uzupełnienia w dane.yaml:</b><br>'+L.missing.map(esc).join('<br>')+'</div>':'')+
'<div class="meta">'+esc(L.name)+' · '+esc(t.group)+'</div><h3>'+esc(t.name)+'</h3>'+
'<p class="note"><b>Kiedy:</b> '+esc(t.kiedy)+'<br><b>Skrót:</b> <code>'+esc(t.skrot)+'</code> + Tab</p>'+
(t.temat?'<p class="subject"><b>Temat:</b> '+esc(t.temat)+'</p>':'')+
'<div class="mail">'+t.html+L.signature+'</div>'+
'<p class="legend"><span><span style="background:#FFF0A6;padding:0 3px">‹pole›</span> Quicktext zapyta przy wstawianiu</span><span><span style="border-bottom:1px dashed #C9A400">zdanie</span> opcjonalne</span><span><span style="outline:2px solid #D92D20">brak danych</span> do uzupełnienia</span></p>'}
function render(){tabs();list();card()}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;line=+b.dataset.i;sel=0;render();try{localStorage.setItem('szablony-line',line)}catch{}});
$('#list').addEventListener('click',e=>{const b=e.target.closest('.item');if(!b)return;sel=+b.dataset.t;list();card();if(innerWidth<=860)$('#card').scrollIntoView({behavior:'smooth'})});
$('#q').addEventListener('input',()=>{const q=$('#q').value.trim().toLowerCase();const first=LINES[line].templates.findIndex(t=>!q||t.search.includes(q));if(first>=0)sel=first;list();card()});
try{const s=+localStorage.getItem('szablony-line');if(s>=0&&s<LINES.length)line=s}catch{}
render();
</script>
<noscript><p style="padding:20px">${esc('Podgląd wymaga JavaScriptu. Treści są też w KATALOG-SZABLONOW.md.')}</p></noscript>
</body></html>
`
}
