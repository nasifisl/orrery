import { useEffect, useState } from "react";
import { Hud } from "./Hud";
import { SceneCanvas } from "./SceneCanvas";

export function SolarApp() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className="app">
      <p className="sr">
        Interactive model of the Sun and eight planets. Drag to look around, use the speed control, and select a world to move the camera.
      </p>
      <div className="stage">
        {ready ? <SceneCanvas /> : <div className="boot">Charting the system</div>}
      </div>
      <Hud />
    </div>
  );
}