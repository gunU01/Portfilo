// 책상 위 물건들과, 물건을 눌렀을 때 열리는 내용. 새 내용을 만들지 않고 기존 데이터(프로젝트, 기획 작업물, 수상, 대회, 프로필)를 모읍니다.
import { cases } from './cases.js'
import { awards } from './awards.js'
import { contests } from './contests.js'
import { profile } from './profile.js'
import { eolma } from './eolma.js'
import { haemi } from './haemi.js'
import { sosang } from './sosang.js'

const meta = (c, key) => c.meta.find(([k]) => k === key)?.[1] ?? ''

const projects = cases.map((c) => ({ title: c.title, sub: c.subtitle, href: `#/work/${c.slug}` }))

const planning = [
  { title: '얼마 기획 문서', sub: meta(eolma, '산출물'), href: '#/work/howmuch?s=role' },
  { title: '해미 기획 문서', sub: meta(haemi, '산출물'), href: haemi.links[0].href },
  { title: '동네 사장님 5분 홍보 기획', sub: sosang.subtitle, href: `#/work/${sosang.slug}` },
  { title: '토스 BM 분석', sub: '무료 송금 위에 쌓인 수익 구조와 성장의 구성', href: '#/work/value-chain' },
]

const awardItems = awards.map((a) => ({
  title: `${a.result} · ${a.title}`,
  sub: [a.year, a.org, a.note].filter(Boolean).join(' · '),
  href: '#/about?s=awards',
}))

// id 는 DeskScene 의 핫스팟 id 와 같습니다. title 이 핫스팟의 이름표와 패널 제목을 겸합니다.
export const spots = [
  { id: 'laptop', title: '프로젝트', items: projects },
  { id: 'books', title: '기획물', items: planning },
  {
    id: 'notebook',
    title: '소개',
    paragraphs: profile.about.paragraphs,
    links: [{ label: '소개 페이지에서 더 보기', href: '#/about' }],
  },
  { id: 'calendar', title: '활동기록', timeline: profile.about.timeline },
  { id: 'frames', title: '수상', items: awardItems },
  { id: 'drawerL', title: '대회 참가', timeline: contests.map((c) => ({ when: c.when, text: c.title })) },
  {
    id: 'drawerR',
    title: '학력과 연락',
    paragraphs: [profile.school],
    links: [
      { label: profile.contact.email, href: `mailto:${profile.contact.email}` },
      { label: 'GitHub', href: profile.contact.github },
    ],
  },
]

// 핫스팟 id → 이름. 장면의 이름표와 접근성 라벨이 같은 값을 씁니다.
export const titles = Object.fromEntries(spots.map(({ id, title }) => [id, title]))
