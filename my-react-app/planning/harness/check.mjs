// 사용법: node planning/harness/check.mjs [프로젝트] [--strict] [--quiet]
// 규칙을 모두 돌리고, 단계별 판정과 현장 확인이 남은 일을 보여 줍니다. 오류가 있으면 종료 코드 1.
import { evaluate } from './gates.mjs'
import { listProjects, loadModel } from './lib.mjs'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const quiet = args.includes('--quiet')
const name = args.find((a) => !a.startsWith('--')) ?? listProjects()[0]

const model = await loadModel(name)
const r = evaluate(model)

const MARK = { fail: '✗', pending: '◐', pass: '✓' }
const LABEL = { fail: '실패', pending: '문서 통과 · 현장 확인 대기', pass: '통과' }

console.log(`\n기획 하네스 — ${model.meta.name} (${name})\n`)
for (const g of r.gates) console.log(`  ${MARK[g.state]} ${g.id} ${g.title}  [${LABEL[g.state]}${g.errors ? ` · 오류 ${g.errors}` : ''}${g.warns ? ` · 경고 ${g.warns}` : ''}]`)

if (!quiet) {
  const shown = r.results.filter((x) => x.issues.length > 0)
  if (shown.length) console.log('\n발견된 문제')
  for (const x of shown) {
    console.log(`  ${x.level === 'error' ? '오류' : '경고'} ${x.id} ${x.title}`)
    for (const i of x.issues.slice(0, 12)) console.log(`      - ${i.at}: ${i.msg}`)
    if (x.issues.length > 12) console.log(`      … 외 ${x.issues.length - 12}건`)
  }
}

const o = r.open
console.log('\n현장 확인이 남은 일(사람이 해야 하는 일)')
console.log(`  - 끝나지 않은 실험 ${o.experimentsNotDone.length}개 / 아직 검증 안 된 가설 ${o.hypothesesUntested.length}개 / 검증 전 문제 ${o.problemsUnvalidated.length}개`)
console.log(`  - 근거 상태: ${o.evidenceByStatus.map(([s, n]) => `${s} ${n}`).join(', ')} (직접 확인한 인터뷰·설문·실험 근거 ${o.humanEvidenceCount}건)`)
console.log(`  - 승인 대기 의사결정 ${o.decisionsProposed.length}개 / 제안 상태 합격선 ${o.thresholdProposals.length}개 / 열린 가정 ${o.assumptionsOpen.length}개`)
console.log(`  - 기준이 확정되지 않은 지표 목표 ${o.kpiTargetsOpen.length}개 / 검증 전 수익 가정값 ${o.economicsAssumptions.length}개`)

console.log(`\n규칙 ${r.ruleCount}개 · 오류 ${r.errorCount}건 · 경고 ${r.warnCount}건\n`)
process.exit(r.errorCount > 0 || (strict && r.warnCount > 0) ? 1 : 0)
