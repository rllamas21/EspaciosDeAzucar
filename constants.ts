// 🔥 DICCIONARIO DE COLORES (MAPPER)
// Traduce el texto que viene de Yobel (Backend) a un color visual en pantalla.
export const COLOR_MAP: Record<string, string> = {
  // Metales
  'Latón': '#ca8a04',
  'Latón Viejo': '#854d0e',
  'Latón Cepillado': '#ca8a04',
  'Oro': '#eab308',
  'Oro Antiguo': '#a16207',
  'Plata': '#e5e7eb',
  'Plata Vieja': '#d1d5db',
  'Acero Inox': '#d1d5db',
  'Bronce Quemado': '#78350f',
  'Gunmetal': '#4b5563',
  'Mercurio/Plata': '#d1d5db',

  // Maderas
  'Roble': '#a8a29e',
  'Roble Natural': '#a8a29e',
  'Roble Ahumado': '#57534e',
  'Nogal': '#44403c',
  'Nogal Oscuro': '#44403c',

  // Básicos
  'Negro': '#000000',
  'Negro Mate': '#171717',
  'Blanco': '#ffffff',
  'Gris Piedra': '#d6d3d1',
  'Carbón': '#292524',
  'Azul': '#1e3a8a',
  'Rojo': '#dc2626',
};

// Función para obtener el color seguro
export const getColorHex = (name: string): string => {
  if (COLOR_MAP[name]) return COLOR_MAP[name];
  // Búsqueda inteligente (ej: "Roble Oscuro" encuentra "Roble")
  const key = Object.keys(COLOR_MAP).find(k => name.includes(k));
  return key ? COLOR_MAP[key] : '#cccccc'; // Gris si no encuentra nada
};

// 🗑️ ¡PRODUCTOS MOCK ELIMINADOS!
// Ahora dependemos 100% de la Base de Datos.
export const PRODUCTS = [];