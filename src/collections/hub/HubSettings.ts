import type { CollectionConfig } from 'payload'
import { json, type JSONFieldValidation } from 'payload/shared'

import { adminOnly } from '../../lib/auth/access'
import { validateBrands } from '../../lib/prokom/brands'
import { validateCooperation } from '../../lib/prokom/cooperation'
import { validateDeliveries } from '../../lib/prokom/deliveries'
import { validateHome } from '../../lib/prokom/home'
import { validateForBusiness } from '../../lib/prokom/forBusiness'
import { validateForHome } from '../../lib/prokom/forHome'
import { validateOffer } from '../../lib/prokom/offer'
import { HUB_OPTIONAL_PAGES } from '../../lib/prokom/pages'
import { onlyLineTenant } from '../../lib/tenant/onlyLine'
import { revalidateHub, revalidateHubAfterDelete } from './common'

/** Payload's own JSON check first (text in the editor that does not parse), then the schema. */
const withSchema =
  (check: (value: unknown) => true | string): JSONFieldValidation =>
  async (value, options) => {
    const parsed = await json(value, options)
    return parsed === true ? check(value) : parsed
  }

/**
 * Settings of pro-kom.eu (ADR-H002 §2), one document per tenant — like `BiznesSettings`: page
 * switches of v1.1, the company facts, and the texts of the home page, the brands, „Inwestycje i
 * dostawy” and „Współpraca” as JSON checked by a schema (the pattern of `SoftwareSettings.home`,
 * ADR-H002 „Rozstrzygnięcia H1” pkt 8). Other page groups (`about`, …) come with their pages (H3–H5). No drafts
 * (like `SiteSettings`): a fact without „Zatwierdzone” stays off the production site.
 */
export const HubSettings: CollectionConfig = {
  slug: 'hub-settings',
  labels: { singular: 'Ustawienia pro-kom.eu', plural: 'Ustawienia pro-kom.eu' },
  admin: { group: 'pro-kom.eu', useAsTitle: 'id' },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [
      onlyLineTenant('prokom', 'Ustawienia pro-kom.eu są tylko na stronie pro-kom.eu.'),
    ],
    afterChange: [revalidateHub],
    afterDelete: [revalidateHubAfterDelete],
  },
  fields: [
    {
      name: 'pages',
      label: 'Strony wersji 1.1',
      type: 'group',
      admin: {
        description:
          'Włącz stronę dopiero, gdy jest gotowa. Wyłączona = brak linków w menu, stopce i wyszukiwarce.',
      },
      fields: HUB_OPTIONAL_PAGES.map(({ key, path, label }) => ({
        name: key,
        label: `${label} (${path})`,
        type: 'checkbox' as const,
        defaultValue: false,
      })),
    },
    {
      name: 'home',
      label: 'Strona główna (JSON)',
      type: 'json',
      validate: withSchema(validateHome),
      admin: {
        description:
          'Teksty sekcji strony głównej. Bez telefonów, e-maili i adresu — w FAQ wpisz {telefon}, {adres}, {godziny}. Usługi, narzędzia, persony i sytuacje edytujesz w ich kolekcjach.',
      },
    },
    {
      name: 'brands',
      label: 'Marki i autoryzacje (JSON)',
      type: 'json',
      validate: withSchema(validateBrands),
      admin: {
        description:
          'Cztery autoryzacje (Posnet, Elzab — serwis; GoPOS, InsERT — partner) i grupy marek bez statusu.',
      },
    },
    {
      name: 'deliveries',
      label: 'Inwestycje i dostawy (JSON)',
      type: 'json',
      validate: withSchema(validateDeliveries),
      admin: {
        description:
          'Segmenty z formularzem, lista zapytania (klucze pozycji!), usługi, terminy, obiekty z przykładowymi ilościami, zakres, FAQ. Bez cen; konfiguracja, montaż i szkolenie tylko jako opcja.',
      },
    },
    {
      name: 'cooperation',
      label: 'Współpraca (JSON)',
      type: 'json',
      validate: withSchema(validateCooperation),
      admin: {
        description:
          'Role z formularzem, etapy, zakres, dostawcy, zasady, FAQ. Telefon roli bierze się z jej linii — nie wpisuj numerów.',
      },
    },
    {
      name: 'offer',
      label: 'Cała oferta /linie (JSON)',
      type: 'json',
      validate: withSchema(validateOffer),
      admin: {
        description:
          'Teksty strony /linie. Usługi z kolekcji „Usługi huba”, kroki i odbiorcy linii z tekstów strony głównej — tu tylko nagłówki, filtry i podpisy.',
      },
    },
    {
      name: 'forBusiness',
      label: 'Dla firm /dla-firm (JSON)',
      type: 'json',
      validate: withSchema(validateForBusiness),
      admin: {
        description:
          'Teksty strony /dla-firm. Plany branż w kolekcji Plany huba (typ branża), marki z pola Marki, telefony i obietnice z paneli linii. Konfiguracja, montaż i szkolenie tylko jako opcja.',
      },
    },
    {
      name: 'forHome',
      label: 'Dla domu /dla-domu (JSON)',
      type: 'json',
      validate: withSchema(validateForHome),
      admin: {
        description:
          'Teksty strony /dla-domu (strona v1.1 — widoczna po włączeniu „Dla domu” w stronach). Sytuacje w kolekcji Plany huba (typ sytuacja-dom), telefony, obietnice, adres i godziny z paneli.',
      },
    },
    {
      name: 'extraPhones',
      label: 'Dodatkowe numery (Kontakt)',
      type: 'array',
      admin: {
        description:
          'Numery stacjonarne pokazywane skromnie na /kontakt (np. biuro, serwis) — te same co w wizytówce Google. Główne numery huba są w Ustawieniach strony.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Opis', type: 'text', required: true, maxLength: 60 },
            { name: 'number', label: 'Numer', type: 'text', required: true, maxLength: 30 },
          ],
        },
        {
          name: 'techPoint',
          label: 'Punkt PRO-KOM Tech (miejscowość)',
          type: 'text',
          maxLength: 40,
          admin: {
            description:
              'Wpisz miejscowość, jeśli to numer punktu Tech (np. Rabka-Zdrój) — pokaże się przy Tech na hubie obok Zakopanego i infolinii. Puste = zwykły numer.',
          },
        },
      ],
    },
    {
      name: 'extraEmails',
      label: 'Dodatkowe adresy e-mail (Kontakt)',
      type: 'array',
      admin: {
        description:
          'Stare adresy używane latami (runda 18.11, D15) — pokazywane na /kontakt obok głównego adresu huba. Włącz „Pokazuj” dopiero, gdy skrzynka działa i ktoś ją odbiera. Główny adres jest w Ustawieniach strony — adres taki sam jak główny nie jest powtarzany.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Opis', type: 'text', required: true, maxLength: 40 },
            { name: 'email', label: 'Adres', type: 'email', required: true },
            { name: 'published', label: 'Pokazuj', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    {
      name: 'branch',
      label: 'Oddział (Zakopane)',
      type: 'group',
      admin: {
        description:
          'Punkt bez pełnego salonu firmy — pokazywany skromnie na /kontakt i /o-firmie. W Zakopanem działa tylko serwis PRO-KOM Tech (decyzja 15.11), dlatego nie jest salonem w Danych firmy.',
      },
      fields: [
        { name: 'published', label: 'Pokazuj', type: 'checkbox', defaultValue: false },
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', maxLength: 60 },
            { name: 'phone', label: 'Telefon', type: 'text', maxLength: 30 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'street', label: 'Ulica i numer', type: 'text', maxLength: 80 },
            { name: 'postalCode', label: 'Kod pocztowy', type: 'text', maxLength: 10 },
            { name: 'city', label: 'Miejscowość', type: 'text', maxLength: 60 },
          ],
        },
        { name: 'note', label: 'Co tam załatwisz', type: 'text', maxLength: 140 },
      ],
    },
    {
      name: 'trust',
      label: 'Fakty o firmie (liczby, autoryzacje)',
      type: 'array',
      admin: {
        description:
          'Na produkcji widać tylko zatwierdzone fakty (spec §3). Źródło jest wewnętrzne — nie pokazujemy go.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', label: 'Wartość', type: 'text', required: true, maxLength: 40 },
            { name: 'label', label: 'Opis', type: 'text', required: true, maxLength: 80 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'source', label: 'Źródło (wewnętrzne)', type: 'text' },
            { name: 'approved', label: 'Zatwierdzone', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
}
