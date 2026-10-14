import { useEffect, useState } from 'react'
import { profile } from '../data/profile.js'
import { githubId, formatPhone } from '../lib/format.js'

// 모든 페이지 하단: 연락처. 값이 비어 있는 연락처는 자동으로 숨깁니다.
export default function Footer() {
  const { contact } = profile
  const [copied, setCopied] = useState(null) // 방금 복사한 줄의 이름. 잠시 뒤 사라집니다.

  useEffect(() => {
    if (!copied) return undefined
    const id = setTimeout(() => setCopied(null), 1600)
    return () => clearTimeout(id)
  }, [copied])

  const copy = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
    } catch {
      setCopied(`${label}:fail`)
    }
  }
  const rows = [
    contact.github && ['GitHub', `@${githubId(contact.github)}`, contact.github],
    contact.email && ['Email', contact.email, `mailto:${contact.email}`, contact.email],
    contact.phone && ['Phone', formatPhone(contact.phone), `tel:${contact.phone}`, formatPhone(contact.phone)],
    contact.linkedin && ['LinkedIn', 'Profile', contact.linkedin],
    contact.notion && ['Notion', 'Page', contact.notion],
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <div className="footer__hero">
          <p className="footer__role">
            {profile.name}, <em>{profile.roleLine}</em>
          </p>
        </div>
        <ul className="footer__rows">
          {rows.map(([label, value, href, copyText]) => (
            <li key={label}>
              <a className="ink" href={href} target="_blank" rel="noreferrer">
                <span className="footer__k">{label}</span>
                <span className="footer__v">{value}</span>
                <span className="footer__go" aria-hidden="true">
                  ↗
                </span>
              </a>
              {copyText && (
                <button className="footer__copy" type="button" onClick={() => copy(label, copyText)} aria-label={`${label} 복사`} data-copied={copied === label ? 'true' : copied === `${label}:fail` ? 'fail' : undefined}>
                  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {copied === label ? (
                      <path d="M3 8.5 6.5 12 13 4.5" />
                    ) : (
                      <>
                        <rect x="5.5" y="5.5" width="8" height="8" rx="1.8" />
                        <path d="M10.5 3.5v-.2A1.8 1.8 0 0 0 8.7 1.5H3.8A1.8 1.8 0 0 0 2 3.3v4.9a1.8 1.8 0 0 0 1.8 1.8h.2" />
                      </>
                    )}
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="sr" role="status">
          {copied && !copied.endsWith(':fail') ? `${copied} 복사됨` : ''}
        </p>
      </div>
      <div className="wrap footer__bar">
        <span>© 2026 {profile.name}</span>
        <span>Last updated {profile.updated}</span>
      </div>
    </footer>
  )
}
