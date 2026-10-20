// 검사 실행과 단계(게이트) 판정.
// 문서 안의 연결·일관성은 기계가 검사할 수 있지만, '이 문제가 실제로 있다'는 현장(인터뷰·실험)에서만 확인됩니다.
// 그래서 각 단계는 fail(문서 오류) / pending(문서는 통과, 현장 확인 대기) / pass 세 가지로 나눠 보여 줍니다.
import { rules } from './rules.mjs'
import { asArray, today } from './lib.mjs'

const humanKinds = ['interview', 'survey', 'experiment']

export const GATES = [
  { id: 'G1', title: '프레임: 항목 형식과 연결이 맞다', rules: ['SCH-01', 'SCH-02', 'REF-01'] },
  { id: 'G2', title: '근거: 출처가 있고 확인 상태가 정직하다', rules: ['EVD-01', 'EVD-02', 'EVD-05', 'EVD-07'] },
  { id: 'G3', title: '해결안: 문제 → 요구사항 → 기능 → 화면이 끊김 없이 이어진다', rules: ['TRC-01', 'TRC-02', 'TRC-03', 'TRC-04', 'TRC-05', 'TRC-07', 'TRC-08', 'ACC-01'] },
  { id: 'G4', title: '사업성: 수익 가정과 지표 목표에 기준이 있다', rules: ['ECO-01', 'EVD-04', 'EVD-06'] },
  { id: 'G5', title: '검증 설계: 모든 가설에 실험과 합격선이 있다', rules: ['TRC-06', 'EVD-03'] },
  { id: 'G6', title: '범위: MVP 가 한도 안이고, 하지 않는 것이 적혀 있다', rules: ['SCP-01', 'SCP-02', 'LNT-01'] },
]

// 현장 확인이 아직 필요한 항목(사람이 해야 하는 일).
export function openItems(model) {
  const ev = model.evidence
  const humanVerified = ev.filter((e) => humanKinds.includes(e.kind) && e.status === 'verified')
  return {
    experimentsNotDone: model.experiments.filter((t) => t.status !== 'done').map((t) => t.id),
    hypothesesUntested: model.hypotheses.filter((h) => h.status === 'untested').map((h) => h.id),
    problemsUnvalidated: model.problems.filter((p) => p.status === 'hypothesis').map((p) => p.id),
    evidenceByStatus: ['verified', 'secondhand', 'unverified', 'needs-data'].map((s) => [s, ev.filter((e) => e.status === s).length]),
    humanEvidenceCount: humanVerified.length,
    decisionsProposed: model.decisions.filter((d) => d.status === 'proposed').map((d) => d.id),
    thresholdProposals: model.hypotheses.filter((h) => h.thresholdBasis === 'proposal').map((h) => h.id),
    assumptionsOpen: model.assumptions.filter((a) => a.status === 'open').map((a) => a.id),
    kpiTargetsOpen: model.kpis.filter((k) => k.targetBasis !== 'benchmark').map((k) => k.id),
    economicsAssumptions: (model.economics?.params ?? []).filter((p) => p.basis === 'assumption').map((p) => p.key),
  }
}

// 단계별로 '문서는 통과했지만 현장 확인이 남았는가'를 판정하는 조건.
const pendingWhen = {
  G1: () => false,
  G2: (o) => o.humanEvidenceCount === 0,
  G3: () => false,
  G4: (o) => o.kpiTargetsOpen.length > 0 || o.economicsAssumptions.length > 0,
  G5: (o) => o.experimentsNotDone.length > 0,
  G6: (o) => o.decisionsProposed.length > 0,
}

export function evaluate(model, ctx = { today: today() }) {
  const results = rules.map((r) => ({ id: r.id, level: r.level, title: r.title, issues: r.run(model, ctx) }))
  const byRule = new Map(results.map((r) => [r.id, r]))
  const open = openItems(model)
  const gates = GATES.map((g) => {
    const rs = g.rules.map((id) => byRule.get(id))
    const errors = rs.filter((r) => r.level === 'error').reduce((n, r) => n + r.issues.length, 0)
    const warns = rs.filter((r) => r.level === 'warn').reduce((n, r) => n + r.issues.length, 0)
    const state = errors > 0 ? 'fail' : pendingWhen[g.id](open) ? 'pending' : 'pass'
    return { ...g, errors, warns, state }
  })
  const errorCount = results.filter((r) => r.level === 'error').reduce((n, r) => n + r.issues.length, 0)
  const warnCount = results.filter((r) => r.level === 'warn').reduce((n, r) => n + r.issues.length, 0)
  return { results, gates, open, errorCount, warnCount, ruleCount: rules.length, usedRuleIds: asArray(GATES.flatMap((g) => g.rules)) }
}
