export function Figure({ src, alt, caption, dark }) {
  return (
    <figure className={`fig${dark ? ' fig--dark' : ''}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function Gallery({ cols, items }) {
  return (
    <div className="gallery" style={{ '--cols': cols ?? 4 }}>
      {items.map((it) => (
        <figure className="gallery__item" key={it.src}>
          <span className="phone phone--flat">
            <img src={it.src} alt={it.alt} loading="lazy" decoding="async" />
          </span>
          <figcaption>
            <b>{it.title}</b>
            {it.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
