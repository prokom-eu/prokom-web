import Link from 'next/link'
import { connection } from 'next/server'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getInstalacjeMenu } from '@/lib/instalacje/data'
import { SERVICE_KEYS } from '@/lib/instalacje/options'
import { isServiceKey } from '@/lib/instalacje/plan'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import type { InstPlannerBlock as InstPlannerBlockData } from '@/payload-types'

import { zaplanuj as Z } from '../../dane/zaplanuj'
import { InstIcon } from '../../InstIcon'
import { PlannerWizard, type PlannerService } from '../../widzety/zaplanuj/PlannerWizard'

// The mountain ridges behind the hero (`Zaplanuj.body.html`).
const RIDGE_1 =
  'M0 260 L0 170 L120 120 L210 150 L330 80 L430 130 L560 70 L690 140 L820 90 L940 150 L1060 100 L1190 150 L1310 110 L1440 150 L1440 260 Z'
const RIDGE_2 =
  'M0 260 L0 210 L160 170 L300 200 L470 150 L640 200 L800 160 L980 205 L1150 170 L1300 200 L1440 180 L1440 260 Z'

type Props = { block: InstPlannerBlockData; tenantId: number }

/**
 * The planner page `/zaplanuj` (ADR-I002 §0, `Zaplanuj.body.html`): the hero from the panel and
 * the four-step planner in one section. The services come from the panel in the planner's order
 * (prototype `c.SV`). No CTA band (prototype meta `cta: false`) and no „Zaplanuj” card in the
 * footer (`.xa-zapmark`). The block carries the page's h1.
 */
export async function InstPlannerBlock({ block, tenantId }: Props) {
  // The form token carries the render time (minimum fill time), so never from a cache.
  await connection()
  const [menu, site, company] = await Promise.all([
    getInstalacjeMenu(tenantId),
    getSiteSettings(tenantId),
    getCompanyData(),
  ])
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  const order = SERVICE_KEYS.map((s) => s.value as string)
  const services: PlannerService[] = menu.services
    .flatMap((column) => column.items)
    .filter((item) => isServiceKey(item.key))
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
    .map(({ key, label, caption, icon, color }) => ({
      key: key as PlannerService['key'],
      label,
      caption,
      icon,
      color,
    }))
  const telHref = site?.phone ? toTelHref(site.phone) : null
  const phone = site?.phone && telHref ? { label: site.phone, href: telHref } : null
  const firstHours = company?.locations?.[0]?.hours
  const hours = firstHours?.length ? hoursSummary(firstHours) : null
  const { hero } = block

  return (
    <section id="hero" className="phero zkh" style={{ paddingBottom: 96 }}>
      <div className="hgrid" />
      <div className="hglow" />
      <div className="hglow2" />
      <svg className="phmt" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
        <path className="phm1" d={RIDGE_1} />
        <path className="phm2" d={RIDGE_2} />
      </svg>
      <div className="wrap" style={{ position: 'relative' }}>
        <nav className="crumb in d1" aria-label="Okruszki">
          <Link href="/">Start</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" style={{ color: 'var(--ink)' }}>
            {hero?.crumb || 'Zaplanuj instalację'}
          </span>
        </nav>
        <div className="zkhead">
          <div className="zkht">
            {hero?.eyebrow && <span className="eye in d1">{hero.eyebrow}</span>}
            <h1 className="h1 in d2">
              {hero?.h1a}
              {hero?.h1b && (
                <>
                  {' '}
                  <span className="acc">{hero.h1b}</span>
                </>
              )}
            </h1>
            {hero?.lead && <p className="lead in d3">{hero.lead}</p>}
          </div>
          <div className="zktrust in d4">
            {Z.trust.map((t) => (
              <div key={t.title}>
                <span className="ico s">
                  <InstIcon name={t.icon} />
                </span>
                <span>
                  <b>{t.title}</b>
                  <span>{t.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <PlannerWizard services={services} formToken={formToken} phone={phone} hours={hours} />
      </div>
      {/* Markers: the footer hides its „Zaplanuj” card, the frame hides its CTA band. */}
      <i className="xa-zapmark" hidden />
      <i data-cta-page="" hidden />
    </section>
  )
}
