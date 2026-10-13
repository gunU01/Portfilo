import { profile } from '../data/profile.js'
import { githubId } from '../lib/format.js'

const GITHUB_MARK =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'

// 이름·직무·소속·GitHub 를 한눈에 보여 주는 카드. 홈과 소개 페이지에서 같이 씁니다.
export default function Spec() {
  const { contact } = profile
  const rows = [
    ['이름', profile.name],
    ['직무', profile.roleLine],
    ['소속', profile.school],
    contact.github && [
      'GitHub',
      <a className="xlink ink" href={contact.github} target="_blank" rel="noreferrer">
        <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d={GITHUB_MARK} />
        </svg>
        @{githubId(contact.github)}
      </a>,
    ],
  ].filter(Boolean)

  return (
    <aside className="spec" aria-label="About me">
      <p className="spec__t">About me</p>
      <dl>
        {rows.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
