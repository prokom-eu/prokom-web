import Link from 'next/link'

import { SERVICE_KEYS } from '@/lib/instalacje/options'
import { tenantIdOf } from '@/lib/tenant/id'
import type { InstObject, InstService } from '@/payload-types'

import { hue } from '../hue'
import { InstIcon } from '../InstIcon'
import { InstSection } from './InstSection'

type Props = {
  tenantId: number
  heading: string | null | undefined
  services: InstService['relatedServices']
  objects: InstService['similarObjects']
  /** Heading of the „Podobne obiekty” strip (prototype `segRelH`). */
  objectsHeading?: string
  /** One more link under the cards (I16c: „Projektujesz? Współpraca dla architektów →”). */
  extraLink?: { label: string; href: string }
}

const ORDER: readonly string[] = SERVICE_KEYS.map(({ value }) => value)

type Entry = { _status?: 'draft' | 'published' | null; tenant?: unknown }

/**
 * Related entries the page may show: populated, published and of this tenant — a draft or
 * another site's entry never leaks (the panel already limits the choice; defence in depth).
 */
function shown<T extends Entry>(list: (number | T)[] | null | undefined, tenantId: number): T[] {
  return (list ?? []).filter(
    (entry): entry is T =>
      typeof entry === 'object' &&
      entry._status === 'published' &&
      tenantIdOf(entry.tenant) === tenantId,
  )
}

/**
 * „Zwykle idzie w parze” (`zrodlo/inc/relsec.html`): related services in menu order, then the
 * objects this installation is made for. Cards scroll sideways on a phone.
 */
export function Related({
  tenantId,
  heading,
  services,
  objects,
  objectsHeading,
  extraLink,
}: Props) {
  const cards = shown<InstService>(services, tenantId)
    .filter((service) => service.slug)
    .sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key))
  const chips = shown<InstObject>(objects, tenantId).filter((object) => object.slug)
  if (cards.length === 0 && chips.length === 0 && !extraLink) return null
  return (
    <InstSection id="powiazane" style={{ padding: '0 0 104px' }}>
      <div className="wrap">
        <div className="shead ri">
          <div>
            <span className="eye">Zwykle idzie w parze</span>
            <h2 className="h2">{heading || 'Połącz w jeden system.'}</h2>
          </div>
        </div>
        {cards.length > 0 && (
          <div className="rel">
            {cards.map((service) => (
              <Link key={service.id} href={`/${service.slug}`} className="relc ri">
                <span className="ico s">
                  <InstIcon name={service.icon} />
                </span>
                <b>{service.name}</b>
                {service.menuCaption && <span>{service.menuCaption}</span>}
                <span className="relgo">Zobacz →</span>
              </Link>
            ))}
          </div>
        )}
        {chips.length > 0 && (
          <div className="relseg ri">
            <span className="usl">{objectsHeading || 'Dla kogo robimy tę instalację'}</span>
            <div className="relsegl">
              {chips.map((object) => (
                <Link
                  key={object.id}
                  href={`/dla-kogo/${object.slug}`}
                  className="relsegc"
                  style={hue(object.color)}
                >
                  <span className="relsegi">
                    <InstIcon name={object.icon} />
                  </span>
                  <b>{object.name}</b>
                  {object.menuCaption && <span>{object.menuCaption}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
        {extraLink && (
          <Link href={extraLink.href} className="relx ri">
            {extraLink.label}
          </Link>
        )}
      </div>
    </InstSection>
  )
}
