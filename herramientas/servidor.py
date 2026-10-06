"""Servidor local para revisar la web.

Pide al navegador no guardar copias (Cache-Control: no-store), así cada
recarga muestra los últimos cambios de CSS, JS y datos.

Uso: python herramientas/servidor.py 8160            (código fuente)
     python herramientas/servidor.py 8161 publicar   (versión para publicar,
                                                     con las cabeceras de vercel.json)
"""
import functools
import http.server
import json
import os
import sys


def cabeceras_de(carpeta):
    """Lee las cabeceras de seguridad de vercel.json, si existe."""
    conf = os.path.join(carpeta, "vercel.json")
    if not os.path.isfile(conf):
        return []
    datos = json.load(open(conf, encoding="utf-8"))
    return [(h["key"], h["value"]) for regla in datos.get("headers", []) for h in regla["headers"]]


class SinCache(http.server.SimpleHTTPRequestHandler):
    extra = []

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        for clave, valor in self.extra:
            if clave.lower() == "strict-transport-security":
                continue  # en http://localhost no aplica
            self.send_header(clave, valor)
        super().end_headers()


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8160
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if len(sys.argv) > 2:
        raiz = os.path.join(raiz, sys.argv[2])
    SinCache.extra = cabeceras_de(raiz)
    manejador = functools.partial(SinCache, directory=raiz)
    print(f"Sirviendo {raiz} en http://localhost:{puerto}"
          + (f" con {len(SinCache.extra)} cabeceras de seguridad" if SinCache.extra else ""))
    http.server.ThreadingHTTPServer(("127.0.0.1", puerto), manejador).serve_forever()
