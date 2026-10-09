#!/usr/bin/env node
// Builds js/catalog-data.js, the snapshot of the VaultDB Nest registry that
// marketplace.html renders from. The site has no build step: this script is
// only run to refresh the committed snapshot (by hand, or in the deploy
// workflow). Node 22+, standard library only.
//
//   node scripts/build-catalog.mjs                 # fetch the canonical registry
//   node scripts/build-catalog.mjs --from <dir>    # read a registry checkout / copy on disk
//   NEST_REGISTRY=github.com/org/repo node scripts/build-catalog.mjs
//
// Entries are parsed with the same rules as the app and the nest-app website
// (nest-app/website/src/lib/registry/parse.ts): invalid entries are skipped,
// duplicate IDs keep the highest version, deprecated entries are hidden, and
// publisher signatures are checked against the publisher's Ed25519 key.
//
// If the registry can't be read, the existing snapshot is kept, a warning is
// printed, and the script exits 0 (pass --strict to exit 1 instead).
import { createPublicKey, verify as cryptoVerify } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'js', 'catalog-data.js')
const DEFAULT_REGISTRY = 'github.com/devmchechi/nest-registry'
const INDEX_SCHEMA_VERSION = 1
const TIMEOUT_MS = 15_000
const MAX_BYTES = 5 * 1024 * 1024

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const fromIndex = args.indexOf('--from')
const fromDir = fromIndex === -1 ? null : args[fromIndex + 1]

// -- Where the files are ------------------------------------------------------

function normalizeRegistryUrl(url) {
  const trimmed = url.trim().replace(/\/+$/, '')
  const bare = trimmed.replace(/^https?:\/\//, '')
  return bare.startsWith('github.com/') ? bare.replace(/(\.git)+$/, '') : trimmed
}

function registryReader(registry) {
  const url = normalizeRegistryUrl(registry)
  if (url.startsWith('github.com/')) {
    const [owner, repo] = url.slice('github.com/'.length).split('/')
    const base = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD`
    return { label: url, webUrl: `https://github.com/${owner}/${repo}`, read: rel => fetchText(`${base}/${rel}`) }
  }
  if (/^https:\/\//.test(url)) {
    return { label: url, webUrl: url, read: rel => fetchText(`${url}/${rel}`) }
  }
  const dir = url.replace(/^file:\/\/\/?(?=[A-Za-z]:)/, '').replace(/^file:\/\//, '')
  return { label: dir, webUrl: null, read: rel => readFile(path.join(dir, rel), 'utf8') }
}

async function fetchText(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'User-Agent': 'vaultdb-web-catalog' },
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  const text = await response.text()
  if (text.length > MAX_BYTES) throw new Error(`${url}: too large`)
  return text
}

// -- Parsing (mirrors parse.ts) -----------------------------------------------

class EntryError extends Error {}
const isObject = v => typeof v === 'object' && v !== null && !Array.isArray(v)
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/

function str(obj, key) {
  const value = obj[key]
  if (value === undefined) throw new EntryError(`missing field \`${key}\``)
  if (typeof value !== 'string') throw new EntryError(`\`${key}\` must be a string`)
  return value
}
const strOr = (obj, key, fallback) => (obj[key] === undefined ? fallback : str(obj, key))
function optStr(obj, key) {
  const value = obj[key]
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') throw new EntryError(`\`${key}\` must be a string`)
  return value
}
function strList(obj, key) {
  const value = obj[key]
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new EntryError(`\`${key}\` must be a list of strings`)
  }
  return value
}
const isVersion = v => SEMVER.test(v.trim().replace(/^v/, ''))

function checkId(id) {
  if (id.length === 0 || id.length > 64) return 'must be 1-64 characters'
  if (!/^[a-z0-9-]+$/.test(id)) return 'use only lowercase letters, digits, and hyphens'
  if (id.startsWith('-')) return 'must start with a letter or digit'
  return null
}
function checkNameId(id) {
  if (id.length === 0 || id.length > 128) return 'must be 1-128 characters'
  if (id.startsWith('.')) return "must not start with '.'"
  if (!/^[A-Za-z0-9._-]+$/.test(id)) return "use only letters, digits, '-', '_', and '.'"
  return null
}
function checkPublisher(handle) {
  if (handle.length === 0 || handle.length > 39) return 'must be 1-39 characters'
  if (!/^[a-z0-9-]+$/.test(handle)) return 'use only lowercase letters, digits, and hyphens'
  if (handle.startsWith('-') || handle.endsWith('-') || handle.includes('--')) return 'bad hyphens'
  if (handle === 'packs') return "'packs' is reserved"
  return null
}
function checkSource(source) {
  if (source.trim().length === 0 || /\s/.test(source)) return 'must be a repo location without spaces'
  const scheme = source.indexOf('://')
  const authority = (scheme === -1 ? source : source.slice(scheme + 3)).split('/')[0] ?? ''
  return authority.includes('@') ? 'must not contain credentials' : null
}
const isRepoPath = p =>
  p.length > 0 &&
  Buffer.byteLength(p) <= 512 &&
  !p.startsWith('/') &&
  p.split('/').every(part => part.length > 0 && (!part.startsWith('.') || part === '.nest') &&
    !part.includes('\\') && !part.includes(':') && !CONTROL.test(part))

function fail(what, reason) {
  if (reason !== null) throw new EntryError(`${what}: ${reason}`)
}

function capabilities(obj) {
  const value = obj.capabilities
  if (value === undefined) return { tools: [], network: [], pilots: [], requiresApproval: [], aws: [] }
  if (!isObject(value)) throw new EntryError('`capabilities` must be an object')
  const approvalKey = value.requiresApproval !== undefined ? 'requiresApproval' : 'requires_approval'
  const caps = {
    tools: strList(value, 'tools'),
    network: strList(value, 'network'),
    pilots: strList(value, 'pilots'),
    requiresApproval: strList(value, approvalKey),
    aws: strList(value, 'aws'),
  }
  const bad = Object.values(caps).flat().find(i => i.length === 0 || i.length > 253 || /\s/.test(i) || CONTROL.test(i))
  if (bad !== undefined) throw new EntryError(`capability '${bad}' is not a plain name`)
  return caps
}

function costRange(obj) {
  const value = obj.estimated_cost_usd
  if (value === undefined || value === null) return null
  if (!isObject(value)) throw new EntryError('`estimated_cost_usd` must be an object')
  const num = (camel, short) => {
    const n = value[camel] ?? value[short]
    if (typeof n !== 'number') throw new EntryError(`\`estimated_cost_usd.${short}\` must be a number`)
    return n
  }
  return { min: num('minUsd', 'min'), max: num('maxUsd', 'max') }
}

function common(what, obj) {
  const name = str(obj, 'name')
  const publisher = str(obj, 'publisher').toLowerCase()
  const repo = str(obj, 'repo')
  const latestVersion = str(obj, 'latest_version')
  const minNestVersion = strOr(obj, 'min_nest_version', '0.0.0')
  if (name.trim().length === 0 || Buffer.byteLength(name) > 200) {
    throw new EntryError(`${what}: a name of 1-200 characters is required`)
  }
  fail(what, checkPublisher(publisher))
  fail(what, checkSource(repo))
  if (!isVersion(latestVersion)) throw new EntryError(`${what}: bad latest_version '${latestVersion}'`)
  if (!isVersion(minNestVersion)) throw new EntryError(`${what}: bad min_nest_version '${minNestVersion}'`)
  for (const key of ['icon_url', 'readme_url']) {
    const url = optStr(obj, key)
    if (url !== null && (!(url.startsWith('https://') || isRepoPath(url)) || /\s/.test(url))) {
      throw new EntryError(`${what}: ${key} must be an https:// URL or a relative path`)
    }
  }
  const version = latestVersion.replace(/^v+/, '')
  const ref = optStr(obj, 'ref') ?? `v${version}`
  if (!(ref.length > 0 && ref.length <= 200 && !ref.startsWith('-') && !ref.includes('..') && /^[A-Za-z0-9._/-]+$/.test(ref))) {
    throw new EntryError(`${what}: '${ref}' is not a branch or tag name`)
  }
  const commit = optStr(obj, 'commit')
  if (commit !== null && !/^[0-9a-fA-F]{40}$/.test(commit)) throw new EntryError(`${what}: bad commit`)
  return {
    name: name.trim(),
    description: strOr(obj, 'description', '').trim(),
    publisher,
    repo,
    version,
    minNestVersion,
    tags: strList(obj, 'tags'),
    capabilities: capabilities(obj),
    estimatedCostUsd: costRange(obj),
    signature: optStr(obj, 'signature'),
    commit: commit === null ? null : commit.toLowerCase(),
    license: typeof obj.license === 'string' ? obj.license : null,
    deprecated: obj.deprecated === true,
  }
}

function parseEntry(kind, value) {
  const what = `${kind} '${isObject(value) && typeof value.id === 'string' ? value.id : '(no id)'}'`
  if (!isObject(value)) throw new EntryError(`${what}: must be an object`)
  const id = str(value, 'id')
  fail(what, checkId(id))
  if (kind === 'agent') {
    const shared = common(what, value)
    const folder = str(value, 'path')
    if (!isRepoPath(folder)) throw new EntryError(`${what}: '${folder}' must be a relative folder`)
    return { kind, id, path: folder, ...shared }
  }
  const agents = (value.agents ?? []).map(a => {
    if (typeof a === 'string') return { id: a, name: a, description: '' }
    if (isObject(a)) return { id: str(a, 'id'), name: str(a, 'name'), description: strOr(a, 'description', '') }
    throw new EntryError(`${what}: each of \`agents\` must be an ID or {id, name}`)
  })
  if (!Array.isArray(value.agents ?? [])) throw new EntryError(`${what}: \`agents\` must be a list`)
  const workflows = strList(value, 'workflows')
  for (const a of agents) fail(what, checkId(a.id))
  for (const w of workflows) fail(what, checkNameId(w))
  const size = value.install_size_kb
  const installSizeKb = Number.isInteger(size) && size >= 0 ? size : null
  return { kind, id, agents, workflows, installSizeKb, ...common(what, value) }
}

function compareVersions(a, b) {
  const split = v => {
    const [core = '', pre] = v.replace(/^v+/, '').split('+')[0].split(/-(.*)/s)
    return { nums: core.split('.').map(Number), pre }
  }
  const x = split(a)
  const y = split(b)
  for (let i = 0; i < 3; i++) {
    const d = (x.nums[i] ?? 0) - (y.nums[i] ?? 0)
    if (d !== 0) return Math.sign(d)
  }
  if (x.pre === undefined || y.pre === undefined) return x.pre === y.pre ? 0 : x.pre === undefined ? 1 : -1
  return x.pre === y.pre ? 0 : x.pre < y.pre ? -1 : 1
}

function dedupe(entries) {
  const byId = new Map()
  for (const e of entries) {
    const current = byId.get(e.id)
    if (current === undefined || compareVersions(e.version, current.version) > 0) byId.set(e.id, e)
  }
  return [...byId.values()]
}

// -- Signatures (mirrors signature.ts) -----------------------------------------

function decodeKey(value, bytes) {
  const trimmed = (value ?? '').trim()
  if (!trimmed.startsWith('ed25519:')) return null
  const encoded = trimmed.slice('ed25519:'.length)
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) return null
  const decoded = Buffer.from(encoded, 'base64')
  return decoded.length === bytes ? decoded : null
}

function verified(publicKey, entry) {
  const key = decodeKey(publicKey, 32)
  const sig = decodeKey(entry.signature, 64)
  if (key === null || sig === null || entry.commit === null) return false
  try {
    const keyObject = createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: key.toString('base64url') }, format: 'jwk' })
    const message = `nest-signature-v1\n${entry.kind}\n${entry.id}\n${entry.version}\n${entry.commit}\n`
    return cryptoVerify(null, Buffer.from(message), keyObject, sig)
  } catch {
    return false
  }
}

// -- Main ---------------------------------------------------------------------

async function main() {
  const registry = fromDir ?? process.env.NEST_REGISTRY ?? DEFAULT_REGISTRY
  const source = registryReader(registry)
  const raw = JSON.parse(await source.read('index.json'))
  let agentsRaw = []
  let packsRaw = []
  if (Array.isArray(raw)) {
    agentsRaw = raw
  } else if (isObject(raw)) {
    const version = raw.schema_version ?? 1
    if (!Number.isInteger(version) || version > INDEX_SCHEMA_VERSION) {
      throw new Error(`Unsupported registry index format ${version}`)
    }
    agentsRaw = raw.agents ?? []
    packsRaw = raw.packs ?? []
  } else {
    throw new Error('The registry index is not an object or a list')
  }

  const skipped = []
  const parseAll = (kind, list) =>
    list.flatMap(value => {
      try {
        return [parseEntry(kind, value)]
      } catch (e) {
        skipped.push(e.message)
        return []
      }
    })
  const entries = [...dedupe(parseAll('agent', agentsRaw)), ...dedupe(parseAll('pack', packsRaw))]

  const publishers = new Map()
  for (const handle of new Set(entries.map(e => e.publisher))) {
    try {
      const p = JSON.parse(await source.read(`publishers/${handle}.json`))
      if (isObject(p) && typeof p.github_handle === 'string') {
        publishers.set(handle, {
          name: typeof p.display_name === 'string' && p.display_name.trim() ? p.display_name.trim() : p.github_handle,
          publicKey: typeof p.public_key === 'string' ? p.public_key : null,
        })
      }
    } catch {
      // No publisher file: show the handle, not verified
    }
  }

  const repoWebUrl = repo => {
    const n = normalizeRegistryUrl(repo)
    return n.startsWith('github.com/') ? `https://${n}` : n.startsWith('https://') ? n : null
  }

  const out = entries
    .filter(e => !e.deprecated)
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
    .map(e => {
      const publisher = publishers.get(e.publisher)
      const item = {
        kind: e.kind,
        id: e.id,
        name: e.name,
        description: e.description,
        publisher: e.publisher,
        publisherName: publisher?.name ?? e.publisher,
        verified: publisher?.publicKey ? verified(publisher.publicKey, e) : false,
        version: e.version,
        minNestVersion: e.minNestVersion,
        tags: [...new Set(e.tags.map(t => t.toLowerCase()))],
        repoUrl: repoWebUrl(e.repo),
        capabilities: e.capabilities,
        estimatedCostUsd: e.estimatedCostUsd,
        license: e.license,
      }
      if (e.kind === 'agent') item.path = e.path
      if (e.kind === 'pack') {
        item.agents = e.agents
        item.workflows = e.workflows
        item.installSizeKb = e.installSizeKb
      }
      return item
    })

  const data = {
    registry: normalizeRegistryUrl(registry),
    registryWebUrl: source.webUrl ?? 'https://github.com/devmchechi/nest-registry',
    source: fromDir ? 'local copy' : 'live',
    snapshotDate: new Date().toISOString().slice(0, 10),
    entries: out,
  }
  const js =
    '// Generated by scripts/build-catalog.mjs from the VaultDB Nest registry. Do not edit by hand.\n' +
    `// Source: ${fromDir ? 'local copy of ' : ''}${data.registry} (${data.snapshotDate}). ${out.length} entries.\n` +
    `window.NEST_CATALOG = ${JSON.stringify(data, null, 2)};\n`
  await writeFile(OUT, js.replace(/\n/g, '\r\n'))
  const agents = out.filter(e => e.kind === 'agent').length
  console.log(`Wrote js/catalog-data.js: ${agents} agents, ${out.length - agents} packs from ${source.label}`)
  for (const reason of skipped) console.warn(`Skipped: ${reason}`)
}

main().catch(e => {
  console.warn(`Couldn't refresh the catalog (${e.message}); keeping the existing js/catalog-data.js`)
  process.exit(strict ? 1 : 0)
})
