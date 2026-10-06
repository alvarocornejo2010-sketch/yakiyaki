# Cómo editar la web de Yaki Yaki

Todo lo que se ve en la web sale de dos archivos. El diseño no se toca.

| Quiero cambiar… | Archivo | Dónde |
|---|---|---|
| Un precio, una descripción o un plato | `data/carta.js` | En `platos`, busca el nombre del plato |
| Qué platos salen en Favoritos o Combos | `data/carta.js` | `favoritos` y `combos` (van los `id` de los platos) |
| Las opciones de la YakiBox | `data/carta.js` | `yakibox` |
| Horario, teléfono, dirección, enlaces | `data/negocio.js` | `horario`, `telefono`, `direccion`, `canales`, `redes` |
| Un texto de la web (títulos, botones) | `data/negocio.js` | `YAKI.textos` |

## Reglas

- Cambia solo lo que está entre comillas. No borres comas, llaves `{ }` ni corchetes `[ ]`.
- Precio sin confirmar: pon `precio: null` y el plato muestra "Consultar".
- Para esconder un plato sin borrarlo: agrega `visible: false`.
- Una categoría sin platos visibles se esconde sola.
- Un canal con enlace vacío (`pedidosya: ''`) no se muestra.

## Interruptores en `data/negocio.js`

| Interruptor | Qué hace al ponerlo en `true` |
|---|---|
| `whatsapp.confirmado` | Muestra WhatsApp en la barra del celular, la hoja de pedido, Ubicación y el pie, con el mensaje armado. Está en `true` |
| `consumoEnLocal` | La portada dice "para comer aquí o pedir" |
| `marcasHermanas.mostrar` | Muestra la sección de Taiyaki Pez y Tokuyaki |

La web no tiene botones para llamar: los pedidos van por WhatsApp o Rappi.

En el horario, cada día puede ser `{ abre: '12:00', cierra: '22:00' }`, `'cerrado'` o `'por confirmar'`. Lo que está "por confirmar" no se publica.

## Pedido por WhatsApp

Con `pedidoPorWhatsApp: true` (y WhatsApp confirmado), cada plato tiene un botón **Agregar**. La persona elige sabor, tamaño y cantidad, revisa "Tu pedido" y toca **Enviar pedido por WhatsApp**: se abre WhatsApp con el mensaje ya escrito, con cada plato, sus opciones, el precio y el total. No hay pago en línea: el local confirma por WhatsApp.

- Lo que se elige al agregar sale de `opciones` de cada plato en `data/carta.js`. `elegir: 2` deja marcar hasta dos (como los sabores del Combo 2).
- Los pasos de la Yakibox salen de `yakibox.pasos`.
- Un plato con `precio: null` se puede agregar y sale como "precio a consultar".
- El pedido se guarda en el navegador de cada persona hasta que lo envíe o lo vacíe.

## Cabecera

En `data/negocio.js`, `cabecera` decide qué va junto al logo en computadora: `''` (nada), `'estado'`, `'direccion'`, `'estado-direccion'`, `'promo'` o `'marca'`. Para ver una opción sin cambiar el archivo, agrega `?cabecera=promo` (o la que quieras) al final de la dirección de la página.

Con `'promo'`, el plato que se anuncia es el de `cabeceraPromo`: el `id` de un plato visible y con precio de `data/carta.js` (ahora `'combo-2'`). Si cambias el `id` de ese plato, cámbialo aquí también; `revisar.py` avisa si no coincide.

## Carta

Se muestra toda seguida, con un título por categoría y en columnas según el ancho de la pantalla. Cada categoría tiene enlace directo, por ejemplo `#menu-entradas`.

## Fotos

Van en `img/carta/`. Si una foto nueva reemplaza a otra con el mismo nombre, no hay que tocar nada más. Para las fotos con `chica: true` también hace falta la versión de 400 px de ancho con el mismo nombre más `-400` (por ejemplo `takoyaki-400.webp`).

## Para revisar después de editar

Para verla con los cambios al instante, usa el servidor del proyecto (no guarda copias viejas): `python herramientas/servidor.py 8160` y abre `http://localhost:8160`.

Abre `index.html` en el navegador. Si arriba aparece un aviso amarillo, hay un error de escritura en un archivo de datos. Si no ves tu cambio, recarga con Ctrl + F5.

Después corre `python herramientas/revisar.py`. Tiene que decir "Sin problemas."; si no, dice qué archivo y qué arreglar (por ejemplo, un `id` de plato que no existe o un enlace sin `https://`).

## Publicar

Lo que se sube a internet es la carpeta `publicar/`, nunca la carpeta del proyecto entera (tiene notas internas, el PDF y las herramientas).

1. `python herramientas/revisar.py`: debe decir "Sin problemas."
2. `python herramientas/publicar.py`: arma `publicar/` (solo lo necesario, comprimido y con las cabeceras de seguridad en `vercel.json`).
3. `python herramientas/revisar.py publicar`: revisa esa versión.
4. Opcional: pruébala tal como quedará, con las cabeceras de seguridad: `python herramientas/servidor.py 8161 publicar` y abre `http://localhost:8161`.
5. Sube `publicar/` a Vercel; por ejemplo, desde esa carpeta, `vercel --prod`.

Cada cambio en los datos necesita repetir los pasos 1 a 5. Qué protege a la web y por qué está en `docs/seguridad.md`.
