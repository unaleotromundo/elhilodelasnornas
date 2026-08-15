# Plan de juego: Legado del Galope

## Riesgos aislados

### 1. Cámara de persecución y travesía lateral

- **Por qué se aísla:** La cámara debe conservar una silueta legible, admitir cambios laterales y evitar que la velocidad o el encuadre tapen los rastros de memoria.
- **Enfoque:** Una cámara de seguimiento determinista mira por delante de la montura, interpola únicamente la posición horizontal y usa una distancia constante. El recorrido se limita a un corredor claro en lugar de intentar navegación o colisiones físicas complejas.
- **Verificar:** Al mantener izquierda/derecha, la montura cruza el camino sin salirse del encuadre; al avanzar, cámara, suelo y objetos conservan profundidad legible sin saltos.

### 2. Controles semánticos compartidos por teclado y táctil

- **Por qué se aísla:** Las entradas simultáneas de teclado, botones táctiles y modo demostración pueden dejar un movimiento activo o invertir una acción si no convergen en el mismo estado.
- **Enfoque:** Todas las fuentes alimentan acciones semánticas (`left`, `right`, `gallop`, `spirit`) en un único estado de entrada que se limpia al finalizar la escena.
- **Verificar:** Flechas/A-D, botones táctiles y el modo `?demo` mueven la montura en la dirección esperada; soltar un botón detiene su influencia y no aparecen errores en consola.

## Construcción principal

La primera vertical slice es una travesía de pampa mítica en tercera persona. El jugador monta, desvía el galope para recoger motas de memoria, evita tres espectros y activa un impulso de vínculo. El progreso se vuelve visible en el HUD y, al completar la ruta, el mundo inicia una nueva vuelta con una crónica distinta.

- **Recursos necesarios:** panorama de pampa como fondo, referencia de jinete y montura para dirección de arte, motas de memoria, emblema de sol/herradura y geometría procedural para la escena y los enemigos.
- **Verificar:**
  - El movimiento responde a teclado, botones táctiles y demostración automática.
  - La barra de pulso baja al golpear espectros; las motas elevan la memoria y la distancia recorrida avanza.
  - HUD, controles y texto conservan contraste en escritorio y móvil, sin superposiciones críticas.
  - El arte, la densidad y la cámara respetan la referencia: horizonte bajo, pampa oscura, acentos ámbar y figura pequeña ante el paisaje.
  - No hay texturas faltantes, elementos de ejemplo ni errores visibles de consola durante la captura.
  - La ruta puede abrirse instalada como PWA y continuar funcionando como pantalla completa desde el navegador.
