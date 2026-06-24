import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const STEPS = [
  { threshold: 0,    label: 'Drawing the system schematic…' },
  { threshold: 0.15, label: 'Indoor unit mounted to wall' },
  { threshold: 0.30, label: 'Refrigerant lines connected' },
  { threshold: 0.52, label: 'Outdoor compressor installed' },
  { threshold: 0.72, label: 'System powered on — 22°C' },
  { threshold: 0.82, label: 'Cooling at 18°C ❄' },
];

function seg(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }
function lerp(a, b, t) { return a + (b - a) * t; }

// ── helpers ─────────────────────────────────────────────────────────────────
function mat(color, rough = 0.42, metal = 0.08, op = 1) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, transparent: op < 1, opacity: op, envMapIntensity: 0.6 });
}
function box(w, h, d, color, rough, metal) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, rough, metal));
  m.castShadow = m.receiveShadow = true; return m;
}
function cyl(rt, rb, h, col, rough = 0.35, metal = 0.1, segs = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat(col, rough, metal));
  m.castShadow = true; return m;
}
function tube(s, e, r, color) {
  const sv = new THREE.Vector3(...s), ev = new THREE.Vector3(...e);
  const d = new THREE.Vector3().subVectors(ev, sv);
  const len = d.length(), mid = sv.clone().add(ev).multiplyScalar(0.5);
  const m = cyl(r, r, len, color, 0.2, 0.85, 10);
  m.position.copy(mid);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
function setOp(grp, op) {
  grp.traverse(m => {
    if (m.isMesh) { m.material.opacity = op; m.material.transparent = op < 1; m.visible = op > 0.01; }
  });
}

// ── SVG SKETCH — coordinates projected from camera (FOV 34°, z=5.8) ────────
// World → SVG: scaleX=79.2, scaleY=107.2, center=(250,190), Y inverted
function w2s(wx, wy) {
  return [250 + wx * 79.2, 190 - wy * 107.2];
}
const [IX, IY] = w2s(-1.05, 1.05); // indoor centre
const [OX, OY] = w2s(1.24, -1.0);  // outdoor centre
const [PX]     = w2s(-0.42, 0);    // pipe X

function Sketch({ drawProgress }) {
  // draw over 0-0.12 scroll, then fade out 0.10-0.18 (overlapping 3D fade-in)
  const pct = Math.min(1, drawProgress / 0.12);
  const fade = Math.max(0, 1 - (drawProgress - 0.10) / 0.08);
  if (fade <= 0) return null;

  const d = (from, to) => Math.min(1, Math.max(0, (pct - from) / (to - from)));

  // stroke-dashoffset: 1=hidden, 0=fully drawn
  const off = (start, end) => (1 - d(start, end)).toFixed(3);

  // Indoor unit dims in SVG units
  const iW = 1.05 * 79.2; // half-width
  const iH = 0.26 * 107.2; // half-height
  const oW = 0.56 * 79.2;
  const oH = 0.57 * 107.2;

  return (
    <svg
      viewBox="0 0 500 380"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: fade, pointerEvents: 'none', zIndex: 10,
        filter: 'drop-shadow(0 0 12px rgba(43,47,134,0.08))',
      }}
    >
      <defs>
        <marker id="arr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#2B2F86" opacity="0.6" />
        </marker>
      </defs>

      {/* Wall divider */}
      <line x1={w2s(0,2)[0]} y1="10" x2={w2s(0,-2)[0]} y2="370"
        stroke="#2B2F86" strokeWidth="1.5" strokeOpacity="0.12"
        strokeDasharray="6 4"
      />
      <text x={w2s(-1.2, 1.7)[0]} y="24" fontSize="8" fill="#2B2F86" opacity={d(0,0.1) * 0.5} fontFamily="monospace" letterSpacing="1">INDOOR</text>
      <text x={w2s(0.35, 1.7)[0]} y="24" fontSize="8" fill="#2B2F86" opacity={d(0,0.1) * 0.5} fontFamily="monospace" letterSpacing="1">OUTDOOR</text>

      {/* ─── INDOOR UNIT ─────────────────────────────────────────── */}
      {/* main body */}
      <rect x={IX-iW} y={IY-iH} width={iW*2} height={iH*2} rx="4"
        fill="none" stroke="#1b1b1a" strokeWidth="2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0, 0.18)}
      />
      {/* vent slats inside */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <line key={i}
          x1={IX-iW+8} y1={IY-iH+14+i*5.5} x2={IX+iW-8} y2={IY-iH+14+i*5.5}
          stroke="#555" strokeWidth="0.9" strokeOpacity="0.7"
          strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.15, 0.32)}
        />
      ))}
      {/* display panel */}
      <rect x={IX+iW-36} y={IY-iH+4} width="32" height="14" rx="2"
        fill="none" stroke="#2B2F86" strokeWidth="1.2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.18, 0.30)}
      />
      {/* 3 LED dots */}
      {[0,1,2].map(i => (
        <circle key={i} cx={IX+iW-54+i*7} cy={IY-iH+11} r="2.2"
          fill="#2B2F86" opacity={d(0.25, 0.38) * 0.6}
        />
      ))}
      {/* louvre */}
      <line x1={IX-iW+6} y1={IY+iH-6} x2={IX+iW-6} y2={IY+iH-6}
        stroke="#888" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.22, 0.35)}
      />
      {/* mounting rail */}
      <line x1={IX-iW} y1={IY-iH-5} x2={IX+iW} y2={IY-iH-5}
        stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.10, 0.22)}
      />

      {/* ─── PIPES ───────────────────────────────────────────────── */}
      {/* insulation sleeve */}
      <line x1={PX-3} y1={IY+iH} x2={PX-3} y2={OY-oH}
        stroke="#222" strokeWidth="7" strokeLinecap="round" strokeOpacity="0.18"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.32, 0.52)}
      />
      {/* liquid line */}
      <line x1={PX-3} y1={IY+iH} x2={PX-3} y2={OY-oH}
        stroke="#b87333" strokeWidth="2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.32, 0.52)}
      />
      {/* suction line */}
      <line x1={PX+4} y1={IY+iH} x2={PX+4} y2={OY-oH}
        stroke="#b87333" strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.34, 0.54)}
      />
      {/* wall gland */}
      <rect x={PX-10} y={w2s(-0.42,-0.03)[1]-8} width="20" height="16" rx="2"
        fill="none" stroke="#888" strokeWidth="1.2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.40, 0.52)}
      />

      {/* ─── OUTDOOR UNIT ────────────────────────────────────────── */}
      {/* main body */}
      <rect x={OX-oW} y={OY-oH} width={oW*2} height={oH*2} rx="4"
        fill="none" stroke="#1b1b1a" strokeWidth="2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.50, 0.68)}
      />
      {/* grille bars */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <line key={i}
          x1={OX-oW+6} y1={OY-oH+12+i*10} x2={OX+oW-6} y2={OY-oH+12+i*10}
          stroke="#333" strokeWidth="0.8" strokeOpacity="0.5"
          strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.60, 0.76)}
        />
      ))}
      {/* fan ring */}
      <circle cx={OX} cy={OY} r={0.31*79.2}
        fill="none" stroke="#1b1b1a" strokeWidth="2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.62, 0.78)}
      />
      {/* fan blades */}
      {[0,72,144,216,288].map((ang, i) => {
        const a = ang * Math.PI / 180;
        const bx = OX + Math.cos(a) * 0.25 * 79.2;
        const by = OY - Math.sin(a) * 0.25 * 107.2;
        return (
          <line key={i} x1={OX} y1={OY} x2={bx} y2={by}
            stroke="#555" strokeWidth="1.8" strokeLinecap="round"
            strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.65, 0.80)}
          />
        );
      })}
      {/* hub */}
      <circle cx={OX} cy={OY} r="7"
        fill="none" stroke="#222" strokeWidth="2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.72, 0.84)}
      />
      {/* compressor (cylinder side view) */}
      <ellipse cx={OX-0.15*79.2} cy={OY+0.3*107.2} rx="18" ry="30"
        fill="none" stroke="#888" strokeWidth="1.2"
        strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.68, 0.82)}
      />
      {/* feet */}
      {[-0.38, 0.38].map((fx, i) => (
        <line key={i}
          x1={OX+fx*79.2-4} y1={OY+oH} x2={OX+fx*79.2+4} y2={OY+oH+8}
          stroke="#444" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="1" pathLength="1" strokeDashoffset={off(0.75, 0.88)}
        />
      ))}

      {/* ─── ANNOTATION LABELS ───────────────────────────────────── */}
      {d(0.55,0.70) > 0 && <>
        <line x1={IX+iW} y1={IY} x2={IX+iW+28} y2={IY} stroke="#2B2F86" strokeWidth="0.8" markerEnd="url(#arr)" opacity={d(0.55,0.70) * 0.7} />
        <text x={IX+iW+32} y={IY+4} fontSize="8.5" fill="#2B2F86" fontFamily="monospace" opacity={d(0.55,0.70) * 0.7}>indoor unit</text>
      </>}
      {d(0.60,0.75) > 0 && <>
        <line x1={PX+10} y1={w2s(-0.42,0)[1]} x2={PX+38} y2={w2s(-0.42,0)[1]} stroke="#8E2A33" strokeWidth="0.8" markerEnd="url(#arr)" opacity={d(0.60,0.75) * 0.7} />
        <text x={PX+42} y={w2s(-0.42,0)[1]+4} fontSize="8.5" fill="#8E2A33" fontFamily="monospace" opacity={d(0.60,0.75) * 0.7}>R-410A line</text>
      </>}
      {d(0.70,0.85) > 0 && <>
        <line x1={OX+oW} y1={OY} x2={OX+oW+18} y2={OY} stroke="#2B2F86" strokeWidth="0.8" markerEnd="url(#arr)" opacity={d(0.70,0.85) * 0.7} />
        <text x={OX+oW+22} y={OY+4} fontSize="8.5" fill="#2B2F86" fontFamily="monospace" opacity={d(0.70,0.85) * 0.7}>compressor</text>
      </>}

      {/* ─── DIMENSION LINES ─────────────────────────────────────── */}
      {d(0.80,1.0) > 0 && <>
        <line x1={IX-iW-12} y1={IY} x2={IX-iW-12} y2={OY}
          stroke="#999" strokeWidth="0.8"
          strokeDasharray="3 3" opacity={d(0.80,1.0) * 0.5}
        />
        <line x1={IX-iW-15} y1={IY} x2={IX-iW-9} y2={IY} stroke="#999" strokeWidth="1" opacity={d(0.80,1.0) * 0.5} />
        <line x1={IX-iW-15} y1={OY} x2={IX-iW-9} y2={OY} stroke="#999" strokeWidth="1" opacity={d(0.80,1.0) * 0.5} />
        <text
          x={IX-iW-22} y={(IY+OY)/2+3}
          fontSize="7" fill="#666" fontFamily="monospace"
          transform={`rotate(-90 ${IX-iW-22} ${(IY+OY)/2+3})`}
          opacity={d(0.85,1.0) * 0.6}
        >height</text>
      </>}
    </svg>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ACModelViewer({ progress = 0 }) {
  const mountRef   = useRef(null);
  const progressRef = useRef(progress);
  const threeRef   = useRef(null);
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
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 0.8s ease';

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, el.clientWidth / el.clientHeight, 0.1, 50);
    camera.position.set(0, 0.3, 5.8);

    // ── Procedural env map ────────────────────────────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xfff8f2, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 5, 4); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8f2ff, 0.5); fill.position.set(-5, 1, 3); scene.add(fill);
    const rim  = new THREE.DirectionalLight(0xfff0e0, 0.28); rim.position.set(1, -3, -4); scene.add(rim);

    // Wall
    const wallM = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.92, metalness: 0 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), wallM);
    wall.position.set(0, 0.2, -0.55); wall.receiveShadow = true;
    scene.add(wall);

    // Shadow plane
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.12 }));
    sp.rotation.x = -Math.PI / 2; sp.position.y = -2.0; sp.receiveShadow = true;
    scene.add(sp);

    // ── INDOOR UNIT ───────────────────────────────────────────────────────────
    const indoor = new THREE.Group();
    indoor.rotation.y = 0.15;
    scene.add(indoor);

    // Body
    const bodyM = mat(0xf3f2ee, 0.28, 0.06);
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.52, 0.22), bodyM);
    bodyMesh.castShadow = bodyMesh.receiveShadow = true;
    indoor.add(bodyMesh);

    // Glossy faceplate
    const faceMat = mat(0xfaf9f6, 0.18, 0.08);
    const face = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.48, 0.008), faceMat);
    face.position.z = 0.116; face.castShadow = true;
    indoor.add(face);

    // Top intake mesh (decorative perforations)
    const intakePlate = box(1.92, 0.08, 0.006, 0xe2e0db, 0.5, 0.04);
    intakePlate.position.set(0, 0.22, 0.115);
    indoor.add(intakePlate);
    for (let i = 0; i < 22; i++) {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.014, 6), mat(0xd0cec9, 0.6, 0.02));
      dot.position.set(-1.0 + i * 0.095, 0.22, 0.119);
      dot.rotation.x = -Math.PI / 2;
      indoor.add(dot);
    }

    // Vent louvre (large bottom flap)
    const louvre = box(1.86, 0.054, 0.022, 0xe6e4e0, 0.32, 0.05);
    louvre.rotation.x = 0.38; louvre.position.set(0, -0.20, 0.126);
    indoor.add(louvre);

    // Vent slats (9 slats, slightly angled)
    for (let i = 0; i < 9; i++) {
      const slat = box(1.74, 0.013, 0.06, 0xe2e0db, 0.38, 0.04);
      slat.rotation.x = 0.3; slat.position.set(0, 0.05 - i * 0.034, 0.11);
      indoor.add(slat);
    }

    // 3 vertical air deflectors inside vent
    for (let i = 0; i < 3; i++) {
      const def = box(0.009, 0.22, 0.056, 0xd4d2ce, 0.5, 0.03);
      def.position.set(-0.55 + i * 0.55, -0.06, 0.10);
      indoor.add(def);
    }

    // End caps (more sculptural — slightly bevelled)
    for (let s = -1; s <= 1; s += 2) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.5, 0.22), mat(0xc8c6c2, 0.38, 0.07));
      cap.position.set(s * 1.08, 0, 0); cap.castShadow = true;
      indoor.add(cap);
    }

    // Control panel strip
    const panel = box(0.52, 0.09, 0.01, 0xedebe7, 0.3, 0.05);
    panel.position.set(0.74, 0.16, 0.116);
    indoor.add(panel);

    // LCD screen
    const scrMat = mat(0x060d1a, 0.06, 0.25);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.058, 0.003), scrMat);
    screen.position.set(0.74, 0.16, 0.121); indoor.add(screen);

    // Temp readout plane (glowing blue when on)
    const readMat = new THREE.MeshStandardMaterial({ color: 0x1155cc, emissive: 0x1155cc, emissiveIntensity: 0, transparent: true, opacity: 0 });
    const readout = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.042), readMat);
    readout.position.set(0.74, 0.16, 0.123); indoor.add(readout);

    // 3 indicator LEDs
    const ledInfo = [
      { x: 0.57, color: 0x00ff88 },
      { x: 0.60, color: 0x2266ff },
      { x: 0.63, color: 0xff8800 },
    ];
    const leds = ledInfo.map(info => {
      const lm = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.2 });
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), lm);
      l.position.set(info.x, 0.16, 0.122); indoor.add(l);
      return { mesh: l, mat: lm, color: info.color };
    });

    // Brand logo indent
    const logo = box(0.28, 0.007, 0.004, 0x2B2F86, 0.25, 0.35);
    logo.position.set(-0.76, -0.225, 0.115); indoor.add(logo);

    // Mounting rail
    const rail = box(1.8, 0.046, 0.055, 0xaaaaaa, 0.55, 0.35);
    rail.position.set(0, 0.296, -0.062); indoor.add(rail);

    // Wall anchor screws (4)
    for (let s of [-0.8, -0.3, 0.3, 0.8]) {
      const screw = cyl(0.009, 0.009, 0.02, 0x888888, 0.4, 0.6, 8);
      screw.rotation.z = Math.PI / 2; screw.position.set(s, 0.296, -0.03);
      indoor.add(screw);
    }

    // ── COPPER PIPES ─────────────────────────────────────────────────────────
    const pipesGrp = new THREE.Group();
    scene.add(pipesGrp);

    // Insulation (black foam)
    const ins = tube([-0.42, 0.73, 0.06], [-0.42, -0.78, 0.06], 0.034, 0x1a1a1a);
    ins.material.roughness = 0.96; ins.material.metalness = 0;
    pipesGrp.add(ins);
    // Liquid line
    const pl = tube([-0.42, 0.73, 0.06], [-0.42, -0.78, 0.06], 0.016, 0xb87333);
    pl.material.roughness = 0.18; pl.material.metalness = 0.92; pipesGrp.add(pl);
    // Suction line
    const ps = tube([-0.37, 0.73, 0.06], [-0.37, -0.78, 0.06], 0.022, 0xb87333);
    ps.material.roughness = 0.18; ps.material.metalness = 0.92; pipesGrp.add(ps);

    // Wall entry gland
    const gland = box(0.16, 0.16, 0.035, 0xcccac6, 0.55, 0.12);
    gland.position.set(-0.40, -0.03, -0.14); pipesGrp.add(gland);

    // Pipe clamp
    const clamp = box(0.09, 0.055, 0.08, 0x888888, 0.5, 0.35);
    clamp.position.set(-0.40, 0.44, 0.02); pipesGrp.add(clamp);

    // ── OUTDOOR UNIT ─────────────────────────────────────────────────────────
    const outdoor = new THREE.Group();
    outdoor.position.set(1.24, -1.0, 0);
    outdoor.rotation.y = -0.17;
    scene.add(outdoor);

    // Main casing
    const caseM = mat(0xd2d0cc, 0.48, 0.12);
    const caseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.14, 0.82), caseM);
    caseMesh.castShadow = caseMesh.receiveShadow = true; outdoor.add(caseMesh);

    // Top panel (slightly different tone)
    const topP = box(1.10, 0.04, 0.80, 0xc4c2be, 0.5, 0.1); topP.position.y = 0.59; outdoor.add(topP);

    // Top vents (slanted)
    for (let i = 0; i < 8; i++) {
      const v = box(0.9, 0.015, 0.06, 0x1a1a1a, 0.7, 0.1);
      v.position.set(0, 0.61, -0.28 + i * 0.085);
      v.rotation.x = 0.18; outdoor.add(v);
    }

    // Front panel recessed area
    const frontRecess = box(0.85, 0.88, 0.02, 0xc8c6c2, 0.52, 0.1);
    frontRecess.position.set(0, 0.08, 0.42); outdoor.add(frontRecess);

    // Grille outer frame
    const gFrame = box(0.78, 0.82, 0.035, 0x161616, 0.7, 0.15);
    gFrame.position.set(0, 0.12, 0.44); outdoor.add(gFrame);

    // Grille mesh (tight horizontal bars)
    for (let i = 0; i < 26; i++) {
      const gb = box(0.72, 0.01, 0.008, 0x0d0d0d, 0.85, 0.08);
      gb.position.set(0, 0.485 - i * 0.032, 0.457); outdoor.add(gb);
    }
    // Vertical grille bars (sparse)
    for (let i = 0; i < 4; i++) {
      const gv = box(0.008, 0.78, 0.006, 0x0d0d0d, 0.85, 0.08);
      gv.position.set(-0.27 + i * 0.18, 0.12, 0.458); outdoor.add(gv);
    }

    // Fan assembly
    const fanGroup = new THREE.Group();
    fanGroup.position.set(0, 0.12, 0.46); outdoor.add(fanGroup);

    // Fan ring (chrome)
    const fRing = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 10, 52), mat(0x888888, 0.3, 0.6));
    fanGroup.add(fRing);

    // 5 blades — real curved shape using lathe + extrude
    for (let i = 0; i < 5; i++) {
      const ang = (i * 72 * Math.PI) / 180;
      const bladeGrp = new THREE.Group();
      bladeGrp.rotation.z = ang;

      // Main blade body — tapered box with twist
      const bMat = mat(0xa8a6a2, 0.35, 0.18);
      const bGeo = new THREE.BoxGeometry(0.29, 0.075, 0.018);
      const blade = new THREE.Mesh(bGeo, bMat);
      blade.position.set(0.16, 0.0, 0.005);
      blade.rotation.z = 0.24; // pitch
      blade.rotation.y = -0.14; // sweep
      blade.castShadow = true;
      bladeGrp.add(blade);

      // Blade root reinforcement
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.02, 8), mat(0x888888, 0.4, 0.3));
      root.rotation.x = Math.PI / 2; root.position.set(0.05, 0, 0);
      bladeGrp.add(root);

      fanGroup.add(bladeGrp);
    }

    // Hub cone
    const hubCone = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 16), mat(0x101010, 0.5, 0.4));
    hubCone.rotation.x = Math.PI / 2; hubCone.position.z = 0.04;
    fanGroup.add(hubCone);

    // Hub cap
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.05, 0.028, 16), mat(0x0c0c0c, 0.4, 0.5));
    hubCap.rotation.x = Math.PI / 2; hubCap.position.z = 0.014;
    fanGroup.add(hubCap);

    // Right side vents
    for (let i = 0; i < 8; i++) {
      const sv = box(0.012, 0.18, 0.055, 0x111111, 0.7, 0.1);
      sv.position.set(0.552, 0.2 + i * 0.075, 0.04); outdoor.add(sv);
    }

    // Bottom service panel
    const svc = box(0.86, 0.2, 0.04, 0xc0beba, 0.55, 0.1);
    svc.position.set(0, -0.41, 0.44); outdoor.add(svc);
    // Service panel screw
    const scr = cyl(0.008, 0.008, 0.006, 0x777777, 0.4, 0.6, 6);
    scr.rotation.x = Math.PI / 2; scr.position.set(0.36, -0.41, 0.463);
    outdoor.add(scr);

    // Compressor housing
    const comp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.56, 24), mat(0xbab8b4, 0.55, 0.12));
    comp.position.set(-0.15, -0.3, -0.12); comp.castShadow = true; outdoor.add(comp);
    // Compressor top dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xb0aeaa, 0.5, 0.12));
    dome.position.set(-0.15, -0.02, -0.12); outdoor.add(dome);
    // Compressor banding
    for (let i = 0; i < 3; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.008, 6, 24), mat(0x888888, 0.4, 0.3));
      band.rotation.x = Math.PI / 2; band.position.set(-0.15, -0.25 + i * 0.14, -0.12);
      outdoor.add(band);
    }

    // Pipe service valves
    const valve1 = cyl(0.04, 0.04, 0.09, 0x888888, 0.4, 0.45, 10);
    valve1.rotation.z = Math.PI / 2; valve1.position.set(-0.52, 0.28, -0.28); outdoor.add(valve1);
    const valve2 = cyl(0.028, 0.028, 0.07, 0x888888, 0.4, 0.45, 10);
    valve2.rotation.z = Math.PI / 2; valve2.position.set(-0.52, 0.14, -0.28); outdoor.add(valve2);

    // 4 rubber feet
    for (const [xi, zi] of [[-0.4, -0.32], [0.4, -0.32], [-0.4, 0.22], [0.4, 0.22]]) {
      const f = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.065, 0.065, 10), mat(0x333333, 0.95, 0));
      f.position.set(xi, -0.605, zi); outdoor.add(f);
    }

    // Nameplate
    const npMesh = box(0.24, 0.055, 0.004, 0xeae8e4, 0.28, 0.06);
    npMesh.position.set(-0.18, -0.04, 0.462); outdoor.add(npMesh);
    // Nameplate text line (simulated)
    const npLine = box(0.16, 0.008, 0.002, 0x2B2F86, 0.3, 0.3);
    npLine.position.set(-0.18, -0.04, 0.464); outdoor.add(npLine);

    // ── MIST ─────────────────────────────────────────────────────────────────
    const mistN = 48;
    const mistD = Array.from({ length: mistN }, () => ({
      x: (Math.random() - 0.5) * 1.8 - 1.05,
      by: -0.22 + Math.random() * 0.12,
      z: 0.18 + Math.random() * 0.2,
      spd: 0.2 + Math.random() * 0.18,
      sz: 0.012 + Math.random() * 0.024,
      ph: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.02,
    }));
    const mistM = mistD.map(pt => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(pt.sz, 6, 6), mat(0x8CB0CE, 0.8, 0, 0));
      m.material.depthWrite = false; m.position.set(pt.x, pt.by, pt.z); scene.add(m); return m;
    });

    // ── CAMERA TARGET KEYFRAMES per scroll step ───────────────────────────────
    const camKeys = [
      { pos: [0, 0.3, 5.8], look: [0, 0, 0] },         // 0 - wide
      { pos: [-0.9, 1.1, 3.4], look: [-1.05, 1.0, 0] }, // 0.15 - zoom indoor
      { pos: [-0.5, 0.1, 4.2], look: [-0.4, 0.0, 0] },  // 0.30 - pipe connection
      { pos: [0.8, -0.5, 4.0], look: [1.2, -0.9, 0] },  // 0.52 - outdoor
      { pos: [0, 0.5, 4.5], look: [0, 0.0, 0] },        // 0.72 - wide powered
      { pos: [-0.9, 0.1, 3.2], look: [-1.05, -0.1, 0] },// 0.82 - mist close up
    ];
    const keyTimes = [0, 0.15, 0.30, 0.52, 0.72, 0.82];

    function getCamForProgress(p) {
      for (let i = keyTimes.length - 1; i >= 0; i--) {
        if (p >= keyTimes[i]) {
          const next = Math.min(i + 1, keyTimes.length - 1);
          if (next === i) return camKeys[i];
          const t = seg(p, keyTimes[i], keyTimes[next]);
          const ease = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
          const a = camKeys[i], b = camKeys[next];
          return {
            pos: a.pos.map((v, j) => lerp(v, b.pos[j], ease)),
            look: a.look.map((v, j) => lerp(v, b.look[j], ease)),
          };
        }
      }
      return camKeys[0];
    }

    // ── LOOP ─────────────────────────────────────────────────────────────────
    let t0 = null, rafId;
    const loop = ts => {
      rafId = requestAnimationFrame(loop);
      if (!t0) t0 = ts;
      const t  = (ts - t0) / 1000;
      const p  = progressRef.current;

      // Show canvas — fades in starting at 0.10, overlapping sketch fade-out
      const show3D = seg(p, 0.10, 0.18);
      renderer.domElement.style.opacity = show3D.toFixed(3);

      // Camera
      const ck = getCamForProgress(p);
      camera.position.set(...ck.pos);
      camera.lookAt(...ck.look);

      const indP = seg(p, 0.15, 0.30);
      const pipP = seg(p, 0.30, 0.50);
      const outP = seg(p, 0.52, 0.68);
      const pwrP = seg(p, 0.72, 0.82);
      const mstP = seg(p, 0.82, 1.0);

      // Indoor
      indoor.position.set(-1.05, 1.05 + (1 - indP) * 0.7, 0);
      setOp(indoor, indP);

      // Power effects
      if (pwrP > 0) {
        leds.forEach(({ mat: lm, color }, i) => {
          const on = pwrP > 0.3 + i * 0.1;
          lm.color.set(on ? color : 0x222222);
          lm.emissive.set(on ? color : 0x000000);
          lm.emissiveIntensity = on ? 2.0 : 0;
        });
        readMat.opacity = Math.min(0.9, pwrP * 1.4);
        readMat.emissiveIntensity = pwrP * 1.2;
        scrMat.emissive.set(0x001428);
        scrMat.emissiveIntensity = pwrP * 0.35;
      }

      // Pipes
      setOp(pipesGrp, pipP);

      // Outdoor
      outdoor.position.set(1.24, -1.0 + (1 - outP) * -0.75, 0);
      setOp(outdoor, outP);

      // Fan spin
      if (outP > 0.4) fanGroup.rotation.z += 0.038 + pwrP * 0.055;

      // Mist
      mistD.forEach((d, i) => {
        const m = mistM[i];
        const cycle = (t * d.spd + d.ph) % 0.95;
        m.position.y = d.by - cycle * 0.85;
        m.position.x = d.x + Math.sin(t * 0.35 + d.ph) * d.drift;
        m.material.opacity = mstP * 0.55 * Math.max(0, 1 - cycle / 0.85);
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
      {/* SVG sketch layer */}
      <Sketch drawProgress={progress} />

      {/* Three.js canvas */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Step indicator */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'none', zIndex: 20,
      }}>
        <span style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2B2F86, #8E2A33)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13.5, flexShrink: 0,
          boxShadow: '0 4px 16px rgba(43,47,134,0.38)',
        }}>
          {String(stepIdx + 1).padStart(2, '0')}
        </span>
        <p style={{
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500,
          fontSize: '1rem', color: '#1b1b1a', whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(255,255,255,0.9)',
        }}>
          {STEPS[stepIdx].label}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        width: 230, height: 2, borderRadius: 2, background: '#e0ddd7', overflow: 'hidden', zIndex: 20,
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