/** Business lines of PRO-KOM; every tenant belongs to exactly one (ADR-006, ADR-010). */
export const LINES = [
  { label: 'PRO-KOM (hub)', value: 'prokom' },
  { label: 'Biznes', value: 'biznes' },
  { label: 'Instalacje', value: 'instalacje' },
  { label: 'Software', value: 'software' },
] as const

export type Line = (typeof LINES)[number]['value']

export const LINE_VALUES: readonly Line[] = LINES.map((line) => line.value)

export function isLine(value: unknown): value is Line {
  return typeof value === 'string' && (LINE_VALUES as readonly string[]).includes(value)
}
