"""Arma la carpeta publicar/: lo único que se sube a internet.

- Copia solo los archivos públicos (nada de docs/, herramientas/ ni la muestra).
- Comprime HTML, CSS y JS y quita comentarios y notas internas.
- Agrega la política de seguridad (CSP) y las cabeceras de seguridad:
  vercel.json para Vercel y _headers para Cloudflare Pages (las mismas).

Uso: python herramientas/publicar.py
Después: sube la carpeta publicar/ (por ejemplo con "vercel deploy" dentro de ella).
"""
import datetime
import json
import os
import re
import shutil
import subprocess
import sys

import tree_sitter_javascript as tsjs
from tree_sitter import Language, Parser

# Tildes legibles también cuando la salida pasa por una tubería (Git Bash, registros).
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "publicar")
ANIO = datetime.date.today().year
AVISO = f"/*! (c) {ANIO} Yaki Yaki. Todos los derechos reservados. */\n"

# Política de seguridad: solo corre el código de la propia web; fuentes de Google
# Fonts; mapa de Google Maps; nada de plugins ni formularios hacia afuera.
CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self'",
    "frame-src https://maps.google.com https://www.google.com",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
]

CABECERAS = [
    # frame-ancestors solo funciona como cabecera: impide que otra web meta esta página en un marco
    ("Content-Security-Policy", "; ".join(CSP + ["frame-ancestors 'none'"])),
    ("X-Frame-Options", "DENY"),
    ("X-Content-Type-Options", "nosniff"),
    ("Referrer-Policy", "strict-origin-when-cross-origin"),
    ("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"),
    ("Strict-Transport-Security", "max-age=31536000; includeSubDomains"),
    ("Cross-Origin-Opener-Policy", "same-origin"),
    ("Cross-Origin-Resource-Policy", "same-origin"),
]

ARCHIVOS = [
    "index.html",
    "css/tokens.css", "css/componentes.css", "css/sitio.css", "css/sin-js.css",
    "js/sitio.js", "js/pedido.js", "js/componentes.js",
    "data/negocio.js", "data/carta.js",
]

_parser = Parser(Language(tsjs.language()))


def _hojas(nodo):
    if nodo.type in ("string", "template_string", "regex", "comment") or nodo.child_count == 0:
        yield nodo
    else:
        for hijo in nodo.children:
            yield from _hojas(hijo)


def _palabra(c):
    return c.isalnum() or c in "_$" or ord(c) > 127


def minificar_js(codigo):
    arbol = _parser.parse(codigo.encode("utf-8"))
    if arbol.root_node.has_error:
        raise SystemExit("Error de sintaxis en un archivo JS: no se publica nada.")
    partes, anterior = [], ""
    for hoja in _hojas(arbol.root_node):
        if hoja.type == "comment":
            continue
        texto = hoja.text.decode("utf-8")
        if hoja.type == ";" and texto == "":
            texto = ";"  # punto y coma automático
        if not texto:
            continue
        if anterior:
            a, b = anterior[-1], texto[0]
            if (_palabra(a) and _palabra(b)) or (a == b and a in "+-") or (a == "/" and b in "/*"):
                partes.append(" ")
        partes.append(texto)
        anterior = texto
    return "".join(partes)


def minificar_css(s):
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s*([{};,>])\s*", r"\1", s)
    return s.replace(";}", "}").strip()


def minificar_html(s):
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"\s+", " ", s)  # un solo espacio: quitarlo del todo pegaría palabras entre etiquetas
    seguridad = ('<meta http-equiv="Content-Security-Policy" content="' + "; ".join(CSP) + '">'
                 '<meta name="referrer" content="strict-origin-when-cross-origin">')
    s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + seguridad, 1)
    return s.strip()


def imagenes_usadas():
    """Lista las imágenes que la página usa de verdad (HTML + datos)."""
    usadas = set(re.findall(r'(?:src|href)="(img/[^"]+)"', open(os.path.join(RAIZ, "index.html"), encoding="utf-8").read()))
    codigo = (
        "globalThis.window = globalThis; const fs = require('fs');"
        "(0, eval)(fs.readFileSync(process.argv[1], 'utf8')); (0, eval)(fs.readFileSync(process.argv[2], 'utf8'));"
        "const C = globalThis.YAKI.carta, lista = [];"
        "const agregar = f => { if (!f) return; lista.push(f.src + '.webp'); if (f.chica) lista.push(f.src + '-400.webp'); };"
        "C.platos.filter(p => p.visible !== false).forEach(p => { agregar(p.foto); agregar(p.poster); });"
        "(C.yakibox.fotos || []).forEach(agregar); (C.galeria || []).forEach(agregar);"
        "process.stdout.write(JSON.stringify(lista));"
    )
    r = subprocess.run(["node", "-e", codigo, os.path.join(RAIZ, "data", "negocio.js"), os.path.join(RAIZ, "data", "carta.js")],
                       capture_output=True, text=True, check=True, encoding="utf-8")
    usadas.update(json.loads(r.stdout))
    return sorted(usadas)


def datos_publicos():
    """Datos sin lo que no se muestra: platos ocultos y marcas hermanas apagadas.
    Así lo pendiente no queda a la vista ni en el código de la página."""
    codigo = (
        "globalThis.window = globalThis; const fs = require('fs');"
        "(0, eval)(fs.readFileSync(process.argv[1], 'utf8')); (0, eval)(fs.readFileSync(process.argv[2], 'utf8'));"
        "const Y = globalThis.YAKI;"
        "Y.carta.platos = Y.carta.platos.filter(p => p.visible !== false);"
        "if (Y.negocio.marcasHermanas && !Y.negocio.marcasHermanas.mostrar) Y.negocio.marcasHermanas.lista = [];"
        "process.stdout.write(JSON.stringify({ negocio: Y.negocio, textos: Y.textos, carta: Y.carta }));"
    )
    r = subprocess.run(["node", "-e", codigo, os.path.join(RAIZ, "data", "negocio.js"), os.path.join(RAIZ, "data", "carta.js")],
                       capture_output=True, text=True, check=True, encoding="utf-8")
    Y = json.loads(r.stdout)
    js = lambda v: json.dumps(v, ensure_ascii=False, separators=(",", ":"))
    return {
        "data/negocio.js": "window.YAKI=window.YAKI||{};YAKI.negocio=" + js(Y["negocio"]) + ";YAKI.textos=" + js(Y["textos"]) + ";",
        "data/carta.js": "window.YAKI=window.YAKI||{};YAKI.carta=" + js(Y["carta"]) + ";",
    }


def escribir(rel, contenido):
    destino = os.path.join(DESTINO, rel)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, "w", encoding="utf-8", newline="\n") as f:
        f.write(contenido)


def vaciar(carpeta):
    """Borra lo que hay dentro, no la carpeta: en Windows no se puede borrar
    una carpeta abierta en el Explorador, una terminal o un servidor."""
    os.makedirs(carpeta, exist_ok=True)
    for nombre in os.listdir(carpeta):
        if nombre == ".vercel":
            continue  # vínculo con el proyecto de Vercel: se conserva entre publicaciones
        dentro = os.path.join(carpeta, nombre)
        if os.path.isdir(dentro) and not os.path.islink(dentro):
            shutil.rmtree(dentro)
        else:
            os.remove(dentro)


def main():
    vaciar(DESTINO)
    antes = despues = 0
    publicos = datos_publicos()
    for rel in ARCHIVOS:
        original = open(os.path.join(RAIZ, rel), encoding="utf-8").read()
        if rel.endswith(".html"):
            nuevo = minificar_html(original)
        elif rel.endswith(".css"):
            nuevo = AVISO + minificar_css(original)
        elif rel in publicos:
            nuevo = AVISO + publicos[rel]
        else:
            nuevo = AVISO + minificar_js(original)
        escribir(rel, nuevo)
        antes += len(original.encode("utf-8"))
        despues += len(nuevo.encode("utf-8"))
    for rel in imagenes_usadas():
        destino = os.path.join(DESTINO, rel)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        shutil.copyfile(os.path.join(RAIZ, rel), destino)
    escribir("robots.txt", "User-agent: *\nAllow: /\n")
    # Cloudflare Pages lee las cabeceras de _headers; Vercel, de vercel.json.
    escribir("_headers", "/*\n" + "".join(f"  {k}: {v}\n" for k, v in CABECERAS))
    escribir("vercel.json", json.dumps({
        "cleanUrls": True,
        "headers": [{"source": "/(.*)", "headers": [{"key": k, "value": v} for k, v in CABECERAS]}],
    }, indent=2, ensure_ascii=False) + "\n")
    # Comprobar que el JS comprimido sigue siendo válido
    for rel in ARCHIVOS:
        if rel.endswith(".js"):
            r = subprocess.run(["node", "--check", os.path.join(DESTINO, rel)], capture_output=True, text=True)
            if r.returncode != 0:
                raise SystemExit(f"El JS comprimido de {rel} no es válido:\n{r.stderr}")
    print(f"Listo: publicar/ ({antes // 1024} KB de código pasaron a {despues // 1024} KB)")


if __name__ == "__main__":
    main()
