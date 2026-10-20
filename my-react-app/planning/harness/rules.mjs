// 규칙 모음. 각 규칙은 모델을 받아 문제 목록(at: 어디, msg: 무엇이)을 돌려줍니다.
// level: error = 고쳐야 함(종료 코드 1), warn = 확인 필요, info = 참고.
import { ENTITIES, ID_PATTERN } from './schema.mjs'
import { allItems, asArray, byId, collectStrings, daysBetween } from './lib.mjs'

const isDone = (e) => e.status === 'done'
const active = (p) => p.status !== 'parked' && p.status !== 'rejected'
const empty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0)

export const rules = [
  {
    id: 'SCH-01',
    level: 'error',
    title: '필수 항목이 비어 있지 않고, 값이 허용 범위 안이며, ID 형식이 맞다',
    run(model) {
      const out = []
      for (const [kind, spec] of Object.entries(ENTITIES)) {
        const pattern = ID_PATTERN(spec.prefix)
        for (const item of model[kind] ?? []) {
          const at = `${item.id ?? '(ID 없음)'}`
          if (!item.id || !pattern.test(item.id)) out.push({ at, msg: `${spec.label} ID 는 ${spec.prefix}-00 형식이어야 합니다` })
          for (const f of spec.required) if (empty(item[f]) && item[f] !== 0) out.push({ at, msg: `필수 항목 '${f}' 이(가) 비어 있습니다` })
          for (const [f, allowed] of Object.entries(spec.enums)) if (item[f] != null && !allowed.includes(item[f])) out.push({ at, msg: `'${f}' 값 '${item[f]}' 은(는) 허용되지 않습니다 (${allowed.join(' | ')})` })
        }
      }
      return out
    },
  },
  {
    id: 'SCH-02',
    level: 'error',
    title: 'ID 가 중복되지 않는다',
    run(model) {
      const seen = new Map()
      const out = []
      for (const { item } of allItems(model)) {
        if (!item.id) continue
        if (seen.has(item.id)) out.push({ at: item.id, msg: 'ID 가 중복됩니다' })
        seen.set(item.id, true)
      }
      return out
    },
  },
  {
    id: 'REF-01',
    level: 'error',
    title: '다른 항목을 가리키는 모든 연결이 실제 항목에 닿는다',
    run(model) {
      const out = []
      for (const [kind, spec] of Object.entries(ENTITIES)) {
        for (const item of model[kind] ?? []) {
          for (const [field, target] of Object.entries(spec.refs)) {
            const ids = byId(model, target)
            for (const ref of asArray(item[field])) if (!ids.has(ref)) out.push({ at: item.id, msg: `${field} 가 가리키는 ${ref} 가 없습니다` })
          }
        }
      }
      return out
    },
  },
  {
    id: 'TRC-01',
    level: 'error',
    title: '진행 중인 문제마다 검증할 가설이 있다',
    run(model) {
      return model.problems.filter(active).filter((p) => !model.hypotheses.some((h) => h.problem === p.id)).map((p) => ({ at: p.id, msg: '이 문제를 검증하는 가설이 없습니다' }))
    },
  },
  {
    id: 'TRC-02',
    level: 'error',
    title: '진행 중인 문제마다 그것을 풀겠다는 요구사항이 있다',
    run(model) {
      return model.problems.filter(active).filter((p) => !model.requirements.some((r) => asArray(r.problems).includes(p.id))).map((p) => ({ at: p.id, msg: '이 문제를 다루는 요구사항이 없습니다' }))
    },
  },
  {
    id: 'TRC-03',
    level: 'error',
    title: 'must·should 요구사항은 구현하는 기능이 하나 이상 있다',
    run(model) {
      return model.requirements
        .filter((r) => r.priority !== 'could')
        .filter((r) => !model.features.some((f) => asArray(f.requirements).includes(r.id)))
        .map((r) => ({ at: r.id, msg: `${r.priority} 요구사항인데 이를 구현하는 기능이 없습니다` }))
    },
  },
  {
    id: 'TRC-04',
    level: 'error',
    title: 'MVP 기능은 must·should 요구사항에서 나온다(could 만 근거인 기능은 MVP 에 넣지 않는다)',
    run(model) {
      const reqs = byId(model, 'requirements')
      return model.features
        .filter((f) => f.release === 'mvp')
        .filter((f) => !asArray(f.requirements).some((id) => reqs.get(id) && reqs.get(id).priority !== 'could'))
        .map((f) => ({ at: f.id, msg: 'MVP 기능인데 근거 요구사항이 모두 could 입니다' }))
    },
  },
  {
    id: 'TRC-05',
    level: 'error',
    title: 'MVP 기능은 화면이 하나 이상 있고, 기능과 화면의 연결이 양쪽에서 일치한다',
    run(model) {
      const out = []
      for (const f of model.features) {
        const viaScreens = model.screens.filter((s) => asArray(s.features).includes(f.id)).map((s) => s.id)
        if (f.release === 'mvp' && viaScreens.length === 0) out.push({ at: f.id, msg: 'MVP 기능인데 이를 보여 주는 화면이 없습니다' })
        for (const sid of asArray(f.screens)) if (!viaScreens.includes(sid)) out.push({ at: f.id, msg: `${sid} 를 화면으로 적었지만 ${sid} 쪽에는 이 기능이 없습니다` })
      }
      return out
    },
  },
  {
    id: 'TRC-06',
    level: 'error',
    title: '가설마다 검증 실험이 하나 이상 있다',
    run(model) {
      return model.hypotheses.filter((h) => !model.experiments.some((t) => asArray(t.hypotheses).includes(h.id))).map((h) => ({ at: h.id, msg: '이 가설을 검증하는 실험이 없습니다' }))
    },
  },
  {
    id: 'TRC-07',
    level: 'error',
    title: 'must 요구사항마다 성과를 재는 지표가 있다',
    run(model) {
      return model.requirements.filter((r) => r.priority === 'must' && empty(r.kpis)).map((r) => ({ at: r.id, msg: 'must 요구사항인데 지표가 연결되어 있지 않습니다' }))
    },
  },
  {
    id: 'TRC-08',
    level: 'warn',
    title: '어디에도 연결되지 않은 지표가 없다',
    run(model) {
      return model.kpis
        .filter((k) => empty(k.hypotheses) && !model.requirements.some((r) => asArray(r.kpis).includes(k.id)))
        .map((k) => ({ at: k.id, msg: '가설에도 요구사항에도 연결되지 않은 지표입니다' }))
    },
  },
  {
    id: 'ACC-01',
    level: 'warn',
    title: '요구사항의 인수 기준이 막연한 표현(쉽게, 빠르게, 적절히 등) 없이 관찰 가능한 문장이다',
    run(model) {
      const vague = model.meta.config.vagueWords
      // '등' 은 '등록' 같은 낱말 안에서 걸리지 않도록 홀로 쓰인 경우만 막연한 표현으로 봅니다.
      const standalone = /(^|[\s,·])등([\s,.)]|$)/
      const out = []
      for (const r of model.requirements) {
        for (const a of asArray(r.acceptance)) {
          const hit = vague.find((w) => a.includes(w))
          if (hit) out.push({ at: r.id, msg: `막연한 표현 '${hit}': "${a}"` })
          if (standalone.test(a)) out.push({ at: r.id, msg: `'등' 으로 뭉뚱그리지 말고 항목을 적으세요: "${a}"` })
          if (!/다\.?(\([^)]*\))?$/.test(a.trim())) out.push({ at: r.id, msg: `서술형(…한다/…있다)으로 끝나지 않습니다: "${a}"` })
        }
        if (asArray(r.acceptance).length === 0) out.push({ at: r.id, msg: '인수 기준이 없습니다' })
      }
      return out
    },
  },
  {
    id: 'EVD-01',
    level: 'error',
    title: "'verified' 근거는 출처(url·노션)와 확인일이 있다",
    run(model) {
      return model.evidence
        .filter((e) => e.status === 'verified')
        .filter((e) => !(e.ref && ['url', 'notion'].includes(e.ref.type) && e.ref.value) || !e.checkedAt)
        .map((e) => ({ at: e.id, msg: 'verified 인데 출처 또는 checkedAt 이 없습니다' }))
    },
  },
  {
    id: 'EVD-02',
    level: 'error',
    title: '사람에게 직접 확인한 근거(인터뷰·설문·실험)는 표본 수와 날짜가 있다',
    run(model) {
      return model.evidence
        .filter((e) => ['interview', 'survey', 'experiment'].includes(e.kind))
        .filter((e) => !(Number.isFinite(e.n) && e.n > 0) || !e.date)
        .map((e) => ({ at: e.id, msg: `${e.kind} 근거에는 n(표본 수)와 date 가 필요합니다` }))
    },
  },
  {
    id: 'EVD-03',
    level: 'error',
    title: "'validated' 문제와 'supported' 가설은 현장에서 직접 얻은 근거가 뒷받침한다",
    run(model) {
      const out = []
      const ev = byId(model, 'evidence')
      for (const p of model.problems.filter((x) => x.status === 'validated')) {
        const ok = asArray(p.evidence).some((id) => ev.get(id) && ['interview', 'survey', 'experiment'].includes(ev.get(id).kind) && ev.get(id).status === 'verified')
        if (!ok) out.push({ at: p.id, msg: 'validated 인데 verified 상태의 인터뷰·설문·실험 근거가 없습니다(2차 자료만으로는 검증되었다고 쓰지 않습니다)' })
      }
      for (const h of model.hypotheses.filter((x) => x.status === 'supported' || x.status === 'refuted')) {
        const done = model.experiments.some((t) => asArray(t.hypotheses).includes(h.id) && isDone(t))
        if (!done) out.push({ at: h.id, msg: `${h.status} 인데 끝난(done) 실험이 없습니다` })
      }
      return out
    },
  },
  {
    id: 'EVD-04',
    level: 'error',
    title: '벤치마크로 잡은 지표 목표는 근거를 인용한다',
    run(model) {
      return model.kpis.filter((k) => k.targetBasis === 'benchmark' && empty(k.evidence)).map((k) => ({ at: k.id, msg: 'targetBasis 가 benchmark 인데 evidence 가 없습니다' }))
    },
  },
  {
    id: 'EVD-05',
    level: 'warn',
    title: '확인한 지 오래된 근거가 없다',
    run(model, ctx) {
      const limit = model.meta.config.freshnessDays
      return model.evidence
        .filter((e) => e.checkedAt && daysBetween(e.checkedAt, ctx.today) > limit)
        .map((e) => ({ at: e.id, msg: `확인한 지 ${daysBetween(e.checkedAt, ctx.today)}일 지났습니다(기준 ${limit}일)` }))
    },
  },
  {
    id: 'EVD-06',
    level: 'warn',
    title: '확정(accepted)된 의사결정은 근거를 달거나 판단 근거를 밝힌다',
    run(model) {
      return model.decisions.filter((d) => d.status === 'accepted' && empty(d.evidence) && !d.basis).map((d) => ({ at: d.id, msg: 'accepted 인데 evidence 도 basis(판단 근거)도 없습니다' }))
    },
  },
  {
    id: 'EVD-07',
    level: 'error',
    title: '경쟁 서비스의 가격·기능 주장은 근거를 단다',
    run(model) {
      return model.competitors.filter((c) => empty(c.evidence)).map((c) => ({ at: c.id, msg: '근거가 없습니다' }))
    },
  },
  {
    id: 'SCP-01',
    level: 'error',
    title: 'MVP 기능 수가 한도를 넘지 않는다',
    run(model) {
      const max = model.meta.config.maxMvpFeatures
      const n = model.features.filter((f) => f.release === 'mvp').length
      return n > max ? [{ at: 'features', msg: `MVP 기능이 ${n}개입니다(한도 ${max}개). 무엇을 뺄지 정하세요` }] : []
    },
  },
  {
    id: 'SCP-02',
    level: 'error',
    title: "'하지 않는 것'이 최소 개수 이상 적혀 있다",
    run(model) {
      const min = model.meta.config.minOutOfScope
      const n = model.outOfScope.length
      return n < min ? [{ at: 'outOfScope', msg: `하지 않는 것이 ${n}개입니다(최소 ${min}개)` }] : []
    },
  },
  {
    id: 'ECO-01',
    level: 'error',
    title: '수익성 계산의 모든 입력값에 출처(기준)가 적혀 있고, 검증 전 값은 가정으로 표시한다',
    run(model) {
      const out = []
      const params = model.economics?.params ?? []
      if (params.length === 0) out.push({ at: 'economics', msg: '수익성 입력값이 없습니다' })
      for (const p of params) {
        if (!['assumption', 'notion', 'verified'].includes(p.basis)) out.push({ at: `economics.${p.key}`, msg: `basis 가 없거나 잘못되었습니다(${p.basis})` })
        if (p.basis === 'verified' && !p.evidence) out.push({ at: `economics.${p.key}`, msg: 'verified 인데 evidence 가 없습니다' })
      }
      return out
    },
  },
  {
    id: 'LNT-01',
    level: 'warn',
    title: '근거 없이 과장하는 표현을 쓰지 않는다',
    run(model) {
      const banned = model.meta.config.bannedWords
      const out = []
      for (const { kind, item } of allItems(model)) {
        for (const { path, text } of collectStrings(item)) for (const w of banned) if (text.includes(w)) out.push({ at: `${item.id ?? kind}.${path}`, msg: `'${w}' 표현은 근거와 함께 쓰거나 구체적으로 바꾸세요` })
      }
      return out
    },
  },
]
