import type { ServiceKey } from '../dane/types'

/** A service as an object page shows it: chip text, address and colour (panel, else `SERVICE_SCENE`). */
export type ServiceChip = { key: ServiceKey; name: string; href: string | null; color: string }

/** A hotspot of the cross-section: title and service from code, description from the panel. */
export type ObjectHotspot = {
  title: string
  service: ServiceKey
  description: string | null
  color: string
  serviceName: string
  serviceHref: string | null
}

/** A moment of the day / year timeline (`InstObjects.day`). */
export type DayMoment = {
  time: string
  name: string
  description: string | null
  icon: string | null
  chips: ServiceChip[]
  /** Hotspots of these services, as indexes. */
  hotspots: number[]
}
