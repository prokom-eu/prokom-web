import { CompanyCard } from '@/components/shared/CompanyCard'
import { Contours } from '@/components/shared/Contours'
import { FaqBlock } from '@/components/shared/FaqBlock'
import { FamilyStrip } from '@/components/shared/FamilyStrip'
import { RulesBento } from '@/components/shared/RulesBento'
import { ServiceAreaMap } from '@/components/shared/ServiceAreaMap'
import { StatsStrip } from '@/components/shared/StatsStrip'
import { Steps } from '@/components/shared/Steps'
import { VerifyCards } from '@/components/shared/VerifyCards'
import type { SharedData } from '@/lib/shared/getSharedData'
import { aboutStats } from '@/lib/shared/pages'
import type { Line } from '@/lib/tenant/lines'

type Props = { shared: SharedData; line: Line; siteEnv: string }

const sectionClass = 'mx-auto max-w-[1344px] scroll-mt-28 px-8 py-16'
const h2Class =
  'font-display text-[clamp(32px,3.8vw,48px)] leading-none font-extrabold tracking-[-0.025em]'

/**
 * The modules of the Kontakt and O firmie templates (D2-3b) on the line's data, one after another,
 * for comparing with the boards and for the e2e test. D2-4 puts them into the page templates.
 */
export function ModulesPreview({ shared, line, siteEnv }: Props) {
  const { company, lines } = shared
  const about = shared.line.about
  const contact = shared.line.contact
  const stats = aboutStats(about?.stats, lines)

  return (
    <div data-modules-preview>
      <section
        id="wspolne-zasieg"
        aria-labelledby="wspolne-zasieg-h"
        className={sectionClass}
        data-rail-section="Zasięg"
        data-rail-icon="map"
      >
        <h2 id="wspolne-zasieg-h" className={h2Class}>
          {contact?.mapTitle || 'Dojazd i zasięg'}
        </h2>
        {contact?.mapLead && <p className="mt-3 max-w-[60ch] text-ink-2">{contact.mapLead}</p>}
        <ServiceAreaMap
          zones={company.serviceZones}
          center={company.address?.city ?? 'Rabka-Zdrój'}
          background={<Contours />}
          className="mt-6"
        />
      </section>

      <section
        id="wspolne-kroki"
        aria-labelledby="wspolne-kroki-h"
        className={sectionClass}
        data-rail-section="Kroki"
        data-rail-icon="compass"
      >
        <h2 id="wspolne-kroki-h" className={h2Class}>
          Jak to wygląda krok po kroku
        </h2>
        <Steps steps={about?.steps ?? []} className="mt-8" />
        <div className="relative isolate mt-10 max-w-[480px] overflow-hidden rounded-[28px] bg-line-dark p-8">
          <Contours />
          <p className="mb-5 text-xs font-extrabold tracking-[0.12em] text-on-dark-text uppercase">
            Co dalej po wysłaniu
          </p>
          <Steps steps={contact?.nextSteps ?? []} orientation="vertical" onDark />
        </div>
      </section>

      <FaqBlock
        id="wspolne-faq"
        eyebrow="Pytania"
        title="Zanim zadzwonisz"
        items={contact?.faq ?? []}
      />

      <section
        id="wspolne-o-firmie"
        aria-labelledby="wspolne-o-firmie-h"
        className="relative isolate overflow-hidden bg-line-dark py-16"
        data-rail-section="O firmie"
        data-rail-icon="users"
      >
        <Contours />
        <div className="mx-auto grid max-w-[1344px] items-start gap-10 px-8 min-[1000px]:grid-cols-2">
          <div className="flex flex-col gap-4 text-line-dark-text">
            <h2
              id="wspolne-o-firmie-h"
              className="font-display text-[clamp(32px,3.8vw,48px)] leading-none font-extrabold text-line-dark-ink"
            >
              {about?.h1 || 'O firmie'}
            </h2>
            {about?.lead && <p className="max-w-[52ch]">{about.lead}</p>}
          </div>
          <CompanyCard
            company={company}
            phone={shared.line.phone}
            email={shared.line.email}
            hours={company.hours}
            authTitle={about?.authTitle}
            auth={about?.auth}
          />
        </div>
      </section>
      <div className="relative z-[1] mx-auto -mt-9 max-w-[1344px] px-8">
        <StatsStrip stats={stats} siteEnv={siteEnv} />
      </div>

      <section
        id="wspolne-zasady"
        aria-labelledby="wspolne-zasady-h"
        className={sectionClass}
        data-rail-section="Zasady"
        data-rail-icon="star"
      >
        <h2 id="wspolne-zasady-h" className={h2Class}>
          Dlaczego PRO-KOM
        </h2>
        <RulesBento rules={about?.rules ?? []} className="mt-8" />
      </section>

      <section
        id="wspolne-rodzina"
        aria-labelledby="wspolne-rodzina-h"
        className={sectionClass}
        data-rail-section="Linie"
        data-rail-icon="grid"
      >
        <h2 id="wspolne-rodzina-h" className={h2Class}>
          Linie PRO-KOM
        </h2>
        <FamilyStrip lines={lines} current={line} className="mt-8" />
      </section>

      <section
        id="wspolne-sprawdz"
        aria-labelledby="wspolne-sprawdz-h"
        className={sectionClass}
        data-rail-section="Sprawdź nas"
        data-rail-icon="shield"
      >
        <h2 id="wspolne-sprawdz-h" className={h2Class}>
          Nie musisz wierzyć nam na słowo
        </h2>
        <VerifyCards items={about?.verify ?? []} className="mt-8" />
      </section>
    </div>
  )
}
