import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Circle, Pause, Play, RotateCcw, Spline, Tag } from "lucide-react";
import { BODY, BODIES, type BodyId } from "./data";
import { useSim } from "./store";

const KEYS: Record<string, BodyId> = {
  "0": "sun",
  "1": "mercury",
  "2": "venus",
  "3": "earth",
  "4": "mars",
  "5": "jupiter",
  "6": "saturn",
  "7": "uranus",
  "8": "neptune",
};

export function Hud() {
  const paused = useSim((s) => s.paused);
  const speed = useSim((s) => s.speed);
  const showLabels = useSim((s) => s.showLabels);
  const showOrbits = useSim((s) => s.showOrbits);
  const showTrails = useSim((s) => s.showTrails);
  const focusId = useSim((s) => s.focusId);
  const togglePaused = useSim((s) => s.togglePaused);
  const setSpeed = useSim((s) => s.setSpeed);
  const setFocus = useSim((s) => s.setFocus);
  const resetView = useSim((s) => s.resetView);
  const toggleLabels = useSim((s) => s.toggleLabels);
  const toggleOrbits = useSim((s) => s.toggleOrbits);
  const toggleTrails = useSim((s) => s.toggleTrails);
  const body = BODY[focusId];
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePaused();
        return;
      }
      if (e.key === "Escape") {
        resetView();
        return;
      }
      if (e.key === "[" || e.key === "]") {
        const next = e.key === "]" ? speed + 0.25 : speed - 0.25;
        setSpeed(Math.min(8, Math.max(0.25, Math.round(next * 100) / 100)));
        return;
      }
      const id = KEYS[e.key];
      if (id) setFocus(id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetView, setFocus, setSpeed, speed, togglePaused]);

  return (
    <>
      <header className="top">
        <div className="brand">
          <p className="kicker">The solar system</p>
          <h1>Orrery</h1>
        </div>
        <div className="controls">
          <button type="button" className="btn primary" onClick={togglePaused} aria-pressed={paused}>
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            {paused ? "Play" : "Pause"}
          </button>
          <label className="speed">
            Speed
            <input
              type="range"
              min={0.25}
              max={8}
              step={0.05}
              value={speed}
              aria-valuemin={0.25}
              aria-valuemax={8}
              aria-valuenow={speed}
              aria-valuetext={`${speed.toFixed(1)} times`}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="speed-value">{speed.toFixed(1)}×</span>
          </label>
          <button type="button" className={showLabels ? "btn is-on" : "btn"} aria-pressed={showLabels} onClick={toggleLabels}>
            <Tag aria-hidden="true" />
            Labels
          </button>
          <button type="button" className={showOrbits ? "btn is-on" : "btn"} aria-pressed={showOrbits} onClick={toggleOrbits}>
            <Circle aria-hidden="true" />
            Orbits
          </button>
          <button type="button" className={showTrails ? "btn is-on" : "btn"} aria-pressed={showTrails} onClick={toggleTrails}>
            <Spline aria-hidden="true" />
            Trails
          </button>
          <button type="button" className="btn" onClick={resetView}>
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        </div>
      </header>

      <aside className={details ? "panel is-open" : "panel"} aria-live="polite">
        <div className="panel-body" key={body.id}>
          <div className="panel-head">
            <div>
              <p className="kicker">{body.kind}</p>
              <h2>{body.name}</h2>
            </div>
            <button
              type="button"
              className="panel-toggle"
              aria-expanded={details}
              onClick={() => setDetails((open) => !open)}
            >
              {details ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
              {details ? "Close" : "Details"}
            </button>
          </div>
          <div className="panel-more">
            <p className="blurb">{body.blurb}</p>
            <dl className="facts">
              {body.facts.map((fact) => (
                <div className="fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="note">
              Sizes and spacing are compressed so every world stays in frame. Orbits keep their real order, sped up so the outer planets still drift.
            </p>
          </div>
        </div>
      </aside>

      <div className="bottom">
        <div className="dock" role="tablist" aria-label="Bodies">
          {BODIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={item.id === focusId ? "chip is-on" : "chip"}
              aria-selected={item.id === focusId}
              onClick={() => setFocus(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="hint">Drag to look. Scroll or pinch to zoom. Click a world, or press 0–8. Space pauses.</p>
      </div>
    </>
  );
}
