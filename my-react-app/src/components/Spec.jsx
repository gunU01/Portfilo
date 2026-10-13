import { profile } from '../data/profile.js'
import { githubId } from '../lib/format.js'

// 이름·직무·소속·GitHub 를 한눈에 보여 주는 카드. 홈과 소개 페이지에서 같이 씁니다.
export default function Spec() {
  const { contact } = profile
  const rows = [
    ['이름', profile.name],
    ['직무', profile.roleLine],
    ['소속', profile.school],
    contact.github && [
      'GitHub',
      <a href={contact.github} target="_blank" rel="noreferrer">
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
