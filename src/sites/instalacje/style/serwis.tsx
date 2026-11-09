// Stylesheets of the /serwis (InstServiceDesk), in the line's cascade order (`style.test.ts`).
import '../sekcje/sceny.css'
import '../sekcje/glowna/glowna-sekcje.css'
import '../widzety/serwis/serwis.css'
import '../widzety/oferta/oferta.css'
import '../widzety/firma/firma.css'
import '../widzety/sieci/sieci.css'
import '../widzety/teletechnika/teletechnika.css'

/** Renders nothing: importing this module (`LineStyles`) links the page's stylesheets. */
export default function Sheets() {
  return null
}
