import { openingStatus, type OpeningHours } from '@/lib/site/hours'

import { HoursStatus } from '../HoursStatus'

/**
 * Live opening status of the first branch for the home page sections (facts card, FAQ,
 * contact panel): computed now on the server, refreshed every minute in the browser.
 */
export function LiveHours({ hours, className }: { hours: OpeningHours; className?: string }) {
  const status = hours.length > 0 ? openingStatus(hours, new Date()) : null
  if (!status) return null
  return <HoursStatus hours={hours} initial={status} className={className} />
}
