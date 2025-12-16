import { Product } from './types';

export const PRODUCTS: Product[] = [
  // =========================
  // 🎄 NAVIDAD
  // =========================
  {
    id: 'xmas1',
    name: 'Árbol de Navidad “Noche Buena”',
    price: 480,
    category: 'Navidad',
    image: '/products/arbol1.jpg',
    images: ['/products/arbol1.jpg', '/products/arbol2.png'],
    description:
      'Árbol de Navidad artificial de gran porte, ideal para interiores elegantes y ambientaciones cálidas.',
    dimensions: 'Altura 210 cm · Diámetro base 110 cm',
    materialDetails:
      'Ramas de PVC de alta densidad con estructura metálica interna y base de hierro desmontable.',
    careInstructions:
      'Desmontable en 3 secciones. Guardar en lugar seco y fresco. Modelar ramas manualmente antes de usar.',
    specs: {
      Altura: '210 cm',
      Base: 'Metálica',
      Luces: 'No incluidas'
    },
    sizes: ['180cm', '210cm', '240cm']
  },

  {
    id: 'xmas2',
    name: 'Set Decorativo “Navidad Clásica”',
    price: 85,
    category: 'Navidad',
    image: '/products/adornos1.jpg',
    images: ['/products/adornos1.jpg', '/products/adornos2.png'],
    description:
      'Set de adornos navideños clásicos con bastones, esferas y detalles tradicionales.',
    dimensions: 'Medidas variables según pieza',
    materialDetails:
      'Materiales decorativos livianos con terminaciones brillantes y mates.',
    careInstructions:
      'Manipular con cuidado. Guardar en cajas separadas para preservar las piezas.',
    specs: {
      Estilo: 'Clásico',
      Uso: 'Interior'
    }
  },

  {
    id: 'xmas3',
    name: 'Figura Santa “Noche Buena”',
    price: 120,
    category: 'Navidad',
    image: '/products/santa1.jpg',
    images: ['/products/santa1.jpg', '/products/santa2.png'],
    description:
      'Figura decorativa de Santa Claus con base curva, ideal para mesas y repisas.',
    dimensions: 'Altura aproximada 25 cm',
    materialDetails:
      'Madera pintada con detalles artesanales y base decorativa.',
    careInstructions:
      'Limpiar con paño seco. No exponer a humedad ni calor directo.',
    specs: {
      Material: 'Madera',
      Uso: 'Interior'
    }
  },

  // =========================
  // 🪑 MUEBLES
  // =========================
  {
    id: 'm1',
    name: 'Sillón Lounge Kyoto',
    price: 1250,
    category: 'Muebles',
    image: '/products/sillon1.jpg',
    images: ['/products/sillon1.jpg', '/products/sillon2.png'],
     colors: [
  {
    name: 'Amarillo',
    hex: '#E0B23C',
    image: '/products/sillon1.jpg',
    hoverImage: '/products/sillon2.png'
  },
  {
    name: 'Verde',
    hex: '#2F5D50',
    image: '/products/sillonverde1.png',
    hoverImage: '/products/sillonverde2.png'
  }
]
,
    description:
      'Sillón de diseño contemporáneo con líneas suaves y estética japonesa.',
    dimensions: '85 × 90 × 70 cm · Altura asiento 38 cm',
    materialDetails:
      'Estructura de madera maciza con tapizado textil premium.',
    careInstructions:
      'Aspirar regularmente. Limpieza profesional recomendada.',
    specs: {
      Material: 'Madera maciza',
      Tapizado: 'Textil',
      Peso: '24 kg'
    }
  },

  {
    id: 'm2',
    name: 'Mesa de Centro Travertino',
    price: 3400,
    category: 'Muebles',
    image: '/products/mesa1.jpg',
    images: ['/products/mesa1.jpg', '/products/mesa2.png'],
    description:
      'Mesa de centro de piedra natural con diseño minimalista y bordes orgánicos.',
    dimensions: 'Altura 35 cm · Ancho 80 cm',
    materialDetails:
      'Travertino romano macizo con superficie pulida.',
    careInstructions:
      'Usar posavasos. Sellar la piedra cada 6 meses.',
    specs: {
      Piedra: 'Travertino Romano',
      Acabado: 'Pulido'
    },
    sizes: ['120cm', '160cm', '200cm']
  },

  {
    id: 'm3',
    name: 'Lámpara de Pie Wabi',
    price: 890,
    category: 'Muebles',
    image: '/products/lampara1.jpg',
    images: ['/products/lampara1.jpg', '/products/lampara2.png'],
    description:
      'Lámpara escultórica de luz cálida inspirada en el concepto wabi-sabi.',
    dimensions: 'Altura 160 cm · Diámetro 40 cm',
    materialDetails:
      'Pantalla de papel washi con estructura interna de bambú.',
    careInstructions:
      'Limpiar con plumero seco. Evitar humedad.',
    specs: {
      Luz: 'LED 2700K',
      Cable: 'Textil'
    }
  },

  // =========================
  // 🏛️ ARQUITECTURA
  // =========================
  {
    id: 'a1',
    name: 'Puerta Pivotante Horizon',
    price: 5600,
    category: 'Arquitectura',
    image: '/products/puerta1.jpg',
    images: ['/products/puerta1.jpg', '/products/puerta2.png'],
    description:
      'Puerta pivotante de diseño arquitectónico con marco oculto.',
    dimensions: 'Fabricación a medida',
    materialDetails:
      'Panel estructural con herrajes pivotantes de alta resistencia.',
    careInstructions:
      'Lubricar el eje pivotante cada 24 meses.',
    specs: {
      Apertura: '180°',
      Acústica: '35 dB'
    },
    sizes: ['240x100', '280x120', '300x140']
  },

  {
    id: 'a2',
    name: 'Ventanal de Acero Térmico',
    price: 4200,
    category: 'Arquitectura',
    image: '/products/ventanal1.jpg',
    images: ['/products/ventanal1.jpg', '/products/ventanal2.png'],
    description:
      'Sistema de ventanal de acero con diseño minimalista y alto rendimiento térmico.',
    dimensions: 'Perfil visto 28 mm',
    materialDetails:
      'Acero galvanizado con doble vidrio hermético.',
    careInstructions:
      'Revisar sellos y limpieza general una vez al año.',
    specs: {
      Vidrio: 'Low-E',
      ValorU: '1.1'
    },
    sizes: ['Standard', 'A Medida']
  },

  {
    id: 'a3',
    name: 'Manija Lineal de Latón Moleteado',
    price: 350,
    category: 'Arquitectura',
    image: '/products/manija1.jpg',
    images: ['/products/manija1.jpg', '/products/manija2.png'],
    colors: [
  {
    name: 'Negro',
    hex: '#111111',
    image: '/products/manijanegra1.png',
    hoverImage: '/products/manijanegra2.png',
  },
  {
    name: 'Dorado',
    hex: '#C9A24D',
    image: '/products/manija1.jpg',
    hoverImage: '/products/manija2.png',
  }
],

    description:
      'Manija lineal de latón macizo con textura moleteada, diseñada para puertas arquitectónicas.',
    dimensions: 'Largo 320 mm · Diámetro 22 mm',
    materialDetails:
      'Latón macizo mecanizado CNC con terminación natural.',
    careInstructions:
      'El latón desarrolla pátina con el tiempo. Limpiar con paño seco o producto específico.',
    specs: {
      Material: 'Latón macizo',
      Fijación: 'Doble punto',
      Uso: 'Puertas interiores'
    }
  }
];
