/**
 * Estilo «El Hilo de las Nornas»: frontera de tormenta, hebras luminosas y nudos de destino.
 * Los recursos se resuelven desde el build publicado, sin rutas privadas del entorno de desarrollo.
 */
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

export const assets = {
  visualTarget: asset("nornas-threshold.png"),
  panorama: asset("nornas-threshold.png"),
  rider: asset("nornas-threshold.png"),
  motes: asset("nornas-logo.png"),
  logo: asset("nornas-logo.png"),
} as const;
