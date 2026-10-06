/* =========================================================================
   YAKI YAKI: CARTA
   -------------------------------------------------------------------------
   Solo información real del local. De dónde sale cada cosa:
   - Nombres, precios y contenido de combos: catálogo del local (PDF, pág. 1).
   - Precios de platos sueltos, sabores y rellenos: carta del local (PDF).
   - Categorías y descripciones de platos sueltos: su carta en Rappi.
   - Limorada: etiqueta de la botella (póster del Combo 1).

   Cada plato tiene:
     id          nombre corto sin espacios (no cambiar: lo usan favoritos, combos y el pedido)
     categorias  en qué parte de la carta aparece
     nombre, descripcion
     precio      en soles, por ejemplo 12.90. Sin precio: null (sale "Consultar")
     variantes   tamaños con su precio
     opciones    lo que se elige al pedir. elegir: cuántas opciones como máximo
     foto/poster imagen (opcional)
     visible     false = no se muestra (platos sin datos confirmados)

   [PENDIENTE] vigencia de los precios: la carta del PDF no tiene fecha.
   ========================================================================= */
window.YAKI = window.YAKI || {};

YAKI.carta = {
  // Mismas categorías que el local usa en Rappi.
  categorias: [
    { id: 'combos', nombre: 'Combos' },
    { id: 'entradas', nombre: 'Entradas' },
    { id: 'pollo-frito', nombre: 'Pollo frito' },
    { id: 'acompanamientos', nombre: 'Acompañamientos' },
    { id: 'postres', nombre: 'Postres' },
    { id: 'bebidas', nombre: 'Bebidas' },
    { id: 'snacks', nombre: 'Snacks importados' }
  ],

  platos: [
    /* ---- Combos (catálogo del local) ---- */
    {
      id: 'combo-1', categorias: ['combos'], nombre: 'Combo 1',
      descripcion: 'Box de entradas + Limorada. Incluye 2 takoyaki, 2 ebi furai y 2 gyoza, y 1 Limorada de 500 ml.',
      precio: 15,
      poster: { src: 'img/carta/poster-combo-uno', ancho: 720, alto: 900, chica: true,
        alt: 'Póster del Combo 1: botella de Limorada y caja con ebi furai, takoyaki y gyoza' }
    },
    {
      id: 'combo-2', categorias: ['combos'], nombre: 'Combo 2',
      descripcion: 'Bucket de karaage grande + 2 gohan. Incluye 1 gohan de yakimeshi y 1 de nori rice. Eliges hasta 2 sabores.',
      precio: 25,
      opciones: { titulo: 'Sabores del karaage', lista: ['Original', 'Honey mustard', 'Acevichado', 'Sweet chili'], elegir: 2 },
      poster: { src: 'img/carta/poster-combo-dos', ancho: 720, alto: 960, chica: true,
        alt: 'Póster del Combo 2: vaso de karaage y caja con dos bolas de arroz' }
    },
    {
      id: 'combo-ramen', categorias: ['combos'], nombre: 'Combo Ramen',
      descripcion: 'Incluye 1 ramen picante o normal y 1 porción pequeña de takoyaki.',
      precio: 20,
      opciones: { titulo: 'Ramen', lista: ['Picante', 'Normal'], elegir: 1 },
      foto: { src: 'img/carta/ramen-cerca', ancho: 505, alto: 505, alt: 'Ramen con gyoza, huevo, nori y cebolla china' }
    },
    {
      id: 'yakimix', categorias: ['combos'], nombre: 'YakiMIX',
      descripcion: 'Box de snacks nikkei: 8 unid. de takoyaki, 7 unid. de gyoza y 6 unid. de ebi furai.',
      precio: 35,
      poster: { src: 'img/carta/poster-yakimix', ancho: 720, alto: 900, chica: true,
        alt: 'Póster del YakiMIX: caja con takoyaki, gyoza y ebi furai' }
    },
    {
      id: 'yakibox', categorias: ['combos'], nombre: 'Yakibox',
      descripcion: 'Arma tu box: tú eliges tu entrada, arroz y karaage favoritos.',
      precio: 15
    },

    /* ---- Entradas ---- */
    {
      id: 'takoyaki', categorias: ['entradas'], nombre: 'Takoyaki',
      descripcion: '8 piezas. Masitas fritas rellenas de pulpo y verduras, con salsas y toppings.',
      precio: 12.90,
      opciones: { titulo: 'Sabor', lista: ['Original', 'Acevichado'], elegir: 1 },
      foto: { src: 'img/carta/takoyaki', ancho: 800, alto: 800, alt: 'Takoyaki con salsa, mayonesa y hojuelas de bonito', chica: true }
    },
    {
      id: 'gyoza', categorias: ['entradas'], nombre: 'Gyoza',
      descripcion: '7 unidades. Dumpling al vapor de pollo y verduras.',
      precio: 12.90,
      foto: { src: 'img/carta/gyozas', ancho: 360, alto: 340, alt: 'Gyoza con salsa y cebolla china' }
    },
    {
      id: 'ebi-furai', categorias: ['entradas'], nombre: 'Ebi furai',
      descripcion: '6 unidades. Langostinos empanizados al panko.',
      precio: 12.90,
      foto: { src: 'img/carta/ebi-furai', ancho: 330, alto: 310, alt: 'Ebi furai, langostinos empanizados' }
    },

    /* ---- Pollo frito ---- */
    {
      id: 'karaage', categorias: ['pollo-frito'], nombre: 'Karaage',
      descripcion: 'Pollo frito estilo japonés, salsa a elegir.',
      variantes: [ { nombre: 'Mediano', precio: 12.90 }, { nombre: 'Grande', precio: 19.90 } ],
      opciones: { titulo: 'Sabor', lista: ['Original', 'Honey mustard', 'Acevichado', 'Sweet chili'], elegir: 1 },
      foto: { src: 'img/carta/karaage-sweet-chili', ancho: 800, alto: 800, alt: 'Karaage con salsa sweet chili y ajonjolí', chica: true }
    },

    /* ---- Acompañamientos ---- */
    {
      id: 'gohan', categorias: ['acompanamientos'], nombre: 'Gohan',
      descripcion: 'Bolas de arroz.',
      precio: 5,
      opciones: { titulo: 'Elige', lista: ['Nori rice', 'Yakimeshi'], elegir: 1 },
      foto: { src: 'img/carta/gohan-nori', ancho: 800, alto: 800, alt: 'Bola de arroz envuelta en alga nori', chica: true }
    },
    {
      id: 'tsukemono', categorias: ['acompanamientos'], nombre: 'Tsukemono de nabo',
      descripcion: 'Nabo encurtido, 25 g.',
      precio: null,
      visible: false                          // [PENDIENTE] solo en Rappi (S/ 3.00); falta precio del local
    },

    /* ---- Postres ---- */
    {
      id: 'taiyaki', categorias: ['postres'], nombre: 'Taiyaki',
      descripcion: '1 pieza. Waffle en forma de pez con relleno a elegir.',
      precio: 6,
      opciones: { titulo: 'Relleno', lista: ['Pastelera', 'Choco', 'Manjar', 'Matcha', 'Avellanas'], elegir: 1 },
      foto: { src: 'img/carta/taiyaki', ancho: 800, alto: 800, alt: 'Dos taiyaki, waffles en forma de pez', chica: true }
    },

    /* ---- Bebidas ---- */
    {
      id: 'limorada', categorias: ['bebidas'], nombre: 'Limorada',
      descripcion: 'Limonada + té de butterfly pea. 500 ml.',
      precio: null                            // [PENDIENTE] precio en el local (Rappi: S/ 6.00)
    },
    {
      id: 'gaseosas', categorias: ['bebidas'], nombre: 'Gaseosas',
      descripcion: 'Coca-Cola o Inca Kola, original o sin azúcar.',
      precio: null,                           // [PENDIENTE] precio en el local (Rappi: S/ 5.00)
      opciones: { titulo: 'Elige', lista: ['Coca-Cola Original', 'Coca-Cola Sin Azúcar', 'Inca Kola Original', 'Inca Kola Sin Azúcar'], elegir: 1 }
    },
    {
      id: 'bebidas-especiales', categorias: ['bebidas'], nombre: 'Bebidas especiales',
      descripcion: 'Matcha latte, ichigo latte, dalgona y bebidas con perlas.',
      precio: null,
      visible: false                          // [PENDIENTE] solo vistas en Instagram, sin precio
    },

    /* ---- Sin categoría publicada ---- */
    {
      id: 'ramen', categorias: [], nombre: 'Ramen',
      descripcion: 'Picante o normal.',
      precio: null,
      visible: false                          // [PENDIENTE] precio del ramen solo
    },
    {
      id: 'onion-rings', categorias: ['snacks'], nombre: 'Onion rings',
      descripcion: 'Aros de cebolla crujientes.',
      precio: null,
      visible: false                          // [PENDIENTE] Rappi: S/ 9.90; la lista de snacks cambia
    }
  ],

  // Qué platos van en cada sección de la portada (por id).
  favoritos: ['combo-ramen', 'takoyaki', 'gyoza', 'gohan'],
  combos: ['combo-1', 'combo-2', 'yakimix'],

  // Pasos de la Yakibox (pieza "elige tu entrada, arroz y karaage" del local).
  yakibox: {
    plato: 'yakibox',
    pasos: [
      { titulo: 'Elige tu entrada', opciones: ['Takoyaki', 'Ebi furai', 'Gyoza'] },
      { titulo: 'Elige tu arroz', opciones: ['Nori rice', 'Yakimeshi'] },
      { titulo: 'Elige tu karaage', opciones: ['Original', 'Honey mustard', 'Acevichado', 'Sweet chili'], prefijo: 'karaage ' }
    ],
    fotos: [
      { src: 'img/carta/karaage-sweet-chili', ancho: 800, alto: 800, chica: true },
      { src: 'img/carta/takoyaki', ancho: 800, alto: 800, chica: true },
      { src: 'img/carta/gohan-yakimeshi', ancho: 800, alto: 800, chica: true }
    ]
  },

  // Fotos del carrusel de "Nosotros".
  galeria: [
    { src: 'img/carta/takoyaki', ancho: 800, alto: 800, chica: true, alt: 'Takoyaki con salsa y mayonesa', texto: 'Takoyaki' },
    { src: 'img/carta/ramen-cerca', ancho: 505, alto: 505, alt: 'Ramen con gyoza, huevo y nori', texto: 'Ramen' },
    { src: 'img/carta/taiyaki', ancho: 800, alto: 800, chica: true, alt: 'Dos taiyaki, waffles en forma de pez', texto: 'Taiyaki' },
    { src: 'img/carta/karaage-sweet-chili', ancho: 800, alto: 800, chica: true, alt: 'Karaage con salsa sweet chili', texto: 'Karaage' },
    { src: 'img/carta/yakimix', ancho: 1080, alto: 390, alt: 'Caja YakiMIX con takoyaki y gyoza', texto: 'YakiMIX' },
    { src: 'img/carta/gohan-yakimeshi', ancho: 800, alto: 800, chica: true, alt: 'Yakimeshi, arroz frito con huevo y verduras', texto: 'Yakimeshi' }
  ]
};
