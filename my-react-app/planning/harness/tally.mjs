// 인터뷰 집계. 사용법: node planning/harness/tally.mjs [프로젝트]
// projects/<이름>/field/data/contacts.csv, interviews.csv 를 읽어 인터뷰로 재는 가설(H-01, 02, 03, 05, 07)의 합격선 충족 여부를 계산합니다.
// 이 스크립트는 계산만 합니다. 가설 상태와 근거 장부는 사람이 직접 고칩니다(집계 결과를 보고 판단하세요).
// 원자료(field/data/)에는 사람 정보가 들어갈 수 있어 저장소에 올라가지 않습니다(.gitignore).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { listProjects, loadModel, projectDir } from './lib.mjs'

export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i += 1 } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i += 1
      row.push(cell); cell = ''
      if (row.some((v) => v.trim() !== '')) rows.push(row)
      row = []
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some((v) => v.trim() !== '')) rows.push(row) }
  const [head, ...body] = rows
  if (!head) return []
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

const yes = (v) => String(v).toUpperCase() === 'Y'
const no = (v) => String(v).toUpperCase() === 'N'

// 인터뷰 한 줄에서 합격선 계산에 쓰는 파생 항목들.
export const DERIVED = {
  promo_low_and_reason_time_or_judgment: (r) => Number(r.promo_actions_last_month) <= 1 && ['time', 'judgment'].includes(r.reason_main),
  abandoned_free_channel: (r) => yes(r.abandoned_free_channel),
  lapsed_regular_unknown_or_no_action: (r) => no(r.can_name_lapsed_regular) || (yes(r.can_name_lapsed_regular) && no(r.acted_on_lapsed_regular)),
  meme_would_use: (r) => yes(r.meme_would_use),
  accepted: (r) => yes(r.accepted),
}

// 가설별 계산에 쓸 모집단을 고른다.
export const BASES = {
  interviews: (_c, i) => i,
  meme_shown: (_c, i) => i.filter((r) => yes(r.meme_shown)),
  contacts: (c) => c,
}

const VALID_ERRORS = (rows, kind) => {
  const need = kind === 'contacts' ? ['id', 'date', 'channel', 'accepted'] : ['id', 'date', 'channel', 'promo_actions_last_month', 'reason_main', 'abandoned_free_channel', 'can_name_lapsed_regular', 'acted_on_lapsed_regular', 'meme_shown', 'meme_would_use']
  const out = []
  rows.forEach((r, i) => {
    for (const k of need) if (!(k in r)) out.push(`${kind} ${i + 2}행: '${k}' 열이 없습니다`)
    if (kind === 'interviews') {
      if (r.promo_actions_last_month !== undefined && !/^\d+$/.test(r.promo_actions_last_month)) out.push(`interviews ${r.id || i + 2}: promo_actions_last_month 는 숫자여야 합니다("${r.promo_actions_last_month}")`)
      if (r.reason_main && !['time', 'judgment', 'cost', 'no_need', 'other'].includes(r.reason_main)) out.push(`interviews ${r.id || i + 2}: reason_main 값 "${r.reason_main}" 은 time | judgment | cost | no_need | other 중 하나여야 합니다`)
    }
  })
  return out
}

export function tally(model, contacts, interviews) {
  const target = model.experiments.find((t) => t.id === 'T-01')?.sampleTarget ?? 10
  const errors = [...VALID_ERRORS(contacts, 'contacts'), ...VALID_ERRORS(interviews, 'interviews')]
  const results = []
  for (const h of model.hypotheses) {
    if (!h.passRule) continue
    const base = BASES[h.passRule.base](contacts, interviews)
    const hits = base.filter(DERIVED[h.passRule.field]).length
    const n = base.length
    const ratio = n === 0 ? null : hits / n
    const enough = h.passRule.base === 'contacts' ? n >= 10 : n >= target
    results.push({ id: h.id, statement: h.statement, threshold: h.threshold, min: h.passRule.min, base: h.passRule.base, n, hits, ratio, enough, pass: ratio !== null && ratio >= h.passRule.min })
  }
  return { results, errors, target }
}

function nextEvidenceId(model) {
  const max = Math.max(...model.evidence.map((e) => Number(e.id.split('-')[1])))
  return `E-${String(max + 1).padStart(2, '0')}`
}

const isMain = process.argv[1] && process.argv[1].endsWith('tally.mjs')
if (isMain) {
  const name = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? listProjects()[0]
  const model = await loadModel(name)
  const dir = join(projectDir(name), 'field', 'data')
  const cFile = join(dir, 'contacts.csv')
  const iFile = join(dir, 'interviews.csv')
  if (!existsSync(cFile) && !existsSync(iFile)) {
    console.log(`\n아직 기록이 없습니다. field/templates/ 의 두 CSV 를 field/data/ 로 복사해 채우세요:\n  ${cFile}\n  ${iFile}\n`)
    process.exit(0)
  }
  const contacts = existsSync(cFile) ? parseCsv(readFileSync(cFile, 'utf8')) : []
  const interviews = existsSync(iFile) ? parseCsv(readFileSync(iFile, 'utf8')) : []
  const r = tally(model, contacts, interviews)
  console.log(`\n인터뷰 집계 — 요청 ${contacts.length}건, 인터뷰 ${interviews.length}건 (목표 ${r.target}명)\n`)
  if (r.errors.length) { console.log('기록 오류'); r.errors.slice(0, 20).forEach((e) => console.log(`  - ${e}`)); console.log('') }
  for (const x of r.results) {
    const pct = x.ratio === null ? '-' : `${(x.ratio * 100).toFixed(0)}%`
    const verdict = !x.enough ? `표본 부족(${x.n}/${x.base === 'contacts' ? 10 : r.target}) — 참고만` : x.pass ? '합격선 충족' : '합격선 미달'
    console.log(`  ${x.id}  ${x.hits}/${x.n} = ${pct}  (합격선 ${(x.min * 100).toFixed(0)}% 이상: ${x.threshold})  → ${verdict}`)
  }
  const date = interviews.map((i) => i.date).filter(Boolean).sort().at(-1) ?? ''
  console.log(`\n근거 장부에 옮길 때(예시, 값은 위 집계를 보고 직접 적으세요):\n  { id: '${nextEvidenceId(model)}', kind: 'interview', claim: '인터뷰 ${interviews.length}명 중 …', n: ${interviews.length}, date: '${date}', status: 'verified', ref: { type: 'none', value: '인터뷰 기록(field/data, 저장소에 올리지 않음)' }, checkedAt: '${date}' }\n`)
  console.log('주의: 합격선 충족은 가설이 지지된다는 뜻이 아니라 판단의 출발점입니다. 표본이 목표에 못 미치면 상태를 바꾸지 마세요.\n')
}
