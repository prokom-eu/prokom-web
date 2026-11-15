'use client'

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

import type { HubDeliveries } from '@/lib/prokom/deliveries'

import { changeQty, fromPreset, loadList, type RequestList, saveList } from './list'

type State = {
  segment: string
  setSegment: (key: string) => void
  list: RequestList
  change: (item: string, delta: number) => void
  loadPreset: (preset: readonly { item: string; qty: number }[]) => void
  clear: () => void
  services: string[]
  toggleService: (key: string) => void
  term: string | null
  setTerm: (term: string | null) => void
}

const DeliveriesContext = createContext<State | null>(null)

/** The page's shared state: chosen segment, the request list (kept in `sessionStorage`), services, term. */
export function DeliveriesState({
  groups,
  firstSegment,
  children,
}: {
  groups: HubDeliveries['listGroups']
  firstSegment: string
  children: ReactNode
}) {
  const [segment, setSegment] = useState(firstSegment)
  const [list, setList] = useState<RequestList>({})
  const [services, setServices] = useState<string[]>([])
  const [term, setTerm] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // After hydration only (the server renders an empty list).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setList(loadList(groups))
      setLoaded(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [groups])
  useEffect(() => {
    if (loaded) saveList(list)
  }, [list, loaded])

  const value = useMemo<State>(
    () => ({
      segment,
      setSegment,
      list,
      change: (item, delta) => setList((current) => changeQty(current, item, delta)),
      loadPreset: (preset) => setList(fromPreset(preset)),
      clear: () => setList({}),
      services,
      toggleService: (key) =>
        setServices((current) =>
          current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
        ),
      term,
      setTerm,
    }),
    [segment, list, services, term],
  )
  return <DeliveriesContext.Provider value={value}>{children}</DeliveriesContext.Provider>
}

export function useDeliveries(): State {
  const state = useContext(DeliveriesContext)
  if (!state) throw new Error('useDeliveries outside DeliveriesState')
  return state
}
