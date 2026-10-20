// 근거 장부. status 는 '얼마나 확인했는가'를 정직하게 나타냅니다.
//   verified   : 원문(공식 자료·직접 조사)을 열어 확인함
//   secondhand : 팀 노션 문서처럼 2차 자료에서 가져옴(원문은 아직 보지 않음)
//   unverified : 검색 요약 등으로만 봤고 원문 접속에 실패함
//   needs-data : 주장은 있으나 확인 자료가 아직 없음
const NOTION = (id) => ({ type: 'notion', value: `https://app.notion.com/p/${id}` })
const SEARCH = (query, note) => ({ type: 'search', value: query, note })

export const evidence = [
  {
    id: 'E-01',
    kind: 'internal-doc',
    claim: '소상공인 단골관리·마케팅 서비스 7곳(토스플레이스, 캐시노트, 도도포인트, 당근 비즈프로필, 네이버 스마트플레이스, 카카오 채널, 스마트단골)의 기능·요금·약점 비교표와 미해결 니즈 정리',
    status: 'secondhand',
    ref: NOTION('3a50c4c8e4e4807780e5fd22e3bd6620'),
    checkedAt: '2026-10-20',
    note: '문서 안의 요금·사용자 수는 원문을 다시 확인하지 않았다. 사용자 불만 일부는 문서 스스로 직접 인용이 아니라고 밝힌다.',
  },
  {
    id: 'E-02',
    kind: 'internal-doc',
    claim: '국내외 사례 통합 분석: 도구 제공형에서 결과를 대신 만들어 주는 대행형으로 흐름이 바뀌고 있고, 자동 발행 비율이 50% 미만이면 대행 모델로 전환하라는 판단 기준을 제시',
    status: 'secondhand',
    ref: NOTION('3a50c4c8e4e48081b521e93f93de8894'),
    checkedAt: '2026-10-20',
    note: '문서 스스로 성과 수치가 자사 사례 기반이라 독립 검증되지 않았고, 시장 규모 수치는 방법론이 불투명하다고 밝힌다.',
  },
  {
    id: 'E-03',
    kind: 'internal-doc',
    claim: "'단골 관리와 마케팅'을 데이터 부재·활용 부재·시간 부족·역량과 심리·측정 불가로 쪼갠 문제 분해, 세그먼트별 차이, 하위 가설 5개, 행동 기반 질문 가이드, 위험 3가지",
    status: 'secondhand',
    ref: NOTION('3a30c4c8e4e480bfb00cc944a76181eb'),
    checkedAt: '2026-10-20',
    note: '가설과 질문 설계 문서이며 사장님 대상 조사 결과는 없다.',
  },
  {
    id: 'E-04',
    kind: 'internal-doc',
    claim: '서비스 기획안: 핵심 기능 6가지, 사용 흐름(등록 3분, 연동 1분), 가격 시안(무료 / 월 19,000원 / 월 39,000원), 경쟁사와의 차이 3가지',
    status: 'secondhand',
    ref: NOTION('3a50c4c8e4e4803d8f4cda5487e1df0d'),
    checkedAt: '2026-10-20',
    note: '가격은 근거 없는 시안이다(D-05).',
  },
  {
    id: 'E-05',
    kind: 'internal-doc',
    claim: '초기 서비스 검증 조사 틀: Mom Test 인터뷰, 가짜 문(Fake Door) 랜딩, Go/No-Go 합격선(SNS 반응률 3% 이상, 랜딩 전환율 10% 이상, 인터뷰 수락률 20% 이상)',
    status: 'secondhand',
    ref: NOTION('3450c4c8e4e4809cb3f1ef48fb9f03db'),
    checkedAt: '2026-10-20',
    note: '디자인 버전관리(VerDe) 주제용으로 쓴 틀을 가져온 것이다. 합격선 수치의 출처는 문서에 없다. 채널(X, Threads, LinkedIn)은 사장님 대상에는 맞지 않아 그대로 쓰지 않는다.',
  },
  {
    id: 'E-06',
    kind: 'source',
    claim: '소상공인 기업체 수는 2023년 596.1만 개에서 2024년 613.4만 개로 2.9% 늘었다(중소벤처기업부·소상공인시장진흥공단 실태조사 기준 보도)',
    status: 'unverified',
    ref: SEARCH('2024년 소상공인실태조사 결과', '검색 결과 요약으로만 확인. 원문 보도 페이지(fnnews) 접속은 2026-10-20에 실패(ENOTFOUND). 공식 보고서 원문을 확인해야 한다.'),
    checkedAt: '2026-10-20',
  },
  {
    id: 'E-07',
    kind: 'source',
    claim: '디지털·스마트 기술을 쓰는 소상공인은 27.2%(전년 대비 +9.2%p)이고, 활용 분야는 온라인 판로 49.0%, 매장관리 34.4% 순이다. 숙박·음식점업은 79.6만 개(13.0%)',
    status: 'unverified',
    ref: SEARCH('2024년 소상공인실태조사 결과 마케팅 온라인 홍보', '검색 결과 요약으로만 확인. 원문 접속 실패. 공식 보고서 원문 확인 필요.'),
    checkedAt: '2026-10-20',
  },
  {
    id: 'E-08',
    kind: 'source',
    claim: '음식점업 사업체 수는 2024년 561,637개(서비스업조사 기반 외식산업 통계표). 사업자 수(국세청 기준 약 82만 명, 2023년 말)와는 집계 기준이 달라 직접 비교할 수 없다',
    status: 'unverified',
    ref: SEARCH('음식점업 사업자 수 2024 통계청', '검색 결과 요약으로만 확인. 통계표 원문 확인 필요.'),
    checkedAt: '2026-10-20',
  },
  {
    id: 'E-09',
    kind: 'source',
    claim: '배달앱 입점업체의 월 평균 광고비는 약 107만 원(2024년 7월 보도). 배달앱 입점업체 조사이며 소상공인 전체나 홍보비 전반을 대표하지 않는다',
    status: 'unverified',
    ref: SEARCH('소상공인 마케팅 온라인 홍보 비용 음식점업', '검색 결과 요약으로만 확인. 보도 원문과 조사 방법 확인 필요.'),
    checkedAt: '2026-10-20',
  },
  {
    id: 'E-10',
    kind: 'source',
    claim: '경쟁 서비스의 요금 주장: 도도포인트 월 2~3만 원대(1~3년 약정), 스마트단골 월 70,000원·100,000원, 아이엔마케팅 월 49,000원',
    status: 'needs-data',
    ref: SEARCH('도도포인트 요금제 / 아이엔마케팅 월 49,000원', '2026-10-20 웹 검색으로 도도포인트·아이엔마케팅의 요금은 확인하지 못했다. 공식 요금 페이지나 상담으로 확인해야 한다.'),
    checkedAt: '2026-10-20',
  },
]
