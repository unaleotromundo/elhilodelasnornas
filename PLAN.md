# Game Plan: El Hilo de las Nornas — La prueba de Nauthiz

## Risk Tasks

### 1. Control y combate desde cámara isométrica
- **Why isolated:** El prototipo anterior usa una cámara de persecución y movimiento automático. La nueva escena necesita que movimiento, objetivo y esquiva respondan correctamente en pantalla 3/4 tanto con teclado como con controles táctiles.
- **Approach:** Usar una cámara fija elevada y un vector semántico de entrada. Ingrid gira hacia el vector de movimiento; las habilidades seleccionan el objetivo vivo más cercano dentro de un radio visible. El desplazamiento nunca depende de la dirección antigua del runner.
- **Verify:** WASD y el joystick táctil mueven a Ingrid en la dirección esperada respecto a la cámara; la transición quieta → caminar → lanzar → esquivar no presenta saltos de posición; el modo `?demo` ejecuta una rotación de movimiento y habilidades visible.

### 2. Combate con oleadas y jefe de telegráficos claros
- **Why isolated:** La legibilidad de ataque, daño y ventanas de jefe define si el juego se siente como RPG de acción o como una escena decorativa.
- **Approach:** Modelar enemigos con salud, velocidad, estado de marca y enfriamiento de ataque. Ulf alterna tres estados explícitos: acercamiento, anillo de hacha telegrafiado y agotamiento. Crear proyectiles y zonas rúnicas como sistemas ligeros de vida limitada.
- **Verify:** Los ataques reducen salud sólo en rango; Isa inmoviliza enemigos ligeros; Nauthiz hace daño mayor a enemigos marcados; el anillo de Ulf se muestra antes del golpe y se puede evitar con Paso Velado; al morir el jefe la misión cambia al epílogo.

## Main Build

Construir una escena única que reúne Playa Negra, almacén, Sala Larga y muelle de Bjørndal. Ingrid controla el combate rúnico; los saqueadores Jarnsmen atacan en oleadas y Ulf aparece como jefe. La interfaz presenta retrato, salud, energía rúnica, barra de cuatro habilidades, objetivo narrativo, botín y apoyo de aliados. La historia visible sigue los capítulos 10–13, con prólogo textual de los capítulos 1–9.

- **Assets needed:** referencia isométrica de Bjørndal, emblema de tres runas, textura de guijarro negro/madera húmeda, silueta de Ingrid, silueta de Ulf y tarjeta de habilidad rúnica.
- **Verify:**
  - El movimiento y la respuesta de habilidad coinciden con teclado y controles táctiles.
  - Las barras de salud y energía se actualizan, los objetivos de misión cambian y no hay solapamiento móvil.
  - La playa, el almacén, el fiordo, la muralla y los hilos rúnicos son visibles en la primera vista.
  - El ciclo ola → apoyo → botín → Ulf → Consejo se completa en `?demo` sin interacción.
  - No hay rutas de recursos rotas, errores de consola ni materiales de reserva evidentes.
