"""Revisión automática de la web de Yaki Yaki.

Revisa datos, HTML, CSS, JS, seguridad y la carpeta para publicar.
Uso: python herramientas/revisar.py            (revisa el código fuente)
     python herramientas/revisar.py publicar   (revisa también la carpeta publicar/)
Sale con código 1 si encuentra errores.
"""
import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser

# Tildes legibles también cuando la salida pasa por una tubería (Git Bash, registros).
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hallazgos = []


def falla(zona, texto):
    hallazgos.append((zona, texto))


def ruta(*partes):
    return os.path.join(RAIZ, *partes)


def leer(*partes):
    with open(ruta(*partes), encoding="utf-8") as f:
        return f.read()


# ---------------------------------------------------------------- datos ----
def cargar_datos():
    codigo = (
        "globalThis.window = globalThis;"
        "const fs = require('fs');"
        "(0, eval)(fs.readFileSync(process.argv[1], 'utf8'));"
        "(0, eval)(fs.readFileSync(process.argv[2], 'utf8'));"
        "process.stdout.write(JSON.stringify(globalThis.YAKI));"
    )
    r = subprocess.run(["node", "-e", codigo, ruta("data", "negocio.js"), ruta("data", "carta.js")],
                       capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        falla("datos", "Los archivos de datos no se pueden leer: " + r.stderr.strip().splitlines()[-1])
        return None
    return json.loads(r.stdout)


def imagen_existe(src, chica):
    ok = os.path.isfile(ruta(src + ".webp"))
    if chica:
        ok = ok and os.path.isfile(ruta(src + "-400.webp"))
    return ok


def revisar_datos(Y):
    N, T, C = Y.get("negocio"), Y.get("textos"), Y.get("carta")
    if not (N and T and C):
        falla("datos", "Falta negocio, textos o carta")
        return
    if not re.fullmatch(r"\+51\d{9}", N["telefono"]["numero"]):
        falla("datos", "telefono.numero debe ser +51 y 9 dígitos")
    if not re.fullmatch(r"51\d{9}", N["whatsapp"]["numero"]):
        falla("datos", "whatsapp.numero debe ser 51 y 9 dígitos, sin + ni espacios")
    for nombre, url in list(N["canales"].items()) + list(N["redes"].items()):
        if url and not url.startswith("https://"):
            falla("datos", f"El enlace de {nombre} debe empezar con https://")
    for dia, h in N["horario"].items():
        if isinstance(h, dict):
            if not (re.fullmatch(r"\d\d:\d\d", h.get("abre", "")) and re.fullmatch(r"\d\d:\d\d", h.get("cierra", ""))):
                falla("datos", f"Horario de {dia}: usa el formato 12:00")
            elif h["abre"] >= h["cierra"]:
                falla("datos", f"Horario de {dia}: abre después de cerrar")
        elif h not in ("cerrado", "por confirmar"):
            falla("datos", f"Horario de {dia}: valor no válido ({h})")
    if N.get("cabecera", "") not in ("", "estado", "direccion", "estado-direccion", "promo", "marca"):
        falla("datos", "cabecera tiene un valor no válido")

    ids = [p["id"] for p in C["platos"]]
    for i in set(ids):
        if ids.count(i) > 1:
            falla("datos", f"id repetido en la carta: {i}")
    categorias = {c["id"] for c in C["categorias"]}
    platos = {p["id"]: p for p in C["platos"]}
    promo = platos.get(N.get("cabeceraPromo", ""))
    if not promo or promo.get("visible") is False or promo.get("precio") is None:
        falla("datos", f"cabeceraPromo ({N.get('cabeceraPromo')}) debe ser el id de un plato visible y con precio")
    for p in C["platos"]:
        if p.get("visible") is False:
            continue
        for c in p.get("categorias", []):
            if c not in categorias:
                falla("datos", f"{p['id']}: la categoría {c} no existe")
        if not p.get("descripcion"):
            falla("datos", f"{p['id']}: falta descripción")
        if p.get("precio") is not None and not (isinstance(p["precio"], (int, float)) and p["precio"] >= 0):
            falla("datos", f"{p['id']}: precio no válido")
        for v in p.get("variantes", []) or []:
            if not v.get("nombre") or not isinstance(v.get("precio"), (int, float)):
                falla("datos", f"{p['id']}: variante sin nombre o precio")
        o = p.get("opciones")
        if o:
            if not o.get("lista"):
                falla("datos", f"{p['id']}: opciones sin lista")
            elif not 1 <= o.get("elegir", 1) <= len(o["lista"]):
                falla("datos", f"{p['id']}: 'elegir' debe ir de 1 a {len(o['lista'])}")
        for clave in ("foto", "poster"):
            f = p.get(clave)
            if f:
                if not imagen_existe(f["src"], f.get("chica")):
                    falla("datos", f"{p['id']}: no existe la imagen {f['src']}")
                if not f.get("alt"):
                    falla("datos", f"{p['id']}: la imagen no tiene texto alternativo")
    for lista in ("favoritos", "combos"):
        for i in C.get(lista, []):
            if i not in platos or platos[i].get("visible") is False:
                falla("datos", f"{lista}: {i} no existe o está oculto")
    yb = C.get("yakibox")
    if yb:
        if yb["plato"] not in platos:
            falla("datos", "yakibox.plato no existe")
        for f in yb.get("fotos", []):
            if not imagen_existe(f["src"], f.get("chica")):
                falla("datos", f"yakibox: no existe la imagen {f['src']}")
    for f in C.get("galeria", []):
        if not imagen_existe(f["src"], f.get("chica")):
            falla("datos", f"galería: no existe la imagen {f['src']}")
        if not f.get("alt"):
            falla("datos", f"galería: {f['src']} sin texto alternativo")

    # Cada data-t del HTML debe tener su texto
    html = leer("index.html")
    for clave in sorted(set(re.findall(r'data-t="([\w.]+)"', html))):
        valor = T
        for parte in clave.split("."):
            valor = valor.get(parte) if isinstance(valor, dict) else None
        if not isinstance(valor, str):
            falla("datos", f"Falta el texto {clave} en YAKI.textos")


# ----------------------------------------------------------------- HTML ----
class Analizador(HTMLParser):
    VACIOS = {"meta", "link", "img", "input", "br", "hr", "source", "use", "path", "rect", "circle", "symbol"}

    def __init__(self):
        super().__init__()
        self.ids, self.pila, self.errores, self.etiquetas = [], [], [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.etiquetas.append((tag, a, self.getpos()))
        if "id" in a:
            self.ids.append(a["id"])
        if tag not in self.VACIOS:
            self.pila.append(tag)

    def handle_endtag(self, tag):
        if tag in self.VACIOS:
            return
        if self.pila and self.pila[-1] == tag:
            self.pila.pop()
        else:
            self.errores.append(f"cierre </{tag}> inesperado en la línea {self.getpos()[0]}")


def revisar_html(nombre, publicado=False):
    texto = leer(*nombre.split("/"))
    a = Analizador()
    a.feed(texto)
    for e in a.errores:
        falla(nombre, e)
    if a.pila:
        falla(nombre, "etiquetas sin cerrar: " + ", ".join(a.pila))
    for i in set(a.ids):
        if a.ids.count(i) > 1:
            falla(nombre, f"id repetido: {i}")
    base = os.path.dirname(ruta(*nombre.split("/")))
    for tag, attrs, pos in a.etiquetas:
        linea = pos[0]
        if tag == "img" and "alt" not in attrs:
            falla(nombre, f"imagen sin alt (línea {linea})")
        if attrs.get("target") == "_blank" and "noopener" not in (attrs.get("rel") or ""):
            falla(nombre, f"enlace en pestaña nueva sin rel=noopener (línea {linea})")
        if "style" in attrs:
            falla(nombre, f"estilo en línea (bloqueado por la política de seguridad) (línea {linea})")
        for evento in [k for k in attrs if k.startswith("on")]:
            falla(nombre, f"evento en línea {evento} (línea {linea})")
        if tag == "script" and not attrs.get("src") and attrs.get("type") != "application/ld+json":
            falla(nombre, f"script en línea (línea {linea})")
        for clave in ("src", "href"):
            v = attrs.get(clave)
            if v and not re.match(r"(https?:|mailto:|tel:|#|data:)", v) and tag != "use":
                if not os.path.isfile(os.path.join(base, v.split("?")[0].split("#")[0])):
                    falla(nombre, f"archivo que no existe: {v} (línea {linea})")
            if v and v.lower().startswith("javascript:"):
                falla(nombre, f"enlace javascript: (línea {linea})")
    m = re.search(r"<title>(.*?)</title>", texto, re.S)
    if not m or len(m.group(1)) > 65:
        falla(nombre, "el título falta o pasa de 65 caracteres")
    m = re.search(r'<meta name="description" content="([^"]*)"', texto)
    if not m or not 70 <= len(m.group(1)) <= 160:
        falla(nombre, "la descripción falta o no tiene entre 70 y 160 caracteres")
    if '<html lang="' not in texto:
        falla(nombre, "falta el idioma en <html lang>")
    if publicado:
        if 'http-equiv="Content-Security-Policy"' not in texto:
            falla(nombre, "falta la política de seguridad (CSP) en la página publicada")
        if "<!--" in texto:
            falla(nombre, "quedan comentarios internos en la página publicada")


# ------------------------------------------------------------ CSS y JS -----
def revisar_css(carpeta):
    todo = "".join(open(os.path.join(ruta(carpeta, "css"), a), encoding="utf-8").read()
                   for a in os.listdir(ruta(carpeta, "css")) if a.endswith(".css"))
    if not re.search(r"\[hidden\]\s*\{\s*display:\s*none\s*!important", todo):
        falla("css", "falta la regla [hidden] { display: none !important } (lo oculto podría verse)")
    for archivo in sorted(os.listdir(ruta(carpeta, "css"))):
        if not archivo.endswith(".css"):
            continue
        s = re.sub(r"/\*.*?\*/", "", leer(carpeta, "css", archivo) if carpeta else leer("css", archivo), flags=re.S)
        if s.count("{") != s.count("}"):
            falla(f"css/{archivo}", "llaves desbalanceadas")
        if "@import" in s:
            falla(f"css/{archivo}", "usa @import (carga lenta y externa)")


def revisar_js(carpeta):
    for sub in ("js", "data"):
        directorio = ruta(carpeta, sub) if carpeta else ruta(sub)
        for archivo in sorted(os.listdir(directorio)):
            if not archivo.endswith(".js"):
                continue
            camino = os.path.join(directorio, archivo)
            r = subprocess.run(["node", "--check", camino], capture_output=True, text=True, encoding="utf-8")
            if r.returncode != 0:
                falla(f"{sub}/{archivo}", "error de sintaxis: " + r.stderr.strip().splitlines()[0])
            s = open(camino, encoding="utf-8").read()
            for patron, motivo in ((r"\beval\s*\(", "usa eval"), (r"new Function", "usa new Function"),
                                   (r"document\.write", "usa document.write"), (r"innerHTML\s*\+=", "suma a innerHTML"),
                                   (r"setTimeout\(\s*['\"]", "setTimeout con texto")):
                if re.search(patron, s):
                    falla(f"{sub}/{archivo}", motivo)


# ------------------------------------------------------------ publicar -----
PERMITIDOS = re.compile(r"^(index\.html|404\.html|robots\.txt|vercel\.json|css/[\w-]+\.css|js/[\w-]+\.js|data/[\w-]+\.js|img/[\w/-]+\.(webp|svg|png|jpg))$")


def revisar_publicar():
    base = ruta("publicar")
    if not os.path.isdir(base):
        falla("publicar", "no existe la carpeta publicar/ (corre herramientas/publicar.py)")
        return
    for raiz, _, archivos in os.walk(base):
        for a in archivos:
            rel = os.path.relpath(os.path.join(raiz, a), base).replace(os.sep, "/")
            if not PERMITIDOS.match(rel):
                falla("publicar", f"archivo que no debería publicarse: {rel}")
            if rel.endswith((".js", ".css", ".html")):
                s = open(os.path.join(raiz, a), encoding="utf-8").read()
                if "PENDIENTE" in s or "PROVISIONAL" in s:
                    falla("publicar", f"{rel} tiene notas internas (PENDIENTE/PROVISIONAL)")
    try:
        conf = json.load(open(os.path.join(base, "vercel.json"), encoding="utf-8"))
        cabeceras = {h["key"].lower(): h["value"] for regla in conf["headers"] for h in regla["headers"]}
    except Exception as e:
        falla("publicar", f"vercel.json no válido: {e}")
        return
    for necesaria in ("content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy",
                      "permissions-policy", "strict-transport-security"):
        if necesaria not in cabeceras:
            falla("publicar", f"falta la cabecera de seguridad {necesaria}")
    csp = cabeceras.get("content-security-policy", "")
    for directiva in ("default-src 'self'", "script-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'"):
        if directiva not in csp:
            falla("publicar", f"la CSP no tiene {directiva}")
    if "unsafe-inline" in csp or "unsafe-eval" in csp:
        falla("publicar", "la CSP permite código en línea (unsafe-inline/unsafe-eval)")
    revisar_html("publicar/index.html", publicado=True)
    revisar_css("publicar")
    revisar_js("publicar")


if __name__ == "__main__":
    Y = cargar_datos()
    if Y:
        revisar_datos(Y)
    revisar_html("index.html")
    revisar_css("")
    revisar_js("")
    if "publicar" in sys.argv[1:]:
        revisar_publicar()
    if hallazgos:
        print(f"Se encontraron {len(hallazgos)} problemas:")
        for zona, texto in hallazgos:
            print(f"  [{zona}] {texto}")
        sys.exit(1)
    print("Sin problemas.")
