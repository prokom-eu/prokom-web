import type { SoftwareHome } from '@/lib/software/home'

type Props = { promises: NonNullable<SoftwareHome['promises']> }

/** Three promises under the hero (ZMIANY-v24 §4 pkt 2, board `AU-pc` „obietnice”). */
export function Promises({ promises }: Props) {
  return (
    <section className="v-sec v-sec-first" aria-label="Obietnice">
      <div className="v-wrap">
        <ul className="v-prom" data-rise-group>
          {promises.map((item) => (
            <li key={item.title} className="sw-glass">
              <span className="v-ico" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.icon.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </svg>
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
