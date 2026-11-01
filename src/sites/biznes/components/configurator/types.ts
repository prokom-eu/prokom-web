import type { BundleCardData } from '@/lib/catalog/bundle'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { IconName } from '@/lib/catalog/options'
import type { Wizard, WizardLinkKind } from '@/lib/catalog/wizard'
import type { WizardBundle, WizardState } from '@/lib/catalog/wizardEngine'

/** A product the configurator can propose, as the browser gets it. */
export type ConfiguratorProduct = {
  slug: string
  name: string
  brand: string | null
  benefit: string | null
  features: string[]
  image: IndexImage | null
  icon: IconName
  href: string
}

export type ConfiguratorData = {
  rules: Wizard
  /** Listed products named in the rules — the engine proposes only these. */
  products: Record<string, ConfiguratorProduct>
  bundles: WizardBundle[]
  bundleCards: Record<string, BundleCardData>
  /** Scene slug → its title on the plan („Restauracja z kuchnią i dowozem”). */
  sceneTitles: Record<string, string>
  /** Resolved result links: `kind:target` → address (absent = not shown). */
  links: Record<string, string>
  initial: { state: WizardState; step: number }
  formToken: string
  phone: { label: string; href: string } | null
  callbackTime: string | null
}

export const linkKey = (kind: WizardLinkKind, target?: string) => `${kind}:${target ?? ''}`
