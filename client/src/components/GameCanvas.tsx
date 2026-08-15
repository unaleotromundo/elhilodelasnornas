/**
 * Estilo «El Hilo de las Nornas»: HUD-bastidor de expedición con tres hebras y centro libre para el horizonte.
 * React funciona como marco y HUD; Babylon ocupa el canvas y posee toda la travesía.
 */
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import { assets } from "@/game/assets";

type HudState = { pulse: number; bond: number; memory: number; distance: number; chapter: number; message: string };
const emptyHud: HudState = { pulse: 3, bond: 62, memory: 0, distance: 0, chapter: 1, message: "Las tres hebras esperan tu paso." };
type Action = "left" | "right" | "gallop" | "spirit";

function sendControl(action: Action, pressed: boolean) {
  window.dispatchEvent(new CustomEvent("nornas:control", { detail: { action, pressed } }));
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [hud, setHud] = useState<HudState>(emptyHud);
  const [expeditionStarted, setExpeditionStarted] = useState(() => new URLSearchParams(window.location.search).has("demo"));
  const [showCodex, setShowCodex] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    let disposed = false;
    createGameScene(engine, canvas).then((nextHandle) => {
      if (disposed) { nextHandle.dispose(); return; }
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
    });
    const onResize = () => engine.resize();
    const onHud = (event: Event) => setHud((event as CustomEvent<HudState>).detail);
    window.addEventListener("resize", onResize);
    window.addEventListener("nornas:hud", onHud);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("nornas:hud", onHud);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  const begin = () => {
    setExpeditionStarted(true);
    window.dispatchEvent(new Event("nornas:started"));
  };
  const pressProps = (action: Action) => ({
    onPointerDown: () => sendControl(action, true),
    onPointerUp: () => sendControl(action, false),
    onPointerCancel: () => sendControl(action, false),
    onPointerLeave: () => sendControl(action, false),
  });

  return (
    <main className="game-shell" aria-label="El Hilo de las Nornas, travesía jugable">
      <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />
      <div className="vignette" aria-hidden="true" />

      <header className="expedition-bar">
        <div className="brand-lockup">
          <img src={assets.logo} alt="Emblema de las tres hebras de las Nornas" className="brand-mark" />
          <div>
            <p className="eyebrow">Telar {String(hud.chapter).padStart(2, "0")}</p>
            <h1>El Hilo de las Nornas</h1>
          </div>
        </div>
        <button className="codex-trigger" onClick={() => setShowCodex((value) => !value)} aria-expanded={showCodex}>
          <span>◈</span> Nornas
        </button>
      </header>

      <section className="hud-left" aria-label="Estado de la expedición">
        <div className="meter-label"><span>Pulso</span><span>{hud.pulse}/3</span></div>
        <div className="pulse-row" aria-label={`${hud.pulse} pulsos restantes`}>
          {[0, 1, 2].map((index) => <span className={`pulse ${index < hud.pulse ? "is-lit" : ""}`} key={index}>✦</span>)}
        </div>
        <div className="meter-label bond-label"><span>Tensión del hilo</span><span>{hud.bond}%</span></div>
        <div className="bond-track"><span style={{ width: `${hud.bond}%` }} /></div>
      </section>

      <section className="hud-right" aria-label="Registro del telar">
        <div><span>Nudos</span><strong>{String(hud.memory).padStart(2, "0")}</strong></div>
        <div><span>Trama</span><strong>{String(hud.distance).padStart(3, "0")} m</strong></div>
        <p>◌ Hilo del acto · urdimbre sur</p>
      </section>

      <aside className="route-whisper"><span>Lectura del telar</span><p>{hud.message}</p></aside>

      {showCodex && (
        <aside className="codex-panel" aria-label="Lectura de las Nornas">
          <button onClick={() => setShowCodex(false)} aria-label="Cerrar lectura">×</button>
          <img src={assets.rider} alt="Viajero a caballo en la pampa" />
          <p className="eyebrow">Tres voces, un camino</p>
          <h2>Ningún hilo manda.</h2>
          <p>Origen guarda lo vivido, Acto brilla bajo tus cascos y Deriva espera el desvío. Recogé nudos, evitá a los cortadores y cruzá antes de que la tormenta cierre la trama.</p>
          <div className="codex-keys"><span><b>← →</b> cruzar hebra</span><span><b>↑ / W</b> tensar paso</span><span><b>ESPACIO</b> coser nudo</span></div>
        </aside>
      )}

      {!expeditionStarted && (
        <section className="threshold" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,9,20,.94) 0%, rgba(5,9,20,.58) 46%, rgba(5,9,20,.18) 100%), url(${assets.visualTarget})` }}>
          <div className="fate-threads" aria-hidden="true"><i /><i /><i /><b>✣</b></div>
          <div className="threshold-copy">
            <img src={assets.logo} alt="" className="threshold-mark" />
            <p className="eyebrow">Una travesía de destino tejido</p>
            <h2>El destino no llega.<br />Se cruza.</h2>
            <p>Tres Nornas han tendido sus hilos sobre la pampa. Galopá entre los nudos y decidí qué futuro merece permanecer.</p>
            <button className="start-button" onClick={begin}>Cruzar el primer nudo <span>→</span></button>
            <small>PC: flechas o A / D · Móvil: controles en pantalla</small>
          </div>
        </section>
      )}

      <div className="touch-controls" aria-label="Controles táctiles">
        <div className="direction-pad">
          <button aria-label="Mover hacia la izquierda" {...pressProps("left")}>←</button>
          <button aria-label="Mover hacia la derecha" {...pressProps("right")}>→</button>
        </div>
        <div className="action-pad">
          <button className="spirit-control" aria-label="Tensar el hilo del acto" {...pressProps("spirit")}>✦<small>Tejer</small></button>
          <button className="gallop-control" aria-label="Galopar" {...pressProps("gallop")}>⌁<small>Galope</small></button>
        </div>
      </div>
    </main>
  );
}
