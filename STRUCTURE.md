# Structure: El Hilo de las Nornas — Action RPG Isométrico

React contiene el marco y el HUD; Babylon contiene mundo, combate y cámara. El contrato se mantiene como `createGameScene(engine, canvas): Promise<GameHandle>` y todos los eventos se emiten como `nornas:*`.

| Módulo | Responsabilidad |
| --- | --- |
| `client/src/components/GameCanvas.tsx` | Inicialización segura, HUD de misión/vida/energía, barra de habilidades, diálogos y entradas táctiles. |
| `client/src/game/scene.ts` | Escena Babylon, cámara isométrica, bucle, input semántico y distribución del mundo. |
| `client/src/game/world.ts` | Estado de misión, oleadas, aliados, botín y transición de fases. |
| `client/src/game/entities.ts` | Ingrid, saqueadores Jarnsmen, Ulf, proyectiles, áreas rúnicas y componentes de salud. |
| `client/src/game/assets.ts` | Rutas portables a recursos, usando `import.meta.env.BASE_URL`. |

La vertical slice no requiere navegación dinámica ni modelos GLB animados. Los personajes son meshes procedurales de silueta amplia, complementados por texturas y arte generado. Las oleadas usan datos simples y los ataques se modelan con estados explícitos, no con física externa.
