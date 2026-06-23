import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const STEPS = [
  { threshold: 0,    label: 'Indoor unit mounted to wall' },
  { threshold: 0.22, label: 'Refrigerant lines connected' },
  { threshold: 0.44, label: 'Outdoor compressor installed' },
  { threshold: 0.66, label: 'System powered on' },
  { threshold: 0.75, label: 'Cooling at 18°C ❄' },
];

function seg(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }

// Build standard material helper
function mat(color, rough = 0.45, metal = 0.08, op = 1) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, transparent: op < 1, opacity: op });
}

// Box mesh
function box(w, h, d, color, rough, metal) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, rough, metal));
  m.castShadow = m.receiveShadow = true;
  return m;
}

// Cylinder mesh
function cyl(rt, rb, h, color, rough = 0.4, metal = 0.1, segs = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat(color, rough, metal));
  m.castShadow = true; return m;
}

// Tube between two points
function tube(s, e, r, color) {
  const sv = new THREE.Vector3(...s), ev = new THREE.Vector3(...e);
  const d = new THREE.Vector3().subVectors(ev, sv);
  const len = d.length();
  const mid = sv.clone().add(ev).multiplyScalar(0.5);
  const m = cyl(r, r, len, color, 0.3, 0.7, 10);
  m.position.copy(mid);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize());
  return m;
}

function setOpacity(group, op) {
  group.traverse(m => {
    if (m.isMesh) { m.material.opacity = op; m.material.transparent = op < 1; m.visible = op > 0.01; }
  });
}

export default function ACModelViewer({ progress = 0 }) {
  const mountRef   = useRef(null);
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, el.clientWidth / el.clientHeight, 0.1, 50);
    camera.position.set(0.2, 0.3, 5.6);
    camera.lookAt(0, 0, 0);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xfff9f4, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 5, 4); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 5;
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8f0ff, 0.55); fill.position.set(-4, 2, 3); scene.add(fill);
    const rim  = new THREE.DirectionalLight(0xfff4e8, 0.3);  rim.position.set(0, -2, -3); scene.add(rim);
    const top  = new THREE.DirectionalLight(0xffffff, 0.35);  top.position.set(0,  8, 0); scene.add(top);

    // Shadow receiver
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.14 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; floor.receiveShadow = true;
    scene.add(floor);

    // ── WALL (subtle backdrop) ────────────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf0eeeb, roughness: 0.9, metalness: 0 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), wallMat);
    wall.position.set(0, 0.2, -0.5); wall.receiveShadow = true;
    scene.add(wall);

    // ── INDOOR UNIT ───────────────────────────────────────────────────────────
    const indoor = new THREE.Group();
    indoor.rotation.y = 0.15;
    scene.add(indoor);

    // === Main housing body ===
    const bodyMat = mat(0xf2f1ed, 0.3, 0.04);
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.54, 0.25);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = bodyMesh.receiveShadow = true;
    indoor.add(bodyMesh);

    // === Faceplate (front panel, slightly lighter/glossier) ===
    const face = box(2.06, 0.50, 0.015, 0xfaf9f6, 0.22, 0.06);
    face.position.set(0, 0, 0.133);
    indoor.add(face);

    // === Top intake grille ===
    const intakeBack = box(1.96, 0.09, 0.005, 0xe2e0dc, 0.6, 0.02);
    intakeBack.position.set(0, 0.215, 0.132);
    indoor.add(intakeBack);
    for (let i = 0; i < 18; i++) {
      const slot = box(0.06, 0.055, 0.004, 0xcac8c4, 0.7, 0.02);
      slot.position.set(-0.88 + i * 0.105, 0.215, 0.134);
      indoor.add(slot);
    }

    // === Front vane / louvre (large flap at bottom) ===
    const louvre = box(1.88, 0.06, 0.018, 0xe8e6e2, 0.35, 0.04);
    louvre.rotation.x = 0.35;
    louvre.position.set(0, -0.18, 0.144);
    indoor.add(louvre);

    // === Horizontal vent slats (8 slats, each slightly tilted) ===
    for (let i = 0; i < 8; i++) {
      const slat = box(1.76, 0.016, 0.065, 0xe4e2de, 0.4, 0.04);
      slat.rotation.x = 0.28;
      slat.position.set(0, 0.01 - i * 0.038, 0.118);
      indoor.add(slat);
    }

    // === Vertical deflectors (3 inside the vent) ===
    for (let i = 0; i < 3; i++) {
      const def = box(0.012, 0.25, 0.06, 0xd8d6d2, 0.5, 0.02);
      def.position.set(-0.45 + i * 0.45, -0.06, 0.10);
      indoor.add(def);
    }

    // === End caps ===
    const capL = box(0.05, 0.50, 0.24, 0xcccac6, 0.4, 0.05);
    capL.position.set(-1.05, 0, 0);
    const capR = capL.clone(); capR.position.x = 1.05;
    indoor.add(capL, capR);

    // === Control panel / display area (right side) ===
    const panelBase = box(0.42, 0.10, 0.012, 0xe8e6e2, 0.35, 0.04);
    panelBase.position.set(0.72, 0.14, 0.133);
    indoor.add(panelBase);

    // === LCD display (dark, shows temp when on) ===
    const screenMat = mat(0x08111e, 0.08, 0.2);
    const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.065, 0.004), screenMat);
    screenMesh.position.set(0.74, 0.14, 0.141);
    indoor.add(screenMesh);

    // === Temp digits (placeholder geometry) ===
    const digitsMat = mat(0x00aaff, 0.1, 0.1);
    const digits = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.045), digitsMat);
    digits.position.set(0.74, 0.14, 0.144);
    digits.material.transparent = true; digits.material.opacity = 0;
    indoor.add(digits);

    // === 3 LED dots ===
    const ledMeshes = [0x00ff88, 0x2255ff, 0xff8800].map((c, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.009, 8, 8),
        mat(0x222222, 0.2, 0.1)
      );
      m.position.set(0.57 + i * 0.025, 0.14, 0.142);
      indoor.add(m);
      return { mesh: m, color: c };
    });

    // === BRAND logo emboss ===
    const logoBar = box(0.3, 0.008, 0.005, 0x2B2F86, 0.3, 0.2);
    logoBar.position.set(-0.72, -0.22, 0.135);
    indoor.add(logoBar);

    // === Mounting rail (top back) ===
    const rail = box(1.8, 0.05, 0.06, 0xaaaaaa, 0.6, 0.3);
    rail.position.set(0, 0.295, -0.065);
    indoor.add(rail);

    // ── COPPER PIPES ─────────────────────────────────────────────────────────
    const pipesGrp = new THREE.Group();
    scene.add(pipesGrp);

    // Insulation sleeve (black foam)
    const ins1 = tube([-0.42, 0.74, 0.07], [-0.42, -0.72, 0.07], 0.032, 0x1a1a1a);
    ins1.material.roughness = 0.95; ins1.material.metalness = 0;
    pipesGrp.add(ins1);

    // Main liquid line (smaller copper)
    const p1 = tube([-0.42, 0.74, 0.07], [-0.42, -0.72, 0.07], 0.018, 0xb87333);
    p1.material.roughness = 0.2; p1.material.metalness = 0.9;
    pipesGrp.add(p1);

    // Suction line (larger)
    const p2 = tube([-0.37, 0.74, 0.07], [-0.37, -0.72, 0.07], 0.024, 0xb87333);
    p2.material.roughness = 0.2; p2.material.metalness = 0.9;
    pipesGrp.add(p2);

    // Wall gland plate
    const gland = box(0.14, 0.14, 0.03, 0xd0cdc8, 0.6, 0.1);
    gland.position.set(-0.40, -0.0, -0.14);
    pipesGrp.add(gland);

    // Pipe clip / bracket
    const clip = box(0.08, 0.06, 0.10, 0x888888, 0.5, 0.3);
    clip.position.set(-0.40, 0.45, 0.02);
    pipesGrp.add(clip);

    // ── OUTDOOR UNIT ─────────────────────────────────────────────────────────
    const outdoor = new THREE.Group();
    outdoor.position.set(1.22, -0.95, 0);
    outdoor.rotation.y = -0.18;
    scene.add(outdoor);

    // === Main casing ===
    const caseMat = mat(0xd4d2ce, 0.5, 0.1);
    const caseGeo = new THREE.BoxGeometry(1.1, 1.12, 0.78);
    const caseMesh = new THREE.Mesh(caseGeo, caseMat);
    caseMesh.castShadow = caseMesh.receiveShadow = true;
    outdoor.add(caseMesh);

    // === Top panel ===
    const topPanel = box(1.08, 0.04, 0.76, 0xc8c6c2, 0.5, 0.1);
    topPanel.position.y = 0.58;
    outdoor.add(topPanel);

    // === Front grille frame ===
    const grilleOuter = box(0.82, 0.82, 0.04, 0x1c1c1c, 0.7, 0.15);
    grilleOuter.position.set(0, 0.1, 0.41);
    outdoor.add(grilleOuter);

    // === Grille aperture (slightly recessed dark mesh) ===
    const grilleMesh = box(0.74, 0.74, 0.01, 0x0d0d0d, 0.9, 0.05);
    grilleMesh.position.set(0, 0.1, 0.415);
    outdoor.add(grilleMesh);

    // === Horizontal grille bars ===
    for (let i = 0; i < 20; i++) {
      const bar = box(0.72, 0.012, 0.008, 0x181818, 0.8, 0.1);
      bar.position.set(0, 0.455 - i * 0.038, 0.42);
      outdoor.add(bar);
    }

    // === Fan ring ===
    const fanRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.31, 0.022, 10, 48),
      mat(0x141414, 0.6, 0.2)
    );
    fanRing.position.set(0, 0.1, 0.43);
    outdoor.add(fanRing);

    // === Fan assembly ===
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 0.1, 0.43);
    outdoor.add(fanGroup);

    // Hub
    const hubMesh = cyl(0.055, 0.05, 0.035, 0x101010, 0.5, 0.4, 16);
    hubMesh.rotation.x = Math.PI / 2; hubMesh.position.z = 0.018;
    fanGroup.add(hubMesh);

    // 5 curved fan blades using CatmullRom curve → TubeGeometry
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 * Math.PI) / 180;
      const blade = new THREE.Group();

      // Use a tapered thin box as each blade for now, rotated
      const bMesh = box(0.28, 0.07, 0.016, 0xb0aeaa, 0.4, 0.12);
      bMesh.position.set(0.16, 0.0, 0);
      bMesh.rotation.z = 0.22; // slight pitch
      blade.rotation.z = angle;
      blade.add(bMesh);
      fanGroup.add(blade);
    }

    // === Right-side panel (vertical grille slats) ===
    for (let i = 0; i < 6; i++) {
      const s = box(0.012, 0.24, 0.06, 0x111111, 0.7, 0.1);
      s.position.set(0.545, 0.18 + i * 0.08, 0.06);
      outdoor.add(s);
    }

    // === Bottom service panel ===
    const svcPanel = box(0.8, 0.22, 0.04, 0xc2c0bc, 0.55, 0.1);
    svcPanel.position.set(0, -0.39, 0.41);
    outdoor.add(svcPanel);

    // === Compressor hump (bottom front) ===
    const comp = box(0.46, 0.34, 0.52, 0xbebcb8, 0.6, 0.12);
    comp.position.set(-0.1, -0.36, -0.06);
    outdoor.add(comp);

    // === Pipe connections at back ===
    const connBig = cyl(0.042, 0.042, 0.12, 0xb87333, 0.2, 0.85, 12);
    connBig.rotation.z = Math.PI / 2; connBig.position.set(-0.48, 0.32, -0.3);
    outdoor.add(connBig);
    const connSmall = cyl(0.028, 0.028, 0.10, 0xb87333, 0.2, 0.85, 12);
    connSmall.rotation.z = Math.PI / 2; connSmall.position.set(-0.48, 0.2, -0.3);
    outdoor.add(connSmall);

    // === Nameplate ===
    const plate = box(0.28, 0.06, 0.005, 0xe8e6e2, 0.3, 0.05);
    plate.position.set(-0.22, -0.05, 0.415);
    outdoor.add(plate);

    // === Feet / base ===
    for (let i = 0; i < 4; i++) {
      const foot = cyl(0.055, 0.065, 0.06, 0x888888, 0.7, 0.2, 8);
      foot.position.set(i < 2 ? -0.38 : 0.38, -0.59, i % 2 === 0 ? -0.28 : 0.18);
      outdoor.add(foot);
    }

    // ── COLD MIST ─────────────────────────────────────────────────────────────
    const mistCount = 40;
    const mistData = Array.from({ length: mistCount }, () => ({
      x: (Math.random() - 0.5) * 1.9 - 1.05,
      baseY: -0.22 + Math.random() * 0.14,
      z: 0.2 + Math.random() * 0.18,
      speed: 0.22 + Math.random() * 0.2,
      size: 0.014 + Math.random() * 0.026,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.025,
    }));
    const mistMeshes = mistData.map(pt => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(pt.size, 6, 6),
        mat(0x8CB0CE, 0.8, 0, 0)
      );
      m.material.depthWrite = false;
      m.position.set(pt.x, pt.baseY, pt.z);
      scene.add(m); return m;
    });

    // ── RENDER LOOP ───────────────────────────────────────────────────────────
    let t0 = null, rafId;
    const loop = (ts) => {
      rafId = requestAnimationFrame(loop);
      if (!t0) t0 = ts;
      const t  = (ts - t0) / 1000;
      const p  = progressRef.current;

      const indoorP  = seg(p, 0, 0.22);
      const pipesP   = seg(p, 0.22, 0.44);
      const outdoorP = seg(p, 0.44, 0.66);
      const powerP   = seg(p, 0.66, 0.75);
      const mistP    = seg(p, 0.75, 1.0);

      // Indoor — drop from above
      indoor.position.set(-1.05, 1.1 + (1 - indoorP) * 0.85, 0);
      setOpacity(indoor, indoorP);

      // Power on effects
      if (powerP > 0.4) {
        // LEDs light up
        ledMeshes.forEach(({ mesh, color }, i) => {
          const on = powerP > 0.5 + i * 0.1;
          mesh.material.color.set(on ? color : 0x222222);
          mesh.material.emissive.set(on ? color : 0x000000);
          mesh.material.emissiveIntensity = on ? 1.8 : 0;
        });
        // Screen turns on
        const sp = seg(powerP, 0.5, 1.0);
        digits.material.opacity = sp;
        screenMat.emissive.set(0x002244);
        screenMat.emissiveIntensity = sp * 0.4;
        const temp = Math.round(30 - mistP * 12);
        // tint digits to show "on"
        digits.material.color.set(sp > 0.5 ? 0x22aaff : 0x001122);
      }

      // Pipes — fade in
      setOpacity(pipesGrp, pipesP);

      // Outdoor — rise from below
      outdoor.position.set(1.22, -0.95 + (1 - outdoorP) * -0.8, 0);
      setOpacity(outdoor, outdoorP);

      // Fan rotation (accelerates as outdoorP increases)
      if (outdoorP > 0.45) {
        const speed = (outdoorP - 0.45) * 0.1 + powerP * 0.05;
        fanGroup.rotation.z += speed;
      }

      // Mist
      mistData.forEach((pt, i) => {
        const m = mistMeshes[i];
        const cycle = (t * pt.speed + pt.phase) % 0.9;
        m.position.y = pt.baseY - cycle * 0.9;
        m.position.x = pt.x + Math.sin(t * 0.4 + pt.phase) * pt.drift;
        m.material.opacity = mistP * 0.55 * Math.max(0, 1 - cycle / 0.8);
      });

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(loop);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  const stepIdx = STEPS.reduce((acc, s, i) => (progress >= s.threshold ? i : acc), 0);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'none',
      }}>
        <span style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2B2F86, #8E2A33)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(43,47,134,0.35)',
        }}>
          {String(stepIdx + 1).padStart(2, '0')}
        </span>
        <p style={{
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500,
          fontSize: '1.05rem', color: '#1b1b1a', whiteSpace: 'nowrap',
        }}>
          {STEPS[stepIdx].label}
        </p>
      </div>

      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        width: 220, height: 2, borderRadius: 2, background: '#e0ddd7', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: 'linear-gradient(to right, #2B2F86, #8E2A33)',
          transition: 'width 0.08s linear', borderRadius: 2,
        }} />
      </div>
    </div>
  );
}