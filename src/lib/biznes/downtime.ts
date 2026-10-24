/**
 * Downtime calculator of /opieka-it (spec. §6.4 pkt 3, plansza Dzial): what one failure costs.
 * Counted in the browser only — the numbers never leave it.
 */

export type Outage = '2h' | 'half' | 'day' | 'weekend'

export type DowntimeInput = { revenue: number; hoursPerDay: number; outage: Outage }

export const REVENUE_RANGE = { min: 500, max: 30_000, step: 500 } as const

export const HOURS_OPTIONS = [6, 8, 10, 12, 14] as const

/** `phrase` starts the result sentence („Cały dzień przestoju — …”). */
export const OUTAGES: readonly { value: Outage; label: string; phrase: string }[] = [
  { value: '2h', label: '2 godziny', phrase: 'Dwie godziny' },
  { value: 'half', label: 'Pół dnia', phrase: 'Pół dnia' },
  { value: 'day', label: 'Cały dzień', phrase: 'Cały dzień' },
  { value: 'weekend', label: 'Weekend', phrase: 'Weekend' },
]

export const DOWNTIME_DEFAULTS: DowntimeInput = { revenue: 5_000, hoursPerDay: 10, outage: 'day' }

/** Hours without sales: a weekend is two working days. */
export function outageHours(outage: Outage, hoursPerDay: number): number {
  switch (outage) {
    case '2h':
      return 2
    case 'half':
      return hoursPerDay / 2
    case 'day':
      return hoursPerDay
    case 'weekend':
      return hoursPerDay * 2
  }
}

/** Hour cost = revenue ÷ hours; failure cost = hour cost × outage hours (whole złoty). */
export function downtimeCost({ revenue, hoursPerDay, outage }: DowntimeInput) {
  const perHour = revenue / hoursPerDay
  return {
    perHour: Math.round(perHour),
    total: Math.round(perHour * outageHours(outage, hoursPerDay)),
  }
}

/** „5 000” — groups of three with a non-breaking space, so the number never wraps. */
export function formatZl(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Position of a revenue on the slider, 0–100 (fill of the track). */
export function revenueShare(revenue: number): number {
  const { min, max } = REVENUE_RANGE
  return ((revenue - min) / (max - min)) * 100
}
