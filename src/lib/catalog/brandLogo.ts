import type { Partner } from '@/payload-types'

import { imageSources, pickSource } from '../media/sizes'
import type { IndexLogo } from './catalogIndex'

/** Brand logos are ~20 px high on cards and filters: the small `logo` size is enough. */
const LOGO_WIDTH = 240

/**
 * Small logo of a brand (cards, filters, the product box); none without a file. Its own module:
 * client code needs it without `catalogIndex`, which pulls in zod through the wizard schema
 * (ADR-023).
 */
export function brandLogo(brand: Partner): IndexLogo | undefined {
  const sources = imageSources(brand)
  if (!brand.width || !brand.height || sources.length === 0) return undefined
  return { url: pickSource(sources, LOGO_WIDTH), width: brand.width, height: brand.height }
}
