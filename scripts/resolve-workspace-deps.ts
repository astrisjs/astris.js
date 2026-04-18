import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const packagesDir = join(import.meta.dir, '../packages/@astrisjs')
const packages = readdirSync(packagesDir)

// Collect all package names and their current versions
const versions: Record<string, string> = {}
for (const pkg of packages) {
  const pkgJsonPath = join(packagesDir, pkg, 'package.json')
  try {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
    versions[pkgJson.name] = pkgJson.version
  } catch {}
}

// Replace workspace:* with actual versions
for (const pkg of packages) {
  const pkgJsonPath = join(packagesDir, pkg, 'package.json')
  try {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
    let changed = false

    for (const depField of ['dependencies', 'peerDependencies', 'optionalDependencies'] as const) {
      for (const dep in pkgJson[depField] ?? {}) {
        if (pkgJson[depField][dep] === 'workspace:*' && versions[dep]) {
          pkgJson[depField][dep] = versions[dep]
          changed = true
          console.log(`  ${pkg}: ${dep} → ${versions[dep]}`)
        }
      }
    }

    if (changed) {
      writeFileSync(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`)
    }
  } catch {}
}

console.log('✓ Workspace dependencies resolved.')
