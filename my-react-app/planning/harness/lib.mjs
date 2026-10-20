import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { ENTITIES } from './schema.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
export const PLANNING_ROOT = resolve(HERE, '..')

export function projectDir(name) {
  return join(PLANNING_ROOT, 'projects', name)
}

export function listProjects() {
  const dir = join(PLANNING_ROOT, 'projects')
  return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []
}

// projects/<이름>/model/index.mjs 가 내보내는 모델을 읽습니다.
export async function loadModel(name) {
  const file = join(projectDir(name), 'model', 'index.mjs')
  if (!existsSync(file)) throw new Error(`모델 파일이 없습니다: ${file}`)
  const mod = await import(pathToFileURL(file).href)
  return mod.model
}

// 모델 안의 모든 항목을 { kind, item } 로 펴 줍니다.
export function allItems(model) {
  const out = []
  for (const kind of Object.keys(ENTITIES)) for (const item of model[kind] ?? []) out.push({ kind, item })
  return out
}

export function byId(model, kind) {
  return new Map((model[kind] ?? []).map((it) => [it.id, it]))
}

// 항목 안의 모든 문자열(중첩 포함)을 모읍니다. 문체 검사에 씁니다.
export function collectStrings(value, path = '', out = []) {
  if (typeof value === 'string') out.push({ path, text: value })
  else if (Array.isArray(value)) value.forEach((v, i) => collectStrings(v, `${path}[${i}]`, out))
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) collectStrings(v, path ? `${path}.${k}` : k, out)
  return out
}

export const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

export function daysBetween(a, b) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export const today = () => new Date().toISOString().slice(0, 10)
