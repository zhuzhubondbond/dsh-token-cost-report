// Packaging contract check for this repository (run from the repository root).
// Mirrors the checks a DSH host/Plugin Manager performs on an installed bundle,
// without needing the package to be installed first.
import { existsSync, readFileSync } from 'node:fs'

const root = process.cwd()
const pkg = JSON.parse(readFileSync(`${root}/package.json`, 'utf8'))
const client = readFileSync(`${root}/lib/client.js`, 'utf8')
const patch = readFileSync(`${root}/cordis.patch.yml`, 'utf8')
const prices = JSON.parse(readFileSync(`${root}/prices.json`, 'utf8'))
const models = Object.values(prices.providers ?? {}).flatMap((provider) => Object.values(provider.models ?? {}))

const checks = {
  'package name set': typeof pkg.name === 'string' && pkg.name.length > 0,
  [`version ${pkg.version}`]: typeof pkg.version === 'string',
  'not private': pkg.private !== true,
  'bundle patch declared': pkg.dsh?.bundle?.patch === './cordis.patch.yml',
  'patch exists': existsSync(`${root}/cordis.patch.yml`),
  'patch inserts own name': patch.includes(`name: '${pkg.name}'`),
  'client platform web': pkg.dsh?.client?.platform === 'web',
  'client export present': pkg.exports?.['./client'] === './lib/client.js',
  'client bundle exists': existsSync(`${root}/lib/client.js`),
  'client id equals package name': client.includes(`id: "${pkg.name}"`),
  'host main exists': existsSync(`${root}/lib/index.js`),
  'aggregate module shipped': existsSync(`${root}/lib/aggregate.mjs`),
  'prices sample shipped': existsSync(`${root}/prices.json`),
  'prices is a blank template': models.length > 0 && models.every((m) => m.input === null && m.output === null),
  'offPeak schedule kept': Array.isArray(prices.offPeakSchedule?.peakWindows),
  'engines.dsh declared': typeof pkg.engines?.dsh === 'string',
  'repository declared': typeof pkg.repository?.url === 'string',
  'no absolute author paths': !/D:\\\\Harness|C:\\\\Users\\\\daikin/.test(
    ['lib/index.js', 'lib/client.js', 'lib/aggregate.mjs', 'bin/report.mjs']
      .map((f) => readFileSync(`${root}/${f}`, 'utf8'))
      .join('\n'),
  ),
}

let failed = 0
for (const [label, ok] of Object.entries(checks)) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`)
  if (!ok) failed += 1
}
if (failed > 0) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log(`\nAll ${Object.keys(checks).length} packaging checks passed for ${pkg.name}@${pkg.version}`)
