import Link from 'next/link'
import type { ReactNode } from 'react'

import type { InstService } from '@/payload-types'

import { InstIcon } from '../InstIcon'
import { AnchorsBar } from '../powloka/AnchorsBar'
import type { Phone } from './types'

type Props = {
  hero: InstService['hero']
  /** Fallback for an empty breadcrumb and h1 (the service name). */
  name: string
  anchors: InstService['anchors']
  phone: Phone | null
  /** Right column: the page's widget or illustration (`.phv`). */
  widget?: ReactNode
  /** Middle breadcrumb (object pages: „Dla kogo”, prototype `hero.midT`); default „Usługi”. */
  parent?: { label: string; href: string }
}

const SERVICES = { label: 'Usługi', href: '/#uslugi' }

// The mountain ridges behind the hero (`zrodlo/inc/pheroA.html`).
const RIDGE_1 =
  'M0 150 L120 96 L210 124 L330 54 L420 104 L520 74 L640 128 L760 62 L860 110 L980 70 L1100 120 L1220 80 L1330 116 L1440 90 V240 H0 Z'
const RIDGE_2 =
  'M0 196 L160 160 L300 182 L460 150 L620 186 L780 156 L940 190 L1100 162 L1260 188 L1440 166 V240 H0 Z'

/**
 * Hero of a service or object page (`pheroA` + `pheroB`): breadcrumbs, the h1 with its eyebrow, lead,
 * plan and phone buttons, key facts, tags, a widget slot and the anchor bar under it.
 * `id="hero"`: the comparison tool (`porownaj.mjs`) maps the prototype's `.phero` to it.
 */
export function PageHero({ hero, name, anchors, phone, widget, parent = SERVICES }: Props) {
  const crumb = hero?.crumb || name
  const cta = {
    text: hero?.cta?.text || 'Zaplanuj instalację',
    href: hero?.cta?.href || '/zaplanuj',
  }
  return (
    <>
      <section id="hero" className="phero">
        <div className="hgrid" />
        <div className="hglow" />
        <div className="hglow2" />
        <svg className="phmt" viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden="true">
          <path className="phm1" d={RIDGE_1} />
          <path className="phm2" d={RIDGE_2} />
        </svg>
        <div className="wrap">
          <nav className="crumb in d1" aria-label="Okruszki">
            <Link href="/">Start</Link>
            <span aria-hidden="true">/</span>
            <Link href={parent.href}>{parent.label}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{crumb}</span>
          </nav>
          <div className="phw">
            <div className="pht2">
              <h1 className="h1 in d2">
                {hero?.eyebrow && (
                  <>
                    <span className="eye h1k">{hero.eyebrow}</span>
                    <span className="vh">: </span>
                  </>
                )}
                {hero?.h1a || name} {hero?.h1b && <span className="acc">{hero.h1b}</span>}
              </h1>
              {hero?.lead && <p className="lead in d3">{hero.lead}</p>}
              <div className="in d4 flex flex-wrap gap-2.5">
                <Link href={cta.href} className="btn btn-p">
                  {cta.text}
                </Link>
                {phone && (
                  <a href={phone.href} className="btn btn-g">
                    <InstIcon name="phone" />
                    {/* Not `.ph`: in the prototype it marks a placeholder (amber). */}
                    <span>{phone.label}</span>
                  </a>
                )}
              </div>
              {hero?.facts && hero.facts.length > 0 && (
                <div className="pkv in d5">
                  {hero.facts.map((fact) => (
                    <div key={fact.id ?? fact.value} className="kv">
                      <b>{fact.value}</b>
                      <span>{fact.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {hero?.tags && hero.tags.length > 0 && (
                <div className="tags in d6">
                  {hero.tags.map((tag) => (
                    <span key={tag} className="tag a">
                      <InstIcon name="check" size={13} strokeWidth={2.6} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {widget && <div className="phv in d3">{widget}</div>}
          </div>
        </div>
      </section>
      <AnchorsBar
        anchors={(anchors ?? []).map(({ anchorId, name: label }) => ({ id: anchorId, label }))}
      />
    </>
  )
}
