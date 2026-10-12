// 책상 위 물건들과, 물건을 눌렀을 때 열리는 내용. 새 내용을 만들지 않고 기존 데이터(프로젝트, 기획 작업물, 수상, 프로필)를 모읍니다.
import { zones } from './world.js'
import { profile } from './profile.js'

const zone = (id) => zones.find((z) => z.id === id)
const links = (z) => z.items.map(({ title, sub, href }) => ({ title, sub, href }))

export const spots = [
  { id: 'laptop', label: '프로젝트', title: '프로젝트', items: links(zone('projects')) },
  { id: 'books', label: '기획물', title: '기획물', items: links(zone('planning')) },
  {
    id: 'notebook',
    label: '소개',
    title: '소개',
    paragraphs: [...profile.about.paragraphs, profile.school],
    itemsTitle: '수상',
    items: links(zone('awards')),
    links: [
      { label: '소개 페이지', href: '#/about' },
      { label: profile.contact.email, href: `mailto:${profile.contact.email}` },
      { label: 'GitHub', href: profile.contact.github },
    ],
  },
  { id: 'calendar', label: '활동기록', title: '활동기록', timeline: profile.about.timeline },
]
