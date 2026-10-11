import { profile } from '../data/profile.js'

const githubId = (url) => url?.replace(/\/+$/, '').split('/').pop()
const formatPhone = (n) => n.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3')

// 모든 페이지 하단: 연락처와 페이지 이동. 값이 비어 있는 연락처는 자동으로 숨깁니다.
export default function Footer() {
  const { contact } = profile
  const links = [
    contact.github && [`GitHub · @${githubId(contact.github)}`, contact.github],
    contact.email && [contact.email, `mailto:${contact.email}`],
    contact.phone && [formatPhone(contact.phone), `tel:${contact.phone}`],
    contact.linkedin && ['LinkedIn', contact.linkedin],
    contact.notion && ['Notion', contact.notion],
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <div>
          <ul className="footer__links">
            {links.map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer">
                  {label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap footer__bar">
        <span>© 2026 {profile.name}</span>
        <span>Last updated {profile.updated}</span>
      </div>
    </footer>
  )
}
