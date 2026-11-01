import { Container } from '@/components/ui/Container'
import { BRAND_LINKS } from '@/lib/brand/lines'
import { toTelHref } from '@/lib/site/link'

type Props = { phone: string | null }

/** One link to the hub of all lines (audyt 01.11 P1 #10): a partial list looked incomplete. */
const ALL_LINES = BRAND_LINKS.find((link) => link.line === 'prokom')

/**
 * Top bar of the Software line (spec. §3.0, `Main` 01): who we are on the left, the other
 * PRO-KOM lines (pro-kom.eu) and the line's phone on the right. Desktop only — above 1080 px.
 */
export function SwTopBar({ phone }: Props) {
  const tel = phone ? toTelHref(phone) : null
  return (
    <div className="hidden border-b border-border bg-surface-2 text-[13px] text-ink-2 min-[1081px]:block">
      <Container wide className="flex min-h-9 items-center justify-between gap-6">
        <p>Linia firmy PRO-KOM · od 2004 r. · Rabka-Zdrój</p>
        <div className="flex items-center gap-5">
          {ALL_LINES && (
            <nav aria-label="Linie PRO-KOM">
              <a href={ALL_LINES.href} className="hover:text-ink">
                Wszystkie linie PRO-KOM →
              </a>
            </nav>
          )}
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
