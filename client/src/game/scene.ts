/**
 * Diseño «El fiordo como tablero de destino»: acción isométrica ritual, no runner.
 * React sólo enmarca; Babylon posee cámara, mundo, combate, oleadas y estados de campaña.
 */
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

export type GameHandle = { scene: Scene; dispose: () => void };
type InputAction = "up" | "down" | "left" | "right";
type CastAction = "attack" | "isa" | "nauthiz" | "step";
type Support = "bjorn" | "hakon" | "astrid";
type Phase = "briefing" | "beach" | "store" | "ulf" | "council" | "defeat";

export type HudState = {
  hp: number; energy: number; shards: number; phase: number; enemies: number;
  bossHp: number; bossActive: boolean; objective: string; message: string;
  cooldowns: Record<CastAction, number>; supports: Record<Support, boolean>;
  victory: boolean; gameOver: boolean;
};

type Enemy = {
  root: TransformNode; hp: number; maxHp: number; speed: number; attackTimer: number;
  mark: number; frozen: number; alive: boolean; boss: boolean; telegraph: number; hurt: number;
};
type Projectile = { mesh: ReturnType<typeof MeshBuilder.CreateSphere>; velocity: Vector3; life: number; power: number };
type RuneZone = { mesh: ReturnType<typeof MeshBuilder.CreateDisc>; life: number; radius: number; kind: "isa" | "nauthiz" };

const AMBER = new Color3(0.89, 0.48, 0.16);
const ICE = new Color3(0.33, 0.63, 0.98);
const RED = new Color3(0.66, 0.09, 0.13);
const INK = new Color3(0.035, 0.06, 0.11);
const PEBBLE = new Color3(0.1, 0.12, 0.15);
const WOOD = new Color3(0.18, 0.12, 0.08);

function material(scene: Scene, name: string, diffuse: Color3, emissive = Color3.Black()) {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = diffuse;
  result.emissiveColor = emissive;
  result.specularColor = Color3.Black();
  return result;
}

function emitHud(state: HudState) { window.dispatchEvent(new CustomEvent("nornas:hud", { detail: state })); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

function makeIngrid(scene: Scene, cloth: StandardMaterial, skin: StandardMaterial, rune: StandardMaterial) {
  const root = new TransformNode("Ingrid la völva", scene);
  const cloak = MeshBuilder.CreateCylinder("capa de Ingrid", { height: 1.55, diameterTop: 0.48, diameterBottom: 1.05, tessellation: 7 }, scene);
  cloak.parent = root; cloak.position.y = 0.86; cloak.material = cloth;
  const head = MeshBuilder.CreateSphere("rostro de Ingrid", { diameter: 0.42, segments: 10 }, scene);
  head.parent = root; head.position.y = 1.72; head.material = skin;
  const staff = MeshBuilder.CreateCylinder("seiðstafr", { height: 1.95, diameter: 0.07, tessellation: 6 }, scene);
  staff.parent = root; staff.position.set(0.35, 0.95, 0.05); staff.rotation.z = -0.19; staff.material = rune;
  const ember = MeshBuilder.CreateSphere("runa de Urd", { diameter: 0.18, segments: 8 }, scene);
  ember.parent = root; ember.position.set(0.42, 1.95, 0.05); ember.material = rune;
  return { root, ember };
}

function makeEnemy(scene: Scene, name: string, position: Vector3, boss: boolean, raider: StandardMaterial, iron: StandardMaterial, danger: StandardMaterial): Enemy {
  const root = new TransformNode(name, scene);
  root.position = position.clone();
  const body = MeshBuilder.CreateCylinder(`${name} capa`, { height: boss ? 2.35 : 1.62, diameterTop: boss ? 0.56 : 0.4, diameterBottom: boss ? 1.26 : 0.82, tessellation: 6 }, scene);
  body.parent = root; body.position.y = boss ? 1.16 : 0.8; body.material = boss ? iron : raider;
  const head = MeshBuilder.CreateSphere(`${name} cabeza`, { diameter: boss ? 0.52 : 0.34, segments: 8 }, scene);
  head.parent = root; head.position.y = boss ? 2.2 : 1.5; head.material = boss ? danger : iron;
  const axe = MeshBuilder.CreateBox(`${name} hacha`, { width: boss ? 0.16 : 0.1, height: boss ? 1.55 : 1.05, depth: 0.12 }, scene);
  axe.parent = root; axe.position.set(boss ? 0.64 : 0.43, boss ? 1.2 : 0.86, 0); axe.rotation.z = -0.55; axe.material = iron;
  const halo = MeshBuilder.CreateTorus(`${name} marca`, { diameter: boss ? 1.95 : 1.2, thickness: 0.055, tessellation: 20 }, scene);
  halo.parent = root; halo.position.y = 0.05; halo.rotation.x = Math.PI / 2; halo.material = boss ? danger : raider;
  return { root, hp: boss ? 410 : 62, maxHp: boss ? 410 : 62, speed: boss ? 1.35 : 1.65, attackTimer: 0.8, mark: 0, frozen: 0, alive: true, boss, telegraph: 0, hurt: 0 };
}

function makeHouse(scene: Scene, x: number, z: number, width: number, depth: number, height: number, wood: StandardMaterial, roofMaterial: StandardMaterial) {
  const root = new TransformNode("arquitectura de Bjørndal", scene);
  root.position.set(x, 0, z);
  const base = MeshBuilder.CreateBox("sala larga", { width, depth, height }, scene);
  base.parent = root; base.position.y = height / 2; base.material = wood;
  const roofMesh = MeshBuilder.CreateCylinder("techo de turba", { diameter: width * 1.12, height: depth * 1.03, tessellation: 4 }, scene);
  roofMesh.parent = root; roofMesh.position.y = height + 0.48; roofMesh.scaling.z = 0.45; roofMesh.rotation.z = Math.PI / 4; roofMesh.material = roofMaterial;
  return root;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.018, 0.035, 0.075, 1);
  scene.fogMode = Scene.FOGMODE_EXP2; scene.fogDensity = 0.018; scene.fogColor = new Color3(0.08, 0.12, 0.19);
  const glow = new GlowLayer("resplandor de runas", scene, { blurKernelSize: 32 }); glow.intensity = 0.55;

  const camera = new FreeCamera("cámara de las Nornas", new Vector3(0, 18, -20), scene);
  camera.setTarget(new Vector3(0, 0, 2)); camera.minZ = 0.1; camera.fov = 0.78;
  const sky = new HemisphericLight("bruma del fiordo", new Vector3(0, 1, 0), scene);
  sky.diffuse = new Color3(0.33, 0.44, 0.65); sky.groundColor = new Color3(0.045, 0.05, 0.07); sky.intensity = 1.15;
  const fire = new DirectionalLight("luz del hogar", new Vector3(-0.4, -1, -0.25), scene);
  fire.diffuse = new Color3(1, 0.57, 0.28); fire.intensity = 1.1;

  const groundMat = material(scene, "guijarro negro", PEBBLE);
  const wood = material(scene, "madera húmeda", WOOD);
  const roofMat = material(scene, "turba y escarcha", new Color3(0.12, 0.17, 0.16));
  const cloak = material(scene, "capa de Ingrid", new Color3(0.12, 0.17, 0.23));
  const skin = material(scene, "rostro de Ingrid", new Color3(0.5, 0.34, 0.25));
  const rune = material(scene, "ámbar de Urd", new Color3(0.38, 0.2, 0.05), AMBER.scale(0.9));
  const raider = material(scene, "lana Jarnsmen", new Color3(0.22, 0.09, 0.1));
  const iron = material(scene, "hierro ennegrecido", new Color3(0.07, 0.085, 0.105));
  const danger = material(scene, "cochinilla de Ulf", new Color3(0.24, 0.02, 0.03), RED.scale(0.5));
  const iceMat = material(scene, "plata de Isa", new Color3(0.13, 0.23, 0.36), ICE.scale(0.8));

  const ground = MeshBuilder.CreateGround("Playa Negra", { width: 45, height: 40, subdivisions: 2 }, scene);
  ground.material = groundMat;
  const fjord = MeshBuilder.CreateGround("fiordo oscuro", { width: 54, height: 25 }, scene);
  fjord.position.z = 24; fjord.material = material(scene, "agua de fiordo", new Color3(0.025, 0.08, 0.15), new Color3(0.01, 0.025, 0.06));
  makeHouse(scene, -11, 6, 8, 6, 3.1, wood, roofMat);
  makeHouse(scene, 12, 7, 5.2, 4.7, 2.5, wood, roofMat);
  makeHouse(scene, 1, -11, 7.2, 5, 2.7, wood, roofMat);
  for (let i = -18; i <= 18; i += 3) {
    const post = MeshBuilder.CreateCylinder("empalizada", { height: 2.2, diameter: 0.25, tessellation: 6 }, scene);
    post.position.set(i, 1.1, 14.7); post.material = wood;
  }
  [-12, -6, 2, 9, 15].forEach((x, i) => {
    const brazier = MeshBuilder.CreateSphere("fuego de Bjørndal", { diameter: 0.32, segments: 8 }, scene);
    brazier.position.set(x, 1.28, i % 2 ? 8 : -4); brazier.material = rune;
  });
  const threadMat = [rune, iceMat, danger];
  [-1.5, 0, 1.5].forEach((x, index) => {
    const thread = MeshBuilder.CreateBox("hebra de destino", { width: 0.05, height: 0.04, depth: 25 }, scene);
    thread.position.set(x, 0.035, 1.5); thread.material = threadMat[index];
  });

  const player = makeIngrid(scene, cloak, skin, rune); player.root.position.set(0, 0, -4);
  const enemies: Enemy[] = [];
  const projectiles: Projectile[] = [];
  const zones: RuneZone[] = [];
  const drops: { mesh: ReturnType<typeof MeshBuilder.CreatePolyhedron>; picked: boolean }[] = [];
  const held: Record<InputAction, boolean> = { up: false, down: false, left: false, right: false };
  const cooldowns: Record<CastAction, number> = { attack: 0, isa: 0, nauthiz: 0, step: 0 };
  const supports: Record<Support, boolean> = { bjorn: false, hakon: false, astrid: false };
  let phase: Phase = new URLSearchParams(window.location.search).has("demo") ? "beach" : "briefing";
  let hp = 180; let energy = 100; let shards = 0; let started = phase !== "briefing"; let lastHud = 0; let storyTimer = 0;
  let message = started ? "Astrid: Ulf llega por la Playa Negra. La muralla no debe caer." : "Ingrid debe convertir la advertencia de Hagalaz en acción.";
  let dashVelocity = Vector3.Zero(); let invulnerable = 0;

  const spawnWave = (count: number, boss = false) => {
    for (let index = 0; index < count; index += 1) {
      const angle = (index / Math.max(1, count)) * Math.PI * 2 + 0.4;
      const radius = boss ? 11 : 9 + (index % 2) * 1.7;
      enemies.push(makeEnemy(scene, boss ? "Ulf el Sangriento" : `saqueador ${performance.now()} ${index}`, new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius + 1), boss, raider, iron, danger));
    }
  };
  if (started) spawnWave(6);

  const livingEnemies = () => enemies.filter((enemy) => enemy.alive);
  const nearestEnemy = (range = 99) => livingEnemies().sort((a, b) => Vector3.Distance(a.root.position, player.root.position) - Vector3.Distance(b.root.position, player.root.position)).find((enemy) => Vector3.Distance(enemy.root.position, player.root.position) <= range);
  const hurtEnemy = (enemy: Enemy, power: number, reason: string) => {
    if (!enemy.alive) return;
    const multiplier = enemy.mark > 0 ? 1.5 : 1;
    enemy.hp -= power * multiplier; enemy.hurt = 0.16;
    if (enemy.hp <= 0) {
      enemy.alive = false; enemy.root.setEnabled(false); shards += enemy.boss ? 8 : 1;
      const loot = MeshBuilder.CreatePolyhedron("fragmento rúnico", { type: 1, size: enemy.boss ? 0.5 : 0.25 }, scene);
      loot.position = enemy.root.position.add(new Vector3(0, 0.48, 0)); loot.material = enemy.boss ? rune : iceMat;
      drops.push({ mesh: loot, picked: false });
      message = enemy.boss ? "Ulf cae. Perthro revela el secreto: ningún pilar sostiene solo el hogar." : reason;
    }
  };
  const cast = (action: CastAction) => {
    if (!started || phase === "council" || phase === "defeat" || cooldowns[action] > 0) return;
    const target = nearestEnemy(action === "attack" ? 11 : 16);
    if (action === "attack" && target) {
      const orb = MeshBuilder.CreateSphere("Hilo de Urd", { diameter: 0.32, segments: 8 }, scene);
      orb.position = player.root.position.add(new Vector3(0, 1.1, 0)); orb.material = rune;
      const direction = target.root.position.add(new Vector3(0, 0.85, 0)).subtract(orb.position).normalize();
      projectiles.push({ mesh: orb, velocity: direction.scale(16), life: 1.2, power: 18 }); cooldowns.attack = 0.34;
      message = "Hilo de Urd: el destino del enemigo queda marcado.";
    }
    if (action === "isa" && energy >= 20) {
      energy -= 20; cooldowns.isa = 5;
      const disc = MeshBuilder.CreateDisc("Sello de Isa", { radius: 3.3, tessellation: 40 }, scene);
      disc.position = player.root.position.add(new Vector3(0, 0.055, 0)); disc.rotation.x = Math.PI / 2; disc.material = iceMat;
      zones.push({ mesh: disc, life: 2.6, radius: 3.3, kind: "isa" }); message = "Isa detiene el paso de los saqueadores.";
    }
    if (action === "nauthiz" && energy >= 36) {
      energy -= 36; cooldowns.nauthiz = 7;
      const disc = MeshBuilder.CreateDisc("Aguja de Nauthiz", { radius: 4.6, tessellation: 6 }, scene);
      disc.position = player.root.position.add(new Vector3(0, 0.06, 0)); disc.rotation.x = Math.PI / 2; disc.material = rune;
      zones.push({ mesh: disc, life: 0.42, radius: 4.6, kind: "nauthiz" }); message = "Nauthiz abre una ventana de necesidad.";
    }
    if (action === "step") {
      cooldowns.step = 3.4; invulnerable = 0.34;
      const movement = new Vector3((held.right ? 1 : 0) - (held.left ? 1 : 0), 0, (held.up ? 1 : 0) - (held.down ? 1 : 0));
      dashVelocity = (movement.lengthSquared() > 0 ? movement.normalize() : new Vector3(0, 0, 1)).scale(23);
      message = "Perthro: Ingrid atraviesa el borde de lo visible.";
    }
  };

  const onKey = (event: KeyboardEvent, down: boolean) => {
    const movements: Record<string, InputAction | undefined> = { w: "up", W: "up", ArrowUp: "up", s: "down", S: "down", ArrowDown: "down", a: "left", A: "left", ArrowLeft: "left", d: "right", D: "right", ArrowRight: "right" };
    const abilities: Record<string, CastAction | undefined> = { "1": "attack", "2": "isa", "3": "nauthiz", "4": "step", " ": "attack" };
    if (movements[event.key]) { event.preventDefault(); held[movements[event.key]!] = down; if (down) started = true; }
    if (down && !event.repeat && abilities[event.key]) { event.preventDefault(); started = true; cast(abilities[event.key]!); }
  };
  const onDown = (event: KeyboardEvent) => onKey(event, true);
  const onUp = (event: KeyboardEvent) => onKey(event, false);
  const onControl = (event: Event) => {
    const detail = (event as CustomEvent<{ action: InputAction; pressed: boolean }>).detail;
    if (detail) { held[detail.action] = detail.pressed; if (detail.pressed) started = true; }
  };
  const onCast = (event: Event) => { const action = (event as CustomEvent<CastAction>).detail; started = true; cast(action); };
  const onStart = () => { if (!started) { started = true; phase = "beach"; spawnWave(6); message = "Astrid: defendé la Playa Negra. Björn sostiene la muralla."; } };
  const onPointer = () => cast("attack");
  window.addEventListener("keydown", onDown); window.addEventListener("keyup", onUp); window.addEventListener("nornas:control", onControl); window.addEventListener("nornas:cast", onCast); window.addEventListener("nornas:started", onStart); canvas.addEventListener("pointerdown", onPointer);

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05); const time = performance.now() / 1000;
    if (!started) { player.root.rotation.y = Math.sin(time * 0.8) * 0.08; return; }
    const demo = new URLSearchParams(window.location.search).has("demo");
    const move = new Vector3((held.right ? 1 : 0) - (held.left ? 1 : 0) + (demo ? Math.sin(time * 0.7) * 0.48 : 0), 0, (held.up ? 1 : 0) - (held.down ? 1 : 0) + (demo ? Math.cos(time * 0.52) * 0.22 : 0));
    if (move.lengthSquared() > 0) { move.normalize(); player.root.position.addInPlace(move.scale(dt * 6.2)); player.root.rotation.y = Math.atan2(move.x, move.z); }
    if (dashVelocity.lengthSquared() > 0.01) { player.root.position.addInPlace(dashVelocity.scale(dt)); dashVelocity = dashVelocity.scale(Math.max(0, 1 - dt * 7)); }
    player.root.position.x = clamp(player.root.position.x, -18, 18); player.root.position.z = clamp(player.root.position.z, -13, 13);
    player.ember.scaling.setAll(1 + Math.sin(time * 5) * 0.12);
    invulnerable = Math.max(0, invulnerable - dt); energy = Math.min(100, energy + dt * 8.5);
    (Object.keys(cooldowns) as CastAction[]).forEach((key) => { cooldowns[key] = Math.max(0, cooldowns[key] - dt); });
    if (demo && Math.sin(time * 2.1) > 0.93) cast("attack"); if (demo && Math.sin(time * 0.7) > 0.98) cast("isa"); if (demo && Math.sin(time * 0.41) > 0.99) cast("nauthiz");

    projectiles.forEach((projectile, index) => {
      projectile.mesh.position.addInPlace(projectile.velocity.scale(dt)); projectile.life -= dt;
      const hit = livingEnemies().find((enemy) => Vector3.Distance(enemy.root.position.add(new Vector3(0, 0.8, 0)), projectile.mesh.position) < 0.75);
      if (hit) { hit.mark = 3.8; hurtEnemy(hit, projectile.power, "El hilo encuentra una abertura."); projectile.life = 0; }
      if (projectile.life <= 0) { projectile.mesh.dispose(); projectiles.splice(index, 1); }
    });
    zones.forEach((zone, index) => {
      zone.life -= dt; zone.mesh.scaling.setAll(1 + Math.sin(time * 9) * 0.03);
      livingEnemies().forEach((enemy) => {
        if (Vector3.Distance(enemy.root.position, zone.mesh.position) < zone.radius) {
          if (zone.kind === "isa") enemy.frozen = Math.max(enemy.frozen, 0.16);
          else hurtEnemy(enemy, dt * 105, "La necesidad corta más hondo sobre una marca.");
        }
      });
      if (zone.life <= 0) { zone.mesh.dispose(); zones.splice(index, 1); }
    });
    drops.forEach((drop) => {
      if (!drop.picked) { drop.mesh.position.y = 0.45 + Math.sin(time * 3 + drop.mesh.position.x) * 0.12; drop.mesh.rotation.y += dt * 2;
        if (Vector3.Distance(drop.mesh.position, player.root.position) < 1.3) { drop.picked = true; shards += 1; energy = Math.min(100, energy + 16); drop.mesh.dispose(); message = "Fragmento de runa: el hilo recupera su fuerza."; }
      }
    });
    livingEnemies().forEach((enemy) => {
      enemy.mark = Math.max(0, enemy.mark - dt); enemy.frozen = Math.max(0, enemy.frozen - dt); enemy.hurt = Math.max(0, enemy.hurt - dt);
      const distance = Vector3.Distance(enemy.root.position, player.root.position); const direction = player.root.position.subtract(enemy.root.position).normalize();
      if (enemy.frozen <= 0) {
        if (enemy.boss && enemy.telegraph <= 0 && distance < 4.6 && enemy.attackTimer <= 0) { enemy.telegraph = 1.15; enemy.attackTimer = 3.4; message = "Ulf alza el hacha. Atravesá el golpe con Perthro."; }
        if (enemy.telegraph > 0) { enemy.telegraph -= dt; const scale = 1 + (1.15 - enemy.telegraph) * 2.8; enemy.root.getChildMeshes().forEach((mesh) => { if (mesh.name.includes("marca")) mesh.scaling.setAll(scale); });
          if (enemy.telegraph <= 0 && distance < 4.7 && invulnerable <= 0) { hp -= 33; message = "El hacha de Ulf abre la playa."; }
        } else if (distance > (enemy.boss ? 2.3 : 1.1)) enemy.root.position.addInPlace(direction.scale(dt * enemy.speed));
        else if (enemy.attackTimer <= 0 && invulnerable <= 0) { hp -= enemy.boss ? 17 : 7; enemy.attackTimer = enemy.boss ? 2.5 : 1.1; message = "Los Jarnsmen presionan la muralla."; }
      }
      enemy.attackTimer -= dt; enemy.root.rotation.y = Math.atan2(direction.x, direction.z);
    });
    if (hp <= 0) { hp = 0; phase = "defeat"; message = "Ingrid cae. Hagalaz exige una nueva lectura."; }
    const alive = livingEnemies();
    if (phase === "beach" && alive.length === 0) { phase = "store"; supports.bjorn = true; message = "Björn: la playa aguanta. Hakon avisa de una ruta por el acantilado."; spawnWave(7); }
    if (phase === "store" && alive.length === 0) { phase = "ulf"; supports.hakon = true; message = "Hakon: el almacén resiste. Ulf viene a romper la muralla."; spawnWave(1, true); }
    if (phase === "ulf" && alive.length === 0) { phase = "council"; supports.astrid = true; message = "Astrid: Bjørndal sobrevive porque nadie sostuvo el fuego a solas."; }
    camera.position.x += (player.root.position.x * 0.48 - camera.position.x) * dt * 2.8;
    camera.position.z += (player.root.position.z - 20 - camera.position.z) * dt * 2.8;
    camera.setTarget(player.root.position.add(new Vector3(0, 0, 2.4)));
    if (time - lastHud > 0.11) { lastHud = time; const boss = enemies.find((enemy) => enemy.boss); emitHud({ hp: Math.round(hp), energy: Math.round(energy), shards, phase: phase === "beach" ? 1 : phase === "store" ? 2 : phase === "ulf" ? 3 : 4, enemies: alive.filter((enemy) => !enemy.boss).length, bossHp: boss?.alive ? Math.max(0, Math.round(boss.hp)) : 0, bossActive: Boolean(boss?.alive), objective: phase === "beach" ? "Defendé la muralla de escudos" : phase === "store" ? "Protegé el almacén con Hakon" : phase === "ulf" ? "Derrotá a Ulf el Sangriento" : phase === "council" ? "Escuchá el juramento del Consejo de Tres" : phase === "defeat" ? "Volvé a tejer la lectura" : "Comenzá la lectura de Hagalaz", message, cooldowns: { ...cooldowns }, supports: { ...supports }, victory: phase === "council", gameOver: phase === "defeat" }); }
  });

  emitHud({ hp, energy, shards, phase: 0, enemies: 0, bossHp: 0, bossActive: false, objective: "Comenzá la lectura de Hagalaz", message, cooldowns, supports, victory: false, gameOver: false });
  return { scene, dispose: () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); window.removeEventListener("nornas:control", onControl); window.removeEventListener("nornas:cast", onCast); window.removeEventListener("nornas:started", onStart); canvas.removeEventListener("pointerdown", onPointer); glow.dispose(); scene.dispose(); } };
}
