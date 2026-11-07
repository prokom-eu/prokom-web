import Link from 'next/link'

import { CheckboxField } from '@/components/ui/Field'
import { linkInText } from '@/lib/inquiry/form'

export type ConsentMode = 'checkbox' | 'info'

type Props = {
  id: string
  /** `CompanyData.consent.mode`: a checkbox (today) or an information clause (lawyer decides). */
  mode: ConsentMode
  /** The clause; the words „polityce prywatności” become the link to the policy. */
  text: string
  privacyHref: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

const LINK_WORDS = 'polityce prywatności'

function Clause({ text, privacyHref }: Pick<Props, 'text' | 'privacyHref'>) {
  const parts = linkInText(text, LINK_WORDS)
  const link = (label: string) => (
    <Link
      href={privacyHref}
      className="font-semibold text-accent-text underline underline-offset-2"
    >
      {label}
    </Link>
  )
  return parts ? (
    <>
      {parts.before}
      {link(parts.link)}
      {parts.after}
    </>
  ) : (
    <>
      {text} {link('Polityka prywatności')}.
    </>
  )
}

/**
 * The consent of every form (spec §5 `ContactForm`, plan F3 pkt 2): the shared contact form and
 * the special forms of the lines (inquiry list, wizard, planner) use the same field. `checkbox`:
 * required to send; `info`: the clause as plain text, sending means accepting it.
 */
export function ConsentField({ id, mode, text, privacyHref, checked, onChange, error }: Props) {
  if (mode === 'info') {
    return (
      <p id={id} className="text-sm leading-relaxed text-ink-2" data-consent="info">
        <Clause text={text} privacyHref={privacyHref} />
      </p>
    )
  }
  return (
    <CheckboxField
      id={id}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      error={error}
      data-consent="checkbox"
    >
      <Clause text={text} privacyHref={privacyHref} />
    </CheckboxField>
  )
}
