/* =========================================================================
   YAKI YAKI: DATOS DEL NEGOCIO Y TEXTOS DE LA WEB
   -------------------------------------------------------------------------
   Para cambiar algo de la web, cambia el texto entre comillas y guarda.
   No borres comas, llaves ni corchetes.

   Interruptores (true = sí, false = no):
   - whatsapp.confirmado: muestra los botones de WhatsApp (la web no muestra
     botones para llamar: los pedidos van por WhatsApp o Rappi).
   - marcasHermanas.mostrar: muestra la sección de marcas hermanas.
   Un canal sin enlace (por ejemplo pedidosya: '') no se muestra.
   ========================================================================= */
window.YAKI = window.YAKI || {};

YAKI.negocio = {
  nombre: 'Yaki Yaki',
  descriptor: 'Nikkei snack bar',

  direccion: {
    calle: 'Calle 31 n.º 110',
    urbanizacion: 'Córpac',
    distrito: 'San Isidro',
    ciudad: 'Lima',
    // Texto que se busca en Google Maps para el mapa y "Cómo llegar".
    // Si el local tiene ficha en Google Maps, pega su enlace en enlaceMaps.
    busquedaMaps: 'Calle 31 110, Córpac, San Isidro, Lima, Perú',
    enlaceMaps: ''
  },

  telefono: { numero: '+51912848007', mostrar: '912 848 007' },

  whatsapp: {
    confirmado: true,                        // El cliente pidió WhatsApp en vez de llamadas (2026-10-05)
    numero: '51912848007',
    saludo: 'Hola Yaki Yaki, quiero hacer un pedido.',
    saludoProducto: 'Hola Yaki Yaki, quiero pedir: {producto}.',
    saludoPedido: 'Hola Yaki Yaki, quiero hacer este pedido:'
  },

  // Pedido por WhatsApp: la persona agrega platos y el mensaje sale armado.
  pedidoPorWhatsApp: true,

  // Canales de delivery. Vacío = el botón no aparece.
  canales: {
    rappi: 'https://www.rappi.com.pe/restaurantes/73247-yakiyaki',
    pedidosya: ''                            // [PENDIENTE] enlace de PedidosYa
  },

  redes: {
    instagram: 'https://www.instagram.com/yakiyaki.pe/',
    tiktok: 'https://www.tiktok.com/@yakiyaki.pe'
  },

  // Horario de domingo a sábado. Cada día puede ser:
  //   { abre: '12:00', cierra: '22:00' }, 'cerrado' o 'por confirmar'.
  // 'por confirmar' no se publica.
  horario: {
    domingo: 'por confirmar',                // [PENDIENTE]
    lunes: { abre: '12:00', cierra: '22:00' },
    martes: { abre: '12:00', cierra: '22:00' },
    miercoles: { abre: '12:00', cierra: '22:00' },
    jueves: { abre: '12:00', cierra: '22:00' },
    viernes: { abre: '12:00', cierra: '22:00' },
    sabado: { abre: '12:00', cierra: '22:00' }
  },

  // Qué va en la cabecera junto al logo (solo en computadora):
  //   '' (nada), 'estado', 'direccion', 'estado-direccion', 'promo' o 'marca'.
  // Para probar una opción sin cambiar esto, agrega ?cabecera=promo (por ejemplo)
  // al final de la dirección de la página.
  cabecera: 'estado-direccion',
  cabeceraPromo: 'combo-2',                  // id del plato (data/carta.js) que muestra la opción 'promo'

  marcasHermanas: {
    mostrar: false,                          // [PENDIENTE] confirmar con el dueño
    lista: [
      { nombre: 'Taiyaki Pez', enlace: 'https://www.instagram.com/taiyakipezoficial/' },
      { nombre: 'Tokuyaki', enlace: 'https://www.instagram.com/tokuyaki/' }
    ]
  },

  // {apps} se reemplaza por las apps de delivery que tengan enlace (hoy: Rappi).
  notaPrecios: 'Precios del local. En {apps} pueden variar.'
};

/* Textos de la web. Los que dicen {distrito} o {calle} se completan solos. */
YAKI.textos = {
  menu: { carta: 'Carta', favoritos: 'Favoritos', nosotros: 'Nosotros', ubicacion: 'Ubicación', pedir: 'Pedir ahora' },

  portada: {
    sello: 'Street food japonés en Lima',
    titulo: ['Antojos japoneses,', 'hechos para volver.'],
    // Texto del PDF de marca. [PENDIENTE] confirmar si se puede comer en el local.
    bajada: 'Ramen, takoyaki, gyozas, onigiris y bebidas para comer aquí o pedir.',
    verCarta: 'Ver carta',
    pedir: 'Pedir ahora'
  },

  favoritos: { titulo: 'Favoritos de la casa' },

  combos: { titulo: 'Combos', bajada: '' },

  nosotros: {
    titulo: 'No es solo comer. Es picar, probar, compartir y volver por algo nuevo.',
    // Datos de la bio de su Instagram.
    texto: 'Nikkei snack bar en {calle}, {distrito}. Delivery y take out.'
  },

  carta: { titulo: 'La carta' },

  yakibox: {
    palabra: 'Yakibox',
    titulo: 'Arma tu Yaki Box.',                         // texto del PDF
    bajada: 'Tú eliges tu entrada, arroz y karaage favoritos.', // catálogo del local
    boton: 'Agregar al pedido'
  },

  ubicacion: {
    titulo: 'Pide o pasa a recoger',
    direccion: 'Dirección',
    horario: 'Horario',
    pedidos: 'Pedidos',
    comoLlegar: 'Cómo llegar',
    whatsapp: 'WhatsApp'
  },

  marcas: { titulo: 'Marcas hermanas' },

  pie: { redes: 'Redes', secciones: 'Secciones' },

  pedido: {
    titulo: 'Tu pedido',
    tituloSinCarrito: 'Pedir ahora',
    vasAPedir: 'Vas a pedir:',
    vacio: 'Agrega platos de la carta con el botón Agregar y envía tu pedido por WhatsApp con el mensaje listo.',
    enviar: 'Enviar pedido por WhatsApp',
    total: 'Total',
    aConsultar: 'precio a consultar',
    notaConsultar: 'Hay platos con precio a consultar: el total no los incluye.',
    vaciar: 'Vaciar pedido',
    otros: 'También puedes pedir por:',
    otrosConPedido: 'O pide por:',
    agregar: 'Agregar',
    agregarAlPedido: 'Agregar al pedido',
    agregado: 'Agregaste',
    verPedido: 'Ver pedido',
    cantidad: 'Cantidad',
    tamano: 'Tamaño',
    hasta: 'Elige hasta {n}',
    falta: 'Elige una opción para continuar.',
    faltaYakibox: 'Elige tu entrada, tu arroz y tu karaage.',
    recoger: 'Para recoger: {calle}, {distrito}.'
  }
};
