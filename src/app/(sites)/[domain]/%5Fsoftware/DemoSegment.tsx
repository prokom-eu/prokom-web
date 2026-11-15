'use client'

import { useState } from 'react'

import { Segment } from '@/sites/software/components/ui/Segment'

const OPTIONS = [
  { value: 'strona', label: 'Strona' },
  { value: 'telefon', label: 'Na telefonie' },
  { value: 'system', label: 'System' },
] as const

/** The segment of the preview with its own state (the component is controlled). */
export function DemoSegment() {
  const [value, setValue] = useState<(typeof OPTIONS)[number]['value']>('strona')
  return <Segment label="Widok podglądu" options={OPTIONS} value={value} onChange={setValue} />
}
