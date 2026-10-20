import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Circle, Globe, Pause, Play, RotateCcw, Sparkles, Spline, Tag } from "lucide-react";
import { searchCities, formatPlacement, readChart, type City } from "./chart";
import { BODY, BODIES, type BodyId } from "./data";
import catalog from "./exoplanets.json";
import { useSim } from "./store";

const EXO = catalog as {
  asOf: string;
  count: number;
  methods: string[];
  rows: [string, string, number, number, number | null][];
};

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
  const chart = useSim((s) => s.chart);
  const chartOpen = useSim((s) => s.chartOpen);
  const togglePaused = useSim((s) => s.togglePaused);
  const setSpeed = useSim((s) => s.setSpeed);
  const setFocus = useSim((s) => s.setFocus);
  const resetView = useSim((s) => s.resetView);
  const toggleLabels = useSim((s) => s.toggleLabels);
  const toggleOrbits = useSim((s) => s.toggleOrbits);
  const toggleTrails = useSim((s) => s.toggleTrails);
  const setChartOpen = useSim((s) => s.setChartOpen);
  const setChart = useSim((s) => s.setChart);
  const clearChart = useSim((s) => s.clearChart);
  const body = BODY[focusId];
  const [details, setDetails] = useState(false);
  const [atlas, setAtlas] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "SELECT") return;
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

  const openChart = chartOpen || Boolean(chart);

  return (
    <>
      <header className="top">
        <div className="brand">
          <p className="kicker">The solar system</p>
          <h1>Orrery</h1>
        </div>
        <div className="controls">
          <button type="button" className="btn primary" onClick={togglePaused} aria-pressed={paused}>
            {chart && paused ? <Play aria-hidden="true" /> : paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            {chart && paused ? "Live sky" : paused ? "Play" : "Pause"}
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
          <button
            type="button"
            className={openChart ? "btn is-on" : "btn"}
            aria-pressed={openChart}
            onClick={() => {
              setAtlas(false);
              setChartOpen(!chartOpen);
            }}
          >
            <Sparkles aria-hidden="true" />
            Chart
          </button>
          <button
            type="button"
            className={atlas ? "btn is-on" : "btn"}
            aria-pressed={atlas}
            onClick={() => {
              setChartOpen(false);
              setAtlas((open) => !open);
            }}
          >
            <Globe aria-hidden="true" />
            Worlds
          </button>
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

      <aside className={chartOpen || atlas ? "panel is-open is-sheet" : details ? "panel is-open" : "panel"} aria-live="polite">
        {chartOpen ? (
          <ChartForm
            onClose={() => setChartOpen(false)}
            onRead={(date, time, city) => {
              const result = readChart({ date, time, city });
              if (!result.ok) return result.error;
              setAtlas(false);
              setChart(result.chart);
              return null;
            }}
          />
        ) : atlas ? (
          <Atlas onClose={() => setAtlas(false)} onFocus={setFocus} />
        ) : chart ? (
          <div className="panel-body">
            <div className="panel-head">
              <div>
                <p className="kicker">Sun sign · {chart.place}</p>
                <h2>{chart.sun.sign.name}</h2>
                <p className="glance">
                  Earth’s Moon in {chart.moon.sign.name}, {chart.phase.name.toLowerCase()}, {chart.phase.lit}% lit. Star: {chart.sun.sign.star}.
                </p>
              </div>
              <button type="button" className="panel-toggle" aria-expanded={details} onClick={() => setDetails((open) => !open)}>
                {details ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                {details ? "Close" : "Details"}
              </button>
            </div>
            <div className="panel-more">
              <p className="blurb">{chart.sun.sign.blurb}</p>
              <p className="block-title">Earth’s Moon</p>
              <p className="blurb">{chart.moon.sign.moonLine}</p>
              <dl className="facts">
                <div className="fact">
                  <dt>Sign</dt>
                  <dd>{formatPlacement(chart.moon)}</dd>
                </div>
                <div className="fact">
                  <dt>Phase</dt>
                  <dd>{chart.phase.name}</dd>
                </div>
                <div className="fact">
                  <dt>Lit</dt>
                  <dd>{chart.phase.lit}%</dd>
                </div>
                <div className="fact">
                  <dt>Distance</dt>
                  <dd>384,400 km</dd>
                </div>
                <div className="fact">
                  <dt>Width</dt>
                  <dd>3,474 km</dd>
                </div>
                <div className="fact">
                  <dt>Month</dt>
                  <dd>27.3 days</dd>
                </div>
              </dl>
              <p className="note">
                This is only Earth’s Moon. It keeps one face toward us and has no air of its own. The moons drawn around Jupiter, Saturn, and the others are not part of the chart.
              </p>
              <p className="block-title">Star</p>
              <p className="blurb">{chart.sun.sign.starNote}</p>
              <dl className="facts">
                <div className="fact">
                  <dt>Sun</dt>
                  <dd>{formatPlacement(chart.sun)}</dd>
                </div>
                <div className="fact">
                  <dt>Rising</dt>
                  <dd>{chart.rising ? formatPlacement(chart.rising) : "—"}</dd>
                </div>
                <div className="fact">
                  <dt>Star</dt>
                  <dd>{chart.sun.sign.star}</dd>
                </div>
                <div className="fact">
                  <dt>Distance</dt>
                  <dd>{chart.sun.sign.starDistance}</dd>
                </div>
                <div className="fact">
                  <dt>Element</dt>
                  <dd>{chart.sun.sign.element}</dd>
                </div>
                <div className="fact">
                  <dt>Ruler</dt>
                  <dd>{chart.sun.sign.ruler}</dd>
                </div>
              </dl>
              <p className="block-title">Worlds in this system</p>
              <ul className="sign-list">
                {chart.system.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => setFocus(item.id)}>
                      {item.name}
                    </button>
                    <span>
                      {formatPlacement(item.place)}
                      {item.kind === "Dwarf planet" ? " · dwarf" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="note">
                {chart.place}. {chart.when}. Eight planets and five dwarf planets are parked on that sky. Planets around other stars are in Worlds, not in this system.
                {chart.risingNote ? ` ${chart.risingNote}` : " Rising uses the city’s clock, including daylight saving."}
              </p>
              <button type="button" className="btn chart-live" onClick={clearChart}>
                Live sky
              </button>
            </div>
          </div>
        ) : (
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
              {body.id === "earth" ? (
                <>
                  <p className="block-title">Earth’s Moon</p>
                  <p className="blurb">
                    Earth has one moon. It is a fifth as wide as Earth, keeps the same face toward us, and has no air. The other moons in this model belong to other planets.
                  </p>
                  <dl className="facts">
                    <div className="fact">
                      <dt>Width</dt>
                      <dd>3,474 km</dd>
                    </div>
                    <div className="fact">
                      <dt>Distance</dt>
                      <dd>384,400 km</dd>
                    </div>
                    <div className="fact">
                      <dt>Orbit</dt>
                      <dd>27.3 days</dd>
                    </div>
                    <div className="fact">
                      <dt>Full cycle</dt>
                      <dd>29.5 days</dd>
                    </div>
                  </dl>
                </>
              ) : null}
              {body.id === "sun" ? (
                <>
                  <p className="block-title">The only star</p>
                  <p className="blurb">
                    Everything else here shines by reflected sunlight. The twelve signs are constellations of distant stars along the Sun’s path, light-years away, not worlds in this system.
                  </p>
                </>
              ) : null}
              <p className="note">
                Sizes and spacing are compressed so every world stays in frame. Orbits keep their real order, sped up so the outer planets still drift.
              </p>
            </div>
          </div>
        )}
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
        <p className="hint">Drag to look. Scroll or pinch to zoom. Click a world, or press 0–8. Chart reads a birth sky.</p>
      </div>
    </>
  );
}

function ChartForm({
  onClose,
  onRead,
}: {
  onClose: () => void;
  onRead: (date: string, time: string, city: City | null) => string | null;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  const matches = useMemo(() => searchCities(query), [query]);

  return (
    <form
      className="chart-form"
      onSubmit={(e) => {
        e.preventDefault();
        const picked = city ?? (query.trim() && matches.length === 1 ? matches[0]! : null);
        const next = onRead(date, time, picked);
        setError(next);
      }}
    >
      <div className="panel-head">
        <div>
          <p className="kicker">Birth sky</p>
          <h2>Chart</h2>
        </div>
        <button type="button" className="panel-toggle" onClick={onClose}>
          <ChevronUp aria-hidden="true" />
          Close
        </button>
      </div>
      <label className="field">
        Date
        <input type="date" name="date" required value={date} min="1800-01-01" max="2200-12-31" onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="field">
        Time
        <input type="time" name="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </label>
      <label className="field">
        City
        <input
          type="text"
          name="city"
          placeholder="Dhaka, London, New York"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCity(null);
          }}
        />
      </label>
      {city ? null : (
        <div className="city-list" role="listbox" aria-label="Cities">
          {matches.map((item) => (
            <button
              key={`${item.name}-${item.region}`}
              type="button"
              role="option"
              aria-selected={false}
              className="city"
              onClick={() => {
                setCity(item);
                setQuery(`${item.name}, ${item.region}`);
              }}
            >
              {item.name}
              <span>{item.region}</span>
            </button>
          ))}
        </div>
      )}
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn primary chart-live">
        Read chart
      </button>
    </form>
  );
}

function Atlas({ onClose, onFocus }: { onClose: () => void; onFocus: (id: BodyId) => void }) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(40);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXO.rows;
    return EXO.rows.filter((row) => row[0].toLowerCase().includes(q) || row[1].toLowerCase().includes(q));
  }, [query]);
  const page = matches.slice(0, shown);

  return (
    <div className="panel-body">
      <div className="panel-head">
        <div>
          <p className="kicker">Other stars · {EXO.asOf}</p>
          <h2>{EXO.count.toLocaleString()} planets</h2>
        </div>
        <button type="button" className="panel-toggle" onClick={onClose}>
          <ChevronUp aria-hidden="true" />
          Close
        </button>
      </div>
      <p className="glance">
        Every confirmed planet around another star in the NASA catalog. They stay off the orrery, because they do not orbit our Sun.
      </p>
      <p className="block-title">In this orrery</p>
      <div className="dock" role="list">
        {BODIES.filter((item) => item.id !== "sun").map((item) => (
          <button key={item.id} type="button" className="chip" onClick={() => onFocus(item.id)}>
            {item.name}
          </button>
        ))}
      </div>
      <label className="field">
        Search
        <input
          type="search"
          value={query}
          placeholder="TRAPPIST, Kepler, 55 Cnc"
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(40);
          }}
        />
      </label>
      <p className="note">
        {matches.length.toLocaleString()} {matches.length === 1 ? "match" : "matches"}.
      </p>
      <div className="exo-list">
        {page.map((row) => (
          <div className="exo-row" key={row[0]}>
            <strong>{row[0]}</strong>
            <span>
              {row[1]} · {row[2]} · {EXO.methods[row[3]]}
              {row[4] != null ? ` · ${row[4].toLocaleString()} ly` : ""}
            </span>
          </div>
        ))}
      </div>
      {shown < matches.length ? (
        <button type="button" className="btn" onClick={() => setShown((count) => count + 40)}>
          Show more
        </button>
      ) : null}
    </div>
  );
}
