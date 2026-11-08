import { plural } from '../../plural'

/**
 * Configurator of the procurement pages (ZAOPATRZENIE §3, §4, §6): one state drives the
 * summary, the offer preview and the schedule. Pure functions, shared by the server render
 * (first paint) and the client island.
 */

type Forms = [string, string, string]

export type ConfiguratorItem = {
  /** Media id of the packshot; `null` = no photo (an icon instead). */
  image: number | null
  icon?: string
  name: string
  desc: string
  qty: number
  /** Offer column „Wymiary i parametry” (AGD); else the description is shown. */
  params?: string
  /** EU energy class A–G (AGD). */
  energy?: string
}

export type ConfiguratorType = {
  title: string
  /** Short label of the hero chip („12 × kawalerka”). */
  short: string
  /** Value of `?typ=`. */
  slug: string
  items: ConfiguratorItem[]
}

export type ConfiguratorData = {
  unit: Forms
  start: number
  types: ConfiguratorType[]
  /** AGD: equipment classes; the chosen one is also the offer variant. */
  classes?: string[]
  defaultClass?: number
  delivery: {
    options: { label: string; stages: number }[]
    defaultStages: number
    /** Stage word: etap / tura. */
    word: Forms
    unit: Forms
    set: Forms
  }
}

export type ServiceKind = 'system' | 'data' | 'inventory' | 'mount' | 'pickup'
/** IT service done before the delivery (panel field, ZAOPATRZENIE §0 pkt 2). */
export type Service = { label: string; kind: ServiceKind }

export type ProcurementState = {
  type: number
  count: number
  /** Indexes of unticked items of the current type. */
  off: number[]
  /** AGD: class index. */
  cls: number
  /** IT: indexes of the chosen services. */
  services: number[]
  stages: number
  more: string
  /** IT: offer variant shown in the preview. */
  variant: number
}

export const MIN_COUNT = 1
export const MAX_COUNT = 500
const DEVICES: Forms = ['urządzenie', 'urządzenia', 'urządzeń']
const KINDS: Forms = ['rodzaj', 'rodzaje', 'rodzajów']

export const devicesWord = (n: number) => plural(n, DEVICES)
export const kindsWord = (n: number) => plural(n, KINDS)

export function clampCount(n: number): number {
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(n)))
}

/** Start state: first type, the start count, default class and stages, every service on. */
export function initialState(data: ConfiguratorData, serviceCount: number): ProcurementState {
  return {
    type: 0,
    count: clampCount(data.start),
    off: [],
    cls: data.defaultClass ?? 0,
    services: Array.from({ length: serviceCount }, (_, i) => i),
    stages: data.delivery.defaultStages,
    more: '',
    variant: 0,
  }
}

export type ProcurementAction =
  | { type: 'type'; index: number }
  | { type: 'count'; value: number }
  | { type: 'item'; index: number }
  | { type: 'cls'; index: number }
  | { type: 'stages'; value: number }
  | { type: 'service'; index: number }
  | { type: 'variant'; index: number }
  | { type: 'more'; value: string }
  | { type: 'handoff'; handoff: { type: number | null; count: number | null } }

function toggle(list: number[], index: number): number[] {
  return list.includes(index)
    ? list.filter((item) => item !== index)
    : [...list, index].sort((a, b) => a - b)
}

/** The one state of the page (§3): a new type ticks every item again. */
export function procurementReducer(
  state: ProcurementState,
  action: ProcurementAction,
): ProcurementState {
  switch (action.type) {
    case 'type':
      return { ...state, type: action.index, off: [] }
    case 'count':
      return { ...state, count: clampCount(action.value) }
    case 'item':
      return { ...state, off: toggle(state.off, action.index) }
    case 'cls':
      return { ...state, cls: action.index }
    case 'stages':
      return { ...state, stages: action.value }
    case 'service':
      return { ...state, services: toggle(state.services, action.index) }
    case 'variant':
      return { ...state, variant: action.index }
    case 'more':
      return { ...state, more: action.value.trim() }
    case 'handoff': {
      const { type, count } = action.handoff
      return {
        ...state,
        ...(type !== null && { type, off: [] }),
        ...(count !== null && { count: clampCount(count) }),
      }
    }
  }
}

/** Splits n units into k stages almost evenly (larger first); the sizes sum to n. */
export function deliverySplit(n: number, stages: number): number[] {
  const k = Math.max(1, Math.min(stages, n))
  const base = Math.floor(n / k)
  const rest = n % k
  return Array.from({ length: k }, (_, i) => base + (i < rest ? 1 : 0))
}

function currentType(state: ProcurementState, data: ConfiguratorData): ConfiguratorType {
  return data.types[state.type] ?? data.types[0]!
}

export function procurementTotals(state: ProcurementState, data: ConfiguratorData) {
  const type = currentType(state, data)
  const chosen = type.items
    .filter((_, i) => !state.off.includes(i))
    .map((item) => ({ ...item, total: item.qty * state.count }))
  const stages = deliverySplit(state.count, state.stages).length
  const per = Math.ceil(state.count / stages)
  const { delivery } = data
  const deliveryText =
    stages === 1
      ? (delivery.options.find((option) => option.stages === 1)?.label ?? '').toLowerCase()
      : `${stages} ${plural(stages, delivery.word)} po ok. ${per} ${plural(per, delivery.unit)}`
  return {
    type,
    chosen,
    devices: chosen.reduce((sum, item) => sum + item.total, 0),
    kinds: chosen.length,
    stages,
    deliveryText,
  }
}

export type OfferRow = { name: string; params: string; energy?: string; qty: number }

/** Rows of the offer preview: chosen items (energy class for AGD) and, for IT, the services. */
export function offerRows(state: ProcurementState, data: ConfiguratorData, services: Service[]) {
  const { chosen, devices } = procurementTotals(state, data)
  const agd = Boolean(data.classes?.length)
  const rows: OfferRow[] = chosen.map((item) => ({
    name: item.name,
    params: item.params ?? item.desc,
    ...(agd && { energy: item.energy ?? '—' }),
    qty: item.total,
  }))
  const chosenServices = agd ? [] : services.filter((_, i) => state.services.includes(i))
  return {
    rows,
    total: devices,
    services: chosenServices.map((service): OfferRow => ({
      name: 'Usługa',
      params: service.label,
      qty: state.count,
    })),
  }
}

export type ScheduleRow = {
  label: string
  /** Start and end on a 10-column scale (weeks for AGD, working days for IT). */
  from: number
  to: number
  tone: 'hot' | 'plain'
  note: string
}

const COLUMNS = 10

function range(unit: Forms, from: number, to: number): string {
  return from === to ? `${unit[0]} ${from}` : `${unit[1]} ${from}–${to}`
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Bars of „Twój harmonogram”, counted from the count and the delivery mode. */
export function scheduleRows(
  state: ProcurementState,
  data: ConfiguratorData,
  services: Service[],
): ScheduleRow[] {
  const { delivery, unit } = data
  const sizes = deliverySplit(state.count, state.stages)
  const stageWord = capitalize(delivery.word[0])
  const rows: ScheduleRow[] = []
  let first = 1
  const stageRows = (start: number, end: number, gap: number, tone: ScheduleRow['tone']) => {
    const span = (end - start) / sizes.length
    sizes.forEach((size, i) => {
      const last = first + size - 1
      rows.push({
        label:
          sizes.length === 1 && data.classes?.length
            ? `Całość · ${range(unit, 1, state.count)}`
            : `${stageWord} ${i + 1} · ${range(unit, first, last)}`,
        from: start + i * span,
        to: start + (i + 1) * span - gap,
        tone,
        note: `${size} ${plural(size, delivery.set)}`,
      })
      first = last + 1
    })
  }

  if (data.classes?.length) {
    const showFlat = sizes.length > 1
    if (showFlat) {
      rows.push({
        label: 'Lokal pokazowy',
        from: 0,
        to: 1,
        tone: 'hot',
        note: `1 ${delivery.set[0]}`,
      })
    }
    stageRows(showFlat ? 2 : 1, COLUMNS, 0.3, 'plain')
    return rows
  }

  const chosen = services.filter((_, i) => state.services.includes(i))
  const has = (kind: ServiceKind) => chosen.some((service) => service.kind === kind)
  rows.push({
    label: 'Przygotowanie w Rabce',
    from: 0,
    to: 3,
    tone: 'plain',
    note: has('system') ? 'system i programy' : 'sprawdzenie sprzętu',
  })
  stageRows(3, has('pickup') ? 8.4 : COLUMNS, 0.2, 'hot')
  if (has('pickup')) {
    rows.push({
      label: 'Odbiór starego sprzętu',
      from: 8.6,
      to: COLUMNS,
      tone: 'plain',
      note: 'z usunięciem danych',
    })
  }
  return rows
}

/** The list for the form message and the clipboard (§3 „Wyślij do wyceny”, „Kopiuj”). */
export function procurementMessage(
  state: ProcurementState,
  data: ConfiguratorData,
  services: Service[],
): string {
  const { type, chosen, deliveryText } = procurementTotals(state, data)
  const lines = [
    `${type.title} × ${state.count} ${plural(state.count, data.unit)}:`,
    ...chosen.map((item) => `– ${item.name} × ${item.total}`),
  ]
  if (state.more.trim()) lines.push(`– Dodatkowo: ${state.more.trim()}`)
  if (data.classes?.length) {
    const cls = data.classes[state.cls]
    if (cls) lines.push(`Klasa sprzętu: ${cls}`)
  } else {
    const chosenServices = services.filter((_, i) => state.services.includes(i))
    if (chosenServices.length) {
      lines.push(`Przed dostawą: ${chosenServices.map((service) => service.label).join(', ')}`)
    }
  }
  lines.push(`Dostawa: ${deliveryText}`)
  return lines.join('\n')
}

/** Hero chip driven by the configurator (§3): „12 × kawalerka · 84 szt.”. */
export function liveChipText(state: ProcurementState, data: ConfiguratorData): string {
  const { type, devices } = procurementTotals(state, data)
  return `${state.count} × ${type.short} · ${devices} szt.`
}

/** Offer footer line (§4): `{delivery}` → the delivery of the configurator. */
export function fillDelivery(text: string, deliveryText: string): string {
  return text.replaceAll('{delivery}', deliveryText)
}

/** Width in px of a redacted price bar (§4): varying per row, the same on every render. */
export function redactWidth(row: number, base = 52, spread = 30): number {
  return base + ((row * 37) % spread)
}
