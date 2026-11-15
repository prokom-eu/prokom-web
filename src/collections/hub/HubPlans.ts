import { HUB_LINE_LABELS, HUB_LINES } from '../../lib/prokom/lines'
import { hubCollection, keyField, orderField, textList } from './common'

export const HUB_PLAN_TYPES = [
  { label: 'Persona (Dobierz na głównej)', value: 'persona' },
  { label: 'Branża (Dla firm)', value: 'branza' },
  { label: 'Sytuacja firmy', value: 'sytuacja-firma' },
  { label: 'Sytuacja domu (Dla domu)', value: 'sytuacja-dom' },
] as const

const lineOptions = HUB_LINES.map((value) => ({ label: HUB_LINE_LABELS[value], value }))

/**
 * Plans for a persona, industry or situation (ADR-H002 §3): points grouped by line. Personas of the
 * home page and industries of `/dla-firm` are separate records — the boards give them different
 * sets and texts (decision 14.11, ADR-H002 „Rozstrzygnięcia H1”).
 */
export const HubPlans = hubCollection({
  slug: 'hub-plans',
  labels: { singular: 'Plan', plural: 'Plany (persony, branże, sytuacje)' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'order', '_status'],
  },
  defaultSort: 'order',
  indexes: [{ fields: ['tenant', 'type', 'key'], unique: true }],
  visible: {
    name: 'Nazwa',
    title: 'Tytuł',
    lead: 'Wstęp',
    groups: 'Punkty po liniach',
    start: 'Od czego zaczynamy',
    questions: 'Pytania na start',
    steps: 'Kroki',
  },
  fields: [
    keyField(),
    orderField,
    {
      name: 'type',
      label: 'Rodzaj',
      type: 'select',
      required: true,
      options: [...HUB_PLAN_TYPES],
      admin: { position: 'sidebar' },
    },
    { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 60 },
    { name: 'title', label: 'Tytuł', type: 'text', maxLength: 160 },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 500 },
    {
      name: 'groups',
      label: 'Punkty po liniach',
      type: 'array',
      maxRows: 5,
      fields: [
        { name: 'line', label: 'Linia', type: 'select', required: true, options: lineOptions },
        textList('points', 'Punkty', 12),
      ],
    },
    textList('start', 'Od czego zaczynamy', 8),
    textList('questions', 'Pytania na start', 8),
    textList('steps', 'Kroki', 8),
    {
      name: 'call',
      label: 'Telefon linii',
      type: 'select',
      options: lineOptions,
      admin: { description: 'Której linii numer pokazać przy planie (Dla domu).' },
    },
  ],
})
