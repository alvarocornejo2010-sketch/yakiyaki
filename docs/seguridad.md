# Seguridad de la web de Yaki Yaki

Versión del 2026-10-05. Qué protege a la web, qué no se puede hacer y por qué, y qué falta cuando haya dominio.

## Primero: el código de una web no se puede encriptar

Para mostrar la página, el navegador de cada visitante necesita leer el HTML, el CSS y el JavaScript. Todo lo que llega al navegador se puede ver (Ctrl + U o las herramientas de desarrollador). Si el código estuviera encriptado, el navegador no podría mostrar la página. Lo que se vende como "encriptar" u "ofuscar" solo lo hace difícil de leer: se revierte con herramientas gratuitas y vuelve la web más lenta y más difícil de arreglar.

La protección real de una web como esta es otra:

1. **No publicar nada privado.** Esta web no tiene contraseñas, claves, base de datos ni pagos. Lo que muestra (carta, precios, dirección, horario, WhatsApp) es público por naturaleza.
2. **Que nadie pueda meter código ajeno en la página** ni cambiar lo que hace.
3. **Que el servidor le diga al navegador qué está permitido** (cabeceras de seguridad).

## Qué se hizo

### 1. Solo se publica lo necesario
`python herramientas/publicar.py` arma la carpeta `publicar/`, que es lo único que se sube a internet:

- Entra solo una lista fija de archivos: la página, sus estilos, su código, los datos y las fotos que se usan.
- No entran `docs/`, `herramientas/`, el PDF, las fotos originales ni `muestra-componentes.html`.
- De los datos se quitan los platos ocultos (`visible: false`) y las marcas hermanas apagadas, para que no queden a la vista en el código.
- Se quitan los comentarios y las notas internas (`[PENDIENTE]`, `[PROPUESTA]`). `revisar.py publicar` falla si queda alguna.
- El código va comprimido (129 KB pasan a 95 KB) y con el aviso "(c) Yaki Yaki. Todos los derechos reservados". No es una protección: carga más rápido, no deja notas internas a la vista y deja claro que el código tiene dueño.

### 2. Política de seguridad de contenido (CSP)
Le dice al navegador qué puede cargar la página. Lo demás lo bloquea, aunque alguien lograra meterlo:

| Qué | Permitido |
|---|---|
| Código (JavaScript) | Solo los archivos de la propia web. Nada de código escrito dentro del HTML |
| Estilos | Los de la web y los de Google Fonts |
| Fuentes | Las de la web y las de Google Fonts |
| Imágenes | Solo las de la web |
| Marcos | Solo el mapa de Google Maps |
| Formularios | No pueden enviar datos a ningún lado |
| Plugins (`object`) | Ninguno |

Se probó: un código metido a la fuerza en la página y una imagen que intentaba mandar datos a otro sitio fueron bloqueados por el navegador.

### 3. Cabeceras de seguridad
Las pone Vercel con `publicar/vercel.json`:

| Cabecera | Para qué |
|---|---|
| `Content-Security-Policy` | La política de arriba, más `frame-ancestors 'none'`: ninguna otra web puede meter esta página dentro de la suya para engañar con clics |
| `X-Frame-Options: DENY` | Lo mismo, para navegadores antiguos |
| `X-Content-Type-Options: nosniff` | El navegador no adivina tipos de archivo (evita que un archivo se ejecute como código) |
| `Referrer-Policy` | Al salir de la web hacia otro sitio, solo se informa el dominio, no la página exacta |
| `Permissions-Policy` | Cámara, micrófono, ubicación, pagos, USB y sensores, apagados |
| `Strict-Transport-Security` | Siempre por HTTPS (conexión cifrada), durante un año |
| `Cross-Origin-Opener-Policy` y `Cross-Origin-Resource-Policy` | Aíslan la página y sus archivos de otras webs |

### 4. El código no confía en nada
- Todo texto que se pone en la página pasa por un filtro (`esc`), así un dato con `<` o comillas no se convierte en código.
- Solo se publican enlaces `https://`. Un enlace raro en los datos (por ejemplo `javascript:`) se descarta.
- El número de WhatsApp solo puede tener dígitos. Si no, WhatsApp se apaga solo.
- El mapa de Google va aislado (`sandbox`): no puede mover ni tocar la página.
- Los enlaces que abren otra pestaña llevan `rel="noopener"`.

### 5. El pedido por WhatsApp
- El pedido se guarda solo en el navegador de cada persona. La web no tiene servidor que reciba datos: el mensaje va del celular de la persona a WhatsApp.
- Al abrir la página, lo guardado se compara con la carta actual. Lo que no existe, tiene cantidades raras o fue alterado se descarta. Se probó con intentos de meter código por ahí: se descartan sin efecto.

## Lo que no conviene hacer

- **Bloquear el clic derecho o Ctrl + U.** No impide ver el código (hay mil otras formas) y molesta a la gente de verdad, por ejemplo al copiar la dirección.
- **Ofuscar el JavaScript a fondo.** Se revierte con herramientas gratuitas, hace la web más lenta y algunos antivirus desconfían de código ofuscado.
- **Poner contraseña a la web.** Nadie podría verla.

## Lo que más importa: las cuentas

En un negocio como este, el riesgo real no está en el código sino en el acceso a las cuentas. Quien entra a Vercel, al dominio, a Instagram o a WhatsApp Business puede cambiar todo. Conviene:

- Activar la verificación en dos pasos en Vercel, en el proveedor del dominio, en Instagram, en TikTok y en WhatsApp Business.
- No compartir contraseñas por chat. Si alguien más administra, que tenga su propio acceso.

## Para cuando haya dominio

1. Subir la carpeta `publicar/` a Vercel (ver `docs/como-editar.md`, sección "Publicar").
2. Agregar en `index.html` el enlace canónico y la imagen para compartir (está marcado como `[PENDIENTE: dominio]`).
3. Comprobar las cabeceras con https://developer.mozilla.org/en-US/observatory (opcional).
4. Opcional: alojar las fuentes en la propia web en vez de Google Fonts. Así la política no necesita permitir a Google y las visitas no pasan por sus servidores. Hay que descargar los archivos de Archivo y Figtree (licencia libre SIL OFL).

## Cómo comprobar que todo sigue en orden

- `python herramientas/revisar.py`: revisa datos, HTML, CSS y JavaScript.
- `python herramientas/revisar.py publicar`: revisa la versión para publicar, incluidas la política y las cabeceras.
- `python herramientas/servidor.py 8161 publicar`: sirve la versión para publicar con las mismas cabeceras que Vercel.
- `herramientas/auditar-navegador.js`: auditoría en el navegador con Playwright. Revisa la página armada en 320, 375, 768 y 1280 px, el pedido por WhatsApp de punta a punta y el recorrido con teclado.
