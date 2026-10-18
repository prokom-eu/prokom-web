import type { Line } from '../tenant/lines'
import { isValidSlug } from '../tenant/uniqueSlug'

export type PromoBar = {
  text?: string | null
  startsAt?: string | null
  endsAt?: string | null
}

function parseDate(value: string | null | undefined): number | null | undefined {
  if (!value) return undefined
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

/** The promo bar shows only with text and inside its optional `startsAt`–`endsAt` window. */
export function isPromoActive(promo: PromoBar | null | undefined, now: Date): boolean {
  if (!promo?.text?.trim()) return false
  const start = parseDate(promo.startsAt)
  const end = parseDate(promo.endsAt)
  if (start === null || end === null) return false

  const time = now.getTime()
  if (start !== undefined && time < start) return false
  if (end !== undefined && time > end) return false
  return true
}

/**
 * `CompanyData` is one global for every domain, so a campaign names its lines; none = all
 * lines (ADR-012, rozstrzygnięcie 3).
 */
export function isPromoForLine(lines: readonly Line[] | null | undefined, line: Line): boolean {
  return !lines?.length || lines.includes(line)
}

/** `endsAt` must come after `startsAt` when both are set; otherwise the bar would never show. */
export function isValidPromoRange(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
): boolean {
  if (!startsAt || !endsAt) return true
  return Date.parse(endsAt) > Date.parse(startsAt)
}

/** `localStorage` key of a closed seasonal bar; the value is its campaign id (spec. §3.6). */
export const PROMO_CLOSED_KEY = 'pk-sz-closed'

/** Attribute on `<html>` that hides the bar (`[data-promo-bar]` in globals.css). */
export const PROMO_CLOSED_ATTRIBUTE = 'data-sz-closed'

/**
 * Inline script placed right before the bar: when the visitor closed this campaign, it marks
 * `<html>` while the page is still being parsed, so the bar never flashes. A new campaign id
 * shows the bar again. Only a slug id gets a script (it is written into JavaScript); without
 * a valid id the bar cannot be closed.
 */
export function promoClosedScript(campaignId: string | null): string | null {
  if (!campaignId || !isValidSlug(campaignId)) return null
  return `(function(){try{if(localStorage.getItem("${PROMO_CLOSED_KEY}")==="${campaignId}")document.documentElement.setAttribute("${PROMO_CLOSED_ATTRIBUTE}","")}catch(e){}})()`
}
