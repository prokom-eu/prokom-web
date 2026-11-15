'use client'

import { useEffect } from 'react'

import type { HubCooperation } from '@/lib/prokom/cooperation'
import type { HubDeliveries } from '@/lib/prokom/deliveries'
import { registerFormAttachment } from '@/lib/shared/formAttachment'

import { useChoice } from '../dostawy/ChoiceState'
import { useDeliveries } from '../dostawy/DeliveriesState'
import { listText, listTotals } from '../dostawy/list'

/**
 * The page the message came from (Dla firm, Dla domu) and the industry or situation chosen in its
 * picker (`ChoiceState`) — the office sees them at the top.
 */
export function PageFormPart({
  label,
  choices,
}: {
  label: string
  choices: { key: string; name: string }[]
}) {
  const { segment } = useChoice()
  useEffect(() => {
    const read = () => {
      const chosen = choices.find((entry) => entry.key === segment)
      return chosen ? `${label} — ${chosen.name}` : label
    }
    return registerFormAttachment(read)
  }, [label, choices, segment])
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
  data: Pick<HubDeliveries, 'segments' | 'listGroups' | 'services'> & {
    /** Only the labels the part needs (a smaller page payload). */
    labels: { pcs: string; yours: string; segments: string }
  }
}) {
  const { list, services, term, clear } = useDeliveries()
  const { segment } = useChoice()
  useEffect(() => {
    const read = () => {
      const chosen = data.segments.find((entry) => entry.key === segment)
      const text = listText(list, data.listGroups, {
        services: data.services.filter((s) => services.includes(s.key)).map((s) => s.title),
        term,
        pcs: data.labels.pcs,
      })
      return [label, chosen ? `${data.labels.segments} ${chosen.name}` : null, text]
        .filter(Boolean)
        .join('\n')
    }
    return registerFormAttachment(read, { onSent: clear })
  }, [label, data, list, services, term, segment, clear])
  const totals = listTotals(list, data.listGroups)
  return totals.positions > 0 ? (
    <p className="pk-plan__note">
      {data.labels.yours}: {totals.pieces} {data.labels.pcs}
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
