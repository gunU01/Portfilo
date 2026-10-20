// 모델 → 문서(.md). 사람이 읽는 문서는 모두 여기서 만들어집니다. 문서를 직접 고치지 말고 model/ 을 고치세요.
import { asArray, byId } from './lib.mjs'
import { evaluate, GATES } from './gates.mjs'

const NOTICE = '> 이 문서는 `model/` 의 데이터에서 자동으로 만들어집니다. 직접 고치지 말고 `model/` 을 고친 뒤 `npm run plan:build` 를 실행하세요.\n'

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>')
const table = (head, rows) => `| ${head.join(' | ')} |\n| ${head.map(() => '---').join(' | ')} |\n${rows.map((r) => `| ${r.map(esc).join(' | ')} |`).join('\n')}\n`
const bullets = (items) => items.map((i) => `- ${i}`).join('\n')

const EVIDENCE_LABEL = { verified: '원문 확인', secondhand: '2차 자료', unverified: '검색 요약만 봄', 'needs-data': '확인 자료 없음' }
const PROBLEM_LABEL = { hypothesis: '가설(검증 전)', validated: '검증됨', rejected: '기각', parked: '보류' }
const HYP_LABEL = { untested: '검증 전', supported: '지지됨', refuted: '기각됨' }
const EXP_LABEL = { planned: '계획', running: '진행 중', done: '완료' }
const DEC_LABEL = { proposed: '제안(승인 대기)', accepted: '확정', rejected: '기각' }
const BASIS_LABEL = { notion: '노션 기준', proposal: '제안(확인 필요)', owner: '문채원 확정' }
const KPI_BASIS = { benchmark: '벤치마크', assumption: '가정', tbd: '미정' }
const REL_LABEL = { mvp: 'MVP', next: '다음', later: '나중' }
const PRIO_LABEL = { must: '반드시', should: '가능하면', could: '여유가 되면' }
const LVL = { low: '낮음', mid: '중간', high: '높음' }
const TYPE_LABEL = { problem: '문제', solution: '해결', value: '가치' }
const METHOD_LABEL = { 'mom-test': '인터뷰(Mom Test)', concierge: '컨시어지', 'fake-door': '가짜 문(랜딩)', 'price-test': '가격 테스트', 'desk-research': '자료 조사' }

const evRef = (model, ids) => {
  const ev = byId(model, 'evidence')
  return asArray(ids).map((id) => `${id}(${EVIDENCE_LABEL[ev.get(id)?.status] ?? '?'})`).join(', ') || '-'
}

function overview(model) {
  const r = evaluate(model)
  const m = model.meta
  const mark = { fail: '실패', pending: '문서 통과 · 현장 확인 대기', pass: '통과' }
  return `# ${m.name}\n\n${NOTICE}\n${m.oneLiner}\n\n- **첫 대상**: ${m.segment}\n- **담당**: ${m.owner}\n- **시작**: ${m.startedAt}\n- **출처**: ${m.origin}\n- **범위**: ${m.scopeNote}\n\n## 지금 어디까지 왔나\n\n${table(['단계', '상태', '오류', '경고'], r.gates.map((g) => [`${g.id} ${g.title}`, mark[g.state], g.errors, g.warns]))}\n'문서 통과'는 항목 사이의 연결과 형식이 맞다는 뜻입니다. 문제가 실제로 있는지는 인터뷰와 실험 결과가 있어야 하며, 지금은 **직접 확인한 근거가 ${r.open.humanEvidenceCount}건**입니다. 그래서 모든 문제는 '가설' 상태입니다.\n\n## 문서 목록\n\n${bullets(['[문제 정의서](01-문제정의서.md)', '[가설과 검증 계획](02-가설과검증계획.md)', '[근거 장부](03-근거장부.md)', '[경쟁 분석](04-경쟁분석.md)', '[요구사항 명세서](05-요구사항명세서.md)', '[기능 명세서와 범위](06-기능명세서.md)', '[화면과 흐름](07-화면과흐름.md)', '[BM과 수익성](08-BM과수익성.md)', '[지표](09-지표.md)', '[위험](10-위험.md)', '[의사결정 로그](11-의사결정로그.md)', '[추적표](12-추적표.md)', '[현황 보고서](../reports/status.md)'])}\n`
}

function problemsDoc(model) {
  const blocks = model.problems.map((p) => `## ${p.id} ${p.statement}\n\n${table(['항목', '내용'], [['대상', p.who], ['상태', PROBLEM_LABEL[p.status]], ['겪는 불편', p.pain], ['지금 쓰는 대안', p.currentAlternative], ['근거', evRef(model, p.evidence)], ...(p.parkedReason ? [['보류 이유', p.parkedReason]] : [])])}`)
  return `# 문제 정의서\n\n${NOTICE}\n문제는 모두 **가설**입니다. 근거는 팀 노션 문서(2차 자료)이고, 사장님에게 직접 확인한 결과는 아직 없습니다.\n\n${blocks.join('\n')}`
}

function hypothesesDoc(model) {
  const hy = table(['ID', '문제', '종류', '가설', '재는 방법', '합격선', '합격선 출처', '상태'], model.hypotheses.map((h) => [h.id, h.problem, TYPE_LABEL[h.type], h.statement, h.metric, h.threshold, BASIS_LABEL[h.thresholdBasis], HYP_LABEL[h.status]]))
  const ex = model.experiments.map((t) => `### ${t.id} ${METHOD_LABEL[t.method]} — ${EXP_LABEL[t.status]}\n\n- **검증하는 가설**: ${asArray(t.hypotheses).join(', ')}\n- **표본 목표**: ${t.sampleTarget}\n- **방법**: ${t.design}\n- **합격 기준**: ${t.successCriteria}${t.result ? `\n- **결과**: ${t.result}` : ''}`)
  return `# 가설과 검증 계획\n\n${NOTICE}\n합격선의 출처: '노션 기준'은 팀 노션 문서의 값, '문채원 확정'은 문채원 님이 확인한 값, '제안(확인 필요)'은 아직 확인받지 않은 값입니다.\n\n## 가설\n\n${hy}\n## 실험(모두 아직 하지 않음)\n\n${ex.join('\n\n')}\n\n## 순서\n\n인터뷰(T-01)와 자료 조사(T-04, T-05)를 먼저 하고, 문제가 확인되면 컨시어지(T-02)와 랜딩(T-03)으로 간다(D-04).\n`
}

function evidenceDoc(model) {
  const counts = ['verified', 'secondhand', 'unverified', 'needs-data'].map((s) => `${EVIDENCE_LABEL[s]} ${model.evidence.filter((e) => e.status === s).length}건`).join(', ')
  const rows = model.evidence.map((e) => [e.id, e.claim, EVIDENCE_LABEL[e.status], e.ref.type === 'notion' || e.ref.type === 'url' ? e.ref.value : `${e.ref.type}: ${e.ref.value}`, e.checkedAt ?? '-', e.note ?? ''])
  return `# 근거 장부\n\n${NOTICE}\n${counts}\n\n상태 의미: **원문 확인**(원문을 열어 확인) · **2차 자료**(팀 노션 문서 등에서 가져옴) · **검색 요약만 봄**(원문 접속 실패) · **확인 자료 없음**.\n\n${table(['ID', '주장', '확인 상태', '출처', '확인일', '메모'], rows)}`
}

function competitorsDoc(model) {
  return `# 경쟁 분석\n\n${NOTICE}\n가격·기능은 팀 노션 문서 기준이고 원문을 다시 확인하지 않았습니다(근거 칸 참고).\n\n${table(['ID', '서비스', '분류', '방식', '가격', '비어 있는 자리', '근거'], model.competitors.map((c) => [c.id, c.name, c.category, c.model, c.price, c.gap, evRef(model, c.evidence)]))}\n## 읽은 것\n\n${bullets(['국내 서비스 대부분이 도구를 주고 사장님이 쓰기를 기대하는 방식이다(C-01~C-07).', '자동으로 콘텐츠를 만들어 주는 서비스는 국내외에 이미 있다(C-08~C-10). 문구 생성만으로는 차별점이 되기 어렵고, 실행까지 이어지게 하는 방식이 차별점이 될 수 있다는 것이 현재 가설이다(P-03).', '요금은 대부분 확인되지 않았다(E-10). 가격 포지셔닝은 확인 뒤에 한다.'])}`
}

function requirementsDoc(model) {
  const blocks = model.requirements.map((r) => `## ${r.id} ${r.statement}\n\n- **우선순위**: ${PRIO_LABEL[r.priority]}\n- **다루는 문제**: ${asArray(r.problems).join(', ')}\n- **구현 기능**: ${model.features.filter((f) => asArray(f.requirements).includes(r.id)).map((f) => `${f.id} ${f.name}(${REL_LABEL[f.release]})`).join(', ') || '-'}\n- **지표**: ${asArray(r.kpis).join(', ') || '-'}\n- **인수 기준**\n${asArray(r.acceptance).map((a) => `  - ${a}`).join('\n')}`)
  return `# 요구사항 명세서\n\n${NOTICE}\n${blocks.join('\n\n')}\n`
}

function featuresDoc(model) {
  const groups = ['mvp', 'next', 'later'].map((rel) => {
    const fs = model.features.filter((f) => f.release === rel)
    return `## ${REL_LABEL[rel]} (${fs.length}개)\n\n${table(['ID', '기능', '요구사항', '화면', '설명'], fs.map((f) => [f.id, f.name, asArray(f.requirements).join(', '), asArray(f.screens).join(', ') || '-', f.description]))}`
  })
  const max = model.meta.config.maxMvpFeatures
  return `# 기능 명세서와 범위\n\n${NOTICE}\nMVP 기능은 ${max}개를 넘지 않게 하네스가 막습니다(SCP-01). 무엇을 할지만큼 무엇을 하지 않을지가 중요합니다.\n\n${groups.join('\n')}\n## 하지 않는 것\n\n${table(['ID', '항목', '이유'], model.outOfScope.map((n) => [n.id, n.item, n.reason]))}`
}

function screensDoc(model) {
  const rows = table(['ID', '화면', '목적', '흐름', '기능'], model.screens.map((s) => [s.id, s.name, s.purpose, s.flow ?? '-', asArray(s.features).join(', ')]))
  return `# 화면과 흐름\n\n${NOTICE}\n${rows}\n## MVP 사용 흐름\n\n\`\`\`mermaid\nflowchart LR\n  A[가게 등록 S-01] --> B[오늘의 할 일 S-03]\n  B --> C[문구 만들기·수정 S-02]\n  C --> D[복사 또는 공유]\n  D --> E{게시 완료 표시}\n  B --> E\n  E --> F[완료·건너뜀 기록]\n  F --> G[주간 기록 S-04]\n\`\`\`\n`
}

export function sensitivity(model) {
  const p = Object.fromEntries(model.economics.params.map((x) => [x.key, x.value]))
  return [['churnLow', p.churnLow], ['churnMid', p.churnMid], ['churnHigh', p.churnHigh]].map(([key, churn]) => {
    const months = 1 / churn
    return { key, churn, months, revenue: Math.round(p.price * months) }
  })
}

function economicsDoc(model) {
  const params = table(['항목', '값', '출처', '메모'], model.economics.params.map((x) => [x.label, x.value == null ? '미정' : `${typeof x.value === 'number' && x.value < 1 ? `${x.value * 100}%` : x.value.toLocaleString('ko-KR')}${x.unit}`, { notion: '노션 기준', assumption: '검증 전 가정', verified: '확인됨' }[x.basis], x.note]))
  const s = sensitivity(model)
  const price = model.economics.params.find((x) => x.key === 'price').value
  const rows = table(['월 해지율', '평균 이용 기간', `이용자 1곳당 누적 매출(월 ${price.toLocaleString('ko-KR')}원)`], s.map((x) => [`${(x.churn * 100).toFixed(0)}%`, `${x.months.toFixed(1)}개월`, `${x.revenue.toLocaleString('ko-KR')}원`]))
  return `# BM과 수익성\n\n${NOTICE}\n이 문서의 숫자는 **예측이 아니라 가정이 맞을 때의 계산**입니다. 가격은 근거 없는 시안이고(D-05), 매출총이익률과 고객 획득 비용은 아직 정할 수 없습니다.\n\n## 입력값\n\n${params}\n## 민감도: 해지율에 따라 달라지는 매출\n\n${rows}\n- 누적 매출 = 월 이용료 × (1 ÷ 월 해지율). 매출총이익률을 곱하기 전의 값이라, 고객 획득 비용의 상한으로 쓰려면 이익률을 확정해야 합니다.\n- 해지율이 ${(s[0].churn * 100).toFixed(0)}%인지 ${(s[2].churn * 100).toFixed(0)}%인지에 따라 같은 가격에서 이용자 1곳의 누적 매출이 ${(s[0].months / s[2].months).toFixed(1)}배 차이 납니다. 가격보다 **실행이 이어지는가(K-02, K-03)**가 사업성을 더 크게 좌우합니다.\n\n## 가격 시안(노션 기획안, 확정 아님)\n\n${table(['플랜', '가격', '포함 내용'], [['무료', '0원', '월 4회 발행, SNS 1채널'], ['사장님', '월 19,000원', '무제한 발행, 3채널 연동, 홍보물 생성'], ['단골관리', '월 39,000원', '이탈 감지, 자동 쿠폰, 매출 진단 리포트']])}\n이 시안은 MVP 범위(D-03)와 맞지 않는 기능(연동, 홍보물, 이탈 감지)을 포함합니다. MVP 가격 구성은 T-02, T-03 결과를 본 뒤 다시 짭니다.\n`
}

function kpiDoc(model) {
  return `# 지표\n\n${NOTICE}\n${table(['ID', '지표', '정의', '목표', '목표의 기준', '근거', '가설'], model.kpis.map((k) => [k.id, k.name, k.definition, k.target, KPI_BASIS[k.targetBasis], evRef(model, k.evidence), asArray(k.hypotheses).join(', ') || '-']))}`
}

function risksDoc(model) {
  return `# 위험\n\n${NOTICE}\n${table(['ID', '위험', '가능성', '영향', '대응', '관련 가설', '근거'], model.risks.map((x) => [x.id, x.statement, LVL[x.likelihood], LVL[x.impact], x.mitigation, asArray(x.hypotheses).join(', ') || '-', evRef(model, x.evidence)]))}`
}

function decisionsDoc(model) {
  const blocks = model.decisions.map((d) => `## ${d.id} ${d.title} — ${DEC_LABEL[d.status]}\n\n- **배경**: ${d.context}\n- **선택지**\n${d.options.map((o) => `  - ${o.name}: 장점 ${o.pro} / 단점 ${o.con}`).join('\n')}\n- **상태**: ${DEC_LABEL[d.status]}${d.decidedBy ? ` (${d.decidedBy}, ${d.decidedAt})` : ''}\n- **선택**: ${d.choice}\n- **이유**: ${d.rationale}\n- **근거**: ${asArray(d.evidence).length ? evRef(model, d.evidence) : d.basis ?? '-'}`)
  return `# 의사결정 로그\n\n${NOTICE}\n'제안(승인 대기)'은 Claude 가 문서를 바탕으로 낸 제안입니다. 문채원 님이 \`model/decisions.mjs\` 에서 status 를 accepted 로 바꾸기 전에는 확정으로 쓰지 않습니다.\n\n${blocks.join('\n\n')}\n`
}

function traceDoc(model) {
  const rows = []
  for (const p of model.problems) {
    const hs = model.hypotheses.filter((h) => h.problem === p.id)
    const ts = [...new Set(model.experiments.filter((t) => hs.some((h) => asArray(t.hypotheses).includes(h.id))).map((t) => t.id))]
    const rs = model.requirements.filter((r) => asArray(r.problems).includes(p.id))
    const fs = [...new Set(model.features.filter((f) => rs.some((r) => asArray(f.requirements).includes(r.id))).map((f) => `${f.id}(${REL_LABEL[f.release]})`))]
    const ss = [...new Set(model.screens.filter((s) => model.features.some((f) => fs.some((x) => x.startsWith(f.id)) && asArray(s.features).includes(f.id))).map((s) => s.id))]
    const ks = [...new Set(rs.flatMap((r) => asArray(r.kpis)))]
    rows.push([`${p.id}(${PROBLEM_LABEL[p.status]})`, hs.map((h) => h.id).join(', ') || '-', ts.join(', ') || '-', rs.map((r) => r.id).join(', ') || '-', fs.join(', ') || '-', ss.join(', ') || '-', ks.join(', ') || '-'])
  }
  return `# 추적표\n\n${NOTICE}\n문제에서 출발해 가설, 실험, 요구사항, 기능, 화면, 지표까지 어떻게 이어지는지 보여 줍니다. 칸이 비어 있는 활성 문제는 하네스가 오류로 잡습니다(TRC-01, TRC-02).\n\n${table(['문제', '가설', '실험', '요구사항', '기능', '화면', '지표'], rows)}`
}

export function statusReport(model) {
  const r = evaluate(model)
  const o = r.open
  const mark = { fail: '실패', pending: '문서 통과 · 현장 확인 대기', pass: '통과' }
  const gate = table(['단계', '상태'], r.gates.map((g) => [`${g.id} ${g.title}`, mark[g.state]]))
  const steps = [
    [o.decisionsProposed.length > 0, '제안된 의사결정 검토', `${o.decisionsProposed.join(', ')} 를 읽고 accepted 또는 rejected 로 정한다`],
    [o.thresholdProposals.length > 0, '제안 상태 합격선 확인', `${o.thresholdProposals.join(', ')} 의 합격선(threshold)이 맞는지 정한다`],
    [true, '자료 조사 (T-04)', 'E-08, E-09, E-10, E-15 를 공식 원문·요금 페이지로 확인한다(E-09 는 기사와 보고서 표가 10배 다르다)'],
    [true, '인터뷰 경로 확보 (T-05)', '사장님 10명에게 닿을 경로 2개 이상을 정한다(A-01). 요청 메시지는 field/interview-guide.md 에 있다'],
    [true, '인터뷰 실행 (T-01)', '기록은 field/data/ 의 두 CSV 에 남기고 `npm run plan:tally` 로 집계한다. 집계 결과를 근거 장부에 kind: interview, n, date 와 함께 옮긴다'],
    [true, '컨시어지 (T-02), 랜딩 (T-03)', 'T-01 에서 문제가 확인된 뒤에 한다'],
  ].filter(([on]) => on)
  const todo = steps.map(([, a, b], i) => [String(i + 1), a, b])
  return `# 현황 보고서\n\n${NOTICE}\n## 단계\n\n${gate}\n## 규칙 결과\n\n규칙 ${r.ruleCount}개 · 오류 ${r.errorCount}건 · 경고 ${r.warnCount}건\n\n## 확인 상태\n\n${bullets([`근거: ${o.evidenceByStatus.map(([s, n]) => `${EVIDENCE_LABEL[s]} ${n}건`).join(', ')}`, `직접 확인한 인터뷰·설문·실험 근거: ${o.humanEvidenceCount}건`, `검증 전 문제 ${o.problemsUnvalidated.length}개 / 검증 전 가설 ${o.hypothesesUntested.length}개 / 끝나지 않은 실험 ${o.experimentsNotDone.length}개`, `열린 가정 ${o.assumptionsOpen.length}개: ${o.assumptionsOpen.join(', ')}`, `기준이 확정되지 않은 지표 목표: ${o.kpiTargetsOpen.join(', ')}`, `검증 전 수익 가정값: ${o.economicsAssumptions.join(', ')}`])}\n\n## 다음에 할 일(사람이 해야 하는 일)\n\n${table(['순서', '할 일', '내용'], todo)}`
}

export function renderAll(model) {
  return {
    'docs/00-개요.md': overview(model),
    'docs/01-문제정의서.md': problemsDoc(model),
    'docs/02-가설과검증계획.md': hypothesesDoc(model),
    'docs/03-근거장부.md': evidenceDoc(model),
    'docs/04-경쟁분석.md': competitorsDoc(model),
    'docs/05-요구사항명세서.md': requirementsDoc(model),
    'docs/06-기능명세서.md': featuresDoc(model),
    'docs/07-화면과흐름.md': screensDoc(model),
    'docs/08-BM과수익성.md': economicsDoc(model),
    'docs/09-지표.md': kpiDoc(model),
    'docs/10-위험.md': risksDoc(model),
    'docs/11-의사결정로그.md': decisionsDoc(model),
    'docs/12-추적표.md': traceDoc(model),
    'reports/status.md': statusReport(model),
  }
}

export { GATES }
