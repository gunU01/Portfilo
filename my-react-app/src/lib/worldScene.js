import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { createPhysics, GRAVITY } from './worldPhysics.js'
import { createSlime } from './worldSlime.js'
import {
  terrainHeight,
  buildTerrain,
  buildTreeGeometry,
  buildRockGeometry,
  buildBushGeometry,
  buildBladeGeometry,
  buildFlowerGeometry,
  makeGrassMaterial,
} from './worldNature.js'

// 푸른 초원 한가운데 울타리로 둘러싼 장난감 같은 놀이터(어린이 게임 배경 느낌). React와 분리해 두어, 월드를 열 때만(lazy import) three가 로드됩니다.
// 외부 모델 없이 기본 도형, 캔버스 텍스처, 환경광으로 질감을 내고, 화면 밖이나 탭이 숨겨지면 렌더를 멈춥니다.

const ZONE_RADIUS = 12.5 // 월드 중심(광장)에서 구역 중심까지
const ZONE_DISC = 6.2
const NEAR = 2.9
const BOUND = 21.5 // 걸어 다닐 수 있는 반경
const FENCE_R = BOUND + 1.15 // 울타리 위치. 슬라임과 공은 이 안쪽에서만 움직입니다.
const SPEED = 6.5
const HUB_R = 3.5

const AXIS_X = new THREE.Vector3(1, 0, 0)
const AXIS_Z = new THREE.Vector3(0, 0, 1)
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

const clearingTex = () =>
  canvasTexture(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2)
    r.addColorStop(0, 'rgba(226,214,160,0.62)')
    r.addColorStop(0.7, 'rgba(200,214,150,0.4)')
    r.addColorStop(1, 'rgba(200,214,150,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, h)
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

const detailTex = (rand) =>
  canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 70; i += 1) {
      const x = rand() * w
      const y = rand() * h
      const r = 12 + rand() * 38
      const grad = g.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, rand() > 0.5 ? 'rgba(40,110,60,0.16)' : 'rgba(255,255,210,0.2)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grad
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    g.lineWidth = 1
    for (let i = 0; i < 1400; i += 1) {
      const x = rand() * w
      const y = rand() * h
      g.strokeStyle = rand() > 0.5 ? 'rgba(30,100,50,0.2)' : 'rgba(240,255,190,0.28)'
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + (rand() - 0.5) * 3, y - 2 - rand() * 5)
      g.stroke()
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

  // 수상: 광택 나는 트로피
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
    return { group: g, anim: null }
  },
}

function buildLandmark(shape, tint, scale = 1) {
  const g = new THREE.Group()
  const ped = new THREE.Group()
  ped.scale.setScalar(shape === 'trophy' ? 0.78 : 1)
  const slab = new THREE.Mesh(buildRockGeometry(41, 5), std('#ffffff', { roughness: 0.93, vertexColors: true }))
  slab.scale.set(2.0, 0.6, 2.0)
  slab.position.y = -0.04
  slab.castShadow = true
  slab.receiveShadow = true
  ped.add(slab)
  g.add(ped)
  const built = (SHAPES[shape] ?? SHAPES.house)(tint)
  built.group.scale.setScalar(scale)
  g.add(built.group)
  return { group: g, anim: built.anim, body: built.group }
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


// 동물의 숲처럼 먼 땅이 아래로 말려 내려가 지평선이 둥글게 보입니다. 가까운 곳(놀이터)은 그대로입니다.
const BEND_CHUNK = THREE.ShaderChunk.project_vertex
function bendWorld(on) {
  THREE.ShaderChunk.project_vertex = on
    ? BEND_CHUNK.replace(
        'gl_Position = projectionMatrix * mvPosition;',
        `#ifndef DEPTH_PACKING
          float bendD = max(-mvPosition.z - 26.0, 0.0);
          mvPosition.y -= bendD * bendD * 0.0022;
        #endif
        gl_Position = projectionMatrix * mvPosition;`,
      )
    : BEND_CHUNK
}

export function createWorld({ container, zones, onNear, onZone, onActivate }) {
  bendWorld(true)
  const accent = css(container, '--accent', '#1f6bff')
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const query = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const forceFull = query.get('fx') === 'full'

  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  const basePixelRatio = Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2)
  renderer.setPixelRatio(basePixelRatio)
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  container.prepend(renderer.domElement)
  // 여름 햇살 색보정: 캔버스 위에 부드러운 녹음빛 필터를 덮습니다.
  const grade = document.createElement('div')
  grade.className = 'world__grade'
  grade.setAttribute('aria-hidden', 'true')
  container.append(grade)

  const HORIZON = new THREE.Color('#d8f1ff')
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(HORIZON, 90, 320)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const roomEnv = new RoomEnvironment()
  const envTex = pmrem.fromScene(roomEnv, 0.04).texture
  scene.environment = envTex
  scene.environmentIntensity = 0.5
  roomEnv.dispose()

  scene.add(new THREE.HemisphereLight(0xe6f6ff, 0xd8f0a8, 1.25))
  const sun = new THREE.DirectionalLight(0xfff4d6, 1.9)
  const sunOffset = new THREE.Vector3(-14, 24, 12)
  sun.castShadow = true
  sun.shadow.mapSize.set(coarse ? 1536 : 2048, coarse ? 1536 : 2048)
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 2, far: 80 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.035
  scene.add(sun, sun.target)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 700)
  camera.position.set(0, 19, 23)
  const camOffset = new THREE.Vector3(0, 13, 15.5)
  const camOverview = new THREE.Vector3(0, 12, 14.5)
  const camZone = new THREE.Vector3(0, 10, 13.2)

  // ---------- 후처리(블룸): 슬라임과 등불이 부드럽게 번집니다 ----------
  let composer = null
  let bloomPass = null
  let bloomOn = !coarse || forceFull
  const makeComposer = () => {
    try {
      const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 })
      composer = new EffectComposer(renderer, rt)
      composer.addPass(new RenderPass(scene, camera))
      bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.65, 0.55, 2.0)
      composer.addPass(bloomPass)
      composer.addPass(new OutputPass())
    } catch {
      composer = null
      bloomOn = false
    }
  }
  if (bloomOn) makeComposer()

  // ---------- 하늘 ----------
  const sky = new THREE.Group()
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color('#62b6ff') },
      mid: { value: new THREE.Color('#d8f1ff') },
      low: { value: new THREE.Color('#eaf8ff') },
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
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(250, 32, 18), skyMat)
  skyDome.renderOrder = -10
  sky.add(skyDome)
  const glow = glowTex()
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xfff3c8, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }))
  sunSprite.scale.set(90, 90, 1)
  sunSprite.position.set(70, 85, -170)
  sky.add(sunSprite)
  scene.add(sky)

  // 무지개
  const rainbow = new THREE.Group()
  ;['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#9775fa', '#e599f7'].forEach((c, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(52 - i * 1.9, 1.0, 10, 90, Math.PI),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.5, fog: false, depthWrite: false }),
    )
    rainbow.add(arc)
  })
  rainbow.position.set(0, -4, -150)
  rainbow.scale.setScalar(1.5)
  scene.add(rainbow)

  const drifters = []
  for (let i = 0; i < 16; i += 1) {
    const c = buildCloud(rand)
    const a = rand() * Math.PI * 2
    const r = 42 + rand() * 80
    c.position.set(Math.cos(a) * r, 20 + rand() * 18, Math.sin(a) * r - 20)
    c.scale.setScalar(0.9 + rand() * 1.1)
    c.userData.speed = 0.35 + rand() * 0.5
    scene.add(c)
    drifters.push(c)
  }

  const dummy = new THREE.Object3D()

  // ---------- 푸른 초원: 울타리 밖은 끝없이 이어지는 언덕입니다 ----------
  const terrainTex = detailTex(rand)
  terrainTex.wrapS = terrainTex.wrapT = THREE.RepeatWrapping
  terrainTex.repeat.set(233, 233)
  terrainTex.anisotropy = 8
  const terrain = new THREE.Mesh(buildTerrain(rand), new THREE.MeshStandardMaterial({ vertexColors: true, map: terrainTex, roughness: 1 }))
  terrain.receiveShadow = true
  scene.add(terrain)

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

  const zoneTint = [accent, new THREE.Color('#ffab2e'), new THREE.Color('#ff6fa3')]
  const clearing = clearingTex()

  // 물리 기둥 목록(걷기, 부딪힘, 올라타기)
  const columns = []

  const zoneInfo = []
  const landmarks = []
  const animators = []
  const stones = []
  const hedges = []

  zones.forEach((zone, zi) => {
    const theta = -Math.PI / 2 + (zi * 2 * Math.PI) / zones.length
    const cx = Math.cos(theta) * ZONE_RADIUS
    const cz = Math.sin(theta) * ZONE_RADIUS
    const tint = zoneTint[zi % 3]

    const patchMesh = new THREE.Mesh(new THREE.CircleGeometry(ZONE_DISC + 1.2, 64), new THREE.MeshBasicMaterial({ map: clearing, transparent: true, depthWrite: false }))
    patchMesh.rotation.x = -Math.PI / 2
    patchMesh.position.set(cx, 0.03, cz)
    scene.add(patchMesh)

    for (let k = 0; k < 40; k += 1) {
      const a = (k / 40) * Math.PI * 2
      const d = Math.atan2(Math.sin(a - (theta + Math.PI)), Math.cos(a - (theta + Math.PI)))
      if (Math.abs(d) < 0.42) continue
      hedges.push([cx + Math.cos(a) * (ZONE_DISC + 0.45), cz + Math.sin(a) * (ZONE_DISC + 0.45), 0.5 + rand() * 0.25])
    }

    const dx = Math.cos(theta)
    const dz = Math.sin(theta)
    const start = HUB_R + 0.4
    const end = ZONE_RADIUS - ZONE_DISC - 0.2
    for (let s = start, i = 0; s < end; s += 1.05, i += 1) {
      const side = Math.sin(i * 1.7) * 0.18
      stones.push([dx * s - dz * side, dz * s + dx * side, rand() * Math.PI, 0.62 + rand() * 0.1])
    }

    const info = { id: zone.id, name: zone.name, x: cx, z: cz, mx: cx, mz: cz, label: makeLabel(zone.name, 'world__zone'), dx, dz }
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
      built.group.position.set(x, 0.12, z)
      built.group.rotation.y = -phi - Math.PI / 2
      scene.add(built.group)

      const ring = new THREE.Mesh(new THREE.RingGeometry(2.05, 2.3, 48), basic(itemTint, { side: THREE.DoubleSide, transparent: true, opacity: 0.9 }))
      ring.rotation.x = -Math.PI / 2
      ring.position.set(x, 0.06, z)
      ring.visible = false
      scene.add(ring)

      const shadowBlob = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false }))
      shadowBlob.rotation.x = -Math.PI / 2
      shadowBlob.position.set(x, 0.05, z)
      scene.add(shadowBlob)

      const label = makeLabel(item.short ?? item.title, 'world__label')
      const lm = { ...item, x, z, mesh: built.group, body: built.body, ring, label, anim: built.anim, base: 1, tilt: { x: 0, z: 0, vx: 0, vz: 0 } }
      landmarks.push(lm)
      if (built.anim) animators.push(built.anim)
      // 받침대는 올라설 수 있고, 건물은 단단하게 막으며 부딪히면 흔들립니다.
      columns.push({ x, z, r: item.shape === 'trophy' ? 1.38 : 1.75, top: 0.5, stand: true })
      columns.push({
        x,
        z,
        r: item.shape === 'trophy' ? 0.7 : 1.1,
        top: 4,
        stand: false,
        onHit: (nx, nz, p) => {
          lm.tilt.vx += nz * p * 0.06
          lm.tilt.vz -= nx * p * 0.06
        },
      })
    })
    const mine = landmarks.slice(landmarks.length - n)
    info.mx = mine.reduce((s, l) => s + l.x, 0) / n
    info.mz = mine.reduce((s, l) => s + l.z, 0) / n
    info.ax = cx - dx * 1.0
    info.az = cz - dz * 1.0
  })

  // 징검돌(납작한 돌)과 덤불
  const stoneGeo = buildRockGeometry(7, 4)
  const stoneMesh = new THREE.InstancedMesh(stoneGeo, std('#ffffff', { roughness: 0.93, vertexColors: true }), stones.length)
  stones.forEach(([x, z, r, s], i) => {
    dummy.position.set(x, -0.02, z)
    dummy.rotation.set(0, r, 0)
    dummy.scale.set(s * 0.55, 0.2, s * 0.46)
    dummy.updateMatrix()
    stoneMesh.setMatrixAt(i, dummy.matrix)
  })
  stoneMesh.receiveShadow = true
  stoneMesh.computeBoundingSphere()
  scene.add(stoneMesh)

  const hedgeMesh = new THREE.InstancedMesh(buildBushGeometry(5), std('#ffffff', { roughness: 0.85, vertexColors: true }), hedges.length)
  const hedgeTint = new THREE.Color()
  hedges.forEach(([x, z, s], i) => {
    dummy.position.set(x, s * 0.7, z)
    dummy.rotation.set(0, rand() * 6.28, 0)
    dummy.scale.set(s, s * 0.8, s)
    dummy.updateMatrix()
    hedgeMesh.setMatrixAt(i, dummy.matrix)
    hedgeMesh.setColorAt(i, hedgeTint.setRGB(0.88 + rand() * 0.18, 0.92 + rand() * 0.1, 0.88 + rand() * 0.14))
    columns.push({ x, z, r: s * 0.95, top: s * 1.45, stand: true })
  })
  hedgeMesh.castShadow = true
  hedgeMesh.computeBoundingSphere()
  hedgeMesh.receiveShadow = true
  scene.add(hedgeMesh)

  // ---------- 풍경 ----------
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
  const tint = (c, spread = 0.12) => c.setRGB(1 - rand() * spread, 1 - rand() * spread * 0.7, 1 - rand() * spread)

  // 잎이 바람에 살랑이는 재질(나무 꼭대기일수록 크게 흔들립니다)
  const swayMat = (mat, amp) => {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = grassU.uTime
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec4 wp = instanceMatrix * vec4(transformed, 1.0);
            float k = max(position.y, 0.0) * 0.2;
            transformed.x += sin(uTime * 1.4 + wp.x * 0.4 + wp.z * 0.3) * ${amp} * k * k;
            transformed.z += cos(uTime * 1.1 + wp.z * 0.35 + wp.x * 0.2) * ${amp * 0.7} * k * k;
          #endif`,
        )
    }
    return mat
  }
  const grassU = { uTime: { value: 0 }, uSlime: { value: new THREE.Vector3(0, -99, 0) } }

  // ---------- 나무: 울타리 안쪽은 정교한 고폴리, 바깥 언덕은 가벼운 모델 ----------
  const SPECIES = [['oak', 11], ['oak', 23], ['birch', 5], ['pine', 8], ['pine', 31], ['blossom', 4]]
  const trunkMat = std('#ffffff', { roughness: 0.92, vertexColors: true })
  const leafMat = swayMat(std('#ffffff', { roughness: 0.72, vertexColors: true }), 0.045)
  const shadowProxyMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
  const species = SPECIES.map(([kind, sd]) => {
    const lo = buildTreeGeometry(kind, 1, sd)
    return { hi: buildTreeGeometry(kind, 4, sd), mid: buildTreeGeometry(kind, 2, sd), lo, near: [], ring: [], far: [] }
  })
  const nearTrees = []
  for (let tries = 0; tries < 2000 && nearTrees.length < 28; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 14.5 + rand() * (BOUND - 15.2)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (!clear(x, z, 0.4)) continue
    if (nearTrees.some((t) => Math.hypot(t.x - x, t.z - z) < 3.1)) continue
    const t = { x, z, s: 0.75 + rand() * 0.4, rot: rand() * 6.28 }
    nearTrees.push(t)
    species[nearTrees.length % species.length].near.push(t)
    columns.push({ x, z, r: 0.34 * t.s + 0.06, top: 99, stand: false })
  }
  // 놀이터를 둘러싼 숲: 빽빽한 나무와 덤불이 길을 막아, 숲 밖으로 나갈 수 없다는 것을 보여 줍니다.
  const ringTrees = []
  for (let tries = 0; tries < 3000 && ringTrees.length < 78; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = BOUND + 1.0 + rand() * 4.2
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (ringTrees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.5)) continue
    const t = { x, z, s: 1.0 + rand() * 0.7, rot: rand() * 6.28 }
    ringTrees.push(t)
    species[ringTrees.length % species.length].ring.push(t)
  }
  for (let tries = 0; tries < 4000 && species.reduce((n, sp) => n + sp.far.length, 0) < 170; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 28 + Math.pow(rand(), 0.8) * 130
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    const sp = species[Math.floor(rand() * species.length)]
    sp.far.push({ x, z, s: 1.3 + rand() * 1.2 + rr * 0.006, rot: rand() * 6.28, y: terrainHeight(x, z) - 0.2 })
  }
  const treeParts = []
  const placeTrees = (geo, list, mat, { shadow = false, proxy = false } = {}) => {
    if (!list.length) return null
    const m = new THREE.InstancedMesh(geo, mat, list.length)
    const c = new THREE.Color()
    list.forEach((t, i) => {
      dummy.position.set(t.x, t.y ?? 0, t.z)
      dummy.rotation.set(0, t.rot, 0)
      dummy.scale.set(t.s * (0.92 + (i % 3) * 0.06), t.s, t.s * (0.92 + ((i + 1) % 3) * 0.05))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      if (mat === leafMat) m.setColorAt(i, tint(c, 0.16))
    })
    m.castShadow = shadow || proxy
    m.receiveShadow = !proxy
    m.computeBoundingSphere()
    scene.add(m)
    treeParts.push(m)
    return m
  }
  for (const sp of species) {
    placeTrees(sp.hi.trunk, sp.near, trunkMat, { shadow: true })
    placeTrees(sp.hi.leaves, sp.near, leafMat)
    placeTrees(sp.lo.leaves, sp.near, shadowProxyMat, { proxy: true })
    placeTrees(sp.mid.trunk, sp.ring, trunkMat)
    placeTrees(sp.mid.leaves, sp.ring, leafMat)
    placeTrees(sp.lo.trunk, sp.far, trunkMat)
    placeTrees(sp.lo.leaves, sp.far, leafMat)
  }

  // ---------- 바위: 이끼가 낀 고폴리 ----------
  const rockMat = std('#ffffff', { roughness: 0.93, vertexColors: true })
  const rockGeos = [3, 17, 29].map((sd) => buildRockGeometry(sd, 6))
  const rockLists = rockGeos.map(() => [])
  let nearRocks = 0
  for (let tries = 0; tries < 600 && nearRocks < 15; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 7 + rand() * (BOUND - 8)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (!clear(x, z, 0.6)) continue
    const sx = 0.55 + rand() * 0.6
    const sy = sx * (0.65 + rand() * 0.35)
    rockLists[nearRocks % 3].push({ x, z, sx, sy, rot: rand() * 6.28, y: -0.05 })
    columns.push({ x, z, r: 0.95 * sx, top: 0.62 * sy, stand: true })
    nearRocks += 1
  }
  for (let i = 0; i < 70; i += 1) {
    const a = rand() * Math.PI * 2
    const rr = BOUND + 0.8 + Math.pow(rand(), 0.9) * 110
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    const sx = 0.8 + rand() * 2.6
    rockLists[i % 3].push({ x, z, sx, sy: sx * (0.6 + rand() * 0.4), rot: rand() * 6.28, y: terrainHeight(x, z) - 0.1 })
  }
  rockGeos.forEach((geo, k) => {
    const list = rockLists[k]
    const m = new THREE.InstancedMesh(geo, rockMat, list.length)
    list.forEach((r, i) => {
      dummy.position.set(r.x, r.y, r.z)
      dummy.rotation.set(0, r.rot, 0)
      dummy.scale.set(r.sx, r.sy, r.sx * 0.9)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.castShadow = true
    m.receiveShadow = true
    m.computeBoundingSphere()
    scene.add(m)
  })

  // 덤불: 숲 바닥과 가장자리에 무리 지어 자랍니다.
  const bushGeos = [13, 29].map((sd) => buildBushGeometry(sd))
  const bushMat = std('#ffffff', { roughness: 0.85, vertexColors: true })
  const bushLists = [[], []]
  for (let tries = 0; tries < 900 && bushLists[0].length + bushLists[1].length < 120; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 12 + rand() * (BOUND + 5 - 12)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (rr < BOUND - 0.5 && !clear(x, z, 0.5)) continue
    const sc = 0.5 + rand() * 0.8
    bushLists[tries % 2].push({ x, z, s: sc, rot: rand() * 6.28 })
  }
  bushGeos.forEach((geo, k) => {
    const list = bushLists[k]
    const m = new THREE.InstancedMesh(geo, bushMat, list.length)
    const c = new THREE.Color()
    list.forEach((b, i) => {
      dummy.position.set(b.x, b.s * 0.55, b.z)
      dummy.rotation.set(0, b.rot, 0)
      dummy.scale.set(b.s, b.s * 0.85, b.s)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, tint(c, 0.2))
    })
    m.castShadow = true
    m.receiveShadow = true
    m.computeBoundingSphere()
    scene.add(m)
  })

  // ---------- 풀과 꽃: 구역 단위로 나눠 화면 밖은 그리지 않습니다 ----------
  const grassMat = makeGrassMaterial(grassU)
  const bladeNear = buildBladeGeometry(6)
  const bladeFar = buildBladeGeometry(2)
  const grassTiles = []
  const grassTint = [new THREE.Color('#ffffff'), new THREE.Color('#e4ffb4'), new THREE.Color('#bff3e0'), new THREE.Color('#f4ffd0')]
  const addGrassTile = (cx, cz, size, density, geo, near, rMin, rMax, hMin, hMax) => {
    const n = Math.round(size * size * density)
    const m = new THREE.InstancedMesh(geo, grassMat, n)
    let k = 0
    const c = new THREE.Color()
    for (let i = 0; i < n; i += 1) {
      const x = cx + (rand() - 0.5) * size
      const z = cz + (rand() - 0.5) * size
      const r = Math.hypot(x, z)
      if (r < rMin || r >= rMax) continue
      if (near && !clear(x, z, -0.1)) continue
      const h = hMin + rand() * (hMax - hMin)
      dummy.position.set(x, terrainHeight(x, z) - 0.04, z)
      dummy.rotation.set(0, rand() * 6.28, 0)
      dummy.scale.setScalar(h)
      dummy.updateMatrix()
      m.setMatrixAt(k, dummy.matrix)
      m.setColorAt(k, c.copy(grassTint[Math.floor(rand() * grassTint.length)]).multiplyScalar(0.85 + rand() * 0.25))
      k += 1
    }
    if (!k) {
      m.dispose()
      return
    }
    m.count = k
    m.receiveShadow = true
    m.computeBoundingSphere()
    scene.add(m)
    grassTiles.push({ m, near, full: k, x: cx, z: cz, size })
  }
  const NEAR_R = FENCE_R + 0.6
  for (let gx = -3; gx < 3; gx += 1) {
    for (let gz = -3; gz < 3; gz += 1) addGrassTile(gx * 8 + 4, gz * 8 + 4, 8, 12, bladeNear, true, 0, NEAR_R, 0.25, 0.5)
  }
  for (let gx = -5; gx < 5; gx += 1) {
    for (let gz = -5; gz < 5; gz += 1) addGrassTile(gx * 12 + 6, gz * 12 + 6, 12, 2.5, bladeFar, false, NEAR_R, 62, 0.5, 1.0)
  }

  // 꽃: 무리지어 핍니다. 색마다 한 덩어리의 인스턴스로 묶습니다.
  const FLOWERS = [['daisy', '#ffffff'], ['daisy', '#fff0a0'], ['tulip', '#ff5a72'], ['tulip', '#ffb43c'], ['tulip', '#ff8fd0'], ['wild', '#9db8ff'], ['wild', '#c9a8ff']]
  const flowerLists = FLOWERS.map(() => [])
  const patch = (cx, cz, n, spread, kinds) => {
    for (let i = 0; i < n; i += 1) {
      const a = rand() * Math.PI * 2
      const d = Math.pow(rand(), 0.7) * spread
      const x = cx + Math.cos(a) * d
      const z = cz + Math.sin(a) * d
      if (Math.hypot(x, z) < FENCE_R - 0.5 && !clear(x, z, 0.1)) continue
      if (Math.hypot(x, z) >= FENCE_R - 0.5 && Math.hypot(x, z) < FENCE_R + 0.9) continue
      flowerLists[kinds[Math.floor(rand() * kinds.length)]].push({ x, z, s: 1.9 + rand() * 1.2, rot: rand() * 6.28, y: terrainHeight(x, z) - 0.02 })
    }
  }
  for (let i = 0; i < 20; i += 1) {
    const a = rand() * Math.PI * 2
    const rr = 5 + rand() * 16
    const kinds = [[0, 1], [2, 3, 4], [5, 6], [0, 5], [1, 3]][i % 5]
    patch(Math.cos(a) * rr, Math.sin(a) * rr, 26, 2.1, kinds)
  }
  for (let i = 0; i < 22; i += 1) {
    const a = rand() * Math.PI * 2
    const rr = 25 + rand() * 30
    patch(Math.cos(a) * rr, Math.sin(a) * rr, 40, 3.6, [[0, 1], [2, 3, 4], [5, 6], [0, 5], [1, 3]][i % 5])
  }
  FLOWERS.forEach(([kind, petal], k) => {
    const list = flowerLists[k]
    if (!list.length) return
    const m = new THREE.InstancedMesh(buildFlowerGeometry(kind, 3 + k, petal), grassMat, list.length)
    list.forEach((f, i) => {
      dummy.position.set(f.x, f.y, f.z)
      dummy.rotation.set(0, f.rot, 0)
      dummy.scale.setScalar(f.s)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.receiveShadow = true
    m.computeBoundingSphere()
    scene.add(m)
  })

  // ---------- 물리와 슬라임 ----------
  const spawnPos = { x: 0, z: 3.4 }
  const physics = createPhysics({ columns, islandR: 1e5, bound: BOUND, ballBound: BOUND + 0.3, spawn: spawnPos })

  const slime = createSlime(glow)
  slime.setGlow(bloomOn ? 1.7 : 1.3)
  scene.add(slime.group)

  // 물방울 입자와 파문, 지나간 자국
  const DROPS = 140
  const dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.9, 2.2) }), DROPS)
  dropMesh.frustumCulled = false
  scene.add(dropMesh)
  const drops = Array.from({ length: DROPS }, () => ({ life: 0, x: 0, y: -50, z: 0, vx: 0, vy: 0, vz: 0, s: 1 }))
  let dropCursor = 0
  const spawnDrops = (x, y, z, n, power, color) => {
    for (let i = 0; i < n; i += 1) {
      const d = drops[dropCursor]
      dropCursor = (dropCursor + 1) % DROPS
      const a = Math.random() * Math.PI * 2
      const sp = (0.4 + Math.random()) * power
      d.life = 0.5 + Math.random() * 0.6
      d.x = x + Math.cos(a) * 0.3
      d.z = z + Math.sin(a) * 0.3
      d.y = y + 0.15
      d.vx = Math.cos(a) * sp
      d.vz = Math.sin(a) * sp
      d.vy = 2 + Math.random() * power * 0.9
      d.s = 0.5 + Math.random() * 0.8
      if (color) dropMesh.setColorAt(dropCursor, color)
    }
  }
  const RIPPLES = 8
  const ripples = Array.from({ length: RIPPLES }, () => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), new THREE.MeshBasicMaterial({ map: glow, color: 0xcdeeff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))
    m.rotation.x = -Math.PI / 2
    m.visible = false
    scene.add(m)
    return { m, t: 1, life: 0.7 }
  })
  let rippleCursor = 0
  const spawnRipple = (x, y, z, size) => {
    const r = ripples[rippleCursor]
    rippleCursor = (rippleCursor + 1) % RIPPLES
    r.t = 0
    r.size = size
    r.m.position.set(x, y + 0.06, z)
    r.m.visible = true
  }
  const TRAIL = 30
  const trailMesh = new THREE.InstancedMesh(new THREE.CircleGeometry(0.5, 16), new THREE.MeshBasicMaterial({ map: glow, color: 0xbfe6ff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }), TRAIL)
  trailMesh.frustumCulled = false
  scene.add(trailMesh)
  const trail = Array.from({ length: TRAIL }, () => ({ life: 0, x: 0, y: 0, z: 0 }))
  let trailCursor = 0
  let trailTimer = 0

  // 그림자는 입체물이 드리우고, 섬과 구역 바닥이 받습니다.
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return
    if (o.material?.isMeshStandardMaterial && o.geometry && !o.geometry.userData.flat) {
      const h = o.geometry.parameters?.height ?? 1
      o.castShadow = o.geometry.type !== 'CircleGeometry' && o.geometry.type !== 'PlaneGeometry' && h > 0.12
      o.receiveShadow = true
    }
  })

  const pos = new THREE.Vector3()
  const visual = new THREE.Vector3(spawnPos.x, 0, spawnPos.z)
  let target = null
  let nearId = null
  let zoneId = null
  const keys = { up: false, down: false, left: false, right: false }
  const stick = { x: 0, y: 0 }

  // e.key 대신 e.code를 씁니다. 한글 입력 상태에서는 W가 ㅈ으로 들어와 e.key로는 인식되지 않습니다.
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  }
  const OPEN = new Set(['Enter', 'NumpadEnter', 'KeyE'])

  const activate = () => {
    const hit = landmarks.find((l) => l.id === nearId)
    if (hit) onActivate?.(hit.href)
  }

  const typing = (el) => el instanceof Element && el.closest('input, textarea, select, [contenteditable="true"]')
  const onButton = (e) => e.target instanceof Element && e.target.closest('a, button')
  const onKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return
    if (KEYMAP[e.code]) {
      keys[KEYMAP[e.code]] = true
      target = null
      e.preventDefault()
    } else if (e.code === 'Space') {
      if (onButton(e)) return
      e.preventDefault()
      if (!e.repeat) physics.jump()
    } else if (OPEN.has(e.code)) {
      // 버튼이나 링크에 포커스가 있을 때의 Enter는 그 요소의 동작을 그대로 둡니다.
      if (nearId && !onButton(e)) {
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
    if (composer) {
      composer.setPixelRatio(renderer.getPixelRatio())
      composer.setSize(w, h)
      bloomPass?.setSize(w, h)
    }
    camera.aspect = w / h
    narrow = w / h < 0.8
    camera.fov = narrow ? 58 : 40
    camera.updateProjectionMatrix()
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(container)

  const v = new THREE.Vector3()
  const camTarget = new THREE.Vector3()
  const focus = { x: spawnPos.x, z: spawnPos.z - 2.2 }
  const kick = { y: 0, vy: 0 }
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

  // 화질 단계: 2 = 블룸과 전부, 1 = 블룸 끔, 0 = 풀 절반과 그림자 끔
  let quality = bloomOn ? 2 : 1
  const applyQuality = (q) => {
    quality = q
    if (q < 2) {
      bloomOn = false
      slime.setGlow(1.3)
      renderer.setPixelRatio(1)
    }
    if (q < 1) sun.castShadow = false
    for (const g of grassTiles) g.m.count = q === 0 && g.near ? Math.ceil(g.full * 0.5) : g.full
    size()
  }

  let raf = 0
  let last = performance.now()
  let running = false
  let visibleInView = true
  let blend = 0
  let frames = 0
  let frameEma = 0.016
  const splashColor = new THREE.Color(1.6, 1.9, 2.2)

  const handleEvents = () => {
    for (const ev of physics.drain()) {
      if (ev.type === 'land') {
        slime.impact(ev.impact)
        spawnDrops(ev.x, ev.y, ev.z, Math.min(26, Math.round(ev.impact * 1.1)), 1.2 + ev.impact * 0.12, splashColor)
        if (ev.impact > 6) spawnRipple(ev.x, ev.y, ev.z, 1.6 + ev.impact * 0.08)
        if (ev.impact > 12) kick.vy -= ev.impact * 0.05
      } else if (ev.type === 'hop') {
        slime.launch(9)
        spawnDrops(ev.x, ev.y, ev.z, 3, 0.9, splashColor)
      } else if (ev.type === 'jump') {
        slime.launch(14)
        spawnDrops(ev.x, ev.y, ev.z, 8, 1.6, splashColor)
        spawnRipple(ev.x, ev.y, ev.z, 1.5)
      } else if (ev.type === 'bounce') {
        if (!ev.ball) {
          slime.impact(ev.impact * 0.6)
          slime.launch(18)
          kick.vy -= 0.5
        }
        spawnDrops(ev.x, ev.y, ev.z, 14, 2.4, splashColor)
        spawnRipple(ev.x, ev.y, ev.z, 2.2)
      } else if (ev.type === 'knock') {
        spawnDrops(ev.x, ev.y + 0.3, ev.z, 4, 1.2, splashColor)
      } else if (ev.type === 'ballbounce') {
        spawnDrops(ev.x, ev.y, ev.z, 3, 1, splashColor)
      }
    }
  }

  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = now / 1000

    // 입력 → 방향과 세기
    let ix = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + stick.x
    let iz = (keys.down ? 1 : 0) - (keys.up ? 1 : 0) + stick.y
    let len = Math.hypot(ix, iz)
    if (len < 0.08 && target) {
      ix = target.x - physics.slime.x
      iz = target.z - physics.slime.z
      const d = Math.hypot(ix, iz)
      if (d < 0.45) {
        target = null
        len = 0
      } else {
        len = 1
        ix /= d
        iz /= d
      }
    } else if (len >= 0.08) {
      target = null
    }
    const mag = len >= 0.08 ? Math.min(len, 1) : 0
    if (len > 0) {
      ix /= Math.max(len, 1e-6)
      iz /= Math.max(len, 1e-6)
    }
    physics.update(dt, { ix, iz, mag })
    handleEvents()
    const s = physics.slime
    pos.set(s.x, s.y, s.z)

    // 눈에 보이는 위치는 단차를 부드럽게 올라갑니다.
    visual.x = s.x
    visual.z = s.z
    visual.y += (s.y - visual.y) * Math.min(1, dt * (s.y > visual.y ? 28 : 40))
    if (Math.abs(s.y - visual.y) > 1.5) visual.y = s.y
    slime.group.position.copy(visual)
    slime.group.scale.setScalar(slime.radius)
    slime.update(dt, t, s, { mag })

    // 지나간 자국
    trailTimer -= dt
    if (s.grounded && Math.hypot(s.vx, s.vz) > 2 && trailTimer <= 0) {
      trailTimer = 0.12
      const tr = trail[trailCursor]
      trailCursor = (trailCursor + 1) % TRAIL
      tr.life = 1.1
      tr.x = s.x
      tr.y = s.y + 0.04
      tr.z = s.z
    }
    trail.forEach((tr, i) => {
      tr.life = Math.max(0, tr.life - dt)
      dummy.position.set(tr.x, tr.y, tr.z)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      const k = tr.life / 1.1
      dummy.scale.setScalar(Math.max(0.0001, k * 1.1))
      dummy.updateMatrix()
      trailMesh.setMatrixAt(i, dummy.matrix)
    })
    trailMesh.instanceMatrix.needsUpdate = true

    // 물방울
    drops.forEach((d, i) => {
      if (d.life > 0) {
        d.life -= dt
        d.vy += GRAVITY * 0.7 * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.z += d.vz * dt
        const ground = physics.groundAt(d.x, d.z, d.y + 1).h
        if (d.y < ground + 0.05) {
          d.y = ground + 0.05
          d.vy *= -0.3
          d.vx *= 0.6
          d.vz *= 0.6
        }
      }
      const live = d.life > 0
      dummy.position.set(d.x, d.y, d.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(live ? d.s * Math.min(1, d.life * 3) : 0.0001)
      dummy.updateMatrix()
      dropMesh.setMatrixAt(i, dummy.matrix)
    })
    dropMesh.instanceMatrix.needsUpdate = true
    for (const r of ripples) {
      if (!r.m.visible) continue
      r.t += dt / r.life
      if (r.t >= 1) {
        r.m.visible = false
        continue
      }
      const sc = 0.3 + r.t * r.size
      r.m.scale.set(sc, sc, 1)
      r.m.material.opacity = (1 - r.t) * 0.7
    }

    // 건물은 부딪히면 말랑하게 흔들립니다.
    for (const l of landmarks) {
      const tl = l.tilt
      tl.vx += (-60 * tl.x - 5 * tl.vx) * dt
      tl.vz += (-60 * tl.z - 5 * tl.vz) * dt
      tl.x += tl.vx * dt
      tl.z += tl.vz * dt
      l.body.rotation.x = tl.x
      l.body.rotation.z = tl.z
    }
    grassU.uTime.value = t
    grassU.uSlime.value.set(pos.x, pos.y, pos.z)

    sky.position.set(camera.position.x, 0, camera.position.z)
    for (const c of drifters) {
      if (c.userData.speed) {
        c.position.x += c.userData.speed * dt
        if (c.position.x > 130) c.position.x = -130
      } else if (c.userData.float !== undefined) {
        c.position.y += Math.sin(t * 0.6 + c.userData.float) * 0.002
      }
    }

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

    // 카메라: 광장에서는 멀리 전체를, 구역에서는 가까이. 착지 충격으로 살짝 흔들립니다.
    const zi = zoneInfo.find((z) => z.id === zoneId)
    blend += ((zi ? 1 : 0) - blend) * (1 - Math.exp(-dt * 2.2))
    const k = 1 - Math.exp(-dt * 3)
    const fx = zi ? pos.x + (zi.mx - pos.x) * 0.6 : pos.x
    const fz = zi ? pos.z + (zi.mz - pos.z) * 0.6 : pos.z - 2.2
    focus.x += (fx - focus.x) * k
    focus.z += (fz - focus.z) * k
    camOffset.lerpVectors(camOverview, camZone, blend)
    if (narrow) camOffset.multiplyScalar(1.25)
    kick.vy += (-120 * kick.y - 9 * kick.vy) * dt
    kick.y += kick.vy * dt
    camTarget.set(focus.x, 0, focus.z).add(camOffset)
    camera.position.lerp(camTarget, 1 - Math.exp(-dt * 4.5))
    camera.lookAt(focus.x, 0.8 + visual.y * 0.35 + kick.y, focus.z)

    sun.position.set(focus.x + sunOffset.x, sunOffset.y, focus.z + sunOffset.z)
    sun.target.position.set(focus.x, 0, focus.z)

    if (bloomOn && composer) composer.render()
    else renderer.render(scene, camera)

    for (const z of zoneInfo) {
      const dz = Math.hypot(pos.x - z.x, pos.z - z.z)
      project(z.label, z.x, 0.5, z.z, 16, 30, 0, Math.min(1, Math.max(0, (dz - 5.5) / 5)))
    }
    for (const l of landmarks) project(l.label, l.x, 4.2, l.z, 7, 13, l === best ? 1 : 0)

    // 느린 기기에서는 효과를 낮춰 부드러운 움직임을 지킵니다.
    frames += 1
    frameEma += ((now - (frame.prev ?? now)) / 1000 - frameEma) * 0.05
    frame.prev = now
    if (!forceFull && frameEma > 0.045) {
      if (frames === 150 && quality === 2) applyQuality(1)
      else if (frames === 420 && quality === 1) applyQuality(0)
    }
    // 멀리 있는 풀 구역은 그리지 않습니다.
    if (frames % 20 === 0) {
      for (const g of grassTiles) {
        const d = Math.hypot(g.x - camera.position.x, g.z - camera.position.z)
        g.m.visible = g.near || (quality > 0 && d < 90)
      }
    }
  }

  const start0 = () => {
    if (running || document.hidden || !visibleInView) return
    running = true
    last = performance.now()
    frame.prev = undefined
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }
  const onVisibility = () => (document.hidden ? stop() : start0())
  document.addEventListener('visibilitychange', onVisibility)
  const io = new IntersectionObserver(([entry]) => {
    visibleInView = entry.isIntersecting
    if (visibleInView) start0()
    else stop()
  })
  io.observe(container)
  start0()

  return {
    setStick(x, y) {
      stick.x = x
      stick.y = y
    },
    jump() {
      physics.jump()
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
      composer?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      labelLayer.remove()
      grade.remove()
      bendWorld(false)
    },
  }
}
