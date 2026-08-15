/**
 * Estilo «El polvo recuerda»: HUD de expedición con bordes instrumentales y centro libre para el horizonte.
 * React funciona como marco y HUD; Babylon ocupa el canvas y posee toda la travesía.
 */
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import { assets } from "@/game/assets";

type HudState = { pulse: number; bond: number; memory: number; distance: number; chapter: number; message: string };
const emptyHud: HudState = { pulse: 3, bond: 62, memory: 0, distance: 0, chapter: 1, message: "La pampa aguarda tu juramento." };
type Action = "left" | "right" | "gallop" | "spirit";

function sendControl(action: Action, pressed: boolean) {
  window.dispatchEvent(new CustomEvent("legado:control", { detail: { action, pressed } }));
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
    window.addEventListener("legado:hud", onHud);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("legado:hud", onHud);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  const begin = () => {
    setExpeditionStarted(true);
    window.dispatchEvent(new Event("legado:started"));
  };
  const pressProps = (action: Action) => ({
    onPointerDown: () => sendControl(action, true),
    onPointerUp: () => sendControl(action, false),
    onPointerCancel: () => sendControl(action, false),
    onPointerLeave: () => sendControl(action, false),
  });

  return (
    <main className="game-shell" aria-label="Legado del Galope, travesía jugable">
      <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />
      <div className="vignette" aria-hidden="true" />

      <header className="expedition-bar">
        <div className="brand-lockup">
          <img src={assets.logo} alt="Emblema de sol partido y herradura" className="brand-mark" />
          <div>
            <p className="eyebrow">Crónica {String(hud.chapter).padStart(2, "0")}</p>
            <h1>Legado del Galope</h1>
          </div>
        </div>
        <button className="codex-trigger" onClick={() => setShowCodex((value) => !value)} aria-expanded={showCodex}>
          <span>◈</span> Códice
        </button>
      </header>

      <section className="hud-left" aria-label="Estado de la expedición">
        <div className="meter-label"><span>Pulso</span><span>{hud.pulse}/3</span></div>
        <div className="pulse-row" aria-label={`${hud.pulse} pulsos restantes`}>
          {[0, 1, 2].map((index) => <span className={`pulse ${index < hud.pulse ? "is-lit" : ""}`} key={index}>✦</span>)}
        </div>
        <div className="meter-label bond-label"><span>Vínculo de montura</span><span>{hud.bond}%</span></div>
        <div className="bond-track"><span style={{ width: `${hud.bond}%` }} /></div>
      </section>

      <section className="hud-right" aria-label="Registro de ruta">
        <div><span>Memorias</span><strong>{String(hud.memory).padStart(2, "0")}</strong></div>
        <div><span>Rumbo</span><strong>{String(hud.distance).padStart(3, "0")} m</strong></div>
        <p>◌ Este · estación sumergida</p>
      </section>

      <aside className="route-whisper"><span>Marca de ruta</span><p>{hud.message}</p></aside>

      {showCodex && (
        <aside className="codex-panel" aria-label="Códice del viajero">
          <button onClick={() => setShowCodex(false)} aria-label="Cerrar códice">×</button>
          <img src={assets.rider} alt="Viajero a caballo en la pampa" />
          <p className="eyebrow">Instrumento de ruta</p>
          <h2>Ensillá la memoria.</h2>
          <p>Las motas ámbar elevan el vínculo. Esquivá a los jinetes de ceniza y mantené tu huella sobre la ruta.</p>
          <div className="codex-keys"><span><b>← →</b> desviar</span><span><b>↑ / W</b> galopar</span><span><b>ESPACIO</b> vínculo</span></div>
        </aside>
      )}

      {!expeditionStarted && (
        <section className="threshold" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,9,20,.94) 0%, rgba(5,9,20,.58) 46%, rgba(5,9,20,.18) 100%), url(${assets.visualTarget})` }}>
          <div className="threshold-copy">
            <img src={assets.logo} alt="" className="threshold-mark" />
            <p className="eyebrow">Una travesía de frontera</p>
            <h2>El horizonte<br />recuerda tu nombre.</h2>
            <p>Recolectá recuerdos bajo la tormenta. Cada galope deja una marca que nadie puede borrar.</p>
            <button className="start-button" onClick={begin}>Ensillar la memoria <span>→</span></button>
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
          <button className="spirit-control" aria-label="Activar vínculo espiritual" {...pressProps("spirit")}>✦<small>Vínculo</small></button>
          <button className="gallop-control" aria-label="Galopar" {...pressProps("gallop")}>⌁<small>Galope</small></button>
        </div>
      </div>
    </main>
  );
}
