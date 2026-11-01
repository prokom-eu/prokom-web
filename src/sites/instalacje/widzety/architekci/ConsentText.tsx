import Link from 'next/link'

import {
  CONSENT_CLAUSE,
  PRIVACY_POLICY_LINK_TEXT,
  PRIVACY_POLICY_PATH,
} from '@/lib/inquiry/consent'
import { linkInText } from '@/lib/inquiry/form'

const consent = linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)

/** The consent clause of every inquiry form with the privacy policy link (like Kontakt, I11). */
export function ConsentText() {
  if (!consent) return <>{CONSENT_CLAUSE.text}</>
  return (
    <>
      {consent.before}
      <Link href={PRIVACY_POLICY_PATH} style={{ textDecoration: 'underline' }}>
        {consent.link}
      </Link>
      {consent.after}
    </>
  )
}
