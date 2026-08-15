/**
 * Dirección «El fiordo como tablero de destino»: recursos portables para el RPG isométrico.
 * Todas las rutas pasan por BASE_URL para funcionar en Vercel y GitHub Pages.
 */
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

export const assets = {
  visualTarget: asset("nornas-isometric-visual-target.png"),
  logo: asset("nornas-three-council-mark.png"),
  ingrid: asset("nornas-ingrid-portrait.png"),
  ulf: asset("nornas-ulf-portrait.png"),
  arena: asset("nornas-black-beach-arena.png"),
  runeCards: asset("nornas-rune-ability-cards.png"),
} as const;
