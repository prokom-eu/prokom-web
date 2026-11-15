'use client'

import type { HubCooperation } from '@/lib/prokom/cooperation'

import { useDeliveries } from '../dostawy/DeliveriesState'

/** The form heading follows the chosen role (spec §6.6 „formularz adaptacyjny”). */
export function RoleFormSummary({
  texts,
  roles,
}: {
  texts: HubCooperation['page']['form']
  roles: HubCooperation['roles']
}) {
  const { segment } = useDeliveries()
  const role = roles.find((entry) => entry.key === segment) ?? roles[0]
  return (
    <div className="pk-contact__main">
      <span className="pk-eb">{texts.eyebrow}</span>
      <h2 id="formularz-h" className="pk-h2" aria-live="polite">
        {role?.form.heading}
      </h2>
      {role && (
        <p className="pk-plan__note">
          {texts.to} {role.lines}
        </p>
      )}
    </div>
  )
}
