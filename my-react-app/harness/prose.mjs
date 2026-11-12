// 문체 점검표: 화면에 보이는 한국어 문구(문자열, JSX 글자)를 전수 검사합니다.
// 규칙은 AI 글투를 지목한 1차 자료(Wikipedia 'Signs of AI writing', KatFishNet 연구, im-not-ai 및 hangeul-deai 규칙)에서
// 한국어에 맞는 것만 골랐습니다. 한 규칙이 걸렸다고 AI 문체라고 단정하지 않으므로 기본은 보고만 하고 종료 코드는 0입니다.
//
//   node harness/prose.mjs                  전체 검사, 요약과 목록 출력
//   node harness/prose.mjs --only data      src/data 만
//   node harness/prose.mjs --json out.json  결과를 JSON 으로 저장
//   node harness/prose.mjs --strict         S1 규칙이 하나라도 걸리면 종료 코드 1
//   node harness/prose.mjs --selftest       규칙이 나쁜 문장은 잡고 좋은 문장은 두는지 확인
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')
const HANGUL = /[가-힣]/

// 쉼표가 절을 잇는지 명사를 나열하는지 가립니다. 숫자 쉼표(5,850)는 세지 않고,
// 쉼표로 나뉜 조각의 평균 길이가 짧으면(나열) 0 으로 봅니다. 길면 절 사이의 쉼표로 세어 돌려줍니다.
export function longClauseCommas(s) {
  const text = s.replace(/(\d),(?=\d)/g, '$1')
  const parts = text.split(',')
  const commas = parts.length - 1
  if (commas < 1) return 0
  const mean = parts.reduce((a, p) => a + p.trim().length, 0) / parts.length
  return mean >= 11 ? commas : 0
}

// 규칙. level: S1 은 한 번만 나와도 보고, S2 는 한 파일에서 min 번 이상일 때 보고, S3 는 참고용입니다.
export const RULES = [
  { id: 'R01', level: 'S1', name: 'AI 상투구', re: /결론적으로|시사하는 바|주목할 만|살펴보겠|알아보겠|패러다임|오늘날|현대 사회|발판을 마련|토대를 마련|지평을 열|무한한 가능성|기대됩니다|말할 필요도 없/g },
  { id: 'R02', level: 'S1', name: '번역투', re: /에 대해서?(?![가-힣])|에 대하여|에 있어서?(?![가-힣])|에 의해(?:서)?(?![가-힣])|가지고 있|되어지|통하여|에 기반하여|와 관련하여/g },
  { id: 'R03', level: 'S3', name: '쉼표 4개 이상(대부분 나열)', test: (s) => longClauseCommas(s) >= 4 },
  { id: 'R04', level: 'S2', min: 1, name: '부정 대구(A가 아니라 B)', re: /(?:이|가|는|은) 아니라|이 아니고|뿐만 아니라|에 그치지 않|단순한 [^.]{0,12}(?:를|을) 넘어/g },
  { id: 'R05', level: 'S2', min: 3, name: '를 통해', re: /[를을] 통해/g },
  { id: 'R06', level: 'S2', min: 3, name: '회피형 종결', re: /(?:다고|라고|로) (?:할|볼) 수 있|것 같습니다|필요가 있습니다|생각됩니다|일 수 있습니다/g },
  { id: 'R07', level: 'S2', min: 1, name: '버즈워드', re: /혁신적|획기적|핵심적|효과적|전략적|체계적(?! 문헌)|선도적|독보적|차별화된/g },
  { id: 'R08', level: 'S2', min: 3, name: '문두 접속사', test: (s) => /^(?:그리고|또한|따라서|하지만|그러나|그래서|즉|결국|이에 따라)[ ,]/.test(s) },
  { id: 'R09', level: 'S3', name: '지시관형사 과다', re: /이러한|그러한|해당 /g },
  { id: 'R10', level: 'S3', name: '문체 불일치(하였)', re: /하였(?:습니다|다|고|으며)/g },
]

// ---- 화면 문구 추출 ----
export function extractTexts(source) {
  const out = []
  const n = source.length
  const lineAt = (i) => source.slice(0, i).split('\n').length
  let i = 0
  let code = '' // 문자열과 주석을 비운 소스(JSX 글자 추출용)
  while (i < n) {
    const c = source[i]
    const d = source[i + 1]
    if (c === '/' && d === '/') {
      while (i < n && source[i] !== '\n') i++
      continue
    }
    if (c === '/' && d === '*') {
      const end = source.indexOf('*/', i + 2)
      i = end === -1 ? n : end + 2
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      const start = i
      let j = i + 1
      let buf = ''
      let depth = 0
      while (j < n) {
        const e = source[j]
        if (e === '\\') {
          const nx = source[j + 1]
          buf += nx === 'n' ? '\n' : nx
          j += 2
          continue
        }
        if (c === '`' && e === '$' && source[j + 1] === '{') {
          depth++
          j += 2
          continue
        }
        if (depth > 0) {
          if (e === "'" || e === '"') {
            // ${cond ? '이전' : '다음'} 처럼 표현식 안의 문자열도 화면 문구입니다.
            let k = j + 1
            let inner = ''
            while (k < n && source[k] !== e && source[k] !== '\n') inner += source[k++]
            if (HANGUL.test(inner)) out.push({ line: lineAt(j), text: inner, kind: 'string' })
            j = k + 1
            continue
          }
          if (e === '{') depth++
          if (e === '}') depth--
          j++
          continue
        }
        if (e === c) break
        if (e === '\n' && c !== '`') break
        buf += e
        j++
      }
      if (HANGUL.test(buf)) out.push({ line: lineAt(start), text: buf, kind: 'string' })
      code += ' '
      i = j + 1
      continue
    }
    code += c
    i++
  }
  // JSX 글자: 태그 사이에 놓인 한글 문구
  const jsx = /(>|\})([^<>{}]*[가-힣][^<>{}]*)(?=<|\{)/g
  let m
  while ((m = jsx.exec(code))) {
    const text = m[2].replace(/\s+/g, ' ').trim()
    if (HANGUL.test(text)) {
      const idx = m.index + m[1].length
      out.push({ line: code.slice(0, idx).split('\n').length, text, kind: 'jsx' })
    }
  }
  return out
}

const clean = (t) => t.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()

function sentences(t) {
  return clean(t)
    .split(/(?<=[.!?다요])\s+(?=[가-힣A-Z0-9‘“'"(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
}

// 한 문구에 규칙을 적용해 걸린 목록을 돌려줍니다.
export function checkText(text) {
  const hits = []
  for (const s of sentences(text)) {
    for (const r of RULES) {
      if (r.re) {
        const m = s.match(r.re)
        if (m) hits.push({ rule: r.id, level: r.level, name: r.name, found: [...new Set(m)].join(', '), sentence: s })
      } else if (r.test(s)) {
        hits.push({ rule: r.id, level: r.level, name: r.name, found: '', sentence: s })
      }
    }
  }
  return hits
}

// ---- 파일 수집 ----
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : /\.(js|jsx)$/.test(e.name) ? [p] : []
  })
}

export function auditFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  const texts = extractTexts(src)
  const hits = []
  const sents = []
  const seen = new Set()
  for (const t of texts) {
    // 같은 문장이 표와 카드에 두 번 나오는 경우는 한 번만 셉니다.
    for (const h of checkText(t.text)) {
      const key = `${h.rule}|${h.sentence}`
      if (seen.has(key)) continue
      seen.add(key)
      hits.push({ ...h, file: path.relative(ROOT, file), line: t.line })
    }
    for (const s of sentences(t.text)) sents.push(s)
  }
  // 서술형 문장만 문장 통계에 씁니다(표 머리글, 라벨 제외).
  const prose = sents.filter((s) => s.length >= 20)
  const lens = prose.map((s) => s.length)
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1)
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1))
  const commaRatio = prose.length ? prose.filter((s) => s.includes(',')).length / prose.length : 0
  return {
    file: path.relative(ROOT, file),
    texts: texts.length,
    sentences: prose.length,
    meanLen: Math.round(mean),
    sdLen: Math.round(sd),
    commaRatio,
    hits,
  }
}

// S2 규칙은 파일 안에서 min 번 이상일 때만 남깁니다.
export function applyThresholds(fileResult) {
  const count = {}
  for (const h of fileResult.hits) count[h.rule] = (count[h.rule] || 0) + 1
  return fileResult.hits.filter((h) => {
    const r = RULES.find((x) => x.id === h.rule)
    return r.level !== 'S2' || count[h.rule] >= (r.min || 1)
  })
}

// ---- 읽기 쉬움: 긴 문장 목록 ----
// 한국어에는 검증된 권장 문장 길이가 없어서(국립국어원도 글자 수 기준을 두지 않습니다) 절대 기준을 두지 않고,
// 사이트 안에서 두드러지게 긴 문장을 길이순으로 보여 줍니다. 괄호 안 글자는 따로 세어 함께 적습니다.
export function sentenceMetrics(s) {
  const noParen = s.replace(/\([^)]*\)/g, '')
  return {
    len: s.length,
    plain: noParen.length,
    commas: (s.replace(/(\d),(?=\d)/g, '$1').match(/,/g) || []).length,
    clauses: (noParen.match(/(?:고|며|으며|지만|는데|면서|아서|어서|므로|라서|해서|인데|여)[ ,]/g) || []).length,
  }
}

export function longSentences(min) {
  const rows = []
  for (const file of walk(SRC)) {
    const seen = new Set()
    for (const t of extractTexts(fs.readFileSync(file, 'utf8'))) {
      for (const s of sentences(t.text)) {
        if (seen.has(s)) continue
        seen.add(s)
        const m = sentenceMetrics(s)
        if (m.len >= min) rows.push({ file: path.relative(ROOT, file), line: t.line, sentence: s, ...m })
      }
    }
  }
  return rows.sort((a, b) => b.len - a.len)
}

// ---- 자체 테스트: 나쁜 문장은 잡고 좋은 문장은 그대로 둔다 ----
function selftest() {
  const bad = {
    R01: '결론적으로 이 서비스는 시사하는 바가 큽니다.',
    R02: 'AI 기술에 대해 설명합니다. 이 방식은 데이터를 가지고 있습니다.',
    R03: '사용자가 앱을 열어 정산을 만들고, 친구에게 링크를 보내고, 친구가 금액을 확인하고, 송금을 마치고, 입금이 자동으로 반영됩니다.',
    R04: '이것은 도구가 아니라 방법입니다.',
    R05: '송금을 통해 정산합니다.',
    R06: '이 방법이 효과가 있다고 할 수 있습니다.',
    R07: '혁신적인 서비스입니다.',
    R08: '또한 정산이 끝납니다.',
    R09: '이러한 점이 중요합니다.',
    R10: '결과를 확인하였습니다.',
  }
  const good = [
    '송금하면 정산이 끝납니다.',
    '영업이익률은 4.6%에서 12.5%로 올랐습니다.',
    '고양이가 책 위에 앉아 있습니다.',
    '2024년 증가분 5,850억 원은 증권 외 컨슈머 57%, 증권 38%, 머천트 5%였습니다.',
    '산출물은 문제 정의서, 요구사항 명세서, 기능 명세서, 화면 정의서, 지표, 위험입니다.',
    'Cochrane 체계적 문헌고찰로 확인했습니다.',
  ]
  let fail = 0
  for (const [id, s] of Object.entries(bad)) {
    const ok = checkText(s).some((h) => h.rule === id)
    if (!ok) {
      console.log(`FAIL ${id}: 잡혀야 하는 문장을 놓침: ${s}`)
      fail++
    }
  }
  for (const s of good) {
    const h = checkText(s)
    if (h.length) {
      console.log(`FAIL 좋은 문장이 걸림: ${s} -> ${h.map((x) => x.rule).join(',')}`)
      fail++
    }
  }
  const mt = sentenceMetrics('앱을 열고 정산을 만들며 링크를 보냅니다(설명은 괄호 안에 둡니다).')
  if (!(mt.plain < mt.len) || mt.clauses < 2) {
    console.log(`FAIL 문장 측정: ${JSON.stringify(mt)}`)
    fail++
  }
  const ext = extractTexts("// 주석 한글\nconst a = '화면 문구입니다'\nconst b = <p>본문 글자</p>\nconst c = `템플릿 ${x} 문구`")
  const got = ext.map((e) => e.text).join('|')
  for (const need of ['화면 문구입니다', '본문 글자', '템플릿  문구']) {
    if (!got.includes(need)) {
      console.log(`FAIL 추출 누락: ${need} (got: ${got})`)
      fail++
    }
  }
  if (got.includes('주석 한글')) {
    console.log('FAIL 주석이 추출됨')
    fail++
  }
  console.log(fail ? `selftest 실패 ${fail}건` : `selftest 통과 (규칙 ${Object.keys(bad).length}개, 좋은 문장 ${good.length}개, 추출 4건)`)
  return fail
}

// ---- 실행 ----
function main() {
  const args = process.argv.slice(2)
  if (args.includes('--selftest')) process.exit(selftest() ? 1 : 0)
  if (args.includes('--long')) {
    const min = Number(args[args.indexOf('--long') + 1]) || 90
    const rows = longSentences(min)
    console.log(`길이 ${min}자 이상 문장 ${rows.length}개 (길이순, 괄호 뺀 길이, 쉼표, 절 연결)\n`)
    for (const r of rows) console.log(`${r.len}/${r.plain} c${r.commas} k${r.clauses}  ${r.file}:${r.line}  ${r.sentence}`)
    return
  }
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : ''
  const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : ''
  const strict = args.includes('--strict')
  const files = walk(SRC).filter((f) => !only || path.relative(SRC, f).startsWith(only))
  const results = files.map(auditFile).filter((r) => r.texts > 0)
  const rows = results.map((r) => ({ ...r, kept: applyThresholds(r) }))

  console.log(`점검 파일 ${rows.length}개, 화면 문구 ${rows.reduce((a, r) => a + r.texts, 0)}건\n`)
  const byRule = {}
  for (const r of rows) for (const h of r.kept) byRule[h.rule] = (byRule[h.rule] || 0) + 1
  for (const r of RULES) console.log(`${r.id} ${r.level} ${r.name.padEnd(22)} ${byRule[r.id] || 0}`)

  console.log('\n파일별 (걸린 수 / 서술 문장 수 / 문장 평균 길이 / 길이 편차 / 쉼표 문장 비율)')
  for (const r of rows.filter((x) => x.kept.length || x.sentences >= 30).sort((a, b) => b.kept.length - a.kept.length)) {
    console.log(`${String(r.kept.length).padStart(3)}  ${r.file.padEnd(34)} ${String(r.sentences).padStart(4)} ${String(r.meanLen).padStart(4)} ${String(r.sdLen).padStart(4)}  ${(r.commaRatio * 100).toFixed(0)}%`)
  }

  console.log('\n걸린 문장')
  for (const r of rows) {
    for (const h of r.kept) {
      const s = h.sentence.length > 110 ? `${h.sentence.slice(0, 110)}...` : h.sentence
      console.log(`${h.rule} ${r.file}:${h.line}  [${h.found}] ${s}`)
    }
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(rows, null, 2))
  const s1 = rows.reduce((a, r) => a + r.kept.filter((h) => h.level === 'S1').length, 0)
  if (strict && s1) process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
