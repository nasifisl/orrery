export type BodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "ceres"
  | "pluto"
  | "haumea"
  | "makemake"
  | "eris";

export type Fact = { label: string; value: string };

export type MoonDef = {
  name: string;
  radius: number;
  distance: number;
  period: number;
  phase: number;
  color: string;
};

export type RingDef = {
  inner: number;
  outer: number;
  opacity: number;
  texture: "saturn" | "uranus";
};

export type BodyDef = {
  id: BodyId;
  name: string;
  kind: string;
  blurb: string;
  facts: Fact[];
  radius: number;
  distance: number;
  orbitSeconds: number;
  inclination: number;
  phase: number;
  spin: number;
  tilt: number;
  view: number;
  trail: string;
  atmosphere: string;
  atm: number;
  roughness: number;
  moons: MoonDef[];
  rings?: RingDef;
};

export const BODIES: BodyDef[] = [
  {
    id: "sun",
    name: "Sun",
    kind: "G-type star",
    blurb:
      "A middle-aged star fusing hydrogen into helium. It holds nearly all the mass in the solar system, and every world here orbits it.",
    facts: [
      { label: "Class", value: "G2V" },
      { label: "Diameter", value: "1.39 million km" },
      { label: "Surface", value: "5,500 °C" },
      { label: "Core", value: "15 million °C" },
      { label: "Age", value: "4.6 billion yr" },
      { label: "Planets", value: "8" },
      { label: "Dwarf planets", value: "5" },
    ],
    radius: 2.2,
    distance: 0,
    orbitSeconds: 1,
    inclination: 0,
    phase: 0,
    spin: 0.06,
    tilt: 0.13,
    view: 82,
    trail: "#f4f1ea",
    atmosphere: "#ffd7a8",
    atm: 0.85,
    roughness: 1,
    moons: [],
  },
  {
    id: "mercury",
    name: "Mercury",
    kind: "Terrestrial",
    blurb:
      "The innermost planet. A cratered world with almost no air, swinging between a blistering day and a frozen night.",
    facts: [
      { label: "Diameter", value: "4,879 km" },
      { label: "Distance", value: "0.39 AU" },
      { label: "Year", value: "88 days" },
      { label: "Day", value: "59 days" },
      { label: "Moons", value: "None" },
      { label: "Temp", value: "−180 to 430 °C" },
    ],
    radius: 0.32,
    distance: 5.5,
    orbitSeconds: 10,
    inclination: 0.12,
    phase: 0.4,
    spin: 0.18,
    tilt: 0.01,
    view: 2.6,
    trail: "#c8beb4",
    atmosphere: "#b7aea4",
    atm: 0.18,
    roughness: 0.96,
    moons: [],
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Terrestrial",
    blurb:
      "A runaway greenhouse wrapped in sulfuric clouds. The surface pressure is about ninety-two times Earth’s.",
    facts: [
      { label: "Diameter", value: "12,104 km" },
      { label: "Distance", value: "0.72 AU" },
      { label: "Year", value: "225 days" },
      { label: "Day", value: "243 days" },
      { label: "Moons", value: "None" },
      { label: "Temp", value: "464 °C" },
    ],
    radius: 0.5,
    distance: 7.3,
    orbitSeconds: 16,
    inclination: 0.06,
    phase: 1.55,
    spin: -0.1,
    tilt: 3.09,
    view: 3.3,
    trail: "#e6d2a2",
    atmosphere: "#f0d7a4",
    atm: 0.72,
    roughness: 0.72,
    moons: [],
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Terrestrial",
    blurb:
      "The only known world with liquid surface water and a living biosphere. One moon keeps it company.",
    facts: [
      { label: "Diameter", value: "12,742 km" },
      { label: "Distance", value: "1.00 AU" },
      { label: "Year", value: "365 days" },
      { label: "Day", value: "24 hours" },
      { label: "Moons", value: "1" },
      { label: "Temp", value: "15 °C" },
    ],
    radius: 0.52,
    distance: 9.4,
    orbitSeconds: 24,
    inclination: 0,
    phase: 2.45,
    spin: 0.72,
    tilt: 0.41,
    view: 3.5,
    trail: "#8eb4de",
    atmosphere: "#7eb6ff",
    atm: 0.55,
    roughness: 0.55,
    moons: [
      {
        name: "Moon",
        radius: 0.14,
        distance: 1.15,
        period: 5.5,
        phase: 0.8,
        color: "#d5d0c6",
      },
    ],
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Terrestrial",
    blurb:
      "A cold desert with the tallest volcano and the longest canyon in the solar system. Two small moons whip around it.",
    facts: [
      { label: "Diameter", value: "6,779 km" },
      { label: "Distance", value: "1.52 AU" },
      { label: "Year", value: "687 days" },
      { label: "Day", value: "24.6 hours" },
      { label: "Moons", value: "2" },
      { label: "Temp", value: "−63 °C" },
    ],
    radius: 0.38,
    distance: 11.6,
    orbitSeconds: 36,
    inclination: 0.035,
    phase: 4.1,
    spin: 0.68,
    tilt: 0.44,
    view: 2.9,
    trail: "#e09068",
    atmosphere: "#e08a62",
    atm: 0.28,
    roughness: 0.9,
    moons: [
      {
        name: "Phobos",
        radius: 0.05,
        distance: 0.72,
        period: 2.2,
        phase: 0.2,
        color: "#b7aa9e",
      },
    ],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Gas giant",
    blurb:
      "A hydrogen giant with a centuries-old storm wider than Earth. Its gravity shepherds the asteroid belt.",
    facts: [
      { label: "Diameter", value: "139,820 km" },
      { label: "Distance", value: "5.20 AU" },
      { label: "Year", value: "11.9 years" },
      { label: "Day", value: "9.9 hours" },
      { label: "Moons", value: "95" },
      { label: "Temp", value: "−110 °C" },
    ],
    radius: 1.22,
    distance: 15.8,
    orbitSeconds: 62,
    inclination: 0.02,
    phase: 0.85,
    spin: 1.45,
    tilt: 0.05,
    view: 7.4,
    trail: "#e2c4a0",
    atmosphere: "#f0d7b4",
    atm: 0.32,
    roughness: 0.58,
    moons: [
      { name: "Io", radius: 0.09, distance: 1.9, period: 3.1, phase: 0.4, color: "#e6d2a0" },
      { name: "Europa", radius: 0.08, distance: 2.35, period: 4.6, phase: 1.7, color: "#e7e2d6" },
      { name: "Ganymede", radius: 0.12, distance: 2.9, period: 7.2, phase: 3.1, color: "#c8b8a0" },
      { name: "Callisto", radius: 0.1, distance: 3.55, period: 12, phase: 5.2, color: "#8e8478" },
    ],
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Gas giant",
    blurb:
      "Pale and banded, circled by the brightest ring system we know. The rings are ice and rock, only tens of meters thick.",
    facts: [
      { label: "Diameter", value: "116,460 km" },
      { label: "Distance", value: "9.54 AU" },
      { label: "Year", value: "29.5 years" },
      { label: "Day", value: "10.7 hours" },
      { label: "Moons", value: "146" },
      { label: "Temp", value: "−140 °C" },
    ],
    radius: 1.05,
    distance: 19.6,
    orbitSeconds: 90,
    inclination: 0.045,
    phase: 2.15,
    spin: 1.3,
    tilt: 0.47,
    view: 10.5,
    trail: "#ead8b4",
    atmosphere: "#f3e6c8",
    atm: 0.3,
    roughness: 0.55,
    rings: { inner: 1.28, outer: 2.2, opacity: 0.95, texture: "saturn" },
    moons: [
      { name: "Titan", radius: 0.12, distance: 2.85, period: 9, phase: 1.1, color: "#e0c48a" },
    ],
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Ice giant",
    blurb:
      "An ice giant tipped on its side, so its seasons last decades. Faint rings trace the same extreme tilt.",
    facts: [
      { label: "Diameter", value: "50,724 km" },
      { label: "Distance", value: "19.2 AU" },
      { label: "Year", value: "84 years" },
      { label: "Day", value: "17.2 hours" },
      { label: "Moons", value: "28" },
      { label: "Temp", value: "−195 °C" },
    ],
    radius: 0.74,
    distance: 23.4,
    orbitSeconds: 124,
    inclination: 0.015,
    phase: 3.55,
    spin: 0.95,
    tilt: 1.71,
    view: 4.8,
    trail: "#b7e6e2",
    atmosphere: "#c6fff6",
    atm: 0.4,
    roughness: 0.48,
    rings: { inner: 1.45, outer: 1.9, opacity: 0.55, texture: "uranus" },
    moons: [
      { name: "Titania", radius: 0.06, distance: 1.7, period: 6.4, phase: 2.2, color: "#d5ddd8" },
    ],
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Ice giant",
    blurb:
      "The windiest planet. Deep blue, with storms that race faster than sound, and a year longer than a human life.",
    facts: [
      { label: "Diameter", value: "49,244 km" },
      { label: "Distance", value: "30.1 AU" },
      { label: "Year", value: "165 years" },
      { label: "Day", value: "16.1 hours" },
      { label: "Moons", value: "16" },
      { label: "Temp", value: "−200 °C" },
    ],
    radius: 0.72,
    distance: 27,
    orbitSeconds: 168,
    inclination: 0.03,
    phase: 5.15,
    spin: 1.05,
    tilt: 0.49,
    view: 4.6,
    trail: "#7aa2ee",
    atmosphere: "#6f93ff",
    atm: 0.42,
    roughness: 0.45,
    moons: [
      { name: "Triton", radius: 0.07, distance: 1.55, period: 7.5, phase: 4.4, color: "#d6e4ea" },
    ],
  },
  {
    id: "ceres",
    name: "Ceres",
    kind: "Dwarf planet",
    blurb:
      "The only dwarf planet inside the asteroid belt. A dark, cratered ball with bright salt spots, found in 1801.",
    facts: [
      { label: "Diameter", value: "939 km" },
      { label: "Distance", value: "2.77 AU" },
      { label: "Year", value: "4.6 years" },
      { label: "Found", value: "1801" },
      { label: "Moons", value: "None" },
      { label: "Class", value: "Dwarf planet" },
    ],
    radius: 0.18,
    distance: 13.1,
    orbitSeconds: 48,
    inclination: 0.16,
    phase: 1.2,
    spin: 0.4,
    tilt: 0.07,
    view: 2.2,
    trail: "#c4b8a4",
    atmosphere: "#b7aa9a",
    atm: 0.08,
    roughness: 0.95,
    moons: [],
  },
  {
    id: "pluto",
    name: "Pluto",
    kind: "Dwarf planet",
    blurb:
      "A distant icy world with a heart-shaped glacier. It was called the ninth planet until 2006, when it became the first of the dwarf planets.",
    facts: [
      { label: "Diameter", value: "2,377 km" },
      { label: "Distance", value: "39.5 AU" },
      { label: "Year", value: "248 years" },
      { label: "Found", value: "1930" },
      { label: "Moons", value: "5" },
      { label: "Class", value: "Dwarf planet" },
    ],
    radius: 0.22,
    distance: 31,
    orbitSeconds: 220,
    inclination: 0.22,
    phase: 3.4,
    spin: 0.22,
    tilt: 0.2,
    view: 2.4,
    trail: "#e7d7c8",
    atmosphere: "#d9cbb8",
    atm: 0.12,
    roughness: 0.88,
    moons: [{ name: "Charon", radius: 0.11, distance: 0.72, period: 8, phase: 1.4, color: "#c8c0b4" }],
  },
  {
    id: "haumea",
    name: "Haumea",
    kind: "Dwarf planet",
    blurb:
      "An egg-shaped ice world that spins once every four hours. It has a thin ring and two moons.",
    facts: [
      { label: "Width", value: "About 1,560 km" },
      { label: "Distance", value: "43 AU" },
      { label: "Year", value: "284 years" },
      { label: "Found", value: "2004" },
      { label: "Moons", value: "2" },
      { label: "Ring", value: "One thin ring" },
    ],
    radius: 0.17,
    distance: 32.6,
    orbitSeconds: 250,
    inclination: 0.34,
    phase: 5.1,
    spin: 1.8,
    tilt: 0.3,
    view: 2.3,
    trail: "#f2f0ea",
    atmosphere: "#e4e2da",
    atm: 0.06,
    roughness: 0.7,
    moons: [{ name: "Hiʻiaka", radius: 0.06, distance: 0.7, period: 10, phase: 0.6, color: "#eceae4" }],
  },
  {
    id: "makemake",
    name: "Makemake",
    kind: "Dwarf planet",
    blurb:
      "A reddish ice world past Pluto, with one small moon. Its surface is frozen methane.",
    facts: [
      { label: "Diameter", value: "1,430 km" },
      { label: "Distance", value: "45.8 AU" },
      { label: "Year", value: "306 years" },
      { label: "Found", value: "2005" },
      { label: "Moons", value: "1" },
      { label: "Surface", value: "Methane ice" },
    ],
    radius: 0.17,
    distance: 33.6,
    orbitSeconds: 270,
    inclination: 0.35,
    phase: 0.4,
    spin: 0.5,
    tilt: 0.1,
    view: 2.3,
    trail: "#e0b49a",
    atmosphere: "#d7aa90",
    atm: 0.06,
    roughness: 0.84,
    moons: [{ name: "MK2", radius: 0.04, distance: 0.62, period: 12, phase: 2.2, color: "#b7b0a6" }],
  },
  {
    id: "eris",
    name: "Eris",
    kind: "Dwarf planet",
    blurb:
      "Slightly smaller than Pluto and much farther out. Finding it in 2005 is what forced the argument that reclassified Pluto.",
    facts: [
      { label: "Diameter", value: "2,326 km" },
      { label: "Distance", value: "68 AU" },
      { label: "Year", value: "559 years" },
      { label: "Found", value: "2005" },
      { label: "Moons", value: "1" },
      { label: "Class", value: "Dwarf planet" },
    ],
    radius: 0.21,
    distance: 36.2,
    orbitSeconds: 340,
    inclination: 0.46,
    phase: 2.7,
    spin: 0.3,
    tilt: 0.15,
    view: 2.5,
    trail: "#f7f7f4",
    atmosphere: "#e7e7e2",
    atm: 0.08,
    roughness: 0.62,
    moons: [{ name: "Dysnomia", radius: 0.06, distance: 0.78, period: 14, phase: 3.3, color: "#d0d0cc" }],
  },
];

export const BODY: Record<BodyId, BodyDef> = Object.fromEntries(BODIES.map((b) => [b.id, b])) as Record<
  BodyId,
  BodyDef
>;

export const PLANETS = BODIES.filter((b) => b.id !== "sun");
