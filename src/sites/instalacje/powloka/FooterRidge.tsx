const RIDGE =
  'M0 74 L90 52 L170 70 L260 30 L330 58 L420 18 L500 50 L580 34 L650 62 L740 22 L820 56 L900 40 L990 70 L1080 36 L1160 60 L1250 28 L1330 56 L1440 44'

/**
 * The Instalacje mountain ridge on the top edge of the shared footer (spec §5 `SiteFooter.edge`,
 * MAPA-DZIS — „grzbiet gór zostaje jako ozdoba stopki”): the same outline as the I3 footer, filled
 * with the footer colour and traced with a thin line. Decoration only.
 */
export function FooterRidge() {
  return (
    <svg className="ftmt" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${RIDGE} L1440 120 L0 120 Z`} />
      <path className="l" d={RIDGE} />
    </svg>
  )
}
