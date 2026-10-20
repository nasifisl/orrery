import { create } from "zustand";
import type { BodyId } from "./data";

type SimState = {
  paused: boolean;
  speed: number;
  showLabels: boolean;
  showOrbits: boolean;
  showTrails: boolean;
  focusId: BodyId;
  frame: number;
  overview: boolean;
  togglePaused: () => void;
  setSpeed: (speed: number) => void;
  setFocus: (id: BodyId) => void;
  resetView: () => void;
  toggleLabels: () => void;
  toggleOrbits: () => void;
  toggleTrails: () => void;
};

export const useSim = create<SimState>((set) => ({
  paused: false,
  speed: 1.5,
  showLabels: true,
  showOrbits: true,
  showTrails: true,
  focusId: "sun",
  frame: 0,
  overview: true,
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),
  setFocus: (id) => set((s) => ({ focusId: id, frame: s.frame + 1, overview: false })),
  resetView: () => set((s) => ({ focusId: "sun", frame: s.frame + 1, overview: true })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleTrails: () => set((s) => ({ showTrails: !s.showTrails })),
}));

export const clock = { time: 0 };
export const gesture = { moved: false };
