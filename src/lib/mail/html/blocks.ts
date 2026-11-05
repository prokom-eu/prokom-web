import type { MailTheme } from '../lineCopy'
import { esc } from './esc'

/*
 * Building blocks of the line e-mails (spec MAILE §3, board 08; ADR-024 pkt 1): plain functions
 * returning HTML strings — 600 px tables with inline styles, no external CSS, fonts or images
 * besides the logo. Every argument is plain text and is escaped here; `html` arguments are the
 * output of these blocks. Each block is one table row of the white card made by `layout`.
 */

const FONT = 'Arial, Helvetica, sans-serif'
const INK = '#121613'
const INK_2 = '#4F5650'
const OK = { ink: '#2E7A1E', bg: '#EAF5E6' }

/** A table row of the card with side padding. */
const row = (content: string, style = '') =>
  `<tr><td style="padding:0 34px;${style}">${content}</td></tr>`

/** `href` is built by us (tel:, mailto:, https:// of our sites) and still escaped. */
export function button({
  href,
  label,
  theme,
  outline = false,
}: {
  href: string
  label: string
  theme: MailTheme
  outline?: boolean
}): string {
  const colors = outline
    ? `background:#FFFFFF;color:${INK};border:1.5px solid ${theme.border}`
    : `background:${theme.button};color:#FFFFFF;border:1.5px solid ${theme.button}`
  return (
    `<a href="${esc(href)}" style="display:inline-block;${colors};font-family:${FONT};` +
    `font-size:15px;font-weight:bold;line-height:44px;padding:0 20px;border-radius:12px;` +
    `text-decoration:none">${esc(label)}</a>`
  )
}

/** The logo image: `src` is `cid:logo` or an https address (`MAIL_LOGO_BASE_URL`). */
export type LogoImage = { src: string; alt: string }

const logoTag = (logo: LogoImage | null, height: number, fallback: string) =>
  logo
    ? `<img src="${esc(logo.src)}" alt="${esc(logo.alt)}" width="${Math.round((height * 564) / 132)}" height="${height}" style="display:block;border:0;height:${height}px;width:auto">`
    : `<b style="font-family:${FONT};font-size:16px;color:${INK}">${esc(fallback)}</b>`

/** Top of the card: logo on the left, „{label} {number}” on the right. */
export function header({
  logo,
  name,
  label,
  number,
}: {
  logo: LogoImage | null
  name: string
  label: string
  number: string
}): string {
  return (
    `<tr><td style="padding:26px 34px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td valign="middle">${logoTag(logo, 44, name)}</td>` +
    `<td valign="middle" align="right" style="font-family:${FONT};font-size:12px;color:${INK_2}">${esc(label)} <b style="color:${INK}">${esc(number)}</b></td>` +
    `</tr></table></td></tr>`
  )
}

/** Green pill „✓ {text}”. */
export function badge(text: string): string {
  return row(
    `<span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${OK.bg};color:${OK.ink};font-family:${FONT};font-size:12.5px;font-weight:bold">&#10003; ${esc(text)}</span>`,
    'padding-top:10px',
  )
}

/** An empty row of `height` px (margins do not work on table cells in every mail app). */
export const spacer = (height: number) =>
  `<tr><td style="height:${height}px;line-height:${height}px;font-size:0">&nbsp;</td></tr>`

export function heading(
  title: string,
  lead?: string | null,
  { size = 32, padding = '0 34px' }: { size?: number; padding?: string } = {},
): string {
  const leadHtml = lead
    ? `<p style="margin:12px 0 0;font-family:${FONT};font-size:16px;line-height:1.6;color:#3E453F">${esc(lead)}</p>`
    : ''
  return (
    `<tr><td style="padding:${padding}">` +
    `<h1 style="margin:16px 0 0;font-family:${FONT};font-size:${size}px;line-height:1.1;font-weight:bold;color:${INK}">${esc(title)}</h1>${leadHtml}</td></tr>`
  )
}

/** Small capitals above a block, in the line's accent text colour. */
const caption = (text: string, theme: MailTheme) =>
  `<div style="font-family:${FONT};font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:${theme.accentText};margin-bottom:10px">${esc(text)}</div>`

/** Grey card: a caption, label/value rows and item rows. Empty → nothing (spec §4.1 pkt 4). */
export function card({
  title,
  rows,
  items = [],
  theme,
}: {
  title: string
  rows: [string, string][]
  items?: { quantity: number; name: string }[]
  theme: MailTheme
}): string {
  if (rows.length === 0 && items.length === 0) return ''
  const rowHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:7px 0;border-top:1px solid ${theme.border};font-family:${FONT};font-size:14px;color:${INK_2}">${esc(label)}</td>` +
        `<td align="right" style="padding:7px 0;border-top:1px solid ${theme.border};font-family:${FONT};font-size:14px;font-weight:bold;color:${INK}">${esc(value)}</td></tr>`,
    )
    .join('')
  const itemHtml = items
    .map(
      (item) =>
        `<tr><td colspan="2" style="padding:7px 0;border-top:1px solid ${theme.border};font-family:${FONT};font-size:14px;color:${INK}"><b style="color:${theme.accentText}">${esc(item.quantity)} &times;</b> ${esc(item.name)}</td></tr>`,
    )
    .join('')
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${theme.surface};border-radius:14px"><tr><td style="padding:18px 20px">` +
      caption(title, theme) +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rowHtml}${itemHtml}</table>` +
      `</td></tr></table>`,
    'padding-top:22px',
  )
}

/** „Co dalej”: numbered steps, the first number on the button colour. */
export function steps({
  title,
  list,
  theme,
}: {
  title: string
  list: readonly { title: string; text?: string }[]
  theme: MailTheme
}): string {
  const items = list
    .map((step, i) => {
      const first = i === 0
      const number = `<td width="30" valign="top" style="padding:0 14px 14px 0"><div style="width:30px;height:30px;line-height:30px;border-radius:10px;text-align:center;background:${first ? theme.button : theme.surface};color:${first ? '#FFFFFF' : theme.accentText};font-family:${FONT};font-size:14px;font-weight:bold">${i + 1}</div></td>`
      const text = step.text
        ? `<br><span style="font-size:13.5px;line-height:1.5;color:${INK_2}">${esc(step.text)}</span>`
        : ''
      return `<tr>${number}<td valign="top" style="padding:0 0 14px;font-family:${FONT};color:${INK}"><b style="font-size:15px">${esc(step.title)}</b>${text}</td></tr>`
    })
    .join('')
  return row(
    caption(title, theme) +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>`,
    'padding-top:24px',
  )
}

/** Bordered box: title and line on the left, a button on the right. */
export function callout({
  title,
  text,
  action,
  theme,
}: {
  title: string
  text: string
  action: string
  theme: MailTheme
}): string {
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid ${theme.border};border-radius:14px"><tr>` +
      `<td style="padding:18px 20px;font-family:${FONT};color:${INK}"><b style="font-size:15px">${esc(title)}</b><br><span style="font-size:13px;color:${INK_2}">${esc(text)}</span></td>` +
      `<td align="right" style="padding:18px 20px">${action}</td></tr></table>`,
    'padding-top:4px',
  )
}

/** A paragraph; `html` is escaped text with our own markup (e.g. `<b>`). */
export function paragraph(html: string, style = ''): string {
  return row(
    `<p style="margin:0;font-family:${FONT};font-size:13.5px;line-height:1.55;color:${INK_2}">${html}</p>`,
    `padding-top:18px;${style}`,
  )
}

/** Escaped bold text for `paragraph`. */
export const strong = (text: string) => `<b style="color:${INK}">${esc(text)}</b>`

/** Footer on the card colour: small logo and domain, then lines of text, then links. */
export function footer({
  logo,
  name,
  domain,
  lines,
  links,
  theme,
}: {
  logo: LogoImage | null
  name: string
  domain: string
  lines: string[]
  links: { href: string; label: string }[]
  theme: MailTheme
}): string {
  const text = lines.map((line) => esc(line)).join('<br>')
  const linkHtml = links
    .map(
      (link) =>
        `<a href="${esc(link.href)}" style="color:${INK_2};text-decoration:underline">${esc(link.label)}</a>`,
    )
    .join(' &middot; ')
  return (
    spacer(26) +
    `<tr><td style="padding:22px 34px 26px;background:${theme.surface};border-top:1px solid ${theme.border};font-family:${FONT};font-size:12px;line-height:1.6;color:#5B625C">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px"><tr><td>${logoTag(logo, 20, name)}</td>` +
    `<td align="right" style="font-weight:bold;color:${INK}">${esc(domain)}</td></tr></table>` +
    `${text}${linkHtml ? `<br>${linkHtml}` : ''}</td></tr>`
  )
}

/** Hidden text shown by mail apps after the subject. The padding keeps body text out of it. */
const preheaderHtml = (text: string) =>
  `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#FFFFFF;opacity:0">${esc(text)}${'&#847;&zwnj;&nbsp;'.repeat(40)}</div>`

/**
 * The whole document: light colour scheme only (dark-mode apps invert anyway — the logo has its
 * own white margin, nothing depends on colour alone), frame colour, 5 px bar, the white card.
 */
export function layout({
  title,
  preheader,
  theme,
  rows,
}: {
  title: string
  preheader?: string
  theme: MailTheme
  rows: string[]
}): string {
  return (
    `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">` +
    `<title>${esc(title)}</title></head>` +
    `<body style="margin:0;padding:0;background:${theme.surface}">` +
    (preheader ? preheaderHtml(preheader) : '') +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${theme.surface}"><tr><td align="center" style="padding:24px 12px">` +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden">` +
    `<tr><td style="height:5px;line-height:5px;font-size:0;background:${theme.brand}">&nbsp;</td></tr>` +
    rows.filter(Boolean).join('') +
    `</table></td></tr></table></body></html>`
  )
}
