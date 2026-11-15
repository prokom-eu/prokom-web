// Porównanie wielu stron naraz: każda strona × 1440/390 × jasny/ciemny (porownaj.mjs po kolei).
// Użycie (dev server Instalacji musi działać):
//   node docs/design/prokominstalacje/narzedzia/porownaj-wszystko.mjs start:/ anteny:/anteny
//   node docs/design/prokominstalacje/narzedzia/porownaj-wszystko.mjs monitoring:/monitoring --szybko
// Argument = <plik prototypu bez .html>:<adres w kodzie>. --szybko: tylko 1440 jasny i 390 ciemny.
// Wynik: zrzuty jak porownaj.mjs i tmp/porownanie/raport.md — tabele wysokości sekcji wszystkich
// przebiegów, gotowe do opisu PR (wiersze „SPRAWDŹ” i „BRAK” oglądasz na zrzutach).
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const quick = args.includes('--szybko')
const pages = args.filter((a) => !a.startsWith('--')).map((a) => a.split(':'))
if (pages.length === 0 || pages.some((p) => p.length !== 2)) {
  console.error('Użycie: porownaj-wszystko.mjs <prototyp>:<adres> […] [--szybko]')
  process.exit(1)
}
const runs = quick
  ? [['1440', 'light'], ['390', 'dark']]
  : [['1440', 'light'], ['1440', 'dark'], ['390', 'light'], ['390', 'dark']]
const tool = join(fileURLToPath(new URL('.', import.meta.url)), 'porownaj.mjs')
const tables = []
for (const [slug, route] of pages) {
  for (const [width, theme] of runs) {
    const run = spawnSync(process.execPath, [tool, slug, route, width, theme], {
      stdio: ['ignore', 'pipe', 'inherit'],
      encoding: 'utf8',
      env: { ...process.env, INST_STAN: '', MSYS_NO_PATHCONV: '1' },
    })
    process.stdout.write(run.stdout)
    try {
      tables.push(readFileSync(resolve('tmp/porownanie', slug, `${width}-${theme}-wysokosci.md`), 'utf8'))
    } catch {
      tables.push(`### ${slug} ${width} ${theme}\nbłąd przebiegu (kod ${run.status})\n`)
    }
  }
}
writeFileSync(resolve('tmp/porownanie/raport.md'), tables.join('\n'))
console.log(`raport: tmp/porownanie/raport.md (${tables.length} przebiegów)`)
