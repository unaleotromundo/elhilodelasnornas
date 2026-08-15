# Memoria de producción

## Reconstrucción: El Hilo de las Nornas

La versión de travesía lineal fue retirada por no corresponder a la novela publicada. El nuevo núcleo se fundamenta en los trece capítulos del manuscrito de `runasvikingas.vercel.app`: Ingrid es la protagonista jugable; Bjørn representa fuerza, Hakon estrategia y Astrid el sostén del clan. El objetivo narrativo de la vertical slice es defender Bjørndal durante el desembarco de Ulf el Sangriento y revelar el Consejo de Tres.

La escena ahora usa cámara isométrica fija, mapas de Playa Negra/Bjørndal, movimiento de cuatro direcciones, cuatro runas activas, oleadas de Jarnsmen, fragmentos de botín, apoyos de aliados y una pelea de jefe con telegráfico. El modo `?demo` activa una versión determinista de movimiento y habilidades para la verificación.

Los recursos generados para la nueva dirección viven también dentro de `client/public/assets/`, porque el despliegue objetivo es Vercel y no puede depender de rutas exclusivas de Manus. El build y el typecheck se completaron correctamente tras conectar el nuevo arte. La navegación temporal de verificación cargó el HUD y los recursos, aunque el subsistema de navegador quedó inestable antes de producir una captura final; la siguiente revisión visual debe hacerse contra el despliegue de Vercel una vez que el commit llegue a `main`.
