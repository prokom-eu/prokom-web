import type { CSSProperties } from 'react'

/** Accent of a service or object for its icon tile (`--mh`, a panel value). */
export const hue = (color: string | null | undefined): CSSProperties | undefined =>
  color ? ({ '--mh': color } as CSSProperties) : undefined
