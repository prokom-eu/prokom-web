/**
 * ALSEN premium section of the hub's home (Krystian 19.11.2026), frozen for the data migration
 * `hub_alsen_sekcja`: the texts of `home.network` and the rail entry above „Współpraca”.
 */

export const NETWORK_HOME_1911 = {
  eyebrow: 'Sieć partnerska',
  title: 'Autoryzowany partner ALSEN',
  lead: 'Oferta ogólnopolskiej sieci, opieka na miejscu. Sprzęt i akcesoria z sieci ALSEN zamówisz u nas, bez szukania po wielu sklepach. Dobierzemy je do zadania, na życzenie skonfigurujemy i zostaniemy pod telefonem po zakupie.',
  stat: {
    value: '350+',
    label: 'sklepów ALSEN w całej Polsce',
    note: 'Sieć związana z dystrybutorem AB.',
    facts: ['ALSEN', 'ALSEN 350+'],
  },
  point: {
    text: 'Nasz salon to punkt partnerski ALSEN',
    facts: ['ALSEN', 'ALSEN Rabka'],
  },
  points: [
    {
      icon: 'store',
      title: 'Szeroka oferta w jednym miejscu',
      text: 'Komputery, laptopy, monitory i akcesoria z oferty sieci ALSEN — zamówione u nas.',
    },
    {
      icon: 'target',
      title: 'Dobór do zadania',
      text: 'Doradzimy, który sprzęt pasuje do Twojej pracy, nauki albo firmy.',
    },
    {
      icon: 'wrench',
      title: 'Konfiguracja na życzenie',
      text: 'Przygotujemy sprzęt do pracy: system i programy — jeśli tego potrzebujesz.',
    },
    {
      icon: 'phone',
      title: 'Opieka po zakupie',
      text: 'Zostajemy pod telefonem — tak jak przy wszystkim, co robimy.',
    },
  ],
  cta: {
    label: 'Zapytaj o sprzęt',
    href: '/kontakt#formularz',
  },
  more: {
    label: 'Więcej o partnerstwie',
    href: '/o-firmie#alsen',
  },
}

export const RAIL_ALSEN = { anchorId: 'alsen', label: 'ALSEN', icon: 'star' }

type JsonObject = Record<string, unknown>
const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** `home` with the ALSEN section (only while missing); `null` = no change. */
export function homeWithNetwork(home: unknown): JsonObject | null {
  if (!isObject(home) || home.network) return null
  return { ...home, network: NETWORK_HOME_1911 }
}

/** Rail of the hub's home with „ALSEN” before „Współpraca” (only while missing). */
export function railWithAlsen<T extends { anchorId?: string | null }>(
  sections: readonly T[] | null | undefined,
): (T | typeof RAIL_ALSEN)[] | null {
  if (!sections?.length || sections.some((row) => row.anchorId === 'alsen')) return null
  const at = sections.findIndex((row) => row.anchorId === 'wspolpraca')
  const index = at < 0 ? sections.length : at
  return [...sections.slice(0, index), { ...RAIL_ALSEN }, ...sections.slice(index)]
}
