// 기획 모델의 뼈대: 어떤 종류의 항목이 있고, 각 항목에 무엇이 반드시 있어야 하는지를 정의합니다.
// 기획 내용은 projects/<이름>/model/ 아래 데이터로만 적고, 문서(.md)는 거기서 만들어 냅니다(build.mjs).
// 그래서 문서끼리 어긋나는 일이 없고, 규칙(rules.mjs)이 연결 관계를 기계적으로 검사할 수 있습니다.

export const STATUS = {
  evidence: ['verified', 'secondhand', 'unverified', 'needs-data'],
  problem: ['hypothesis', 'validated', 'rejected', 'parked'],
  hypothesis: ['untested', 'supported', 'refuted'],
  experiment: ['planned', 'running', 'done'],
  decision: ['proposed', 'accepted', 'rejected'],
  assumption: ['open', 'closed'],
}

// 항목 종류. prefix 는 ID 접두사, refs 는 다른 항목을 가리키는 필드(대상 종류), enums 는 허용 값.
export const ENTITIES = {
  evidence: {
    prefix: 'E',
    label: '근거',
    required: ['claim', 'kind', 'status', 'ref'],
    enums: { status: STATUS.evidence, kind: ['source', 'internal-doc', 'interview', 'survey', 'experiment', 'assumption'] },
    refs: {},
  },
  problems: {
    prefix: 'P',
    label: '문제',
    required: ['statement', 'who', 'status', 'evidence'],
    enums: { status: STATUS.problem },
    refs: { evidence: 'evidence' },
  },
  hypotheses: {
    prefix: 'H',
    label: '가설',
    required: ['problem', 'type', 'statement', 'metric', 'threshold', 'thresholdBasis', 'status'],
    enums: { type: ['problem', 'solution', 'value'], thresholdBasis: ['notion', 'proposal', 'owner'], status: STATUS.hypothesis },
    refs: { problem: 'problems' },
  },
  experiments: {
    prefix: 'T',
    label: '실험',
    required: ['hypotheses', 'method', 'design', 'sampleTarget', 'successCriteria', 'status'],
    enums: { method: ['mom-test', 'concierge', 'fake-door', 'price-test', 'desk-research'], status: STATUS.experiment },
    refs: { hypotheses: 'hypotheses' },
  },
  requirements: {
    prefix: 'R',
    label: '요구사항',
    required: ['problems', 'statement', 'priority', 'acceptance'],
    enums: { priority: ['must', 'should', 'could'] },
    refs: { problems: 'problems', kpis: 'kpis' },
  },
  features: {
    prefix: 'F',
    label: '기능',
    required: ['name', 'requirements', 'release', 'description'],
    enums: { release: ['mvp', 'next', 'later'] },
    refs: { requirements: 'requirements', screens: 'screens' },
  },
  screens: {
    prefix: 'S',
    label: '화면',
    required: ['name', 'features', 'purpose'],
    enums: {},
    refs: { features: 'features' },
  },
  kpis: {
    prefix: 'K',
    label: '지표',
    required: ['name', 'definition', 'target', 'targetBasis'],
    enums: { targetBasis: ['benchmark', 'assumption', 'tbd'] },
    refs: { evidence: 'evidence', hypotheses: 'hypotheses' },
  },
  risks: {
    prefix: 'X',
    label: '위험',
    required: ['statement', 'likelihood', 'impact', 'mitigation'],
    enums: { likelihood: ['low', 'mid', 'high'], impact: ['low', 'mid', 'high'] },
    refs: { hypotheses: 'hypotheses', evidence: 'evidence' },
  },
  decisions: {
    prefix: 'D',
    label: '의사결정',
    required: ['title', 'status', 'context', 'options', 'choice', 'rationale'],
    enums: { status: STATUS.decision },
    refs: { evidence: 'evidence' },
  },
  assumptions: {
    prefix: 'A',
    label: '가정',
    required: ['statement', 'riskIfWrong', 'test', 'status'],
    enums: { status: STATUS.assumption },
    refs: { test: 'experiments' },
  },
  competitors: {
    prefix: 'C',
    label: '경쟁 서비스',
    required: ['name', 'category', 'model', 'price', 'gap', 'evidence'],
    enums: {},
    refs: { evidence: 'evidence' },
  },
  outOfScope: {
    prefix: 'N',
    label: '하지 않는 것',
    required: ['item', 'reason'],
    enums: {},
    refs: {},
  },
}

export const ID_PATTERN = (prefix) => new RegExp(`^${prefix}-\\d{2,3}$`)
