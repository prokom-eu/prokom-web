import { describe, expect, it } from 'vitest'

import { COPY_WORDS } from '../../../lib/instalacje/copyWords'
import { LAW_WORDS } from '../../../lib/instalacje/lawWords'
import { HOME_SEO, instalacjeHomeBlock } from '../../../seed/instalacje/home'
import { alarmy } from './alarmy'
import { anteny } from './anteny'
import { architekci } from './architekci'
import { przekroj } from './przekroj'
import { dostep } from './dostep'
import { ekrany } from './ekrany'
import { glowna } from './glowna'
import { glownaSekcje, FOR_WHO_CARDS, SERVICE_CARDS } from './glownaSekcje'
import { ladowarki } from './ladowarki'
import { monitoring } from './monitoring'
import { naglosnienie } from './naglosnienie'
import { navigation } from './nawigacja'
import { nieZnaleziono } from './nieZnaleziono'
import { oferta } from './oferta'
import { sieci } from './sieci'
import { smartHome } from './smartHome'
import { teletechnika } from './teletechnika'
import { INSTALACJE_SHARED } from '../../../seed/shared/instalacje'
import { serwis } from './serwis'
import { wyslane } from './wyslane'
import { zaplanuj } from './zaplanuj'

/** Every string inside a value. */
function texts(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => texts(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => texts(v, out))
  return out
}

/**
 * Runda v6 §2 (INST-6): the texts rewritten so far — PR2: the home page, the menus, the CTA band,
 * the footer and the 404; PR3: the services and the offer. The next PRs add their modules here.
 */
const REWRITTEN = {
  'home hero': instalacjeHomeBlock(),
  'home SEO': HOME_SEO,
  'home widget': glowna,
  'home sections': [glownaSekcje, FOR_WHO_CARDS, SERVICE_CARDS],
  'architects teaser': architekci.teaser,
  navigation,
  '404': nieZnaleziono,
  // PR3: the service pages and the offer.
  monitoring,
  alarmy,
  dostep,
  sieci,
  teletechnika,
  anteny,
  smartHome,
  ladowarki,
  naglosnienie,
  ekrany,
  oferta,
  // PR4: the line's pages in the shared templates and its own forms.
  serwis,
  zaplanuj,
  wyslane,
  'contact (shared)': INSTALACJE_SHARED.contact,
  'about (shared)': INSTALACJE_SHARED.about,
}

describe('texts after INST-6 (runda v6 §2.2)', () => {
  it.each(Object.entries(REWRITTEN))('%s: no forbidden phrasings', (_, value) => {
    expect(texts(value).filter((t) => COPY_WORDS.test(t))).toEqual([])
  })

  it.each(Object.entries(REWRITTEN))('%s: no law, no exclamation marks', (_, value) => {
    // An exclamation mark after a word; the „!” symbol of a timeline legend is not a sentence.
    expect(texts(value).filter((t) => LAW_WORDS.test(t) || /\p{L}!/u.test(t))).toEqual([])
  })

  it('section headings: one sentence without a trailing full stop, about 60 characters', () => {
    const headings = [
      glownaSekcje.forWho.heading,
      glownaSekcje.services.heading,
      glownaSekcje.realizations.heading,
      glownaSekcje.mountains.heading,
      glownaSekcje.process.heading,
      glownaSekcje.service.heading,
      glownaSekcje.faq.heading,
      glownaSekcje.plan.heading,
      architekci.teaser.heading,
      navigation.ctaBand.title,
      nieZnaleziono.heading,
      // PR4
      serwis.plans.heading,
      serwis.takeover.heading,
      serwis.remote.heading,
      serwis.faqHeading,
      serwis.relatedHeading,
      wyslane.title,
      INSTALACJE_SHARED.contact?.h1 ?? '',
      INSTALACJE_SHARED.contact?.formTitle ?? '',
      INSTALACJE_SHARED.contact?.mapTitle ?? '',
      INSTALACJE_SHARED.about?.h1 ?? '',
    ]
    for (const heading of headings) {
      expect(heading, heading).not.toMatch(/\.$/)
      expect(heading.length, heading).toBeLessThanOrEqual(62)
    }
  })

  it('eyebrows have 1–3 words', () => {
    for (const eyebrow of [
      glownaSekcje.forWho.eyebrow,
      glownaSekcje.services.eyebrow,
      glownaSekcje.mountains.eyebrow,
      glownaSekcje.process.eyebrow,
      glownaSekcje.service.eyebrow,
      glownaSekcje.faq.eyebrow,
      glownaSekcje.plan.eyebrow,
      architekci.teaser.eyebrow,
      navigation.ctaBand.eyebrow,
      serwis.plans.eyebrow,
      serwis.takeover.eyebrow,
      serwis.remote.eyebrow,
    ])
      expect(eyebrow.split(/\s+/).length, eyebrow).toBeLessThanOrEqual(3)
  })

  it('the home SEO: title up to 60, description 140–155 characters', () => {
    expect(HOME_SEO.title.length).toBeLessThanOrEqual(60)
    expect(HOME_SEO.description.length).toBeGreaterThanOrEqual(140)
    expect(HOME_SEO.description.length).toBeLessThanOrEqual(155)
  })
})

// PR4: the page `/dla-architektow` (its hero is in `seed/instalacje/formPages.ts`).
describe('texts after INST-6: /dla-architektow', () => {
  const A = architekci
  const sections = [
    A.audienceSection,
    A.problemsSection,
    A.stagesSection,
    A.exchangeSection,
    A.installationsSection,
    A.checklistSection,
    A.numbersSection,
    A.developersSection,
    A.newsSection,
    A.experienceSection,
    A.librarySection,
    A.presentationsSection,
    A.rulesSection,
    A.faqSection,
    A.formSection,
  ]

  it('no forbidden phrasings, no law, no exclamation marks', () => {
    const all = [...texts(A), ...texts(przekroj)]
    expect(all.filter((t) => COPY_WORDS.test(t) || LAW_WORDS.test(t) || /\p{L}!/u.test(t))).toEqual(
      [],
    )
  })

  it('section headings: one sentence without a trailing full stop, about 60 characters', () => {
    for (const s of sections) {
      const heading = [s.heading, 'accent' in s ? s.accent : ''].filter(Boolean).join(' ')
      expect(heading, heading).not.toMatch(/\.$/)
      expect(heading.length, heading).toBeLessThanOrEqual(62)
    }
    for (const d of Object.values(A.installations.details)) expect(d.heading).not.toMatch(/\.$/)
  })

  it('eyebrows have 1–3 words', () => {
    for (const { eyebrow } of sections)
      expect(eyebrow.split(/\s+/).length, eyebrow).toBeLessThanOrEqual(3)
  })
})
