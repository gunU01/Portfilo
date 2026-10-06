export default function Head({ kicker, title, lead }) {
  return (
    <header className="section__head">
      <p className="section__kicker">{kicker}</p>
      <div>
        <h2 className="section__title">{title}</h2>
        {lead && <p className="section__lead">{lead}</p>}
      </div>
    </header>
  )
}
