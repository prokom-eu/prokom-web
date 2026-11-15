'use client'

import { useEffect } from 'react'

import type { HubCooperation } from '@/lib/prokom/cooperation'
import type { HubDeliveries } from '@/lib/prokom/deliveries'
import { registerFormAttachment } from '@/lib/shared/formAttachment'

import { useChoice } from '../dostawy/ChoiceState'
import { useDeliveries } from '../dostawy/DeliveriesState'
import { listText, listTotals } from '../dostawy/list'

/** The page the message came from (Dla firm, Dla domu) — the office sees it at the top. */
export function PageFormPart({ label }: { label: string }) {
  useEffect(() => registerFormAttachment(() => label), [label])
  return null
}

/**
 * „Inwestycje i dostawy”: the segment, the request list, the services and the term join the
 * message (spec §6.5 pkt 10); a sent inquiry empties the list.
 */
export function DeliveriesFormPart({
  label,
  data,
}: {
  label: string
  data: Pick<HubDeliveries, 'segments' | 'listGroups' | 'services' | 'page'>
}) {
  const { list, services, term, clear } = useDeliveries()
  const { segment } = useChoice()
  useEffect(() => {
    const read = () => {
      const chosen = data.segments.find((entry) => entry.key === segment)
      const text = listText(list, data.listGroups, {
        services: data.services.filter((s) => services.includes(s.key)).map((s) => s.title),
        term,
        pcs: data.page.list.pcs,
      })
      return [label, chosen ? `${data.page.hero.segmentsLabel} ${chosen.name}` : null, text]
        .filter(Boolean)
        .join('\n')
    }
    return registerFormAttachment(read, { onSent: clear })
  }, [label, data, list, services, term, segment, clear])
  const totals = listTotals(list, data.listGroups)
  return totals.positions > 0 ? (
    <p className="pk-plan__note">
      {data.page.list.yours}: {totals.pieces} {data.page.list.pcs}
    </p>
  ) : null
}

/** „Współpraca”: the chosen role joins the message (spec §6.6 „formularz adaptacyjny”). */
export function CooperationFormPart({
  label,
  roles,
}: {
  label: string
  roles: HubCooperation['roles']
}) {
  const { segment } = useChoice()
  useEffect(() => {
    const read = () => {
      const role = roles.find((entry) => entry.key === segment)
      return role ? `${label} — ${role.name}` : label
    }
    return registerFormAttachment(read)
  }, [label, roles, segment])
  return null
}
