# Graph Report - yakiyaki  (2026-10-06)

## Corpus Check
- Large corpus: 63 files · ~689,892 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 397 nodes · 714 edges · 29 communities (18 shown, 11 thin omitted)
- Extraction: 69% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 215 edges (avg confidence: 0.9)
- Token cost: 473,088 input · 0 output

## Community Hubs (Navigation)
- Estrategia y página final
- Sistema visual (fase B)
- Datos y guía de edición
- Pósters y combos
- Carta real y fuentes
- Fotos de platos
- Carrito de WhatsApp (pedido.js)
- Revisión y auditoría
- Armado de la página (sitio.js)
- Fotos del cliente y marca
- Capturas del pedido
- Publicación (publicar.py)
- Sitios de referencia
- Boxes de NT Taco
- Carrusel de NT Taco
- Cabecera: estado y dirección
- Marca y navegación
- Logos y mancha
- Combos en celular
- Combos Coca-Cola (referencia)
- Combos Inca Kola (referencia)
- Banner Combo 2
- Acción Quitar
- Delivery por Rappi
- Elegir sabor
- Elegir tamaño
- Bebidas (referencia)
- Makis (referencia)
- Promo Boxes (referencia)

## God Nodes (most connected - your core abstractions)
1. `armar()` - 24 edges
2. `index.html (página final de Yaki Yaki)` - 23 edges
3. `muestra-componentes.html (muestra interna del sistema visual)` - 20 edges
4. `pintar()` - 13 edges
5. `Precios: carta del local frente a Rappi` - 13 edges
6. `Mapa del sitio: una sola página con ocho secciones` - 13 edges
7. `Prompt final de construcción por fases A a G` - 11 edges
8. `Estructura de la página del brief (siete secciones)` - 10 edges
9. `abrirAgregar()` - 9 edges
10. `Interruptores de negocio.js (whatsapp.confirmado, consumoEnLocal, marcasHermanas.mostrar)` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Tarjetas ticket de favoritos (Combo Ramen, Takoyaki, Gyozas, Gohan)` --references--> `Combo Ramen (PEN 20.00)`  [INFERRED]
  muestra-componentes.html → docs/YAKI YAKI.pdf
- `Sección Ubicación y pedidos (#ubicacion: dirección, horario, canales, mapa)` --implements--> `Ubicación y contacto (mapa, horario, WhatsApp, Instagram)`  [INFERRED]
  index.html → docs/YAKI YAKI.pdf
- `Lo que falta para cerrar el diseño` --semantically_similar_to--> `Preguntas abiertas para el negocio`  [INFERRED] [semantically similar]
  muestra-componentes.html → docs/carta-y-datos.md
- `Sprite SVG de símbolos (mancha, ajiro, íconos)` --implements--> `Recursos de marca: palabra gigante, sello de precio y motivo de trazos`  [INFERRED]
  index.html → docs/fase-b-sistema-visual.md
- `Elementos provisionales (logo trazado, fotos recortadas, sin foto nocturna)` --semantically_similar_to--> `Lo que falta para cerrar el diseño`  [INFERRED] [semantically similar]
  docs/fase-b-sistema-visual.md → muestra-componentes.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de pedido por WhatsApp** — index_hoja_agregar, index_hoja_pedido, index_barra_pedido, docs_como_editar_pedido_por_whatsapp, docs_seguridad_pedido_whatsapp [INFERRED 0.85]
- **Capas de seguridad de la web de Yaki Yaki** — docs_seguridad_publicar_solo_lo_necesario, docs_seguridad_csp, docs_seguridad_cabeceras, docs_seguridad_codigo_no_confia, docs_seguridad_pedido_whatsapp [EXTRACTED 1.00]
- **Sistema visual de Yaki Yaki** — docs_fase_b_sistema_visual_paleta, docs_fase_b_sistema_visual_tipografia, docs_fase_b_sistema_visual_recursos_de_marca, docs_fase_b_sistema_visual_tarjeta_ticket, docs_fase_b_sistema_visual_movimiento, docs_fase_b_sistema_visual_tokens [INFERRED 0.85]
- **Menu Organization by Categories** — docs_capturas_pedido_3_carta_menu_header, docs_capturas_pedido_3_carta_combos_category, docs_capturas_pedido_3_carta_entradas_category, docs_capturas_pedido_3_carta_acompanamientos_category, docs_capturas_pedido_3_carta_postres_category [EXTRACTED 1.00]
- **Brand Visual Identity Components** — img_marca_logo_svg_brand_logo, img_marca_logo_sobre_oscuro_svg_dark_logo, img_marca_mancha_svg_decorative_blob [INFERRED 0.85]
- **Header Section with Navigation and Info** — docs_capturas_cabecera_1_estado_y_direccion_header_section, docs_capturas_cabecera_navigation_menu, docs_capturas_cabecera_1_estado_y_direccion_location_display, docs_capturas_cabecera_cta_button [EXTRACTED 1.00]
- **Productos de los sitios de referencia (NT Taco y sitio amarillo)** — docs_fotos_10_do_box_product, docs_fotos_nt_experience_box, docs_fotos_nikkei_revolution_box, docs_fotos_genki_box, docs_fotos_veggie_power_box, docs_fotos_acevichado_10_makis, docs_fotos_tonkotsu_ramen, docs_fotos_full_makis_50, docs_fotos_gyozas [INFERRED 0.85]
- **Menu Category Organization** — docs_fotos_combos_coca_cola, docs_fotos_combos_inca_kola, docs_fotos_promo_boxes_category, docs_fotos_makis_category, docs_fotos_bebidas_category [EXTRACTED 1.00]
- **Canales de pedido de NT Taco** — docs_fotos_rappi_channel, docs_fotos_menu_access_pattern [INFERRED 0.75]
- **Combo Meal Offerings** — docs_fotos_combos_y_productos_poster_combo_agosto_combo_agosto, docs_fotos_combos_y_productos_poster_combo_dos_combo_dos, docs_fotos_combos_y_productos_poster_combo_uno_combo_uno, docs_fotos_combos_y_productos_poster_yakibox_yakibox, docs_fotos_combos_y_productos_poster_yakimix_yakimix [INFERRED 0.90]
- **Core Product Line** — docs_fotos_combos_y_productos_foto_karaage_sweet_chili_karaage, docs_fotos_combos_y_productos_foto_takoyaki_takoyaki, docs_fotos_combos_y_productos_foto_taiyaki_taiyaki, docs_fotos_combos_y_productos_foto_onigiri_nori_onigiri, docs_fotos_combos_y_productos_foto_yakimeshi_yakimeshi, img_carta_ramen_ramen [INFERRED 0.95]
- **Menu Card Imagery** — img_carta_ramen_ramen, img_carta_taiyaki_taiyaki_menu, img_carta_takoyaki_takoyaki_menu, img_carta_yakimix_yakimix_menu [INFERRED 0.85]
- **Yaki Yaki carta dish photo set on teal backdrop** — img_carta_ebi_furai, img_carta_gohan_nori, img_carta_gohan_yakimeshi, img_carta_gyozas, img_carta_karaage_sweet_chili, img_carta_ebi_furai_teal_backdrop_style [INFERRED 0.85]
- **Fried dishes (deep-fried, pan-fried, stir-fried)** — img_carta_ebi_furai_dish, img_carta_karaage_sweet_chili_dish, img_carta_gyozas_dish, img_carta_gohan_yakimeshi_dish [INFERRED 0.75]
- **Serie de pósters de combos Yaki Yaki (fondo turquesa y tipografía blanca gigante)** — img_carta_poster_combo_dos, img_carta_poster_combo_uno, img_carta_poster_yakimix [INFERRED 0.85]
- **Trío de entradas nikkei (takoyaki, gyoza y ebi furai) en Combo Uno y YakiMIX** — img_carta_poster_combo_uno_takoyaki, img_carta_poster_combo_uno_gyoza, img_carta_poster_combo_uno_ebi_furai, img_carta_poster_yakimix_takoyaki, img_carta_poster_yakimix_gyoza, img_carta_poster_yakimix_ebi_furai [INFERRED 0.85]

## Communities (29 total, 11 thin omitted)

### Community 0 - "Estrategia y página final"
Cohesion: 0.07
Nodes (52): Dirección en Google Maps: Jr. Carlos Neuhaus Rizo Patrón 110, Nota de precios: Precios en el local y por WhatsApp. En Rappi y PedidosYa pueden variar., Cabecera configurable (cabecera, cabeceraPromo, parámetro cabecera), Interruptores de negocio.js (whatsapp.confirmado, consumoEnLocal, marcasHermanas.mostrar), Pedido por WhatsApp (Agregar, Tu pedido, Enviar pedido), Barra inferior de celular (Pedir ahora, WhatsApp, Llamar), Botones y jerarquía de pedido (hoja con canales), Cambios del 2026-10-05 en la página final (YAKI YAKI como título, carta seguida, sin botones de llamar) (+44 more)

### Community 1 - "Sistema visual (fase B)"
Cohesion: 0.08
Nodes (34): Datos nuevos del material (sabores, contenidos de combos, limorada, logo, turquesa), Preguntas abiertas para el negocio, Contraste AA (tinta sobre chili 5.8:1), Entregables de la Fase B (muestra, tokens, componentes, marca, provisional), Movimiento: solo opacidad y posición, respeta reducir movimiento, Paleta del PDF: tinta, crema y turquesa con coral y chili de acento, Portada: foto oscura con la comida a un lado y vapor, Elementos provisionales (logo trazado, fotos recortadas, sin foto nocturna) (+26 more)

### Community 2 - "Datos y guía de edición"
Cohesion: 0.10
Nodes (27): Carta seguida con enlace por categoría (#menu-entradas), Todo sale de dos archivos de datos (negocio.js y carta.js), Fotos en img/carta con variante -400 para chica true, Opciones por plato (opciones, elegir 2) y pasos de la Yakibox, Publicar: carpeta publicar/ a Vercel en cinco pasos, Reglas de edición (precio null muestra Consultar, visible false, categoría vacía, canal vacío), Cabeceras de seguridad en publicar/vercel.json, El código de una web no se puede encriptar (+19 more)

### Community 3 - "Pósters y combos"
Cohesion: 0.08
Nodes (33): Póster Combo Dos, Caja de empaque ilustrada con olas y criaturas marinas, Combo Dos, Estilo de póster de combo: fondo turquesa, texto blanco gigante, insignia de precio y bocado en palillos, Gohan nori rice (bola de arroz envuelta en nori con sésamo), Gohan yakimeshi (bola de arroz frito con huevo), Karaage con salsa cremosa en vaso, Precio s/25 (insignia circular azul marino) (+25 more)

### Community 4 - "Carta real y fuentes"
Cohesion: 0.14
Nodes (31): Contradicciones y cómo quedaron en la muestra, Ebi furai 6 piezas (S/ 12.90 local, S/ 16.90 Rappi), Fuentes de cada dato (PDF, Rappi, Instagram), Gohan, bola de arroz (S/ 5.00): Nori rice o Yakimeshi, Gyozas 7 piezas (S/ 12.90), Imágenes recibidas el 2026-10-05 (segunda tanda), Productos vistos en Instagram sin precio, Karaage mediano S/ 12.90 y grande S/ 19.90 (+23 more)

### Community 5 - "Fotos de platos"
Cohesion: 0.10
Nodes (29): Ebi Furai photo, Deep frying, Ebi Furai, Low-res cut-out on white pill backdrop (photo style), Shrimp (ebi), Teal backdrop with white plating (photo style), Unidentified breaded rectangular pieces, Gohan Nori photo (+21 more)

### Community 6 - "Carrito de WhatsApp (pedido.js)"
Cohesion: 0.19
Nodes (28): abrirAgregar(), agregar(), agregarYakibox(), avisar(), cambiar(), cantidadElegida(), cargar(), centimos() (+20 more)

### Community 7 - "Revisión y auditoría"
Cohesion: 0.15
Nodes (19): Revisar después de editar (servidor.py y revisar.py), Cómo comprobar la seguridad (revisar.py, servidor.py, auditar-navegador.js), Analizador, cargar_datos(), falla(), imagen_existe(), leer(), Revisión automática de la web de Yaki Yaki. Revisa datos, HTML, CSS, JS,… (+11 more)

### Community 8 - "Armado de la página (sitio.js)"
Cohesion: 0.13
Nodes (18): armar(), ahoraEnLima(), botonPedir(), cifra(), completar(), diaHorario(), enlaceWhatsApp(), esc() (+10 more)

### Community 9 - "Fotos del cliente y marca"
Cohesion: 0.12
Nodes (21): Yaki Yaki Logo, Color Palette: Turquoise & Coral, Japanese Cuisine Aesthetic, Karaage Sweet Chili, Onigiri Nori, Taiyaki, Takoyaki, Yakimeshi (+13 more)

### Community 10 - "Capturas del pedido"
Cohesion: 0.12
Nodes (16): Call-to-Action Button (Pedir ahora), Item Quantity Controls (- / + buttons), Order Cart Modal (Tu pedido), Order Total Display (S/ 115.70), WhatsApp Order Send Button, Acompañamientos (Sides) Category, Combos Category, Entradas (Appetizers) Category (+8 more)

### Community 11 - "Publicación (publicar.py)"
Cohesion: 0.23
Nodes (14): datos_publicos(), escribir(), _hojas(), imagenes_usadas(), main(), minificar_css(), minificar_html(), minificar_js() (+6 more)

### Community 12 - "Sitios de referencia"
Cohesion: 0.17
Nodes (13): Acevichado 10 Makis, S/ 23.9 (sitio de referencia amarillo), Sección «Los favoritos» (sitio de referencia amarillo), Full Makis 50, S/ 123.9 (sitio de referencia amarillo), Gyozas, S/ 13.9 (sitio de referencia amarillo), Nori taco (producto de NT Taco), NT Taco (sitio de referencia, «revolución nikkei»), Collage de fotos de NT Taco (nori tacos, boxes, gyozas), Ubicación de NT Taco: Av. Santa Cruz 855, Miraflores (+5 more)

### Community 13 - "Boxes de NT Taco"
Cohesion: 0.40
Nodes (5): Genki Box (NT Taco), Acceso a la carta de salón y de delivery (NT Taco), Nikkei Revolution Box (NT Taco), NT Experience Box (NT Taco), Veggie Power Box (NT Taco)

### Community 14 - "Carrusel de NT Taco"
Cohesion: 0.50
Nodes (4): 10-DO BOX (NT Taco), Double Box (NT Taco), Just Nori Taco (NT Taco), Product Carousel Navigation Pattern

### Community 15 - "Cabecera: estado y dirección"
Cohesion: 0.67
Nodes (3): Business Operating Status (Open/Close Time), Header with Status and Location, Address Display (Calle 31 n.° 110, San Isidro)

### Community 16 - "Marca y navegación"
Cohesion: 0.67
Nodes (3): Business Name and Tagline (Yaki Yaki - Nikkei snack bar), Main Navigation Menu, Nikkei Cuisine (Japanese-Peruvian fusion)

### Community 17 - "Logos y mancha"
Cohesion: 1.00
Nodes (3): Yaki Yaki Brand Logo (Dark Background), Yaki Yaki Brand Logo (Light Background), Decorative Blob Shape (Mancha)

## Ambiguous Edges - Review These
- `Karaage mediano S/ 12.90 y grande S/ 19.90` → `Menú con precios de Rappi (2026-10-05)`  [AMBIGUOUS]
  docs/carta-y-datos.md · relation: conceptually_related_to
- `Productos mencionados en redes sin precio (Combo Ramen, YakiMix, sabores de takoyaki, Bobba Juice)` → `Combo Ramen (PEN 20.00)`  [AMBIGUOUS]
  docs/yakiyaki-investigacion-y-prompt-web.md · relation: conceptually_related_to
- `Ebi Furai` → `Unidentified breaded rectangular pieces`  [AMBIGUOUS]
  img/carta/ebi-furai.webp · relation: conceptually_related_to

## Knowledge Gaps
- **68 isolated node(s):** `Fotos en img/carta con variante -400 para chica true`, `Lo que más importa: las cuentas (verificación en dos pasos)`, `Concepto de marca: esquina japonesa contemporánea y cálida`, `Respaldo sin JavaScript (sin-js.css y aviso con WhatsApp)`, `Botones y enlaces con sus estados` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 98 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Karaage mediano S/ 12.90 y grande S/ 19.90` and `Menú con precios de Rappi (2026-10-05)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Productos mencionados en redes sin precio (Combo Ramen, YakiMix, sabores de takoyaki, Bobba Juice)` and `Combo Ramen (PEN 20.00)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Ebi Furai` and `Unidentified breaded rectangular pieces`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Carga de scripts externos sin código en línea` connect `Datos y guía de edición` to `Estrategia y página final`, `Sistema visual (fase B)`, `Carrito de WhatsApp (pedido.js)`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `index.html (página final de Yaki Yaki)` connect `Estrategia y página final` to `Sistema visual (fase B)`, `Datos y guía de edición`, `Carta real y fuentes`, `Revisión y auditoría`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `muestra-componentes.html (muestra interna del sistema visual)` connect `Sistema visual (fase B)` to `Estrategia y página final`, `Datos y guía de edición`, `Carta real y fuentes`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Precios: carta del local frente a Rappi` (e.g. with `Catálogo de combos (PEN)` and `Menú con precios de Rappi (2026-10-05)`) actually correct?**
  _`Precios: carta del local frente a Rappi` has 3 INFERRED edges - model-reasoned connections that need verification._