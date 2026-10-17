import type { ComponentProps } from 'react'

import { cx } from './cx'

export type HeadingLevel = 1 | 2 | 3 | 4
export type HeadingSize = 'display' | 'xl' | 'lg' | 'md'

// Archivo 800 only (no 600 "slightly bolder" headings) and widened, as in the brand brief.
const SIZE: Record<HeadingSize, string> = {
  display: 'text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[1.02] tracking-[-0.02em] font-stretch-112%',
  xl: 'text-3xl leading-tight tracking-[-0.01em] sm:text-4xl font-stretch-110%',
  lg: 'text-2xl leading-snug',
  md: 'text-xl leading-snug',
}

const DEFAULT_SIZE: Record<HeadingLevel, HeadingSize> = { 1: 'display', 2: 'xl', 3: 'lg', 4: 'md' }

type Props = ComponentProps<'h1'> & {
  /** Document outline level — independent of the look. */
  level: HeadingLevel
  size?: HeadingSize
}

export function Heading({ level, size, className, ...props }: Props) {
  const Tag = `h${level}` as const
  return (
    <Tag
      className={cx('font-display font-extrabold', SIZE[size ?? DEFAULT_SIZE[level]], className)}
      {...props}
    />
  )
}
