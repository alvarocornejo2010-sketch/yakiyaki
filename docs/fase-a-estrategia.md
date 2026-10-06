# Yakiyaki web · Fase A: estrategia y arquitectura

Versión 2 · 2026-10-05 · Estado: **aprobada**, con los ajustes del PDF de marca (ver "Cambios de la v2")

## Objetivo

- **Principal:** que la persona pida. Se mide con los clics en Rappi, PedidosYa, WhatsApp y Llamar.
- **Secundarios:** ver la carta y los precios, ubicar el local y su horario, seguir a Yaki Yaki en Instagram y TikTok.

## Público (inferido de sus redes, no confirmado por el negocio)

Jóvenes y oficinistas de San Isidro, San Borja y alrededores. Llegan desde Instagram o TikTok, en el celular, con antojo y poco tiempo.

## Recorridos del visitante

1. **Antojo directo:** portada → "Pedir ahora" → elige canal. Dos toques.
2. **Quiere ver antes de pedir:** portada → "Ver carta" → favoritos o carta por pestañas → "Pedir" (tarjeta o barra inferior).
3. **Recoge en el local:** "Ubicación" → ve si está abierto → "Cómo llegar" o "Llamar".

Desde cualquier punto, pedir está a un toque: cabecera en computadora, barra inferior en celular. WhatsApp y Llamar, desde la barra, son un solo toque.

## Mapa del sitio (una sola página)

| # | Sección | Ancla | Contenido |
|---|---|---|---|
| 0 | Cabecera fija | — | Logo · Carta · Favoritos · Nosotros · Ubicación · botón "Pedir ahora". En celular: logo y menú simple |
| 1 | Portada | `#inicio` | Foto oscura, "Antojos japoneses, hechos para volver.", botones Ver carta y Pedir ahora |
| 2 | Favoritos | `#favoritos` | 4 tickets: Combo Ramen, Takoyaki, Gyozas, Gohan |
| 2b | Combos **[PROPUESTA]** | `#combos` | Sus pósters de Combo Uno, Combo Dos y YakiMix, con nombre, contenido, precio y "Pedir" en texto |
| 3 | Experiencia Yaki Yaki | `#nosotros` | Frase del PDF y carrusel de fotos. No inventa historia |
| 4 | Carta | `#carta` | Pestañas: Combos, Entradas, Karaage, Arroz, Ramen, Dulces, Bebidas (Snacks cuando haya datos) |
| 5 | Arma tu YakiBox | `#yakibox` | Bloque turquesa: entrada + arroz + karaage, S/ 15 |
| 6 | Ubicación y pedidos | `#ubicacion` | Mapa, horario, dirección, canales, Instagram, Cómo llegar |
| 7 | Marcas hermanas | `#marcas` | Solo si `mostrarMarcasHermanas` es verdadero |
| 8 | Pie | — | Dirección, teléfono, redes, nota de precios, año |
| — | Barra inferior (celular) | — | Pedir ahora · WhatsApp · Llamar. Aparece al dejar la portada |

## Botones

| Botón | Dónde | Qué hace |
|---|---|---|
| Ver carta (principal en la portada) | Portada | Baja a `#carta` |
| Pedir ahora | Portada, cabecera, barra inferior | Abre la hoja con los canales |
| Pedir (por producto) | Favoritos, YakiBox | Abre la misma hoja |
| Rappi → PedidosYa → WhatsApp → Llamar | Hoja de pedido, en ese orden | Rappi y PedidosYa en pestaña nueva; WhatsApp con saludo armado; `tel:+51912848007` |
| WhatsApp y Llamar | Barra inferior | Directo, un toque |
| Cómo llegar | Ubicación | Google Maps con la dirección |
| Instagram y TikTok | Ubicación y pie | `@yakiyaki.pe` |

Reglas: un canal sin enlace no se muestra (PedidosYa por ahora). WhatsApp se muestra solo cuando el negocio confirme el número. El domingo no muestra "abierto" ni "cerrado" hasta confirmar el horario.

## Cambios de la v2 (por el PDF de marca)

1. En la portada, "Ver carta" pasa a ser el botón principal y "Pedir ahora" el secundario, como pide el PDF. Rappi y PedidosYa se mueven a la hoja de pedido. Pedir queda a dos toques desde la portada y a uno desde la barra.
2. La barra inferior lleva Pedir ahora, WhatsApp y Llamar (aprobado).
3. Se agregan "Experiencia Yaki Yaki" (abre con "Nosotros") y "Arma tu YakiBox". "Cómo pedir" se une a "Ubicación".
4. Favoritos pasa de 6 a 4, como pide el PDF.
5. Las categorías usan las palabras de su carta (entrada, arroz, karaage) en vez de la lista del PDF, porque así ninguna pestaña queda vacía.
6. **[PROPUESTA, pendiente de tu visto bueno]** Con los pósters que mandaste, se agrega una sección "Combos" después de Favoritos. El YakiMix sale de Favoritos y entra el Gohan, que es el "onigiri" del PDF.

## Cambios del 2026-10-05, ya en la página final

- La portada empieza con "YAKI YAKI" en grande, que pasa a ser el título principal de la página.
- La carta va toda seguida, sin pestañas.
- No hay botones para llamar: los canales son Rappi y WhatsApp (PedidosYa se suma cuando haya enlace).
