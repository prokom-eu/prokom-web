import type { Payload } from 'payload'

import type { Industry } from '../../payload-types'
import { isBlank, missingFields } from './fill'

type Report = (name: string, changed: boolean) => void

type Refs = {
  image: (file: string) => number | undefined
  product: (shortId: string) => number | undefined
}

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** `{ [field]: id }` only for a file the seed imported: a missing one is not written as `null`. */
const image = (refs: Refs, field: string, file: string) => {
  const id = refs.image(file)
  return id === undefined ? {} : { [field]: id }
}

type Content = Pick<
  Industry,
  'hero' | 'productsSection' | 'day' | 'flow' | 'faqIntro' | 'faq' | 'contact' | 'seo'
>

type SeedIndustry = {
  slug: string
  /** Short ids of the package (`katalog.json`), in the order of the grid. */
  featured: string[]
  heroImage: string
  content: (refs: Refs) => Content
}

/**
 * Pages of the 3 active industries (B10b, spec. §6.7). Gastronomia: texts of the board `Branza`;
 * handel and noclegi: drafts written after it (decision 24.10). Facts and figures only with a
 * source (plan B §4):
 * TODO(krystian): [SZEF]
 * - teksty handlu i noclegów (szkic) — do akceptacji albo poprawy w panelu;
 * - gastronomia: plakietki „GoPOS: 6000+ lokali”, „Resort Bania: +35% szybsza obsługa” (hero)
 *   i „6000+ lokali w Polsce”, „4,5★ w Google · 300+ opinii” („Jak to działa”) — bez źródła;
 * - FAQ gastronomii: „Pierwsze 14 dni GoPOS jest bezpłatne” i „od 2027 r. nie wolno już
 *   wystawiać ich z kasy” (KSeF, ZMIANY-v20 §5) — pominięte; numer telefonu z planszy w odpowiedzi
 *   o awarii zastąpiony „Dzwonisz do nas”; obietnica „zdalnie w kilka minut” (krok 17:00) jak „60 min”;
 * - handel: „Zmiana serwisu to formalność… Ty podpisujesz jeden dokument” — do potwierdzenia;
 * - tytuły SEO handlu i noclegów (szkic; gastronomia — tytuł planszy).
 */
export const INDUSTRIES: SeedIndustry[] = [
  {
    slug: 'gastronomia',
    featured: ['gopos', 'd3', 'v3mix', 'kds', 'kiosk', 'hx', 'pol', 'druks', 'u7'],
    heroImage: 'p-gopos-zestaw.webp',
    content: (refs) => ({
      hero: {
        title: 'Restauracja, która nie gubi zamówień. Nawet w sezonie.',
        lead: 'GoPOS na sprzęcie Sunmi, drukarka fiskalna Posnet, terminal PolCard, ekran kuchenny i Wi-Fi dla gości — wdrożone z Twoim menu, z zespołem przeszkolonym na miejscu i serwisem, który dojeżdża z Rabki, a nie z Warszawy.',
        chips: ['Dowozy Wolt, Glovo, Pyszne', 'KSeF z systemu'],
        ctaLabel: 'Przygotuj zapytanie dla lokalu',
      },
      productsSection: {
        eyebrow: 'Zestaw dla gastronomii',
        title: 'Od lady po kuchnię. Wszystko ze sobą rozmawia.',
        lead: 'Każdy element ma własną stronę ze specyfikacją. Zestaw składamy pod lokal — kawiarnia nie potrzebuje tego, co restauracja na 120 miejsc.',
      },
      day: {
        eyebrow: 'Dzień w lokalu z GoPOS',
        heading: 'Od otwarcia do raportu dobowego.',
        steps: [
          {
            label: '11:00',
            title: 'Otwarcie',
            text: 'Kelnerzy logują się PIN-em na V3 MIX. Menu dnia włączasz z telefonu. Kiosk przy wejściu przyjmuje pierwsze zamówienia na wynos.',
          },
          {
            label: '13:30',
            title: 'Szczyt',
            text: 'Zamówienie z sali trafia na ekran kuchenny, bony drukują się na barze. Dowozy z Wolt i Glovo wpadają do tej samej kolejki. Płatność kartą przy stoliku.',
          },
          {
            label: '17:00',
            title: 'Awaria?',
            text: 'Internet padł — GoPOS pracuje offline, Posnet drukuje, terminal łączy się przez LTE. Dzwonisz do nas: zdalnie w kilka minut, serwisant z Rabki też.',
          },
          {
            label: '23:00',
            title: 'Zamknięcie',
            text: 'Raport dobowy, rozliczenie kelnerów, food cost i sprzedaż w telefonie właściciela. Faktury dla firm idą do KSeF z systemu.',
          },
        ],
      },
      flow: {
        eyebrow: 'Gastronomia · wdrażamy GoPOS',
        heading: 'Restauracja, która nie gubi zamówień. Nawet w sezonie.',
        lead: 'GoPOS na sprzęcie Sunmi, z drukarką fiskalną Posnet i terminalem PolCard. Wgrywamy Twoje menu, szkolimy zespół na miejscu i zostajemy na serwis — w Rabce, Zakopanem i na całym Podhalu.',
        badges: [{ text: 'dowozy Wolt, Glovo, Pyszne' }],
        ...image(refs, 'image', 'p-gopos-zestaw.webp'),
        ticket: 'Stolik 4 · 2× pierogi',
        steps: [
          {
            label: '1 · Sala',
            title: 'Zamówienie przy stoliku',
            text: 'Kelner przyjmuje zamówienie na terminalu Sunmi.',
            ...image(refs, 'image', 'p-sunmi-v3-mix.webp'),
          },
          {
            label: '2 · Kuchnia',
            title: 'Od razu na ekranie',
            text: 'Danie pojawia się na ekranie kuchni — bez karteczek.',
            ...image(refs, 'image', 'p-sunmi-kds.webp'),
          },
          {
            label: '3 · Płatność',
            title: 'Karta albo BLIK',
            text: 'Rachunek zamykasz przy stoliku, także dzielony.',
            ...image(refs, 'image', 'p-terminal-polcard.webp'),
          },
          {
            label: '4 · Raport',
            title: 'Sprzedaż w telefonie',
            text: 'Właściciel widzi utarg i food cost na bieżąco.',
            ...image(refs, 'image', 'p-gopos-zestaw.webp'),
          },
        ],
        note: 'Tak wygląda jedno zamówienie w Twoim lokalu — od sali do raportu.',
        primary: { label: 'Zestaw dla gastronomii', href: '/branze/gastronomia#zestaw' },
        secondary: { label: 'GoPOS — cała oferta', href: '/gopos' },
      },
      faqIntro: { eyebrow: 'Pytania właścicieli lokali', title: 'Zanim zdecydujesz' },
      faq: [
        {
          question: 'Mam już kasę Posnet. Czy GoPOS z nią zadziała?',
          answer:
            'Tak, jeśli to drukarka fiskalna (np. Thermal HX, Trio). Kasę z klawiaturą zwykle zastępujemy drukarką, bo system drukuje paragony sam. Sprawdzimy model i powiemy wprost.',
        },
        {
          question: 'Ile trwa wdrożenie i czy lokal musi być zamknięty?',
          answer:
            'Sprzęt konfigurujemy u siebie przed dostawą, potem montaż i szkolenie zespołu na miejscu. Termin ustalamy tak, żeby lokal nie musiał być zamknięty.',
        },
        {
          question: 'Co z dowozami z Wolt, Glovo, Pyszne?',
          answer:
            'GoPOS integruje się z platformami dostaw — zamówienia wpadają do tej samej kolejki co z sali, bez przepisywania z tabletu.',
        },
        {
          question: 'Co, gdy w sezonie coś się zepsuje?',
          answer:
            'Dzwonisz do nas. Najpierw pomagamy zdalnie, a gdy trzeba — przyjeżdża serwisant z Rabki. Zakres pomocy w sezonie i sprzęt zastępczy możemy zapisać w umowie opieki.',
        },
        {
          question: 'Czy GoPOS to zakup licencji na zawsze?',
          answer:
            'Nie — GoPOS działa w abonamencie miesięcznym (umowa z GoPOS), a sprzęt Sunmi i Posnet kupujesz u nas.',
        },
        {
          question: 'A KSeF w restauracji?',
          answer:
            'Faktury dla firm wystawiasz z GoPOS prosto do KSeF. Konfigurujemy to przy wdrożeniu, razem z certyfikatem i uprawnieniami dla księgowej.',
        },
      ],
      seo: { title: 'Systemy dla gastronomii — GoPOS, Sunmi, Posnet' },
      contact: {
        heading: 'Powiedz, jaki masz lokal. Resztę dobierzemy.',
        lead: 'Ile miejsc, czy są dowozy, czy jest ogródek — i dostajesz zestaw na piśmie.',
      },
    }),
  },
  {
    slug: 'handel',
    featured: ['neo', 'ergo', 'k10', 'hx', 'skaner', 'waga', 'szuf', 'pol', 'nexo'],
    heroImage: 'p-posnet-neo.webp',
    content: () => ({
      hero: {
        title: 'Sklep, w którym kolejka idzie sprawnie. Także w sezonie.',
        lead: 'Kasa albo drukarka fiskalna Posnet i Elzab, skaner, waga, terminal PolCard i program z magazynem — zaprogramowane z Twoimi towarami, z zespołem przeszkolonym na miejscu i serwisem z Rabki.',
        chips: ['Kasy Posnet i Elzab', 'Program z magazynem', 'KSeF z programu'],
        ctaLabel: 'Przygotuj zapytanie dla sklepu',
      },
      productsSection: {
        eyebrow: 'Zestaw dla handlu',
        title: 'Od kasy po magazyn. Wszystko ze sobą rozmawia.',
        lead: 'Każdy element ma własną stronę ze specyfikacją. Zestaw składamy pod sklep — mały sklep osiedlowy nie potrzebuje tego, co market z tysiącami kodów.',
      },
      day: {
        eyebrow: 'Dzień w sklepie',
        heading: 'Od otwarcia do raportu dobowego.',
        steps: [
          {
            label: '8:00',
            title: 'Otwarcie',
            text: 'Kasa startuje z aktualnymi towarami i cenami z programu. Wczorajszy utarg masz już w telefonie.',
          },
          {
            label: '11:00',
            title: 'Dostawa',
            text: 'Towar przyjmujesz skanerem, stany w programie zmieniają się od razu, etykiety drukujesz na miejscu.',
          },
          {
            label: '15:00',
            title: 'Awaria?',
            text: 'Coś przestało działać — dzwonisz do nas: najpierw pomoc zdalna, a gdy trzeba, serwisant z Rabki.',
          },
          {
            label: '19:00',
            title: 'Zamknięcie',
            text: 'Raport dobowy z kasy, utarg i stany w programie. Faktury dla firm idą do KSeF z programu.',
          },
        ],
      },
      faqIntro: { eyebrow: 'Pytania właścicieli sklepów', title: 'Zanim zdecydujesz' },
      faq: [
        {
          question: 'Kasa czy drukarka fiskalna do sklepu?',
          answer:
            'Kasa wystarczy, gdy sprzedajesz kilkaset towarów i nie prowadzisz magazynu. Gdy pracujesz na programie (np. Subiekt nexo), wybierz drukarkę fiskalną — program pilnuje stanów i cen. Doradzimy po krótkiej rozmowie.',
        },
        {
          question: 'Czy kasa połączy się z wagą i skanerem?',
          answer:
            'Tak — dobieramy wagę i skaner, które współpracują z wybraną kasą albo programem, i konfigurujemy je przed dostawą.',
        },
        {
          question: 'Ile trwa wdrożenie i czy sklep musi być zamknięty?',
          answer:
            'Kasę programujemy u siebie, z Twoimi towarami i stawkami VAT. Montaż i szkolenie robimy na miejscu, tak żeby sklep nie musiał być zamknięty.',
        },
        {
          question: 'Mam kasę z innego serwisu. Przejmiecie ją?',
          answer:
            'Tak. Zmiana serwisu to formalność, którą załatwiamy po naszej stronie — Ty podpisujesz jeden dokument.',
        },
      ],
      seo: { title: 'Systemy dla sklepów — kasy, wagi, skanery, program' },
      contact: {
        heading: 'Powiedz, jaki masz sklep. Resztę dobierzemy.',
        lead: 'Ile stanowisk, ile towarów, czy jest waga — i dostajesz zestaw na piśmie.',
      },
    }),
  },
  {
    slug: 'noclegi',
    featured: ['nfh', 'hx', 'pol', 'u7', 'gopos', 'd3', 'v3mix', 'nas', 'opieka'],
    heroImage: 'p-nfhotel.webp',
    content: () => ({
      hero: {
        title: 'Pensjonat, w którym recepcja ma czas dla gości.',
        lead: 'System rezerwacji NFHotel, kasa albo drukarka fiskalna Posnet, terminal PolCard i Wi-Fi dla gości osobno od firmy — wdrożone przed sezonem, z recepcją przeszkoloną na miejscu i serwisem z Rabki.',
        chips: ['NFHotel i GoPOS razem', 'Wi-Fi dla gości osobno', 'KSeF z systemu'],
        ctaLabel: 'Przygotuj zapytanie dla obiektu',
      },
      productsSection: {
        eyebrow: 'Zestaw dla hoteli i pensjonatów',
        title: 'Od recepcji po restaurację. Wszystko ze sobą rozmawia.',
        lead: 'Każdy element ma własną stronę ze specyfikacją. Zestaw składamy pod obiekt — pensjonat na 10 pokoi nie potrzebuje tego, co hotel z restauracją.',
      },
      day: {
        eyebrow: 'Dzień w pensjonacie',
        heading: 'Od śniadania do raportu dobowego.',
        steps: [
          {
            label: '7:00',
            title: 'Śniadania',
            text: 'Rachunki z restauracji trafiają na pokój gościa. Recepcja widzi w NFHotel obłożenie na dziś.',
          },
          {
            label: '11:00',
            title: 'Wymeldowanie',
            text: 'Rachunek za pobyt z kasy albo drukarki fiskalnej, płatność kartą lub BLIK-iem na terminalu.',
          },
          {
            label: '15:00',
            title: 'Zameldowanie',
            text: 'Rezerwacje są już w grafiku pokoi. Goście łączą się z własną siecią Wi-Fi, firma pracuje w osobnej.',
          },
          {
            label: '22:00',
            title: 'Zamknięcie',
            text: 'Raport dobowy i obłożenie w telefonie właściciela. Faktury dla firm idą do KSeF z systemu.',
          },
        ],
      },
      faqIntro: { eyebrow: 'Pytania właścicieli obiektów', title: 'Zanim zdecydujesz' },
      faq: [
        {
          question: 'Czy NFHotel połączy się z restauracją?',
          answer:
            'Tak — GoPOS i NFHotel mają integrację. Wdrażamy oba systemy, recepcję i restaurację, z jednym zespołem i jednym telefonem do serwisu.',
        },
        {
          question: 'Kiedy najlepiej wdrożyć system?',
          answer:
            'Przed sezonem: sprzęt konfigurujemy u siebie, potem montaż i szkolenie recepcji na miejscu. Termin ustalamy tak, żeby nie przerywać przyjmowania gości.',
        },
        {
          question: 'Czy goście mogą mieć osobne Wi-Fi?',
          answer: 'Tak — stawiamy sieć dla gości oddzieloną od sieci firmy, recepcji i kas.',
        },
        {
          question: 'Co, gdy w sezonie coś się zepsuje?',
          answer:
            'Dzwonisz do nas. Najpierw pomagamy zdalnie, a gdy trzeba — przyjeżdża serwisant z Rabki. Zakres pomocy w sezonie możemy zapisać w umowie opieki.',
        },
      ],
      seo: { title: 'Systemy dla hoteli i pensjonatów — NFHotel, kasy, Wi-Fi' },
      contact: {
        heading: 'Powiedz, jaki masz obiekt. Resztę dobierzemy.',
        lead: 'Ile pokoi, czy jest restauracja, skąd przychodzą rezerwacje — i dostajesz zestaw na piśmie.',
      },
    }),
  },
]

/**
 * Content of the active industries: only fields still empty are filled (`missingFields`), so
 * texts edited in the panel stay. Reports `industries <slug> content`.
 */
export async function seedBiznesIndustries(
  payload: Payload,
  tenantId: number,
  refs: Refs,
  report: Report,
): Promise<void> {
  for (const seed of INDUSTRIES) {
    const {
      docs: [industry],
    } = await payload.find({
      collection: 'industries',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: seed.slug } }] },
      limit: 1,
      ...local,
    })
    if (!industry) continue
    const featured = seed.featured.map(refs.product).filter((id): id is number => id !== undefined)
    const heroImage = refs.image(seed.heroImage)
    const content = seed.content(refs)
    const patch = {
      ...(missingFields(industry, {
        ...content,
        hero: { ...content.hero, ...(heroImage !== undefined && { image: heroImage }) },
      }) as Partial<Industry>),
      ...(isBlank(industry.featuredProducts) && featured.length > 0
        ? { featuredProducts: featured }
        : {}),
    }
    const changed = Object.keys(patch).length > 0
    report(`industries ${seed.slug} content`, changed)
    if (changed) {
      await payload.update({ collection: 'industries', id: industry.id, data: patch, ...local })
    }
  }
}
