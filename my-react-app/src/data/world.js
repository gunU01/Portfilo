// 3D 월드의 구역과 랜드마크. 새 내용을 만들지 않고 기존 데이터(cases·awards)에서 가져옵니다.
// 월드는 ‘읽기 모드(홈)’로 가는 입구일 뿐이므로, 본문은 항상 케이스 페이지에서 읽습니다.
import { cases } from './cases.js'
import { awards } from './awards.js'
import { eolma } from './eolma.js'
import { haemi } from './haemi.js'

const meta = (c, key) => c.meta.find(([k]) => k === key)?.[1] ?? ''

// 건물 모양: 얼마=동전과 영수증, 해미=집, 토스 BM 분석=오르는 막대(레일). 새 케이스는 기본 집 모양.
const SHAPE_BY_CASE = { howmuch: 'coins', haemi: 'house', 'value-chain': 'bars' }

// 수상 트로피 색: 결과 이름으로 메달 색을 정합니다. 모르는 결과는 기본색.
const MEDAL = {
  금상: { tint: '#f2c14e', scale: 1.2 },
  우수상: { tint: '#c9ced8', scale: 1.1 },
  동상: { tint: '#cd7f32', scale: 1 },
  장려상: { tint: '#3fb68b', scale: 0.9 },
}

export const zones = [
  {
    id: 'projects',
    name: '프로젝트',
    blurb: '목표·방식·결과로 읽는 케이스 3개',
    items: cases.map((c) => ({
      id: `case-${c.slug}`,
      title: c.title,
      sub: c.subtitle,
      href: `#/work/${c.slug}`,
      shape: SHAPE_BY_CASE[c.slug] ?? 'house',
    })),
  },
  {
    id: 'planning',
    name: '기획 작업물',
    blurb: '명세·분석처럼 팀이 바로 쓰는 문서',
    items: [
      { id: 'doc-eolma', title: '얼마 기획 문서', sub: meta(eolma, '산출물'), href: '#/work/howmuch?s=role', shape: 'sheets' },
      { id: 'doc-haemi', title: '해미 기획 문서', sub: meta(haemi, '산출물'), href: '#/work/haemi?s=role', shape: 'board' },
      {
        id: 'doc-toss',
        title: '토스 BM 분석',
        sub: '사업보고서(2025.12)로 읽은 무료 송금과 수익 구조',
        href: '#/work/value-chain?s=chain',
        shape: 'book',
      },
    ],
  },
  {
    id: 'awards',
    name: '수상',
    blurb: '대회와 공모전 결과',
    items: awards.map((a) => ({
      id: `award-${a.year}-${a.result}`,
      title: `${a.result} · ${a.title}`,
      sub: [a.year, a.org, a.note].filter(Boolean).join(' · '),
      href: '#/about?s=awards',
      shape: 'trophy',
      ...MEDAL[a.result],
    })),
  },
]
