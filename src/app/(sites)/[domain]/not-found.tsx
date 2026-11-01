import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { errorFields, log } from '@/lib/log'
import { NotFoundBiznes } from '@/sites/biznes/components/NotFoundBiznes'
import { NotFoundSoftware } from '@/sites/software/components/NotFoundSoftware'

import { tenantFromRequest } from './tenant'

// Missing page on a known domain: inside the line's header and footer, with a way back.
// An unknown domain never gets here — `requireTenant` in the layout falls back to the generic
// `(sites)/not-found.tsx`, which reveals nothing about the sites we serve.
// Software has its own page (board `NieZnaleziono`, spec. §6.11) while its texts are saved;
// Biznes its own with the search and popular places (audit 01.11).
export default async function SiteNotFound() {
  const tenant = await tenantFromRequest().catch(() => null)
  if (tenant?.line === 'software') {
    // A database failure must not turn the 404 into a 500: the generic page instead.
    const page = await NotFoundSoftware({ tenantId: tenant.id }).catch((error: unknown) => {
      log.error({ tenant: tenant.id, ...errorFields(error) }, 'Software 404 page failed')
      return null
    })
    if (page) return page
  }
  if (tenant?.line === 'biznes') return <NotFoundBiznes />
  return (
    <Section className="py-24">
      <Heading level={1} size="xl">
        Nie znaleziono strony
      </Heading>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
        Adres jest nieprawidłowy albo strona została przeniesiona lub usunięta.
      </p>
      <div className="mt-8">
        <Button href="/">Przejdź na stronę główną</Button>
      </div>
    </Section>
  )
}
