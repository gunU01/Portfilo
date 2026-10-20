// 하네스 스스로를 검사합니다. 일부러 망가뜨린 모델을 넣어, 각 규칙이 실제로 잡아내는지 확인합니다.
// 사용법: node planning/harness/selftest.mjs   (규칙이 하나라도 못 잡으면 종료 코드 1)
import { evaluate, GATES } from './gates.mjs'
import { loadModel } from './lib.mjs'
import { rules } from './rules.mjs'

const base = await loadModel('sosang')
const clone = () => structuredClone(base)

// [규칙 ID, 모델을 망가뜨리는 함수, 설명]
const breakers = [
  ['SCH-01', (m) => { m.problems[0].who = '' }, '필수 항목 비움'],
  ['SCH-02', (m) => { m.risks.push({ ...m.risks[0] }) }, 'ID 중복'],
  ['REF-01', (m) => { m.features[0].requirements.push('R-99') }, '없는 요구사항 참조'],
  ['TRC-01', (m) => { m.hypotheses = m.hypotheses.filter((h) => h.problem !== 'P-02') }, '가설 없는 문제'],
  ['TRC-02', (m) => { m.requirements = m.requirements.filter((r) => !r.problems.includes('P-02')) }, '요구사항 없는 문제'],
  ['TRC-03', (m) => { m.features = m.features.filter((f) => !f.requirements.includes('R-03')) }, '기능 없는 must 요구사항'],
  ['TRC-04', (m) => { m.features.find((f) => f.id === 'F-09').release = 'mvp' }, 'could 요구사항만 근거인 MVP 기능'],
  ['TRC-05', (m) => { m.screens = m.screens.filter((s) => s.id !== 'S-02') }, '화면 없는 MVP 기능'],
  ['TRC-06', (m) => { m.experiments = m.experiments.filter((t) => !t.hypotheses.includes('H-03') || t.hypotheses.length > 1) ; m.experiments[0].hypotheses = m.experiments[0].hypotheses.filter((h) => h !== 'H-03') }, '실험 없는 가설'],
  ['TRC-07', (m) => { m.requirements[0].kpis = [] }, '지표 없는 must 요구사항'],
  ['TRC-08', (m) => { m.kpis.push({ id: 'K-99', name: '떠도는 지표', definition: '어디에도 연결 안 됨', target: '1', targetBasis: 'tbd', hypotheses: [] }) }, '고아 지표'],
  ['ACC-01', (m) => { m.requirements[0].acceptance.push('쉽게 쓸 수 있다') }, '막연한 인수 기준'],
  ['EVD-01', (m) => { m.evidence[5].status = 'verified'; m.evidence[5].checkedAt = undefined }, '출처 없는 verified'],
  ['EVD-02', (m) => { m.evidence.push({ id: 'E-90', kind: 'interview', claim: '사장님 A 가 말함', status: 'verified', ref: { type: 'none', value: '' } }) }, 'n·date 없는 인터뷰 근거'],
  ['EVD-03', (m) => { m.problems[0].status = 'validated' }, '2차 자료만으로 validated'],
  ['EVD-04', (m) => { m.kpis.find((k) => k.id === 'K-02').evidence = [] }, '근거 없는 benchmark'],
  ['EVD-05', (m) => { m.evidence[0].checkedAt = '2020-01-01' }, '오래된 근거'],
  ['EVD-06', (m) => { m.decisions[0].status = 'accepted'; m.decisions[0].evidence = [] }, '근거 없는 accepted 결정'],
  ['EVD-07', (m) => { m.competitors[0].evidence = [] }, '근거 없는 경쟁사 주장'],
  ['SCP-01', (m) => { m.features.filter((f) => f.release !== 'mvp').slice(0, 2).forEach((f) => { f.release = 'mvp' }) }, 'MVP 한도 초과'],
  ['SCP-02', (m) => { m.outOfScope = m.outOfScope.slice(0, 2) }, '하지 않는 것 부족'],
  ['ECO-01', (m) => { m.economics.params[0].basis = undefined }, '기준 없는 수익 입력값'],
  ['LNT-01', (m) => { m.problems[0].statement = '획기적인 서비스다' }, '과장 표현'],
]

let failed = 0

// 1) 망가뜨린 모델마다 해당 규칙이 반응해야 한다.
const covered = new Set()
for (const [id, mutate, why] of breakers) {
  const m = clone()
  mutate(m)
  const r = evaluate(m, { today: '2026-10-20' }).results.find((x) => x.id === id)
  const caught = r && r.issues.length > 0
  covered.add(id)
  console.log(`${caught ? '✓' : '✗'} ${id} — ${why}`)
  if (!caught) failed += 1
}

// 2) 모든 규칙에 대응하는 망가뜨리기 시험이 있어야 한다.
for (const r of rules) if (!covered.has(r.id)) { console.log(`✗ ${r.id} — 이 규칙을 시험하는 항목이 없습니다`); failed += 1 }

// 3) 모든 규칙이 어느 단계(게이트)에 속해 있어야 한다. 속하지 않은 규칙은 판정에 반영되지 않는다.
const inGate = new Set(GATES.flatMap((g) => g.rules))
for (const r of rules) if (!inGate.has(r.id)) { console.log(`✗ ${r.id} — 어느 단계에도 속하지 않습니다`); failed += 1 }

// 4) 멀쩡한 모델은 오류가 없어야 한다.
const clean = evaluate(clone(), { today: '2026-10-20' })
console.log(`${clean.errorCount === 0 ? '✓' : '✗'} 원본 모델은 오류 0건 (${clean.errorCount}건)`)
if (clean.errorCount !== 0) failed += 1

console.log(failed === 0 ? `\n하네스 자체 시험 통과 (${breakers.length}개 규칙 + 원본)` : `\n하네스 자체 시험 실패 ${failed}건`)
process.exit(failed === 0 ? 0 : 1)
