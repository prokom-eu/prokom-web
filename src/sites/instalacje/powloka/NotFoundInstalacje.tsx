import Link from 'next/link'

import { nieZnaleziono as T } from '../dane/nieZnaleziono'
import { InstIcon } from '../InstIcon'
import '../sekcje/sekcje.css'

/**
 * 404 inside the Instalacje frame (header, CTA band, footer from the layout): the message and six
 * ways on. `notFound()` below the root layout cannot export metadata (Next 16 docs:
 * not-found.md → Metadata), so the page's title is a React `<title>`, hoisted into `<head>`.
 */
export function NotFoundInstalacje() {
  return (
    <section id="hero" className="py-20 max-[700px]:py-12" data-not-found="">
      <title>{`${T.title} | PRO-KOM Instalacje`}</title>
      <div className="wrap">
        <span className="eye">{T.eyebrow}</span>
        <h1 className="h1 mt-3">{T.heading}</h1>
        <p className="lead mt-4 max-w-2xl">{T.lead}</p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {T.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="card flex h-full items-start gap-4 p-5">
                <span className="ico shrink-0">
                  <InstIcon name={link.icon} size={22} />
                </span>
                <span className="flex flex-col gap-1">
                  <b className="text-[17px]">{link.title} →</b>
                  <span className="text-[14.5px] text-ink-2">{link.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href="/" className="btn btn-p">
            {T.home}
          </Link>
        </div>
      </div>
    </section>
  )
}
