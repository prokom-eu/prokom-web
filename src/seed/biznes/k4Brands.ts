import { readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

import type { Partner } from '../../payload-types'
import { isSvgPath } from '../../lib/catalog/svg'
import { isImportedFileName } from './map'

/**
 * K4a-2: brands of `marki-k4.json` (K4-FINAL §4.1). Pure functions; `run.ts` gives them the
 * record ids. Statuses come only from `zasady_statusow` (K4-FINAL §1) — a brand whose own entry
 * says otherwise stops the import instead of reaching the page.
 */

export type K4BrandEntry = {
  opis_krotki: string
  status: string | null
  salon: boolean
  salon_klucz: string | null
  logo: string | null
}

export type K4BrandsFile = {
  marki: Record<string, K4BrandEntry>
  grupy: { t: string; d: string; ic: string; b: string[] }[]
  kolejnosc_na_glownej: string[]
  zasady_statusow: Record<string, string>
}

export type PartnerStatus = Partner['partnerStatus']

/** Package wording → value of `Partners.partnerStatus`. */
const STATUS_VALUES: Record<string, PartnerStatus> = {
  'Autoryzowany serwis': 'authorized-service',
  'Autoryzowany partner': 'authorized-partner',
  Partner: 'partner',
  'We współpracy': 'cooperation',
}

const fail = (message: string): never => {
  throw new Error(`Seed (K4 marki): ${message}`)
}

/** Status of a brand: the rule's, or none; the brand's own entry must agree with the rule. */
export function k4PartnerStatus(name: string, file: K4BrandsFile): PartnerStatus {
  const rule = file.zasady_statusow[name]
  const entry = file.marki[name]?.status ?? null
  if ((rule ?? null) !== entry) {
    fail(`brand "${name}" has status "${entry}", the rules say "${rule ?? 'none'}".`)
  }
  if (!rule) return 'none'
  return STATUS_VALUES[rule] ?? fail(`unknown status "${rule}" of "${name}".`)
}

/** Address of a brand: from its logo file (`logo-<slug>.ext`, as K4a-1b), else from its name. */
export function k4BrandSlug(name: string, file: K4BrandsFile): string {
  const logo = file.marki[name]?.logo
  const fromLogo = logo ? /logo-([a-z0-9-]+)\.[a-z]+$/.exec(logo)?.[1] : undefined
  return (
    fromLogo ??
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  )
}

export type K4LogoUpload = {
  /** Path inside `seed/prokombiznes/k4/`. */
  source: string
  /** `k4-logo-<slug>.<ext>`: a stored file of this name = logo already from K4 (idempotent). */
  uploadName: string
  mimetype: 'image/webp' | 'image/png'
  /** SVG is not accepted by `Partners` (scripts inside) — rasterized to WebP by the import. */
  rasterize: boolean
}

/** Logo of a brand from the package, or null (APC, Adobe have none). */
export function k4LogoUpload(name: string, file: K4BrandsFile): K4LogoUpload | null {
  const logo = file.marki[name]?.logo
  if (!logo) return null
  const match = /^media\/marki\/logo-([a-z0-9-]+)\.(webp|png|svg)$/.exec(logo)
  if (!match) return fail(`logo "${logo}" of "${name}" is not a package file.`)
  const [, slug, ext] = match
  if (ext === 'png') {
    return {
      source: logo,
      uploadName: `k4-logo-${slug}.png`,
      mimetype: 'image/png',
      rasterize: false,
    }
  }
  return {
    source: logo,
    uploadName: `k4-logo-${slug}.webp`,
    mimetype: 'image/webp',
    rasterize: ext === 'svg',
  }
}

/**
 * The stored logo is already the K4 one: its name, or with the `-N` Payload adds when a file of
 * that name was left in the upload folder (a fresh database over old files).
 */
export function hasK4Logo(stored: string | null | undefined, upload: K4LogoUpload): boolean {
  return isImportedFileName(stored, upload.uploadName)
}

/** Brand fields the package wins on: status and the one-line description. */
export function k4PartnerFields(name: string, file: K4BrandsFile) {
  const entry = file.marki[name] ?? fail(`brand "${name}" missing in marki-k4.json.`)
  return {
    partnerStatus: k4PartnerStatus(name, file),
    shortDescription: entry.opis_krotki.trim() || null,
  }
}

/** `BiznesSettings.brands`: homepage order and the groups of `/marki` (Samsung sits in two). */
export function k4BrandSettings(file: K4BrandsFile, partner: (name: string) => number | undefined) {
  const id = (name: string, where: string) =>
    partner(name) ?? fail(`${where}: brand "${name}" has no record.`)
  return {
    home: file.kolejnosc_na_glownej.map((name) => id(name, 'homepage')),
    groups: file.grupy.map((group) => ({
      title: group.t,
      description: group.d,
      iconPath: isSvgPath(group.ic) ? group.ic : fail(`icon of group "${group.t}" is not a path.`),
      partners: group.b.map((name) => id(name, `group "${group.t}"`)),
    })),
  }
}

/** Folder of the K4 package, relative to the repo root (where `pnpm seed` runs). */
const K4_DIR = path.join('seed', 'prokombiznes', 'k4')

/** The logo file for `payload.update({ file })`; SVG rasterized to a 640 px wide WebP. */
export async function readK4Logo(upload: K4LogoUpload) {
  const source = await readFile(path.join(K4_DIR, upload.source))
  const data = upload.rasterize
    ? await sharp(source, { density: 300 })
        .resize({ width: 640, height: 320, fit: 'inside' })
        .webp({ quality: 90 })
        .toBuffer()
    : source
  return { data, mimetype: upload.mimetype, name: upload.uploadName, size: data.length }
}
