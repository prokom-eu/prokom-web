'use client'

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

import { CONFIGURATOR_ANCHOR, parseHandoff } from '@/lib/biznes/procurement/handoff'
import {
  devicesWord,
  initialState,
  procurementMessage,
  procurementReducer,
  procurementTotals,
  type ConfiguratorData,
  type ProcurementAction,
  type ProcurementState,
  type Service,
} from '@/lib/biznes/procurement/logic'
import { toTelHref } from '@/lib/site/link'

import { STICKY_ACTION_BUTTON, StickyAction } from '../mobile/StickyAction'
import { ProcIcon } from './icons'

type Prefill = { message: string; count: number; key: number }

type ProcurementContextValue = {
  state: ProcurementState
  dispatch: (action: ProcurementAction) => void
  data: ConfiguratorData
  services: Service[]
  totals: ReturnType<typeof procurementTotals>
  /** The list for the form and the clipboard (§3). */
  message: string
  /** Last „Wyślij do wyceny”: the form remounts its list and count fields with it. */
  prefill: Prefill | null
  sendToForm: () => void
  notify: (text: string) => void
}

const ProcurementContext = createContext<ProcurementContextValue | null>(null)

export function useProcurement(): ProcurementContextValue {
  const value = use(ProcurementContext)
  if (!value) throw new Error('useProcurement outside ProcurementConfigurator')
  return value
}

const TOAST_MS = 3200

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The one state of a procurement page (ZAOPATRZENIE §3). Wraps the whole template, so the
 * server-rendered sections stay server components passed through as children, and the small
 * islands inside them (configurator, offer preview, schedule, hero chip, class cards, form)
 * read one context. Both server and browser render the initial state: no layout shift. Also
 * holds the toast and the phone's bottom action, and takes the home page handoff
 * (`?typ=&n=`).
 */
export function ProcurementConfigurator({
  data,
  services,
  phone,
  children,
}: {
  data: ConfiguratorData
  services: Service[]
  phone: string | null
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(procurementReducer, undefined, () =>
    initialState(data, services.length),
  )
  const [prefill, setPrefill] = useState<Prefill | null>(null)
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null)

  const totals = useMemo(() => procurementTotals(state, data), [state, data])
  const message = useMemo(() => procurementMessage(state, data, services), [state, data, services])

  const notify = useCallback((text: string) => setToast({ text, key: Date.now() }), [])

  const sendToForm = useCallback(() => {
    setPrefill({ message, count: state.count, key: Date.now() })
    window.setTimeout(() => notify('Lista z zestawu jest już w formularzu'), 400)
  }, [message, state.count, notify])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [toast])

  // Home page cards (§3, §8): set the state from the address once, then show the configurator.
  useEffect(() => {
    const handoff = parseHandoff(new URLSearchParams(window.location.search), data.types)
    if (!handoff) return
    dispatch({ type: 'handoff', handoff })
    const type = data.types[handoff.type ?? 0]
    const count = handoff.count ?? initialState(data, 0).count
    const timer = window.setTimeout(() => {
      document
        .getElementById(CONFIGURATOR_ANCHOR)
        ?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
      notify(`Zestaw ze strony głównej: ${type?.title ?? ''} × ${count}`)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [data, notify])

  const value = useMemo(
    () => ({ state, dispatch, data, services, totals, message, prefill, sendToForm, notify }),
    [state, data, services, totals, message, prefill, sendToForm, notify],
  )
  const tel = phone ? toTelHref(phone) : null

  return (
    <ProcurementContext value={value}>
      {children}
      <StickyAction>
        <div className="zp-msticky">
          {phone && tel && (
            <a href={tel} className="zp-mcall" aria-label={`Zadzwoń ${phone}`}>
              <ProcIcon name="phone" />
            </a>
          )}
          <a href="#formularz" className={STICKY_ACTION_BUTTON} onClick={sendToForm}>
            Wyślij zestaw · {totals.devices} {devicesWord(totals.devices)}
          </a>
        </div>
      </StickyAction>
      <div role="status" className="zp-toast-region">
        {toast && (
          <p key={toast.key} className="zp-toast">
            <ProcIcon name="check" />
            {toast.text}
          </p>
        )}
      </div>
    </ProcurementContext>
  )
}
