/* =========================================================================
   Yakiyaki: pedido por WhatsApp.
   La persona agrega platos (con sabor, tamaño y cantidad), revisa su pedido
   y lo envía por WhatsApp con el mensaje ya escrito. No hay pagos en línea:
   el local confirma el pedido por WhatsApp.
   Se activa solo si whatsapp.confirmado y pedidoPorWhatsApp están en true.
   ========================================================================= */
(function () {
  'use strict';

  var Y = window.YAKI || {};
  var N = Y.negocio, T = Y.textos, C = Y.carta;
  if (!N || !T || !C || !Y.conPedido) return;

  var CLAVE = 'yakiyaki-pedido-v1';
  var MAXIMO = 20;
  var platos = {};
  C.platos.forEach(function (p) { platos[p.id] = p; });

  /* ---- Ayudas -------------------------------------------------------------- */
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function centimos(soles) { return Math.round(Number(soles) * 100); }
  function cifra(cents) { var s = cents / 100; return s % 1 === 0 ? String(s) : s.toFixed(2); }
  function completar(texto, extra) {
    return String(texto).replace(/\{(\w+)\}/g, function (todo, k) { return extra && extra[k] != null ? extra[k] : todo; });
  }
  function icono(id) { return '<svg class="icono" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---- Qué se elige en cada plato ------------------------------------------- */
  // Grupos de opciones: [{ titulo, lista, elegir, prefijo }]
  function gruposDe(p) {
    if (C.yakibox && p.id === C.yakibox.plato) {
      return C.yakibox.pasos.map(function (paso) {
        return { titulo: paso.titulo, lista: paso.opciones, elegir: 1, prefijo: paso.prefijo || '' };
      });
    }
    return p.opciones && p.opciones.lista ? [{ titulo: p.opciones.titulo, lista: p.opciones.lista, elegir: p.opciones.elegir || 1, prefijo: '' }] : [];
  }
  function tieneTamanos(p) { return Boolean(p.variantes && p.variantes.length); }
  function hayQueElegir(p) { return tieneTamanos(p) || gruposDe(p).length > 0; }

  /* ---- Estado del pedido: [{ id, variante, opciones, cantidad }] -------------- */
  var pedido = cargar();

  // Lo guardado se revisa contra la carta actual: si un plato, tamaño u opción
  // ya no existe (o alguien editó el almacenamiento), ese plato se descarta.
  function valido(it) {
    var p = it && typeof it.id === 'string' && Object.prototype.hasOwnProperty.call(platos, it.id) ? platos[it.id] : null;
    if (!p || p.visible === false) return false;
    if (!(Number.isInteger(it.cantidad) && it.cantidad >= 1 && it.cantidad <= MAXIMO)) return false;
    if (tieneTamanos(p)) {
      if (!p.variantes.some(function (v) { return v.nombre === it.variante; })) return false;
    } else if (it.variante != null) return false;
    var grupos = gruposDe(p);
    var permitidas = [];
    grupos.forEach(function (g) { g.lista.forEach(function (o) { permitidas.push(g.prefijo + o); }); });
    var opciones = Array.isArray(it.opciones) ? it.opciones : [];
    if (opciones.length > grupos.reduce(function (n, g) { return n + g.elegir; }, 0)) return false;
    return opciones.every(function (o) { return typeof o === 'string' && permitidas.indexOf(o) >= 0; });
  }
  function cargar() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      if (!Array.isArray(datos)) return [];
      return datos.slice(0, 50).filter(valido).map(function (it) {
        return { id: it.id, variante: it.variante || null, opciones: (it.opciones || []).slice(), cantidad: it.cantidad };
      });
    } catch (e) { return []; }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch (e) { /* sin almacenamiento: el pedido dura mientras la página esté abierta */ }
  }
  function claveDe(it) { return [it.id, it.variante || '', (it.opciones || []).join('+')].join('|'); }
  function precioUnitario(it) {
    var p = platos[it.id];
    if (tieneTamanos(p)) {
      var v = p.variantes.filter(function (x) { return x.nombre === it.variante; })[0];
      return v ? centimos(v.precio) : null;
    }
    return p.precio != null ? centimos(p.precio) : null;
  }
  function detalle(it) { return [it.variante].concat(it.opciones || []).filter(Boolean).join(', '); }

  function agregar(it) {
    var cantidad = Math.max(1, Math.min(MAXIMO, it.cantidad || 1));
    var nuevo = { id: it.id, variante: it.variante || null, opciones: it.opciones || [], cantidad: cantidad };
    var igual = pedido.filter(function (x) { return claveDe(x) === claveDe(nuevo); })[0];
    if (igual) igual.cantidad = Math.min(MAXIMO, igual.cantidad + cantidad);
    else pedido.push(nuevo);
    guardar();
    pintar();
    avisar(nuevo);
  }
  function cambiar(clave, paso) {
    pedido.forEach(function (x) { if (claveDe(x) === clave) x.cantidad = Math.min(MAXIMO, x.cantidad + paso); });
    pedido = pedido.filter(function (x) { return x.cantidad > 0; });
    guardar();
    pintar();
  }
  function quitar(clave) {
    pedido = pedido.filter(function (x) { return claveDe(x) !== clave; });
    guardar();
    pintar();
  }

  /* ---- Mensaje de WhatsApp --------------------------------------------------- */
  function totales() {
    var total = 0, aConsultar = false;
    pedido.forEach(function (it) {
      var unit = precioUnitario(it);
      if (unit == null) aConsultar = true; else total += unit * it.cantidad;
    });
    return { total: total, aConsultar: aConsultar };
  }
  // Si ningún plato del pedido tiene precio, el total no es S/ 0: es "a consultar".
  function soloAConsultar(t) { return t.aConsultar && !t.total; }
  function mensaje() {
    var lineas = [N.whatsapp.saludoPedido, ''];
    pedido.forEach(function (it) {
      var p = platos[it.id], unit = precioUnitario(it), d = detalle(it);
      lineas.push('- ' + it.cantidad + ' x ' + p.nombre + (d ? ' (' + d + ')' : '') + ': ' +
        (unit == null ? T.pedido.aConsultar : 'S/ ' + cifra(unit * it.cantidad)));
    });
    var t = totales();
    lineas.push('', '*' + T.pedido.total + ': ' + (soloAConsultar(t) ? T.pedido.aConsultar + '*' :
      'S/ ' + cifra(t.total) + '*' + (t.aConsultar ? ' + ' + T.pedido.aConsultar : '')));
    return lineas.join('\n');
  }
  function enlaceWhatsApp() {
    return 'https://wa.me/' + N.whatsapp.numero + '?text=' + encodeURIComponent(mensaje());
  }

  /* ---- Pintar: contadores y hoja "Tu pedido" --------------------------------- */
  var hoja = $('#hoja-pedido');
  var caja = $('[data-carrito]');
  var otros = $('[data-otros-titulo]');

  function pintar() {
    var unidades = pedido.reduce(function (n, it) { return n + it.cantidad; }, 0);

    // Con pedido armado, todos los botones de WhatsApp llevan el pedido.
    var saludo = 'https://wa.me/' + N.whatsapp.numero + '?text=' + encodeURIComponent(N.whatsapp.saludo);
    $$('[data-whatsapp], [data-whatsapp-boton], [data-whatsapp-texto]').forEach(function (a) {
      a.href = pedido.length ? enlaceWhatsApp() : saludo;
    });

    $$('[data-con-contador]').forEach(function (boton) {
      var c = $('.contador', boton);
      if (!unidades) { if (c) c.parentNode.removeChild(c); return; }
      if (!c) { c = document.createElement('span'); c.className = 'contador'; boton.appendChild(c); }
      c.innerHTML = '<span aria-hidden="true">' + unidades + '</span><span class="solo-lectores">, ' + unidades +
        (unidades === 1 ? ' plato' : ' platos') + ' en tu pedido</span>';
    });

    if (!caja || !hoja) return;
    caja.hidden = false;
    hoja.classList.toggle('hoja--con-pedido', pedido.length > 0);

    if (!pedido.length) {
      caja.innerHTML = '<p class="carrito__vacio">' + esc(T.pedido.vacio) + '</p>';
      otros.textContent = T.pedido.otros;
      otros.hidden = false;
      return;
    }

    var t = totales();
    caja.innerHTML = '<ul class="carrito__lista">' + pedido.map(function (it) {
      var p = platos[it.id], unit = precioUnitario(it), d = detalle(it), clave = esc(claveDe(it));
      return '<li class="carrito__item">' +
        '<div class="carrito__texto"><p class="carrito__nombre">' + esc(p.nombre) + '</p>' +
          (d ? '<p class="carrito__detalle">' + esc(d) + '</p>' : '') + '</div>' +
        '<p class="carrito__precio">' + (unit == null ? esc(T.pedido.aConsultar) :
          '<span class="precio"><span class="precio__moneda">S/</span>' + cifra(unit * it.cantidad) + '</span>') + '</p>' +
        '<div class="cantidad" role="group" aria-label="' + esc(T.pedido.cantidad) + ' de ' + esc(p.nombre) + '">' +
          '<button type="button" class="cantidad__boton" data-menos="' + clave + '">' + icono('i-menos') + '<span class="solo-lectores">Uno menos</span></button>' +
          '<span class="cantidad__numero">' + it.cantidad + '</span>' +
          '<button type="button" class="cantidad__boton" data-mas="' + clave + '"' + (it.cantidad >= MAXIMO ? ' disabled' : '') + '>' + icono('i-mas') + '<span class="solo-lectores">Uno más</span></button>' +
        '</div>' +
        '<button type="button" class="carrito__quitar" data-quitar="' + clave + '">Quitar<span class="solo-lectores"> ' + esc(p.nombre) + '</span></button>' +
      '</li>';
    }).join('') + '</ul>' +
    '<p class="carrito__total"><span>' + esc(T.pedido.total) + '</span>' + (soloAConsultar(t) ? '<span>' + esc(T.pedido.aConsultar) + '</span>' :
      '<span class="precio"><span class="precio__moneda">S/</span>' + cifra(t.total) + '</span>') + '</p>' +
    (t.aConsultar && !soloAConsultar(t) ? '<p class="carrito__nota">' + esc(T.pedido.notaConsultar) + '</p>' : '') +
    '<a class="boton boton--primario carrito__enviar" href="' + esc(enlaceWhatsApp()) + '" target="_blank" rel="noopener">' + icono('i-whatsapp') +
      esc(T.pedido.enviar) + '<span class="solo-lectores"> (se abre WhatsApp)</span></a>' +
    '<button type="button" class="carrito__vaciar" data-vaciar>' + esc(T.pedido.vaciar) + '</button>';

    otros.textContent = T.pedido.otrosConPedido;
    otros.hidden = !$$('.canales li:not([data-canal="whatsapp"])', hoja).length;
  }

  if (hoja) {
    hoja.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mas], [data-menos], [data-quitar], [data-vaciar]');
      if (!b) return;
      var tipo = ['data-mas', 'data-menos', 'data-quitar', 'data-vaciar'].filter(function (a) { return b.hasAttribute(a); })[0];
      var clave = b.getAttribute(tipo);
      if (tipo === 'data-mas') cambiar(clave, 1);
      else if (tipo === 'data-menos') cambiar(clave, -1);
      else if (tipo === 'data-quitar') quitar(clave);
      else { pedido = []; guardar(); pintar(); }
      // El foco vuelve al mismo botón (o al título si ese plato ya no está).
      var mismo = tipo !== 'data-vaciar' && hoja.querySelector('[' + tipo + '="' + (window.CSS && CSS.escape ? CSS.escape(clave) : clave) + '"]');
      (mismo || $('#hoja-titulo')).focus();
    });
  }
  $('#hoja-titulo').setAttribute('tabindex', '-1');

  /* ---- Ventana para elegir sabor, tamaño y cantidad -------------------------- */
  var dialogo = $('#hoja-agregar');
  var formulario = $('[data-form-agregar]');
  var campos = $('[data-agregar-campos]');
  var error = $('[data-agregar-error]');
  var confirmar = $('[data-agregar-confirmar]');
  var actual = null;

  function cantidadElegida() { var o = $('[data-cantidad]', formulario); return o ? Number(o.textContent) : 1; }
  function precioElegido() {
    if (!actual) return null;
    if (tieneTamanos(actual)) {
      var v = $('input[name="variante"]:checked', formulario);
      var tam = v && actual.variantes.filter(function (x) { return x.nombre === v.value; })[0];
      return tam ? centimos(tam.precio) : null;
    }
    return actual.precio != null ? centimos(actual.precio) : null;
  }
  function pintarConfirmar() {
    var unit = precioElegido();
    confirmar.textContent = T.pedido.agregarAlPedido + (unit != null ? ': S/ ' + cifra(unit * cantidadElegida()) : '');
  }

  function abrirAgregar(p) {
    actual = p;
    $('#agregar-titulo').textContent = p.nombre;
    var h = '';
    if (tieneTamanos(p)) {
      h += '<fieldset class="paso"><legend>' + esc(T.pedido.tamano) + '</legend><div class="chips">' +
        p.variantes.map(function (v, i) {
          return '<label class="opcion"><input type="radio" name="variante" value="' + esc(v.nombre) + '"' + (i === 0 ? ' checked' : '') + '>' +
            '<span>' + esc(v.nombre) + ' S/ ' + cifra(centimos(v.precio)) + '</span></label>';
        }).join('') + '</div></fieldset>';
    }
    gruposDe(p).forEach(function (g, i) {
      var tipo = g.elegir > 1 ? 'checkbox' : 'radio';
      h += '<fieldset class="paso" data-grupo="' + i + '" data-maximo="' + g.elegir + '" data-prefijo="' + esc(g.prefijo) + '">' +
        '<legend>' + esc(g.titulo) + (g.elegir > 1 ? ' <span class="paso__ayuda">' + esc(completar(T.pedido.hasta, { n: g.elegir })) + '</span>' : '') + '</legend>' +
        '<div class="chips">' + g.lista.map(function (o) {
          return '<label class="opcion"><input type="' + tipo + '" name="grupo-' + i + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>';
        }).join('') + '</div></fieldset>';
    });
    h += '<div class="agregar__cantidad"><span id="agregar-cantidad">' + esc(T.pedido.cantidad) + '</span>' +
      '<div class="cantidad" role="group" aria-labelledby="agregar-cantidad">' +
        '<button type="button" class="cantidad__boton" data-paso="-1" disabled>' + icono('i-menos') + '<span class="solo-lectores">Uno menos</span></button>' +
        '<output class="cantidad__numero" data-cantidad aria-live="polite">1</output>' +
        '<button type="button" class="cantidad__boton" data-paso="1">' + icono('i-mas') + '<span class="solo-lectores">Uno más</span></button>' +
      '</div></div>';
    campos.innerHTML = h;
    error.hidden = true;
    pintarConfirmar();
    dialogo.showModal();
  }

  if (formulario) {
    formulario.addEventListener('change', function (e) {
      var grupo = e.target.closest('[data-grupo]');
      if (grupo && e.target.type === 'checkbox') {
        var maximo = Number(grupo.getAttribute('data-maximo'));
        var marcados = $$('input:checked', grupo);
        if (marcados.length > maximo) {
          e.target.checked = false;
          error.textContent = completar(T.pedido.hasta, { n: maximo }) + '.';
          error.hidden = false;
          return;
        }
      }
      error.hidden = true;
      pintarConfirmar();
    });

    formulario.addEventListener('click', function (e) {
      var b = e.target.closest('[data-paso]');
      if (!b) return;
      var salida = $('[data-cantidad]', formulario);
      var n = Math.max(1, Math.min(MAXIMO, Number(salida.textContent) + Number(b.getAttribute('data-paso'))));
      salida.textContent = n;
      $('[data-paso="-1"]', formulario).disabled = n <= 1;
      $('[data-paso="1"]', formulario).disabled = n >= MAXIMO;
      pintarConfirmar();
    });

    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!actual) return;
      var variante = null, opciones = [], falta = false;
      if (tieneTamanos(actual)) {
        var v = $('input[name="variante"]:checked', formulario);
        if (v) variante = v.value; else falta = true;
      }
      $$('[data-grupo]', formulario).forEach(function (grupo) {
        var marcados = $$('input:checked', grupo);
        if (!marcados.length) falta = true;
        var prefijo = grupo.getAttribute('data-prefijo') || '';
        marcados.forEach(function (i) { opciones.push(prefijo + i.value); });
      });
      if (falta) { error.textContent = T.pedido.falta; error.hidden = false; return; }
      var cantidad = cantidadElegida();
      dialogo.close();
      agregar({ id: actual.id, variante: variante, opciones: opciones, cantidad: cantidad });
    });

    dialogo.addEventListener('click', function (e) { if (e.target === dialogo) dialogo.close(); });
  }

  /* ---- Botones "Agregar" y Yakibox ------------------------------------------- */
  document.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-agregar]');
    if (boton) {
      var p = platos[boton.getAttribute('data-agregar')];
      if (!p) return;
      if (hayQueElegir(p)) abrirAgregar(p); else agregar({ id: p.id, cantidad: 1 });
      return;
    }
    if (e.target.closest('[data-agregar-yakibox]')) { agregarYakibox(); return; }
    if (e.target.closest('[data-cerrar-agregar]')) dialogo.close();
  });

  function agregarYakibox() {
    var aviso = $('[data-yakibox-error]');
    var elegidos = [];
    var completo = C.yakibox.pasos.every(function (paso, i) {
      var marcado = $('#yakibox input[name="yakibox-' + i + '"]:checked');
      if (marcado) elegidos.push((paso.prefijo || '') + marcado.value);
      return Boolean(marcado);
    });
    if (!completo) {
      aviso.textContent = T.pedido.faltaYakibox;
      aviso.hidden = false;
      return;
    }
    aviso.hidden = true;
    agregar({ id: C.yakibox.plato, opciones: elegidos, cantidad: 1 });
  }

  /* ---- Aviso "Agregaste…" ---------------------------------------------------- */
  var aviso = $('[data-aviso]');
  var anuncio = $('[data-anuncio]');
  var temporizador = null;
  function avisar(it) {
    if (!aviso) return;
    var p = platos[it.id], d = detalle(it);
    var texto = (it.cantidad > 1 ? it.cantidad + ' x ' : '') + p.nombre + (d ? ' (' + d + ')' : '');
    aviso.innerHTML = '<p class="aviso__texto"><b>' + esc(T.pedido.agregado) + ':</b> ' + esc(texto) + '</p>' +
      '<button type="button" class="aviso__boton" data-abrir-pedido>' + esc(T.pedido.verPedido) + '</button>';
    // Los lectores de pantalla lo oyen desde una zona que siempre está en la página
    // (el aviso visual entra y sale, y lo que aparece oculto no siempre se anuncia).
    if (anuncio) {
      anuncio.textContent = '';
      setTimeout(function () { anuncio.textContent = T.pedido.agregado + ': ' + texto + '.'; }, 100);
    }
    aviso.hidden = false;
    aviso.classList.remove('es-visible');
    void aviso.offsetWidth;
    aviso.classList.add('es-visible');
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      aviso.classList.remove('es-visible');
      setTimeout(function () { if (!aviso.classList.contains('es-visible')) aviso.hidden = true; }, 300);
    }, 5000);
  }

  pintar();
})();
