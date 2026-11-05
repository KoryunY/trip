import type { LngLat } from '../../shared/types';

const R = 6371_000;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function distance(a: LngLat, b: LngLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** initial bearing a->b in degrees (0 = north) */
export function bearing(a: LngLat, b: LngLat): number {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

export function lerp(a: LngLat, b: LngLat, t: number): LngLat {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Great-circle path with n segments (for flights) */
export function greatCircle(a: LngLat, b: LngLat, n = 64): LngLat[] {
  const φ1 = rad(a[1]);
  const λ1 = rad(a[0]);
  const φ2 = rad(b[1]);
  const λ2 = rad(b[0]);
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  if (d === 0) return [a, b];
  const out: LngLat[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    out.push([deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
  }
  return out;
}

/** Gentle curved path between two points (visual for ground travel without geometry) */
export function arcPath(a: LngLat, b: LngLat, n = 24, bend = 0.12): LngLat[] {
  const mid: LngLat = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const ctrl: LngLat = [mid[0] - dy * bend, mid[1] + dx * bend];
  const out: LngLat[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]]);
  }
  return out;
}

export function pathLength(path: LngLat[]): number {
  let s = 0;
  for (let i = 1; i < path.length; i++) s += distance(path[i - 1], path[i]);
  return s;
}

/** point at fraction t (0..1) of path length, plus heading */
export function along(path: LngLat[], t: number): { p: LngLat; heading: number } {
  if (path.length === 1) return { p: path[0], heading: 0 };
  const total = pathLength(path);
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < path.length; i++) {
    const seg = distance(path[i - 1], path[i]);
    if (target <= seg || i === path.length - 1) {
      const f = seg ? Math.min(1, target / seg) : 0;
      return { p: lerp(path[i - 1], path[i], f), heading: bearing(path[i - 1], path[i]) };
    }
    target -= seg;
  }
  return { p: path[path.length - 1], heading: 0 };
}

export function fmtDistance(m: number): string {
  if (m < 950) return `${Math.round(m / 10) * 10} m`;
  if (m < 20_000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m / 1000).toLocaleString('en')} km`;
}

/** walking minutes for straight-line distance (×1.3 detour, 4.8 km/h) */
export const walkMinutes = (m: number) => Math.max(1, Math.round((m * 1.3) / 80));

export function bboxOf(points: LngLat[]): [number, number, number, number] {
  let w = Infinity,
    s = Infinity,
    e = -Infinity,
    n = -Infinity;
  for (const [x, y] of points) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [w, s, e, n];
}

export function compassName(b: number): string {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(b / 45) % 8];
}
