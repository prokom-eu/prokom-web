// The order of the former imports (`RenderBlocks` → block → widget): files share selectors,
// e.g. `.zkticket` (glowna-sekcje, zaplanuj) and `.odi` (oferta, teletechnika).
import '../widzety/architekci/architekci.css'
import '../widzety/kontakt/kontakt.css'
import '../widzety/glowna/glowna.css'
import '../sekcje/glowna/glowna-sekcje.css'
import '../widzety/zaplanuj/zaplanuj.css'
import '../widzety/serwis/serwis.css'
import '../widzety/oferta/oferta.css'
import '../widzety/realizacje/realizacje.css'
import '../widzety/firma/firma.css'
import '../widzety/alarmy/alarmy.css'
import '../widzety/anteny/anteny.css'
import '../widzety/dostep/dostep.css'
import '../widzety/sieci/sieci.css'
import '../widzety/teletechnika/teletechnika.css'
import '../widzety/monitoring/monitoring.css'
import '../widzety/smart/smart.css'
import '../widzety/ekrany/ekrany.css'
import '../widzety/ladowarki/ladowarki.css'
import '../widzety/naglosnienie/naglosnienie.css'

/** Renders nothing: importing this module (`LineStyles`) links the block stylesheets. */
export default function BlockSheets() {
  return null
}
