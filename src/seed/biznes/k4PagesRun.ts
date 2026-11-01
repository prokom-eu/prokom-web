import type { Payload } from 'payload'

import file from '../../../seed/prokombiznes/k4/strony-k4.json'
import { biznesGoposLayout, GOPOS_SLUG } from './gopos'
import { biznesInsertLayout, INSERT_SLUG } from './insert'
import { goposK4Layout, insertK4Layout, type K4PagesFile, type SlugOf } from './k4Pages'
import { upsertK4Page } from './page'

type Report = (name: string, changed: boolean) => void
type Note = (what: string, item: string) => void

const pages = file as unknown as K4PagesFile

/**
 * K4 subpages (K4hij) from `strony-k4.json`. A page still on the B9 seed layout gets the K4
 * one; a page edited in the panel stays and goes to the report, like board ids the database
 * does not know.
 */
export async function seedBiznesK4Pages(
  payload: Payload,
  tenantId: number,
  slugOf: SlugOf,
  report: Report,
  note: Note,
): Promise<void> {
  const k4 = [
    {
      slug: GOPOS_SLUG,
      title: 'GoPOS',
      built: goposK4Layout(pages, slugOf),
      legacy: [biznesGoposLayout()],
    },
    {
      slug: INSERT_SLUG,
      title: 'InsERT',
      built: insertK4Layout(pages, slugOf),
      legacy: [biznesInsertLayout()],
    },
  ]
  for (const { slug, title, built, legacy } of k4) {
    for (const id of built.missing) note('strona K4: produkt spoza bazy', `${slug}: ${id}`)
    const done = await upsertK4Page(
      payload,
      tenantId,
      { slug, title, layout: built.layout, legacy },
      report,
    )
    if (!done) note('strona K4 edytowana w panelu — bez zmian', slug)
  }
}
