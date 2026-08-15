/**
 * Estilo «El Hilo de las Nornas»: una pampa-telar de tormenta, hierro y tres hebras de destino.
 * La escena usa siluetas claras, nudos de luz y materia procedimental para conservar legibilidad a velocidad de galope.
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
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Layer } from "@babylonjs/core/Layers/layer";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { assets } from "./assets";

export type GameHandle = { scene: Scene; dispose: () => void };

type InputAction = "left" | "right" | "gallop" | "spirit";
type HudState = {
  pulse: number;
  bond: number;
  memory: number;
  distance: number;
  chapter: number;
  message: string;
};

const AMBER = new Color3(0.91, 0.47, 0.12);
const STORM = new Color3(0.045, 0.07, 0.13);
const EARTH = new Color3(0.22, 0.12, 0.07);
const MOON_THREAD = new Color3(0.22, 0.42, 0.78);
const COCHINEAL_THREAD = new Color3(0.58, 0.09, 0.13);

function makeMaterial(scene: Scene, name: string, color: Color3, emissive?: Color3) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.specularColor = Color3.Black();
  material.emissiveColor = emissive ?? Color3.Black();
  return material;
}

function makeHorse(scene: Scene) {
  const root = new TransformNode("montura", scene);
  const horse = makeMaterial(scene, "cuero oscuro", new Color3(0.16, 0.07, 0.035));
  const cloth = makeMaterial(scene, "poncho", new Color3(0.08, 0.11, 0.15));
  const leather = makeMaterial(scene, "montura cuero", new Color3(0.27, 0.12, 0.05));
  const glow = makeMaterial(scene, "brasa", AMBER, AMBER.scale(0.45));

  const body = MeshBuilder.CreateBox("cuerpo", { width: 1.25, height: 0.7, depth: 2.3 }, scene);
  body.parent = root;
  body.position.y = 1.45;
  body.material = horse;

  const neck = MeshBuilder.CreateBox("cuello", { width: 0.54, height: 1.1, depth: 0.62 }, scene);
  neck.parent = root;
  neck.position.set(0, 2.1, 0.9);
  neck.rotation.x = -0.5;
  neck.material = horse;

  const head = MeshBuilder.CreateBox("cabeza", { width: 0.52, height: 0.52, depth: 0.78 }, scene);
  head.parent = root;
  head.position.set(0, 2.44, 1.25);
  head.material = horse;

  const saddle = MeshBuilder.CreateBox("silla", { width: 0.82, height: 0.16, depth: 0.8 }, scene);
  saddle.parent = root;
  saddle.position.set(0, 1.92, -0.22);
  saddle.material = leather;

  const rider = MeshBuilder.CreateCylinder("viajero", { height: 1.15, diameterTop: 0.34, diameterBottom: 0.72, tessellation: 6 }, scene);
  rider.parent = root;
  rider.position.set(0, 2.46, -0.22);
  rider.material = cloth;

  const hat = MeshBuilder.CreateCylinder("sombrero", { height: 0.15, diameter: 0.9, tessellation: 12 }, scene);
  hat.parent = root;
  hat.position.set(0, 3.12, -0.22);
  hat.material = leather;

  const legs: AbstractMesh[] = [];
  for (const [x, z] of [[-0.43, -0.78], [0.43, -0.78], [-0.43, 0.78], [0.43, 0.78]]) {
    const leg = MeshBuilder.CreateCylinder("casco", { height: 1.25, diameter: 0.17, tessellation: 6 }, scene);
    leg.parent = root;
    leg.position.set(x, 0.62, z);
    leg.material = horse;
    legs.push(leg);
  }

  const talisman = MeshBuilder.CreateSphere("talisman", { diameter: 0.2, segments: 8 }, scene);
  talisman.parent = root;
  talisman.position.set(0, 2.42, -0.82);
  talisman.material = glow;
  return { root, legs, talisman };
}

function emitHud(state: HudState) {
  window.dispatchEvent(new CustomEvent("nornas:hud", { detail: state }));
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.025, 0.04, 0.09, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogColor = new Color3(0.06, 0.075, 0.12);
  scene.fogDensity = 0.005;

  const backdrop = new Layer("horizonte de memoria", assets.panorama, scene, true);
  backdrop.color = new Color4(0.78, 0.84, 1, 0.38);
  const glow = new GlowLayer("resplandor mineral", scene, { blurKernelSize: 42 });
  glow.intensity = 0.5;

  const camera = new FreeCamera("camara de travesia", new Vector3(0, 8.3, -19), scene);
  camera.setTarget(new Vector3(0, 1.3, 11));
  camera.minZ = 0.1;
  camera.fov = 0.82;

  const skyLight = new HemisphericLight("cielo tormenta", new Vector3(0, 1, 0), scene);
  skyLight.diffuse = new Color3(0.32, 0.4, 0.6);
  skyLight.groundColor = new Color3(0.08, 0.035, 0.018);
  skyLight.intensity = 1.2;
  const sunLight = new DirectionalLight("sol hendido", new Vector3(-0.18, -0.65, -0.4), scene);
  sunLight.diffuse = new Color3(1, 0.58, 0.24);
  sunLight.intensity = 1.65;

  const ground = MeshBuilder.CreateGround("tierra de ruta", { width: 34, height: 240, subdivisions: 1 }, scene);
  ground.position.z = 105;
  ground.material = makeMaterial(scene, "tierra tostada", EARTH);

  const pathMaterial = makeMaterial(scene, "sendero de polvo", new Color3(0.38, 0.2, 0.09));
  const horizonMaterial = makeMaterial(scene, "horizonte tormenta", new Color3(0.055, 0.09, 0.16), new Color3(0.013, 0.022, 0.05));
  horizonMaterial.backFaceCulling = false;
  const skyPlate = MeshBuilder.CreatePlane("cielo de tormenta", { width: 94, height: 50 }, scene);
  skyPlate.position.set(0, 19, 108);
  skyPlate.material = horizonMaterial;

  const hillMaterials = [
    makeMaterial(scene, "loma lejana", new Color3(0.07, 0.1, 0.14)),
    makeMaterial(scene, "loma media", new Color3(0.09, 0.085, 0.09)),
    makeMaterial(scene, "loma ceniza", new Color3(0.12, 0.08, 0.065)),
  ];
  [
    { x: -16, z: 122, width: 26, height: 1.2, depth: 3, material: 0 },
    { x: 14, z: 127, width: 33, height: 1.55, depth: 3, material: 0 },
    { x: -3, z: 116, width: 30, height: 1.15, depth: 2.5, material: 1 },
    { x: 21, z: 112, width: 20, height: 0.95, depth: 2.5, material: 1 },
    { x: -20, z: 108, width: 23, height: 0.72, depth: 2.3, material: 2 },
  ].forEach((hill, index) => {
    const mesh = MeshBuilder.CreateBox(`loma ${index}`, { width: hill.width, height: hill.height, depth: hill.depth }, scene);
    mesh.position.set(hill.x, hill.height / 2, hill.z);
    mesh.material = hillMaterials[hill.material];
  });

  const iron = makeMaterial(scene, "hierro de estación", new Color3(0.11, 0.1, 0.09));
  const station = new TransformNode("estación hundida", scene);
  station.position.set(-10.8, 0, 111);
  const stationBase = MeshBuilder.CreateBox("andén", { width: 6.5, height: 0.55, depth: 1.7 }, scene);
  stationBase.parent = station;
  stationBase.position.y = 0.3;
  stationBase.material = iron;
  const stationRoof = MeshBuilder.CreateBox("techo de estación", { width: 7.4, height: 0.2, depth: 2.1 }, scene);
  stationRoof.parent = station;
  stationRoof.position.y = 3.2;
  stationRoof.material = iron;
  [-2.8, 0, 2.8].forEach((x) => {
    const post = MeshBuilder.CreateCylinder("poste de estación", { height: 3.1, diameter: 0.22, tessellation: 6 }, scene);
    post.parent = station;
    post.position.set(x, 1.55, 0);
    post.material = iron;
  });
  const rails = makeMaterial(scene, "riel enterrado", new Color3(0.18, 0.12, 0.08));
  [-3.35, 3.35].forEach((x) => {
    const rail = MeshBuilder.CreateBox("riel de la ruta", { width: 0.12, height: 0.07, depth: 210 }, scene);
    rail.position.set(x, 0.06, 98);
    rail.material = rails;
  });
  for (let z = 5; z < 190; z += 4) {
    const sleeper = MeshBuilder.CreateBox("durmiente enterrado", { width: 7.15, height: 0.035, depth: 0.22 }, scene);
    sleeper.position.set(0, 0.045, z);
    sleeper.material = rails;
  }
  const threadMaterials = [
    makeMaterial(scene, "hilo del acto", AMBER.scale(0.5), AMBER.scale(0.8)),
    makeMaterial(scene, "hilo del origen", MOON_THREAD.scale(0.45), MOON_THREAD.scale(0.65)),
    makeMaterial(scene, "hilo de la deriva", COCHINEAL_THREAD.scale(0.42), COCHINEAL_THREAD.scale(0.63)),
  ];
  const threads = [-2.05, 0, 2.05].map((x, index) => {
    const thread = MeshBuilder.CreateBox("hebra de destino", { width: 0.095, height: 0.045, depth: 205 }, scene);
    thread.position.set(x, 0.12, 99);
    thread.material = threadMaterials[index];
    return thread;
  });
  const knots = [
    { x: -2.05, z: 18, color: 0 }, { x: 0, z: 34, color: 1 }, { x: 2.05, z: 51, color: 2 },
    { x: -2.05, z: 74, color: 1 }, { x: 0, z: 91, color: 0 },
  ].map((node) => {
    const knot = MeshBuilder.CreateTorus("nudo de destino", { diameter: 0.55, thickness: 0.09, tessellation: 16 }, scene);
    knot.position.set(node.x, 0.42, node.z);
    knot.rotation.x = Math.PI / 2;
    knot.material = threadMaterials[node.color];
    return knot;
  });
  for (let i = 0; i < 34; i += 1) {
    const mark = MeshBuilder.CreateBox("cicatriz de ferrocarril", { width: 0.075, height: 0.025, depth: 4.6 }, scene);
    mark.position.set(i % 2 ? -7.9 : 7.9, 0.025, i * 7);
    mark.material = pathMaterial;
  }

  const sun = MeshBuilder.CreateDisc("sol partido", { radius: 6.3, tessellation: 48 }, scene);
  sun.position.set(-9.5, 5.6, 106);
  const sunMaterial = makeMaterial(scene, "ambar de horizonte", AMBER, AMBER.scale(0.85));
  sunMaterial.backFaceCulling = false;
  sun.material = sunMaterial;
  const sunScar = MeshBuilder.CreatePlane("corte del sol", { width: 14, height: 0.42 }, scene);
  sunScar.position.set(-9.5, 5.6, 105.85);
  sunScar.material = makeMaterial(scene, "herida del sol", new Color3(0.035, 0.05, 0.09));

  const horse = makeHorse(scene);
  horse.root.position.set(0, 0, 0);

  const ghostMaterial = makeMaterial(scene, "hueso espectral", new Color3(0.54, 0.58, 0.51), new Color3(0.04, 0.08, 0.05));
  const lanternMaterial = makeMaterial(scene, "linterna cardo", new Color3(0.13, 0.27, 0.17), new Color3(0.14, 0.55, 0.27));
  const enemies = [
    { x: -3.9, z: 31, mesh: new TransformNode("jinete de ceniza", scene), phase: 0 },
    { x: 4.5, z: 59, mesh: new TransformNode("jinete de ceniza", scene), phase: 1.5 },
    { x: -1.2, z: 86, mesh: new TransformNode("jinete de ceniza", scene), phase: 2.8 },
  ];
  enemies.forEach((enemy) => {
    const robe = MeshBuilder.CreateCylinder("poncho espectral", { height: 2.35, diameterTop: 0.32, diameterBottom: 1.15, tessellation: 6 }, scene);
    robe.parent = enemy.mesh;
    robe.position.y = 1.2;
    robe.material = ghostMaterial;
    const lamp = MeshBuilder.CreateSphere("farol verde", { diameter: 0.35, segments: 8 }, scene);
    lamp.parent = enemy.mesh;
    lamp.position.set(0.52, 1.2, 0);
    lamp.material = lanternMaterial;
    enemy.mesh.position.set(enemy.x, 0, enemy.z);
  });

  const moteMaterial = makeMaterial(scene, "motas ámbar", AMBER, AMBER);
  const motes = [
    { x: -4.2, z: 13, mesh: MeshBuilder.CreateSphere("mota de memoria", { diameter: 0.44, segments: 8 }, scene), taken: false },
    { x: 2.8, z: 22, mesh: MeshBuilder.CreateSphere("mota de memoria", { diameter: 0.44, segments: 8 }, scene), taken: false },
    { x: -1.8, z: 40, mesh: MeshBuilder.CreateSphere("mota de memoria", { diameter: 0.44, segments: 8 }, scene), taken: false },
    { x: 4.7, z: 49, mesh: MeshBuilder.CreateSphere("mota de memoria", { diameter: 0.44, segments: 8 }, scene), taken: false },
    { x: -4.8, z: 68, mesh: MeshBuilder.CreateSphere("mota de memoria", { diameter: 0.44, segments: 8 }, scene), taken: false },
    { x: 1.5, z: 79, mesh: MeshBuilder.CreateSphere("mota de memoria", { diameter: 0.44, segments: 8 }, scene), taken: false },
    { x: 0.3, z: 96, mesh: MeshBuilder.CreateSphere("mota de memoria", { diameter: 0.44, segments: 8 }, scene), taken: false },
  ];
  motes.forEach((mote, index) => {
    mote.mesh.position.set(mote.x, 1.15 + (index % 2) * 0.25, mote.z);
    mote.mesh.material = moteMaterial;
  });

  const held: Record<InputAction, boolean> = { left: false, right: false, gallop: false, spirit: false };
  let started = new URLSearchParams(window.location.search).has("demo");
  let pulse = 3;
  let bond = 62;
  let memory = 0;
  let distance = 0;
  let chapter = 1;
  let lastHud = 0;
  let recovery = 0;
  let story = started ? "El hilo del acto tiembla bajo tus cascos." : "Las tres hebras esperan tu paso.";

  const onKey = (event: KeyboardEvent, isDown: boolean) => {
    const map: Record<string, InputAction | undefined> = {
      ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "gallop", w: "gallop", W: "gallop", " ": "spirit",
    };
    const action = map[event.key];
    if (!action) return;
    event.preventDefault();
    held[action] = isDown;
    if (isDown) started = true;
  };
  const onDown = (event: KeyboardEvent) => onKey(event, true);
  const onUp = (event: KeyboardEvent) => onKey(event, false);
  const onControl = (event: Event) => {
    const detail = (event as CustomEvent<{ action: InputAction; pressed: boolean }>).detail;
    if (!detail) return;
    held[detail.action] = detail.pressed;
    if (detail.pressed) started = true;
  };
  const onStart = () => { started = true; story = "Las Nornas tensan la urdimbre bajo tus cascos."; };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("nornas:control", onControl);
  window.addEventListener("nornas:started", onStart);

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    const time = performance.now() / 1000;
    sun.rotation.z = Math.sin(time * 0.08) * 0.02;
    threads.forEach((thread, index) => { thread.position.y = 0.12 + Math.sin(time * 2.1 + index * 1.7) * 0.025; });
    knots.forEach((knot, index) => { knot.rotation.z += dt * (index % 2 ? -0.8 : 0.8); knot.position.y = 0.43 + Math.sin(time * 2.4 + index) * 0.08; });
    motes.forEach((mote, index) => {
      if (!mote.taken) {
        mote.mesh.position.y = 1.15 + Math.sin(time * 2.2 + index) * 0.2;
        mote.mesh.rotation.y += dt * 2.4;
      }
    });
    enemies.forEach((enemy) => {
      enemy.mesh.position.x = enemy.x + Math.sin(time * 1.2 + enemy.phase) * 0.65;
      enemy.mesh.position.y = Math.sin(time * 2 + enemy.phase) * 0.18;
    });

    if (!started) {
      horse.root.rotation.y = Math.sin(time * 0.45) * 0.045;
      return;
    }

    const autoPilot = new URLSearchParams(window.location.search).has("demo");
    const steer = (held.left ? -1 : 0) + (held.right ? 1 : 0) + (autoPilot ? Math.sin(time * 0.82) * 0.42 : 0);
    const speed = held.gallop || autoPilot ? 13.5 : 8.3;
    horse.root.position.x = Math.max(-4.7, Math.min(4.7, horse.root.position.x + steer * dt * 7.1));
    horse.root.position.z += speed * dt;
    horse.root.rotation.z = -steer * 0.09;
    horse.root.rotation.y = steer * -0.1;
    const stride = time * speed * 1.35;
    horse.legs.forEach((leg, index) => { leg.rotation.x = Math.sin(stride + (index % 2 ? Math.PI : 0)) * 0.68; });
    horse.talisman.scaling.setAll(1 + Math.sin(time * 4) * 0.11);

    camera.position.x += (horse.root.position.x * 0.18 - camera.position.x) * dt * 2.5;
    camera.position.z += (horse.root.position.z - 19 - camera.position.z) * dt * 2.7;
    camera.setTarget(new Vector3(horse.root.position.x * 0.2, 1.5, horse.root.position.z + 11));
    distance = Math.floor(horse.root.position.z);
    recovery = Math.max(0, recovery - dt);

    motes.forEach((mote) => {
      if (!mote.taken && Vector3.Distance(mote.mesh.position, horse.root.position.add(new Vector3(0, 1, 0))) < 1.9) {
        mote.taken = true;
        mote.mesh.setEnabled(false);
        memory += 1;
        bond = Math.min(100, bond + 8);
        story = "Un nudo se afloja: el futuro todavía puede cambiar.";
      }
    });
    enemies.forEach((enemy) => {
      if (recovery <= 0 && Vector3.Distance(enemy.mesh.position, horse.root.position) < 2.1) {
        pulse = Math.max(0, pulse - 1);
        recovery = 1.25;
        story = pulse > 0 ? "Un cortador de hilos quiso cerrar la trama." : "La urdimbre te devuelve al último nudo.";
        if (pulse === 0) {
          pulse = 3;
          horse.root.position.z = Math.max(0, horse.root.position.z - 16);
        }
      }
    });
    if (held.spirit) {
      bond = Math.max(0, bond - dt * 11);
      horse.talisman.scaling.setAll(1.65 + Math.sin(time * 18) * 0.2);
      story = "El hilo del acto arde bajo los cascos.";
    } else {
      bond = Math.min(100, bond + dt * 2.2);
    }
    if (horse.root.position.z > 108) {
      chapter += 1;
      horse.root.position.z = 0;
      motes.forEach((mote) => { mote.taken = false; mote.mesh.setEnabled(true); });
      story = "La trama se repliega. Otra Norna comienza a leer tu paso.";
    }
    if (time - lastHud > 0.12) {
      lastHud = time;
      emitHud({ pulse, bond: Math.round(bond), memory, distance, chapter, message: story });
    }
  });

  emitHud({ pulse, bond, memory, distance, chapter, message: story });
  return {
    scene,
    dispose: () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("nornas:control", onControl);
      window.removeEventListener("nornas:started", onStart);
      backdrop.dispose();
      glow.dispose();
      scene.dispose();
    },
  };
}
