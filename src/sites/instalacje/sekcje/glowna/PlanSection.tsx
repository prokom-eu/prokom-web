import Link from 'next/link'
import { connection } from 'next/server'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'

import { glownaSekcje } from '../../dane/glownaSekcje'
import { InstIcon } from '../../InstIcon'
import { type PlanService, QuickPlanForm } from '../../widzety/glowna/QuickPlanForm'
import { InstSection } from '../InstSection'
import type { Phone } from '../types'

const t = glownaSekcje.plan

type Salon = { name: string; address: string }

type Props = {
  services: PlanService[]
  phone: Phone | null
  email: string | null
  salons: Salon[]
}

/**
 * „Zaplanuj instalację” (`#zaplanuj`): the quick plan form on the dark band and the contact
 * cards below it (phone and e-mail of the line, salons from the company data). The form token
 * is issued per request, so the page is rendered on demand (like the Software contact).
 */
export async function PlanSection({ services, phone, email, salons }: Props) {
  await connection()
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  return (
    <InstSection id="zaplanuj" className="bnd bnd-plan hzk xa-s" style={{ padding: '100px 0' }}>
      <div className="wrap" data-surface="dark">
        <div className="hzkhead ri">
          <span className="eye" style={{ color: 'var(--inst-plan-accent)' }}>
            {t.eyebrow}
          </span>
          <h2 className="h2">
            {t.heading} <span className="acc">{t.accent}</span>
          </h2>
          <p className="lead">{t.lead}</p>
        </div>
        <QuickPlanForm services={services} formToken={formToken} />
        <div id="kontakt" className="ctc" style={{ marginTop: 22 }}>
          {phone && (
            <div className="card ct ri">
              <span className="ico">
                <InstIcon name="phone" size={22} />
              </span>
              <b>{t.contact.phone}</b>
              <a href={phone.href}>{phone.label}</a>
              <span>{t.contact.hours}</span>
            </div>
          )}
          {email && (
            <div className="card ct ri">
              <span className="ico">
                <InstIcon name="chat" size={22} />
              </span>
              <b>{t.contact.mail}</b>
              <span>{t.contact.mailNote}</span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          )}
          {salons.map((salon) => (
            <div key={salon.name} className="card ct ri">
              <span className="ico">
                <InstIcon name="pin" size={22} />
              </span>
              <b>
                {t.contact.salon} {salon.name}
              </b>
              <span>{salon.address}</span>
              <Link
                href="/kontakt"
                style={{ color: 'var(--accent-text)', fontWeight: 800, fontSize: 14 }}
              >
                {t.contact.route}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </InstSection>
  )
}
