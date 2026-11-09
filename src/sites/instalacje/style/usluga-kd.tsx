// Stylesheets of the service page: access control, in the line's cascade order (`style.test.ts`).
import '../sekcje/sceny.css'
import '../widzety/serwis/serwis.css'
import '../widzety/firma/firma.css'
import '../widzety/alarmy/alarmy.css'
import '../widzety/anteny/anteny.css'
import '../widzety/dostep/dostep.css'
import '../widzety/monitoring/monitoring.css'

/** Renders nothing: importing this module (`LineStyles`) links the page's stylesheets. */
export default function Sheets() {
  return null
}
