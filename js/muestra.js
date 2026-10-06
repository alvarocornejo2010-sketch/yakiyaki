/* Solo para la página de muestra: tabla de contraste calculada en vivo
   desde tokens.css y botones para repetir animaciones. */
(function () {
  'use strict';

  var raiz = getComputedStyle(document.documentElement);
  function token(nombre) { return raiz.getPropertyValue('--' + nombre).trim(); }

  function rgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
  }

  function luminancia(c) {
    var v = c.map(function (x) {
      x /= 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }

  function contraste(a, b) {
    var la = luminancia(rgb(a)), lb = luminancia(rgb(b));
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* [texto, fondo, uso] con los nombres de tokens.css */
  var pares = [
    ['tinta', 'crema', 'Texto general'],
    ['tinta-suave', 'crema', 'Texto secundario'],
    ['tinta', 'papel', 'Tarjetas'],
    ['tinta-suave', 'papel', 'Descripción en tarjetas'],
    ['tinta', 'crema-hundida', 'Chips'],
    ['crema', 'tinta', 'Portada y pie'],
    ['crema-apagada', 'tinta', 'Texto secundario en oscuro'],
    ['turquesa', 'tinta', 'Acentos y foco en oscuro'],
    ['coral', 'tinta', 'Sello de la portada'],
    ['tinta', 'turquesa', 'Botón principal, bloque YakiBox'],
    ['tinta', 'coral', 'Sello de precio, botón de promo'],
    ['tinta', 'chili', 'Sello de precio chili'],
    ['tinta', 'yema', 'Etiquetas'],
    ['papel', 'turquesa', 'Palabra gigante (solo decorativa)'],
    ['coral', 'crema', 'No usar para texto'],
    ['chili', 'crema', 'No usar para texto'],
    ['turquesa', 'crema', 'No usar para texto']
  ];

  var cuerpo = document.getElementById('cuerpo-contraste');
  if (cuerpo) {
    pares.forEach(function (p) {
      var t = token(p[0]), f = token(p[1]);
      var r = contraste(t, f);
      var veredicto = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'Solo texto grande' : 'Solo decorativo';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="par" style="color:' + t + ';background:' + f + '">Aa 12.90</span></td>' +
        '<td>' + p[0] + ' sobre ' + p[1] + '</td>' +
        '<td>' + p[2] + '</td>' +
        '<td class="num">' + r.toFixed(2) + ':1</td>' +
        '<td><span class="resultado' + (r < 4.5 ? ' resultado--no' : '') + '">' + veredicto + '</span></td>';
      cuerpo.appendChild(tr);
    });
  }

  /* Repetir la entrada de la portada. */
  var repetirPortada = document.getElementById('repetir-portada');
  if (repetirPortada) {
    repetirPortada.addEventListener('click', function () {
      var portada = document.getElementById('portada-demo');
      var copia = portada.cloneNode(true);
      portada.replaceWith(copia);
    });
  }

  /* Repetir el "pop" de los sellos de precio. */
  var repetirPop = document.getElementById('repetir-pop');
  if (repetirPop) {
    repetirPop.addEventListener('click', function () {
      document.querySelectorAll('#precios .sello-precio').forEach(function (s) {
        s.classList.remove('entro');
        void s.offsetWidth;
        s.classList.add('entro');
      });
    });
  }

  /* Mostrar u ocultar la barra inferior dentro del teléfono de muestra. */
  var alternarBarra = document.getElementById('alternar-barra');
  if (alternarBarra) {
    alternarBarra.addEventListener('click', function () {
      var barra = document.getElementById('barra-demo');
      var visible = barra.classList.toggle('es-visible');
      alternarBarra.setAttribute('aria-pressed', visible ? 'true' : 'false');
    });
  }
})();
