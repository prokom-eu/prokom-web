// Stylesheets of the service page: networks and Wi-Fi, in the line's cascade order (`style.test.ts`).
import '../sekcje/sceny.css'
import '../sekcje/glowna/glowna-sekcje.css'
import '../widzety/serwis/serwis.css'
import '../widzety/firma/firma.css'
import '../widzety/alarmy/alarmy.css'
import '../widzety/anteny/anteny.css'
import '../widzety/sieci/sieci.css'
import '../widzety/monitoring/monitoring.css'

/** Renders nothing: importing this module (`LineStyles`) links the page's stylesheets. */
export default function Sheets() {
  return null
}
