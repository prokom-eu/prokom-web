'use client'

import { useField } from '@payloadcms/ui'

/**
 * Character counter under an SEO field of the panel (BIZ-3 §10.2, audit 0611 P1-8): the length
 * now and the range search results show in full. The path comes from the field's context.
 */
export function SeoCounter({ min, max, note }: { min: number; max: number; note?: string }) {
  const { value } = useField<string>()
  const length = typeof value === 'string' ? [...value.trim()].length : 0
  const fits = length === 0 || (length >= min && length <= max)
  return (
    <p
      aria-live="polite"
      style={{
        margin: '4px 0 0',
        fontSize: '12px',
        color: fits ? 'var(--theme-elevation-500)' : 'var(--theme-error-500)',
      }}
    >
      {length} znaków · zalecane {min}–{max}
      {note ? ` ${note}` : ''}
    </p>
  )
}
