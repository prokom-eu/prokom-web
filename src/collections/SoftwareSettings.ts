import type { CollectionConfig, JSONFieldValidation, PayloadRequest } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { homeSchema, homeSolutionSlugs, validateHome } from '../lib/software/home'
import { validateNotFound, validateThanks } from '../lib/software/pages'
import {
  softwareWizardSchema,
  validateSoftwareWizard,
  wizardSolutionSlugs,
} from '../lib/software/wizard'
import { tenantIdOf } from '../lib/tenant/id'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { searchGroup } from './searchGroup'

/** Slugs of `slugs` with no solution in the tenant (any status: drafts get published later). */
async function missingSolutions(
  req: PayloadRequest,
  tenantId: number,
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return []
  const { docs } = await req.payload.find({
    collection: 'solutions',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { in: slugs } }] },
    limit: slugs.length,
    depth: 0,
    draft: true,
    select: { slug: true },
    overrideAccess: true,
    req,
  })
  const found = new Set(docs.map((doc) => doc.slug))
  return slugs.filter((slug) => !found.has(slug))
}

/**
 * `validate` of a JSON field: the schema first, then every solution slug it points to must exist
 * in the edited document's tenant (ADR-014 §1.3 — a result without its solution has no price).
 */
function withSolutions<T>(
  validateShape: (value: unknown) => true | string,
  parse: (value: unknown) => T,
  slugsOf: (value: T) => string[],
  name: string,
): JSONFieldValidation {
  return async (value, { data, req }) => {
    const shape = validateShape(value)
    if (shape !== true || value === null || value === undefined) return shape
    const tenantId = tenantIdOf((data as { tenant?: unknown }).tenant)
    if (tenantId === null) return true // the plugin's tenant field reports the missing tenant
    const missing = await missingSolutions(req, tenantId, slugsOf(parse(value)))
    return missing.length === 0
      ? true
      : `${name}: nie ma rozwiązań o adresach ${missing.map((slug) => `„${slug}”`).join(', ')}.`
  }
}

/**
 * Search, wizard and fixed texts of the Software site — one document per tenant (plugin
 * `isGlobal`), like `BiznesSettings` (ADR-014 §1, rozstrz. SW0 7, v20 6–7, 11). Rules and texts
 * are JSON checked by schemas (`lib/software/*`): Krystian changes them, not the boss.
 */
export const SoftwareSettings: CollectionConfig = {
  slug: 'software-settings',
  labels: { singular: 'Ustawienia Software', plural: 'Ustawienia Software' },
  admin: { group: 'Software' },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [
      onlyLineTenant('software', 'Ustawienia Software mają tylko strony linii Software.'),
    ],
  },
  fields: [
    searchGroup,
    {
      name: 'wizard',
      label: 'Reguły kreatora (JSON)',
      type: 'json',
      validate: withSolutions(
        validateSoftwareWizard,
        (value) => softwareWizardSchema.parse(value),
        wizardSolutionSlugs,
        'Reguły kreatora',
      ),
      admin: {
        description:
          'Potrzeby, pytania, wyniki i teksty kreatora (/dobierz). Ceny wyników biorą się z Rozwiązań (resultToSolutionSlug). Zapis sprawdza kształt i adresy rozwiązań.',
      },
    },
    {
      name: 'home',
      label: 'Teksty sekcji strony głównej (JSON)',
      type: 'json',
      validate: withSolutions(
        validateHome,
        (value) => homeSchema.parse(value),
        homeSolutionSlugs,
        'Teksty strony głównej',
      ),
      admin: {
        description:
          'Proces, zasady, porównania, podglądy, realizacje, „Dlaczego nie WordPress”, technologie i „12 rzeczy”. Kolejność sekcji = kolejność bloków na stronie.',
      },
    },
    {
      name: 'thanks',
      label: 'Strona „Dziękujemy” (JSON)',
      type: 'json',
      validate: validateThanks,
      admin: { description: 'Teksty /dziekujemy — strona po wysłaniu formularza.' },
    },
    {
      name: 'notFound',
      label: 'Strona 404 (JSON)',
      type: 'json',
      validate: validateNotFound,
      admin: {
        description:
          'Teksty strony „nie znaleziono”. Ceny w podpisach kafli wpisuje się ręcznie — pilnuj ich przy zmianie cennika.',
      },
    },
  ],
}
