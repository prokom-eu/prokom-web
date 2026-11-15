import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

import { navigation } from '../dane/nawigacja'
import { CtaBandView } from '../powloka/CtaBandView'
import { salonsNote } from '../powloka/salons'

type Props = {
  tenantId: number
  /** The page's band texts from the panel (`formPageFields → cta`); empty → the line's band. */
  cta: { eyebrow?: string | null; heading?: string | null; text?: string | null } | null | undefined
  titleId: string
}

/**
 * The CTA band before the footer of a page built from a line block (I11/I12): texts from the
 * page, phone from `SiteSettings`, salons from `CompanyData`; the frame's own band hides itself.
 */
export async function PageCtaBand({ tenantId, cta, titleId }: Props) {
  const [site, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const salons = salonsNote(company?.locations ?? [])
  const band = {
    ...navigation.ctaBand,
    eyebrow: cta?.eyebrow || navigation.ctaBand.eyebrow,
    title: cta?.heading || navigation.ctaBand.title,
    text: cta?.text || navigation.ctaBand.text,
  }
  return <CtaBandView band={band} phone={phone} salons={salons} titleId={titleId} page />
}
