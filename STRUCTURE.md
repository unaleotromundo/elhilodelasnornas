# Estructura de ejecución — Legado del Galope

## Capas

La aplicación usa React como marco para el canvas y el HUD; Babylon.js posee la escena, las luces, la cámara y el ciclo de renderizado. Las reglas de juego permanecen en `client/src/game/` y no dependen del árbol de React.

| Módulo | Responsabilidad |
| --- | --- |
| `components/GameCanvas.tsx` | Inicializa y destruye el motor una vez; renderiza el HUD y traduce los botones táctiles en acciones semánticas. |
| `game/scene.ts` | Construye la pampa, la montura, espectros, motas, cámara y actualización de juego. También emite el estado visual hacia el HUD. |
| `game/assets.ts` | Centraliza los URLs de arte generado, para que los recursos no queden dispersos en las escenas. |
| `vite.config.ts` | Registra la PWA, el manifiesto y la estrategia de actualización; mantiene los complementos del entorno. |

## Contratos

`createGameScene(engine, canvas)` retorna un `GameHandle` con la escena y un método `dispose()`. `GameCanvas` inicia y detiene el bucle de renderizado, y elimina los listeners de DOM por medio del método de limpieza del handle.

El HUD escucha el evento `legado:hud`. Los controles emiten `legado:control` con una acción y un estado de pulsación. El comienzo de la expedición se comunica mediante `legado:started`. Esta frontera mantiene la UI convencional fuera de las reglas y la escena.

## Ayudas de recursos

El horizonte utiliza el panorama generado como capa ambiental. El emblema se muestra como identidad de producto y favicon; el cuadro de destino se usa en el umbral de entrada. El jinete generado es una referencia visual dentro del códice de expedición, mientras que la montura del runtime usa geometría simple para una respuesta inmediata y sin pipeline de modelos 3D.
