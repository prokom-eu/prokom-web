import type { ReactNode } from 'react'

import { Phone } from '@/components/ContactDetails'
import { SiteLogo } from '@/components/SiteLogo'
import { Container } from '@/components/ui/Container'
import { TextLink } from '@/components/ui/TextLink'
import type { PublicSiteSettings } from '@/lib/site/public'
import type { SiteTenant } from '@/lib/tenant/byHost'

import './instalacje.css'

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings | null
  /** The promo bar, above the header. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of the Instalacje line (I1, ADR-I002 §0): for now the logo, an empty header and a
 * minimal footer with the line's contact from `SiteSettings`. The shell from the visualisation
 * (header, mega menu, bottom bar, sheet) comes in I3.
 */
export function InstalacjeFrame({ tenant, settings, promo, children }: Props) {
  return (
    <div className="inst-page min-h-dvh bg-surface text-ink">
      {promo}
      <header className="border-b border-border">
        <Container wide className="flex h-16 items-center">
          <SiteLogo tenant={tenant} />
        </Container>
      </header>
      {children}
      <footer className="mt-16 border-t border-border">
        <Container wide className="flex flex-wrap gap-x-8 gap-y-2 py-8 text-sm text-ink-2">
          <p className="font-bold text-ink">{tenant.name}</p>
          {settings?.phone && (
            <p>
              Telefon: <Phone number={settings.phone} />
            </p>
          )}
          {settings?.email && (
            <p>
              E-mail: <TextLink href={`mailto:${settings.email}`}>{settings.email}</TextLink>
            </p>
          )}
        </Container>
      </footer>
    </div>
  )
}
