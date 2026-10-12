import * as THREE from 'three'

// 동그랗고 하얗게 빛나는 슬라임. 모양은 단위 구(반지름 1)를 바닥 기준으로 늘이고 찌그러뜨립니다.
// - 스프링으로 늘어남과 찌그러짐(착지 충격, 통통 튀기, 숨쉬기)을 만들고
// - 정점 셰이더로 젤리처럼 출렁이며(속도와 충격에 비례), 위쪽이 이동 반대로 끌려옵니다.
// - 프레넬 림 라이트와 반사광, 내부 핵과 기포로 말랑한 반투명 질감을 냅니다.
// - 발광: 밝은 색(1 이상)은 블룸으로 번지고, 주변 땅에는 점광원과 후광이 비춥니다.

const vertex = `
  uniform float uTime;
  uniform float uWob;
  uniform vec2 uShear;
  varying vec3 vN;
  varying vec3 vV;
  varying float vH;
  void main() {
    vec3 p = position;
    float h = (p.y + 1.0) * 0.5;
    vH = h;
    float w = sin(p.y * 5.0 + uTime * 13.0) * cos(p.x * 4.0 - p.z * 3.0 + uTime * 10.0);
    p += normal * w * uWob * 0.09;
    p.xz += uShear * h * h;
    p.y = max(p.y, -0.93);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const outlineVertex = vertex.replace('p.y = max(p.y, -0.93);', 'p += normal * 0.05;\n    p.y = max(p.y, -0.95);')

const outlineFragment = `
  void main() {
    gl_FragColor = vec4(0.36, 0.66, 1.0, 0.85);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const fragment = `
  uniform float uGlow;
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vV;
  varying float vH;
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    float ndv = max(dot(N, V), 0.0);
    float fres = pow(1.0 - ndv, 2.4);
    vec3 core = vec3(0.97, 0.995, 1.0);
    vec3 mid = vec3(0.72, 0.9, 1.0);
    vec3 rim = vec3(0.3, 0.68, 1.0);
    vec3 L = normalize(vec3(-0.5, 0.85, 0.55));
    float diff = max(dot(N, L), 0.0);
    vec3 col = mix(core, mid, smoothstep(0.1, 0.95, 1.0 - ndv));
    col = mix(col, rim, fres * 1.0);
    // 위쪽은 밝게, 바닥 쪽은 푸르고 어둡게(속이 비치는 느낌과 부피감)
    col *= 0.78 + 0.34 * diff + 0.1 * vH;
    col = mix(col, vec3(0.45, 0.74, 1.0), (1.0 - vH) * 0.3);
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 38.0);
    col += vec3(1.0) * spec * 1.1;
    // 숨 쉬듯 일렁이는 발광
    float pulse = 1.0 + sin(uTime * 2.2) * 0.07;
    col *= uGlow * pulse;
    float alpha = mix(0.97, 0.78, fres);
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function createSlime(glowTexture) {
  const group = new THREE.Group()
  const body = new THREE.Group() // 바닥이 원점 → 이 그룹의 scale이 스프링으로 변합니다
  group.add(body)

  const uniforms = {
    uTime: { value: 0 },
    uWob: { value: 0 },
    uShear: { value: new THREE.Vector2() },
    uGlow: { value: 1.45 },
  }
  const skinMat = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true })
  const skin = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), skinMat)
  skin.position.y = 1
  skin.renderOrder = 2
  body.add(skin)
  // 윤곽선: 같은 모양을 살짝 키워 뒤집어 그리면 흰 몸이 배경에서 또렷하게 보입니다.
  const outline = new THREE.Mesh(
    skin.geometry,
    new THREE.ShaderMaterial({ uniforms, vertexShader: outlineVertex, fragmentShader: outlineFragment, side: THREE.BackSide, transparent: true }),
  )
  outline.position.y = 1
  outline.renderOrder = 1
  body.add(outline)

  // 속이 비치는 핵과 기포
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.56, 32, 24),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.4, 2.6), transparent: true, opacity: 0.55, depthWrite: false }),
  )
  core.position.y = 0.95
  body.add(core)
  const bubbles = []
  for (let i = 0; i < 4; i += 1) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 + i * 0.025, 12, 10),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2.2, 2.4), transparent: true, opacity: 0.5, depthWrite: false }),
    )
    b.userData.seed = i * 1.9
    body.add(b)
    bubbles.push(b)
  }

  // 얼굴: 몸과 같이 변형되도록 body의 자식으로 두고, 구 표면 위에 얹습니다.
  const face = new THREE.Group()
  face.position.y = 1
  const onSphere = (mesh, x, y, lift = 0.02) => {
    mesh.position.set(x, y, Math.sqrt(Math.max(0.05, 1 - x * x - y * y)) + lift)
    return mesh
  }
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#17233f' })
  const shineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' })
  const eyes = new THREE.Group()
  for (const x of [-0.3, 0.3]) {
    const eye = onSphere(new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 14), eyeMat), x, 0.14, 0.05)
    eye.scale.set(0.9, 1.3, 0.45)
    eyes.add(eye)
    eyes.add(onSphere(new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), shineMat), x + 0.05, 0.21, 0.13))
    const blush = onSphere(new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), new THREE.MeshBasicMaterial({ color: '#ff8fb5', transparent: true, opacity: 0.75, depthWrite: false })), x * 1.8, -0.1, 0.05)
    blush.lookAt(blush.position.x * 2.2, blush.position.y, blush.position.z * 2.2)
    blush.scale.set(1.3, 0.8, 1)
    face.add(blush)
  }
  face.add(eyes)
  const mouth = onSphere(new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 8, 18, Math.PI), new THREE.MeshBasicMaterial({ color: '#17233f' })), 0, -0.12, 0.05)
  mouth.rotation.z = Math.PI
  face.add(mouth)
  face.traverse((o) => {
    o.renderOrder = 3
    if (o.material) {
      o.material.transparent = true
      o.material.depthWrite = false
    }
  })
  body.add(face)

  // 땅을 비추는 빛과 후광
  const light = new THREE.PointLight(0xbfe6ff, 16, 9, 2)
  light.position.y = 1.2
  group.add(light)
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xcdeeff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }))
  halo.scale.set(4.2, 4.2, 1)
  halo.position.y = 0.9
  group.add(halo)
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(1, 40),
    new THREE.MeshBasicMaterial({ map: glowTexture, color: 0xcdeeff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  pool.rotation.x = -Math.PI / 2
  pool.position.y = 0.05
  group.add(pool)

  // 스프링 상태(축별 크기와 속도)
  const sp = { sx: 1, sy: 1, sz: 1, vx: 0, vy: 0, vz: 0 }
  const shear = new THREE.Vector2()
  let wobble = 0
  let blinkAt = 2.5
  let blinking = 0
  let faceYaw = 0

  const K = 190
  const C = 9.5

  return {
    group,
    radius: 0.85,
    setGlow(v) {
      uniforms.uGlow.value = v
    },
    // 착지: 충격이 클수록 납작하게 찌그러졌다가 튕겨 오릅니다.
    impact(power) {
      const p = Math.min(power, 22)
      sp.vy -= p * 0.2
      sp.vx += p * 0.1
      sp.vz += p * 0.1
      wobble = Math.min(1.6, wobble + p * 0.09)
    },
    // 도약: 먼저 웅크렸다가 쭉 늘어납니다.
    launch(power) {
      sp.vy += power * 0.1
      sp.vx -= power * 0.04
      sp.vz -= power * 0.04
      wobble = Math.min(1.6, wobble + 0.3)
    },
    update(dt, t, state, input) {
      uniforms.uTime.value = t
      const speedH = Math.hypot(state.vx, state.vz)

      // 목표 스케일: 공중에서는 속도 방향으로 길쭉하게, 지상에서는 숨 쉬듯.
      const vy = THREE.MathUtils.clamp(state.vy, -16, 16)
      let ty = state.grounded ? 1 + Math.sin(t * 2.3) * 0.028 : 1 + Math.abs(vy) * 0.024
      if (state.grounded && input.mag > 0.15 && state.hopCd > 0) ty = 0.8 + (1 - state.hopCd / 0.07) * 0.1 // 도약 직전 웅크림
      const txz = 1 / Math.sqrt(ty)

      // 감쇠 스프링(과감쇠가 아니어서 한두 번 출렁이며 돌아옵니다)
      sp.vy += (-K * (sp.sy - ty) - C * sp.vy) * dt
      sp.sy += sp.vy * dt
      sp.vx += (-K * (sp.sx - txz) - C * sp.vx) * dt
      sp.sx += sp.vx * dt
      sp.vz += (-K * (sp.sz - txz) - C * sp.vz) * dt
      sp.sz += sp.vz * dt
      sp.sy = THREE.MathUtils.clamp(sp.sy, 0.45, 1.7)
      sp.sx = THREE.MathUtils.clamp(sp.sx, 0.7, 1.55)
      sp.sz = THREE.MathUtils.clamp(sp.sz, 0.7, 1.55)
      body.scale.set(sp.sx, sp.sy, sp.sz)

      // 위쪽이 이동 반대 방향으로 끌려옵니다(관성).
      const sx = THREE.MathUtils.clamp(-state.vx * 0.045, -0.4, 0.4)
      const sz = THREE.MathUtils.clamp(-state.vz * 0.045, -0.4, 0.4)
      shear.x += (sx - shear.x) * Math.min(1, dt * 9)
      shear.y += (sz - shear.y) * Math.min(1, dt * 9)
      uniforms.uShear.value.copy(shear)
      wobble = Math.max(wobble * Math.exp(-2.6 * dt), Math.min(0.6, speedH * 0.045))
      uniforms.uWob.value = wobble

      // 얼굴: 이동 방향을 바라보고, 얼굴도 몸이 끌려오는 만큼 따라갑니다.
      if (speedH > 0.6) {
        const want = Math.atan2(state.vx, state.vz)
        let d = want - faceYaw
        d = Math.atan2(Math.sin(d), Math.cos(d))
        faceYaw += d * Math.min(1, dt * 10)
      }
      face.rotation.y = faceYaw
      face.position.set(shear.x * 0.42, 1, shear.y * 0.42)
      face.rotation.x = THREE.MathUtils.clamp(-state.vy * 0.012, -0.25, 0.25)

      // 눈 깜빡임
      if (t > blinkAt) {
        blinking = 0.13
        blinkAt = t + 2.2 + Math.random() * 2.4
      }
      blinking = Math.max(0, blinking - dt)
      eyes.scale.y += ((blinking > 0 ? 0.1 : 1) - eyes.scale.y) * 0.6

      // 핵과 기포가 천천히 떠다닙니다.
      core.position.y = 0.95 + Math.sin(t * 1.7) * 0.03
      bubbles.forEach((b) => {
        const a = t * 0.9 + b.userData.seed
        b.position.set(Math.cos(a) * 0.36, 0.7 + ((t * 0.3 + b.userData.seed) % 1.2) * 0.55, Math.sin(a) * 0.36)
        b.scale.setScalar(0.7 + Math.sin(a * 2) * 0.2)
      })

      // 빛: 높이 뜨면 땅의 빛 웅덩이가 넓고 흐려집니다.
      const height = Math.max(0, state.y)
      const pr = 1.5 + height * 0.35
      pool.scale.set(pr, pr, 1)
      pool.material.opacity = Math.max(0.15, 0.6 - height * 0.12)
      pool.position.y = 0.05 - height
      halo.material.opacity = 0.5 + Math.sin(t * 2.2) * 0.06
      light.intensity = 16 + Math.sin(t * 2.2) * 2
    },
    dispose() {
      group.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) o.material.dispose()
      })
    },
  }
}
