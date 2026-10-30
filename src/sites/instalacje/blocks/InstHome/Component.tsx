import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { InstHomeBlock as InstHomeBlockData } from '@/payload-types'

import { InstIcon } from '../../InstIcon'

type Props = { block: InstHomeBlockData; tenantId: number }

/** Where „Zaplanuj instalację” leads: the planner with the hero's starting set (spec §5.1). */
export const HOME_PLAN_HREF = '/zaplanuj#obiekt=pens&uslugi=kam,wifi'

/**
 * Home page of the Instalacje line (ADR-I002 §0, KOMPONENTY §3): the hero „Twój obiekt na
 * żywo”. The text is rendered on the server (SEO, LCP from the h1); the live scene beside it
 * comes in I5, the other home sections in I6.
 * Until the hero styles come (I5), the buttons use the page buttons, readable in both themes.
 */
export async function InstHomeBlock({ block, tenantId }: Props) {
  const { hero } = block
  const site = await getSiteSettings(tenantId)
  const telHref = site?.phone ? toTelHref(site.phone) : null

  return (
    <section id="start" className="hx night" data-hx-time="night">
      <div className="hxin">
        <div className="hxt">
          <span className="hpill">
            <span className="live" aria-hidden="true" />
            {hero.eyebrow}
          </span>
          <h1 className="disp">
            <span className="hxs">{hero.kicker}</span>
            <span className="sr-only">. </span>
            {hero.h1a} <span className="hxk">{hero.h1b}</span>
          </h1>
          <p className="lead">{hero.lead}</p>
          <div className="hxcta">
            <a href={HOME_PLAN_HREF} className="btn btn-p">
              <InstIcon name="home" strokeWidth={2.2} />
              Zaplanuj instalację
            </a>
            {site?.phone && telHref ? (
              <a href={telHref} className="btn btn-g">
                <InstIcon name="phone" />
                {site.phone}
              </a>
            ) : null}
          </div>
          {hero.trust?.length ? (
            <div className="htrust">
              {hero.trust.map((point) => (
                <span key={point.id ?? point.text}>
                  <i>
                    <InstIcon name={point.icon} size={14} strokeWidth={2.4} />
                  </i>
                  {point.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
