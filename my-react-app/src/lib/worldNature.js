import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

// 자연 요소를 코드로 만드는 모듈: 지형, 나무, 풀, 꽃, 바위, 나비.
// 외부 모델 없이 노이즈로 형태를 깎고, 정점 색으로 명암과 이끼를 칠한 뒤 한 번만 병합해 인스턴싱합니다.
// 같은 모양은 인스턴스 하나로 묶고, 풀은 구역 단위로 나눠 화면 밖 구역은 그리지 않습니다.

export const FLAT_R = 36 // 이 안은 평지(물리 바닥), 바깥은 완만한 언덕

// ---------- 노이즈 ----------
const hash = (n) => {
  const s = Math.sin(n) * 43758.5453
  return s - Math.floor(s)
}
const smooth = (t) => t * t * (3 - 2 * t)
const lerp = (a, b, t) => a + (b - a) * t

export function vnoise3(x, y, z) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = smooth(x - ix)
  const fy = smooth(y - iy)
  const fz = smooth(z - iz)
  const h = (a, b, c) => hash(a + b * 57.1 + c * 113.7)
  return lerp(
    lerp(lerp(h(ix, iy, iz), h(ix + 1, iy, iz), fx), lerp(h(ix, iy + 1, iz), h(ix + 1, iy + 1, iz), fx), fy),
    lerp(lerp(h(ix, iy, iz + 1), h(ix + 1, iy, iz + 1), fx), lerp(h(ix, iy + 1, iz + 1), h(ix + 1, iy + 1, iz + 1), fx), fy),
    fz,
  )
}

export function fbm3(x, y, z, oct = 4) {
  let a = 0.5
  let f = 1
  let s = 0
  let n = 0
  for (let i = 0; i < oct; i += 1) {
    s += a * vnoise3(x * f, y * f, z * f)
    n += a
    a *= 0.5
    f *= 2.02
  }
  return s / n
}

export function terrainHeight(x, z) {
  const r = Math.hypot(x, z)
  if (r <= FLAT_R) return 0
  const k = smooth(Math.min(1, (r - FLAT_R) / 80))
  const hills = fbm3(x * 0.011 + 3.1, 0, z * 0.011 - 1.7, 4) * 18 + fbm3(x * 0.04, 1.3, z * 0.04, 2) * 0.9
  return k * hills + (r - FLAT_R) * 0.018 * k
}

// ---------- 지형(범위 밖 푸른 초원과 언덕) ----------
export function buildTerrain(rand) {
  const SIZE = 1400
  const SEG = 280
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const a = new THREE.Color('#8fdc6b')
  const b = new THREE.Color('#a6e67a')
  const c = new THREE.Color('#7fd464')
  const d = new THREE.Color('#bdeb94')
  const tmp = new THREE.Color()
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const h = terrainHeight(x, z)
    pos.setY(i, h)
    const n = fbm3(x * 0.05, 0, z * 0.05, 3)
    const far = Math.min(1, Math.hypot(x, z) / 260)
    tmp.copy(a).lerp(b, n * 0.9).lerp(c, Math.max(0, 0.5 - n) * 0.8).lerp(d, far * 0.6)
    colors[i * 3] = tmp.r
    colors[i * 3 + 1] = tmp.g
    colors[i * 3 + 2] = tmp.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  void rand
  return geo
}

// ---------- 형태 만들기 도구 ----------
function noisyBlob({ radius, detail, center, squash = [1, 1, 1], seed, amp = 0.28, freq = 1.7, colors }) {
  const rand = mulberry(seed * 13.7 + 1)
  let g = new THREE.IcosahedronGeometry(1, detail)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g)
  const pos = g.attributes.position
  const col = new Float32Array(pos.count * 3)
  const c0 = new THREE.Color(colors[0])
  const c1 = new THREE.Color(colors[1])
  const c2 = new THREE.Color(colors[2])
  const tmp = new THREE.Color()
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const n1 = fbm3(x * freq + seed, y * freq + seed * 0.7, z * freq - seed, 3)
    const n2 = vnoise3(x * freq * 4.5 + seed, y * freq * 4.5, z * freq * 4.5) // 잎뭉치의 잔 울퉁불퉁함
    const r = radius * (1 + (n1 - 0.5) * amp * 2 + (n2 - 0.5) * amp * 0.7)
    const px = x * r * squash[0] + center[0]
    const py = y * r * squash[1] + center[1]
    const pz = z * r * squash[2] + center[2]
    pos.setXYZ(i, px, py, pz)
    // 위쪽은 밝게, 안쪽과 아래쪽은 어둡게. 노이즈로 잎마다 색이 조금씩 다릅니다.
    const up = THREE.MathUtils.clamp(y * 0.5 + 0.5, 0, 1)
    tmp.copy(c0).lerp(c1, up).lerp(c2, Math.max(0, n2 - 0.55) * 1.6)
    const shade = 0.78 + up * 0.28 + (rand() - 0.5) * 0.05
    col[i * 3] = tmp.r * shade
    col[i * 3 + 1] = tmp.g * shade
    col[i * 3 + 2] = tmp.b * shade
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

// 곡선을 따라가며 굵기가 줄어드는 원통(줄기, 가지, 풀 줄기)
function taperedTube({ points, radial = 12, rings = 18, r0, r1, flare = 0, color, color2, bark = 0.12, seed = 0, rand }) {
  const curve = new THREE.CatmullRomCurve3(points)
  const frames = curve.computeFrenetFrames(rings, false)
  const pos = []
  const col = []
  const idx = []
  const c0 = new THREE.Color(color)
  const c1 = new THREE.Color(color2 ?? color)
  const tmp = new THREE.Color()
  for (let i = 0; i <= rings; i += 1) {
    const t = i / rings
    const p = curve.getPoint(t)
    const N = frames.normals[i]
    const B = frames.binormals[i]
    const rBase = lerp(r0, r1, Math.pow(t, 0.85)) + flare * Math.pow(1 - t, 6)
    for (let j = 0; j <= radial; j += 1) {
      const a = (j / radial) * Math.PI * 2
      const ridge = 1 + (vnoise3(Math.cos(a) * 3 + seed, t * 9, Math.sin(a) * 3) - 0.5) * bark * 2
      const r = rBase * ridge
      pos.push(p.x + (N.x * Math.cos(a) + B.x * Math.sin(a)) * r, p.y + (N.y * Math.cos(a) + B.y * Math.sin(a)) * r, p.z + (N.z * Math.cos(a) + B.z * Math.sin(a)) * r)
      tmp.copy(c0).lerp(c1, t)
      const streak = 0.85 + vnoise3(j * 1.7 + seed, t * 6, 0) * 0.3
      col.push(tmp.r * streak, tmp.g * streak, tmp.b * streak)
    }
  }
  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * (radial + 1) + j
      const b = a + radial + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  void rand
  return g
}

const merge = (list) => {
  const fixed = list.map((g) => {
    const out = g.index ? g.toNonIndexed() : g
    out.deleteAttribute('uv')
    return out
  })
  return mergeGeometries(fixed, false)
}

const polar = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r]

// ---------- 나무 ----------
// kind: oak(둥근 나무), birch(열매 나무), pine(삼나무), blossom(벚나무). detail: 잎 덩어리 세분화(4 = 매우 정교, 1 = 먼 곳용)
// 동물의 숲처럼 굵고 짧은 줄기 위에 통통하고 매끈한 수관을 얹습니다.
export function buildTreeGeometry(kind, detail, seed) {
  const s = mulberry(seed)
  const trunk = []
  const leaves = []
  const lean = () => (s() - 0.5) * 0.12
  const pal = {
    oak: ['#4fb85a', '#7fdc6a', '#c4f28a'],
    birch: ['#58c062', '#86e070', '#cdf593'],
    pine: ['#2f9a5e', '#46b872', '#8ae0a4'],
    blossom: ['#ffa9c6', '#ffcfe0', '#fff2f7'],
  }[kind]

  if (kind === 'pine') {
    const H = 5.2
    trunk.push(taperedTube({ points: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, H * 0.4, 0), new THREE.Vector3(0, H * 0.8, 0)], radial: 14, rings: 8, r0: 0.3, r1: 0.14, flare: 0.1, color: '#a9744f', color2: '#8a5a3c', bark: 0.02, seed, rand: s }))
    const layers = 5
    for (let i = 0; i < layers; i += 1) {
      const t = i / (layers - 1)
      const baseY = 0.9 + t * (H - 2.2)
      leaves.push(pineLayer(lerp(1.6, 0.55, t), lerp(1.7, 1.3, t), baseY, 36 + detail * 12, pal, seed + i))
    }
  } else {
    const fruit = kind === 'birch'
    const H = fruit ? 1.7 : 2.0
    const R = kind === 'blossom' ? 1.75 : fruit ? 1.4 : 1.65
    const c0 = kind === 'blossom' ? '#9a6a55' : '#a9744f'
    const c1 = kind === 'blossom' ? '#7d5242' : '#8a5a3c'
    trunk.push(taperedTube({ points: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean(), H * 0.5, lean()), new THREE.Vector3(0, H, 0)], radial: 18, rings: 10, r0: 0.38, r1: 0.26, flare: 0.18, color: c0, color2: c1, bark: 0.025, seed, rand: s }))
    const cy = H + R * 0.78
    leaves.push(noisyBlob({ radius: R, detail, center: [0, cy, 0], squash: [1, 0.88, 1], seed: seed * 3.1, amp: 0.05, freq: 1.1, colors: pal }))
    const lobes = 5
    for (let i = 0; i < lobes; i += 1) {
      const a = (i / lobes) * Math.PI * 2 + s() * 0.5
      const off = polar(R * 0.62, a, (s() - 0.3) * R * 0.5)
      leaves.push(noisyBlob({ radius: R * (0.55 + s() * 0.12), detail, center: [off[0], cy + off[1] - 0.15, off[2]], squash: [1, 0.9, 1], seed: seed * 3.1 + i * 1.7 + 1, amp: 0.05, freq: 1.1, colors: pal }))
    }
    if (fruit) {
      for (let i = 0; i < 11; i += 1) {
        const a = s() * Math.PI * 2
        const e = 0.1 + s() * 0.9
        const rr = R * 1.02
        leaves.push(sphereAt(0.13, Math.cos(a) * Math.sqrt(1 - e * e) * rr, cy + e * rr * 0.85 - 0.3 * (1 - e), Math.sin(a) * Math.sqrt(1 - e * e) * rr, 1, 1, 1, '#ff6a5e', 10))
      }
    }
  }
  return { trunk: merge(trunk), leaves: merge(leaves) }
}

// 소나무 한 층: 톱니 모양으로 늘어진 원뿔
function pineLayer(rad, h, baseY, radial, pal, seed) {
  const s = mulberry(seed * 5.3 + 2)
  const rings = 6
  const pos = []
  const col = []
  const idx = []
  const c0 = new THREE.Color(pal[0])
  const c1 = new THREE.Color(pal[1])
  const c2 = new THREE.Color(pal[2])
  const tmp = new THREE.Color()
  for (let i = 0; i <= rings; i += 1) {
    const t = i / rings // 0 = 아래 가장자리, 1 = 꼭대기
    for (let j = 0; j <= radial; j += 1) {
      const a = (j / radial) * Math.PI * 2
      const fringe = 1 + (vnoise3(Math.cos(a) * 2.5 + seed, t * 3, Math.sin(a) * 2.5) - 0.5) * 0.08 + Math.sin(a * 11 + seed) * 0.02 * (1 - t)
      const r = rad * (1 - t) * fringe
      const droop = (1 - t) * 0.22
      pos.push(Math.cos(a) * r, baseY + t * h - droop, Math.sin(a) * r)
      tmp.copy(c0).lerp(c1, t).lerp(c2, Math.max(0, vnoise3(j * 0.7 + seed, t * 4, 0) - 0.6))
      const shade = 0.75 + t * 0.35 + (s() - 0.5) * 0.04
      col.push(tmp.r * shade, tmp.g * shade, tmp.b * shade)
    }
  }
  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * (radial + 1) + j
      const b = a + radial + 1
      idx.push(a, a + 1, b, b, a + 1, b + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// ---------- 바위 ----------
export function buildRockGeometry(seed, detail = 6) {
  const s = mulberry(seed)
  let g = new THREE.IcosahedronGeometry(1, detail)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g)
  const pos = g.attributes.position
  const col = new Float32Array(pos.count * 3)
  const stone = new THREE.Color('#c6ccd6')
  const stone2 = new THREE.Color('#a7b0c0')
  const moss = new THREE.Color('#6fc07a')
  const tmp = new THREE.Color()
  const sx = 0.9 + s() * 0.5
  const sz = 0.9 + s() * 0.5
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const big = fbm3(x * 1.2 + seed, y * 1.2, z * 1.2 - seed, 3)
    const crack = Math.abs(vnoise3(x * 3 + seed, y * 3, z * 3) - 0.5) // 갈라진 면
    const r = 1 + (big - 0.5) * 0.36 - crack * 0.06
    let py = y * r * 0.7
    py = Math.max(py, -0.35) // 땅에 파묻힌 납작한 바닥
    pos.setXYZ(i, x * r * sx, py, z * r * sz)
    tmp.copy(stone).lerp(stone2, vnoise3(x * 2 + seed, y * 2, z * 2))
    const top = Math.max(0, y - 0.15) // 위를 향한 면에 이끼
    tmp.lerp(moss, THREE.MathUtils.clamp(top * 1.4 * (0.4 + big), 0, 0.85))
    const shade = 0.9 + crack * 0.4
    col[i * 3] = tmp.r * shade
    col[i * 3 + 1] = tmp.g * shade
    col[i * 3 + 2] = tmp.b * shade
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

// 울타리 덤불
export function buildBushGeometry(seed) {
  return noisyBlob({ radius: 1, detail: 4, center: [0, 0, 0], squash: [1, 0.85, 1], seed, amp: 0.12, freq: 1.3, colors: ['#3fb860', '#62d880', '#a6ef9c'] })
}

// ---------- 풀 ----------
// 한 가닥: 높이 1로 정규화된 구부러진 잎. 정점 셰이더에서 바람과 슬라임을 피하는 휘어짐을 줍니다.
export function buildBladeGeometry(segs) {
  const pos = []
  const col = []
  const nor = []
  const idx = []
  const base = new THREE.Color('#5ab845')
  const tip = new THREE.Color('#cdf59a')
  const tmp = new THREE.Color()
  for (let i = 0; i <= segs; i += 1) {
    const t = i / segs
    const w = 0.5 * (1 - Math.pow(t, 1.6)) * 0.12 + 0.002
    const curve = t * t * 0.28
    pos.push(-w, t, curve, w, t, curve)
    tmp.copy(base).lerp(tip, Math.pow(t, 0.9))
    col.push(tmp.r, tmp.g, tmp.b, tmp.r, tmp.g, tmp.b)
    nor.push(0, 0.85, 0.5, 0, 0.85, 0.5)
  }
  for (let i = 0; i < segs; i += 1) {
    const a = i * 2
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}

export function makeGrassMaterial(uniforms) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide })
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.uniforms.uSlime = uniforms.uSlime
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform vec3 uSlime;')
      .replace(
        '#include <begin_vertex>',
        `
        vec3 transformed = vec3(position);
        #ifdef USE_INSTANCING
          mat3 gm = mat3(instanceMatrix);
          vec4 wp = instanceMatrix * vec4(transformed, 1.0);
          float h2 = position.y * position.y;
          float wind = sin(uTime * 1.5 + wp.x * 0.32 + wp.z * 0.21) * 0.5 + sin(uTime * 2.6 + wp.x * 0.9 + wp.z * 0.4) * 0.22;
          vec3 dispW = vec3(wind * 0.5, 0.0, wind * 0.2) * h2;
          vec2 away = wp.xz - uSlime.xz;
          float dist = length(away);
          float push = smoothstep(1.7, 0.1, dist) * (1.0 - smoothstep(0.6, 2.2, uSlime.y));
          dispW.xz += (away / (dist + 0.0001)) * push * h2 * 1.2;
          dispW.y -= push * h2 * 0.35;
          float s2 = dot(gm[0], gm[0]);
          transformed += (transpose(gm) * dispW) / s2;
        #endif
        `,
      )
  }
  return m
}

// ---------- 꽃 ----------
const sphereAt = (r, x, y, z, sx, sy, sz, color, segs = 8) => {
  const g = new THREE.SphereGeometry(r, segs, Math.max(4, segs - 2))
  g.scale(sx, sy, sz)
  g.translate(x, y, z)
  const c = new THREE.Color(color)
  const n = g.attributes.position.count
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i += 1) {
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}

function stemGeo(h, bend, rand) {
  return taperedTube({ points: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(bend * 0.4, h * 0.5, 0), new THREE.Vector3(bend, h, 0)], radial: 6, rings: 6, r0: 0.014, r1: 0.009, color: '#3f9a4a', color2: '#5fbf5f', bark: 0.02, rand })
}

export function buildFlowerGeometry(kind, seed, petal) {
  const s = mulberry(seed)
  const parts = []
  if (kind === 'daisy') {
    const h = 0.42
    parts.push(stemGeo(h, 0.04, s))
    const headY = h
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2
      const p = sphereAt(0.05, 0, 0, 0.09, 0.32, 0.12, 1.4, petal ?? '#ffffff', 8)
      p.rotateX(-0.25)
      p.rotateY(a)
      p.translate(0.04, headY, 0)
      parts.push(p)
    }
    parts.push(sphereAt(0.06, 0.04, headY + 0.015, 0, 1, 0.65, 1, '#ffcf3a', 10))
    parts.push(sphereAt(0.04, 0.0, 0.14, 0.03, 1.8, 0.3, 0.7, '#4aa855', 6))
  } else if (kind === 'tulip') {
    const h = 0.52
    parts.push(stemGeo(h, 0.0, s))
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2
      const p = sphereAt(0.07, 0.045, 0.08, 0, 0.75, 1.5, 0.45, petal ?? '#ff5a72', 8)
      p.rotateZ(i % 2 ? -0.12 : -0.28)
      p.rotateY(a)
      p.translate(0, h - 0.02, 0)
      parts.push(p)
    }
    parts.push(sphereAt(0.05, 0.0, 0.2, 0.05, 0.35, 2.4, 0.5, '#3f9a4a', 6))
  } else {
    // 들꽃: 다섯 장 꽃잎의 작은 꽃
    const h = 0.3
    parts.push(stemGeo(h, 0.03, s))
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2
      const p = sphereAt(0.04, 0, 0, 0.06, 0.8, 0.2, 1.1, petal ?? '#9db8ff', 8)
      p.rotateY(a)
      p.translate(0.03, h, 0)
      parts.push(p)
    }
    parts.push(sphereAt(0.03, 0.03, h + 0.01, 0, 1, 0.7, 1, '#fff3a8', 8))
  }
  return merge(parts)
}

// ---------- 나비 ----------
const wingTexture = (palette) => {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(40, 140, 8, 128, 128, 160)
  grad.addColorStop(0, palette[0])
  grad.addColorStop(0.6, palette[1])
  grad.addColorStop(1, palette[2])
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  g.strokeStyle = 'rgba(30,20,20,0.75)'
  g.lineWidth = 3
  for (let i = 0; i < 7; i += 1) {
    g.beginPath()
    g.moveTo(10, 130)
    g.quadraticCurveTo(110, 130 - 90 + i * 30, 250, 20 + i * 36)
    g.stroke()
  }
  g.fillStyle = 'rgba(25,18,24,0.8)'
  g.fillRect(0, 0, 256, 18)
  g.fillRect(0, 238, 256, 18)
  g.fillRect(238, 0, 18, 256)
  g.fillStyle = 'rgba(255,255,255,0.9)'
  for (let i = 0; i < 6; i += 1) {
    g.beginPath()
    g.arc(228, 40 + i * 34, 6, 0, Math.PI * 2)
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function buildButterfly(palette) {
  const tex = wingTexture(palette)
  const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.6, transparent: true, alphaTest: 0.3 })
  const wing = (fore) => {
    const sh = new THREE.Shape()
    if (fore) {
      sh.moveTo(0, 0)
      sh.bezierCurveTo(0.1, 0.3, 0.35, 0.5, 0.62, 0.42)
      sh.bezierCurveTo(0.7, 0.3, 0.55, 0.05, 0.38, -0.08)
      sh.bezierCurveTo(0.2, -0.12, 0.05, -0.05, 0, 0)
    } else {
      sh.moveTo(0, -0.02)
      sh.bezierCurveTo(0.2, 0.04, 0.45, 0.0, 0.48, -0.2)
      sh.bezierCurveTo(0.42, -0.42, 0.25, -0.5, 0.12, -0.38)
      sh.bezierCurveTo(0.02, -0.28, -0.02, -0.12, 0, -0.02)
    }
    const g = new THREE.ShapeGeometry(sh, 18)
    const pos = g.attributes.position
    const uv = g.attributes.uv
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      uv.setXY(i, x / 0.7, (y + 0.5) / 1.0)
      pos.setZ(i, -x * x * 0.35) // 날개가 살짝 말려 올라간 곡면
    }
    g.computeVertexNormals()
    return g
  }
  const make = (dir, fore) => {
    const pivot = new THREE.Group()
    const m = new THREE.Mesh(wing(fore), mat)
    m.scale.x = dir
    m.rotation.x = Math.PI / 2
    pivot.add(m)
    return pivot
  }
  const g = new THREE.Group()
  const fl = make(-1, true)
  const fr = make(1, true)
  const hl = make(-1, false)
  const hr = make(1, false)
  g.add(fl, fr, hl, hr)
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#2b2024', roughness: 0.6 })
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.34, 6, 12), bodyMat)
  body.rotation.x = Math.PI / 2
  g.add(body)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), bodyMat)
  head.position.z = 0.22
  g.add(head)
  for (const x of [-1, 1]) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.22, 5), bodyMat)
    ant.position.set(x * 0.05, 0.05, 0.3)
    ant.rotation.set(0.9, 0, -x * 0.5)
    g.add(ant)
  }
  return { group: g, wings: { fl, fr, hl, hr }, texture: tex, material: mat }
}

// ---------- 난수 ----------
export function mulberry(seed) {
  let a = Math.floor(seed * 2654435761) >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
