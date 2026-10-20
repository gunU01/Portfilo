export const risks = [
  { id: 'X-01', statement: "문제는 진짜인데 돈은 내지 않는다. 소상공인 SaaS 는 객단가가 낮고 해지가 많다.", likelihood: 'high', impact: 'high', mitigation: '말이 아니라 행동(선결제·신청)으로 지불 의사를 확인한다(T-02, T-03). 확인되기 전에는 가격을 확정하지 않는다(D-05).', hypotheses: ['H-06'], evidence: ['E-03'] },
  { id: 'X-02', statement: '단골 관리 효과는 3~6개월 뒤에 나타나는데, 사장님이 한 달 안에 체감하지 못하면 해지한다.', likelihood: 'mid', impact: 'high', mitigation: '첫 2주 안에 눈에 보이는 기록(수행 기록, 올린 문구 수)을 만든다. 효과 지표와 활동 지표를 나눠 보여 준다.', hypotheses: ['H-04'], evidence: ['E-03', 'E-01'] },
  { id: 'X-03', statement: 'POS(토스, 캐시노트)와 플랫폼(네이버, 당근)이 이미 사장님 손 안에 있어 끼어들 자리가 좁다.', likelihood: 'mid', impact: 'mid', mitigation: '연동하거나 경쟁하지 않고, 기존 서비스가 비워 둔 실행 영역(오늘 할 일, 문구 완성)에 집중한다.', hypotheses: ['H-04'], evidence: ['E-03', 'E-01'] },
  { id: 'X-04', statement: '인스타그램·카카오 채널·스마트플레이스에 외부에서 게시를 올릴 수 있는 범위와 정책을 아직 확인하지 못했다.', likelihood: 'mid', impact: 'high', mitigation: 'MVP 는 복사·공유 방식으로 시작하고(D-06), 연동 범위는 T-04 에서 확인한 뒤 F-07 을 결정한다.', hypotheses: ['H-04'] },
  { id: 'X-05', statement: 'AI 가 만든 문구에 가게가 말하지 않은 가격·행사·효능이 들어가 사실과 달라질 수 있다.', likelihood: 'mid', impact: 'high', mitigation: '등록한 정보 밖의 사실은 쓰지 않도록 제한하고(R-02), 사장님이 직접 고친 뒤에만 복사·공유가 되게 한다.', hypotheses: ['H-04'] },
  { id: 'X-06', statement: "밈 쉬운말 설명이 핵심 차별점으로 적혀 있지만, 실제로 사장님이 원하는지는 확인된 바가 없다.", likelihood: 'mid', impact: 'mid', mitigation: 'MVP 에서 뺀다(D-03). T-01 과 T-02 에서 H-05 가 지지될 때만 F-06 을 만든다.', hypotheses: ['H-05'], evidence: ['E-02'] },
  { id: 'X-07', statement: '인터뷰할 사장님에게 닿지 못하거나, 아는 가게 위주로 모여 표본이 한쪽으로 치우친다.', likelihood: 'mid', impact: 'high', mitigation: '경로를 2개 이상 확보하고(T-05), 경로별 수락률을 기록해 치우침을 보고서에 밝힌다.', hypotheses: ['H-07'] },
  { id: 'X-08', statement: '학생 개인이 실제 유료 서비스를 운영할 때의 사업자 등록·약관·개인정보 책임을 아직 확인하지 않았다.', likelihood: 'mid', impact: 'high', mitigation: '이번 프로젝트는 출시가 아니라 기획과 검증까지로 한정한다(D-07). 출시를 검토하게 되면 먼저 확인한다.', hypotheses: ['H-06'] },
]
