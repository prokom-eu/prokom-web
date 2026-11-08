import type { InstIconName } from '../icons'

/*
 * Texts of the Instalacje 404 page (audit before staging, P2 5). The prototype has no such page:
 * a short message, a search of the offer and the ways on — services, objects, works, planner,
 * guide, contact (RUNDA-V5 §11).
 */
export const nieZnaleziono = {
  title: 'Nie znaleziono strony',
  eyebrow: 'Błąd 404',
  heading: 'Tej strony tu nie ma.',
  lead: 'Adres jest nieprawidłowy albo strona została przeniesiona. Zacznij od jednego z tych miejsc:',
  links: [
    {
      href: '/uslugi',
      icon: 'grid',
      title: 'Usługi',
      text: 'Monitoring, alarmy, sieci, smart home i więcej.',
    },
    {
      href: '/#dla-kogo',
      icon: 'home',
      title: 'Dla kogo',
      text: 'Dom, pensjonat, hotel, firma, gmina.',
    },
    {
      href: '/realizacje',
      icon: 'check',
      title: 'Realizacje',
      text: 'Wybrane instalacje z Podhala i Małopolski.',
    },
    {
      href: '/zaplanuj',
      icon: 'send',
      title: 'Zaplanuj instalację',
      text: 'Cztery kroki, wycena na piśmie.',
    },
    {
      href: '/poradnik',
      icon: 'book',
      title: 'Poradnik',
      text: 'Odpowiedzi na pytania o monitoring, Wi-Fi i obiekty na wynajem.',
    },
    {
      href: '/kontakt',
      icon: 'phone',
      title: 'Kontakt',
      text: 'Telefon, e-mail i dojazd do salonu.',
    },
  ] satisfies { href: string; icon: InstIconName; title: string; text: string }[],
  search: {
    label: 'Szukaj w ofercie',
    placeholder: 'np. kamera do domku, Wi-Fi dla gości',
    button: 'Szukaj',
  },
  home: 'Strona główna',
} as const
