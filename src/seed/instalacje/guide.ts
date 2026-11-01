import type { Payload } from 'payload'

import type { Post } from '../../payload-types'
import { h2, p, richText } from '../biznes/lexical'
import { SEED_CONTEXT } from '../config'

export const RODO_POST_SLUG = 'monitoring-a-rodo'

/**
 * The guide post „Monitoring w pensjonacie a RODO” (`PoradnikRodo.body.html`, I12), texts 1:1 from
 * the prototype; the summary, „Co robi instalator, a co właściciel” and the self-check are
 * widgets of the page (`dane/poradnik.ts`). No source list on the page (spec §2): the prototype's
 * `src` list is not published. The SEO title is shortened to the limit (the title + „| PRO-KOM
 * Instalacje” ≤ 65), the description without „Przepisy ze źródłami.”
 */
export function rodoPost(): Pick<
  Post,
  'title' | 'slug' | 'category' | 'publishedAt' | 'lead' | 'content' | 'seo'
> {
  return {
    title: 'Monitoring w pensjonacie a RODO: gdzie kamera może patrzeć, a gdzie nie',
    slug: RODO_POST_SLUG,
    category: 'przepisy',
    publishedAt: '2026-10-01T00:00:00.000Z',
    lead: 'Parking i narciarnia tak, pokoje i sauna nie. Jak długo przechowywać nagrania, co napisać na tabliczce i dlaczego kamera, która widzi drogę, to już nie „domowa sprawa”.',
    content: richText<Post['content']>([
      h2('Czy w pensjonacie można mieć monitoring?'),
      p(
        'Tak. Kamera nagrywa wizerunek gości i pracowników, więc właściciel obiektu staje się administratorem danych w rozumieniu RODO. Musi mieć cel monitoringu, najczęściej bezpieczeństwo osób i ochronę mienia, i dopasować do niego miejsca montażu, czas przechowywania nagrań oraz informację dla osób w kadrze.',
      ),
      h2('Gdzie kamera może patrzeć, a gdzie nie'),
      p(
        'Rozsądne miejsca to parking, podjazd, wejście do budynku, recepcja, narciarnia, wózkownia, zaplecze i magazyn. Kamera nie powinna obejmować pokoi gości, łazienek, sauny i strefy SPA ani działek i okien sąsiadów.',
      ),
      p(
        'Jeśli zatrudniasz pracowników, Kodeks pracy wprost wyłącza z monitoringu m.in. toalety, szatnie, stołówki i palarnie, z wąskimi wyjątkami.',
      ),
      h2('Jak długo przechowywać nagrania'),
      p(
        'Przy monitoringu pracowników Kodeks pracy pozwala przechowywać nagrania najwyżej 3 miesiące od nagrania, chyba że są dowodem w postępowaniu. Wytyczne europejskich organów ochrony danych idą dalej: w większości przypadków nagrania powinny znikać automatycznie po kilku dniach, a im dłużej ponad 72 godziny, tym mocniejsze musi być uzasadnienie.',
      ),
      p(
        'W praktyce ustawiamy w rejestratorze nadpisywanie po tylu dniach, ile wynika z celu. Dłuższe przechowywanie nie oznacza lepszej ochrony, tylko więcej obowiązków.',
      ),
      h2('Tabliczka i informacja dla gości'),
      p(
        'Sam piktogram kamery nie wystarczy. Sprawdza się układ warstwowy: tabliczka przy wejściu w strefę monitorowaną z nazwą administratora, celem, czasem przechowywania i wskazaniem, gdzie jest pełna informacja, a pełna klauzula w recepcji albo na stronie obiektu.',
      ),
      h2('Kamera, która widzi drogę albo sąsiada'),
      p(
        'Trybunał Sprawiedliwości UE orzekł, że kamera przy domu, która obejmuje choćby część przestrzeni publicznej, nie jest już „czysto osobistym” użyciem i podlega RODO. Media opisywały też karę UODO z lipca 2026 r. nałożoną na osobę prywatną za kamery nagrywające drogę i posesje sąsiadów. W tej sprawie kamera nagrywała też dźwięk. Dlatego ustawiamy kadr na Twoją posesję, a resztę zaczerniamy maską prywatności.',
      ),
      h2('Nie nagrywaj dźwięku'),
      p(
        'Kodeks pracy mówi o monitoringu w postaci środków technicznych umożliwiających rejestrację obrazu. Nagrywanie rozmów to znacznie mocniejsza ingerencja w prywatność gości i pracowników. Dlatego przy montażu wyłączamy mikrofony w kamerach, chyba że jest wyraźny i uzasadniony powód.',
      ),
      h2('Monitoring a pracownicy pensjonatu'),
      p(
        'Pracowników trzeba poinformować o monitoringu najpóźniej 2 tygodnie przed jego uruchomieniem, a teren oznaczyć najpóźniej dzień wcześniej. Cel, zakres i sposób monitoringu określa układ zbiorowy pracy, regulamin pracy albo obwieszczenie.',
      ),
    ]),
    seo: {
      title: 'Monitoring w pensjonacie a RODO',
      description:
        'Monitoring a RODO w pensjonacie, sklepie i firmie: tabliczki, czas przechowywania nagrań, kamery a prywatność gości i pracowników.',
    },
  }
}

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void

/** Creates and publishes the guide posts of the line while missing; then they belong to the panel. */
export async function seedInstalacjeGuide(payload: Payload, tenantId: number, count: Count) {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  for (const post of [rodoPost()]) {
    const { totalDocs } = await payload.count({
      collection: 'posts',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: post.slug } }] },
      overrideAccess: true,
    })
    if (totalDocs > 0) {
      count('posts', 'skipped')
      continue
    }
    await payload.create({
      collection: 'posts',
      data: { ...post, tenant: tenantId, _status: 'published' },
      ...local,
    })
    count('posts', 'created')
  }
}
