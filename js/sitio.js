/* =========================================================================
   Yakiyaki: arma la página con data/negocio.js y data/carta.js.
   No hace falta tocar este archivo para cambiar textos, precios o platos.
   ========================================================================= */
(function () {
  'use strict';

  var Y = window.YAKI || {};
  var N = Y.negocio, T = Y.textos, C = Y.carta;

  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  /* Si un archivo de datos tiene un error (por ejemplo, una coma de menos),
     se avisa arriba de la página para que se note al revisar. */
  function avisarError(detalle) {
    var aviso = document.createElement('p');
    aviso.className = 'aviso-error';
    aviso.setAttribute('role', 'alert');
    aviso.textContent = 'No se pudo armar la página: revisa data/negocio.js y data/carta.js. ' + (detalle || '');
    document.body.insertBefore(aviso, document.body.firstChild);
  }

  if (!N || !T || !C) {
    avisarError('Falta uno de los archivos de datos o tiene un error de escritura.');
    return;
  }

  try { armar(); } catch (error) { avisarError(String(error && error.message || error)); }

  function armar() {
    var platos = {};
    C.platos.forEach(function (p) { platos[p.id] = p; });

    // Con WhatsApp confirmado, los platos se agregan a un pedido que sale armado en el mensaje.
    var conPedido = Boolean(N.whatsapp && N.whatsapp.confirmado && N.pedidoPorWhatsApp !== false);
    YAKI.conPedido = conPedido;

    /* ---- Ayudas ---------------------------------------------------------- */
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function leer(objeto, ruta) {
      return ruta.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, objeto);
    }
    function completar(texto, extra) {
      return String(texto).replace(/\{(\w+)\}/g, function (todo, clave) {
        if (extra && extra[clave] != null) return extra[clave];
        if (N.direccion[clave] != null) return N.direccion[clave];
        return todo;
      });
    }
    function visible(p) { return Boolean(p) && p.visible !== false; }
    // Solo enlaces https: un enlace raro en los datos (por ejemplo javascript:) no se publica.
    function seguro(url) { return /^https:\/\/[^\s"'<>]+$/i.test(String(url || '')) ? String(url) : ''; }
    // El número de WhatsApp solo puede tener dígitos; si no, WhatsApp se apaga.
    if (N.whatsapp && !/^\d{8,15}$/.test(String(N.whatsapp.numero))) N.whatsapp.confirmado = false;
    var rappi = seguro(N.canales.rappi), pedidosya = seguro(N.canales.pedidosya);
    // El número no se parte en dos líneas.
    var numero = String(N.telefono.mostrar).replace(/ /g, '\u00a0');
    function cifra(n) { return Number(n) % 1 === 0 ? String(Number(n)) : Number(n).toFixed(2); }
    function precioHTML(n) {
      return '<span class="solo-lectores">' + cifra(n) + ' soles</span>' +
        '<span aria-hidden="true"><span class="precio__moneda">S/</span>' + cifra(n) + '</span>';
    }
    function precioDe(p) {
      if (p.precio != null) return p.precio;
      if (p.variantes && p.variantes.length) return Math.min.apply(null, p.variantes.map(function (v) { return v.precio; }));
      return null;
    }
    function imagenHTML(f, clase, sizes, alt, prioridad) {
      var src = esc(f.src + '.webp');
      var srcset = f.chica ? ' srcset="' + esc(f.src + '-400.webp') + ' 400w, ' + src + ' ' + Number(f.ancho) + 'w" sizes="' + sizes + '"' : '';
      return '<img' + (clase ? ' class="' + clase + '"' : '') + ' src="' + src + '"' + srcset +
        ' alt="' + esc(alt != null ? alt : f.alt) + '" width="' + Number(f.ancho) + '" height="' + Number(f.alto) + '"' +
        (prioridad ? '' : ' loading="lazy"') + ' decoding="async">';
    }
    function selloHTML(precio, clase) {
      return '<p class="sello-precio' + (clase ? ' ' + clase : '') + '" data-pop>' +
        '<svg class="sello-precio__forma" aria-hidden="true"><use href="#mancha"/></svg>' +
        '<span class="precio">' + precioHTML(precio) + '</span></p>';
    }
    function botonPedir(p, clase) {
      clase = 'boton boton--chico ' + (clase || 'boton--primario');
      if (conPedido) {
        return '<button class="' + clase + ' boton--agregar" type="button" data-agregar="' + esc(p.id) + '">' +
          '<svg class="icono" aria-hidden="true"><use href="#i-mas"/></svg>' + esc(T.pedido.agregar) +
          '<span class="solo-lectores"> ' + esc(p.nombre) + '</span></button>';
      }
      return '<button class="' + clase + '" type="button" data-abrir-pedido data-producto="' + esc(p.nombre) + '">' +
        'Pedir<span class="solo-lectores"> ' + esc(p.nombre) + '</span></button>';
    }
    function llenar(nombre, html) {
      $$('[data-lista="' + nombre + '"]').forEach(function (el) { el.innerHTML = html; });
    }

    /* ---- Cabecera: dato extra junto al logo (opcional) ------------------------ */
    var modoCabecera = '';
    try { modoCabecera = new URLSearchParams(location.search).get('cabecera') || ''; } catch (e) { /* navegador antiguo */ }
    modoCabecera = (modoCabecera || N.cabecera || '').trim();
    var extra = $('[data-cabecera-extra]');
    if (extra && modoCabecera) {
      var partes = [];
      if (/estado/.test(modoCabecera)) partes.push('<p class="estado" data-estado hidden></p>');
      if (/direccion/.test(modoCabecera)) {
        partes.push('<a class="cabecera__dato" data-como-llegar target="_blank" rel="noopener"><svg class="icono" aria-hidden="true"><use href="#i-pin"/></svg>' +
          esc(N.direccion.calle) + ', ' + esc(N.direccion.distrito) + '<span class="solo-lectores"> (cómo llegar, se abre en otra pestaña)</span></a>');
      }
      if (modoCabecera === 'promo') {
        var promo = platos[N.cabeceraPromo];
        if (visible(promo) && promo.precio != null) {
          partes.push('<a class="cabecera__dato cabecera__promo" href="#combos">' + esc(promo.nombre) + ' a <b>S/ ' + cifra(promo.precio) + '</b>' +
            ' <svg class="icono" aria-hidden="true"><use href="#i-flecha"/></svg></a>');
        }
      }
      if (modoCabecera === 'marca') {
        partes.push('<p class="cabecera__marca"><b>' + esc(N.nombre) + '</b><span>' + esc(N.descriptor) + '</span></p>');
      }
      if (partes.length) { extra.innerHTML = partes.join(''); extra.hidden = false; }
    }

    /* ---- Textos ------------------------------------------------------------ */
    $$('[data-t]').forEach(function (el) {
      var valor = leer(T, el.getAttribute('data-t'));
      if (typeof valor === 'string') el.textContent = completar(valor);
    });
    $$('[data-nombre]').forEach(function (el) { el.textContent = N.nombre; });
    $$('[data-descriptor]').forEach(function (el) { el.textContent = N.descriptor; });
    var apps = [rappi && 'Rappi', pedidosya && 'PedidosYa'].filter(Boolean);
    var nota = apps.length ? completar(N.notaPrecios, { apps: apps.join(' y ') }) : N.notaPrecios.split('.')[0] + '.';
    $$('[data-nota-precios]').forEach(function (el) { el.textContent = nota; });
    $$('[data-anio]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    $('[data-portada-titulo]').innerHTML = T.portada.titulo.map(function (linea) {
      return '<span class="linea"><span>' + esc(linea) + '</span></span>';
    }).join(' ');
    $('[data-portada-bajada]').textContent = T.portada.bajada;
    $$('[data-t="combos.bajada"]').forEach(function (el) { el.hidden = !T.combos.bajada; });
    $('#hoja-titulo').textContent = conPedido ? T.pedido.titulo : T.pedido.tituloSinCarrito;
    $('[data-nosotros-texto]').textContent = completar(T.nosotros.texto);

    /* ---- Favoritos --------------------------------------------------------- */
    var favoritos = C.favoritos.map(function (id) { return platos[id]; }).filter(visible);
    llenar('favoritos', favoritos.map(function (p) {
      var precio = precioDe(p), foto = p.foto || p.poster;
      return '<article class="ticket">' +
        '<div class="ticket__foto">' + (foto ? imagenHTML(foto, '', '(min-width: 60rem) 280px, 45vw') : '') + '</div>' +
        (precio != null ? selloHTML(precio) : '') +
        '<div class="ticket__cuerpo">' +
          '<h3 class="titulo ticket__nombre">' + esc(p.nombre) + '</h3>' +
          '<p class="ticket__desc">' + esc(p.descripcion) + '</p>' + botonPedir(p) +
        '</div></article>';
    }).join(''));
    if (!favoritos.length) $('#favoritos').hidden = true;

    /* ---- Combos ------------------------------------------------------------ */
    var combos = C.combos.map(function (id) { return platos[id]; }).filter(visible);
    llenar('combos', combos.map(function (p) {
      var imagen = p.poster || p.foto;
      return '<li class="combo">' + (imagen ? imagenHTML(imagen, 'combo__poster', '(min-width: 60rem) 360px, 80vw') : '') +
        '<h3 class="titulo combo__nombre">' + esc(p.nombre) + '</h3>' +
        '<p class="combo__desc">' + esc(p.descripcion) + '</p>' +
        '<div class="combo__pie">' +
          (p.precio != null ? '<p class="precio">' + precioHTML(p.precio) + '</p>' : '<p class="precio--consultar">Consultar</p>') +
          botonPedir(p) +
        '</div></li>';
    }).join(''));
    if (!combos.length) $('#combos').hidden = true;

    /* ---- Galería de "Nosotros" ----------------------------------------------- */
    llenar('galeria', (C.galeria || []).map(function (f) {
      return '<li><figure>' + imagenHTML(f, '', '(min-width: 60rem) 304px, 76vw') +
        '<figcaption>' + esc(f.texto) + '</figcaption></figure></li>';
    }).join(''));

    /* ---- Carta ------------------------------------------------------------- */
    var categorias = C.categorias.map(function (c) {
      return { c: c, platos: C.platos.filter(function (p) { return visible(p) && p.categorias.indexOf(c.id) >= 0; }) };
    }).filter(function (x) { return x.platos.length; });

    function platoHTML(p) {
      var conTamanos = p.variantes && p.variantes.length;
      var info = '<h4 class="titulo plato__nombre">' + esc(p.nombre) + '</h4>' +
        '<p class="plato__desc">' + esc(p.descripcion) + '</p>';
      if (conTamanos) {
        info += '<dl class="precios">' + p.variantes.map(function (v) {
          return '<div><dt>' + esc(v.nombre) + '</dt><dd><span class="precio">' + precioHTML(v.precio) + '</span></dd></div>';
        }).join('') + '</dl>';
      }
      if (p.opciones) {
        info += '<ul class="chips" aria-label="' + esc(p.opciones.titulo) + '">' +
          p.opciones.lista.map(function (o) { return '<li class="chip">' + esc(o) + '</li>'; }).join('') + '</ul>';
      }
      var precio = conTamanos ? '' : (p.precio != null ? '<p class="precio">' + precioHTML(p.precio) + '</p>' : '<p class="precio--consultar">Consultar</p>');
      var boton = conPedido ? botonPedir(p, 'boton--secundario') : '';
      return '<li class="plato"><div class="plato__info">' + info + '</div>' +
        ((precio || boton) ? '<div class="plato__accion">' + precio + boton + '</div>' : '') + '</li>';
    }

    // Toda la carta seguida, separada por categoría. Cada una tiene enlace propio (#menu-entradas).
    llenar('carta', categorias.map(function (x) {
      return '<section class="carta__categoria" id="menu-' + esc(x.c.id) + '" aria-labelledby="categoria-' + esc(x.c.id) + '">' +
        '<h3 class="titulo carta__titulo" id="categoria-' + esc(x.c.id) + '">' + esc(x.c.nombre) + '</h3>' +
        '<ul class="platos">' + x.platos.map(platoHTML).join('') + '</ul></section>';
    }).join(''));

    /* ---- Arma tu YakiBox --------------------------------------------------- */
    var caja = C.yakibox && platos[C.yakibox.plato];
    if (!visible(caja)) {
      $('#yakibox').hidden = true;
    } else {
      llenar('yakibox-fotos', C.yakibox.fotos.map(function (f) {
        return imagenHTML(f, '', '(min-width: 60rem) 300px, 50vw', '');
      }).join('') + '<svg class="trazos" aria-hidden="true"><use href="#ajiro"/></svg>' +
        (caja.precio != null ? selloHTML(caja.precio, 'sello-precio--grande') : ''));
      if (conPedido) {
        var botonCaja = $('[data-producto-desde="yakibox"]');
        botonCaja.removeAttribute('data-abrir-pedido');
        botonCaja.setAttribute('data-agregar-yakibox', '');
      }
      $('[data-lista="yakibox-pasos"]').addEventListener('submit', function (e) { e.preventDefault(); });
      llenar('yakibox-pasos', C.yakibox.pasos.map(function (paso, i) {
        return '<fieldset class="paso"><legend>' + esc(paso.titulo) + '</legend><div class="chips">' +
          paso.opciones.map(function (o) {
            return '<label class="opcion"><input type="radio" name="yakibox-' + i + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>';
          }).join('') + '</div></fieldset>';
      }).join(''));
    }

    /* ---- Contacto y canales ------------------------------------------------- */
    var d = N.direccion;
    var busqueda = encodeURIComponent(d.busquedaMaps);

    function enlaceWhatsApp(producto) {
      var mensaje = producto ? completar(N.whatsapp.saludoProducto, { producto: producto }) : N.whatsapp.saludo;
      return 'https://wa.me/' + N.whatsapp.numero + '?text=' + encodeURIComponent(mensaje);
    }

    var canales = [];
    if (rappi) canales.push({ nombre: 'Rappi', detalle: 'Delivery con los precios de Rappi', href: rappi, icono: 'i-moto', fuera: true });
    if (pedidosya) canales.push({ nombre: 'PedidosYa', detalle: 'Delivery con los precios de PedidosYa', href: pedidosya, icono: 'i-moto', fuera: true });
    if (N.whatsapp.confirmado) canales.push({ nombre: 'WhatsApp', detalle: 'Escríbenos al ' + numero, href: enlaceWhatsApp(), icono: 'i-whatsapp', fuera: true, wa: true });

    llenar('canales', canales.map(function (c) {
      return '<li data-canal="' + esc(c.nombre.toLowerCase()) + '"><a class="canal" href="' + esc(c.href) + '"' + (c.fuera ? ' target="_blank" rel="noopener"' : '') + (c.wa ? ' data-whatsapp' : '') + '>' +
        '<span class="canal__icono"><svg class="icono" aria-hidden="true"><use href="#' + c.icono + '"/></svg></span>' +
        '<span><span class="canal__nombre">' + esc(c.nombre) + '</span><span class="canal__detalle">' + esc(c.detalle) + '</span></span>' +
        '<svg class="icono" aria-hidden="true"><use href="#' + (c.fuera ? 'i-externo' : 'i-flecha') + '"/></svg>' +
        (c.fuera ? '<span class="solo-lectores"> (se abre en otra pestaña)</span>' : '') + '</a></li>';
    }).join(''));

    llenar('barra', '<button class="boton boton--primario" type="button" data-abrir-pedido data-con-contador><span>' + esc(T.menu.pedir) + '</span></button>' +
      (N.whatsapp.confirmado ? '<a class="boton boton--icono" href="' + esc(enlaceWhatsApp()) + '" target="_blank" rel="noopener" data-whatsapp>' +
        '<svg class="icono" aria-hidden="true"><use href="#i-whatsapp"/></svg>' + esc(T.ubicacion.whatsapp) + '</a>' : ''));

    llenar('redes', [
      seguro(N.redes.instagram) && '<li><a class="nav-enlace pie__red" href="' + esc(seguro(N.redes.instagram)) + '" target="_blank" rel="noopener"><svg class="icono" aria-hidden="true"><use href="#i-instagram"/></svg>Instagram</a></li>',
      seguro(N.redes.tiktok) && '<li><a class="nav-enlace pie__red" href="' + esc(seguro(N.redes.tiktok)) + '" target="_blank" rel="noopener"><svg class="icono" aria-hidden="true"><use href="#i-tiktok"/></svg>TikTok</a></li>'
    ].filter(Boolean).join(''));

    $$('[data-direccion]').forEach(function (el) {
      el.innerHTML = esc(d.calle) + '<br>' + esc(d.urbanizacion) + ', ' + esc(d.distrito) + '<br>' + esc(d.ciudad);
    });
    $$('[data-como-llegar]').forEach(function (a) {
      a.href = seguro(d.enlaceMaps) || 'https://www.google.com/maps/dir/?api=1&destination=' + busqueda;
    });
    // WhatsApp en Ubicación y en el pie (solo si está confirmado).
    $$('[data-whatsapp-boton]').forEach(function (a) { a.hidden = !N.whatsapp.confirmado; a.href = enlaceWhatsApp(); });
    $$('[data-whatsapp-texto]').forEach(function (a) {
      a.hidden = !N.whatsapp.confirmado;
      a.href = enlaceWhatsApp();
      a.querySelector('span').textContent = 'WhatsApp ' + numero;
    });
    $$('[data-recoger]').forEach(function (el) { el.textContent = completar(T.pedido.recoger); });

    // Mapa de Google: aislado (sandbox) para que no pueda mover ni tocar la página.
    // Se arma con la dirección puesta antes de insertarlo; así nunca queda vacío y aislado a medias.
    var cajaMapa = $('[data-mapa-caja]');
    if (cajaMapa) {
      var mapa = document.createElement('iframe');
      mapa.setAttribute('loading', 'lazy');
      mapa.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      mapa.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      mapa.title = 'Mapa: ' + d.calle + ', ' + d.distrito;
      mapa.src = 'https://maps.google.com/maps?q=' + busqueda + '&z=16&output=embed';
      cajaMapa.appendChild(mapa);
    }
    $$('[data-mapa-texto]').forEach(function (el) { el.textContent = d.calle + ', ' + d.distrito; });

    /* ---- Marcas hermanas ----------------------------------------------------- */
    if (N.marcasHermanas && N.marcasHermanas.mostrar) {
      llenar('marcas', N.marcasHermanas.lista.filter(function (m) { return seguro(m.enlace); }).map(function (m) {
        return '<li><a class="enlace-flecha" href="' + esc(seguro(m.enlace)) + '" target="_blank" rel="noopener">' + esc(m.nombre) +
          ' <svg class="icono" aria-hidden="true"><use href="#i-externo"/></svg></a></li>';
      }).join(''));
      $('#marcas').hidden = false;
    }

    /* ---- Horario y estado (hora de Lima) ------------------------------------ */
    var DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    var NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    var EN_INGLES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    function diaHorario(i) { return N.horario[DIAS[i]]; }
    function publicado(h) { return h === 'cerrado' || (h && typeof h === 'object'); }

    var grupos = [];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (i, posicion, orden) {
      var h = diaHorario(i);
      if (!publicado(h)) return;
      var clave = h === 'cerrado' ? 'cerrado' : h.abre + '-' + h.cierra;
      var ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.clave === clave && ultimo.fin === orden[posicion - 1]) ultimo.fin = i;
      else grupos.push({ clave: clave, inicio: i, fin: i, h: h });
    });
    $$('[data-horario]').forEach(function (el) {
      el.innerHTML = grupos.map(function (g) {
        var dias = g.inicio === g.fin ? NOMBRES[g.inicio] : NOMBRES[g.inicio] + ' a ' + NOMBRES[g.fin].toLowerCase();
        var horas = g.h === 'cerrado' ? 'Cerrado' : g.h.abre + ' a ' + g.h.cierra;
        return '<div><dt>' + esc(dias) + '</dt><dd>' + esc(horas) + '</dd></div>';
      }).join('');
    });

    function ahoraEnLima() {
      var partes = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value; });
      return { dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday), minuto: (Number(partes.hour) % 24) * 60 + Number(partes.minute) };
    }
    function minutos(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }

    function estado() {
      var ahora = ahoraEnLima(), hoy = diaHorario(ahora.dia);
      if (!publicado(hoy)) return null;                        // día sin confirmar: no se dice nada
      if (hoy !== 'cerrado') {
        if (ahora.minuto >= minutos(hoy.abre) && ahora.minuto < minutos(hoy.cierra)) return { abierto: true, texto: 'Abierto ahora, cierra a las ' + hoy.cierra };
        if (ahora.minuto < minutos(hoy.abre)) return { abierto: false, texto: 'Cerrado ahora, abre hoy a las ' + hoy.abre };
      }
      for (var k = 1; k <= 7; k++) {
        var i = (ahora.dia + k) % 7, h = diaHorario(i);
        if (!publicado(h)) return { abierto: false, texto: 'Cerrado ahora' };
        if (h !== 'cerrado') return { abierto: false, texto: 'Cerrado ahora, abre ' + (k === 1 ? 'mañana' : 'el ' + NOMBRES[i].toLowerCase()) + ' a las ' + h.abre };
      }
      return { abierto: false, texto: 'Cerrado ahora' };
    }
    function pintarEstado() {
      var e = estado();
      $$('[data-estado]').forEach(function (el) {
        el.hidden = !e;
        if (!e) return;
        el.textContent = e.texto;
        el.classList.toggle('estado--cerrado', !e.abierto);
      });
    }
    pintarEstado();
    setInterval(pintarEstado, 60000);

    /* ---- Hoja de pedido: qué se va a pedir ----------------------------------- */
    function lista(partes) {
      return partes.length < 2 ? partes.join('') : partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
    }
    function pedidoYakibox() {
      var elegidos = C.yakibox.pasos.map(function (paso, i) {
        var marcado = $('#yakibox input[name="yakibox-' + i + '"]:checked');
        if (!marcado) return null;
        return /karaage/i.test(paso.titulo) ? 'karaage ' + marcado.value : marcado.value;
      }).filter(Boolean);
      return elegidos.length ? 'YakiBox con ' + lista(elegidos) : 'YakiBox';
    }
    var hoja = $('#hoja-pedido');
    if (hoja && !conPedido) {               // con pedido por WhatsApp, esto lo maneja pedido.js
      hoja.addEventListener('antes-de-abrir', function (e) {
        var origen = e.detail && e.detail.origen;
        var producto = '';
        if (origen && origen.getAttribute('data-producto-desde') === 'yakibox') producto = pedidoYakibox();
        else if (origen) producto = origen.getAttribute('data-producto') || '';
        var linea = $('[data-hoja-producto]', hoja);
        linea.hidden = !producto;
        linea.textContent = producto ? T.pedido.vasAPedir + ' ' + producto : '';
        $$('[data-whatsapp]', hoja).forEach(function (a) { a.href = enlaceWhatsApp(producto); });
      });
    }

    /* ---- Menú del celular -------------------------------------------------- */
    var botonMenu = $('.cabecera__menu');
    function cerrarMenu() {
      botonMenu.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-abierto');
    }
    if (botonMenu) {
      botonMenu.addEventListener('click', function () {
        var abrir = botonMenu.getAttribute('aria-expanded') !== 'true';
        botonMenu.setAttribute('aria-expanded', String(abrir));
        document.body.classList.toggle('menu-abierto', abrir);
      });
      $('#menu-principal').addEventListener('click', function (e) { if (e.target.closest('a')) cerrarMenu(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('menu-abierto')) { cerrarMenu(); botonMenu.focus(); }
      });
      document.addEventListener('click', function (e) {
        if (document.body.classList.contains('menu-abierto') && !e.target.closest('.cabecera')) cerrarMenu();
      });
    }

    /* ---- Datos para Google (solo datos confirmados) -------------------------- */
    var especificacion = grupos.filter(function (g) { return g.h !== 'cerrado'; }).map(function (g) {
      var dias = [], i = g.inicio;
      for (;;) { dias.push(EN_INGLES[i]); if (i === g.fin) break; i = (i + 1) % 7; }
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: dias, opens: g.h.abre, closes: g.h.cierra };
    });
    var datos = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: N.nombre,
      alternateName: 'Yakiyaki',
      description: N.descriptor + ' en ' + d.distrito + ', ' + d.ciudad + '.',
      address: { '@type': 'PostalAddress', streetAddress: d.calle, addressLocality: d.distrito, addressRegion: d.ciudad, addressCountry: 'PE' },
      openingHoursSpecification: especificacion,
      sameAs: [N.redes.instagram, N.redes.tiktok].filter(Boolean)
    };
    if (/^https?:$/.test(location.protocol)) datos.url = location.origin + location.pathname;
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify(datos);
    document.head.appendChild(ld);
  }
})();
