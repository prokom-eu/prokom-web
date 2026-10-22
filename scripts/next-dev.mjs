// `pnpm dev`: reads `.env` first, so `next dev` listens on this folder's `PORT` (two folders
// side by side — docs/sposob-pracy.md). Next's CLI takes the port only from the process
// environment, and a Node flag (`--env-file`) cannot load it: Next hands Node flags to its
// server process through NODE_OPTIONS, where `--env-file*` is not allowed.
try {
  process.loadEnvFile()
} catch {
  // No `.env` (CI) — the environment is already set.
}
// Run Next's CLI in this process, as `next dev <arguments of pnpm dev>`.
process.argv.splice(2, 0, 'dev')
await import('next/dist/bin/next')
