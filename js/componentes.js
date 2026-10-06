/* Yakiyaki: comportamiento de los componentes (Fase B, versión 1).
   Sin dependencias. Todo funciona sin JS salvo la hoja de pedido. */
(function () {
  'use strict';

  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* 1. Pestañas de la carta: clic, flechas, Inicio/Fin y enlace directo (#menu-entradas). */
  function iniciarPestanas(lista) {
    var pestanas = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
    if (!pestanas.length) return;

    function seleccionar(pestana, porUsuario) {
      pestanas.forEach(function (t) {
        var activa = t === pestana;
        t.setAttribute('aria-selected', activa ? 'true' : 'false');
        t.tabIndex = activa ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !activa;
      });
      if (porUsuario) {
        pestana.focus({ preventScroll: true });
        /* Deja el enlace directo de la categoría en la barra de direcciones. */
        if (history.replaceState) history.replaceState(null, '', '#' + pestana.getAttribute('aria-controls'));
      }
      var caja = lista.getBoundingClientRect();
      var caja2 = pestana.getBoundingClientRect();
      if (caja2.left < caja.left || caja2.right > caja.right) {
        lista.scrollBy({ left: caja2.left - caja.left - 16, behavior: movimientoReducido.matches ? 'auto' : 'smooth' });
      }
    }

    pestanas.forEach(function (pestana, i) {
      pestana.addEventListener('click', function () { seleccionar(pestana, true); });
      pestana.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % pestanas.length;
        else if (e.key === 'ArrowLeft') j = (i - 1 + pestanas.length) % pestanas.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = pestanas.length - 1;
        if (j === null) return;
        e.preventDefault();
        seleccionar(pestanas[j], true);
      });
    });

    function desdeEnlace() {
      var id = decodeURIComponent(location.hash.slice(1));
      var pestana = pestanas.filter(function (t) { return t.getAttribute('aria-controls') === id; })[0];
      if (!pestana) return;
      seleccionar(pestana, false);
      lista.scrollIntoView({ block: 'start', behavior: 'auto' });
    }

    window.addEventListener('hashchange', desdeEnlace);
    desdeEnlace();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[role="tablist"]'), iniciarPestanas);

  /* 2. Hoja de pedido: se abre con cualquier [data-abrir-pedido]. */
  var hoja = document.getElementById('hoja-pedido');
  if (hoja && typeof hoja.showModal === 'function') {
    var origen = null;
    document.addEventListener('click', function (e) {
      var abrir = e.target.closest('[data-abrir-pedido]');
      if (abrir) {
        e.preventDefault();
        origen = abrir;
        /* Avisa qué botón la abrió, para mostrar el plato elegido. */
        hoja.dispatchEvent(new CustomEvent('antes-de-abrir', { detail: { origen: abrir } }));
        hoja.showModal();
        return;
      }
      if (e.target.closest('[data-cerrar-pedido]')) hoja.close();
    });
    hoja.addEventListener('click', function (e) {
      if (e.target === hoja) hoja.close();   /* clic en el fondo oscuro */
    });
    /* Al cerrar, el foco vuelve al botón que la abrió. Si ese botón ya no se ve
       (el aviso "Agregaste..." se va solo), va al botón de pedido que esté a la vista. */
    function seVe(el) { return el && el.isConnected && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; }
    hoja.addEventListener('close', function () {
      if (seVe(origen)) { origen.focus(); return; }
      var otro = Array.prototype.filter.call(document.querySelectorAll('[data-con-contador]'), seVe)[0];
      if (otro) otro.focus({ preventScroll: true });
    });
  }

  /* 3. Sellos de precio: "pop" una sola vez al entrar en pantalla. */
  var sellos = document.querySelectorAll('.sello-precio[data-pop]');
  if (sellos.length && 'IntersectionObserver' in window && !movimientoReducido.matches) {
    var vigia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove('va-a-entrar');
        en.target.classList.add('entro');
        vigia.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(sellos, function (s) {
      s.classList.add('va-a-entrar');
      vigia.observe(s);
    });
  }

  /* 4. Carruseles: flechas en computadora (en celular se desliza con el dedo). */
  Array.prototype.forEach.call(document.querySelectorAll('.carrusel'), function (carrusel) {
    var controles = document.createElement('div');
    controles.className = 'carrusel__controles';
    controles.innerHTML =
      '<button type="button" class="carrusel__flecha" data-dir="-1"><svg class="icono" aria-hidden="true"><use href="#i-flecha"/></svg><span class="solo-lectores">Fotos anteriores</span></button>' +
      '<button type="button" class="carrusel__flecha" data-dir="1"><svg class="icono" aria-hidden="true"><use href="#i-flecha"/></svg><span class="solo-lectores">Fotos siguientes</span></button>';
    carrusel.parentNode.insertBefore(controles, carrusel);
    var botones = controles.querySelectorAll('button');

    function actualizar() {
      var max = carrusel.scrollWidth - carrusel.clientWidth - 2;
      botones[0].disabled = carrusel.scrollLeft <= 2;
      botones[1].disabled = carrusel.scrollLeft >= max;
    }
    controles.addEventListener('click', function (e) {
      var boton = e.target.closest('button');
      if (!boton) return;
      var item = carrusel.querySelector('li');
      var paso = item ? item.getBoundingClientRect().width + 12 : carrusel.clientWidth * 0.8;
      carrusel.scrollBy({ left: Number(boton.getAttribute('data-dir')) * paso, behavior: movimientoReducido.matches ? 'auto' : 'smooth' });
    });
    carrusel.addEventListener('scroll', actualizar, { passive: true });
    window.addEventListener('resize', actualizar);
    actualizar();
  });

  /* 5. Barra inferior: aparece cuando la portada sale de pantalla. */
  var barra = document.querySelector('.barra-pedido[data-despues-de]');
  var portada = barra && document.querySelector(barra.getAttribute('data-despues-de'));
  if (barra && portada && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      barra.classList.toggle('es-visible', !entradas[0].isIntersecting);
    }, { threshold: 0.15 }).observe(portada);
  } else if (barra) {
    barra.classList.add('es-visible');
  }
})();
