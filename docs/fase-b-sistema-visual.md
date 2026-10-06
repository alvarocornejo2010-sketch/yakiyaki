# Yakiyaki web · Fase B: identidad y sistema visual

Versión 1 · 2026-10-05 · Estado: **para aprobación**

## Qué se entrega

| Archivo | Para qué |
|---|---|
| `muestra-componentes.html` | Página de muestra: ábrela en el navegador. Es interna y no se publica |
| `css/tokens.css` | Colores, tipos, espacios, radios y movimiento. Se cambian solo aquí |
| `css/componentes.css`, `js/componentes.js` | Las piezas que se reusan en la Fase C |
| `img/marca/` | Logo provisional en dos colores y `mancha.svg`, la silueta del logo. Los sellos de precio usan una versión simplificada que va dentro de la página |
| `img/provisional/` | Recortes de sus fotos. Algunos (otros sabores de karaage, nori rice) aún no se usan; quedan listos para la carta de la Fase C |

## Decisiones

- **Paleta:** la del PDF. La base es tinta, crema y turquesa; coral y chili son acentos; kraft y yema, detalles.
- **Tipografía [PROPUESTA]:** Archivo condensada (62 %, peso 850) para títulos y precios, porque es compacta y pesada como una etiqueta de mercado. Figtree para el texto, porque se lee bien en celular. Probé también Sofia Sans Extra Condensed, Anton, Big Shoulders, Bricolage, Barlow, Saira y Smooch Sans; esta última tenía problemas de espaciado.
- **Recursos de marca, sacados de sus publicaciones:**
  1. Palabra gigante blanca detrás de la comida, sobre turquesa. Se usa una sola vez, en "Arma tu YakiBox", para que no pierda fuerza.
  2. Sello de precio con la silueta del logo, como el "s/20" coral del Combo Agosto.
  3. Motivo de trazos en tejido (como el de sus posts), en coral o blanco, solo de adorno.
- **Tarjeta de favorito [PROPUESTA]:** un ticket de comida, como los de las máquinas de los locales de ramen: papel, perforación y muescas. Cumple el pedido del PDF de que no parezca e-commerce genérico.
- **Portada:** foto oscura con la comida a un lado. Mientras llega la foto nocturna, uso un plato redondo provisional con el vapor encima.
- **Combos (agregado con la segunda tanda de imágenes):** sus pósters de Instagram como imagen, sobre fondo oscuro, y debajo el nombre, lo que trae, el precio y "Pedir" en texto. En celular se deslizan de lado; en computadora van de a tres.
- **Favoritos:** quedan Combo Ramen, Takoyaki, Gyozas y Gohan (el "onigiri" del PDF). El YakiMix pasó a Combos para no repetirlo.

## Contraste (AA)

Todas las parejas de texto pasan AA; la mayoría, AAA. La más justa es tinta sobre chili (5.8:1). No se usan para texto: coral, chili ni turquesa sobre crema, ni blanco sobre turquesa (este último solo en la palabra gigante decorativa). La muestra calcula la tabla en vivo desde `tokens.css`.

## Movimiento

Vapor en la portada, título por líneas, rebote corto en los botones, tarjetas que suben 6 px, pop de precios una sola vez, fundido al cambiar de categoría y barra inferior que entra desde abajo. Solo se anima la opacidad y la posición. Con "reducir movimiento" activado, todo queda quieto.

## Verificación hecha

- Vista en 360, 768 y 1280 px, sin desplazamiento horizontal. Se encontró y corrigió un desborde lateral causado por los textos ocultos para lectores de pantalla dentro del carrusel de combos.
- Todos los botones y pestañas miden 44 px o más.
- Pestañas de la carta con flechas, Inicio y Fin; los enlaces directos tipo `#menu-dulces` abren su categoría.
- La hoja de pedido se cierra con Escape y devuelve el foco al botón que la abrió.
- Con "reducir movimiento" no hay animaciones y los precios se ven desde el inicio.
- Las 18 imágenes cargan y no hay errores ni advertencias en la consola.
- Todo lo anterior se probó con un servidor local. Abrir el archivo con doble clic debería funcionar igual, porque la página no carga datos aparte de las fuentes, pero eso no lo pude comprobar con mis herramientas.

## Provisional

- Logo trazado desde una publicación: falta el archivo oficial en vector.
- Fotos: las de takoyaki, taiyaki, yakimeshi, karaage y onigiri son las nuevas que mandaste. Gyozas, ebi furai, ramen y YakiMix siguen siendo recortes de su carta y de sus posts, en baja resolución. Falta confirmar el permiso de uso de todas.
- La foto nocturna de la portada y la de la caja de delivery que menciona el PDF no llegaron.
