/**
 * Diseño «El fiordo como tablero de destino»: HUD de RPG táctico, con el campo de batalla libre en el centro.
 * React enmarca la campaña; Babylon administra todas las reglas de combate y escena.
 */
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle, type HudState } from "@/game/scene";
import { assets } from "@/game/assets";

type Move = "up" | "down" | "left" | "right";
type Spell = "attack" | "isa" | "nauthiz" | "step";
const emptyHud: HudState = { hp: 180, energy: 100, shards: 0, phase: 0, enemies: 0, bossHp: 0, bossActive: false, objective: "Comenzá la lectura de Hagalaz", message: "Ingrid escucha el hilo del fiordo.", cooldowns: { attack: 0, isa: 0, nauthiz: 0, step: 0 }, supports: { bjorn: false, hakon: false, astrid: false }, victory: false, gameOver: false };

function move(action: Move, pressed: boolean) { window.dispatchEvent(new CustomEvent("nornas:control", { detail: { action, pressed } })); }
function cast(action: Spell) { window.dispatchEvent(new CustomEvent("nornas:cast", { detail: action })); }

const spells: { key: Spell; number: string; rune: string; name: string; description: string; hue: string }[] = [
  { key: "attack", number: "1", rune: "ᚢ", name: "Hilo de Urd", description: "Marca", hue: "amber" },
  { key: "isa", number: "2", rune: "ᛁ", name: "Isa", description: "Hielo", hue: "ice" },
  { key: "nauthiz", number: "3", rune: "ᚾ", name: "Nauthiz", description: "Necesidad", hue: "amber" },
  { key: "step", number: "4", rune: "ᛈ", name: "Perthro", description: "Paso", hue: "red" },
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null); const mounted = useRef(false);
  const [hud, setHud] = useState<HudState>(emptyHud); const [started, setStarted] = useState(() => new URLSearchParams(window.location.search).has("demo")); const [open, setOpen] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || mounted.current) return; mounted.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true }); let handle: GameHandle | null = null; let disposed = false;
    createGameScene(engine, canvas).then((next) => { if (disposed) { next.dispose(); return; } handle = next; engine.runRenderLoop(() => next.scene.render()); });
    const resize = () => engine.resize(); const update = (event: Event) => setHud((event as CustomEvent<HudState>).detail);
    window.addEventListener("resize", resize); window.addEventListener("nornas:hud", update);
    return () => { disposed = true; window.removeEventListener("resize", resize); window.removeEventListener("nornas:hud", update); handle?.dispose(); engine.dispose(); mounted.current = false; };
  }, []);
  const begin = () => { setStarted(true); window.dispatchEvent(new Event("nornas:started")); };
  const press = (action: Move) => ({ onPointerDown: () => move(action, true), onPointerUp: () => move(action, false), onPointerLeave: () => move(action, false), onPointerCancel: () => move(action, false) });
  return <main className="rpg-shell" aria-label="El Hilo de las Nornas, RPG de acción isométrico">
    <canvas ref={canvasRef} className="rpg-canvas" style={{ touchAction: "none" }} /><div className="rpg-vignette" aria-hidden="true" />
    <header className="rpg-topbar"><div className="title-lockup"><img src={assets.logo} alt="Sello de las Nornas" /><div><p>LA PRUEBA DE NAUTHIZ · ACTO {hud.phase || 1}</p><h1>El Hilo de las Nornas</h1></div></div><button onClick={() => setOpen((value) => !value)} className="codex-button">ᛟ <span>Códice</span></button></header>
    <section className="player-frame" aria-label="Estado de Ingrid"><img src={assets.ingrid} alt="Ingrid, völva de Bjørndal" /><div className="portrait-rune">ᛜ</div><div className="player-vitals"><div className="character-name"><strong>Ingrid</strong><span>Völva de Bjørndal</span></div><div className="vital-line"><b>VIDA</b><i><em style={{ width: `${Math.max(0, hud.hp / 1.8)}%` }} /></i><span>{hud.hp}</span></div><div className="vital-line energy"><b>SEIÐR</b><i><em style={{ width: `${hud.energy}%` }} /></i><span>{hud.energy}</span></div></div></section>
    <aside className="quest-panel"><p>JURAMENTO DEL ÞING</p><h2>{hud.objective}</h2><div className="quest-meta"><span>ᛟ Fragmentos {hud.shards}</span><span>ᛉ Saqueadores {hud.enemies}</span></div></aside>
    {hud.bossActive && <section className="boss-bar"><div><img src={assets.ulf} alt="" /><strong>ULF EL SANGRIENTO</strong><small>Jarl de los Jarnsmen</small></div><i><em style={{ width: `${Math.max(0, hud.bossHp / 4.1)}%` }} /></i><span>{hud.bossHp} / 410</span></section>}
    <aside className="rune-whisper"><span>LECTURA DE INGRID</span><p>{hud.message}</p></aside>
    <section className="support-row" aria-label="Apoyos del clan">{(["bjorn", "hakon", "astrid"] as const).map((support) => <div key={support} className={hud.supports[support] ? "support unlocked" : "support"}><b>{support === "bjorn" ? "ᚢ" : support === "hakon" ? "ᚨ" : "ᛟ"}</b><span>{support === "bjorn" ? "Puño de Björn" : support === "hakon" ? "Ojo de Hakon" : "Corazón de Astrid"}</span></div>)}</section>
    <section className="spellbar" aria-label="Habilidades de Ingrid">{spells.map((spell) => <button key={spell.key} className={`spell ${spell.hue} ${hud.cooldowns[spell.key] > 0 ? "cooling" : ""}`} onClick={() => cast(spell.key)}><span className="spell-key">{spell.number}</span><b>{spell.rune}</b><strong>{spell.name}</strong><small>{hud.cooldowns[spell.key] > 0 ? `${hud.cooldowns[spell.key].toFixed(1)} s` : spell.description}</small></button>)}</section>
    {open && <aside className="codex-sheet"><button onClick={() => setOpen(false)} aria-label="Cerrar códice">×</button><img src={assets.ingrid} alt="Ingrid ante el fiordo" /><p>CRÓNICA DE BJØRNDAL</p><h2>Isa. Nauthiz. Perthro.</h2><blockquote>El hielo, la necesidad y el secreto no coronan a un hombre: exigen que el clan aprenda a sostenerse unido.</blockquote><div><b>1 / Espacio</b> Hilo de Urd · <b>2</b> Isa · <b>3</b> Nauthiz · <b>4</b> Perthro</div></aside>}
    {!started && <section className="rpg-threshold" style={{ backgroundImage: `linear-gradient(90deg, rgba(3,8,18,.96) 0%, rgba(3,8,18,.65) 43%, rgba(3,8,18,.16) 100%), url(${assets.visualTarget})` }}><div className="threshold-runes"><i>ᛁ</i><i>ᚾ</i><i>ᛈ</i></div><div><img src={assets.logo} alt="" /><p>CAPÍTULOS X–XIII · LA SAGA COBRA VIDA</p><h2>El secreto no<br />es un hombre.</h2><h3>Es un clan que aprende a luchar como uno solo.</h3><button onClick={begin}>Defender Bjørndal <span>→</span></button><small>PC: WASD + 1–4 · Móvil: runas y pad táctil</small></div></section>}
    {(hud.victory || hud.gameOver) && <section className="result-screen"><div><p>{hud.victory ? "EL TEJIDO REPARADO" : "HAGALAZ"}</p><h2>{hud.victory ? "El Consejo de Tres se alza." : "La lectura debe comenzar de nuevo."}</h2><span>{hud.victory ? "Björn, Hakon y Astrid sostienen Bjørndal juntos." : "La necesidad no perdona una lectura incompleta."}</span><button onClick={() => window.location.reload()}>{hud.victory ? "Jugar la próxima saga" : "Volver al fiordo"}</button></div></section>}
    <div className="touch-move" aria-label="Movimiento táctil"><button {...press("up")}>▲</button><button {...press("left")}>◀</button><button {...press("down")}>▼</button><button {...press("right")}>▶</button></div><div className="touch-spells">{spells.map((spell) => <button key={spell.key} onClick={() => cast(spell.key)} className={spell.hue}>{spell.rune}</button>)}</div>
  </main>;
}
