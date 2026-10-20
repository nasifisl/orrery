import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Line,
  LineBasicMaterial,
  LineLoop,
  PerspectiveCamera,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Group,
  type Points,
  type ShaderMaterial,
} from "three";
import { BODY, BODIES, PLANETS, type BodyDef, type MoonDef } from "./data";
import { clock, gesture, useSim } from "./store";
import { orbitPoint, placeBody } from "./motion";
import { SIGNS } from "./chart";
import catalog from "./exoplanets.json";
import { buildTextures, disposeTextures, type TextureSet } from "./textures";

const SUN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SUN_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  void main() {
    float n = noise(vUv * 9.0 + vec2(uTime * 0.035, -uTime * 0.02));
    n += 0.5 * noise(vUv * 20.0 - uTime * 0.05);
    vec3 col = mix(vec3(0.72, 0.22, 0.04), vec3(1.0, 0.58, 0.16), clamp(n, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.96, 0.88), smoothstep(0.5, 0.92, n));
    gl_FragColor = vec4(col * 1.25, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ATM_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const ATM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float f = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.5);
    gl_FragColor = vec4(uColor, f * uStrength);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uCloud;
  uniform vec3 uSun;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 sun = normalize(uSun);
    float ndl = dot(n, sun);
    float day = smoothstep(-0.04, 0.22, ndl);
    vec2 cuv = vec2(fract(vUv.x + uTime * 0.006), vUv.y);
    vec4 dayTex = texture2D(uDay, vUv);
    vec4 nightTex = texture2D(uNight, vUv);
    vec4 cloudTex = texture2D(uCloud, cuv);
    vec3 col = mix(nightTex.rgb * 1.15, dayTex.rgb, day);
    float cloud = cloudTex.a;
    col = mix(col, vec3(0.9, 0.93, 0.96), cloud * mix(0.1, 0.72, day));
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float spec = pow(max(dot(reflect(-sun, n), viewDir), 0.0), 42.0);
    col += vec3(0.7, 0.84, 1.0) * spec * (1.0 - dayTex.a) * day * (1.0 - cloud);
    float warm = smoothstep(0.28, -0.02, ndl) * smoothstep(-0.18, 0.08, ndl);
    col = mix(col, col * vec3(1.2, 0.74, 0.46), warm * 0.65);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function systemRadius(aspect: number) {
  if (aspect < 0.72) return 132;
  if (aspect < 1.05) return 112;
  return 86;
}

function systemFov(aspect: number) {
  if (aspect < 0.72) return 66;
  if (aspect < 1.05) return 56;
  return 48;
}

function offsetFrom(radius: number, phi: number, theta: number, out: Vector3) {
  const sinPhi = Math.sin(phi);
  out.set(radius * sinPhi * Math.sin(theta), radius * Math.cos(phi), radius * sinPhi * Math.cos(theta));
  return out;
}

function readChrome() {
  const canvas = document.querySelector(".webgl") ?? document.querySelector(".stage");
  const box = canvas?.getBoundingClientRect();
  const top0 = box?.top ?? 0;
  const left0 = box?.left ?? 0;
  const h = box && box.height > 8 ? box.height : window.innerHeight || 1;
  const w = box && box.width > 8 ? box.width : window.innerWidth || 1;

  const overlap = (el: Element | null) => {
    const r = el?.getBoundingClientRect();
    if (!r || !box || r.width < 8 || r.height < 8) return null;
    const left = Math.max(r.left, box.left) - left0;
    const top = Math.max(r.top, box.top) - top0;
    const right = Math.min(r.right, box.right) - left0;
    const bottom = Math.min(r.bottom, box.bottom) - top0;
    if (right - left < 8 || bottom - top < 8) return null;
    return { left, top, right, bottom, width: right - left };
  };

  let y0 = 8;
  let y1 = h - 8;
  let x0 = 8;
  let x1 = w - 8;
  const topHit = overlap(document.querySelector(".top"));
  const dockHit = overlap(document.querySelector(".bottom"));
  const panelHit = overlap(document.querySelector(".panel"));
  if (topHit && topHit.top < h * 0.5) y0 = Math.max(y0, topHit.bottom + 8);
  if (dockHit && dockHit.top > h * 0.4) y1 = Math.min(y1, dockHit.top - 8);
  if (panelHit) {
    if (panelHit.left > w * 0.35 && panelHit.width < w * 0.72) x1 = Math.min(x1, panelHit.left - 16);
    else if (panelHit.top > h * 0.3) y1 = Math.min(y1, panelHit.top - 12);
  }
  if (y1 - y0 < 48) {
    y0 = 8;
    y1 = h - 8;
  }
  const cy = (y0 + y1) * 0.5;
  const cx = (x0 + x1) * 0.5;
  return {
    ndcX: (2 * cx) / w - 1,
    ndcY: 1 - (2 * cy) / h,
    band: (y1 - y0) / h,
    y0,
    y1,
    x0,
    x1,
  };
}

const frameScratch = {
  forward: new Vector3(),
  right: new Vector3(),
  up: new Vector3(),
  worldUp: new Vector3(0, 1, 0),
};

function aimAway(camPos: Vector3, look: Vector3, fov: number, aspect: number, ndcX: number, ndcY: number) {
  const forward = frameScratch.forward.subVectors(look, camPos);
  const dist = forward.length();
  if (dist < 1e-4) return;
  forward.multiplyScalar(1 / dist);
  const worldUp = frameScratch.worldUp;
  if (Math.abs(forward.y) > 0.96) worldUp.set(1, 0, 0);
  else worldUp.set(0, 1, 0);
  const right = frameScratch.right.crossVectors(forward, worldUp).normalize();
  const up = frameScratch.up.crossVectors(right, forward).normalize();
  const halfH = Math.tan((fov * Math.PI) / 360) * dist;
  const halfW = halfH * aspect;
  look.addScaledVector(up, -ndcY * halfH);
  look.addScaledVector(right, -ndcX * halfW);
}

function visualReach(body: BodyDef) {
  return Math.max(body.radius * 1.28, (body.rings?.outer ?? 0) * 1.08);
}

function fitDistance(reach: number, fov: number, band: number) {
  const allow = Math.max(0.16, band * 0.86) * fov * (Math.PI / 180);
  return reach / Math.tan(allow / 2);
}

function minRadius(id: BodyDef["id"], radius: number) {
  return id === "sun" ? 16 : Math.max(1.25, radius * 2.35);
}

const labelNodes: Partial<Record<BodyDef["id"], HTMLDivElement | null>> = {};

function LabelTracker() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const world = useMemo(() => new Vector3(), []);
  const ndc = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const show = useSim.getState().showLabels;
    const focus = useSim.getState().focusId;
    const chrome = readChrome();
    for (const body of BODIES) {
      const el = labelNodes[body.id];
      if (!el) continue;
      if (!show) {
        el.style.display = "none";
        continue;
      }
      placeBody(body, clock.time, world);
      world.y += body.radius + (body.id === "sun" ? 0.95 : 0.48);
      ndc.copy(world).project(camera);
      if (ndc.z > 1) {
        el.style.display = "none";
        continue;
      }
      const x = (ndc.x * 0.5 + 0.5) * size.width;
      const y = (-ndc.y * 0.5 + 0.5) * size.height;
      const covered = y < chrome.y0 || y > chrome.y1 || x < chrome.x0 - 8 || x > chrome.x1 + 8;
      if (covered) {
        el.style.display = "none";
        continue;
      }
      el.style.display = "inline-flex";
      el.style.transform = `translate(-50%, -120%) translate(${x}px, ${y}px)`;
      el.className = focus === body.id ? "label is-on" : "label";
    }
  });

  return null;
}

function ClockDriver() {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const { paused, speed } = useSim.getState();
    if (!paused) clock.time += dt * speed;
  });
  return null;
}

function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const spherical = useRef({ radius: 168, phi: 1.15, theta: 0.62 });
  const seen = useRef(0);
  const blend = useRef(1);
  const goalRadius = useRef(86);
  const startRadius = useRef(86);
  const userZoom = useRef(false);
  const dragging = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const bag = useRef({
    desired: new Vector3(),
    endCam: new Vector3(),
    look: new Vector3(),
    aim: new Vector3(),
    offset: new Vector3(),
    startCam: new Vector3(),
    startLook: new Vector3(),
  });

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";

    const clampRadius = (r: number) => {
      const id = useSim.getState().focusId;
      const wide = useSim.getState().overview || id === "sun";
      const cap = useSim.getState().exoOpen && wide ? 320 : 210;
      return Math.min(cap, Math.max(minRadius(id, BODY[id].radius), r));
    };

    const down = (e: PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dragging.current = true;
      gesture.moved = false;
      last.current = { x: e.clientX, y: e.clientY };
      el.style.cursor = "grabbing";
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size >= 2) {
        const pts = [...pointers.current.values()];
        const d = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
        if (pinch.current != null && d > 0) {
          const next = clampRadius(spherical.current.radius * (pinch.current / d));
          spherical.current.radius = next;
          goalRadius.current = next;
          userZoom.current = true;
          blend.current = 1;
        }
        pinch.current = d;
        gesture.moved = true;
        return;
      }
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) gesture.moved = true;
      last.current = { x: e.clientX, y: e.clientY };
      spherical.current.theta -= dx * 0.005;
      spherical.current.phi = Math.min(Math.PI - 0.12, Math.max(0.12, spherical.current.phi - dy * 0.005));
      if (gesture.moved) blend.current = 1;
    };
    const up = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      if (pointers.current.size === 0) {
        dragging.current = false;
        el.style.cursor = "";
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = clampRadius(spherical.current.radius * Math.exp(e.deltaY * 0.0011));
      spherical.current.radius = next;
      goalRadius.current = next;
      userZoom.current = true;
      blend.current = 1;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const aspect = size.width / Math.max(1, size.height);
    const fov = systemFov(aspect);
    if (Math.abs(camera.fov - fov) > 0.4) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const { focusId, frame, overview, exoOpen } = useSim.getState();
    const body = BODY[focusId];
    const chrome = readChrome();
    const wide = overview || focusId === "sun";
    let fit = wide ? systemRadius(aspect) : Math.max(body.view, fitDistance(visualReach(body), fov, chrome.band));
    if (wide && useSim.getState().chart) fit *= 1.18;
    if (wide && exoOpen) fit = Math.max(fit, aspect < 0.85 ? 188 : 168);
    if (wide && chrome.band < 0.42) fit *= 0.42 / chrome.band;
    const cap = exoOpen && wide ? 320 : 210;
    fit = Math.min(cap, fit);
    if (frame !== seen.current) {
      seen.current = frame;
      goalRadius.current = fit;
      startRadius.current = spherical.current.radius;
      bag.current.startCam.copy(camera.position);
      bag.current.startLook.copy(bag.current.look);
      blend.current = 0;
      userZoom.current = false;
      if (overview) {
        spherical.current.theta = 0.62;
        spherical.current.phi = 1.15;
      }
    } else if (!userZoom.current && blend.current >= 1 && !dragging.current) {
      spherical.current.radius += (fit - spherical.current.radius) * Math.min(1, dt * 2.4);
    }

    placeBody(body, clock.time, bag.current.desired);

    const lookAtFramed = () => {
      bag.current.aim.copy(bag.current.look);
      aimAway(camera.position, bag.current.aim, camera.fov, aspect, chrome.ndcX, chrome.ndcY);
      camera.lookAt(bag.current.aim);
    };

    if (blend.current < 1 && !dragging.current) {
      blend.current = Math.min(1, blend.current + dt / 0.95);
      const e = 1 - (1 - blend.current) ** 3;
      const rad = startRadius.current + (goalRadius.current - startRadius.current) * e;
      spherical.current.radius = rad;
      offsetFrom(rad, spherical.current.phi, spherical.current.theta, bag.current.offset);
      bag.current.endCam.copy(bag.current.desired).add(bag.current.offset);
      bag.current.look.copy(bag.current.startLook).lerp(bag.current.desired, e);
      camera.position.copy(bag.current.startCam).lerp(bag.current.endCam, e);
      lookAtFramed();
      return;
    }

    blend.current = 1;
    bag.current.look.copy(bag.current.desired);
    const minR = minRadius(focusId, body.radius);
    const zoomCap = useSim.getState().exoOpen && wide ? 320 : 210;
    spherical.current.radius = Math.min(zoomCap, Math.max(minR, spherical.current.radius));
    offsetFrom(spherical.current.radius, spherical.current.phi, spherical.current.theta, bag.current.offset);
    camera.position.copy(bag.current.desired).add(bag.current.offset);
    lookAtFramed();
  });

  return null;
}

function Atmosphere({ radius, color, strength, scale = 1.08 }: { radius: number; color: string; strength: number; scale?: number }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uStrength: { value: strength },
    }),
    [color, strength],
  );
  return (
    <mesh scale={scale} raycast={() => null}>
      <sphereGeometry args={[radius, 48, 32]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={uniforms}
        vertexShader={ATM_VERT}
        fragmentShader={ATM_FRAG}
      />
    </mesh>
  );
}

function SunBody({ textures }: { textures: TextureSet }) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const gl = useThree((s) => s.gl);

  useFrame(() => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.time;
  });

  return (
    <group>
      <sprite scale={[12.5, 12.5, 1]} raycast={() => null} renderOrder={-1}>
        <spriteMaterial map={textures.sunGlow} transparent depthWrite={false} blending={AdditiveBlending} />
      </sprite>
      <mesh raycast={() => null}>
        <sphereGeometry args={[2.2, 64, 48]} />
        <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={SUN_VERT} fragmentShader={SUN_FRAG} />
      </mesh>
      <Atmosphere radius={2.2} color="#ffc98a" strength={1.05} scale={1.42} />
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (gesture.moved) return;
          useSim.getState().setFocus("sun");
        }}
        onPointerOver={() => {
          gl.domElement.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          gl.domElement.style.cursor = "";
        }}
      >
        <sphereGeometry args={[2.6, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Moon({ moon }: { moon: MoonDef }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const a = moon.phase + (clock.time / moon.period) * Math.PI * 2;
    g.position.set(Math.cos(a) * moon.distance, 0, Math.sin(a) * moon.distance);
  });
  return (
    <group ref={ref}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[moon.radius, 20, 16]} />
        <meshStandardMaterial color={moon.color} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}

function EarthMesh({ body, textures }: { body: BodyDef; textures: TextureSet }) {
  const mat = useRef<ShaderMaterial>(null);
  const toSun = useMemo(() => new Vector3(), []);
  const uniforms = useMemo(
    () => ({
      uDay: { value: textures.earthDay },
      uNight: { value: textures.earthNight },
      uCloud: { value: textures.earthCloud },
      uSun: { value: new Vector3(1, 0, 0) },
      uTime: { value: 0 },
    }),
    [textures],
  );
  useFrame(() => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = clock.time;
    placeBody(body, clock.time, toSun);
    toSun.multiplyScalar(-1);
    if (toSun.lengthSq() < 1e-6) toSun.set(1, 0, 0);
    else toSun.normalize();
    m.uniforms.uSun.value.copy(toSun);
  });
  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[body.radius, 64, 48]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={EARTH_VERT} fragmentShader={EARTH_FRAG} />
    </mesh>
  );
}

function PlanetBody({ body, textures }: { body: BodyDef; textures: TextureSet }) {
  const group = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const gl = useThree((s) => s.gl);
  const map =
    body.id === "mercury"
      ? textures.mercury
      : body.id === "venus"
        ? textures.venus
        : body.id === "mars" || body.id === "ceres" || body.id === "pluto" || body.id === "makemake"
          ? textures.mars
          : body.id === "jupiter"
            ? textures.jupiter
            : body.id === "saturn"
              ? textures.saturn
              : body.id === "uranus" || body.id === "haumea" || body.id === "eris"
                ? textures.uranus
                : textures.neptune;
  const tint =
    body.id === "ceres"
      ? "#c4b8a4"
      : body.id === "pluto"
        ? "#e7d7c8"
        : body.id === "haumea"
          ? "#f4f2ec"
          : body.id === "makemake"
            ? "#e0b49a"
            : body.id === "eris"
              ? "#f7f7f4"
              : "#ffffff";

  useFrame(() => {
    const g = group.current;
    const s = spin.current;
    if (!g || !s) return;
    placeBody(body, clock.time, g.position);
    s.rotation.y = clock.time * body.spin;
  });

  const hit = body.rings ? body.radius * body.rings.outer : Math.max(body.radius * 1.75, 0.72);
  const ringMap = body.rings?.texture === "uranus" ? textures.uranusRing : textures.saturnRing;

  return (
    <group ref={group}>
      <group rotation={[0, 0, body.tilt]}>
        <group ref={spin}>
          {body.id === "earth" ? (
            <EarthMesh body={body} textures={textures} />
          ) : (
            <mesh raycast={() => null}>
              <sphereGeometry args={[body.radius, 64, 48]} />
              <meshStandardMaterial map={map} color={tint} roughness={body.roughness} metalness={0.03} emissive="#10141a" emissiveIntensity={0.18} />
            </mesh>
          )}
        </group>
        <Atmosphere radius={body.radius} color={body.atmosphere} strength={body.atm} />
        {body.rings ? (
          <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
            <ringGeometry args={[body.radius * body.rings.inner, body.radius * body.rings.outer, 160, 8]} />
            <meshBasicMaterial
              map={ringMap}
              transparent
              opacity={body.rings.opacity}
              side={DoubleSide}
              depthWrite={false}
              toneMapped
            />
          </mesh>
        ) : null}
        {body.moons.map((moon) => (
          <Moon key={moon.name} moon={moon} />
        ))}
      </group>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (gesture.moved) return;
          useSim.getState().setFocus(body.id);
        }}
        onPointerOver={() => {
          gl.domElement.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          gl.domElement.style.cursor = "";
        }}
      >
        <sphereGeometry args={[hit, 18, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function OrbitLine({ body }: { body: BodyDef }) {
  const show = useSim((s) => s.showOrbits);
  const active = useSim((s) => s.focusId === body.id);
  const geo = useMemo(() => {
    const pts: Vector3[] = [];
    const tmp = new Vector3();
    const steps = 192;
    for (let i = 0; i < steps; i++) {
      orbitPoint(body, (i / steps) * Math.PI * 2, tmp);
      pts.push(tmp.clone());
    }
    return new BufferGeometry().setFromPoints(pts);
  }, [body]);
  const mat = useMemo(() => new LineBasicMaterial({ transparent: true, depthWrite: false }), []);
  const line = useMemo(() => {
    const l = new LineLoop(geo, mat);
    l.frustumCulled = false;
    l.raycast = () => {};
    return l;
  }, [geo, mat]);

  useEffect(() => {
    mat.color.set(active ? "#f4f1ea" : "#8b95a3");
    mat.opacity = active ? 0.92 : 0.3;
  }, [active, mat]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  line.visible = show;
  return <primitive object={line} />;
}

const TRAIL = 168;

function Trail({ body }: { body: BodyDef }) {
  const show = useSim((s) => s.showTrails);
  const hist = useRef(new Float32Array(TRAIL * 3));
  const cursor = useRef(0);
  const filled = useRef(0);
  const pos = useMemo(() => new Float32Array(TRAIL * 3), []);
  const col = useMemo(() => new Float32Array(TRAIL * 3), []);
  const tmp = useMemo(() => new Vector3(), []);
  const color = useMemo(() => new Color(body.trail), [body.trail]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [pos, col]);
  const mat = useMemo(
    () => new LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, opacity: 0.95 }),
    [],
  );
  const line = useMemo(() => {
    const l = new Line(geo, mat);
    l.frustumCulled = false;
    l.raycast = () => {};
    return l;
  }, [geo, mat]);

  useFrame(() => {
    line.visible = show;
    if (!show || useSim.getState().paused) return;
    placeBody(body, clock.time, tmp);
    const prev = (cursor.current + TRAIL - 1) % TRAIL;
    if (filled.current > 0) {
      const dx = tmp.x - hist.current[prev * 3]!;
      const dy = tmp.y - hist.current[prev * 3 + 1]!;
      const dz = tmp.z - hist.current[prev * 3 + 2]!;
      if (dx * dx + dy * dy + dz * dz > body.distance * body.distance * 0.12) {
        filled.current = 0;
        cursor.current = 0;
      }
    }
    const i = cursor.current;
    hist.current[i * 3] = tmp.x;
    hist.current[i * 3 + 1] = tmp.y;
    hist.current[i * 3 + 2] = tmp.z;
    cursor.current = (i + 1) % TRAIL;
    filled.current = Math.min(TRAIL, filled.current + 1);
    const n = filled.current;
    const start = n < TRAIL ? 0 : cursor.current;
    for (let k = 0; k < n; k++) {
      const src = (start + k) % TRAIL;
      pos[k * 3] = hist.current[src * 3]!;
      pos[k * 3 + 1] = hist.current[src * 3 + 1]!;
      pos[k * 3 + 2] = hist.current[src * 3 + 2]!;
      const fade = n <= 1 ? 1 : k / (n - 1);
      const f = fade * fade;
      col[k * 3] = color.r * f;
      col[k * 3 + 1] = color.g * f;
      col[k * 3 + 2] = color.b * f;
    }
    geo.setDrawRange(0, Math.max(0, n - 1));
    (geo.attributes.position as BufferAttribute).needsUpdate = true;
    (geo.attributes.color as BufferAttribute).needsUpdate = true;
  });

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  return <primitive object={line} />;
}

function Belt() {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const n = 1500;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 12.85 + Math.random() * 1.65;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.32;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(arr, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = clock.time * 0.018;
  });
  return (
    <points ref={ref} geometry={geo} raycast={() => null}>
      <pointsMaterial color="#b7b1a6" size={2.2} sizeAttenuation transparent opacity={0.72} depthWrite={false} />
    </points>
  );
}

function signTexture(label: string, hot: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new CanvasTexture(canvas);
  ctx.clearRect(0, 0, 128, 64);
  ctx.fillStyle = hot ? "#f4f1ea" : "#9a948a";
  ctx.font = "600 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 64, 34);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function Zodiac() {
  const group = useRef<Group>(null);
  const sunLon = useSim((s) => (s.chart ? s.chart.sun.lon : null));
  const active = sunLon == null ? -1 : Math.floor(sunLon / 30);
  const labels = useMemo(() => {
    return SIGNS.map((sign, index) => {
      const texture = signTexture(sign.short, index === active);
      const material = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
      const sprite = new Sprite(material);
      const angle = (index + 0.5) * (Math.PI / 6);
      sprite.position.set(Math.cos(angle) * 31.8, 0.4, Math.sin(angle) * 31.8);
      sprite.scale.set(5.2, 2.6, 1);
      sprite.renderOrder = 2;
      return sprite;
    });
  }, [active]);

  useEffect(
    () => () => {
      for (const sprite of labels) {
        const material = sprite.material as SpriteMaterial;
        material.map?.dispose();
        material.dispose();
      }
    },
    [labels],
  );

  const spoke = sunLon == null ? 0 : (sunLon * Math.PI) / 180;

  return (
    <group ref={group} visible={sunLon != null}>
      {SIGNS.map((sign, index) => (
        <mesh key={sign.id} rotation={[Math.PI / 2, 0, 0]} raycast={() => null} frustumCulled={false}>
          <ringGeometry args={[27.8, 29.8, 24, 1, index * (Math.PI / 6), Math.PI / 6 - 0.045]} />
          <meshBasicMaterial
            color={index === active ? "#f3ecdf" : "#8a847a"}
            transparent
            opacity={index === active ? 0.95 : 0.45}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      {sunLon != null ? (
        <mesh
          position={[Math.cos(spoke) * 16, 0.08, Math.sin(spoke) * 16]}
          rotation={[0, -spoke, 0]}
          raycast={() => null}
          frustumCulled={false}
        >
          <boxGeometry args={[32, 0.05, 0.12]} />
          <meshBasicMaterial color="#f3ecdf" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ) : null}
      {labels.map((sprite, index) => (
        <primitive key={SIGNS[index]!.id} object={sprite} />
      ))}
    </group>
  );
}

const EXO_COLOR: [number, number, number][] = [
  [0.55, 0.76, 1],
  [0.98, 0.84, 0.46],
  [0.98, 0.62, 0.4],
  [0.74, 0.56, 0.98],
  [1, 0.42, 0.36],
  [0.5, 0.9, 0.72],
  [0.86, 0.7, 0.5],
  [0.92, 0.92, 0.96],
  [0.55, 0.88, 0.95],
  [0.95, 0.7, 0.82],
  [0.72, 0.95, 0.5],
];

function ExoField() {
  const open = useSim((s) => s.exoOpen);
  const group = useRef<Group>(null);
  const geometry = useMemo(() => {
    const rows = catalog.rows as [string, string, number, number, number | null][];
    const position = new Float32Array(rows.length * 3);
    const color = new Float32Array(rows.length * 3);
    const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < rows.length; i += 1) {
      const ly = rows[i][4] ?? 1200;
      const spread = Math.log10(Math.max(8, ly));
      const radius = 42 + Math.min(30, (spread - 0.9) * 14);
      const angle = i * gold;
      const lift = ((i * 17) % 100) / 100 - 0.5;
      position[i * 3] = Math.cos(angle) * radius;
      position[i * 3 + 1] = lift * 10;
      position[i * 3 + 2] = Math.sin(angle) * radius;
      const rgb = EXO_COLOR[rows[i][3]] ?? EXO_COLOR[0];
      color[i * 3] = rgb[0];
      color[i * 3 + 1] = rgb[1];
      color[i * 3 + 2] = rgb[2];
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(position, 3));
    geo.setAttribute("color", new BufferAttribute(color, 3));
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const g = group.current;
    if (!g || !open) return;
    g.rotation.y = clock.time * 0.015;
  });

  return (
    <group ref={group} visible={open}>
      <points geometry={geometry} raycast={() => null} frustumCulled={false}>
        <pointsMaterial
          size={4.4}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          sizeAttenuation
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function SceneCanvas() {
  const textures = useMemo(() => buildTextures(), []);
  useEffect(() => () => disposeTextures(textures), [textures]);

  return (
    <>
      <Canvas
        className="webgl"
        camera={{ position: [82, 74, 128], fov: 48, near: 0.06, far: 900 }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#07080c");
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <color attach="background" args={["#07080c"]} />
        <ClockDriver />
        <Stars radius={240} depth={80} count={3800} factor={3.4} saturation={0} fade speed={0.25} />
        <hemisphereLight args={["#e4eef8", "#241c14", 0.42]} />
        <ambientLight intensity={0.16} color="#d5deea" />
        <pointLight position={[0, 0, 0]} intensity={9} decay={0} color="#fff3df" />
        <SunBody textures={textures} />
        <Belt />
        <Zodiac />
        <ExoField />
        {PLANETS.map((body) => (
          <PlanetBody key={body.id} body={body} textures={textures} />
        ))}
        {PLANETS.map((body) => (
          <OrbitLine key={`orbit-${body.id}`} body={body} />
        ))}
        {PLANETS.map((body) => (
          <Trail key={`trail-${body.id}`} body={body} />
        ))}
        <CameraRig />
        <LabelTracker />
      </Canvas>
      <div className="labels">
        {BODIES.map((body) => (
          <div
            key={body.id}
            className="label"
            ref={(node) => {
              labelNodes[body.id] = node;
            }}
          >
            {body.name}
          </div>
        ))}
      </div>
    </>
  );
}
