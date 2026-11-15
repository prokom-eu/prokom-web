import { Container } from '@/components/ui/Container'
import { compareView } from '@/lib/software/compare'
import { getSoftwareHome } from '@/lib/software/data'
import { Wizard } from '@/sites/software/components/wizard/WizardLazy'
import { loadWizardProps } from '@/sites/software/components/wizard/wizardProps'

import { Compare } from '../about/CompareLazy'

/**
 * The `swHomeSection` sections that are not v24 start page sections (those are in
 * `v24home/HomeV24Blocks`): the wizard (`#dobierz`, until SWA3) and the comparison of `/o-firmie`.
 * The v23 sections went with the clean-up after Krystian's decision D6 (08.11).
 */

export async function WizardSection({ tenantId }: { tenantId: number }) {
  const props = await loadWizardProps(tenantId)
  if (!props) return null
  return (
    // `overflow-x-clip`: the step slides in from 24 px to the right (motion.css), also on load —
    // without the clip a phone widens the page by that much until it ends (as on `/dobierz`).
    <section id="dobierz" className="scroll-mt-24 overflow-x-clip py-10 min-[640px]:py-14">
      <Container wide>
        <Wizard {...props} headingLevel="h2" />
      </Container>
    </section>
  )
}

/** SW11b — „Freelancer, agencja czy PRO-KOM?” on `/o-firmie` (spec. §6.6, stany/70). */
export async function CompareSection({ tenantId }: { tenantId: number }) {
  const home = await getSoftwareHome(tenantId)
  const texts = home?.sections?.compare
  const view = home && texts ? compareView(home.compare) : null
  if (!texts || !view) return null
  return <Compare view={view} eyebrow={texts.eyebrow} title={texts.title} tabs={texts.tabs} />
}
