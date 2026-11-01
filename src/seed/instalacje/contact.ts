import type { InstalacjeSetting } from '../../payload-types'

/**
 * The line's real contact and the architects' contact person (boss's answers 01.11.2026,
 * `docs/stan/STAN-instalacje.md` „Dane szefa”). The seed writes them only where the panel still
 * holds the sample or nothing — what an editor typed wins; staging and production get theirs in
 * the panel.
 */
export const INSTALACJE_CONTACT = {
  phone: '+48 889 003 889',
  email: 'kontakt@prokominstalacje.pl',
  whatsapp: '+48 889 003 889',
} as const

/** The contact person of `/dla-architektow`: the owner, phone and e-mail of the line. */
export const ARCHITECTS_CONTACT = {
  name: 'Tadeusz Wójciak',
  role: 'Właściciel PRO-KOM · opiekun architektów i wykonawców',
} as const

/**
 * A value `pnpm seed` wrote as a sample (`src/seed/sample.ts`), or nothing at all — so a field
 * cleared on purpose in a local panel gets the real value back on the next seed (local only).
 */
export function isSample(value: string | null | undefined): boolean {
  const text = value?.trim() ?? ''
  return text === '' || text.startsWith('+48 000') || text.endsWith('@example.test')
}

type SiteContact = { phone?: string | null; email?: string | null }

/** `SiteSettings` fields to write (phone, e-mail); `null` = nothing to change. */
export function siteContactUpdate(current: SiteContact): SiteContact | null {
  const update: SiteContact = {}
  for (const key of ['phone', 'email'] as const) {
    if (isSample(current[key])) update[key] = INSTALACJE_CONTACT[key]
  }
  return Object.keys(update).length > 0 ? update : null
}

type LineSettings = Partial<Pick<InstalacjeSetting, 'whatsapp' | 'architects'>>
type LineSettingsUpdate = {
  whatsapp?: string
  architects?: NonNullable<InstalacjeSetting['architects']>
}

/**
 * `InstalacjeSettings` fields to write: WhatsApp while empty, the contact person while the panel
 * has no name. Phone and e-mail of the person stay empty — the page falls back to the line's.
 */
export function lineSettingsUpdate(current: LineSettings): LineSettingsUpdate | null {
  const update: LineSettingsUpdate = {}
  if (isSample(current.whatsapp)) update.whatsapp = INSTALACJE_CONTACT.whatsapp
  if (!current.architects?.name?.trim()) {
    update.architects = {
      ...current.architects,
      name: ARCHITECTS_CONTACT.name,
      role: current.architects?.role?.trim() || ARCHITECTS_CONTACT.role,
    }
  }
  return Object.keys(update).length > 0 ? update : null
}
