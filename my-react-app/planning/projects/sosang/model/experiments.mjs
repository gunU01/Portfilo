// 모두 계획 단계입니다. 결과가 나오면 status 를 done 으로 바꾸고 result 와 근거(evidence.mjs, kind: interview 등, n 과 date 포함)를 함께 적습니다.
export const experiments = [
  {
    id: 'T-01',
    hypotheses: ['H-01', 'H-02', 'H-03', 'H-05', 'H-07'],
    method: 'mom-test',
    design:
      "요식업 사장님 10명을 30분씩 인터뷰한다. 의견이 아니라 과거 행동을 묻는다: '지난 한 달 홍보를 위해 실제로 한 일(무엇을, 몇 번)', '단골을 몇 명 기억하고 오지 않으면 알아차리는가', '지금 홍보에 쓰는 돈(배달앱 광고비, 체험단 포함)', '무료 도구를 만들었다가 방치한 경험과 이유', '알림을 가장 잘 보는 채널'. 밈 설명 화면 예시를 보여 주고 이해와 사용 의사를 확인한다. 요청한 수와 수락한 수를 함께 기록한다.",
    sampleTarget: 10,
    successCriteria: 'H-01, H-02, H-03, H-05, H-07 각각의 합격선 충족 여부를 판정한다',
    status: 'planned',
  },
  {
    id: 'T-02',
    hypotheses: ['H-04', 'H-05', 'H-06'],
    method: 'concierge',
    design:
      "가게 5곳에 2주 동안 서비스를 사람이 대신 수행한다. 매일 정해진 시간에 카카오톡으로 '오늘 할 일 1개'와 직접 쓴 홍보 문구를 보내고, 완료·건너뜀과 건너뛴 이유를 기록한다. 2주 뒤 유료 전환 의사를 '지금 시작하시겠어요'로 묻고 행동(입금·신청)만 센다.",
    sampleTarget: 5,
    successCriteria: '주간 수행률 50% 이상(H-04), 유료 전환 행동 2곳 이상(H-06), 밈 설명 사용 2곳 이상(H-05)',
    status: 'planned',
  },
  {
    id: 'T-03',
    hypotheses: ['H-06'],
    method: 'fake-door',
    design:
      "사전 신청 랜딩 페이지 한 장을 만든다. 서비스가 무엇을 대신 해 주는지 한 문장으로 쓰고, 신청 버튼과 가격 안(D-05)을 보여 준다. 방문자 수와 신청 수를 센다. 아직 없는 기능을 있는 것처럼 쓰지 않는다(신청자에게 시범 서비스임을 밝힌다).",
    sampleTarget: 100,
    successCriteria: '방문 100명 이상에서 사전 신청 전환율 10% 이상',
    status: 'planned',
  },
  {
    id: 'T-04',
    hypotheses: ['H-06'],
    method: 'desk-research',
    design:
      '경쟁 서비스의 요금과 기능을 공식 페이지·상담으로 직접 확인해 E-10을 verified 로 바꾼다. 인스타그램·카카오 채널·스마트플레이스에 외부에서 게시를 올릴 수 있는 범위와 정책을 확인해 A-04를 닫는다. 소상공인 실태조사 원문으로 E-06~E-09 를 확인한다.',
    sampleTarget: 1,
    successCriteria: 'E-06~E-10 이 verified 가 되거나, 확인 불가 사유가 기록된다',
    status: 'planned',
  },
  {
    id: 'T-05',
    hypotheses: ['H-07'],
    method: 'desk-research',
    design:
      "사장님에게 닿는 경로를 정한다: 동네 가게 직접 방문, 지인 소개, 사장님 커뮤니티. 채널마다 인터뷰 요청 수와 수락 수를 기록한다. 가져온 틀(E-05)의 X·Threads·LinkedIn 채널은 사장님 대상에 맞지 않으므로 쓰지 않는다.",
    sampleTarget: 3,
    successCriteria: '인터뷰 10명을 모을 수 있는 경로 2개 이상 확보',
    status: 'planned',
  },
]
