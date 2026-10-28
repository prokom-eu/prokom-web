'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  EMPTY_STATE,
  configNote,
  versionSelection,
  type ConfigState,
  type Configurator,
} from '@/lib/catalog/configurator'

type ProductConfig = {
  slug: string
  name: string
  config: Configurator | null
  variants: string[]
  state: ConfigState
  setState: (state: ConfigState) => void
  /** The note the chosen version writes to the inquiry item (empty without a choice). */
  note: string
}

const Context = createContext<ProductConfig | null>(null)

/** Query parameter of a version (K31-ZMIANY §13.5). */
export const VERSION_PARAM = 'wersja'

/**
 * The version chosen on the product page, shared by the configurator, „Twoja wersja” in the
 * hero and every „Dodaj do zapytania”. `?wersja=<model>` picks the model on arrival — read in
 * the browser, so the page itself stays static and cached.
 */
export function ProductConfigProvider({
  slug,
  name,
  config,
  variants,
  children,
}: {
  slug: string
  name: string
  config: Configurator | null
  variants: string[]
  children: ReactNode
}) {
  const [state, setState] = useState<ConfigState>(EMPTY_STATE)

  useEffect(() => {
    if (!config) return
    const version = new URLSearchParams(window.location.search).get(VERSION_PARAM)
    const picked = versionSelection(config, variants, version)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- once, from the address after hydration
    if (picked !== EMPTY_STATE) setState(picked)
  }, [config, variants])

  const value = useMemo(
    () => ({
      slug,
      name,
      config,
      variants,
      state,
      setState,
      note: config ? configNote(config, state) : '',
    }),
    [slug, name, config, variants, state],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useProductConfig(): ProductConfig {
  const value = useContext(Context)
  if (!value) throw new Error('useProductConfig outside ProductConfigProvider')
  return value
}
