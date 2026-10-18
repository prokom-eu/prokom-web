/** Departments of the Biznes line with their own phone / e-mail (ADR-012, rozstrzygnięcie 6). */
export const DEPARTMENTS = [
  { label: 'Opieka IT', value: 'it-care' },
  { label: 'Kasy fiskalne', value: 'fiscal' },
  { label: 'Oprogramowanie', value: 'software' },
  { label: 'Sprzęt', value: 'hardware' },
  { label: 'Dofinansowania', value: 'funding' },
] as const

export type Department = (typeof DEPARTMENTS)[number]['value']
