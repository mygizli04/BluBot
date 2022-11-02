import fs from 'fs/promises';

const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));

interface Dependency {
  name: string,
  version: string
}

const dependencies: Dependency[] = []

Object.entries<string>(packageJson.dependencies).forEach(d => {
  dependencies.push({
    name: d[0],
    version: d[1]
  })
});

export function getDependency(name: string): Dependency | null {
  const found = dependencies.find(d => d.name === name)
  if (!found) return null
  return found
}

export function getVersion(): string {
  return packageJson.version
}

export function getPackageAmount() {
  return Object.keys(packageJson.dependencies).length
}