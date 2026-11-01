import type { Payload } from 'payload'

import file from '../../../seed/prokombiznes/k4/strony-k4.json'
import { ABOUT_SLUG, biznesAboutLayout } from './about'
import { biznesContactLayout, CONTACT_SLUG } from './contact'
import { biznesGoposLayout, GOPOS_SLUG } from './gopos'
import { biznesInsertLayout, INSERT_SLUG } from './insert'
import {
  aboutK4Layout,
  contactK4Layout,
  goposK4Layout,
  insertK4Layout,
  ksefK4Layout,
  opiekaK4Layout,
  ulgaK4Layout,
  vendingK4Layout,
  type K4FirmaFile,
  type K4PagesFile,
  type K4VendingFile,
  type SlugOf,
} from './k4Pages'
import { biznesOpiekaItLayout, OPIEKA_IT_SLUG } from './opiekaIt'
import { upsertK4Page } from './page'

type Report = (name: string, changed: boolean) => void
type Note = (what: string, item: string) => void

const pages = file as unknown as K4PagesFile
const firma = file as unknown as K4FirmaFile
const vending = file as unknown as K4VendingFile

/**
 * K4 subpages (K4hij) from `strony-k4.json`. A page still on the B9 seed layout gets the K4
 * one; a page edited in the panel stays and goes to the report, like board ids the database
 * does not know.
 */
export async function seedBiznesK4Pages(
  payload: Payload,
  tenantId: number,
  slugOf: SlugOf,
  report: Report,
  note: Note,
): Promise<void> {
  const k4 = [
    {
      slug: GOPOS_SLUG,
      title: 'GoPOS',
      description:
        'GoPOS dla gastronomii z PRO-KOM: sprzęt, menu, fiskalizacja, szkolenie w lokalu i serwis w sezonie z Rabki. Sala, kuchnia i dowozy w jednym systemie.',
      built: goposK4Layout(pages, slugOf),
      legacy: [biznesGoposLayout()],
    },
    {
      slug: INSERT_SLUG,
      title: 'InsERT',
      description:
        'Subiekt i programy InsERT z PRO-KOM: dobór programu, instalacja, przeniesienie danych, połączenie z kasą, KSeF i szkolenie na Twoich dokumentach.',
      built: insertK4Layout(pages, slugOf),
      legacy: [biznesInsertLayout()],
    },
    {
      slug: OPIEKA_IT_SLUG,
      title: 'Opieka IT',
      // No „abonament” at Opieka IT (K4-FINAL §1) — the B9 description had it.
      description:
        'Opieka IT dla firm: komputery, serwer, sieć, kopie, poczta, kasy i POS pod jedną opieką, z czasem reakcji w umowie. Bezpłatny przegląd IT.',
      built: opiekaK4Layout(firma, slugOf),
      legacy: [biznesOpiekaItLayout()],
      legacyDescriptions: [
        'Opieka IT w abonamencie: komputery, serwer, sieć, kopie, poczta, kasy i POS pod jedną opieką, z czasem reakcji w umowie. Bezpłatny przegląd IT.',
      ],
    },
    {
      slug: ABOUT_SLUG,
      title: 'O firmie',
      description:
        'PRO-KOM Tadeusz Wójciak z Rabki-Zdroju: od 2004 kasy, POS, programy i opieka IT dla firm z Podhala. Zasady, linie PRO-KOM, marki i dojazd.',
      built: aboutK4Layout(firma),
      legacy: [biznesAboutLayout()],
    },
    {
      slug: CONTACT_SLUG,
      title: 'Kontakt',
      description:
        'Kontakt z PRO-KOM w Rabce-Zdroju: telefon, WhatsApp, e-mail i formularz. Oddzwaniamy w ciągu 60 minut w godzinach pracy. Dojazd na całe Podhale.',
      built: contactK4Layout(firma),
      legacy: [biznesContactLayout()],
    },
    // K4j: new pages (D-K4-7), no older seed.
    {
      slug: 'automaty-vendingowe',
      title: 'Automaty vendingowe',
      description:
        'Automaty vendingowe Optivendi z PRO-KOM: dobór maszyny do produktu i miejsca, płatności kartą i BLIK, zarządzanie z telefonu. Oferta na piśmie.',
      built: vendingK4Layout(vending, slugOf),
      legacy: [],
    },
    {
      slug: 'ksef',
      title: 'KSeF 2027 — co musi zrobić firma',
      description:
        'KSeF bez wyjątków od 1 stycznia 2027: kogo dotyczy, 6 kroków do gotowości, kary z art. 106ni. Program, uprawnienia i certyfikat z PRO-KOM z Rabki.',
      built: ksefK4Layout(slugOf),
      legacy: [],
    },
    {
      slug: 'ulga-na-kase-fiskalna',
      title: 'Ulga na kasę fiskalną',
      description:
        'Ulga na kasę fiskalną: 90% ceny netto, do 700 zł na kasę online zgłoszoną na start. Kto może skorzystać, kiedy trzeba oddać ulgę. Rozlicza księgowa.',
      built: ulgaK4Layout(slugOf),
      legacy: [],
    },
  ]
  for (const { slug, title, description, built, legacy, ...rest } of k4) {
    for (const id of built.missing) note('strona K4: produkt spoza bazy', `${slug}: ${id}`)
    const done = await upsertK4Page(
      payload,
      tenantId,
      {
        slug,
        title,
        description,
        layout: built.layout,
        legacy,
        legacyDescriptions: 'legacyDescriptions' in rest ? rest.legacyDescriptions : [],
      },
      report,
    )
    if (!done) note('strona K4 edytowana w panelu — bez zmian', slug)
  }
}
