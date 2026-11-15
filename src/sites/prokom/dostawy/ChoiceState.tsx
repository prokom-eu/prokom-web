'use client'

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'

type Choice = { segment: string; setSegment: (key: string) => void }

const ChoiceContext = createContext<Choice | null>(null)

/**
 * The chosen segment (`/inwestycje-i-dostawy`) or role (`/wspolpraca`), shared by the picker and
 * the form heading. Apart from the request list, so a page without a list never touches it.
 */
export function ChoiceState({ first, children }: { first: string; children: ReactNode }) {
  const [segment, setSegment] = useState(first)
  const value = useMemo(() => ({ segment, setSegment }), [segment])
  return <ChoiceContext.Provider value={value}>{children}</ChoiceContext.Provider>
}

export function useChoice(): Choice {
  const state = useContext(ChoiceContext)
  if (!state) throw new Error('useChoice outside ChoiceState')
  return state
}
