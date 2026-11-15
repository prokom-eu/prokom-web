import type { GuidePostData } from './types'

/**
 * Runda v6 §3.1 no. 4: Wi-Fi in a guesthouse that works in every room. Facts from the Sieci i Wi-Fi
 * page (`dane/sieci.ts`, `strony-zrzut/Sieci.json`) and the guesthouse page (`obiekty/pens.json`).
 */
export const wifiWPensjonacie: GuidePostData = {
  slug: 'wifi-w-pensjonacie',
  title: 'Wi-Fi w pensjonacie, które działa w każdym pokoju',
  category: 'noclegi',
  publishedAt: '2026-11-08T13:00:00.000Z',
  lead: 'Wi-Fi w pensjonacie działa w każdym pokoju wtedy, gdy sygnał rozchodzi się z kilku punktów dostępowych podłączonych kablem, rozmieszczonych w pokojach albo nad ich drzwiami. Goście dostają osobną sieć, oddzieloną od kamer i kasy.',
  sections: [
    {
      heading: 'Dlaczego Wi-Fi w pensjonacie nie działa w pokojach',
      blocks: [
        'Najczęstsza przyczyna to jeden router od operatora, który stoi w recepcji albo w szafce przy wejściu. W pokojach od strony kuchni i na piętrze zasięg słabnie albo znika.',
        'Drugi powód to mury. Beton, cegła, kamień i stropy osłabiają sygnał, a stare domy z pokojami gościnnymi mają grube ściany. Przez jedną taką ścianę Wi-Fi jeszcze działa, przez dwie już słabo.',
        'Wzmacniacz z gniazdka zwykle tylko przenosi problem dalej. Więcej o przyczynach słabego zasięgu przeczytasz na stronie [Sieci i Wi-Fi](/sieci-wifi#dlaczego).',
      ],
    },
    {
      heading: 'Ile punktów dostępowych potrzebuje pensjonat',
      blocks: [
        'Tyle, żeby każdy pokój miał dobry sygnał z najbliższego punktu. Zwykle każde piętro potrzebuje swojego punktu, a przy grubych murach punkt trafia do pokoju albo nad jego drzwi.',
        'Liczba zależy od powierzchni, liczby pięter i tego, z czego są ściany i stropy. Dlatego ustalamy ją po pomiarze zasięgu na wizji lokalnej.',
        [
          'Pokoje na każdym piętrze: punkty w pokojach albo nad drzwiami.',
          'Jadalnia, sala kominkowa i recepcja: punkt sufitowy.',
          'Taras, ogród i parking: punkt zewnętrzny.',
        ],
      ],
    },
    {
      heading: 'Gdzie montować punkty Wi-Fi: w pokoju czy na korytarzu',
      blocks: [
        'W pensjonacie punkt Wi-Fi montujemy w pokoju albo nad drzwiami pokoju, bo sygnał z korytarza musi przejść przez ścianę i drzwi. Przy grubych murach to często różnica między dobrym a słabym zasięgiem przy łóżku.',
        'Do pokoi pasują punkty ścienne w miejscu gniazdka, na korytarze i sale punkty sufitowe. Telefon gościa sam przełącza się między nimi, więc gość przechodzi z pokoju na taras bez zrywania połączenia.',
      ],
    },
    {
      heading: 'Mesh czy punkty Wi-Fi podłączone kablem',
      blocks: [
        'Mesh to punkty Wi-Fi połączone ze sobą radiowo. Każdy taki skok radiowy obniża prędkość, a Ubiquiti zaleca najwyżej dwa skoki bezprzewodowe.',
        'Punkty podłączone kablem dają pełną prędkość w każdym pokoju i są stabilne w sezonie. Jeden kabel daje punktowi internet i prąd (PoE, czyli zasilanie przez kabel sieciowy), więc nie potrzeba gniazdka przy suficie.',
        'Przy nowej sieci Wi-Fi 6 to dziś rozsądne minimum. Obsługuje więcej urządzeń naraz, co ma znaczenie w pełnym obłożeniu, gdy każdy gość ma telefon i laptop, a starsze urządzenia gości dalej działają.',
        'Kable prowadzimy do szafy rack, w której stoją router, przełącznik i zasilacz awaryjny. W remontowanym pensjonacie używamy korytek, listew i przejść między piętrami.',
      ],
    },
    {
      heading: 'Osobna sieć Wi-Fi dla gości, kamer i recepcji',
      blocks: [
        'Goście, kamery i kasa w jednej sieci to ryzyko i spowolnienie w sezonie. Dlatego dzielimy jedno łącze na kilka oddzielnych sieci:',
        [
          'Goście: telefony i laptopy, odizolowane od siebie i od reszty.',
          'Kamery: kamery i rejestrator, bez dostępu z sieci gości.',
          'Recepcja i kasa: komputer, kasa fiskalna, terminal płatniczy.',
          'Smart i TV: telewizory, ekran w jadalni, sterowanie ogrzewaniem.',
        ],
        'Sieć recepcji i kasy może mieć priorytet ruchu, żeby terminal płatniczy działał także wieczorem, gdy goście oglądają seriale przez Wi-Fi.',
        'Gość nie zobaczy Twoich kamer ani komputera recepcji. Jak wygląda taki podział, pokazujemy na stronie [Osobna sieć dla gości, kamer i kasy](/sieci-wifi#podzial).',
      ],
    },
    {
      heading: 'Jak goście logują się do Wi-Fi w pensjonacie',
      blocks: [
        'Najprościej przez portal gościa: ekran powitalny z nazwą i logo pensjonatu, na którym gość wpisuje kod z recepcji. Kod może mieć limit czasu, prędkości albo transferu i wygasa po wyjeździe.',
        'Voucher nie wymaga zbierania e-maili ani telefonów gości. Możesz go wydrukować, wysłać w wiadomości przed przyjazdem albo zostawić hasło w pokoju. Jeśli chcesz zbierać kontakty do gości, pomożemy to ustawić.',
      ],
    },
    {
      heading: 'Wi-Fi w domkach i dobudówce obok pensjonatu',
      blocks: [
        'Domki i dobudówkę łączymy z głównym budynkiem kablem w ziemi, światłowodem albo mostem radiowym, a w każdym budynku stawiamy własny punkt dostępowy. Całość działa jako jedna sieć z jednym logowaniem gości.',
        'Przy wykopie lepszy jest światłowód, bo nie przewodzi prądu i nie przeniesie przepięcia z burzy między budynkami. Gdy kopać się nie da, a budynki się widzą, wystarczy most radiowy.',
      ],
    },
    {
      heading: 'Co zrobić, gdy w pensjonacie pada internet',
      blocks: [
        'Na Podhalu wciąż trafiamy na adresy bez szybkiego internetu. Wtedy budujemy łącze radiowe albo dokładamy łącze zapasowe LTE. Gdy główne łącze przestanie działać, router sam przełącza się na sieć komórkową.',
        'Terminal płatniczy i kamery dalej mają internet, a goście nie zostają bez sieci w środku ferii. Zasilacz awaryjny (UPS) dla routera i kamer sprawia, że krótki zanik prądu nie wyłącza sieci.',
        'Operatora zwykle nie trzeba zmieniać. Jego router zostaje jako modem, a za nim budujemy sieć pensjonatu.',
      ],
    },
    {
      heading: 'Jak przygotować Wi-Fi w pensjonacie przed sezonem',
      blocks: [
        'Najlepszy czas na prace to listopad i grudzień przed feriami albo maj i czerwiec przed wakacjami, kiedy obiekt jest jeszcze pusty. Montaż robimy poza sezonem albo w wolnych pokojach.',
        'Przed sezonem warto sprawdzić aktualizacje punktów, zasięg w pokojach i działanie łącza zapasowego. Jeśli masz u nas opiekę, awarię widzimy w panelu sieci zdalnie, często zanim zadzwonisz. Szczegóły znajdziesz w [opiece serwisowej](/serwis#plany).',
        'Pozostałe instalacje, które przydają się w pensjonacie, opisujemy na stronie [Dla pensjonatów](/dla-kogo/pensjonaty#problemy).',
      ],
    },
  ],
  seo: {
    title: 'Wi-Fi w pensjonacie w każdym pokoju',
    description:
      'Wi-Fi w pensjonacie, które działa w każdym pokoju: ile punktów dostępowych, kabel czy mesh, osobna sieć dla gości i łącze zapasowe. Poradnik z Podhala.',
  },
  extras: {
    toc: [
      'Dlaczego nie działa',
      'Ile punktów',
      'Pokój czy korytarz',
      'Mesh czy kabel',
      'Osobne sieci',
      'Logowanie gości',
      'Domki i dobudówka',
      'Gdy pada internet',
      'Przed sezonem',
    ],
    summary: [
      'Jeden router w recepcji nie przebije się przez grube mury i stropy.',
      'Punkty dostępowe w pokojach albo nad drzwiami, podłączone kablem.',
      'Osobne sieci dla gości, kamer, kasy i telewizorów.',
      'Łącze zapasowe LTE i zasilacz awaryjny na wypadek awarii.',
    ],
    checklist: {
      heading: 'Sprawdź Wi-Fi w swoim pensjonacie',
      items: [
        'Każdy pokój ma dobry zasięg przy łóżku',
        'Punkty dostępowe są podłączone kablem',
        'Goście mają osobną sieć, oddzieloną od kamer i kasy',
        'Goście logują się kodem albo hasłem na czas pobytu',
        'Router ma łącze zapasowe LTE',
        'Router i kamery mają zasilacz awaryjny',
        'Konto administratora sieci jest założone na Ciebie',
      ],
      initial: [0, 2],
      done: 'Sieć jest gotowa na sezon. Warto co roku sprawdzić aktualizacje i łącze zapasowe.',
      partial:
        '{n} z {all}. Brakujące punkty zaplanujemy na wizji lokalnej, zwykle bez zmiany operatora.',
    },
    howWeDo: [
      'Na wizji lokalnej mierzymy zasięg w pokojach i sprawdzamy, którędy poprowadzić kable.',
      'Planujemy punkty dostępowe i podział sieci, wycenę podajemy na piśmie.',
      'Montujemy poza sezonem albo w wolnych pokojach i ustawiamy portal gościa.',
      'Na montaż dajemy 24 miesiące gwarancji, a przed sezonem robimy przegląd.',
    ],
    faq: [
      {
        question: 'Czy wystarczy mocniejszy router?',
        answer:
          'Zwykle nie. Grube mury i stropy tłumią sygnał, więc nawet mocny router w korytarzu nie dociera do pokoi. Pomagają punkty dostępowe bliżej gości.',
      },
      {
        question: 'Czy muszę zmienić operatora internetu?',
        answer:
          'Zwykle nie. Router operatora zostaje jako modem, a za nim budujemy własną sieć. Jeśli łącze jest za słabe, doradzimy, jakie opcje są pod Twoim adresem.',
      },
      {
        question: 'Czy płacę abonament za zarządzanie siecią?',
        answer:
          'Za samo oprogramowanie zwykle nie: UniFi i podstawowa chmura Omada działają bez licencji. Osobno możesz wykupić naszą opiekę serwisową.',
      },
      {
        question: 'Czy goście widzą się nawzajem w sieci?',
        answer:
          'Nie. Urządzenia gości są od siebie odizolowane i nie widzą ani siebie, ani Twoich kamer i komputera recepcji.',
      },
      {
        question: 'Na jakim sprzęcie budujecie sieci w pensjonatach?',
        answer:
          'Najczęściej na Ubiquiti UniFi albo TP-Link Omada, a przy mostach radiowych także na MikroTik. Markę dobieramy po wizji lokalnej, do liczby pokoi, budynków i tego, kto będzie siecią zarządzał.',
      },
      {
        question: 'Czy prace można rozłożyć na etapy?',
        answer:
          'Tak. Najpierw zwykle robimy Wi-Fi w pokojach i osobną sieć gości, a domki czy łącze zapasowe w kolejnym etapie. Pracujemy poza sezonem albo w wolnych pokojach.',
      },
    ],
    plan: {
      opis: 'Wi-Fi w pensjonacie: zasięg w każdym pokoju, osobna sieć dla gości',
      label: 'Zaplanuj Wi-Fi w pensjonacie',
    },
    art: {
      icon: 'wifi',
      alt: 'Ilustracja: punkty Wi-Fi na piętrach pensjonatu',
    },
    aside: {
      title: 'Zmierzymy zasięg w Twoim pensjonacie',
      text: 'Pomiar, plan punktów dostępowych i podział sieci. Wycena na piśmie po wizji lokalnej.',
      link: { label: 'Sieci i Wi-Fi: osobne sieci', href: '/sieci-wifi#podzial' },
    },
    readAlso: [
      { label: 'Wi-Fi dla gości z logo pensjonatu', href: '/sieci-wifi#portal' },
      { label: 'Instalacje dla pensjonatów', href: '/dla-kogo/pensjonaty' },
      { label: 'Kamery w pensjonacie', href: '/poradnik/kamery-w-pensjonacie' },
    ],
    band: {
      eyebrow: 'Wi-Fi w pensjonacie',
      heading: 'Sprawdzimy, dlaczego Wi-Fi nie dochodzi do pokoi',
      text: 'Przyjedziemy, zmierzymy zasięg i zaplanujemy punkty dostępowe. Montaż poza sezonem albo w wolnych pokojach.',
    },
  },
}
