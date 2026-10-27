import { Callout, List, Paragraph, Quote, Subheading } from './blocks/text.jsx'
import { Chart, Flow, Goals, Readout, Stats, Table, Timeline } from './blocks/data.jsx'
import { BeforeAfter, Decisions, Roles } from './blocks/compare.jsx'
import { Figure, Gallery } from './blocks/media.jsx'

// 케이스 본문의 블록을 타입별로 그립니다. 타입마다의 모양은 components/blocks/ 에 있고, 여기서는 타입 → 그림을 이어 줍니다.
// 새 타입은 blocks/ 에 컴포넌트를 만들고 아래 표에 한 줄을 더하면 됩니다. wide 는 표나 그래프처럼 본문 폭보다 넓게 쓰는 타입입니다.
const TYPES = {
  p: { render: (b) => <Paragraph text={b.text} /> },
  list: { render: (b) => <List items={b.items} /> },
  quote: { render: (b) => <Quote text={b.text} cite={b.cite} /> },
  callout: { render: (b) => <Callout tone={b.tone} title={b.title} text={b.text} points={b.points} /> },
  h3: { render: (b) => <Subheading text={b.text} /> },
  timeline: { render: (b) => <Timeline items={b.items} /> },
  flow: { render: (b) => <Flow steps={b.steps} /> },
  beforeAfter: { render: (b) => <BeforeAfter before={b.before} after={b.after} /> },
  decisions: { render: (b) => <Decisions items={b.items} /> },
  roles: { render: (b) => <Roles role={b.role} responsibilities={b.responsibilities} results={b.results} /> },
  stats: { wide: true, render: (b) => <Stats columns={b.columns} compact={b.compact} items={b.items} /> },
  goals: { wide: true, render: (b) => <Goals groups={b.groups} /> },
  readout: { wide: true, render: (b) => <Readout says={b.says} silent={b.silent} /> },
  chart: { wide: true, render: (b) => <Chart groups={b.groups} unit={b.unit} source={b.source} /> },
  table: { wide: true, render: (b) => <Table head={b.head} rows={b.rows} idColumn={b.idColumn} /> },
  figure: { wide: true, render: (b) => <Figure src={b.src} alt={b.alt} caption={b.caption} dark={b.dark} /> },
  gallery: { wide: true, render: (b) => <Gallery cols={b.cols} items={b.items} /> },
  // 접이식 안에 다른 블록이 들어가므로 Block 을 직접 이어 붙입니다(자기 자신을 다시 그림)
  toggle: {
    wide: true,
    render: (b) => (
      <details className="tg">
        <summary>{b.title}</summary>
        <div className="tg__body">
          {b.blocks.map((inner, i) => (
            <Block key={i} block={inner} />
          ))}
        </div>
      </details>
    ),
  },
}

// 표에 적힌 타입만 찾습니다(constructor 같은 객체 기본 키가 타입 이름으로 들어와도 멈추지 않게 함)
const typeOf = (block) => (Object.hasOwn(TYPES, block.type) ? TYPES[block.type] : undefined)

function Block({ block }) {
  return typeOf(block)?.render(block) ?? null
}

export default function Blocks({ blocks }) {
  const wide = blocks.some((b) => typeOf(b)?.wide)
  return (
    <div className={wide ? 'blocks blocks--wide' : 'blocks'}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
