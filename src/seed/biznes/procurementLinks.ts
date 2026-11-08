import type { SiteSetting } from '../../payload-types'

type Group = NonNullable<NonNullable<SiteSetting['biznes']>['procurement']>

/**
 * „Zaopatrzenie — linki” (plan 0611 §6.4, ZAOPATRZENIE §10): texts of the hook-ins of the two
 * procurement pages, written to `SiteSettings.biznes.procurement` where a field is empty.
 * „Stacje dokujące” is a subcategory of `komputery` today — listed for a category of its own.
 */
export const PROCUREMENT_LINKS = {
  categoryBand: 'Kupujesz 5 sztuk lub więcej? Dostawy IT — gotowe do pracy w dniu dostawy.',
  categoryBandCta: 'Zobacz dostawy IT',
  itCategories: ['laptopy', 'komputery', 'monitory', 'stacje-dokujace'],
  productLink: 'Potrzebujesz kilku sztuk? Policz stanowiska',
  industryTiles: [
    {
      industry: 'noclegi',
      page: 'agd',
      title: 'Telewizory i lodówki do pokoi',
      text: 'Cały obiekt w jednym zapytaniu, dostawa na termin — także etapami.',
    },
    {
      industry: 'gastronomia',
      page: 'agd',
      title: 'AGD na zaplecze kuchni',
      text: 'Jedno zapytanie, jedna faktura na firmę.',
    },
    {
      industry: 'biura-uslugi',
      page: 'agd',
      title: 'Kuchnia socjalna dla zespołu',
      text: 'Jedno zapytanie, jedna faktura na firmę.',
    },
    {
      industry: 'biura-uslugi',
      page: 'it',
      title: 'Komputery dla całego biura',
      text: 'Laptopy i monitory gotowe do pracy w dniu dostawy.',
    },
    {
      industry: 'szkoly-instytucje',
      page: 'it',
      title: 'Komputery do pracowni',
      text: 'Od kilku do kilkudziesięciu stanowisk, gotowe do pracy w dniu dostawy.',
    },
  ],
  scaleTitle: 'Przy tej skali zrobimy dostawę',
  scaleText: 'Policz stanowiska i zobacz podgląd oferty — jedna faktura na firmę.',
  searchAgd: ['agd', 'lodówka', 'telewizor', 'pralka', 'hurtowo', 'dla dewelopera'],
  searchIt: ['dostawa laptopów', 'hurtowo'],
} satisfies Group

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0)

/** The group with its empty fields filled; `null` when nothing is empty (no write). */
export function procurementLinksUpdate(current: Group | null | undefined): Group | null {
  let changed = false
  const next: Group = { ...current }
  for (const key of Object.keys(PROCUREMENT_LINKS) as (keyof typeof PROCUREMENT_LINKS)[]) {
    if (!isEmpty(current?.[key])) continue
    changed = true
    Object.assign(next, { [key]: PROCUREMENT_LINKS[key] })
  }
  return changed ? next : null
}
