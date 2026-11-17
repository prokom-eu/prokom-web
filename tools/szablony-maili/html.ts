// HTML components of the e-mail templates — markup exactly as in SZABLONY-MAILI.md §4.
// Tables + inline styles only (Gmail, Outlook, Apple Mail); no classes, no <style>.

export interface Accent {
  ACC: string
  ACC_TXT: string
  ACC_BTN: string
  ACC_SOFT: string
}

export const FONT = 'Arial,Helvetica,sans-serif'
export const TEXT = '#1F2421'
export const MUTED = '#5A615B'
export const LINE = '#DDE2DA'
export const STRONG = '#121613'

export const BOX_COLORS = {
  uwaga: { bg: '#FFF6E5', bar: '#E09A12', title: '#8A5A00' },
  ok: { bg: '#ECF7EE', bar: '#2E8B4A', title: '#1F6B36' },
} as const

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function escAttr(s: string): string {
  return esc(s).replace(/"/g, '&quot;')
}

export function wrap(inner: string): string {
  return `<div style="font:15px/1.6 ${FONT};color:${TEXT};max-width:600px">${inner}</div>`
}

export function paragraph(inner: string): string {
  return `<p style="margin:0 0 14px">${inner}</p>`
}

export function strong(inner: string): string {
  return `<strong style="color:${STRONG}">${inner}</strong>`
}

function blockTitle(a: Accent, inner: string): string {
  return `<div style="font:700 11px/1.4 ${FONT};letter-spacing:.09em;text-transform:uppercase;color:${a.ACC_TXT};margin:0 0 8px">${inner}</div>`
}

export function card(a: Accent, title: string, rows: { label: string; value: string }[]): string {
  const trs = rows
    .map((r, i) => {
      const top = i === 0 ? '' : `border-top:1px solid ${LINE};`
      return (
        `<tr><td style="${top}padding:9px 14px 9px 0;width:36%;vertical-align:top;font:13px/1.45 ${FONT};color:${MUTED}">${r.label}</td>` +
        `<td style="${top}padding:9px 0;vertical-align:top;font:600 14.5px/1.45 ${FONT};color:${STRONG}">${r.value}</td></tr>`
      )
    })
    .join('')
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;max-width:600px;margin:4px 0 18px;background:${a.ACC_SOFT};border-left:4px solid ${a.ACC};border-radius:12px">` +
    `<tr><td style="padding:16px 20px 10px">${title ? blockTitle(a, title) : ''}` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">${trs}</table>` +
    `</td></tr></table>`
  )
}

/**
 * Numbered steps. The filled first circle uses ACC_BTN (not ACC): white digits on the lighter
 * ACC of Instalacje, Software and PRO-KOM fall below WCAG AA 4.5:1; ACC_BTN is the line's AA fill.
 */
export function steps(a: Accent, title: string, items: string[]): string {
  const trs = items
    .map((text, i) => {
      const circle =
        i === 0
          ? `background:${a.ACC_BTN};border:1.5px solid ${a.ACC_BTN};color:#FFFFFF`
          : `background:#FFFFFF;border:1.5px solid ${a.ACC};color:${a.ACC_TXT}`
      return (
        `<tr><td style="width:40px;vertical-align:top;padding:0 0 12px">` +
        `<div style="width:28px;height:28px;border-radius:14px;${circle};font:700 13px/28px ${FONT};text-align:center">${i + 1}</div></td>` +
        `<td style="vertical-align:top;padding:4px 0 12px;font:15px/1.55 ${FONT};color:${TEXT}">${text}</td></tr>`
      )
    })
    .join('')
  return (
    `<div style="margin:6px 0 10px">${title ? blockTitle(a, title) : ''}` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;max-width:600px">${trs}</table></div>`
  )
}

export type BoxKind = 'info' | 'uwaga' | 'ok'

export function box(a: Accent, kind: BoxKind, title: string, body: string): string {
  const c = kind === 'info' ? { bg: a.ACC_SOFT, bar: a.ACC, title: a.ACC_TXT } : BOX_COLORS[kind]
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;max-width:600px;margin:4px 0 18px;background:${c.bg};border-radius:12px">` +
    `<tr><td style="width:4px;background:${c.bar};border-radius:12px 0 0 12px"></td>` +
    `<td style="padding:13px 18px;font:14.5px/1.55 ${FONT};color:${TEXT}">` +
    (title
      ? `<div style="font:700 14.5px/1.4 ${FONT};color:${c.title};margin-bottom:3px">${title}</div>`
      : '') +
    `${body}</td></tr></table>`
  )
}

export function button(a: Accent, label: string, href: string): string {
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px">` +
    `<tr><td style="background:${a.ACC_BTN};border-radius:10px">` +
    `<a href="${href}" style="display:inline-block;padding:13px 24px;font:700 15px/1 ${FONT};color:#FFFFFF;text-decoration:none;border-radius:10px">${label}&nbsp;→</a>` +
    `</td></tr></table>`
  )
}

/** Line items table (role="presentation" as in probka-wzorzec.html; headers stay readable as text). */
export function items(
  a: Accent,
  header: string[],
  rows: { cells: string[]; total: boolean }[],
): string {
  const last = header.length - 1
  const th = header
    .map(
      (h, i) =>
        `<th align="${i === last ? 'right' : 'left'}" style="padding:9px 12px;font:700 11px/1.3 ${FONT};letter-spacing:.08em;text-transform:uppercase;color:${MUTED};background:#F3F4F1">${h}</th>`,
    )
    .join('')
  const trs = rows
    .map((r) => {
      const border = r.total ? `border-top:2px solid ${a.ACC}` : `border-top:1px solid ${LINE}`
      const weight = r.total ? 700 : 400
      const tds = r.cells
        .map((c, i) => {
          const align = i === last ? 'text-align:right;white-space:nowrap;' : ''
          return `<td style="${border};padding:10px 12px;font:${weight} 14px/1.45 ${FONT};color:${STRONG};${align}">${c}</td>`
        })
        .join('')
      return `<tr>${tds}</tr>`
    })
    .join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;max-width:600px;margin:4px 0 18px;border:1px solid ${LINE}"><tr>${th}</tr>${trs}</table>`
}

export function checkList(a: Accent, lines: string[]): string {
  const trs = lines
    .map(
      (l) =>
        `<tr><td style="width:24px;vertical-align:top;padding:2px 0 8px;font:700 15px/1.55 ${FONT};color:${a.ACC}">✓</td>` +
        `<td style="vertical-align:top;padding:2px 0 8px;font:15px/1.55 ${FONT};color:${TEXT}">${l}</td></tr>`,
    )
    .join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 10px;max-width:600px">${trs}</table>`
}

export function bulletList(lines: string[]): string {
  return `<ul style="margin:0 0 14px 0;padding-left:22px">${lines.map((l) => `<li style="margin:0 0 4px">${l}</li>`).join('')}</ul>`
}

/** Field marker in the preview (Quicktext asks for it on insert). */
export function fieldMark(label: string): string {
  return `<span style="background:#FFF0A6;border-radius:3px;padding:0 3px">‹${label}›</span>`
}
