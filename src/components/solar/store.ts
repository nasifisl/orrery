import { create } from "zustand";
import type { BirthChart } from "./chart";
import type { BodyId } from "./data";
import { chartAngles } from "./motion";

type SimState = {
  paused: boolean;
  speed: number;
  showLabels: boolean;
  showOrbits: boolean;
  showTrails: boolean;
  focusId: BodyId;
  frame: number;
  overview: boolean;
  chart: BirthChart | null;
  chartOpen: boolean;
  exoOpen: boolean;
  togglePaused: () => void;
  setSpeed: (speed: number) => void;
  setFocus: (id: BodyId) => void;
  resetView: () => void;
  toggleLabels: () => void;
  toggleOrbits: () => void;
  toggleTrails: () => void;
  setChartOpen: (open: boolean) => void;
  setExoOpen: (open: boolean) => void;
  setChart: (chart: BirthChart) => void;
  clearChart: () => void;
};

function releaseChart() {
  chartAngles.current = null;
}

export const useSim = create<SimState>((set) => ({
  paused: false,
  speed: 1.5,
  showLabels: true,
  showOrbits: true,
  showTrails: true,
  focusId: "sun",
  frame: 0,
  overview: true,
  chart: null,
  chartOpen: false,
  exoOpen: true,
  togglePaused: () =>
    set((s) => {
      if (s.chart && s.paused) {
        releaseChart();
        return { chart: null, chartOpen: false, paused: false };
      }
      return { paused: !s.paused };
    }),
  setSpeed: (speed) => set({ speed }),
  setFocus: (id) => set((s) => ({ focusId: id, frame: s.frame + 1, overview: false })),
  resetView: () =>
    set((s) => {
      releaseChart();
      return { focusId: "sun", frame: s.frame + 1, overview: true, chart: null, chartOpen: false };
    }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleTrails: () => set((s) => ({ showTrails: !s.showTrails })),
  setChartOpen: (chartOpen) => set({ chartOpen }),
  setExoOpen: (exoOpen) =>
    set((s) => ({
      exoOpen,
      frame: s.frame + 1,
      ...(exoOpen ? { focusId: "sun" as const, overview: true } : {}),
    })),
  setChart: (chart) =>
    set((s) => {
      chartAngles.current = chart.angles;
      return { chart, chartOpen: false, paused: true, focusId: "sun", overview: true, frame: s.frame + 1 };
    }),
  clearChart: () =>
    set(() => {
      releaseChart();
      return { chart: null, chartOpen: false, paused: false };
    }),
}));

export const clock = { time: 0 };
export const gesture = { moved: false };
