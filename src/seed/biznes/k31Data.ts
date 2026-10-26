import k3Catalog from '../../../seed/prokombiznes/k3/katalog-k3.json'
import k3Media from '../../../seed/prokombiznes/k3/media-k3.json'
import splitContent from '../../../seed/prokombiznes/k31/karty-podzial-tresci.json'
import splits from '../../../seed/prokombiznes/k31/karty-podzial-k31.json'
import newCards from '../../../seed/prokombiznes/k31/katalog-k31-nowe.json'
import showrooms from '../../../seed/prokombiznes/k31/marki-salony-k31.json'
import k31Media from '../../../seed/prokombiznes/k31/media-k31.json'
import homepage from '../../../seed/prokombiznes/k31/strona-glowna-k31.json'
import supplements from '../../../seed/prokombiznes/k31/tresci-uzupelnienia-k31.json'
import videos from '../../../seed/prokombiznes/k31/wideo-k31.json'
import { k31Catalog, k31Gallery, type K31Input, type K31Video } from './k31'

/** The K3 + K3.1 packages as the import reads them (one place for `run.ts` and the tests). */
export const k31Input: K31Input = {
  k3Cards: k3Catalog.produkty,
  newCards: newCards.produkty,
  supplements: supplements.karty,
  splits: splits.karty,
  splitContents: splitContent.karty,
}

export const k31Series: Record<string, string> = showrooms.seria_karty
export const k31Videos: Record<string, K31Video[]> = videos.produkty
export const k31Featured: string[] = homepage.najczesciej_wybierane

/** Cards after K3.1 and their galleries. */
export function loadK31Catalog() {
  const catalog = k31Catalog(k31Input)
  const gallery = k31Gallery(k3Media.zdjecia, k31Media.zdjecia, catalog, k31Input.splitContents)
  return { catalog, gallery }
}
