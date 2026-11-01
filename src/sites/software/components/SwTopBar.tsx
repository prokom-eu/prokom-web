import { Container } from '@/components/ui/Container'
import { BRAND_LINKS } from '@/lib/brand/lines'
import { toTelHref } from '@/lib/site/link'

type Props = { phone: string | null }

/** Lines linked from Software (spec. §3.0): Tech stays hidden until it has a site. */
const OTHER_LINES = BRAND_LINKS.filter(
  (link) => link.line === 'biznes' || link.line === 'instalacje',
)

/**
 * Top bar of the Software line (spec. §3.0, `Main` 01): who we are on the left, the other
 * PRO-KOM lines and the line's phone on the right. Desktop only — above 1080 px.
 */
export function SwTopBar({ phone }: Props) {
  const tel = phone ? toTelHref(phone) : null
  return (
    <div className="hidden border-b border-border bg-surface-2 text-[13px] text-ink-2 min-[1081px]:block">
      <Container wide className="flex min-h-9 items-center justify-between gap-6">
        <p>Linia firmy PRO-KOM · od 2004 r. · Rabka-Zdrój</p>
        <div className="flex items-center gap-5">
          <nav aria-label="Linie PRO-KOM">
            <ul className="flex items-center gap-5">
              {OTHER_LINES.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-ink">
                    {link.line === 'biznes' ? 'PRO-KOM Biznes' : link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {phone &&
            (tel ? (
              <a href={tel} className="font-bold text-ink hover:underline">
                {phone}
              </a>
            ) : (
              <span className="font-bold text-ink">{phone}</span>
            ))}
        </div>
      </Container>
    </div>
  )
}
