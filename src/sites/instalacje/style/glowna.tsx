// Stylesheets of the home page (InstHome), in the order of `cascade.ts`.
import '../widzety/architekci/architekci.css'
import '../widzety/glowna/glowna.css'
import '../sekcje/sceny.css'
import '../sekcje/sceny-ruch.css'
import '../sekcje/glowna/glowna-sekcje.css'
import '../sekcje/glowna/podhale-proces.css'
import '../widzety/zaplanuj/zaplanuj.css'
import '../widzety/serwis/serwis.css'
import '../widzety/firma/firma.css'
import '../widzety/sieci/sieci.css'
import '../widzety/monitoring/monitoring.css'

/** Renders nothing: importing this module (`LineStyles`) links the page's stylesheets. */
export default function Sheets() {
  return null
}
