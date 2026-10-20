import type { BodyId } from "./data";

export type SignId =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type Sign = {
  id: SignId;
  name: string;
  short: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  mode: "Cardinal" | "Fixed" | "Mutable";
  ruler: string;
  span: string;
  blurb: string;
};

export const SIGNS: Sign[] = [
  {
    id: "aries",
    name: "Aries",
    short: "Ari",
    element: "Fire",
    mode: "Cardinal",
    ruler: "Mars",
    span: "Mar 21 – Apr 19",
    blurb: "The first sign of the tropical year. Tradition paints it as direct, restless, and quick to start.",
  },
  {
    id: "taurus",
    name: "Taurus",
    short: "Tau",
    element: "Earth",
    mode: "Fixed",
    ruler: "Venus",
    span: "Apr 20 – May 20",
    blurb: "A fixed earth sign. The old texts give it patience, appetite, and a dislike of being rushed.",
  },
  {
    id: "gemini",
    name: "Gemini",
    short: "Gem",
    element: "Air",
    mode: "Mutable",
    ruler: "Mercury",
    span: "May 21 – Jun 20",
    blurb: "Mutable air. Curiosity, doubles, and a habit of talking an idea all the way around.",
  },
  {
    id: "cancer",
    name: "Cancer",
    short: "Can",
    element: "Water",
    mode: "Cardinal",
    ruler: "Moon",
    span: "Jun 21 – Jul 22",
    blurb: "Cardinal water, ruled by the Moon. Home, memory, and a protective streak.",
  },
  {
    id: "leo",
    name: "Leo",
    short: "Leo",
    element: "Fire",
    mode: "Fixed",
    ruler: "Sun",
    span: "Jul 23 – Aug 22",
    blurb: "Fixed fire, ruled by the Sun. Warmth, pride, and a taste for being seen.",
  },
  {
    id: "virgo",
    name: "Virgo",
    short: "Vir",
    element: "Earth",
    mode: "Mutable",
    ruler: "Mercury",
    span: "Aug 23 – Sep 22",
    blurb: "Mutable earth. Craft, sorting, and a careful eye for what is unfinished.",
  },
  {
    id: "libra",
    name: "Libra",
    short: "Lib",
    element: "Air",
    mode: "Cardinal",
    ruler: "Venus",
    span: "Sep 23 – Oct 22",
    blurb: "Cardinal air. Pairs, balance, and a wish to settle the room before moving.",
  },
  {
    id: "scorpio",
    name: "Scorpio",
    short: "Sco",
    element: "Water",
    mode: "Fixed",
    ruler: "Mars",
    span: "Oct 23 – Nov 21",
    blurb: "Fixed water. The tradition gives it depth, secrecy, and a long memory.",
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    short: "Sag",
    element: "Fire",
    mode: "Mutable",
    ruler: "Jupiter",
    span: "Nov 22 – Dec 21",
    blurb: "Mutable fire. Distance, belief, and a hunger for the next horizon.",
  },
  {
    id: "capricorn",
    name: "Capricorn",
    short: "Cap",
    element: "Earth",
    mode: "Cardinal",
    ruler: "Saturn",
    span: "Dec 22 – Jan 19",
    blurb: "Cardinal earth. Time, duty, and building something that outlasts the mood.",
  },
  {
    id: "aquarius",
    name: "Aquarius",
    short: "Aqu",
    element: "Air",
    mode: "Fixed",
    ruler: "Saturn",
    span: "Jan 20 – Feb 18",
    blurb: "Fixed air. The old ruler is Saturn. It is cast as independent, social, and slightly apart.",
  },
  {
    id: "pisces",
    name: "Pisces",
    short: "Pis",
    element: "Water",
    mode: "Mutable",
    ruler: "Jupiter",
    span: "Feb 19 – Mar 20",
    blurb: "The last sign, mutable water. Tradition gives it empathy, drift, and a porous edge.",
  },
];

export type City = {
  name: string;
  region: string;
  tz: string;
  lat: number;
  lon: number;
};

export const CITIES: City[] = [
  { name: "Dhaka", region: "Bangladesh", tz: "Asia/Dhaka", lat: 23.81, lon: 90.41 },
  { name: "Chittagong", region: "Bangladesh", tz: "Asia/Dhaka", lat: 22.36, lon: 91.78 },
  { name: "Kolkata", region: "India", tz: "Asia/Kolkata", lat: 22.57, lon: 88.36 },
  { name: "Delhi", region: "India", tz: "Asia/Kolkata", lat: 28.61, lon: 77.21 },
  { name: "Mumbai", region: "India", tz: "Asia/Kolkata", lat: 19.08, lon: 72.88 },
  { name: "Karachi", region: "Pakistan", tz: "Asia/Karachi", lat: 24.86, lon: 67.01 },
  { name: "Lahore", region: "Pakistan", tz: "Asia/Karachi", lat: 31.52, lon: 74.36 },
  { name: "Kathmandu", region: "Nepal", tz: "Asia/Kathmandu", lat: 27.72, lon: 85.32 },
  { name: "Colombo", region: "Sri Lanka", tz: "Asia/Colombo", lat: 6.93, lon: 79.85 },
  { name: "Bangkok", region: "Thailand", tz: "Asia/Bangkok", lat: 13.76, lon: 100.5 },
  { name: "Singapore", region: "Singapore", tz: "Asia/Singapore", lat: 1.35, lon: 103.82 },
  { name: "Jakarta", region: "Indonesia", tz: "Asia/Jakarta", lat: -6.21, lon: 106.85 },
  { name: "Manila", region: "Philippines", tz: "Asia/Manila", lat: 14.6, lon: 120.98 },
  { name: "Hong Kong", region: "China", tz: "Asia/Hong_Kong", lat: 22.32, lon: 114.17 },
  { name: "Taipei", region: "Taiwan", tz: "Asia/Taipei", lat: 25.03, lon: 121.57 },
  { name: "Beijing", region: "China", tz: "Asia/Shanghai", lat: 39.9, lon: 116.41 },
  { name: "Shanghai", region: "China", tz: "Asia/Shanghai", lat: 31.23, lon: 121.47 },
  { name: "Seoul", region: "South Korea", tz: "Asia/Seoul", lat: 37.57, lon: 126.98 },
  { name: "Tokyo", region: "Japan", tz: "Asia/Tokyo", lat: 35.68, lon: 139.65 },
  { name: "Dubai", region: "UAE", tz: "Asia/Dubai", lat: 25.2, lon: 55.27 },
  { name: "Doha", region: "Qatar", tz: "Asia/Qatar", lat: 25.29, lon: 51.53 },
  { name: "Riyadh", region: "Saudi Arabia", tz: "Asia/Riyadh", lat: 24.71, lon: 46.68 },
  { name: "Tehran", region: "Iran", tz: "Asia/Tehran", lat: 35.69, lon: 51.39 },
  { name: "Istanbul", region: "Türkiye", tz: "Europe/Istanbul", lat: 41.01, lon: 28.98 },
  { name: "Cairo", region: "Egypt", tz: "Africa/Cairo", lat: 30.04, lon: 31.24 },
  { name: "Lagos", region: "Nigeria", tz: "Africa/Lagos", lat: 6.52, lon: 3.38 },
  { name: "Accra", region: "Ghana", tz: "Africa/Accra", lat: 5.6, lon: -0.19 },
  { name: "Nairobi", region: "Kenya", tz: "Africa/Nairobi", lat: -1.29, lon: 36.82 },
  { name: "Johannesburg", region: "South Africa", tz: "Africa/Johannesburg", lat: -26.2, lon: 28.05 },
  { name: "Cape Town", region: "South Africa", tz: "Africa/Johannesburg", lat: -33.92, lon: 18.42 },
  { name: "Casablanca", region: "Morocco", tz: "Africa/Casablanca", lat: 33.57, lon: -7.59 },
  { name: "London", region: "United Kingdom", tz: "Europe/London", lat: 51.51, lon: -0.13 },
  { name: "Manchester", region: "United Kingdom", tz: "Europe/London", lat: 53.48, lon: -2.24 },
  { name: "Edinburgh", region: "United Kingdom", tz: "Europe/London", lat: 55.95, lon: -3.19 },
  { name: "Dublin", region: "Ireland", tz: "Europe/Dublin", lat: 53.35, lon: -6.26 },
  { name: "Paris", region: "France", tz: "Europe/Paris", lat: 48.86, lon: 2.35 },
  { name: "Lyon", region: "France", tz: "Europe/Paris", lat: 45.76, lon: 4.84 },
  { name: "Madrid", region: "Spain", tz: "Europe/Madrid", lat: 40.42, lon: -3.7 },
  { name: "Barcelona", region: "Spain", tz: "Europe/Madrid", lat: 41.39, lon: 2.17 },
  { name: "Lisbon", region: "Portugal", tz: "Europe/Lisbon", lat: 38.72, lon: -9.14 },
  { name: "Rome", region: "Italy", tz: "Europe/Rome", lat: 41.9, lon: 12.5 },
  { name: "Milan", region: "Italy", tz: "Europe/Rome", lat: 45.46, lon: 9.19 },
  { name: "Berlin", region: "Germany", tz: "Europe/Berlin", lat: 52.52, lon: 13.41 },
  { name: "Munich", region: "Germany", tz: "Europe/Berlin", lat: 48.14, lon: 11.58 },
  { name: "Amsterdam", region: "Netherlands", tz: "Europe/Amsterdam", lat: 52.37, lon: 4.9 },
  { name: "Brussels", region: "Belgium", tz: "Europe/Brussels", lat: 50.85, lon: 4.35 },
  { name: "Vienna", region: "Austria", tz: "Europe/Vienna", lat: 48.21, lon: 16.37 },
  { name: "Warsaw", region: "Poland", tz: "Europe/Warsaw", lat: 52.23, lon: 21.01 },
  { name: "Prague", region: "Czechia", tz: "Europe/Prague", lat: 50.08, lon: 14.44 },
  { name: "Athens", region: "Greece", tz: "Europe/Athens", lat: 37.98, lon: 23.73 },
  { name: "Stockholm", region: "Sweden", tz: "Europe/Stockholm", lat: 59.33, lon: 18.07 },
  { name: "Oslo", region: "Norway", tz: "Europe/Oslo", lat: 59.91, lon: 10.75 },
  { name: "Copenhagen", region: "Denmark", tz: "Europe/Copenhagen", lat: 55.68, lon: 12.57 },
  { name: "Helsinki", region: "Finland", tz: "Europe/Helsinki", lat: 60.17, lon: 24.94 },
  { name: "Reykjavik", region: "Iceland", tz: "Atlantic/Reykjavik", lat: 64.15, lon: -21.94 },
  { name: "Moscow", region: "Russia", tz: "Europe/Moscow", lat: 55.76, lon: 37.62 },
  { name: "New York", region: "USA", tz: "America/New_York", lat: 40.71, lon: -74.01 },
  { name: "Boston", region: "USA", tz: "America/New_York", lat: 42.36, lon: -71.06 },
  { name: "Washington", region: "USA", tz: "America/New_York", lat: 38.91, lon: -77.04 },
  { name: "Miami", region: "USA", tz: "America/New_York", lat: 25.76, lon: -80.19 },
  { name: "Atlanta", region: "USA", tz: "America/New_York", lat: 33.75, lon: -84.39 },
  { name: "Chicago", region: "USA", tz: "America/Chicago", lat: 41.88, lon: -87.63 },
  { name: "Houston", region: "USA", tz: "America/Chicago", lat: 29.76, lon: -95.37 },
  { name: "Dallas", region: "USA", tz: "America/Chicago", lat: 32.78, lon: -96.8 },
  { name: "Denver", region: "USA", tz: "America/Denver", lat: 39.74, lon: -104.99 },
  { name: "Phoenix", region: "USA", tz: "America/Phoenix", lat: 33.45, lon: -112.07 },
  { name: "Los Angeles", region: "USA", tz: "America/Los_Angeles", lat: 34.05, lon: -118.24 },
  { name: "San Francisco", region: "USA", tz: "America/Los_Angeles", lat: 37.77, lon: -122.42 },
  { name: "Seattle", region: "USA", tz: "America/Los_Angeles", lat: 47.61, lon: -122.33 },
  { name: "Honolulu", region: "USA", tz: "Pacific/Honolulu", lat: 21.31, lon: -157.86 },
  { name: "Anchorage", region: "USA", tz: "America/Anchorage", lat: 61.22, lon: -149.9 },
  { name: "Toronto", region: "Canada", tz: "America/Toronto", lat: 43.65, lon: -79.38 },
  { name: "Montreal", region: "Canada", tz: "America/Toronto", lat: 45.5, lon: -73.57 },
  { name: "Vancouver", region: "Canada", tz: "America/Vancouver", lat: 49.28, lon: -123.12 },
  { name: "Mexico City", region: "Mexico", tz: "America/Mexico_City", lat: 19.43, lon: -99.13 },
  { name: "Guadalajara", region: "Mexico", tz: "America/Mexico_City", lat: 20.67, lon: -103.35 },
  { name: "Havana", region: "Cuba", tz: "America/Havana", lat: 23.11, lon: -82.37 },
  { name: "Bogotá", region: "Colombia", tz: "America/Bogota", lat: 4.71, lon: -74.07 },
  { name: "Lima", region: "Peru", tz: "America/Lima", lat: -12.05, lon: -77.04 },
  { name: "São Paulo", region: "Brazil", tz: "America/Sao_Paulo", lat: -23.55, lon: -46.63 },
  { name: "Rio de Janeiro", region: "Brazil", tz: "America/Sao_Paulo", lat: -22.91, lon: -43.17 },
  { name: "Buenos Aires", region: "Argentina", tz: "America/Argentina/Buenos_Aires", lat: -34.6, lon: -58.38 },
  { name: "Santiago", region: "Chile", tz: "America/Santiago", lat: -33.45, lon: -70.67 },
  { name: "Sydney", region: "Australia", tz: "Australia/Sydney", lat: -33.87, lon: 151.21 },
  { name: "Melbourne", region: "Australia", tz: "Australia/Melbourne", lat: -37.81, lon: 144.96 },
  { name: "Perth", region: "Australia", tz: "Australia/Perth", lat: -31.95, lon: 115.86 },
  { name: "Auckland", region: "New Zealand", tz: "Pacific/Auckland", lat: -36.85, lon: 174.76 },
  { name: "Wellington", region: "New Zealand", tz: "Pacific/Auckland", lat: -41.29, lon: 174.78 },
];

export type Placement = {
  sign: Sign;
  degree: number;
  lon: number;
};

export type BirthChart = {
  place: string;
  when: string;
  sun: Placement;
  moon: Placement;
  rising: Placement | null;
  risingNote: string | null;
  angles: Partial<Record<BodyId, number>>;
};

type PlanetEl = {
  id: BodyId;
  a0: number;
  aDot: number;
  e0: number;
  eDot: number;
  I0: number;
  IDot: number;
  L0: number;
  LDot: number;
  w0: number;
  wDot: number;
  O0: number;
  ODot: number;
};

// J2000 Keplerian elements and century rates, from the JPL approximate tables.
const PLANETS: PlanetEl[] = [
  { id: "mercury", a0: 0.38709927, aDot: 0.00000037, e0: 0.20563593, eDot: 0.00001906, I0: 7.00497902, IDot: -0.00594749, L0: 252.2503235, LDot: 149472.67411175, w0: 77.45779628, wDot: 0.16047689, O0: 48.33076593, ODot: -0.12534081 },
  { id: "venus", a0: 0.72333566, aDot: 0.0000039, e0: 0.00677672, eDot: -0.00004107, I0: 3.39467605, IDot: -0.0007889, L0: 181.9790995, LDot: 58517.81538729, w0: 131.60246718, wDot: 0.00268329, O0: 76.67984255, ODot: -0.27769418 },
  { id: "earth", a0: 1.00000261, aDot: 0.00000562, e0: 0.01671123, eDot: -0.00004392, I0: -0.00001531, IDot: -0.01294668, L0: 100.46457166, LDot: 35999.37244981, w0: 102.93768193, wDot: 0.32327364, O0: 0, ODot: 0 },
  { id: "mars", a0: 1.52371034, aDot: 0.00001847, e0: 0.0933941, eDot: 0.00007882, I0: 1.84969142, IDot: -0.00813131, L0: -4.55343205, LDot: 19140.30268499, w0: -23.94362959, wDot: 0.44441088, O0: 49.55953891, ODot: -0.29257343 },
  { id: "jupiter", a0: 5.202887, aDot: -0.00011607, e0: 0.04838624, eDot: -0.00013253, I0: 1.30439695, IDot: -0.00183714, L0: 34.39644051, LDot: 3034.74612775, w0: 14.72847983, wDot: 0.21252668, O0: 100.47390909, ODot: 0.20469106 },
  { id: "saturn", a0: 9.53667594, aDot: -0.0012506, e0: 0.05386179, eDot: -0.00050991, I0: 2.48599187, IDot: 0.00193609, L0: 49.95424423, LDot: 1222.49362201, w0: 92.59887831, wDot: -0.41897216, O0: 113.66242448, ODot: -0.28867794 },
  { id: "uranus", a0: 19.18916464, aDot: -0.00196176, e0: 0.04725744, eDot: -0.00004397, I0: 0.77263783, IDot: -0.00242939, L0: 313.23810451, LDot: 428.48202785, w0: 170.9542763, wDot: 0.40805281, O0: 74.01692503, ODot: 0.04240589 },
  { id: "neptune", a0: 30.06992276, aDot: 0.00026291, e0: 0.00859048, eDot: 0.00005105, I0: 1.77004347, IDot: 0.00035372, L0: -55.12002969, LDot: 218.45945325, w0: 44.96476227, wDot: -0.32241464, O0: 131.78422574, ODot: -0.00508664 },
];

const RAD = Math.PI / 180;

export function wrap360(deg: number) {
  return ((deg % 360) + 360) % 360;
}

export function julianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function sunLongitude(jd: number) {
  const n = jd - 2451545;
  const g = (357.528 + 0.9856003 * n) * RAD;
  return wrap360(280.46 + 0.9856474 * n + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
}

export function moonLongitude(jd: number) {
  const d = jd - 2451545;
  const D = (297.8501921 + 12.19074912 * d) * RAD;
  const M = (357.5291092 + 0.98560028 * d) * RAD;
  const Mp = (134.9633964 + 13.06499295 * d) * RAD;
  const F = (93.272095 + 13.2293505 * d) * RAD;
  const lon =
    218.3164477 +
    13.17639648 * d +
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185596 * Math.sin(M) -
    0.114336 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057212 * Math.sin(2 * D - M - Mp) +
    0.05332 * Math.sin(2 * D + Mp);
  return wrap360(lon);
}

export function ascendant(ramcDeg: number, latDeg: number) {
  const ramc = ramcDeg * RAD;
  const lat = latDeg * RAD;
  const eps = 23.4392911 * RAD;
  const lon = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)));
  return wrap360(lon / RAD);
}

function gmst(jd: number) {
  return wrap360(280.46061837 + 360.98564736629 * (jd - 2451545));
}

function kepler(mean: number, ecc: number) {
  let E = mean;
  for (let i = 0; i < 8; i += 1) E = mean + ecc * Math.sin(E);
  return E;
}

export function helioLongitude(el: PlanetEl, jd: number) {
  const T = (jd - 2451545) / 36525;
  const e = el.e0 + el.eDot * T;
  const I = (el.I0 + el.IDot * T) * RAD;
  const L = el.L0 + el.LDot * T;
  const w = el.w0 + el.wDot * T;
  const O = (el.O0 + el.ODot * T) * RAD;
  const M = wrap360(L - w) * RAD;
  const E = kepler(M, e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const arg = wrap360(w - el.O0 - el.ODot * T) * RAD + nu;
  const x = Math.cos(O) * Math.cos(arg) - Math.sin(O) * Math.sin(arg) * Math.cos(I);
  const y = Math.sin(O) * Math.cos(arg) + Math.cos(O) * Math.sin(arg) * Math.cos(I);
  return wrap360(Math.atan2(y, x) / RAD);
}

export function signAt(lon: number): Placement {
  const wrapped = wrap360(lon);
  const sign = SIGNS[Math.floor(wrapped / 30)]!;
  return { sign, degree: Math.floor(wrapped % 30), lon: wrapped };
}

export function formatPlacement(place: Placement) {
  return `${place.degree}° ${place.sign.name}`;
}

function tzOffsetMs(timeZone: string, utcMs: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const bag: Record<string, string> = {};
  for (const part of parts) bag[part.type] = part.value;
  const hour = bag.hour === "24" ? "0" : bag.hour;
  const asUtc = Date.UTC(Number(bag.year), Number(bag.month) - 1, Number(bag.day), Number(hour), Number(bag.minute), Number(bag.second));
  return asUtc - utcMs;
}

export function zonedTimeToUtc(date: string, time: string, timeZone: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0);
  const utc = guess - tzOffsetMs(timeZone, guess);
  return new Date(guess - tzOffsetMs(timeZone, utc));
}

export function searchCities(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES.slice(0, 6);
  return CITIES.filter((city) => `${city.name} ${city.region}`.toLowerCase().includes(q)).slice(0, 6);
}

export function readChart(input: { date: string; time: string; city: City | null }): { ok: true; chart: BirthChart } | { ok: false; error: string } {
  if (!input.date) return { ok: false, error: "Add a birth date." };
  const time = input.time || "12:00";
  const zone = input.city?.tz ?? "UTC";
  const instant = zonedTimeToUtc(input.date, time, zone);
  if (!instant || Number.isNaN(instant.getTime())) return { ok: false, error: "That date does not parse." };
  const year = instant.getUTCFullYear();
  if (year < 1800 || year > 2200) return { ok: false, error: "Use a year between 1800 and 2200." };

  const jd = julianDay(instant);
  const sun = signAt(sunLongitude(jd));
  const moon = signAt(moonLongitude(jd));
  let rising: Placement | null = null;
  let risingNote: string | null = null;
  if (!input.city) {
    risingNote = "Pick a city for the rising sign. Moon and Sun used 12:00 UTC when the time was left blank.";
  } else if (Math.abs(input.city.lat) > 66) {
    risingNote = "Too close to a pole for a rising sign in this sketch.";
  } else {
    const ramc = wrap360(gmst(jd) + input.city.lon);
    rising = signAt(ascendant(ramc, input.city.lat));
  }

  const angles: Partial<Record<BodyId, number>> = {};
  for (const el of PLANETS) angles[el.id] = (helioLongitude(el, jd) * Math.PI) / 180;

  const place = input.city ? `${input.city.name}, ${input.city.region}` : "Time treated as UTC";
  const when = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: zone,
  }).format(instant);

  return { ok: true, chart: { place, when, sun, moon, rising, risingNote, angles } };
}
