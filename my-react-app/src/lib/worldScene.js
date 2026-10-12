import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// 하늘 위에 떠 있는 미니어처 섬. React와 분리해 두어, 월드를 열 때만(lazy import) three가 로드됩니다.
// 외부 모델 없이 기본 도형, 캔버스 텍스처, 환경광으로 질감을 내고, 화면 밖이나 탭이 숨겨지면 렌더를 멈춥니다.

const ZONE_RADIUS = 12.5 // 월드 중심(광장)에서 구역 중심까지
const ZONE_DISC = 6.2
const NEAR = 2.9
const BOUND = 21.5 // 걸어 다닐 수 있는 반경
const ISLAND_R = 27
const SPEED = 6.5
const HUB_R = 3.5

const INK = '#16233f'
const FONT = '"Pretendard Variable", Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif'

const css = (el, name, fallback) =>
  new THREE.Color(getComputedStyle(el).getPropertyValue(name).trim() || fallback)

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...o })
const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o })

const rbox = (w, h, d, color, r = 0.07, o) => {
  const rad = Math.max(0.005, Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002))
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, rad), std(color, o))
}
const cyl = (rt, rb, h, seg, color, o) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), std(color, o))
const sph = (r, color, o, ws = 22, hs = 16) => new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), std(color, o))
const at = (mesh, x, y, z) => {
  mesh.position.set(x, y, z)
  return mesh
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

const roundRect = (g, x, y, w, h, r) => {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

// ---------- 텍스처 ----------
const receiptTex = () =>
  canvasTexture(256, 400, (g, w, h) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    g.fillStyle = INK
    g.font = `800 34px ${FONT}`
    g.textAlign = 'center'
    g.fillText('얼마', w / 2, 56)
    g.font = `500 17px ${FONT}`
    g.fillStyle = '#6b7a99'
    g.fillText('RECEIPT', w / 2, 82)
    g.strokeStyle = '#c7d3ea'
    g.setLineDash([6, 5])
    g.beginPath()
    g.moveTo(24, 100)
    g.lineTo(w - 24, 100)
    g.stroke()
    g.setLineDash([])
    g.textAlign = 'left'
    g.fillStyle = INK
    g.font = `600 19px ${FONT}`
    const rows = [['삼겹살', '38,000'], ['된장찌개', '9,000'], ['공기밥', '3,000'], ['음료', '6,000']]
    rows.forEach(([a, b], i) => {
      g.fillText(a, 28, 140 + i * 38)
      g.textAlign = 'right'
      g.fillText(b, w - 28, 140 + i * 38)
      g.textAlign = 'left'
    })
    g.beginPath()
    g.moveTo(24, 300)
    g.lineTo(w - 24, 300)
    g.stroke()
    g.font = `800 24px ${FONT}`
    g.fillText('합계', 28, 340)
    g.fillStyle = '#1f6bff'
    g.textAlign = 'right'
    g.fillText('56,000', w - 28, 340)
    g.fillStyle = '#e6efff'
    roundRect(g, 28, 356, w - 56, 28, 14)
    g.fill()
    g.fillStyle = '#1f6bff'
    g.font = `700 15px ${FONT}`
    g.textAlign = 'center'
    g.fillText('4명 · 1인 14,000원', w / 2, 376)
  })

const docTex = () =>
  canvasTexture(256, 320, (g, w, h) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    g.fillStyle = INK
    g.font = `800 24px ${FONT}`
    g.fillText('요구사항 명세서', 24, 48)
    g.fillStyle = '#1f6bff'
    g.fillRect(24, 62, 56, 4)
    g.fillStyle = '#dbe3f0'
    for (let i = 0; i < 7; i += 1) {
      const y = 96 + i * 30
      g.fillRect(48, y, 150 - (i % 3) * 22, 8)
      g.strokeStyle = '#1f6bff'
      g.lineWidth = 2.5
      g.strokeRect(24, y - 4, 14, 14)
      if (i < 4) {
        g.beginPath()
        g.moveTo(27, y + 3)
        g.lineTo(31, y + 8)
        g.lineTo(36, y - 1)
        g.stroke()
      }
    }
  })

const phoneTex = (accent, title) =>
  canvasTexture(180, 330, (g, w, h) => {
    g.fillStyle = '#f6f8fd'
    g.fillRect(0, 0, w, h)
    g.fillStyle = accent
    g.fillRect(0, 0, w, 74)
    g.fillStyle = '#fff'
    g.font = `800 20px ${FONT}`
    g.fillText(title, 14, 46)
    for (let i = 0; i < 3; i += 1) {
      g.fillStyle = '#ffffff'
      roundRect(g, 12, 92 + i * 74, w - 24, 62, 12)
      g.fill()
      g.fillStyle = accent
      g.globalAlpha = 0.22
      g.beginPath()
      g.arc(38, 123 + i * 74, 16, 0, Math.PI * 2)
      g.fill()
      g.globalAlpha = 1
      g.fillStyle = '#c7d3ea'
      g.fillRect(64, 112 + i * 74, 80, 8)
      g.fillRect(64, 128 + i * 74, 56, 8)
    }
  })

const bookTex = () =>
  canvasTexture(256, 320, (g, w, h) => {
    g.fillStyle = '#fffdf8'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#c7d3ea'
    for (let i = 0; i < 9; i += 1) g.fillRect(28, 44 + i * 26, 200 - (i % 4) * 26, 7)
    g.fillStyle = '#1f6bff'
    g.fillRect(28, 24, 70, 6)
  })

// 광장 표지판: 구역 이름과, 그 구역이 있는 방향(화면 기준)을 가리키는 화살표
const signTex = (text, color, angle, w = 512, h = 128) =>
  canvasTexture(w, h, (g) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    g.fillStyle = color
    g.fillRect(0, 0, 14, h)
    g.fillStyle = INK
    g.font = `800 ${Math.round(h * 0.42)}px ${FONT}`
    g.textAlign = 'left'
    g.textBaseline = 'middle'
    g.fillText(text, 44, h / 2 + 4)
    g.save()
    g.translate(w - 64, h / 2)
    g.rotate(angle)
    g.fillStyle = color
    g.beginPath()
    g.moveTo(34, 0)
    g.lineTo(2, -28)
    g.lineTo(2, -11)
    g.lineTo(-30, -11)
    g.lineTo(-30, 11)
    g.lineTo(2, 11)
    g.lineTo(2, 28)
    g.closePath()
    g.fill()
    g.restore()
  })

const welcomeTex = () =>
  canvasTexture(768, 300, (g, w, h) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#1f6bff'
    g.fillRect(0, 0, 14, h)
    g.fillStyle = INK
    g.textAlign = 'left'
    g.font = `800 84px ${FONT}`
    g.fillText('문채원', 56, 128)
    g.fillStyle = '#1f6bff'
    g.font = `800 40px ${FONT}`
    g.fillText('PM / FE Portfolio', 58, 188)
    g.fillStyle = '#6b7a99'
    g.font = `600 30px ${FONT}`
    g.fillText('길을 따라 구역을 둘러보세요', 58, 246)
  })

const blobTex = () =>
  canvasTexture(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2)
    r.addColorStop(0, 'rgba(18,40,90,0.42)')
    r.addColorStop(0.6, 'rgba(18,40,90,0.16)')
    r.addColorStop(1, 'rgba(18,40,90,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, h)
  })

const glowTex = () =>
  canvasTexture(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    r.addColorStop(0, 'rgba(255,255,255,1)')
    r.addColorStop(0.25, 'rgba(255,255,255,0.55)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, h)
  })

const groundTex = (rand) =>
  canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#bfe0d1'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 420; i += 1) {
      const x = rand() * w
      const y = rand() * h
      const r = 14 + rand() * 46
      const grad = g.createRadialGradient(x, y, 0, x, y, r)
      const light = rand() > 0.5
      grad.addColorStop(0, light ? 'rgba(235,250,244,0.38)' : 'rgba(110,170,160,0.26)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grad
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
  })

// ---------- 구조물 ----------
const heartShape = () => {
  const s = new THREE.Shape()
  s.moveTo(0.25, 0.25)
  s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0)
  s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35)
  s.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95)
  s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35)
  s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0)
  s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25)
  return s
}

const starShape = (outer, inner) => {
  const s = new THREE.Shape()
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 ? inner : outer
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

const extruded = (shape, depth, color, o) => {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3, curveSegments: 16 })
  geo.center()
  return new THREE.Mesh(geo, std(color, o))
}

// 모양마다 다른 도형 조합. pedestal 위에 올라가며 높이는 대략 3.4 이하입니다. 각 모양은 { group, anim(t) }를 돌려줍니다.
const SHAPES = {
  // 얼마: 동전 더미 위에 영수증이 떠 있고, 작은 동전이 돕니다
  coins() {
    const g = new THREE.Group()
    const gold = { metalness: 0.7, roughness: 0.28 }
    for (let i = 0; i < 6; i += 1) {
      const coin = at(cyl(0.86, 0.86, 0.22, 48, '#f4c04e', gold), (i % 2) * 0.05, 0.5 + i * 0.235, ((i + 1) % 2) * 0.04)
      coin.rotation.y = i * 0.5
      g.add(coin)
    }
    const top = new THREE.Mesh(
      new THREE.CircleGeometry(0.64, 40),
      new THREE.MeshStandardMaterial({
        map: canvasTexture(128, 128, (c, w, h) => {
          c.fillStyle = '#f8d36b'
          c.fillRect(0, 0, w, h)
          c.fillStyle = '#c98f1a'
          c.font = `800 74px ${FONT}`
          c.textAlign = 'center'
          c.textBaseline = 'middle'
          c.fillText('₩', w / 2, h / 2 + 4)
        }),
        metalness: 0.5,
        roughness: 0.35,
      }),
    )
    top.rotation.x = -Math.PI / 2
    top.position.y = 0.5 + 5 * 0.235 + 0.115
    g.add(top)

    const paper = new THREE.Group()
    paper.add(rbox(1.2, 1.8, 0.05, '#ffffff', 0.05, { roughness: 0.9 }))
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.68), new THREE.MeshStandardMaterial({ map: receiptTex(), roughness: 0.9 }))
    face.position.z = 0.03
    paper.add(face)
    paper.position.set(0, 2.55, 0)
    g.add(paper)

    const minis = []
    for (let i = 0; i < 3; i += 1) {
      const m = cyl(0.17, 0.17, 0.05, 24, '#f4c04e', gold)
      m.rotation.x = Math.PI / 2
      g.add(m)
      minis.push(m)
    }
    return {
      group: g,
      anim(t) {
        paper.position.y = 2.55 + Math.sin(t * 1.4) * 0.09
        paper.rotation.y = Math.sin(t * 0.8) * 0.32
        paper.rotation.z = 0.06 + Math.sin(t * 1.1) * 0.03
        minis.forEach((m, i) => {
          const a = t * 1.3 + (i * Math.PI * 2) / 3
          m.position.set(Math.cos(a) * 1.15, 2.4 + Math.sin(a * 1.5) * 0.25, Math.sin(a) * 1.15)
          m.rotation.z = a
        })
      },
    }
  },

  // 해미: 창에 불이 켜진 집과, 집 위에 떠 있는 하트
  house(tint) {
    const g = new THREE.Group()
    g.add(at(rbox(2.2, 1.45, 1.9, '#fff3e3', 0.12), 0, 1.0, 0))
    const roof = at(new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.2, 4), std(tint, { roughness: 0.5 })), 0, 2.38, 0)
    roof.rotation.y = Math.PI / 4
    roof.scale.z = 0.88
    g.add(roof)
    g.add(at(rbox(0.32, 0.8, 0.32, '#e9ddc9', 0.05), 0.62, 2.55, -0.35))
    g.add(at(rbox(0.5, 0.9, 0.08, '#b98a62', 0.05), 0, 0.72, 0.97))
    g.add(at(sph(0.05, '#f2c14e', { metalness: 0.6, roughness: 0.3 }, 10, 8), 0.14, 0.72, 1.03))
    const win = { color: '#ffe08a', emissive: '#ffcf6b', emissiveIntensity: 0.9, roughness: 0.3 }
    for (const x of [-0.72, 0.72]) {
      g.add(at(rbox(0.52, 0.52, 0.08, '#ffffff', 0.04), x, 1.1, 0.96))
      g.add(at(rbox(0.38, 0.38, 0.06, '#ffe08a', 0.03, win), x, 1.1, 1.0))
    }
    g.add(at(rbox(0.46, 0.46, 0.08, '#ffffff', 0.04), -1.12, 1.15, 0.2))
    for (const [x, z, s] of [[-1.15, 0.95, 0.38], [1.2, 0.9, 0.3], [-1.3, -0.4, 0.28]]) g.add(at(sph(s, '#78c9a8', { roughness: 0.8 }), x, s * 0.8, z))
    const heart = extruded(heartShape(), 0.28, '#ff6f86', { roughness: 0.35 })
    heart.scale.setScalar(0.72)
    g.add(heart)
    return {
      group: g,
      anim(t) {
        heart.position.set(0, 3.55 + Math.sin(t * 1.6) * 0.12, 0)
        heart.rotation.y = Math.sin(t * 0.9) * 0.6
        const s = 0.72 * (1 + Math.max(0, Math.sin(t * 3.2)) * 0.06)
        heart.scale.setScalar(s)
      },
    }
  },

  // 토스 BM 분석: 오르는 막대와 위로 향하는 화살표
  bars() {
    const g = new THREE.Group()
    g.add(at(rbox(3.0, 0.2, 1.3, '#eaf1ff', 0.08), 0, 0.42, 0))
    const cols = ['#b7d0ff', '#8db5ff', '#5d93ff', '#2f6bff', '#1b4fd1']
    const hs = [0.8, 1.35, 1.9, 2.45, 3.0]
    const bars = hs.map((h, i) => {
      const holder = new THREE.Group()
      holder.position.set(-1.12 + i * 0.56, 0.52, 0)
      const m = at(rbox(0.42, h, 0.7, cols[i], 0.1, { roughness: 0.4 }), 0, h / 2, 0)
      holder.add(m)
      g.add(holder)
      return { holder, i }
    })
    const arrow = new THREE.Group()
    arrow.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 20), std('#ffb43c', { roughness: 0.35 })), 0, 0.5, 0))
    arrow.add(at(cyl(0.1, 0.1, 0.6, 16, '#ffb43c', { roughness: 0.35 }), 0, 0.05, 0))
    arrow.rotation.z = -0.5
    g.add(arrow)
    return {
      group: g,
      anim(t) {
        bars.forEach(({ holder, i }) => {
          holder.scale.y = 1 + Math.sin(t * 1.6 - i * 0.55) * 0.045
        })
        arrow.position.set(1.25, 3.0 + Math.sin(t * 1.8) * 0.12, 0)
      },
    }
  },

  // 얼마 기획 문서: 쌓인 문서, 맨 위 장에는 체크리스트와 연필
  sheets(tint) {
    const g = new THREE.Group()
    const sheets = []
    for (let i = 0; i < 6; i += 1) {
      const s = at(rbox(2.0, 0.14, 2.5, i % 2 ? '#f1f6ff' : '#ffffff', 0.04, { roughness: 0.9 }), 0, 0.5 + i * 0.17, 0)
      s.rotation.y = (i - 2.5) * 0.1
      g.add(s)
      sheets.push(s)
    }
    const top = sheets[sheets.length - 1]
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.15), new THREE.MeshStandardMaterial({ map: docTex(), roughness: 0.9 }))
    face.rotation.x = -Math.PI / 2
    face.position.y = 0.075
    top.add(face)
    g.add(at(rbox(0.9, 0.12, 0.5, tint, 0.05), -0.6, 0.52 + 6 * 0.17 + 0.02, 1.35))
    const pencil = new THREE.Group()
    pencil.add(at(cyl(0.07, 0.07, 1.3, 12, '#ffcc3e', { roughness: 0.5 }), 0, 0, 0))
    pencil.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 12), std('#f3d9b0')), 0, 0.76, 0))
    pencil.add(at(cyl(0.075, 0.075, 0.12, 12, '#ff8fa3'), 0, -0.71, 0))
    pencil.rotation.set(0, 0, Math.PI / 2)
    const pencilHolder = new THREE.Group()
    pencilHolder.add(pencil)
    pencilHolder.position.set(0.15, 1.75, 0.5)
    pencilHolder.rotation.y = 0.55
    g.add(pencilHolder)
    const stamp = at(sph(0.26, '#ff6b5e', { roughness: 0.4 }), -0.55, 2.05, -0.55)
    g.add(stamp)
    return {
      group: g,
      anim(t) {
        pencilHolder.position.y = 1.75 + Math.sin(t * 1.5) * 0.06
        stamp.position.y = 2.05 + Math.sin(t * 1.9 + 1) * 0.05
      },
    }
  },

  // 해미 기획 문서: 화면 정의 보드(이젤 위의 세 화면)
  board(tint) {
    const g = new THREE.Group()
    const wood = '#c79a6b'
    for (const x of [-1.05, 1.05]) {
      const leg = at(cyl(0.07, 0.07, 2.6, 10, wood, { roughness: 0.8 }), x, 1.4, 0.15)
      leg.rotation.z = x > 0 ? -0.08 : 0.08
      leg.rotation.x = -0.1
      g.add(leg)
    }
    const back = at(cyl(0.07, 0.07, 2.5, 10, wood, { roughness: 0.8 }), 0, 1.35, -0.65)
    back.rotation.x = 0.28
    g.add(back)
    const panel = new THREE.Group()
    panel.add(rbox(2.9, 1.9, 0.12, '#ffffff', 0.08, { roughness: 0.7 }))
    const titles = ['홈', '앨범', '리포트']
    const accents = ['#ff9a62', '#f2b24e', tint]
    titles.forEach((tt, i) => {
      const x = -0.92 + i * 0.92
      panel.add(at(rbox(0.74, 1.4, 0.05, '#1c2540', 0.08, { roughness: 0.4 }), x, 0, 0.09))
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 1.32), new THREE.MeshStandardMaterial({ map: phoneTex(accents[i] instanceof THREE.Color ? '#' + accents[i].getHexString() : accents[i], tt), roughness: 0.5 }))
      scr.position.set(x, 0, 0.12)
      panel.add(scr)
    })
    panel.position.set(0, 2.15, 0.1)
    panel.rotation.x = -0.1
    g.add(panel)
    return {
      group: g,
      anim(t) {
        panel.rotation.y = Math.sin(t * 0.7) * 0.06
      },
    }
  },

  // 토스 BM 분석 문서: 펼친 보고서와 그 위로 솟는 막대
  book(tint) {
    const g = new THREE.Group()
    const tex = bookTex()
    const page = () => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
    const left = new THREE.Group()
    const right = new THREE.Group()
    for (const [grp, dir] of [[left, -1], [right, 1]]) {
      grp.add(at(rbox(1.4, 0.14, 1.9, tint, 0.05), 0, 0, 0))
      const pages = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.18, 1.8, 2, 0.03), page())
      pages.position.y = 0.15
      grp.add(pages)
      grp.position.set(dir * 0.7, 0.95, 0)
      grp.rotation.z = -dir * 0.24
    }
    g.add(left, right)
    g.add(at(rbox(0.16, 0.3, 1.94, '#ffffff', 0.04), 0, 0.82, 0))
    const bars = []
    ;['#8db5ff', '#5d93ff', '#2f6bff'].forEach((c, i) => {
      const holder = new THREE.Group()
      holder.position.set(-0.4 + i * 0.4, 1.3, -0.1)
      const h = 0.7 + i * 0.4
      holder.add(at(rbox(0.28, h, 0.28, c, 0.06, { roughness: 0.4 }), 0, h / 2, 0))
      g.add(holder)
      bars.push(holder)
    })
    const coin = cyl(0.2, 0.2, 0.06, 24, '#f4c04e', { metalness: 0.7, roughness: 0.28 })
    coin.rotation.x = Math.PI / 2
    g.add(coin)
    return {
      group: g,
      anim(t) {
        bars.forEach((b, i) => {
          b.scale.y = 1 + Math.sin(t * 1.7 - i * 0.7) * 0.1
        })
        coin.position.set(0.75, 2.4 + Math.sin(t * 1.8) * 0.12, -0.1)
        coin.rotation.z = t * 1.6
      },
    }
  },

  // 수상: 광택 나는 트로피와 돌아가는 별
  trophy(tint) {
    const g = new THREE.Group()
    const metal = { metalness: 0.9, roughness: 0.22 }
    g.add(at(rbox(1.3, 0.34, 1.3, '#26324f', 0.1, { roughness: 0.5 }), 0, 0.5, 0))
    g.add(at(rbox(0.7, 0.14, 0.04, '#f4d58a', 0.02, { metalness: 0.7, roughness: 0.3 }), 0, 0.5, 0.67))
    const pts = [[0.001, 0], [0.4, 0], [0.45, 0.06], [0.22, 0.16], [0.13, 0.34], [0.13, 0.68], [0.24, 0.9], [0.62, 1.12], [0.84, 1.62], [0.8, 1.68], [0.72, 1.62], [0.56, 1.16], [0.001, 0.96]].map(([x, y]) => new THREE.Vector2(x, y))
    const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), std(tint, { ...metal, side: THREE.DoubleSide }))
    cup.position.y = 0.72
    g.add(cup)
    for (const dir of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 12, 28, Math.PI * 1.15), std(tint, metal))
      h.position.set(dir * 0.9, 2.0, 0)
      h.rotation.z = dir > 0 ? -Math.PI / 2 - 0.5 : Math.PI / 2 - 0.5 + Math.PI
      g.add(h)
    }
    const star = extruded(starShape(0.42, 0.18), 0.12, '#ffe58a', { emissive: '#ffd25e', emissiveIntensity: 0.7, roughness: 0.3 })
    g.add(star)
    return {
      group: g,
      anim(t) {
        star.position.set(0, 3.35 + Math.sin(t * 2) * 0.1, 0)
        star.rotation.y = t * 1.8
      },
    }
  },
}

function buildLandmark(shape, tint, scale = 1) {
  const g = new THREE.Group()
  const ped = new THREE.Group()
  ped.scale.setScalar(shape === 'trophy' ? 0.78 : 1)
  ped.add(at(cyl(1.75, 1.95, 0.34, 56, '#f6f9ff', { roughness: 0.5 }), 0, 0.17, 0))
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.06, 10, 64), std(tint, { roughness: 0.4 }))
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.36
  ped.add(rim)
  g.add(ped)
  const built = (SHAPES[shape] ?? SHAPES.house)(tint)
  built.group.scale.setScalar(scale)
  g.add(built.group)
  return { group: g, anim: built.anim, body: built.group }
}

// 머리가 큰 2등신 캐릭터: 쌍 똥머리, 큰 눈과 볼터치, 작은 배낭. 걸을 때 통통 튀고 눈을 깜빡입니다.
function buildCharacter(accent, blob) {
  const skin = '#ffe3cc'
  const hair = '#4a3430'
  const g = new THREE.Group()
  const rig = new THREE.Group()
  g.add(rig)

  const body = at(new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.22, 8, 20), std(accent, { roughness: 0.55 })), 0, 0.78, 0)
  body.scale.set(1.05, 1, 0.92)
  const collar = at(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 10, 28), std('#ffffff', { roughness: 0.6 })), 0, 1.12, 0)
  collar.rotation.x = Math.PI / 2
  const pocket = at(rbox(0.34, 0.2, 0.06, '#ffffff', 0.05, { roughness: 0.6 }), 0, 0.72, 0.38)
  const pack = at(rbox(0.56, 0.6, 0.26, '#ffb43c', 0.12, { roughness: 0.6 }), 0, 0.86, -0.42)
  const packFlap = at(rbox(0.5, 0.2, 0.28, '#ff9f1a', 0.08, { roughness: 0.6 }), 0, 1.04, -0.43)
  rig.add(body, collar, pocket, pack, packFlap)

  const head = new THREE.Group()
  head.position.set(0, 1.28, 0)
  const skull = at(sph(0.66, skin, { roughness: 0.7 }, 36, 24), 0, 0.42, 0)
  skull.scale.set(1.04, 0.94, 0.98)
  const cap = at(
    new THREE.Mesh(new THREE.SphereGeometry(0.7, 36, 22, 0, Math.PI * 2, 0, Math.PI * 0.56), std(hair, { roughness: 0.85 })),
    0, 0.48, -0.06,
  )
  head.add(skull, cap)
  for (const x of [-0.5, 0.5]) head.add(at(sph(0.22, hair, { roughness: 0.85 }), x, 0.98, -0.04))
  for (const [x, w] of [[-0.3, 0.3], [0, 0.34], [0.3, 0.3]]) {
    const fringe = at(sph(0.17, hair, { roughness: 0.85 }), x, 0.88, 0.5)
    fringe.scale.set(w / 0.17 * 0.6, 0.8, 0.5)
    head.add(fringe)
  }
  const ahoge = new THREE.Group()
  ahoge.position.set(0.02, 1.0, 0.0)
  ahoge.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 8), std(hair, { roughness: 0.85 })), 0, 0.17, 0))
  head.add(ahoge)

  const eyeMat = basic('#1b2236')
  const shineMat = basic('#ffffff')
  const eyes = new THREE.Group()
  eyes.position.set(0, 0.36, 0.6)
  for (const x of [-0.25, 0.25]) {
    const eye = at(new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), eyeMat), x, 0, 0)
    eye.scale.set(0.9, 1.25, 0.45)
    eyes.add(eye)
    eyes.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), shineMat), x + 0.035, 0.065, 0.075))
  }
  head.add(eyes)
  for (const x of [-0.43, 0.43]) {
    const blush = at(new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), basic('#ff8fa8', { transparent: true, opacity: 0.6 })), x, 0.2, 0.585)
    blush.scale.set(1.2, 0.8, 1)
    blush.rotation.y = x > 0 ? 0.35 : -0.35
    head.add(blush)
  }
  const smile = at(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 8, 16, Math.PI), basic('#9a4040')), 0, 0.2, 0.63)
  smile.rotation.z = Math.PI
  head.add(smile)
  rig.add(head)

  const hand = (color) => at(sph(0.12, color, { roughness: 0.7 }, 14, 10), 0, -0.34, 0)
  const mkLimb = (x, y, len, radius, color, tipColor, tipScale) => {
    const pivot = new THREE.Group()
    pivot.position.set(x, y, 0)
    pivot.add(at(new THREE.Mesh(new THREE.CapsuleGeometry(radius, len, 4, 10), std(color, { roughness: 0.6 })), 0, -len / 2 - radius * 0.3, 0))
    const tip = hand(tipColor)
    tip.position.y = -len - radius * 0.9
    if (tipScale) tip.scale.set(...tipScale)
    pivot.add(tip)
    rig.add(pivot)
    return pivot
  }
  const legL = mkLimb(-0.2, 0.46, 0.14, 0.11, '#2b3a63', '#ffffff', [1.1, 0.8, 1.5])
  const legR = mkLimb(0.2, 0.46, 0.14, 0.11, '#2b3a63', '#ffffff', [1.1, 0.8, 1.5])
  const armL = mkLimb(-0.5, 1.0, 0.16, 0.09, accent, skin)
  const armR = mkLimb(0.5, 1.0, 0.16, 0.09, accent, skin)

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.03
  g.add(shadow)
  g.userData = { limbs: { legL, legR, armL, armR }, rig, shadow, head, eyes, ahoge }
  return g
}

function buildCloud(rand) {
  const g = new THREE.Group()
  const m = std('#ffffff', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.35 })
  const n = 5 + Math.floor(rand() * 3)
  for (let i = 0; i < n; i += 1) {
    const r = 2 + rand() * 2.2
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), m)
    s.position.set((i - n / 2) * 2.4 + rand() * 1.2, (rand() - 0.2) * 1.2, (rand() - 0.5) * 2.4)
    s.scale.y = 0.62
    g.add(s)
  }
  return g
}

export function createWorld({ container, zones, onNear, onZone, onActivate }) {
  const accent = css(container, '--accent', '#1f6bff')
  const coarse = window.matchMedia('(pointer: coarse)').matches

  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2))
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  container.prepend(renderer.domElement)

  const HORIZON = new THREE.Color('#dcebff')
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(HORIZON, 46, 135)

  // 환경광: 금속과 광택이 자연스럽게 반사되도록 방 모양 환경맵을 한 번만 만들어 둡니다.
  const pmrem = new THREE.PMREMGenerator(renderer)
  const roomEnv = new RoomEnvironment()
  const envTex = pmrem.fromScene(roomEnv, 0.04).texture
  scene.environment = envTex
  scene.environmentIntensity = 0.45
  roomEnv.dispose()

  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0xdbe8e2, 0.85))
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.3)
  const sunOffset = new THREE.Vector3(-14, 24, 12)
  sun.castShadow = true
  sun.shadow.mapSize.set(coarse ? 1536 : 2048, coarse ? 1536 : 2048)
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 2, far: 80 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.035
  scene.add(sun, sun.target)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400)
  camera.position.set(0, 19, 23)
  const camOffset = new THREE.Vector3(0, 13, 15.5)
  const camOverview = new THREE.Vector3(0, 13, 15.5)
  const camZone = new THREE.Vector3(0, 10, 13.2)

  // 하늘: 카메라를 따라다니는 그라데이션 돔과 해
  const sky = new THREE.Group()
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color('#5da4ff') },
      mid: { value: new THREE.Color('#cfe5ff') },
      low: { value: new THREE.Color('#eaf3ff') },
    },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform vec3 top;
      uniform vec3 mid;
      uniform vec3 low;
      varying vec3 vP;
      void main() {
        float h = vP.y;
        vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h, 0.0, 1.0), 0.6)) : mix(mid, low, clamp(-h * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  const dome = new THREE.Mesh(new THREE.SphereGeometry(250, 32, 18), skyMat)
  sky.add(dome)
  const glow = glowTex()
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xfff3c8, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }))
  sunSprite.scale.set(90, 90, 1)
  sunSprite.position.set(70, 85, -170)
  sky.add(sunSprite)
  scene.add(sky)

  const clouds = []
  for (let i = 0; i < 16; i += 1) {
    const c = buildCloud(rand)
    const a = rand() * Math.PI * 2
    const r = 48 + rand() * 70
    c.position.set(Math.cos(a) * r, 24 + rand() * 22, Math.sin(a) * r - 20)
    c.scale.setScalar(0.9 + rand() * 1.1)
    c.userData.speed = 0.35 + rand() * 0.5
    scene.add(c)
    clouds.push(c)
  }
  // 섬 아래의 구름 바다
  const sea = new THREE.Mesh(new THREE.CircleGeometry(260, 48), new THREE.MeshBasicMaterial({ color: 0xe8f2ff }))
  sea.rotation.x = -Math.PI / 2
  sea.position.y = -16
  scene.add(sea)

  // 섬
  const gTex = groundTex(rand)
  gTex.wrapS = gTex.wrapT = THREE.RepeatWrapping
  gTex.repeat.set(7, 7)
  const island = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 0.4, 0.9, 96), [
    std('#c3d6ee', { roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ map: gTex, roughness: 0.95 }),
    std('#a9bedd'),
  ])
  island.position.y = -0.45
  island.receiveShadow = true
  scene.add(island)
  const rockCore = new THREE.Mesh(new THREE.ConeGeometry(ISLAND_R - 0.8, 13, 14), std('#a4b8d8', { roughness: 0.95, flatShading: true }))
  rockCore.rotation.x = Math.PI
  rockCore.position.y = -7.4
  scene.add(rockCore)
  for (let i = 0; i < 7; i += 1) {
    const a = rand() * Math.PI * 2
    const r = 5 + rand() * 13
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(1 + rand() * 1.6, 0), std('#b3c5e2', { roughness: 0.95, flatShading: true }))
    s.position.set(Math.cos(a) * r, -9 - rand() * 6, Math.sin(a) * r)
    s.userData.float = rand() * 6
    scene.add(s)
    clouds.push(s)
  }

  const blob = blobTex()
  const labelLayer = document.createElement('div')
  labelLayer.className = 'world__labels'
  labelLayer.setAttribute('aria-hidden', 'true')
  container.append(labelLayer)
  const makeLabel = (text, cls) => {
    const el = document.createElement('div')
    el.className = cls
    el.textContent = text
    labelLayer.append(el)
    return el
  }

  const zoneTint = [accent, new THREE.Color('#f2a93b'), new THREE.Color('#2fb58c')]
  const zoneGround = ['#dce9ff', '#fff0d3', '#d9f2e6']
  const stoneMat = std('#cddaf0', { roughness: 0.7 })

  // 광장(허브)
  const hub = new THREE.Group()
  hub.add(at(cyl(HUB_R, HUB_R + 0.12, 0.2, 64, '#f4f8ff', { roughness: 0.6 }), 0, 0.1, 0))
  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(HUB_R - 0.12, 0.07, 10, 80), std(accent, { roughness: 0.4 }))
  hubRing.rotation.x = Math.PI / 2
  hubRing.position.y = 0.22
  hub.add(hubRing)
  const board = new THREE.Group()
  const bw = 3.6
  const bh = 1.4
  board.add(at(cyl(0.09, 0.09, 2.4, 10, '#b98a62', { roughness: 0.8 }), -bw / 2 + 0.3, 1.2, 0))
  board.add(at(cyl(0.09, 0.09, 2.4, 10, '#b98a62', { roughness: 0.8 }), bw / 2 - 0.3, 1.2, 0))
  board.add(at(rbox(bw, bh, 0.14, '#ffffff', 0.1, { roughness: 0.6 }), 0, 2.2, 0))
  const bface = new THREE.Mesh(new THREE.PlaneGeometry(bw - 0.2, bh - 0.2), new THREE.MeshStandardMaterial({ map: welcomeTex(), roughness: 0.7 }))
  bface.position.set(0, 2.2, 0.08)
  board.add(bface)
  board.position.set(-2.1, 0.2, 0.9)
  board.rotation.y = 0.4
  hub.add(board)
  scene.add(hub)

  const zoneInfo = []
  const landmarks = []
  const animators = []
  const treeObstacles = []
  const stones = []
  const hedges = []
  const lamps = []
  const signs = []

  zones.forEach((zone, zi) => {
    const theta = -Math.PI / 2 + (zi * 2 * Math.PI) / zones.length
    const cx = Math.cos(theta) * ZONE_RADIUS
    const cz = Math.sin(theta) * ZONE_RADIUS
    const tint = zoneTint[zi % 3]

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(ZONE_DISC, ZONE_DISC + 0.12, 0.22, 72), std(zoneGround[zi % 3], { roughness: 0.75 }))
    disc.position.set(cx, 0.11, cz)
    disc.receiveShadow = true
    scene.add(disc)
    const curb = new THREE.Mesh(new THREE.TorusGeometry(ZONE_DISC, 0.1, 10, 96), std(tint, { roughness: 0.45 }))
    curb.rotation.x = Math.PI / 2
    curb.position.set(cx, 0.22, cz)
    scene.add(curb)
    const inner = new THREE.Mesh(new THREE.RingGeometry(ZONE_DISC - 1.1, ZONE_DISC - 0.95, 96), basic(tint, { transparent: true, opacity: 0.35, side: THREE.DoubleSide }))
    inner.rotation.x = -Math.PI / 2
    inner.position.set(cx, 0.235, cz)
    scene.add(inner)

    // 구역 가장자리의 울타리 덤불(허브 쪽 입구는 비워 둠)
    for (let k = 0; k < 40; k += 1) {
      const a = (k / 40) * Math.PI * 2
      let d = Math.atan2(Math.sin(a - (theta + Math.PI)), Math.cos(a - (theta + Math.PI)))
      if (Math.abs(d) < 0.42) continue
      hedges.push([cx + Math.cos(a) * (ZONE_DISC + 0.45), cz + Math.sin(a) * (ZONE_DISC + 0.45), 0.5 + rand() * 0.25])
    }

    // 허브에서 구역 입구까지 징검돌 길
    const dx = Math.cos(theta)
    const dz = Math.sin(theta)
    const start = HUB_R + 0.4
    const end = ZONE_RADIUS - ZONE_DISC - 0.2
    for (let s = start, i = 0; s < end; s += 1.05, i += 1) {
      const side = Math.sin(i * 1.7) * 0.18
      stones.push([dx * s - dz * side, dz * s + dx * side, rand() * Math.PI, 0.62 + rand() * 0.1])
    }
    // 입구 양옆 가로등
    for (const side of [-1, 1]) {
      const lx = dx * (end - 0.3) - dz * side * 1.7
      const lz = dz * (end - 0.3) + dx * side * 1.7
      lamps.push([lx, lz])
    }

    signs.push({ name: zone.name, color: '#' + tint.getHexString(), angle: Math.atan2(dz, dx) })

    const info = { id: zone.id, name: zone.name, x: cx, z: cz, mx: cx, mz: cz, label: makeLabel(zone.name, 'world__zone') }
    zoneInfo.push(info)

    const n = zone.items.length
    const step = n > 3 ? 0.84 : 0.88
    const arc = n > 3 ? 4.1 : 3.9
    zone.items.forEach((item, ii) => {
      const phi = theta + (ii - (n - 1) / 2) * step
      const x = cx + Math.cos(phi) * arc
      const z = cz + Math.sin(phi) * arc
      const itemTint = item.tint ? new THREE.Color(item.tint) : tint
      const built = buildLandmark(item.shape, itemTint, item.scale)
      built.group.position.set(x, 0.22, z)
      built.group.rotation.y = -phi - Math.PI / 2 // 앞면이 구역 중심(입구)을 향하게
      scene.add(built.group)

      const ring = new THREE.Mesh(new THREE.RingGeometry(2.05, 2.3, 48), basic(itemTint, { side: THREE.DoubleSide, transparent: true, opacity: 0.9 }))
      ring.rotation.x = -Math.PI / 2
      ring.position.set(x, 0.26, z)
      ring.visible = false
      scene.add(ring)

      const shadowBlob = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false }))
      shadowBlob.rotation.x = -Math.PI / 2
      shadowBlob.position.set(x, 0.24, z)
      scene.add(shadowBlob)

      const label = makeLabel(item.short ?? item.title, 'world__label')
      landmarks.push({ ...item, x, z, mesh: built.group, body: built.body, ring, label, anim: built.anim, base: 1 })
      if (built.anim) animators.push(built.anim)
    })
    const mine = landmarks.slice(landmarks.length - n)
    info.mx = mine.reduce((s, l) => s + l.x, 0) / n
    info.mz = mine.reduce((s, l) => s + l.z, 0) / n
    info.ax = cx - dx * 1.0
    info.az = cz - dz * 1.0
  })

  // 광장의 방향 표지판 기둥
  const signpost = new THREE.Group()
  signpost.add(at(cyl(0.09, 0.11, 3.2, 10, '#b98a62', { roughness: 0.8 }), 0, 1.6, 0))
  signpost.add(at(sph(0.2, '#ffb43c', { roughness: 0.4 }), 0, 3.3, 0))
  signs.forEach((sg, i) => {
    const plate = new THREE.Group()
    plate.add(rbox(2.5, 0.62, 0.1, '#ffffff', 0.09, { roughness: 0.6 }))
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.36, 0.5), new THREE.MeshStandardMaterial({ map: signTex(sg.name, sg.color, sg.angle), roughness: 0.7 }))
    face.position.z = 0.06
    plate.add(face)
    plate.position.set(0.95, 1.2 + i * 0.72, 0)
    signpost.add(plate)
  })
  signpost.position.set(2.2, 0.2, 1.0)
  scene.add(signpost)
  treeObstacles.push([signpost.position.x, signpost.position.z, 1.1], [-2.1, 0.9, 1.0], [-2.9, 0.75, 0.9], [-1.3, 1.05, 0.9])

  // 징검돌, 울타리, 가로등은 인스턴스로 묶어 그립니다.
  const dummy = new THREE.Object3D()
  const stoneMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.55, 0.1, 10), stoneMat, stones.length)
  stones.forEach(([x, z, r, s], i) => {
    dummy.position.set(x, 0.05, z)
    dummy.rotation.set(0, r, 0)
    dummy.scale.set(s, 1, s * 0.82)
    dummy.updateMatrix()
    stoneMesh.setMatrixAt(i, dummy.matrix)
  })
  stoneMesh.receiveShadow = true
  scene.add(stoneMesh)

  const hedgeMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), std('#8fd3b1', { roughness: 0.85 }), hedges.length)
  const hedgeColors = ['#8fd3b1', '#7cc8a4', '#a2dcc0']
  hedges.forEach(([x, z, s], i) => {
    dummy.position.set(x, s * 0.7, z)
    dummy.rotation.set(0, rand() * 3, 0)
    dummy.scale.set(s, s * 0.8, s)
    dummy.updateMatrix()
    hedgeMesh.setMatrixAt(i, dummy.matrix)
    hedgeMesh.setColorAt(i, new THREE.Color(hedgeColors[i % 3]))
  })
  hedgeMesh.castShadow = true
  hedgeMesh.receiveShadow = true
  scene.add(hedgeMesh)

  const lampGlass = std('#fff2c2', { emissive: '#ffd77a', emissiveIntensity: 1.1, roughness: 0.3 })
  lamps.forEach(([x, z]) => {
    const lamp = new THREE.Group()
    lamp.add(at(cyl(0.07, 0.1, 2.1, 10, '#41507a', { roughness: 0.6 }), 0, 1.05, 0))
    lamp.add(at(sph(0.26, '#fff2c2', {}, 16, 12), 0, 2.25, 0))
    lamp.children[1].material = lampGlass
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffe3a0, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }))
    halo.scale.set(1.8, 1.8, 1)
    halo.position.y = 2.25
    lamp.add(halo)
    lamp.position.set(x, 0.2, z)
    scene.add(lamp)
  })

  // 풍경: 나무, 꽃, 풀, 바위. 구역과 길을 피해 흩어 둡니다(시드 고정).
  const clear = (x, z, pad = 0) => {
    const r = Math.hypot(x, z)
    if (r < HUB_R + 1.6 + pad) return false
    for (const zi of zoneInfo) if (Math.hypot(x - zi.x, z - zi.z) < ZONE_DISC + 1.6 + pad) return false
    for (let i = 0; i < zones.length; i += 1) {
      const th = -Math.PI / 2 + (i * 2 * Math.PI) / zones.length
      const along = x * Math.cos(th) + z * Math.sin(th)
      const across = Math.abs(-x * Math.sin(th) + z * Math.cos(th))
      if (along > 0 && along < ZONE_RADIUS && across < 2.6 + pad) return false
    }
    return true
  }
  const trees = []
  for (let tries = 0; tries < 1500 && trees.length < 46; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 15.5 + rand() * (ISLAND_R - 17.5)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (!clear(x, z, 0.4)) continue
    if (trees.some((t) => Math.hypot(t[0] - x, t[1] - z) < 2.6)) continue
    trees.push([x, z, 0.7 + rand() * 0.5, rand() * 6, Math.floor(rand() * 4)])
  }
  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.1, 8)
  const bigGeo = new THREE.IcosahedronGeometry(1, 2)
  const trunks = new THREE.InstancedMesh(trunkGeo, std('#9b7a6b', { roughness: 0.9 }), trees.length)
  const crowns = new THREE.InstancedMesh(bigGeo, std('#ffffff', { roughness: 0.8 }), trees.length)
  const tops = new THREE.InstancedMesh(bigGeo, std('#ffffff', { roughness: 0.8 }), trees.length)
  const leafColors = ['#86c9b5', '#79b6d8', '#a3d6c4', '#86bde3'].map((c) => new THREE.Color(c))
  trees.forEach(([x, z, k, rot, ci], i) => {
    treeObstacles.push([x, z, 0.75 * k])
    dummy.rotation.set(0, rot, 0)
    dummy.position.set(x, 0.55 * k, z)
    dummy.scale.set(k, k, k)
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)
    dummy.position.set(x, 1.95 * k, z)
    dummy.scale.set(1.15 * k, 1.0 * k, 1.15 * k)
    dummy.updateMatrix()
    crowns.setMatrixAt(i, dummy.matrix)
    crowns.setColorAt(i, leafColors[ci])
    dummy.position.set(x + 0.15 * k, 2.95 * k, z - 0.1 * k)
    dummy.scale.set(0.78 * k, 0.7 * k, 0.78 * k)
    dummy.updateMatrix()
    tops.setMatrixAt(i, dummy.matrix)
    tops.setColorAt(i, leafColors[(ci + 1) % 4])
  })
  for (const m of [trunks, crowns, tops]) {
    m.castShadow = true
    m.receiveShadow = true
    scene.add(m)
  }

  const flowerPts = []
  for (let tries = 0; tries < 900 && flowerPts.length < 220; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 5 + rand() * (ISLAND_R - 4)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (clear(x, z)) flowerPts.push([x, z])
  }
  const flowerMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.075, 1), std('#ffffff', { roughness: 0.6 }), flowerPts.length)
  const flowerColors = ['#ffffff', '#ffe27a', '#ffb4c8', '#a9c8ff', '#ffffff'].map((c) => new THREE.Color(c))
  flowerPts.forEach(([x, z], i) => {
    dummy.position.set(x, 0.18 + rand() * 0.08, z)
    dummy.rotation.set(0, 0, 0)
    const s = 0.9 + rand() * 0.8
    dummy.scale.set(s, s, s)
    dummy.updateMatrix()
    flowerMesh.setMatrixAt(i, dummy.matrix)
    flowerMesh.setColorAt(i, flowerColors[i % 5])
  })
  scene.add(flowerMesh)

  const tuftPts = []
  for (let tries = 0; tries < 1400 && tuftPts.length < 240; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 4 + rand() * (ISLAND_R - 3)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (clear(x, z)) tuftPts.push([x, z])
  }
  const tuftMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.38, 5), std('#8fd3b1', { roughness: 0.9 }), tuftPts.length * 3)
  tuftPts.forEach(([x, z], i) => {
    for (let k = 0; k < 3; k += 1) {
      dummy.position.set(x + (k - 1) * 0.08, 0.22, z + (rand() - 0.5) * 0.1)
      dummy.rotation.set((rand() - 0.5) * 0.4, 0, (rand() - 0.5) * 0.5)
      const s = 0.8 + rand() * 0.9
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      tuftMesh.setMatrixAt(i * 3 + k, dummy.matrix)
    }
  })
  scene.add(tuftMesh)

  const rockMesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.7, 0), std('#b5c6e2', { roughness: 0.9, flatShading: true }), 16)
  let rocks = 0
  for (let tries = 0; tries < 400 && rocks < 16; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 7 + rand() * (ISLAND_R - 6)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (!clear(x, z, 0.6)) continue
    dummy.position.set(x, 0.25, z)
    dummy.rotation.set(rand() * 3, rand() * 3, 0)
    dummy.scale.set(0.7 + rand() * 0.9, 0.5 + rand() * 0.5, 0.7 + rand() * 0.9)
    dummy.updateMatrix()
    rockMesh.setMatrixAt(rocks, dummy.matrix)
    treeObstacles.push([x, z, 0.8])
    rocks += 1
  }
  rockMesh.count = rocks
  rockMesh.castShadow = true
  rockMesh.receiveShadow = true
  scene.add(rockMesh)

  // 포슬포슬 떠다니는 빛 입자
  const MOTES = 80
  const moteBase = []
  const motePos = new Float32Array(MOTES * 3)
  for (let i = 0; i < MOTES; i += 1) {
    const a = rand() * Math.PI * 2
    const rr = rand() * (BOUND + 2)
    moteBase.push([Math.cos(a) * rr, 0.8 + rand() * 4, Math.sin(a) * rr, rand() * 6])
  }
  const moteGeo = new THREE.BufferGeometry()
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3))
  const motes = new THREE.Points(
    moteGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.34, map: glow, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  scene.add(motes)

  const character = buildCharacter(accent, blob)
  scene.add(character)

  // 그림자는 지형(섬, 구역 바닥)이 받고, 입체물은 드리웁니다.
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return
    if (o.material?.isMeshStandardMaterial && o.geometry && !o.geometry.userData.flat) {
      const h = o.geometry.parameters?.height ?? 1
      o.castShadow = o.geometry.type !== 'CircleGeometry' && o.geometry.type !== 'PlaneGeometry' && h > 0.12
      o.receiveShadow = true
    }
  })
  island.castShadow = false

  const pos = new THREE.Vector3(0, 0, 3.4)
  let facing = Math.PI
  const keys = { up: false, down: false, left: false, right: false }
  const stick = { x: 0, y: 0 }
  let target = null
  let nearId = null
  let zoneId = null

  // e.key 대신 e.code를 씁니다. 한글 입력 상태에서는 W가 ㅈ으로 들어와 e.key로는 인식되지 않습니다.
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  }
  const OPEN = new Set(['Enter', 'NumpadEnter', 'KeyE', 'Space'])

  const activate = () => {
    const hit = landmarks.find((l) => l.id === nearId)
    if (hit) onActivate?.(hit.href)
  }

  const typing = (el) => el instanceof Element && el.closest('input, textarea, select, [contenteditable="true"]')
  const onKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return
    if (KEYMAP[e.code]) {
      keys[KEYMAP[e.code]] = true
      target = null
      e.preventDefault()
    } else if (OPEN.has(e.code)) {
      // 버튼이나 링크에 포커스가 있을 때의 Enter와 Space는 그 요소의 동작을 그대로 둡니다.
      if (nearId && !(e.target instanceof Element && e.target.closest('a, button'))) {
        e.preventDefault()
        activate()
      }
    }
  }
  const onKeyUp = (e) => {
    if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false
  }
  const onBlur = () => {
    keys.up = keys.down = keys.left = keys.right = false
  }
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)

  let narrow = false
  const size = () => {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // 세로로 긴 화면에서는 시야를 넓혀 월드가 잘리지 않게
    narrow = w / h < 0.8
    camera.fov = narrow ? 58 : 40
    camera.updateProjectionMatrix()
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(container)

  const v = new THREE.Vector3()
  const camTarget = new THREE.Vector3()
  const focus = { x: 0, z: -1.5 }
  const widths = new WeakMap()
  const project = (el, x, y, z, fadeFrom, fadeTo, extra = 0, mul = 1) => {
    v.set(x, y, z).project(camera)
    const w = container.clientWidth
    const h = container.clientHeight
    const dist = Math.hypot(x - pos.x, z - pos.z)
    const visible = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1
    const a = fadeTo === undefined ? 1 : Math.min(1, Math.max(0, (fadeTo - dist) / (fadeTo - fadeFrom)))
    el.style.opacity = visible ? String(Math.max(a, extra) * mul) : '0'
    let lw = widths.get(el)
    if (!lw) {
      lw = el.offsetWidth
      if (lw) widths.set(el, lw)
    }
    const half = (lw || 0) / 2 + 6
    const px = Math.min(Math.max(((v.x + 1) / 2) * w, half), w - half)
    el.style.transform = `translate3d(${px}px, ${((1 - v.y) / 2) * h}px, 0) translate(-50%, -100%)`
  }

  let raf = 0
  let last = performance.now()
  let running = false
  let visibleInView = true
  let blend = 0 // 0 = 전체 조망, 1 = 구역 근접

  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now

    let ix = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + stick.x
    let iz = (keys.down ? 1 : 0) - (keys.up ? 1 : 0) + stick.y
    let len = Math.hypot(ix, iz)
    if (len < 0.08 && target) {
      ix = target.x - pos.x
      iz = target.z - pos.z
      const d = Math.hypot(ix, iz)
      if (d < 0.25) {
        target = null
        len = 0
      } else {
        ix /= d
        iz /= d
        len = 1
      }
    } else if (len >= 0.08) {
      target = null
    }

    const moving = len >= 0.08
    if (moving) {
      const k = Math.min(len, 1) / len
      pos.x += ix * k * SPEED * dt
      pos.z += iz * k * SPEED * dt
      const want = Math.atan2(ix, iz)
      let diff = want - facing
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      facing += diff * Math.min(1, dt * 12)
    }

    // 랜드마크, 나무, 바위와 겹치지 않게 밀어내고, 섬 밖으로 나가지 않게 제한
    for (const l of landmarks) {
      const dx = pos.x - l.x
      const dz = pos.z - l.z
      const d = Math.hypot(dx, dz)
      if (d < 1.7 && d > 0.0001) {
        pos.x = l.x + (dx / d) * 1.7
        pos.z = l.z + (dz / d) * 1.7
      }
    }
    for (const [tx, tz, tr] of treeObstacles) {
      const dx = pos.x - tx
      const dz = pos.z - tz
      if (Math.abs(dx) > 2 || Math.abs(dz) > 2) continue
      const d = Math.hypot(dx, dz)
      const rr = tr + 0.4
      if (d < rr && d > 0.0001) {
        pos.x = tx + (dx / d) * rr
        pos.z = tz + (dz / d) * rr
      }
    }
    const r = Math.hypot(pos.x, pos.z)
    if (r > BOUND) {
      pos.x = (pos.x / r) * BOUND
      pos.z = (pos.z / r) * BOUND
    }

    const t = now / 1000
    const run = moving ? 1 : 0
    const step = Math.sin(t * 14)
    const bob = moving ? Math.abs(step) * 0.2 : Math.sin(t * 2.2) * 0.025
    character.position.set(pos.x, 0, pos.z)
    character.rotation.y = facing
    const { rig, head, eyes, ahoge } = character.userData
    rig.position.y = bob
    rig.rotation.z = moving ? step * 0.08 : Math.sin(t * 1.3) * 0.02
    // 통통 튀는 늘어남과 찌그러짐
    const squash = moving ? Math.abs(step) : 0
    rig.scale.set(1 + (1 - squash) * 0.03, 1 - (1 - squash) * 0.04 + squash * 0.02, 1 + (1 - squash) * 0.03)
    head.rotation.z = moving ? step * 0.07 : Math.sin(t * 1.1) * 0.05
    head.rotation.x = moving ? 0.05 : Math.sin(t * 0.9) * 0.03
    ahoge.rotation.z = Math.sin(t * (moving ? 12 : 3)) * (moving ? 0.35 : 0.18)
    const blink = (t % 3.6) < 0.13 ? 0.12 : 1
    eyes.scale.y += (blink - eyes.scale.y) * 0.6
    character.userData.shadow.scale.setScalar(1 - bob * 0.9)
    const { legL, legR, armL, armR } = character.userData.limbs
    const swing = step * 0.9 * run
    legL.rotation.x = swing
    legR.rotation.x = -swing
    armL.rotation.x = -swing * 1.1
    armR.rotation.x = swing * 1.1
    armL.rotation.z = -0.15 - (moving ? 0.25 : Math.sin(t * 1.6) * 0.06)
    armR.rotation.z = 0.15 + (moving ? 0.25 : Math.sin(t * 1.6 + 1) * 0.06)

    sky.position.set(camera.position.x, 0, camera.position.z)
    for (const c of clouds) {
      if (c.userData.speed) {
        c.position.x += c.userData.speed * dt
        if (c.position.x > 130) c.position.x = -130
      } else if (c.userData.float !== undefined) {
        c.position.y += Math.sin(t * 0.6 + c.userData.float) * 0.002
      }
    }
    const mp = moteGeo.attributes.position
    for (let i = 0; i < MOTES; i += 1) {
      const [bx, by, bz, ph] = moteBase[i]
      mp.setXYZ(i, bx + Math.sin(t * 0.4 + ph) * 0.9, by + Math.sin(t * 0.7 + ph * 2) * 0.45, bz + Math.cos(t * 0.35 + ph) * 0.9)
    }
    mp.needsUpdate = true

    // 가까운 랜드마크와 현재 구역 (바뀔 때만 알림)
    let best = null
    let bestD = NEAR
    for (const l of landmarks) {
      const d = Math.hypot(pos.x - l.x, pos.z - l.z)
      if (d < bestD) {
        best = l
        bestD = d
      }
    }
    for (const l of landmarks) {
      const isNear = l === best
      l.ring.visible = isNear
      if (isNear) l.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.04)
      l.base += ((isNear ? 1.07 : 1) - l.base) * Math.min(1, dt * 8)
      l.body.scale.setScalar(l.base * (l.scale ?? 1))
      l.label.classList.toggle('is-near', isNear)
    }
    const nextNear = best ? best.id : null
    if (nextNear !== nearId) {
      nearId = nextNear
      onNear?.(best ? { id: best.id, title: best.title, sub: best.sub, href: best.href } : null)
    }
    let nextZone = null
    for (const z of zoneInfo) {
      if (Math.hypot(pos.x - z.x, pos.z - z.z) < ZONE_DISC + 1.2) nextZone = z.id
    }
    if (nextZone !== zoneId) {
      zoneId = nextZone
      onZone?.(nextZone)
    }
    for (const a of animators) a(t)

    // 카메라: 광장에서는 멀리 전체를, 구역에서는 가까이 건물을 비춥니다.
    const zi = zoneInfo.find((z) => z.id === zoneId)
    blend += ((zi ? 1 : 0) - blend) * (1 - Math.exp(-dt * 2.2))
    const k = 1 - Math.exp(-dt * 3)
    const fx = zi ? pos.x + (zi.mx - pos.x) * 0.6 : pos.x
    const fz = zi ? pos.z + (zi.mz - pos.z) * 0.6 : pos.z - 2.2
    focus.x += (fx - focus.x) * k
    focus.z += (fz - focus.z) * k
    camOffset.lerpVectors(camOverview, camZone, blend)
    if (narrow) camOffset.multiplyScalar(1.25)
    camTarget.set(focus.x, 0, focus.z).add(camOffset)
    camera.position.lerp(camTarget, 1 - Math.exp(-dt * 4.5))
    camera.lookAt(focus.x, 0.8, focus.z)

    // 해의 그림자 카메라가 캐릭터 주변만 선명하게 덮도록 따라다닙니다.
    sun.position.set(focus.x + sunOffset.x, sunOffset.y, focus.z + sunOffset.z)
    sun.target.position.set(focus.x, 0, focus.z)
    renderer.render(scene, camera)

    // 구역 이름표는 구역 밖에서만 보이고, 안에서는 상단 안내가 대신합니다.
    for (const z of zoneInfo) {
      const dz = Math.hypot(pos.x - z.x, pos.z - z.z)
      project(z.label, z.x, 0.5, z.z, 16, 30, 0, Math.min(1, Math.max(0, (dz - 5.5) / 5)))
    }
    for (const l of landmarks) project(l.label, l.x, 4.2, l.z, 7, 13, l === best ? 1 : 0)
  }

  const start = () => {
    if (running || document.hidden || !visibleInView) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }
  const onVisibility = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVisibility)
  const io = new IntersectionObserver(([entry]) => {
    visibleInView = entry.isIntersecting
    if (visibleInView) start()
    else stop()
  })
  io.observe(container)
  start()

  return {
    setStick(x, y) {
      stick.x = x
      stick.y = y
    },
    goTo(id) {
      const z = zoneInfo.find((zz) => zz.id === id)
      if (z) target = { x: z.ax, z: z.az }
    },
    activate,
    dispose() {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      const textures = new Set()
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        mats.forEach((m) => {
          if (m.map) textures.add(m.map)
          m.dispose()
        })
      })
      textures.forEach((tx) => tx.dispose())
      blob.dispose()
      glow.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      labelLayer.remove()
    },
  }
}
