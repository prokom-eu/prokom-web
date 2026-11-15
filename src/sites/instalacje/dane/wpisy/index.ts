import type { ServiceKey } from '../types'
import { alarmWDomkuLetniskowym } from './alarm-w-domku-letniskowym'
import { antenaSatelitarnaCzyDvbT2 } from './antena-satelitarna-czy-dvb-t2'
import { ileKamerDoDomu } from './ile-kamer-do-domu'
import { kameraWifiCzyPrzewodowa } from './kamera-wifi-czy-przewodowa'
import { kameryWPensjonacie } from './kamery-w-pensjonacie'
import { ladowarkaDoAutaWDomu } from './ladowarka-do-auta-w-domu'
import { monitoringZimaWGorach } from './monitoring-zima-w-gorach'
import { smartHomeWNowymDomu } from './smart-home-w-nowym-domu'
import type { GuideCategory, GuidePostData } from './types'
import { wifiWPensjonacie } from './wifi-w-pensjonacie'

export type { GuideCategory, GuidePostData } from './types'

/** Runda v6 §3.1: the guide posts written in the repo, in the order of the plan. */
export const GUIDE_POSTS: readonly GuidePostData[] = [
  ileKamerDoDomu,
  kameraWifiCzyPrzewodowa,
  alarmWDomkuLetniskowym,
  wifiWPensjonacie,
  smartHomeWNowymDomu,
  ladowarkaDoAutaWDomu,
  monitoringZimaWGorach,
  antenaSatelitarnaCzyDvbT2,
  kameryWPensjonacie,
]

/** D1: the former address of the camera post; it redirects permanently to the new one. */
export const FORMER_SLUGS: Readonly<Record<string, string>> = {
  'monitoring-a-rodo': kameryWPensjonacie.slug,
}

export const guidePost = (slug: string): GuidePostData | undefined =>
  GUIDE_POSTS.find((post) => post.slug === slug)

const words = (text: string) => text.split(/\s+/).filter(Boolean).length

/** Words of a post: the lead, the sections, the FAQ and the checklist or table. */
export function guideWords(post: GuidePostData): number {
  const { extras } = post
  const texts = [
    post.lead,
    ...post.sections.flatMap((s) => [s.heading, ...s.blocks.flat()]),
    ...extras.faq.flatMap((f) => [f.question, f.answer]),
    ...(extras.checklist?.items ?? []),
    ...(extras.table?.rows.flat() ?? []),
  ]
  return texts.reduce((n, t) => n + words(t), 0)
}

/** Reading time in minutes (about 200 words a minute). */
export const guideMinutes = (post: GuidePostData): number =>
  Math.max(1, Math.round(guideWords(post) / 200))

/** The guide category of each service page for the „Z Poradnika” block. */
const SERVICE_CATEGORY: Partial<Record<ServiceKey, GuideCategory>> = {
  kam: 'monitoring',
  alarm: 'alarmy',
  kd: 'alarmy',
  wifi: 'sieci',
  tel: 'sieci',
  ant: 'anteny',
  smart: 'smart-home',
  ev: 'ladowarki',
}

/**
 * Runda v6 §3.3: up to 3 posts for a service page — of its category first, then the posts that
 * link to the page in their text (internal linking both ways).
 */
export function guidePostsForService(key: ServiceKey, path: string, limit = 3): GuidePostData[] {
  const category = SERVICE_CATEGORY[key]
  const linksHere = (post: GuidePostData) =>
    post.sections.some((s) =>
      s.blocks
        .flat()
        .some((b) => [...b.matchAll(/\]\(([^)]+)\)/g)].some((m) => m[1]?.split('#')[0] === path)),
    ) || post.extras.readAlso.some((r) => r.href.split('#')[0] === path)
  const own = GUIDE_POSTS.filter((p) => p.category === category)
  const linked = GUIDE_POSTS.filter((p) => p.category !== category && linksHere(p))
  return [...own, ...linked].slice(0, limit)
}
