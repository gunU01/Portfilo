// 기술·도구는 ‘얼마나 아는가’보다 ‘어디에 어떻게 썼는가’로 적습니다.
export const skillGroups = [
  {
    title: '기획·문서',
    items: [
      { name: '문제 정의 · 요구사항 명세', used: '문제 정의서와 요구사항 명세서(v0.1~)를 작성하고, 팀 피드백으로 세부 기능과 BM 설계를 보강' },
      { name: '기능 명세', used: '기능 ID 체계로 구조를 맞추고(F-GRO-005-002 형식), 액터·용어·삭제 기능을 정비하며 v1~v2를 작성' },
      { name: '유저 플로우 · IA', used: '유저 플로우 차트를 그리고 정보 구조를 재설계해 기능 명세와 맞춤' },
      { name: '경쟁·BM 분석', used: '토스·카카오뱅크·뱅크샐러드 등 8개 서비스를 그룹 정산·예산 관리 기준으로 비교' },
    ],
  },
  {
    title: '운영·검증',
    items: [
      { name: '스프린트 · MVP', used: '1차 스프린트 MVP를 설정하고 스프린트 일정과 역할 분담을 정리' },
      { name: '베타 테스트', used: '베타 체크리스트·참여 설문, 스토어 등록 정보 작성' },
    ],
  },
  {
    title: '도구',
    items: [
      { name: 'Notion', used: '문서 허브와 일정 스프린트 보드(보드·캘린더)를 운영' },
      { name: 'Figma', used: '화면 정의 검토와 포트폴리오 작업 지원' },
    ],
  },
  {
    title: '프론트엔드',
    items: [
      { name: 'React Native · Expo', used: '얼마 앱의 프론트엔드 스택(상태 관리 Zustand, 서버 상태 TanStack Query, 폼 React Hook Form + Zod)' },
    ],
  },
]
