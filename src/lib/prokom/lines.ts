/** Lines shown on the hub (ADR-H001): the four of the company and the Gaming brand. */
export const HUB_LINES = ['biznes', 'instalacje', 'software', 'tech', 'gaming'] as const
export type HubLine = (typeof HUB_LINES)[number]

export const HUB_LINE_LABELS: Record<HubLine, string> = {
  biznes: 'Biznes',
  instalacje: 'Instalacje',
  software: 'Software',
  tech: 'Tech',
  gaming: 'Gaming',
}

export function isHubLine(value: unknown): value is HubLine {
  return typeof value === 'string' && (HUB_LINES as readonly string[]).includes(value)
}
