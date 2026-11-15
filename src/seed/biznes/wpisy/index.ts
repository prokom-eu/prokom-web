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
import {
  BACKUP_321,
  SEASON_CHECKLIST,
  SHREDDER_GDPR,
  SPLIT_PAYMENT_KSEF,
  TERMINAL_WITH_REGISTER,
  WINDOWS_10_END,
} from './partia3'
import {
  ESET_PROTECT,
  GOPOS_GASTRO,
  GOPOS_NFHOTEL,
  INSERT_ACCOUNTING,
  MICROSOFT_365,
  NFHOTEL_PENSION,
} from './partia4'
import type { BiznesGuidePost } from './types'

export type { BiznesGuidePost } from './types'

/**
 * Biznes guide posts written in the repo (audyt 15.11 P1-3), newest first: the first one gets the
 * latest date, so the home page features it. A KSeF post leads while the deadline is ahead; the
 * rest alternate KSeF, cash registers, terminals, programs and IT.
 */
export const BIZNES_GUIDE_POSTS: readonly BiznesGuidePost[] = [
  KSEF_RECEIPT_INVOICE,
  WINDOWS_10_END,
  GOPOS_GASTRO,
  KSEF_CERTIFICATES,
  REGISTER_FISCALIZATION,
  TERMINAL_WITH_REGISTER,
  SPLIT_PAYMENT_KSEF,
  MICROSOFT_365,
  CASH_REGISTER_REVIEW,
  BACKUP_321,
  NFHOTEL_PENSION,
  KSEF_IN_SUBIEKT,
  INSERT_ACCOUNTING,
  CASH_REGISTER_RELIEF,
  SEASON_CHECKLIST,
  REGISTER_REPORTS,
  KSEF_PERMISSIONS,
  SHREDDER_GDPR,
  ESET_PROTECT,
  WHO_NEEDS_REGISTER,
  REGISTER_OR_PRINTER,
  GOPOS_NFHOTEL,
  KSEF_FAILURE,
  REGISTER_CLOSING,
]

/**
 * Slugs of posts withdrawn on purpose (deleted in the panel or renamed there): the seed never
 * creates them again. Withdrawing a post = its slug here, not only a delete in the panel.
 */
export const RETIRED_GUIDE_SLUGS: readonly string[] = []
