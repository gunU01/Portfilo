import { useMemo } from 'react'
import Blocks from './Blocks.jsx'
import { useScrollSpy } from '../lib/useScrollSpy.js'
import { useChipFollow } from '../lib/useChipFollow.js'
import { scrollToId } from '../lib/dom.js'

// 프로젝트 케이스와 블로그 글이 함께 쓰는 본문: 왼쪽(모바일에서는 위) 목차와 섹션들. children 은 섹션 뒤에 이어 붙습니다(케이스의 근거 자료 등).
export default function DocBody({ sections, children }) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections])
  // 읽는 위치에 따라 목차 강조
  const active = useScrollSpy(ids, { rootMargin: '-18% 0px -72% 0px' })
  useChipFollow(active)

  return (
    <div className="wrap case__body">
      <nav className="toc" aria-label="이 페이지의 목차">
        {sections.map((s) => (
          <button key={s.id} type="button" aria-current={active === s.id} onClick={() => scrollToId(s.id)}>
            {s.title}
          </button>
        ))}
      </nav>

      <div>
        {sections.map((s) => (
          <section className="csec" id={s.id} key={s.id} aria-labelledby={`${s.id}-t`}>
            <h2 className="csec__title" id={`${s.id}-t`}>
              {s.title}
            </h2>
            <Blocks blocks={s.blocks} />
          </section>
        ))}
        {children}
      </div>
    </div>
  )
}
