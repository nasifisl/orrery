import { Vector3 } from "three";
import type { BodyDef } from "./data";

export function placeBody(body: BodyDef, time: number, out: Vector3) {
  if (body.distance === 0) {
    out.set(0, 0, 0);
    return out;
  }
  const angle = body.phase + (time / body.orbitSeconds) * Math.PI * 2;
  const x = Math.cos(angle) * body.distance;
  const z0 = Math.sin(angle) * body.distance;
  out.set(x, z0 * Math.sin(body.inclination), z0 * Math.cos(body.inclination));
  return out;
}

export function orbitPoint(body: BodyDef, angle: number, out: Vector3) {
  const x = Math.cos(angle) * body.distance;
  const z0 = Math.sin(angle) * body.distance;
  out.set(x, z0 * Math.sin(body.inclination), z0 * Math.cos(body.inclination));
  return out;
}
