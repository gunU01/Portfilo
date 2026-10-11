import * as THREE from 'three'

// 밤의 저폴리 미니어처 월드. React와 분리해 두어, 월드를 열 때만(lazy import) three가 로드됩니다.
// 외부 모델과 후처리 없이 기본 도형, 그림자, 불빛으로 분위기를 내고, 화면 밖이나 탭이 숨겨지면 렌더를 멈춥니다.

const ZONE_RADIUS = 15 // 월드 중심에서 구역 중심까지
const ZONE_DISC = 7
const NEAR = 2.6
const BOUND = 24
const SPEED = 6.5

const css = (el, name, fallback) =>
  new THREE.Color(getComputedStyle(el).getPropertyValue(name).trim() || fallback)

const mat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true })

const glow = (w, h, d, color) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color }))
const box = (w, h, d, color) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color))
const cyl = (rt, rb, h, seg, color) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color))
const at = (mesh, x, y, z) => {
  mesh.position.set(x, y, z)
  return mesh
}

// 모양마다 다른 도형 조합. pedestal 위에 올라가며, 높이는 대략 3 이하로 맞춥니다.
const SHAPES = {
  // 얼마: 동전 더미 위에 영수증
  coins(tint) {
    const g = new THREE.Group()
    for (let i = 0; i < 5; i += 1) g.add(at(cyl(0.8, 0.8, 0.22, 12, tint), (i % 2) * 0.06, 0.4 + i * 0.24, 0))
    const receipt = at(box(1.0, 1.5, 0.06, 0xffffff), 0, 2.1, 0)
    receipt.rotation.z = 0.12
    g.add(receipt)
    for (let i = 0; i < 3; i += 1) g.add(at(box(0.6, 0.06, 0.02, 0x2b2f3a), 0.02, 2.5 - i * 0.28, 0.05))
    return g
  },
  // 해미: 창에 불이 켜진 집과 액자
  house(tint) {
    const g = new THREE.Group()
    g.add(at(box(1.8, 1.3, 1.7, tint), 0, 0.95, 0))
    const roof = at(new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.0, 4), mat(0x2b2f3a)), 0, 2.1, 0)
    roof.rotation.y = Math.PI / 4
    g.add(roof, at(glow(0.45, 0.8, 0.06, 0xffd98a), -0.4, 0.75, 0.88), at(glow(0.5, 0.5, 0.06, 0xffd98a), 0.4, 1.1, 0.88))
    const frame = at(box(0.55, 0.65, 0.07, 0xffffff), 1.25, 1.1, 0)
    frame.rotation.y = 0.5
    g.add(frame)
    return g
  },
  // 토스 역기획: 오르는 막대(다섯 레일)
  bars(tint) {
    const g = new THREE.Group()
    const hs = [0.8, 1.3, 1.8, 2.3, 2.8]
    hs.forEach((h, i) => g.add(at(box(0.36, h, 0.5, i % 2 ? tint : 0xffffff), -0.8 + i * 0.4, 0.3 + h / 2, 0)))
    return g
  },
  // 얼마 기획 문서: 쌓인 문서
  sheets(tint) {
    const g = new THREE.Group()
    for (let i = 0; i < 5; i += 1) {
      const s = at(box(1.9, 0.18, 2.4, i % 2 ? tint : 0xffffff), 0, 0.45 + i * 0.22, 0)
      s.rotation.y = (i - 2) * 0.16
      g.add(s)
    }
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), mat(0xd9453d)), 0, 1.75, 0))
    return g
  },
  // 해미 기획 문서: 화면 정의 보드
  board(tint) {
    const g = new THREE.Group()
    g.add(at(cyl(0.07, 0.07, 1.6, 6, 0x2b2f3a), -0.8, 1.0, 0), at(cyl(0.07, 0.07, 1.6, 6, 0x2b2f3a), 0.8, 1.0, 0))
    g.add(at(box(2.2, 1.4, 0.12, 0xffffff), 0, 1.9, 0))
    g.add(at(box(0.55, 1.0, 0.04, tint), -0.65, 1.9, 0.08), at(glow(0.55, 1.0, 0.04, 0xffd98a), 0, 1.9, 0.08), at(box(0.55, 1.0, 0.04, tint), 0.65, 1.9, 0.08))
    return g
  },
  // 토스 역기획 문서: 펼친 보고서
  book(tint) {
    const g = new THREE.Group()
    const l = at(box(1.15, 0.12, 1.6, 0xffffff), -0.58, 1.0, 0)
    const r = at(box(1.15, 0.12, 1.6, 0xffffff), 0.58, 1.0, 0)
    l.rotation.z = 0.22
    r.rotation.z = -0.22
    g.add(l, r, at(box(0.16, 0.2, 1.64, tint), 0, 0.88, 0))
    for (let i = 0; i < 3; i += 1) g.add(at(box(0.7, 0.03, 0.05, 0x2b2f3a), -0.6, 1.15 + i * 0.03, -0.3 + i * 0.3))
    return g
  },
  // 수상: 트로피
  trophy(tint) {
    const g = new THREE.Group()
    g.add(at(box(1.0, 0.3, 1.0, 0x2b2f3a), 0, 0.45, 0))
    g.add(at(cyl(0.14, 0.14, 0.7, 6, tint), 0, 1.0, 0))
    g.add(at(cyl(0.75, 0.38, 0.95, 8, tint), 0, 1.7, 0))
    const star = at(new THREE.Mesh(new THREE.OctahedronGeometry(0.34), new THREE.MeshBasicMaterial({ color: 0xfff0b3 })), 0, 2.55, 0)
    star.userData.spin = true
    g.add(star)
    return g
  },
}

function buildLandmark(shape, tint, base, scale = 1) {
  const g = new THREE.Group()
  g.add(at(cyl(1.35, 1.55, 0.3, 12, base), 0, 0.15, 0))
  const body = (SHAPES[shape] ?? SHAPES.house)(tint)
  body.scale.setScalar(scale)
  g.add(body)
  return g
}

function buildCharacter(accent) {
  const skin = 0xffe3c4
  const hair = 0x3b2f2a
  const g = new THREE.Group()
  const body = at(cyl(0.38, 0.46, 0.85, 8, accent), 0, 0.85, 0)
  const head = at(new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), mat(skin)), 0, 1.58, 0)
  // 머리카락: 뒤쪽과 위쪽을 덮는 반구 + 앞머리
  const cap = at(new THREE.Mesh(new THREE.SphereGeometry(0.43, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58), mat(hair)), 0, 1.6, -0.03)
  const bangs = at(box(0.62, 0.14, 0.1, hair), 0, 1.78, 0.3)
  const pack = at(box(0.5, 0.55, 0.22, 0xe8a33d), 0, 0.9, -0.42)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x15171c })
  for (const x of [-0.15, 0.15]) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), eyeMat), x, 1.55, 0.37))

  const mkLimb = (x, y, len, color) => {
    const pivot = new THREE.Group()
    pivot.position.set(x, y, 0)
    pivot.add(at(cyl(0.11, 0.1, len, 6, color), 0, -len / 2, 0))
    g.add(pivot)
    return pivot
  }
  const legL = mkLimb(-0.17, 0.45, 0.45, 0x2b2f3a)
  const legR = mkLimb(0.17, 0.45, 0.45, 0x2b2f3a)
  const armL = mkLimb(-0.5, 1.2, 0.5, accent)
  const armR = mkLimb(0.5, 1.2, 0.5, accent)
  g.add(body, head, cap, bangs, pack)
  g.userData.limbs = { legL, legR, armL, armR }
  return g
}

export function createWorld({ container, zones, onNear, onZone, onActivate }) {
  const palette = {
    bg: css(container, '--bg', '#fbfaf7'),
    sunken: css(container, '--sunken', '#f3f1ea'),
    line: css(container, '--line', '#e4e1d8'),
    accent: css(container, '--accent', '#2447f5'),
    accentSoft: css(container, '--accent-soft', '#e9edff'),
    warnSoft: css(container, '--warn-soft', '#fff4dc'),
  }
  const zoneTint = [palette.accent, new THREE.Color('#e8a33d'), new THREE.Color('#3fb68b')]
  const zoneGround = [palette.accentSoft, palette.warnSoft, palette.sunken]

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.4
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  container.prepend(renderer.domElement)

  const SKY = new THREE.Color('#121c3a')
  const scene = new THREE.Scene()
  scene.background = SKY
  scene.fog = new THREE.Fog(SKY, 24, 60)
  scene.add(new THREE.HemisphereLight(0x9fc0ff, 0x2a2350, 2.0))
  const moonlight = new THREE.DirectionalLight(0xc4d6ff, 2.3)
  moonlight.position.set(-12, 20, 9)
  moonlight.castShadow = true
  moonlight.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048)
  Object.assign(moonlight.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 70 })
  moonlight.shadow.bias = -0.0006
  moonlight.shadow.normalBias = 0.03
  scene.add(moonlight)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160)
  // 세로로 긴 화면(모바일)에서는 더 높고 멀리서 봐서 주변 건물이 보이게 함
  const camOffset = new THREE.Vector3(0, 10, 12)
  camera.position.set(0, 10, 14)

  const ground = new THREE.Mesh(new THREE.CircleGeometry(BOUND + 6, 64), mat(0x1d2a4a))
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(BOUND + 0.2, BOUND + 0.45, 96),
    new THREE.MeshBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
  )
  rim.rotation.x = -Math.PI / 2
  rim.position.y = 0.03
  scene.add(rim)

  const dot = document.createElement('canvas')
  dot.width = dot.height = 32
  const dc = dot.getContext('2d')
  dc.fillStyle = '#fff'
  dc.beginPath()
  dc.arc(16, 16, 14, 0, Math.PI * 2)
  dc.fill()
  const dotTex = new THREE.CanvasTexture(dot)
  // 하늘: 별과 달. 카메라를 따라다녀서 멀리 있는 것처럼 보입니다.
  const sky = new THREE.Group()
  const starPos = []
  for (let i = 0; i < 360; i += 1) {
    const u = Math.random() * Math.PI * 2
    const w = 0.12 + Math.random() * 0.88
    const r = 90
    starPos.push(Math.cos(u) * Math.sqrt(1 - w * w) * r, w * r, Math.sin(u) * Math.sqrt(1 - w * w) * r)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3))
  sky.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xd6e4ff, size: 0.6, map: dotTex, alphaTest: 0.4, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.9 })))
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 16), new THREE.MeshBasicMaterial({ color: 0xf2f6ff, fog: false }))
  moon.position.set(-38, 44, -62)
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(5.6, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x9db8ff, transparent: true, opacity: 0.14, fog: false, depthWrite: false }),
  )
  halo.position.copy(moon.position)
  sky.add(moon, halo)
  scene.add(sky)

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

  const zoneInfo = []
  const landmarks = []

  zones.forEach((zone, zi) => {
    const theta = -Math.PI / 2 + (zi * 2 * Math.PI) / zones.length
    const cx = Math.cos(theta) * ZONE_RADIUS
    const cz = Math.sin(theta) * ZONE_RADIUS

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(ZONE_DISC, ZONE_DISC, 0.12, 40), mat(zoneGround[zi % 3]))
    disc.position.set(cx, 0.06, cz)
    scene.add(disc)
    const edge = new THREE.Mesh(
      new THREE.RingGeometry(ZONE_DISC - 0.18, ZONE_DISC, 64),
      new THREE.MeshBasicMaterial({ color: zoneTint[zi % 3], transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
    )
    edge.rotation.x = -Math.PI / 2
    edge.position.set(cx, 0.14, cz)
    scene.add(edge)
    const warm = new THREE.PointLight(0xffc27a, 170, 22, 2)
    warm.position.set(cx, 4.5, cz)
    scene.add(warm)

    const pathLen = ZONE_RADIUS - ZONE_DISC
    const path = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, pathLen), mat(palette.line))
    path.position.set((Math.cos(theta) * (pathLen / 2 + 0.3)), 0.04, Math.sin(theta) * (pathLen / 2 + 0.3))
    path.rotation.y = -theta + Math.PI / 2
    scene.add(path)
    for (const t of [0.3, 0.75]) {
      const lx = Math.cos(theta) * (ZONE_DISC + pathLen * t) + Math.cos(theta + Math.PI / 2) * 1.5
      const lz = Math.sin(theta) * (ZONE_DISC + pathLen * t) + Math.sin(theta + Math.PI / 2) * 1.5
      const lamp = new THREE.Group()
      lamp.add(at(cyl(0.07, 0.09, 1.9, 6, 0x2a3350), 0, 0.95, 0))
      lamp.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe3a6 })), 0, 2.0, 0))
      lamp.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.16, depthWrite: false })), 0, 2.0, 0))
      lamp.position.set(lx, 0, lz)
      scene.add(lamp)
    }

    const info = { id: zone.id, name: zone.name, x: cx, z: cz, mx: cx, mz: cz, label: makeLabel(zone.name, 'world__zone') }
    zoneInfo.push(info)

    const n = zone.items.length
    const step = n > 3 ? 0.74 : 0.9
    zone.items.forEach((item, ii) => {
      const phi = theta + (ii - (n - 1) / 2) * step
      const x = cx + Math.cos(phi) * 4.2
      const z = cz + Math.sin(phi) * 4.2
      const tint = item.tint ? new THREE.Color(item.tint) : zoneTint[zi % 3]
      const mesh = buildLandmark(item.shape, tint, zoneGround[zi % 3], item.scale)
      mesh.position.set(x, 0.12, z)
      mesh.rotation.y = -phi + Math.PI / 2
      scene.add(mesh)

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.7, 2.0, 32),
        new THREE.MeshBasicMaterial({ color: tint, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(x, 0.2, z)
      ring.visible = false
      scene.add(ring)

      landmarks.push({ ...item, x, z, mesh, ring, label: makeLabel(item.title, 'world__label') })
    })
    // 구역의 랜드마크 중심: 구역에 들어오면 카메라가 이쪽으로 살짝 기운다
    const mine = landmarks.slice(landmarks.length - n)
    info.mx = mine.reduce((s, l) => s + l.x, 0) / n
    info.mz = mine.reduce((s, l) => s + l.z, 0) / n
    // 이동 버튼의 도착점: 구역 중심에서 랜드마크 쪽으로 1.5 (건물과 겹치지 않게)
    const ox = Math.cos(theta)
    const oz = Math.sin(theta)
    info.ax = cx + ox * 1.5
    info.az = cz + oz * 1.5
  })

  // 풍경: 나무와 바위. 구역과 길을 피해 바깥쪽에 흩어 둡니다. 시드를 고정해 매번 같은 모습입니다.
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const leaf = [mat(0x1d4a52), mat(0x235a57), mat(0x2b4d6b)]
  const trunkMat = mat(0x3a2b3d)
  const coneGeo = new THREE.ConeGeometry(1, 2.2, 6)
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.8, 5)
  const rockGeo = new THREE.DodecahedronGeometry(0.7, 0)
  const rockMat = mat(0x3a4560)
  const clear = (x, z) => {
    const r = Math.hypot(x, z)
    if (r < 6) return false
    for (const zi of zoneInfo) if (Math.hypot(x - zi.x, z - zi.z) < ZONE_DISC + 2) return false
    for (let i = 0; i < zones.length; i += 1) {
      const th = -Math.PI / 2 + (i * 2 * Math.PI) / zones.length
      const along = x * Math.cos(th) + z * Math.sin(th)
      const across = Math.abs(-x * Math.sin(th) + z * Math.cos(th))
      if (along > 0 && along < ZONE_RADIUS && across < 3.2) return false
    }
    return true
  }
  let placed = 0
  for (let tries = 0; tries < 400 && placed < 46; tries += 1) {
    const a = rand() * Math.PI * 2
    const rr = 7 + rand() * (BOUND - 4)
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    if (!clear(x, z)) continue
    placed += 1
    if (rand() < 0.2) {
      const rock = new THREE.Mesh(rockGeo, rockMat)
      rock.position.set(x, 0.3, z)
      rock.scale.set(0.8 + rand() * 0.8, 0.6 + rand() * 0.5, 0.8 + rand() * 0.8)
      rock.rotation.set(rand() * 3, rand() * 3, 0)
      scene.add(rock)
    } else {
      const k = 0.8 + rand() * 0.9
      const tree = new THREE.Group()
      tree.add(at(new THREE.Mesh(trunkGeo, trunkMat), 0, 0.4, 0))
      tree.add(at(new THREE.Mesh(coneGeo, leaf[placed % 3]), 0, 1.9, 0))
      const top = at(new THREE.Mesh(coneGeo, leaf[placed % 3]), 0, 2.9, 0)
      top.scale.setScalar(0.72)
      tree.add(top)
      tree.position.set(x, 0, z)
      tree.scale.setScalar(k)
      tree.rotation.y = rand() * 6
      scene.add(tree)
    }
  }

  // 반딧불: 천천히 떠다니는 빛 점
  const FLIES = 70
  const flyBase = []
  const flyPos = new Float32Array(FLIES * 3)
  for (let i = 0; i < FLIES; i += 1) {
    const a = rand() * Math.PI * 2
    const rr = rand() * BOUND
    flyBase.push([Math.cos(a) * rr, 0.8 + rand() * 3.2, Math.sin(a) * rr, rand() * 6])
  }
  const flyGeo = new THREE.BufferGeometry()
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3))
  const flies = new THREE.Points(
    flyGeo,
    new THREE.PointsMaterial({ color: 0xffe3a6, size: 0.22, map: dotTex, alphaTest: 0.4, transparent: true, opacity: 0.95, depthWrite: false }),
  )
  scene.add(flies)

  const character = buildCharacter(palette.accent)
  scene.add(character)
  scene.traverse((o) => {
    if (o.isMesh && o.material.isMeshLambertMaterial) {
      // 바닥에 깔린 납작한 도형은 그림자를 드리우지 않습니다(자기 그림자로 어두워지는 것을 막음).
      o.castShadow = o !== ground && (o.geometry.parameters?.height ?? 1) > 0.2
      o.receiveShadow = true
    }
  })

  const pos = new THREE.Vector3(0, 0, 2)
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

  const size = () => {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // 세로로 긴 화면에서는 시야를 넓혀 월드가 잘리지 않게
    const narrow = w / h < 0.8
    camera.fov = narrow ? 56 : 42
    camOffset.set(0, narrow ? 15 : 10, narrow ? 15 : 12)
    camera.updateProjectionMatrix()
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(container)

  const v = new THREE.Vector3()
  const camTarget = new THREE.Vector3()
  const focus = { x: 0, z: 2 }
  const widths = new WeakMap()
  const project = (el, x, y, z, fadeFrom, fadeTo) => {
    v.set(x, y, z).project(camera)
    const w = container.clientWidth
    const h = container.clientHeight
    const dist = Math.hypot(x - pos.x, z - pos.z)
    const visible = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1
    const a = fadeTo === undefined ? 1 : Math.min(1, Math.max(0, (fadeTo - dist) / (fadeTo - fadeFrom)))
    el.style.opacity = visible ? String(a) : '0'
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

    // 랜드마크와 겹치지 않게 밀어내고, 월드 밖으로 나가지 않게 제한
    for (const l of landmarks) {
      const dx = pos.x - l.x
      const dz = pos.z - l.z
      const d = Math.hypot(dx, dz)
      if (d < 1.55 && d > 0.0001) {
        pos.x = l.x + (dx / d) * 1.55
        pos.z = l.z + (dz / d) * 1.55
      }
    }
    const r = Math.hypot(pos.x, pos.z)
    if (r > BOUND) {
      pos.x = (pos.x / r) * BOUND
      pos.z = (pos.z / r) * BOUND
    }

    const t = now / 1000
    character.position.set(pos.x, moving ? Math.abs(Math.sin(t * 11)) * 0.1 : 0, pos.z)
    character.rotation.y = facing
    const { legL, legR, armL, armR } = character.userData.limbs
    const swing = moving ? Math.sin(t * 11) * 0.7 : 0
    legL.rotation.x = swing
    legR.rotation.x = -swing
    armL.rotation.x = -swing * 0.8
    armR.rotation.x = swing * 0.8
    sky.position.set(camera.position.x, 0, camera.position.z)
    const fp = flyGeo.attributes.position
    for (let i = 0; i < FLIES; i += 1) {
      const [bx, by, bz, ph] = flyBase[i]
      fp.setXYZ(i, bx + Math.sin(t * 0.4 + ph) * 0.9, by + Math.sin(t * 0.7 + ph * 2) * 0.4, bz + Math.cos(t * 0.35 + ph) * 0.9)
    }
    fp.needsUpdate = true

    // 가까운 랜드마크와 현재 구역 (바뀔 때만 알림)
    let best = null
    let bestD = NEAR
    for (const l of landmarks) {
      const d = Math.hypot(pos.x - l.x, pos.z - l.z)
      if (d < bestD) {
        best = l
        bestD = d
      }
      l.ring.visible = false
    }
    if (best) {
      best.ring.visible = true
      best.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.05)
    }
    const nextNear = best ? best.id : null
    if (nextNear !== nearId) {
      nearId = nextNear
      onNear?.(best ? { id: best.id, title: best.title, sub: best.sub, href: best.href } : null)
    }
    let nextZone = null
    for (const z of zoneInfo) {
      if (Math.hypot(pos.x - z.x, pos.z - z.z) < ZONE_DISC + 1.5) nextZone = z.id
    }
    if (nextZone !== zoneId) {
      zoneId = nextZone
      onZone?.(nextZone)
    }

    for (const l of landmarks) {
      l.mesh.traverse((o) => {
        if (o.userData.spin) o.rotation.y = t * 1.6
      })
    }

    const zi = zoneInfo.find((z) => z.id === zoneId)
    const k = 1 - Math.exp(-dt * 3)
    focus.x += ((zi ? pos.x + (zi.mx - pos.x) * 0.45 : pos.x) - focus.x) * k
    focus.z += ((zi ? pos.z + (zi.mz - pos.z) * 0.45 : pos.z) - focus.z) * k
    camTarget.set(focus.x, 0, focus.z).add(camOffset)
    camera.position.lerp(camTarget, 1 - Math.exp(-dt * 4))
    camera.lookAt(focus.x, 0.6, focus.z)
    renderer.render(scene, camera)

    for (const z of zoneInfo) project(z.label, z.x, 0.4, z.z, 14, 26)
    for (const l of landmarks) project(l.label, l.x, 3.6, l.z, 6, 12)
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
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) o.material.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
      labelLayer.remove()
    },
  }
}
