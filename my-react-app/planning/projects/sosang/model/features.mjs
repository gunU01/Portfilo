export const features = [
  { id: 'F-01', name: '가게 등록', requirements: ['R-01', 'R-06', 'R-09'], release: 'mvp', screens: ['S-01'], description: '상호·대표 메뉴·특징 한 줄과 (선택) 연령대를 받아 가게 정보를 만든다. 이후 모든 문구와 할 일의 재료가 된다.' },
  { id: 'F-02', name: '홍보 문구 만들기', requirements: ['R-02'], release: 'mvp', screens: ['S-02'], description: '등록 정보만으로 채널별 문구를 만들고 사장님이 고친다.' },
  { id: 'F-03', name: '오늘의 할 일 1개', requirements: ['R-03'], release: 'mvp', screens: ['S-03'], description: '하루 한 번, 5분 안에 끝나는 할 일 한 개를 알려 준다.' },
  { id: 'F-04', name: '문구 복사·공유', requirements: ['R-05'], release: 'mvp', screens: ['S-02'], description: '만든 문구를 복사하거나 공유 화면으로 넘기고, 채널별 올리는 방법을 안내한다.' },
  { id: 'F-05', name: '실행 체크와 주간 수행률', requirements: ['R-04'], release: 'mvp', screens: ['S-03', 'S-04'], description: '완료·건너뜀과 건너뛴 이유를 기록하고 주간 수행률을 보여 준다. H-04 를 재는 데 꼭 필요하다.' },
  { id: 'F-06', name: '밈 쉬운말 설명', requirements: ['R-07'], release: 'next', screens: ['S-05'], description: 'H-05 가 지지될 때만 만든다.' },
  { id: 'F-07', name: 'SNS 원클릭 동시 발행', requirements: ['R-05'], release: 'next', screens: [], description: '채널 연동 가능 범위(A-04) 확인 뒤에 만든다.' },
  { id: 'F-08', name: '홍보 책자·전단 생성', requirements: ['R-10'], release: 'later', screens: [], description: '사장님이 요청할 때 만든다.' },
  { id: 'F-09', name: '단골 이탈 감지와 쿠폰', requirements: ['R-08'], release: 'later', screens: [], description: '손님 데이터를 어떻게 얻을지(N-02) 정해진 뒤에 다룬다.' },
  { id: 'F-10', name: '매출 진단 리포트', requirements: ['R-11'], release: 'later', screens: [], description: '데이터가 쌓인 뒤에 다룬다.' },
]
