// pnpm szablony:build [--line <id|all>] [--strict] [--logo-base <url>] [--no-href-input] [--out <dir>]
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { MISSING_RE } from './dsl.ts'
import { catalogue } from './katalog.ts'
import { type Content, REPO_DIR, TOOL_DIR, loadContent } from './load.ts'
import { renderLogo } from './logo.ts'
import { signatureFile, signatureHtml } from './podpis.ts'
import { type PreviewLine, previewHtml } from './preview.ts'
import { quicktextXml } from './quicktext.ts'
import { renderLine } from './render.ts'
import { LINES, type LineId } from './schema.ts'

/** Default copy target, relative to the repo (repos/prokom-web → ../../maile). */
export const DEFAULT_TARGET = resolve(REPO_DIR, '..', '..', 'maile')

export interface BuildOptions {
  lines: LineId[]
  strict: boolean
  logoBase: string
  noHrefInput: boolean
  out: string
}

export interface BuildResult {
  counts: Partial<Record<LineId, number>>
  warnings: string[]
  errors: string[]
}

/** Line data used outside templates (signature) that must not stay a placeholder. */
const SIGNATURE_FIELDS = [
  'NAZWA',
  'WWW',
  'MAIL',
  'TEL',
  'TEL2',
  'GODZ',
  'OBIETNICA',
  'ROLA',
  'LOGO',
] as const

export async function build(
  opts: BuildOptions,
  content: Content = loadContent(),
): Promise<BuildResult> {
  const warnings: string[] = []
  const errors: string[] = []
  const counts: BuildResult['counts'] = {}
  const preview: PreviewLine[] = []
  const rendered = []

  await rm(opts.out, { recursive: true, force: true })
  for (const line of opts.lines) {
    const r = renderLine(content, line, { noHrefInput: opts.noHrefInput })
    const d = content.dane.linie[line]
    for (const f of SIGNATURE_FIELDS) {
      if (MISSING_RE.test(d[f])) r.missing.push(`${f}: ${d[f]}`)
    }
    errors.push(...r.errors)
    warnings.push(...r.set.warnings, ...r.missing.map((m) => `${line}: brak danych — ${m}`))
    counts[line] = r.templates.length

    const logo = await renderLogo(d.LOGO)
    const dir = join(opts.out, line)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, `logo-${line}.png`), logo.png)
    const fileLogo = {
      src: `${opts.logoBase.replace(/\/$/, '')}/${line}/logo-${line}.png`,
      ...logo,
    }
    await writeFile(join(dir, `podpis-${line}.html`), signatureFile(content.dane, line, fileLogo))
    await writeFile(join(dir, `quicktext-${line}.xml`), quicktextXml(r))
    const dataLogo = { ...fileLogo, src: `data:image/png;base64,${logo.png.toString('base64')}` }
    preview.push({ rendered: r, signature: signatureHtml(content.dane, line, dataLogo) })
    rendered.push(r)
  }
  await writeFile(join(opts.out, 'podglad-szablonow.html'), previewHtml(content, preview))
  await writeFile(join(opts.out, 'KATALOG-SZABLONOW.md'), catalogue(content, rendered))

  if (opts.strict && warnings.some((w) => w.includes('brak danych'))) {
    errors.push(
      '--strict: dane.yaml zawiera [DO UZUPEŁNIENIA] / [SZEF] używane przez budowane linie',
    )
  }
  return { counts, warnings, errors }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      line: { type: 'string', default: 'all' },
      strict: { type: 'boolean', default: false },
      'logo-base': { type: 'string' },
      'no-href-input': { type: 'boolean', default: false },
      out: { type: 'string' },
    },
  })
  const line = values.line
  if (line !== 'all' && !(LINES as readonly string[]).includes(line)) {
    throw new Error(`--line: ${line} (dozwolone: ${LINES.join(', ')}, all)`)
  }
  const result = await build({
    lines: line === 'all' ? [...LINES] : [line as LineId],
    strict: values.strict,
    logoBase: values['logo-base'] ?? pathToFileURL(DEFAULT_TARGET).href,
    noHrefInput: values['no-href-input'],
    out: resolve(values.out ?? join(TOOL_DIR, 'dist')),
  })
  for (const w of result.warnings) console.warn(`ostrzeżenie: ${w}`)
  for (const e of result.errors) console.error(`błąd: ${e}`)
  const summary = Object.entries(result.counts)
    .map(([l, n]) => `${l} ${n}`)
    .join(', ')
  console.log(`Szablony: ${summary}. Wynik: tools/szablony-maili/dist/`)
  if (result.errors.length > 0) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
}
