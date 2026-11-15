'use client'

import type { HubCooperation } from '@/lib/prokom/cooperation'

import { useChoice } from '../dostawy/ChoiceState'

/**
 * The form heading and the phone follow the chosen role (spec §6.6 „formularz adaptacyjny”); the
 * phone is the one of the role's line, from its panel.
 */
export function RoleFormSummary({
  texts,
  roles,
  phones,
}: {
  texts: HubCooperation['page']['form']
  roles: HubCooperation['roles']
  phones: Record<string, { phone: string; tel: string }>
}) {
  const { segment } = useChoice()
  const role = roles.find((entry) => entry.key === segment) ?? roles[0]
  const call = role ? phones[role.key] : undefined
  return (
    <div className="pk-contact__main">
      <span className="pk-eb">{texts.eyebrow}</span>
      <h2 id="formularz-h" className="pk-h2">
        {role?.form.heading}
      </h2>
      {role && (
        <p className="pk-plan__note">
          {texts.to} {role.lines}
        </p>
      )}
      {call && (
        <a href={call.tel} className="pk-hbtn pk-hbtn--accent pk-hbtn--phone">
          {call.phone}
        </a>
      )}
    </div>
  )
}
