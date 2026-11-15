import { CASH_REGISTER_RELIEF, CASH_REGISTER_REVIEW, WHO_NEEDS_REGISTER } from './kasy'
import { KSEF_FAILURE, KSEF_PERMISSIONS, KSEF_RECEIPT_INVOICE } from './ksef'
import {
  KSEF_CERTIFICATES,
  KSEF_IN_SUBIEKT,
  REGISTER_CLOSING,
  REGISTER_FISCALIZATION,
  REGISTER_OR_PRINTER,
  REGISTER_REPORTS,
} from './partia2'
import type { BiznesGuidePost } from './types'

export type { BiznesGuidePost } from './types'

/**
 * Biznes guide posts written in the repo (audyt 15.11 P1-3), newest first: the first one gets the
 * latest date, so the home page features it. A KSeF post leads while the deadline is ahead; the
 * rest alternate KSeF, cash registers and programs.
 */
export const BIZNES_GUIDE_POSTS: readonly BiznesGuidePost[] = [
  KSEF_RECEIPT_INVOICE,
  KSEF_CERTIFICATES,
  REGISTER_FISCALIZATION,
  CASH_REGISTER_REVIEW,
  KSEF_IN_SUBIEKT,
  CASH_REGISTER_RELIEF,
  REGISTER_REPORTS,
  KSEF_PERMISSIONS,
  WHO_NEEDS_REGISTER,
  REGISTER_OR_PRINTER,
  KSEF_FAILURE,
  REGISTER_CLOSING,
]

/**
 * Slugs of posts withdrawn on purpose (deleted in the panel or renamed there): the seed never
 * creates them again. Withdrawing a post = its slug here, not only a delete in the panel.
 */
export const RETIRED_GUIDE_SLUGS: readonly string[] = []
