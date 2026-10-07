/* Auditoría en el navegador (Playwright). Complementa a revisar.py, que revisa
   los archivos: esto revisa la página ya armada, como la ve la gente.

   - En 320, 375, 768 y 1280 px: errores de consola y de red, ids repetidos,
     referencias rotas, botones sin nombre, cosas ocultas que se ven, cosas
     enfocables que no se ven, imágenes rotas, desbordes, texto cortado,
     contraste, tamaño de toque, orden de títulos, textos rotos ("undefined",
     "{apps}"...) y datos para Google.
   - El pedido por WhatsApp de punta a punta, con teclado incluido.
   - Todo el recorrido con Tab y Shift+Tab (celular y computadora): nada de lo
     enfocado puede quedar debajo de la cabecera o de la barra inferior.

   Uso: con el servidor local encendido y la página abierta en
   http://localhost:8160/ (código) o http://localhost:8161/ (versión publicada) o la dirección en internet,
   ejecutar este archivo con Playwright (browser_run_code con este archivo).
   Devuelve un informe: lo que dice "FALLA" o aparece en una lista es un error. */
async (page) => {
  const base = /^https?:\/\/[^/]+\//.test(page.url())
    ? page.url().replace(/[?#].*$/, '')
    : 'http://localhost:8160/index.html';

  const consola = [], red = [];
  const enConsola = (m) => { if (m.type() === 'error' || m.type() === 'warning') consola.push(m.type() + ': ' + m.text()); };
  const enError = (e) => consola.push('error de página: ' + e.message);
  const enFallo = (r) => {
    const motivo = r.failure() ? r.failure().errorText : '';
    if (!/ERR_ABORTED/.test(motivo)) red.push('falló: ' + r.url() + ' (' + motivo + ')');
  };
  const enRespuesta = (r) => { if (r.status() >= 400) red.push(r.status() + ': ' + r.url()); };

  /* ---- Revisión de la página armada (corre dentro del navegador) ---------- */
  const revisarPagina = () => {
    const p = [];
    const corto = (el) => el.outerHTML.replace(/\s+/g, ' ').slice(0, 110);
    const estilo = (el) => getComputedStyle(el);
    const renderizado = (el) => el.getClientRects().length > 0;
    const existe = (id) => document.getElementById(id) !== null;

    // ids repetidos
    const vistos = {};
    document.querySelectorAll('[id]').forEach((el) => { vistos[el.id] = (vistos[el.id] || 0) + 1; });
    Object.keys(vistos).forEach((id) => { if (vistos[id] > 1) p.push('id repetido: #' + id + ' (' + vistos[id] + ' veces)'); });

    // referencias rotas
    document.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls], label[for]').forEach((el) => {
      ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for'].forEach((a) => {
        (el.getAttribute(a) || '').split(/\s+/).filter(Boolean).forEach((id) => {
          if (!existe(id)) p.push(a + ' apunta a #' + id + ', que no existe');
        });
      });
    });
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      if (id && !existe(id)) p.push('enlace a #' + id + ', que no existe');
    });
    document.querySelectorAll('use').forEach((u) => {
      const h = u.getAttribute('href') || '';
      if (h[0] === '#' && !existe(h.slice(1))) p.push('ícono ' + h + ' no existe');
    });

    // nombres accesibles
    const nombre = (el) => {
      const porId = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean)
        .map((id) => (document.getElementById(id) || {}).textContent || '').join(' ');
      return (el.getAttribute('aria-label') || porId || el.textContent || el.getAttribute('title') ||
        [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join(' ')).trim();
    };
    document.querySelectorAll('a[href], button, [role="button"]').forEach((el) => {
      if (!nombre(el)) p.push('botón o enlace sin nombre: ' + corto(el));
    });
    document.querySelectorAll('iframe').forEach((el) => { if (!el.title) p.push('marco sin título: ' + corto(el)); });
    document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((el) => {
      if (!(el.labels && el.labels.length) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) p.push('campo sin etiqueta: ' + corto(el));
    });

    // lo oculto tiene que estar oculto
    document.querySelectorAll('[hidden]').forEach((el) => {
      if (estilo(el).display !== 'none') p.push('tiene hidden pero se ve: ' + corto(el));
    });

    // lo que se puede enfocar con el teclado tiene que verse
    document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])').forEach((el) => {
      if (!renderizado(el) || estilo(el).visibility === 'hidden') return;   // no se puede enfocar
      if (el.matches('.saltar, .solo-lectores, .solo-lectores *')) return;   // aparece al enfocarse
      if (el.tagName === 'INPUT' && el.closest('label') && renderizado(el.closest('label'))) return;   // chips de opciones
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        if (parseFloat(estilo(n).opacity) === 0) { p.push('se puede enfocar pero es invisible: ' + corto(el)); return; }
      }
      let fijo = false;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) if (estilo(n).position === 'fixed') fijo = true;
      const r = el.getBoundingClientRect();
      if (fijo && (r.top >= innerHeight || r.bottom <= 0 || r.left >= innerWidth || r.right <= 0)) p.push('se puede enfocar pero está fuera de pantalla: ' + corto(el));
    });

    // imágenes
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('alt')) p.push('imagen sin alt: ' + img.getAttribute('src'));
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) p.push('imagen rota: ' + img.getAttribute('src'));
    });

    // desborde horizontal de la página
    const anchoDoc = document.documentElement.scrollWidth;
    if (anchoDoc > innerWidth) {
      p.push('la página se desborda: ' + anchoDoc + ' px en ' + innerWidth + ' px');
      document.querySelectorAll('body *').forEach((el) => {
        if (!renderizado(el) || el.getBoundingClientRect().right <= innerWidth + 1) return;
        for (let m = el.parentElement; m && m !== document.body; m = m.parentElement) if (estilo(m).overflowX !== 'visible') return;
        p.push('  sale por la derecha: ' + corto(el).slice(0, 80));
      });
    }

    // texto cortado o que se sale de su caja
    document.querySelectorAll('body *').forEach((el) => {
      if (!renderizado(el) || el.closest('.solo-lectores, .palabra-gigante')) return;
      const directo = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!directo) return;
      const s = estilo(el);
      if (s.display === 'inline') return;
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) p.push('texto que no entra a lo ancho: ' + corto(el).slice(0, 90));
      if (s.overflowY === 'hidden' && el.scrollHeight > el.clientHeight + 1) p.push('texto cortado a lo alto: ' + corto(el).slice(0, 90));
    });

    // contraste del texto (WCAG AA: 4.5 normal, 3 grande); sobre fotos se revisa a ojo
    const aRGB = (c) => {
      let m = c.match(/^rgba?\(([^)]+)\)$/);
      if (m) { const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; }
      m = c.match(/^color\(srgb ([^)]+)\)$/);
      if (m) { const v = m[1].split(/[\s/]+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v.length > 3 ? v[3] : 1]; }
      return null;
    };
    const luz = (c) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const mezclar = (arriba, abajo) => [0, 1, 2].map((i) => arriba[i] * arriba[3] + abajo[i] * (1 - arriba[3])).concat(1);
    const fondoDe = (el) => {
      const capas = [];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const s = estilo(n);
        if (/url\(/.test(s.backgroundImage)) return null;   // sobre una foto; los degradados decorativos no cuentan
        const c = aRGB(s.backgroundColor);
        if (c && c[3] > 0) { capas.push(c); if (c[3] >= 1) break; }
      }
      let color = [255, 255, 255, 1];
      for (let i = capas.length - 1; i >= 0; i--) color = mezclar(capas[i], color);
      return color;
    };
    const vistosContraste = {};
    document.querySelectorAll('body *').forEach((el) => {
      if (!renderizado(el) || el.closest('.solo-lectores, .palabra-gigante, .sello-precio, [disabled]')) return;
      const texto = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (!texto) return;
      const s = estilo(el);
      if (s.visibility === 'hidden') return;
      let opacidad = 1;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) opacidad *= parseFloat(estilo(n).opacity);
      if (opacidad === 0) return;
      const fg = aRGB(s.color), bg = fondoDe(el);
      if (!fg || !bg) return;
      const color = mezclar([fg[0], fg[1], fg[2], fg[3] * opacidad], bg);
      const L1 = luz(color), L2 = luz(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const tam = parseFloat(s.fontSize), peso = parseInt(s.fontWeight, 10);
      const minimo = (tam >= 24 || (tam >= 18.66 && peso >= 700)) ? 3 : 4.5;
      const clave = s.color + '|' + bg.join(',') + '|' + minimo;
      if (ratio < minimo && !vistosContraste[clave]) {
        vistosContraste[clave] = true;
        p.push('contraste ' + ratio.toFixed(2) + ' (mín. ' + minimo + '): "' + texto.slice(0, 40) + '" ' + s.color +
          ' sobre rgb(' + bg.slice(0, 3).map(Math.round).join(', ') + ')');
      }
    });

    // sellos de precio: el texto va sobre la mancha de color (un SVG), no sobre un fondo
    document.querySelectorAll('.sello-precio').forEach((sello) => {
      const forma = sello.querySelector('.sello-precio__forma'), precio = sello.querySelector('.precio');
      if (!forma || !precio || !renderizado(sello)) return;
      const fg = aRGB(estilo(precio).color), bg = aRGB(estilo(forma).fill);
      if (!fg || !bg) return;
      const L1 = luz(fg), L2 = luz(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (ratio < 4.5 && !vistosContraste['sello' + ratio]) { vistosContraste['sello' + ratio] = true; p.push('contraste del sello de precio ' + ratio.toFixed(2)); }
    });

    // tamaño de toque (WCAG 2.2: mínimo 24 x 24 px; los enlaces dentro de un texto están exentos)
    document.querySelectorAll('a[href], button, select, summary, label.opcion').forEach((el) => {
      if (!renderizado(el) || estilo(el).visibility === 'hidden' || el.closest('p, .solo-lectores') || el.matches('.saltar')) return;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) p.push('se toca con dificultad (' + Math.round(r.width) + 'x' + Math.round(r.height) + ' px): ' + corto(el).slice(0, 80));
    });

    // títulos: un solo h1 y sin saltos de nivel
    const titulos = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(renderizado);
    const h1 = titulos.filter((h) => h.tagName === 'H1').length;
    if (h1 !== 1) p.push('hay ' + h1 + ' títulos h1 a la vista');
    let antes = 0;
    titulos.forEach((h) => {
      const n = Number(h.tagName[1]);
      if (antes && n > antes + 1) p.push('salto de título h' + antes + ' a h' + n + ': "' + h.textContent.trim().slice(0, 30) + '"');
      if (!h.textContent.trim()) p.push('título vacío: ' + corto(h));
      antes = n;
    });

    // textos rotos o notas internas a la vista
    const todo = document.body.innerText;
    [/\bundefined\b/, /\bNaN\b/, /\[object /, /\{[a-zA-Z]+\}/, /\bnull\b/, /PENDIENTE|PROVISIONAL|\[PROPUESTA\]/].forEach((re) => {
      const m = todo.match(re);
      if (m) p.push('texto roto o interno a la vista: "' + todo.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ') + '"');
    });

    // datos para Google
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const j = JSON.parse(s.textContent);
        if (/confirmar|PENDIENTE/i.test(s.textContent)) p.push('datos para Google con algo sin confirmar');
        if (!j.name || !j.address) p.push('datos para Google incompletos');
      } catch (e) { p.push('datos para Google con JSON inválido'); }
    });
    return p;
  };

  /* ---- Pedido por WhatsApp de punta a punta -------------------------------- */
  const probarPedido = async () => {
    const r = [];
    const paso = async (nombre, fn) => {
      try { const extra = await fn(); r.push((extra === false ? 'FALLA: ' : 'ok: ') + nombre + (typeof extra === 'string' ? ' (' + extra + ')' : '')); }
      catch (e) { r.push('FALLA: ' + nombre + ': ' + String(e.message || e).split('\n')[0]); }
    };
    const abierto = (sel) => page.locator(sel).evaluate((d) => d.open);
    const mensaje = async () => decodeURIComponent((await page.locator('#hoja-pedido .carrito__enviar').getAttribute('href')).split('?text=')[1]);
    const foco = () => page.evaluate(() => {
      const a = document.activeElement;
      return a && a !== document.body ? (a.className + ' "' + a.textContent.trim() + '"').replace(/\s+/g, ' ').slice(0, 70) : 'body';
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* sin almacenamiento */ } });
    await page.reload();

    await paso('menú del celular abre y Escape lo cierra con el foco en el botón', async () => {
      await page.locator('.cabecera__menu').click();
      if (!(await page.locator('#menu-principal').isVisible())) return false;
      await page.keyboard.press('Escape');
      return !(await page.locator('#menu-principal').isVisible()) && /cabecera__menu/.test(await foco());
    });
    await paso('barra inferior escondida en la portada (no recibe el foco)', async () =>
      (await page.evaluate(() => getComputedStyle(document.querySelector('.barra-pedido')).visibility)) === 'hidden');
    await page.locator('#combos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await paso('barra inferior visible al bajar', async () =>
      (await page.evaluate(() => getComputedStyle(document.querySelector('.barra-pedido')).visibility)) === 'visible');

    await paso('agregar Combo 1 muestra el aviso', async () => {
      await page.locator('#combos [data-agregar="combo-1"]').click();
      await page.waitForTimeout(300);
      return page.locator('[data-aviso]').isVisible();
    });
    await paso('el lector de pantalla anuncia lo agregado', async () => {
      await page.waitForTimeout(200);
      const t = await page.locator('[data-anuncio]').textContent();
      return /Combo 1/.test(t) ? t : false;
    });
    await paso('el aviso abre "Tu pedido" con el mensaje armado', async () => {
      await page.locator('[data-aviso] [data-abrir-pedido]').click();
      return (await abierto('#hoja-pedido')) && (await mensaje()).includes('- 1 x Combo 1: S/ 15');
    });
    await paso('el botón + suma uno', async () => {
      await page.locator('#hoja-pedido [data-mas]').first().click();
      return (await mensaje()).includes('- 2 x Combo 1: S/ 30');
    });
    await paso('Escape cierra y el foco vuelve a un botón visible aunque el aviso ya se fue', async () => {
      await page.waitForTimeout(5600);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      const f = await foco();
      return !(await abierto('#hoja-pedido')) && f !== 'body' ? f : false;
    });

    await paso('plato con sabor: pide elegir, luego agrega 2', async () => {
      await page.locator('#carta [data-agregar="takoyaki"]').click();
      if (!(await abierto('#hoja-agregar'))) return false;
      await page.locator('#hoja-agregar [data-agregar-confirmar]').click();
      if (!(await page.locator('[data-agregar-error]').isVisible())) return false;
      await page.locator('#hoja-agregar label.opcion').first().click();
      await page.locator('#hoja-agregar [data-paso="1"]').click();
      await page.locator('#hoja-agregar [data-agregar-confirmar]').click();
      return !(await abierto('#hoja-agregar'));
    });

    await paso('Yakibox: avisa si falta elegir y luego agrega', async () => {
      await page.locator('#yakibox [data-agregar-yakibox]').click();
      if (!(await page.locator('[data-yakibox-error]').isVisible())) return false;
      const pasos = page.locator('#yakibox fieldset');
      for (let i = 0; i < await pasos.count(); i++) await pasos.nth(i).locator('label.opcion').first().click();
      await page.locator('#yakibox [data-agregar-yakibox]').click();
      return !(await page.locator('[data-yakibox-error]').isVisible());
    });

    await paso('el mensaje lleva todo y el total', async () => {
      await page.locator('.barra-pedido [data-abrir-pedido]').click();
      const m = await mensaje();
      const bien = m.includes('2 x Combo 1') && /2 x Takoyaki \(/.test(m) && /1 x Yakibox \(/.test(m) && /\*Total: S\/ \d/.test(m);
      return bien ? m.split('\n').slice(-1)[0] : false;
    });

    await paso('pedido solo con precio a consultar no dice S/ 0', async () => {
      await page.locator('#hoja-pedido [data-vaciar]').click();
      await page.keyboard.press('Escape');
      await page.locator('#carta [data-agregar="taro-latte"]').click();   // sigue sin precio en la carta
      await page.locator('.barra-pedido [data-abrir-pedido]').click();
      const m = await mensaje();
      const total = await page.locator('#hoja-pedido .carrito__total').textContent();
      return !/S\/\s*0\b/.test(total) && m.includes('*Total: precio a consultar*') ? total : false;
    });

    await paso('el pedido sigue ahí al recargar', async () => {
      await page.reload();
      return /1/.test(await page.locator('.cabecera__pedir .contador').textContent());
    });

    await paso('almacenamiento alterado: se descarta lo inválido sin romper nada', async () => {
      await page.evaluate(() => localStorage.setItem('yakiyaki-pedido-v1', JSON.stringify([
        { id: 'combo-1', cantidad: 2 },
        { id: '<img src=x onerror=alert(1)>', cantidad: 1 },
        { id: 'takoyaki', cantidad: 1, opciones: ['<b>falso</b>'] },
        { id: 'combo-1', cantidad: 9999 },
        { id: '__proto__', cantidad: 1 }
      ])));
      await page.reload();
      const t = await page.locator('.cabecera__pedir .contador').textContent();
      return /2/.test(t) && !(await page.locator('#hoja-pedido img').count()) ? 'quedó solo el combo válido' : false;
    });

    await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* sin almacenamiento */ } });
    return r;
  };

  /* ---- Teclado: recorrer todo con Tab y Shift+Tab ---------------------------
     Lo enfocado no puede quedar debajo de la cabecera ni de la barra inferior.
     (El mapa se salta: lo enfocado está dentro de él y no se puede medir.) */
  const probarTeclado = async () => {
    const r = {};
    await page.emulateMedia({ reducedMotion: 'reduce' });   // desplazamiento instantáneo para medir
    for (const [w, h] of [[390, 844], [1280, 800]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(base);
      await page.waitForTimeout(300);
      const tapados = [], vistos = new Set();
      for (const tecla of ['Tab', 'Shift+Tab']) {
        for (let i = 0; i < 140; i++) {
          await page.keyboard.press(tecla);
          await page.waitForTimeout(50);
          const d = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body || el.tagName === 'IFRAME') return null;
            const b = el.getBoundingClientRect();
            const puntos = [[b.left + b.width / 2, b.top + 2], [b.left + b.width / 2, b.bottom - 2], [b.left + b.width / 2, b.top + b.height / 2]];
            const tapa = puntos.map(([x, y]) => (x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight) ? document.elementFromPoint(x, y) : null)
              .find((x) => x && x !== el && !el.contains(x) && !x.contains(el));
            return {
              id: (el.className || el.tagName) + ' "' + (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30) + '"',
              tapa: tapa ? (tapa.closest('.cabecera, .barra-pedido, .aviso') || tapa).className.slice(0, 40) : null,
              fuera: b.bottom <= 0 || b.top >= innerHeight
            };
          });
          if (d && (d.tapa || d.fuera) && !vistos.has(tecla + d.id)) {
            vistos.add(tecla + d.id);
            tapados.push(tecla + ': ' + d.id + ' queda ' + (d.fuera ? 'fuera de pantalla' : 'debajo de ' + d.tapa));
          }
        }
      }
      r[w + 'x' + h] = tapados;
    }
    await page.emulateMedia({ reducedMotion: null });
    return r;
  };

  page.on('console', enConsola);
  page.on('pageerror', enError);
  page.on('requestfailed', enFallo);
  page.on('response', enRespuesta);
  const informe = { pagina: base };
  try {
    for (const ancho of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto(base);
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((ok) => setTimeout(ok, 80));
        }
        window.scrollTo(0, 0);
        await new Promise((ok) => setTimeout(ok, 1000));   // que terminen las animaciones (la barra tarda 480 ms)
      });
      informe[ancho + ' px'] = await page.evaluate(revisarPagina);
    }
    informe.pedido = await probarPedido();
    informe.teclado = await probarTeclado();
  } finally {
    page.off('console', enConsola);
    page.off('pageerror', enError);
    page.off('requestfailed', enFallo);
    page.off('response', enRespuesta);
    await page.setViewportSize({ width: 1280, height: 800 });
  }
  informe.consola = consola;
  informe.red = red;
  return informe;
}
