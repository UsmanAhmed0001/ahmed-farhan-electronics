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
const iW = 1.05 * 79.2;  // indoor half-width SVG px
const iH = 0.26 * 107.2; // indoor half-height SVG px
const oW = 0.56 * 79.2;  // outdoor half-width SVG px
const oH = 0.57 * 107.2; // outdoor half-height SVG px

function Sketch({ drawProgress }) {
  const pct  = Math.min(1, drawProgress / 0.12);
  const fade = Math.max(0, 1 - (drawProgress - 0.10) / 0.08);
  if (fade <= 0) return null;
  const d   = (a,b) => Math.min(1,Math.max(0,(pct-a)/(b-a)));
  const off = (a,b) => (1-d(a,b)).toFixed(3);

  // Be Cool teal palette for the sketch
  const TEAL  = '#2B2F86';
  const LTEAL = '#546AB5';
  const ORANGE= '#8E2A33';
  const DARK  = '#1a1f4a';

  return (
    <svg viewBox="0 0 500 380" style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:fade,pointerEvents:'none',zIndex:10 }}>
      <defs>
        <marker id="marr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,1 L6,3 L0,5 Z" fill={TEAL}/>
        </marker>
        <marker id="marr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,1 L6,3 L0,5 Z" fill={ORANGE}/>
        </marker>
      </defs>

      {/* ── BACKGROUND GRID (very subtle) */}
      {d(0,0.05)>0 && Array.from({length:10},(_,i)=>[
        <line key={'v'+i} x1={50+i*45} y1="20" x2={50+i*45} y2="365" stroke={TEAL} strokeWidth="0.3" opacity={d(0,0.05)*0.08}/>,
        <line key={'h'+i} x1="50" y1={30+i*35} x2="460" y2={30+i*35} stroke={TEAL} strokeWidth="0.3" opacity={d(0,0.05)*0.08}/>
      ])}

      {/* ── WALL DIVIDER */}
      <line x1="250" y1="15" x2="250" y2="368" stroke={TEAL} strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="8 5" pathLength="1" strokeDashoffset={off(0,0.05)}/>
      <text x="175" y="22" fontSize="8" fill={TEAL} opacity={d(0,0.06)*0.6} fontFamily="'Space Grotesk',sans-serif" fontWeight="600" letterSpacing="2">INDOOR</text>
      <text x="268" y="22" fontSize="8" fill={TEAL} opacity={d(0,0.06)*0.6} fontFamily="'Space Grotesk',sans-serif" fontWeight="600" letterSpacing="2">OUTDOOR</text>

      {/* ════════════════════════════════════════════════════════
          INDOOR UNIT — clean bold technical drawing
          ════════════════════════════════════════════════════════ */}

      {/* outer body — BOLD */}
      <rect x={IX-iW} y={IY-iH} width={iW*2} height={iH*2} rx="5"
        fill="none" stroke={DARK} strokeWidth="2.8"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.05,0.22)}/>

      {/* teal accent stripe (top third) */}
      <rect x={IX-iW+2} y={IY-iH+2} width={iW*2-4} height={iH*0.7} rx="4"
        fill={TEAL} fillOpacity={d(0.10,0.24)*0.12}
        stroke={TEAL} strokeWidth="0.8" strokeOpacity={d(0.10,0.24)*0.5}
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.10,0.24)}/>

      {/* intake grille — 16 clean slots */}
      {Array.from({length:16},(_,i)=>(
        <rect key={i} x={IX-iW+8+i*10.5} y={IY-iH+5} width="7" height="9" rx="1.5"
          fill={TEAL} fillOpacity={d(0.14,0.28)*0.15}
          stroke={TEAL} strokeWidth="0.8" strokeOpacity={d(0.14,0.28)*0.6}
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.14,0.28)}/>
      ))}

      {/* vent slats — 8 clean horizontal bars */}
      {Array.from({length:8},(_,i)=>(
        <rect key={i} x={IX-iW+6} y={IY-iH+18+i*6.5} width={iW*2-12} height="4" rx="1"
          fill={LTEAL} fillOpacity={d(0.18,0.34)*0.1}
          stroke={LTEAL} strokeWidth="1" strokeOpacity={d(0.18,0.34)*0.7}
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.18,0.34)}/>
      ))}

      {/* louvre — bold teal bar */}
      <rect x={IX-iW+4} y={IY+iH-12} width={iW*2-8} height="9" rx="2"
        fill={TEAL} fillOpacity={d(0.22,0.35)*0.2}
        stroke={TEAL} strokeWidth="1.4"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.22,0.35)}/>
      {/* louvre pivot dots */}
      {[-36,-18,0,18,36].map((dx,i)=>(
        <circle key={i} cx={IX+dx} cy={IY+iH-7.5} r="2"
          fill={TEAL} fillOpacity={d(0.24,0.36)*0.4}
          stroke={TEAL} strokeWidth="0.8" strokeOpacity={d(0.24,0.36)*0.6}
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.24,0.36)}/>
      ))}

      {/* control panel */}
      <rect x={IX+iW-44} y={IY-iH+2} width="40" height="18" rx="3"
        fill={TEAL} fillOpacity={d(0.20,0.32)*0.15}
        stroke={TEAL} strokeWidth="1.2"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.20,0.32)}/>
      {/* LCD screen */}
      <rect x={IX+iW-40} y={IY-iH+4} width="20" height="10" rx="1.5"
        fill={DARK} fillOpacity={d(0.22,0.34)*0.7}
        stroke={LTEAL} strokeWidth="0.8"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.22,0.34)}/>
      {/* temp readout lines */}
      {[0,1].map(i=>(
        <line key={i} x1={IX+iW-38} y1={IY-iH+7+i*4} x2={IX+iW-22} y2={IY-iH+7+i*4}
          stroke={LTEAL} strokeWidth="1.2" strokeOpacity={d(0.26,0.38)*0.8}
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.26,0.38)}/>
      ))}
      {/* LED dots */}
      {[0,1,2].map(i=>(
        <circle key={i} cx={IX+iW-17+i*6} cy={IY-iH+9} r="2.2"
          fill={i===0?TEAL:i===1?ORANGE:LTEAL}
          fillOpacity={d(0.28,0.40)*0.8}
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.28,0.40)}/>
      ))}

      {/* mounting rail */}
      <rect x={IX-iW+1} y={IY-iH-8} width={iW*2-2} height="7" rx="2"
        fill="none" stroke={DARK} strokeWidth="1.8"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.10,0.22)}/>
      {[-36,-12,12,36].map((dx,i)=>(
        <circle key={i} cx={IX+dx} cy={IY-iH-4.5} r="2.2"
          fill="none" stroke={DARK} strokeWidth="1"
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.12,0.24)}/>
      ))}

      {/* end caps */}
      {[-1,1].map(s=>(
        <path key={s} d={`M${IX+s*iW},${IY-iH+4} Q${IX+s*(iW+5)},${IY} ${IX+s*iW},${IY+iH-4}`}
          fill="none" stroke={DARK} strokeWidth="1.8"
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.14,0.26)}/>
      ))}

      {/* ════════════════════════════════════════════════════════
          PIPES
          ════════════════════════════════════════════════════════ */}

      {/* foam sleeve */}
      <rect x={PX-8} y={IY+iH} width="18" height={OY-oH-(IY+iH)} rx="5"
        fill={DARK} fillOpacity={d(0.34,0.52)*0.12}
        stroke={DARK} strokeWidth="1.2" strokeOpacity={d(0.34,0.52)*0.5}
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.34,0.52)}/>
      {/* copper liquid line */}
      <line x1={PX-2} y1={IY+iH} x2={PX-2} y2={OY-oH}
        stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.36,0.54)}/>
      {/* copper suction line */}
      <line x1={PX+4} y1={IY+iH} x2={PX+4} y2={OY-oH}
        stroke={ORANGE} strokeWidth="4" strokeLinecap="round"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.36,0.54)}/>
      {/* wall gland */}
      <rect x={PX-12} y={w2s(-0.42,-0.04)[1]-9} width="28" height="18" rx="3"
        fill={TEAL} fillOpacity={d(0.42,0.55)*0.15}
        stroke={TEAL} strokeWidth="1.2"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.42,0.55)}/>
      {/* 3 pipe clips */}
      {[0.45,0.1,-0.3].map((wy,i)=>{
        const [,cy]=w2s(-0.42,wy);
        return <rect key={i} x={PX-10} y={cy-5} width="22" height="10" rx="2.5"
          fill="none" stroke={DARK} strokeWidth="1.2"
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.40+i*0.03,0.55+i*0.02)}/>;
      })}

      {/* ════════════════════════════════════════════════════════
          OUTDOOR UNIT — bold technical elevation
          ════════════════════════════════════════════════════════ */}

      {/* housing — bold dark outline */}
      <rect x={OX-oW} y={OY-oH} width={oW*2} height={oH*2} rx="4"
        fill={DARK} fillOpacity={d(0.52,0.68)*0.06}
        stroke={DARK} strokeWidth="2.8"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.52,0.68)}/>

      {/* teal top panel */}
      <rect x={OX-oW+2} y={OY-oH} width={oW*2-4} height="10" rx="3"
        fill={TEAL} fillOpacity={d(0.54,0.68)*0.25}
        stroke={TEAL} strokeWidth="0.9"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.54,0.68)}/>

      {/* grille recess frame */}
      <rect x={OX-oW+6} y={OY-oH+12} width={oW*2-12} height={oH*2-32} rx="3"
        fill={DARK} fillOpacity={d(0.56,0.70)*0.35}
        stroke={DARK} strokeWidth="1.5"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.56,0.70)}/>

      {/* 20 horizontal grille bars */}
      {Array.from({length:20},(_,i)=>(
        <line key={i} x1={OX-oW+9} y1={OY-oH+16+i*4.8} x2={OX+oW-9} y2={OY-oH+16+i*4.8}
          stroke={TEAL} strokeWidth="0.7" strokeOpacity={d(0.58,0.72)*0.5}
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.58,0.72)}/>
      ))}

      {/* FAN RING — double teal ring */}
      <circle cx={OX} cy={OY-oH*0.32} r={oW*0.72}
        fill="none" stroke={TEAL} strokeWidth="2.2"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.62,0.76)}/>
      <circle cx={OX} cy={OY-oH*0.32} r={oW*0.72-5}
        fill="none" stroke={TEAL} strokeWidth="0.8" strokeOpacity="0.4"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.63,0.77)}/>

      {/* 5 fan blades — clean swept shapes */}
      {[0,72,144,216,288].map((ang,i)=>{
        const a=ang*Math.PI/180;
        const cx=OX, cy=OY-oH*0.32, r=oW*0.62;
        const bx=cx+Math.cos(a)*r, by=cy-Math.sin(a)*r;
        const mx=cx+Math.cos(a+0.32)*r*0.52, my=cy-Math.sin(a+0.32)*r*0.52;
        return <path key={i}
          d={`M${cx+Math.cos(a)*9},${cy-Math.sin(a)*9} Q${mx},${my} ${bx},${by}`}
          fill="none" stroke={LTEAL} strokeWidth="2.5" strokeLinecap="round"
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.65,0.80)}/>;
      })}

      {/* hub */}
      <circle cx={OX} cy={OY-oH*0.32} r="8"
        fill={DARK} fillOpacity={d(0.68,0.82)*0.5}
        stroke={TEAL} strokeWidth="2"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.68,0.82)}/>
      <circle cx={OX} cy={OY-oH*0.32} r="3.5"
        fill={TEAL} fillOpacity={d(0.69,0.83)*0.6}
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.69,0.83)}/>

      {/* compressor drum */}
      <ellipse cx={OX-oW*0.3} cy={OY+oH*0.38} rx="15" ry="23"
        fill={DARK} fillOpacity={d(0.66,0.80)*0.2}
        stroke={DARK} strokeWidth="1.5"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.66,0.80)}/>
      {/* compressor banding */}
      {[-8,0,9].map((dy,i)=>(
        <line key={i} x1={OX-oW*0.3-13} y1={OY+oH*0.38+dy} x2={OX-oW*0.3+13} y2={OY+oH*0.38+dy}
          stroke={TEAL} strokeWidth="1" strokeOpacity={d(0.70,0.84)*0.55}
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.70,0.84)}/>
      ))}

      {/* service panel bottom + screw */}
      <rect x={OX-oW+5} y={OY+oH-18} width={oW*2-10} height="14" rx="2"
        fill="none" stroke={DARK} strokeWidth="1.2"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.72,0.86)}/>
      <circle cx={OX+oW-13} cy={OY+oH-11} r="2.5"
        fill="none" stroke={ORANGE} strokeWidth="1"
        pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.73,0.87)}/>

      {/* rubber feet */}
      {[-oW*0.62, oW*0.62].map((dx,i)=>(
        <rect key={i} x={OX+dx-6} y={OY+oH-2} width="12" height="6" rx="2.5"
          fill={DARK} fillOpacity={d(0.74,0.88)*0.4}
          stroke={DARK} strokeWidth="1.2"
          pathLength="1" strokeDasharray="1" strokeDashoffset={off(0.74,0.88)}/>
      ))}

      {/* air discharge arrows */}
      {d(0.70,0.84)>0&&[-22,-7,7,22].map((dx,i)=>(
        <line key={i} x1={OX+dx} y1={OY-oH-2} x2={OX+dx} y2={OY-oH-14}
          stroke={TEAL} strokeWidth="1.4" strokeOpacity={d(0.70,0.84)*0.7}
          markerEnd="url(#marr)"/>
      ))}

      {/* ── CLEAN ANNOTATIONS ─────────────────────────────────── */}
      {d(0.76,0.90)>0&&<>
        <line x1={IX+iW+3} y1={IY} x2={IX+iW+28} y2={IY} stroke={TEAL} strokeWidth="1" opacity={d(0.76,0.90)*0.8} markerEnd="url(#marr)"/>
        <text x={IX+iW+31} y={IY+5} fontSize="9" fill={TEAL} fontFamily="'Space Grotesk',sans-serif" fontWeight="600" opacity={d(0.76,0.90)*0.8}>indoor unit</text>
        <line x1={PX+12} y1={w2s(-0.42,0.12)[1]} x2={PX+36} y2={w2s(-0.42,0.12)[1]} stroke={ORANGE} strokeWidth="1" opacity={d(0.78,0.90)*0.8} markerEnd="url(#marr2)"/>
        <text x={PX+39} y={w2s(-0.42,0.12)[1]+4} fontSize="8.5" fill={ORANGE} fontFamily="'Space Grotesk',sans-serif" fontWeight="600" opacity={d(0.78,0.90)*0.8}>R-410A</text>
        <line x1={OX+oW+3} y1={OY-oH*0.32} x2={OX+oW+24} y2={OY-oH*0.32} stroke={TEAL} strokeWidth="1" opacity={d(0.80,0.92)*0.8} markerEnd="url(#marr)"/>
        <text x={OX+oW+27} y={OY-oH*0.32+4} fontSize="9" fill={TEAL} fontFamily="'Space Grotesk',sans-serif" fontWeight="600" opacity={d(0.80,0.92)*0.8}>fan unit</text>
        <line x1={OX+oW+3} y1={OY+oH*0.38} x2={OX+oW+24} y2={OY+oH*0.38} stroke={TEAL} strokeWidth="1" opacity={d(0.82,0.92)*0.8} markerEnd="url(#marr)"/>
        <text x={OX+oW+27} y={OY+oH*0.38+4} fontSize="9" fill={TEAL} fontFamily="'Space Grotesk',sans-serif" fontWeight="600" opacity={d(0.82,0.92)*0.8}>compressor</text>
      </>}

      {/* ── DIMENSION LINE */}
      {d(0.86,1.0)>0&&<>
        <line x1={IX-iW-16} y1={IY} x2={IX-iW-16} y2={OY} stroke={TEAL} strokeWidth="0.8" strokeDasharray="4 3" opacity={d(0.86,1.0)*0.4}/>
        <line x1={IX-iW-19} y1={IY} x2={IX-iW-13} y2={IY} stroke={TEAL} strokeWidth="1.2" opacity={d(0.88,1.0)*0.5}/>
        <line x1={IX-iW-19} y1={OY} x2={IX-iW-13} y2={OY} stroke={TEAL} strokeWidth="1.2" opacity={d(0.88,1.0)*0.5}/>
        <text x={IX-iW-24} y={(IY+OY)/2+3} fontSize="7" fill={TEAL} fontFamily="'Space Grotesk',sans-serif"
          transform={`rotate(-90 ${IX-iW-24} ${(IY+OY)/2+3})`} opacity={d(0.90,1.0)*0.55}>min 3m</text>
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
    const wallM = new THREE.MeshStandardMaterial({ color: 0xe8ecf2, roughness: 0.88, metalness: 0 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), wallM);
    wall.position.set(0, 0.2, -0.55); wall.receiveShadow = true;
    scene.add(wall);

    // Shadow plane
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.12 }));
    sp.rotation.x = -Math.PI / 2; sp.position.y = -2.0; sp.receiveShadow = true;
    scene.add(sp);

    // ═══════════════════════════════════════════════════════════════════════════
    // SCENE GEOMETRY — detailed split-AC unit
    // ═══════════════════════════════════════════════════════════════════════════

    // Material factory
    const M = (color, rough=0.42, metal=0.06, op=1) => new THREE.MeshStandardMaterial({
      color, roughness:rough, metalness:metal,
      transparent:op<1, opacity:op, envMapIntensity:0.7
    });
    const MP = (color, rough=0.28, metal=0.06) => new THREE.MeshPhysicalMaterial({
      color, roughness:rough, metalness:metal,
      clearcoat:0.4, clearcoatRoughness:0.25, envMapIntensity:0.8
    });

    // helper: box mesh
    const bx = (w,h,d,mat,cx=true) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
      if(cx){ m.castShadow=true; m.receiveShadow=true; } return m;
    };
    // helper: cylinder mesh
    const cy = (rt,rb,h,mat,segs=16) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segs), mat);
      m.castShadow=true; return m;
    };
    // helper: tube between two world points
    const tb = (s,e,r,mat) => {
      const sv=new THREE.Vector3(...s), ev=new THREE.Vector3(...e);
      const d=new THREE.Vector3().subVectors(ev,sv);
      const m=cy(r,r,d.length(),mat,10);
      m.position.copy(sv.clone().add(ev).multiplyScalar(0.5));
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize().clone());
      return m;
    };

    // ── INDOOR UNIT ──────────────────────────────────────────────────────────
    const indoor = new THREE.Group();
    indoor.rotation.y = 0.16;
    scene.add(indoor);

    // colours
    const C_BODY  = MP(0xf0f4f8, 0.24, 0.04);   // light teal-white plastic
    const C_FACE  = MP(0xfaf9f6, 0.18, 0.04);
    const C_TEAL  = M(0x2B2F86, 0.35, 0.18);
    const C_LTEAL = M(0xe0ddd8, 0.40, 0.04);
    const C_DARK  = M(0x1a2e2e, 0.70, 0.20);
    const C_MID   = M(0xc8c6c2, 0.42, 0.04);

    // 1. Main body shell — slightly tapered using extrude
    const bodyShape = new THREE.Shape();
    const BW=1.06, BH=0.26, BR=0.06;
    bodyShape.moveTo(-BW+BR, -BH);
    bodyShape.lineTo( BW-BR, -BH);
    bodyShape.quadraticCurveTo(BW,-BH, BW,-BH+BR);
    bodyShape.lineTo(BW, BH-BR);
    bodyShape.quadraticCurveTo(BW, BH, BW-BR, BH);
    bodyShape.lineTo(-BW+BR, BH);
    bodyShape.quadraticCurveTo(-BW,BH,-BW,BH-BR);
    bodyShape.lineTo(-BW,-BH+BR);
    bodyShape.quadraticCurveTo(-BW,-BH,-BW+BR,-BH);
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth:0.24, bevelEnabled:false });
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, C_BODY);
    bodyMesh.castShadow=true; bodyMesh.receiveShadow=true;
    bodyMesh.rotation.y = Math.PI; // face forward
    indoor.add(bodyMesh);

    // 2. Front faceplate (slightly glossier, slightly recessed)
    const faceGeo = new THREE.ExtrudeGeometry((() => {
      const fs = new THREE.Shape();
      const fw=1.02, fh=0.22, fr=0.05;
      fs.moveTo(-fw+fr,-fh); fs.lineTo(fw-fr,-fh); fs.quadraticCurveTo(fw,-fh,fw,-fh+fr);
      fs.lineTo(fw,fh-fr); fs.quadraticCurveTo(fw,fh,fw-fr,fh); fs.lineTo(-fw+fr,fh);
      fs.quadraticCurveTo(-fw,fh,-fw,fh-fr); fs.lineTo(-fw,-fh+fr); fs.quadraticCurveTo(-fw,-fh,-fw+fr,-fh);
      return fs;
    })(), {depth:0.005, bevelEnabled:false});
    faceGeo.center();
    const faceMesh = new THREE.Mesh(faceGeo, C_FACE);
    faceMesh.rotation.y=Math.PI; faceMesh.position.z=0.123;
    indoor.add(faceMesh);

    // 3. Top intake grille — 20 perforated oval slots
    for(let i=0;i<20;i++){
      const slotGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.005, 8);
      const slot = new THREE.Mesh(slotGeo, C_DARK);
      slot.rotation.x=Math.PI/2; slot.rotation.z=Math.PI/2;
      slot.position.set(-0.95+i*0.097, 0.22, 0.124); indoor.add(slot);
    }
    // intake grille frame line
    const intakeBar = bx(2.0, 0.055, 0.01, C_MID);
    intakeBar.position.set(0, 0.21, 0.124); indoor.add(intakeBar);

    // 4. 10 angled output vent slats
    for(let i=0;i<10;i++){
      const slat = bx(1.88, 0.012, 0.075, C_LTEAL);
      slat.rotation.x = -0.35; // angled down
      slat.position.set(0, 0.01-i*0.038, 0.112); indoor.add(slat);
      // slat edge highlight
      const edge = bx(1.88, 0.003, 0.002, C_TEAL);
      edge.position.set(0, 0.014-i*0.038, 0.15); indoor.add(edge);
    }

    // 5. Bottom louvre flap — teal accent
    const louvreGeo = new THREE.ExtrudeGeometry((() => {
      const ls=new THREE.Shape();
      ls.moveTo(-0.95,-0.028); ls.lineTo(0.95,-0.028);
      ls.lineTo(0.95,0.028); ls.lineTo(-0.95,0.028); ls.closePath();
      return ls;
    })(),{depth:0.018,bevelEnabled:true,bevelSize:0.006,bevelThickness:0.004,bevelSegments:2});
    louvreGeo.center();
    const louvre = new THREE.Mesh(louvreGeo, C_TEAL);
    louvre.rotation.x=0.42; louvre.position.set(0,-0.21,0.128);
    louvre.castShadow=true; indoor.add(louvre);
    // louvre pivot pin dots (5)
    for(let i=0;i<5;i++){
      const pin = cy(0.008,0.008,0.022,M(0x005050,0.5,0.4),8);
      pin.rotation.x=Math.PI/2; pin.position.set(-0.76+i*0.38,-0.21,0.128); indoor.add(pin);
    }

    // 6. Three vertical air deflectors
    for(let i=0;i<3;i++){
      const def = bx(0.008, 0.30, 0.078, C_MID);
      def.position.set(-0.56+i*0.56, -0.055, 0.105); indoor.add(def);
    }

    // 7. End caps — bevelled side profile
    for(const sx of [-1,1]){
      const capShape=new THREE.Shape();
      const cw=0.055, ch=0.26;
      capShape.moveTo(0,-ch); capShape.lineTo(cw,-ch); capShape.lineTo(cw,ch); capShape.lineTo(0,ch); capShape.closePath();
      const capGeo=new THREE.ExtrudeGeometry(capShape,{depth:0.24,bevelEnabled:false});
      capGeo.center();
      const cap=new THREE.Mesh(capGeo, M(0xbcd6d6,0.4,0.06));
      cap.rotation.y=Math.PI; cap.position.x=sx*1.087; cap.castShadow=true; indoor.add(cap);
    }

    // 8. Mounting rail
    const rail = bx(2.02, 0.048, 0.065, M(0xaaaaaa,0.55,0.35));
    rail.position.set(0, 0.295, -0.068); indoor.add(rail);
    // 4 mounting screw heads
    for(const rx of [-0.82,-0.27,0.27,0.82]){
      const screw=cy(0.012,0.010,0.018,M(0x777777,0.4,0.6),6);
      screw.rotation.z=Math.PI/2; screw.position.set(rx,0.295,-0.035); indoor.add(screw);
      // screw slot
      const slot=bx(0.018,0.003,0.005,M(0x444444,0.5,0.3));
      slot.rotation.z=Math.PI/2; slot.position.set(rx,0.295,-0.027); indoor.add(slot);
    }

    // 9. Control panel strip (right side)
    const panelBg=bx(0.48,0.082,0.008,MP(0xeaf7f7,0.25,0.04));
    panelBg.position.set(0.75,0.165,0.124); indoor.add(panelBg);
    // panel border trim
    const panelTrim=bx(0.50,0.092,0.004,C_TEAL);
    panelTrim.position.set(0.75,0.165,0.121); indoor.add(panelTrim);

    // 10. LCD display
    const scrMat=new THREE.MeshStandardMaterial({color:0x041828,roughness:0.08,metalness:0.3,emissive:0x000000,emissiveIntensity:0});
    const scrMesh=bx(0.20,0.056,0.003,scrMat); scrMesh.position.set(0.75,0.166,0.130); indoor.add(scrMesh);
    // display bezel
    const scrBezel=bx(0.218,0.068,0.002,C_DARK); scrBezel.position.set(0.75,0.166,0.128); indoor.add(scrBezel);
    // temp readout bar (glows teal when on)
    const readMat=new THREE.MeshStandardMaterial({color:0x146a8e,emissive:0x146a8e,emissiveIntensity:0,transparent:true,opacity:0});
    const readout=new THREE.Mesh(new THREE.PlaneGeometry(0.16,0.038),readMat);
    readout.position.set(0.75,0.167,0.133); indoor.add(readout);
    // two digit lines
    for(let i=0;i<2;i++){
      const dLine=new THREE.Mesh(new THREE.PlaneGeometry(0.05,0.026),new THREE.MeshStandardMaterial({color:0x1a7a9a,emissive:0x1a7a9a,emissiveIntensity:0,transparent:true,opacity:0}));
      dLine.position.set(0.68+i*0.08,0.167,0.134); indoor.add(dLine);
    }

    // 11. Status LED indicators (3)
    const ledDefs=[{x:0.57,c:0x2B2F86},{x:0.602,c:0x8E2A33},{x:0.634,c:0x4466aa}];
    const leds=ledDefs.map(({x,c})=>{
      const lm=new THREE.MeshStandardMaterial({color:0x222222,emissive:0x000000,emissiveIntensity:0,roughness:0.2});
      const l=new THREE.Mesh(new THREE.SphereGeometry(0.009,8,8),lm);
      l.position.set(x,0.166,0.135); indoor.add(l);
      return {mesh:l,mat:lm,color:c};
    });

    // 12. 3 function buttons
    for(let i=0;i<3;i++){
      const btn=bx(0.032,0.028,0.006,M(0x005060,0.35,0.15));
      btn.position.set(0.57+i*0.04,0.147,0.130); indoor.add(btn);
    }

    // 13. Brand logo indent
    const logoBg=bx(0.30,0.008,0.004,C_TEAL); logoBg.position.set(-0.75,-0.225,0.126); indoor.add(logoBg);
    const logoText=bx(0.22,0.005,0.003,M(0x005555,0.3,0.3)); logoText.position.set(-0.75,-0.225,0.129); indoor.add(logoText);

    // 14. Drainage outlet (bottom back)
    const drain=cy(0.022,0.018,0.055,M(0x888888,0.6,0.2),8); drain.rotation.x=Math.PI/2;
    drain.position.set(-0.2,-0.275,-0.05); indoor.add(drain);

    // 15. Filter access ridge (subtle bump across top of face)
    const ridge=bx(2.0,0.008,0.016,C_MID); ridge.position.set(0,0.185,0.118); indoor.add(ridge);

    // ── COPPER PIPES ──────────────────────────────────────────────────────────
    const pipesGrp=new THREE.Group(); scene.add(pipesGrp);

    // foam insulation sleeve (rough black rubber-foam look)
    const insMat=M(0x111111,0.96,0); insMat.roughness=0.98;
    const ins=tb([-0.40,0.73,0.07],[-0.40,-0.80,0.07],0.048,insMat);
    pipesGrp.add(ins);
    // inner insulation texture rings (8 bands)
    for(let i=0;i<8;i++){
      const band=cy(0.052,0.052,0.010,M(0x1a1a1a,0.95,0),8);
      band.rotation.x=Math.PI/2; band.position.set(-0.40,0.60-i*0.18,0.07); pipesGrp.add(band);
    }

    // liquid refrigerant line (thin copper) — full vertical run
    const copMat=M(0xd4874a,0.12,0.95);
    const pl=tb([-0.40,0.73,0.07],[-0.40,-0.80,0.07],0.022,copMat); pipesGrp.add(pl);
    // suction line (thick copper) — full vertical run
    const ps=tb([-0.35,0.73,0.07],[-0.35,-0.80,0.07],0.032,copMat.clone()); pipesGrp.add(ps);

    // Horizontal bridge: pipes run from vertical drop to outdoor unit
    const hBridgeIns=tb([-0.40,-0.80,0.07],[0.68,-0.80,0.07],0.038,insMat.clone()); pipesGrp.add(hBridgeIns);
    const hPl=tb([-0.40,-0.80,0.07],[0.68,-0.80,0.07],0.018,copMat.clone()); pipesGrp.add(hPl);
    const hPs=tb([-0.35,-0.80,0.07],[0.68,-0.80,0.07],0.026,copMat.clone()); pipesGrp.add(hPs);

    // wall gland plate
    const glandM=M(0xcccac6,0.55,0.12);
    const gland=bx(0.18,0.18,0.038,glandM); gland.position.set(-0.40,-0.02,-0.15); pipesGrp.add(gland);
    // gland screws
    for(const gx of [-0.06,0.06]){
      const gs=cy(0.009,0.009,0.006,M(0x777777,0.4,0.6),6); gs.rotation.x=Math.PI/2;
      gs.position.set(-0.40+gx,-0.02,-0.13); pipesGrp.add(gs);
    }
    // 3 pipe clamp clips with screw detail
    for(const wy of [0.45,0.1,-0.28]){
      const clamp=bx(0.09,0.058,0.092,M(0x999999,0.5,0.35));
      clamp.position.set(-0.40,wy,0.02); pipesGrp.add(clamp);
      const cscrew=cy(0.007,0.007,0.012,M(0x666666,0.4,0.5),6); cscrew.rotation.x=Math.PI/2;
      cscrew.position.set(-0.40,wy+0.022,0.072); pipesGrp.add(cscrew);
    }

    // ── OUTDOOR UNIT ──────────────────────────────────────────────────────────
    const outdoor=new THREE.Group();
    outdoor.position.set(1.24,-1.0,0); outdoor.rotation.y=-0.18;
    scene.add(outdoor);

    const C_CASE=M(0x1e2e3e,0.55,0.18);
    const C_DARK2=M(0x0a1a1a,0.80,0.1);
    const C_CHROME=M(0x888888,0.3,0.65);

    // 1. Main casing — extruded rounded rectangle
    const caseShape=new THREE.Shape();
    const CW=0.56,CH=0.57,CR=0.04;
    caseShape.moveTo(-CW+CR,-CH); caseShape.lineTo(CW-CR,-CH);
    caseShape.quadraticCurveTo(CW,-CH,CW,-CH+CR); caseShape.lineTo(CW,CH-CR);
    caseShape.quadraticCurveTo(CW,CH,CW-CR,CH); caseShape.lineTo(-CW+CR,CH);
    caseShape.quadraticCurveTo(-CW,CH,-CW,CH-CR); caseShape.lineTo(-CW,-CH+CR);
    caseShape.quadraticCurveTo(-CW,-CH,-CW+CR,-CH);
    const caseGeo=new THREE.ExtrudeGeometry(caseShape,{depth:0.82,bevelEnabled:false});
    caseGeo.center();
    const caseMesh=new THREE.Mesh(caseGeo,C_CASE);
    caseMesh.rotation.y=Math.PI; caseMesh.castShadow=true; caseMesh.receiveShadow=true;
    outdoor.add(caseMesh);

    // 2. Top panel with louvre vents
    const topPan=bx(1.10,0.042,0.80,M(0x1a2e2e,0.5,0.2));
    topPan.position.y=0.595; outdoor.add(topPan);
    for(let i=0;i<10;i++){
      const vs=bx(0.008,0.038,0.60,C_DARK2); vs.position.set(-0.44+i*0.09,0.596,-0.0); outdoor.add(vs);
    }

    // 3. Front panel recess
    const frontRecess=bx(0.90,0.90,0.022,M(0x1e3030,0.52,0.1));
    frontRecess.position.set(0,0.08,0.43); outdoor.add(frontRecess);

    // 4. Grille frame (inset dark border)
    const gf=bx(0.84,0.84,0.032,C_DARK2); gf.position.set(0,0.10,0.445); outdoor.add(gf);

    // 5. 26 horizontal grille bars
    for(let i=0;i<26;i++){
      const gb=bx(0.78,0.009,0.008,M(0x0d1c1c,0.85,0.1));
      gb.position.set(0, 0.49-i*0.032, 0.457); outdoor.add(gb);
    }
    // 4 vertical dividers
    for(let i=0;i<4;i++){
      const gv=bx(0.007,0.80,0.006,M(0x0d1c1c,0.85,0.1));
      gv.position.set(-0.3+i*0.2,0.10,0.458); outdoor.add(gv);
    }

    // 6. Fan ring (TorusGeometry — double ring)
    const fanRing1=new THREE.Mesh(new THREE.TorusGeometry(0.33,0.020,10,52),C_CHROME);
    fanRing1.position.set(0,0.10,0.462); outdoor.add(fanRing1);
    const fanRing2=new THREE.Mesh(new THREE.TorusGeometry(0.31,0.010,8,48),M(0x2B2F86,0.3,0.5));
    fanRing2.position.set(0,0.10,0.464); outdoor.add(fanRing2);

    // 7. Fan assembly
    const fanGroup=new THREE.Group(); fanGroup.position.set(0,0.10,0.465); outdoor.add(fanGroup);
    // Hub cone
    const hubCone=new THREE.Mesh(new THREE.ConeGeometry(0.065,0.09,16),M(0x080f0f,0.5,0.4));
    hubCone.rotation.x=Math.PI/2; hubCone.position.z=0.048; fanGroup.add(hubCone);
    const hubCap=cy(0.058,0.058,0.032,M(0x0c0c0c,0.4,0.5),16);
    hubCap.rotation.x=Math.PI/2; hubCap.position.z=0.016; fanGroup.add(hubCap);
    // 5 swept fan blades using custom curve geometry
    for(let i=0;i<5;i++){
      const ang=(i*72*Math.PI)/180;
      const blGrp=new THREE.Group(); blGrp.rotation.z=ang;
      // Blade shape using a series of cross-sections (swept profile)
      const pts=[];
      for(let r=0.07;r<=0.30;r+=0.02){
        const t=(r-0.07)/0.23;
        const twist=0.6*t; // 0→34 deg twist
        const chord=0.095-0.035*t; // taper
        pts.push(new THREE.Vector3(r,chord*Math.sin(ang+twist),chord*Math.cos(ang+twist)*0.18));
      }
      // Approximate as a tapered swept box with rotation
      const bladeMat=M(0x2B2F86,0.30,0.22);
      const bladeGeo=new THREE.BoxGeometry(0.25,0.07,0.020);
      const blade=new THREE.Mesh(bladeGeo,bladeMat);
      blade.position.set(0.18,0,0.006); blade.rotation.z=0.26; blade.rotation.y=-0.18;
      blade.castShadow=true; blGrp.add(blade);
      // Blade root fillet
      const root=cy(0.032,0.028,0.022,C_CHROME,8); root.rotation.x=Math.PI/2;
      root.position.set(0.06,0,0); blGrp.add(root);
      fanGroup.add(blGrp);
    }

    // 8. Compressor housing (cylindrical)
    const compCyl=cy(0.24,0.26,0.58,M(0x1a2e2e,0.55,0.12),24);
    compCyl.position.set(-0.14,-0.30,-0.12); compCyl.castShadow=true; outdoor.add(compCyl);
    const compDome=new THREE.Mesh(new THREE.SphereGeometry(0.24,20,12,0,Math.PI*2,0,Math.PI/2),M(0x1a2e2e,0.5,0.12));
    compDome.position.set(-0.14,-0.02,-0.12); outdoor.add(compDome);
    // 4 compressor banding rings
    for(let i=0;i<4;i++){
      const band=new THREE.Mesh(new THREE.TorusGeometry(0.245,0.008,6,24),M(0x888888,0.4,0.35));
      band.rotation.x=Math.PI/2; band.position.set(-0.14,-0.28+i*0.14,-0.12); outdoor.add(band);
    }
    // compressor mounting bolts (3)
    for(let a=0;a<3;a++){
      const bAng=(a*120*Math.PI)/180;
      const bolt=cy(0.014,0.012,0.04,M(0x666666,0.4,0.5),6);
      bolt.position.set(-0.14+Math.cos(bAng)*0.22,-0.57,-0.12+Math.sin(bAng)*0.22); outdoor.add(bolt);
    }

    // 9. Service valve assembly (right side, behind)
    for(let i=0;i<2;i++){
      const vBody=cy(0.042,0.042,0.11,M(0x888888,0.4,0.5),10);
      vBody.rotation.z=Math.PI/2; vBody.position.set(-0.56,0.28-i*0.18,-0.30); outdoor.add(vBody);
      // valve cap
      const vCap=cy(0.048,0.048,0.022,M(0x2B2F86,0.35,0.18),8); vCap.rotation.z=Math.PI/2;
      vCap.position.set(-0.62,0.28-i*0.18,-0.30); outdoor.add(vCap);
      // hex nut
      const vNut=cy(0.038,0.038,0.016,M(0x555555,0.5,0.6),6); vNut.rotation.z=Math.PI/2;
      vNut.position.set(-0.56,0.28-i*0.18,-0.30); outdoor.add(vNut);
    }

    // 10. Electrical junction box (right top)
    const jBox=bx(0.15,0.12,0.08,M(0x111111,0.7,0.1)); jBox.position.set(0.45,0.38,-0.10); outdoor.add(jBox);
    const jLid=bx(0.16,0.13,0.01,M(0x1a1a1a,0.7,0.1)); jLid.position.set(0.45,0.38,-0.06); outdoor.add(jLid);
    // 2 conduit holes
    for(const jy of [0.04,-0.04]){
      const conduit=cy(0.014,0.014,0.05,C_DARK2,8); conduit.rotation.z=Math.PI/2;
      conduit.position.set(0.54,0.38+jy,-0.10); outdoor.add(conduit);
    }

    // 11. Side ventilation slats (right panel — 8 slats)
    for(let i=0;i<8;i++){
      const sl=bx(0.012,0.16,0.058,C_DARK2); sl.position.set(0.564,0.22+i*0.075,0.02); outdoor.add(sl);
    }

    // 12. Bottom service panel
    const svcPan=bx(0.92,0.20,0.038,M(0x1e2e2e,0.55,0.1)); svcPan.position.set(0,-0.41,0.445); outdoor.add(svcPan);
    // 2 panel screws
    for(const sx of [-0.38,0.38]){
      const pscrew=cy(0.010,0.010,0.008,M(0x888888,0.4,0.5),6); pscrew.rotation.x=Math.PI/2;
      pscrew.position.set(sx,-0.41,0.465); outdoor.add(pscrew);
      const pslot=bx(0.014,0.003,0.004,M(0x333333,0.5,0.3)); pslot.position.set(sx,-0.41,0.468); outdoor.add(pslot);
    }

    // 13. Nameplate + energy label
    const plate=bx(0.26,0.055,0.004,M(0xeae8e4,0.28,0.06)); plate.position.set(-0.18,-0.04,0.464); outdoor.add(plate);
    for(let i=0;i<2;i++){
      const pLine=bx(0.18,0.007,0.002,C_TEAL); pLine.position.set(-0.18,-0.04+i*0.018-0.009,0.467); outdoor.add(pLine);
    }
    const eLabel=bx(0.085,0.12,0.003,M(0x00aa55,0.3,0.1)); eLabel.position.set(0.38,-0.42,0.448); outdoor.add(eLabel);

    // 14. 4 rubber isolation feet
    for(const [fx,fz] of [[-0.40,-0.32],[0.40,-0.32],[-0.40,0.22],[0.40,0.22]]){
      const foot=cy(0.062,0.070,0.068,M(0x1a1a1a,0.97,0),10);
      foot.position.set(fx,-0.622,fz); outdoor.add(foot);
      // foot ridge
      const ridge2=cy(0.075,0.075,0.012,M(0x333333,0.9,0),10);
      ridge2.position.set(fx,-0.589,fz); outdoor.add(ridge2);
    }

    // 15. Base frame rails
    for(const fz of [-0.38,0.28]){
      const rail2=bx(1.06,0.028,0.06,M(0x888888,0.6,0.35)); rail2.position.set(0,-0.60,fz); outdoor.add(rail2);
    }

    // 16. Air discharge arrows above (4 small indicator arrows on top panel)
    for(const ax of [-0.3,-0.1,0.1,0.3]){
      const arr=bx(0.025,0.055,0.018,M(0x8E2A33,0.4,0.15)); arr.position.set(ax,0.625,-0.06); outdoor.add(arr);
      const arrTip=new THREE.Mesh(new THREE.ConeGeometry(0.022,0.030,4),M(0x8E2A33,0.4,0.15));
      arrTip.position.set(ax,0.662,-0.06); outdoor.add(arrTip);
    }

    // ── MIST PARTICLES ────────────────────────────────────────────────────────
    const mistN=72;
    const mistD=Array.from({length:mistN},()=>({
      x:(Math.random()-0.5)*1.8-1.05, by:-0.22+Math.random()*0.12,
      z:0.18+Math.random()*0.2, spd:0.2+Math.random()*0.18,
      sz:0.028+Math.random()*0.038, ph:Math.random()*Math.PI*2,
      drift:(Math.random()-0.5)*0.02,
    }));
    const mistM=mistD.map(pt=>{
      const m=new THREE.Mesh(new THREE.SphereGeometry(pt.sz,6,6),M(0x8CB0CE,0.8,0,0));
      m.material.depthWrite=false; m.position.set(pt.x,pt.by,pt.z); scene.add(m); return m;
    });

    // ── CAMERA KEYFRAMES ──────────────────────────────────────────────────────
    const camKeys=[
      {pos:[0,0.3,5.8], look:[0,0,0]},
      {pos:[-0.9,1.1,3.2], look:[-1.05,0.9,0]},
      {pos:[-0.5,0.1,4.2], look:[-0.4,0.0,0]},
      {pos:[0.8,-0.5,4.0], look:[1.2,-0.9,0]},
      {pos:[0,0.5,4.5],   look:[0,0.0,0]},
      {pos:[-0.9,0.1,3.2],look:[-1.05,-0.1,0]},
    ];
    const keyTimes=[0,0.15,0.30,0.52,0.72,0.82];
    function getCamForProgress(p){
      for(let i=keyTimes.length-1;i>=0;i--){
        if(p>=keyTimes[i]){
          const next=Math.min(i+1,keyTimes.length-1);
          if(next===i) return camKeys[i];
          const t=seg(p,keyTimes[i],keyTimes[next]);
          const ease=t<0.5?2*t*t:1-2*(1-t)*(1-t);
          const a=camKeys[i],b=camKeys[next];
          return{pos:a.pos.map((v,j)=>lerp(v,b.pos[j],ease)),look:a.look.map((v,j)=>lerp(v,b.look[j],ease))};
        }
      }
      return camKeys[0];
    }

    // ── RENDER LOOP ───────────────────────────────────────────────────────────
    let t0=null,rafId;
    const loop=ts=>{
      rafId=requestAnimationFrame(loop);
      if(!t0)t0=ts;
      const t=(ts-t0)/1000;
      const p=progressRef.current;

      renderer.domElement.style.opacity=seg(p,0.10,0.18).toFixed(3);

      const ck=getCamForProgress(p);
      camera.position.set(...ck.pos); camera.lookAt(...ck.look);

      const indP=seg(p,0.15,0.30);
      const pipP=seg(p,0.30,0.50);
      const outP=seg(p,0.52,0.68);
      const pwrP=seg(p,0.72,0.82);
      const mstP=seg(p,0.82,1.0);

      indoor.position.set(-1.05,1.05+(1-indP)*0.7,0);
      setOp(indoor,indP);

      if(pwrP>0){
        leds.forEach(({mat:lm,color},i)=>{
          const on=pwrP>0.3+i*0.1;
          lm.color.set(on?color:0x222222); lm.emissive.set(on?color:0x000000);
          lm.emissiveIntensity=on?2.4:0;
        });
        readMat.opacity=Math.min(0.95,pwrP*1.6);
        readMat.emissiveIntensity=pwrP*1.6;
        readMat.color.set(pwrP>0.5?0x4488cc:0x2B2F86);
        readMat.emissive.set(pwrP>0.5?0x4488cc:0x2B2F86);
        scrMat.emissive.set(0x001428); scrMat.emissiveIntensity=pwrP*0.5;
      }

      setOp(pipesGrp,pipP);

      outdoor.position.set(1.24,-1.0+(1-outP)*-0.75,0);
      setOp(outdoor,outP);

      if(outP>0.4) fanGroup.rotation.z+=0.038+pwrP*0.055;

      mistD.forEach((d,i)=>{
        const m=mistM[i];
        const cycle=(t*d.spd+d.ph)%0.95;
        m.position.y=d.by-cycle*0.85;
        m.position.x=d.x+Math.sin(t*0.35+d.ph)*d.drift;
        m.material.opacity=mstP*0.80*Math.max(0,1-cycle/0.78);
      });

      renderer.render(scene,camera);
    };
    rafId=requestAnimationFrame(loop);

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