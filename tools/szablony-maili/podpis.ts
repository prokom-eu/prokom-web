// Signature HTML (SZABLONY-MAILI.md §5) — layout as in probka-wzorzec.html.
import { FONT, LINE, STRONG, esc, escAttr } from './html.ts'
import type { Dane, LineId } from './schema.ts'

export interface LogoRef {
  src: string
  width: number
  height: number
}

function telHref(phone: string): string {
  return `tel:+48${phone.replace(/\D/g, '')}`
}

export function signatureHtml(dane: Dane, line: LineId, logo: LogoRef): string {
  const d = dane.linie[line]
  const w = dane.wspolne
  const phones = [d.TEL, d.TEL2].filter(Boolean).map(esc).join('&nbsp;·&nbsp;')
  return [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:22px;font-family:${FONT}">`,
    `<tr><td colspan="2" style="padding:0 0 14px"><div style="width:44px;height:3px;background:${d.ACC};border-radius:2px"></div></td></tr>`,
    `<tr><td style="padding:0 20px 0 0;vertical-align:top"><img src="${escAttr(logo.src)}" width="${logo.width}" height="${logo.height}" alt="${escAttr(d.NAZWA)}" style="display:block;width:${logo.width}px;height:auto;border:0"></td>`,
    `<td style="padding:0 0 0 20px;border-left:1px solid ${LINE};vertical-align:top;font:13px/1.6 ${FONT};color:#4A514B">`,
    `<div style="font:700 15px/1.3 ${FONT};color:${STRONG}">${esc(d.PODPISUJE)}</div>`,
    `<div style="color:${d.ACC_TXT};font-weight:700;margin-bottom:6px">${esc(d.ROLA)}</div>`,
    `<div><a href="${telHref(d.TEL)}" style="color:${STRONG};font-weight:700;text-decoration:none">${phones}</a> · <a href="mailto:${escAttr(d.MAIL)}" style="color:#4A514B;text-decoration:none">${esc(d.MAIL)}</a></div>`,
    `<div><a href="https://${escAttr(d.WWW)}" style="color:${d.ACC_TXT};font-weight:700;text-decoration:none">${esc(d.WWW)}</a></div><div>${esc(w.ADRES ?? '')} · ${esc(d.GODZ)}</div>`,
    `</td></tr>`,
    `<tr><td colspan="2" style="padding:14px 0 0;font:11px/1.5 ${FONT};color:#8A918B">${esc(d.OBIETNICA)}<br>${esc(w.FIRMA ?? '')} · NIP ${esc(w.NIP ?? '')} · od ${esc(w.OD_ROKU ?? '')} roku</td></tr></table>`,
  ].join('\n')
}

/** Standalone signature file for Thunderbird ("Attach the signature from a file"). */
export function signatureFile(dane: Dane, line: LineId, logo: LogoRef): string {
  return `<!doctype html>\n<html lang="pl"><head><meta charset="utf-8"><title>Podpis ${esc(dane.linie[line].NAZWA)}</title></head><body>\n${signatureHtml(dane, line, logo)}\n</body></html>\n`
}
