# 📺 Parrilla TV · España (web app para iPhone)

Guía de televisión de España: TDT, autonómicas, Movistar+, DAZN, LaLiga TV, Eurosport, locales…
Tiene **línea de tiempo**, una vista **Ahora** y un **buscador** de programas y cadenas.

Funciona **entera en el teléfono**, sin servidor:

- Descarga la guía pública *EPG dobleM* (davidmuma, en GitHub), unos 7,5 MB.
- La procesa en el propio iPhone y la guarda en él.
- Se actualiza sola cada 6 horas cuando hay conexión. Sin conexión usa la última guía guardada.

GitHub Pages solo sirve para *repartir* la app, es decir, para que el iPhone pueda instalarla desde un enlace.
Quien la instala **no necesita cuenta de GitHub** ni nada más: solo el enlace y Safari.

---

## Contenido de la carpeta

| Fichero | Qué es |
|---|---|
| `index.html` | La aplicación (interfaz y búsquedas) |
| `guia-worker.js` | Descarga y procesa la guía en segundo plano |
| `sw.js` | Service worker: permite abrir la app sin conexión |
| `manifest.webmanifest` | Nombre, colores e iconos de la app instalada |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Iconos |
| `README.md` | Estas instrucciones |

---

## PARTE 1 · Publicarla en GitHub Pages (una sola vez, solo tú)

### 1. Crear la cuenta de GitHub
1. Entra en <https://github.com> y pulsa **Sign up**.
2. Escribe un correo, una contraseña y un **nombre de usuario**.
   El nombre de usuario formará parte del enlace de la app, por ejemplo `beni-iag`.
3. Confirma el código que te llega por correo. El plan gratuito (*Free*) es suficiente.

### 2. Crear el repositorio
1. Arriba a la derecha, pulsa **+** → **New repository**.
2. **Repository name**: `parrilla-tv`.
3. Marca **Public**. GitHub Pages gratuito solo funciona con repositorios públicos.
   Estos ficheros no contienen nada privado.
4. Deja el resto como está y pulsa **Create repository**.

### 3. Subir los ficheros
1. En la página del repositorio recién creado, pulsa el enlace **uploading an existing file**.
   También puedes ir a **Add file → Upload files**.
2. **Arrastra los 8 ficheros** de esta carpeta a la ventana del navegador.
   ⚠️ Arrastra los ficheros, **no la carpeta**. `index.html` tiene que quedar en la raíz del repositorio,
   no dentro de una subcarpeta.
3. Abajo, pulsa **Commit changes**.

### 4. Activar GitHub Pages
1. Dentro del repositorio, pulsa **Settings** (pestaña de arriba, con el icono de engranaje).
2. En el menú de la izquierda, pulsa **Pages**.
3. En **Build and deployment → Source**, elige **Deploy from a branch**.
4. En **Branch**, elige `main` y la carpeta `/ (root)`. Pulsa **Save**.
5. Espera 1–2 minutos y recarga la página de *Pages*.
   Arriba aparecerá: **“Your site is live at `https://TU-USUARIO.github.io/parrilla-tv/`”**.
   Puedes ver el progreso en la pestaña **Actions**; cuando termina sale un círculo verde ✓.

**Ese es el enlace de la app.** Ábrelo una vez en el ordenador para comprobar que carga la guía.

### 5. Compartirla
Manda el enlace `https://TU-USUARIO.github.io/parrilla-tv/` por WhatsApp, correo, etc.
Cada persona la instala siguiendo la Parte 2.

---

## PARTE 2 · Instalarla en un iPhone (cualquier persona, sin GitHub)

**Requisito:** iOS 16.4 o posterior. Lo puedes comprobar en *Ajustes → General → Información → Versión de iOS*.
Con versiones anteriores también funciona, pero descarga una guía más pesada (34 MB).

1. **Abre el enlace en Safari.**
   - Si lo abres desde WhatsApp u otra app y se abre en el navegador interno de esa app,
     pulsa el botón de compartir o el de los tres puntos y elige **Abrir en Safari**.
2. Espera a que diga *Descargando la guía de TV…* y luego aparezca la parrilla.
   Tarda entre 5 y 15 s. Mejor con Wi-Fi, porque son unos 7,5 MB.
3. Pulsa el botón **Compartir** (el cuadrado con una flecha hacia arriba ⬆︎):
   - **iOS 26**: está en el menú **···** (abajo a la derecha) → **Compartir**.
   - **iOS 16–18**: está en la barra inferior de Safari.
4. Desliza hacia abajo en el menú y pulsa **Añadir a pantalla de inicio**.
   Si no aparece, pulsa *Ver más* o *Editar acciones…* al final de la lista.
5. Si aparece el interruptor **Abrir como app web**, déjalo **activado**.
   Pulsa **Añadir** (arriba a la derecha).
6. En la pantalla de inicio aparece el icono **Parrilla TV**. A partir de ahora ábrela siempre desde ahí:
   se abre a pantalla completa, como una app normal.

> La primera vez que la abras desde el icono volverá a descargar la guía (unos segundos).
> Es normal: iOS guarda por separado los datos de Safari y los de las apps de la pantalla de inicio.

### Uso rápido
- **Línea de tiempo**: muestra un día cada vez. Desliza en horizontal para moverte por las horas
  y en vertical para pasar de cadena. La línea roja es la hora actual.
  Los botones *Ayer / Hoy / Mañana / …* cambian de día.
- **Toca un programa** para ver su ficha.
  Desde la ficha puedes ver *Otras emisiones* de ese programa o *Toda la programación* de la cadena.
- **Toca el nombre de una cadena** para ver solo esa cadena.
  **★** la añade a *Favoritos*, que puedes elegir en el desplegable de grupos.
- **Ahora**: lo que se emite en este momento en cada cadena, y lo siguiente.
- **Buscar**: no distingue tildes ni mayúsculas. Por ejemplo «real madrid», «la promesa» o «telemadrid».
  Si marcas *Buscar también en la descripción*, encuentra también actores y directores.
- **?** abre la ayuda con el significado de los colores de los programas y del resto de marcas.
- **✕** dentro del buscador o del filtro de cadenas los borra.
  **↺ Restablecer** solo aparece cuando hay algo filtrado y vuelve al estado inicial:
  todas las cadenas, el día de hoy y la hora actual.
- **Actualizar guía** (abajo) fuerza la descarga si no quieres esperar a la actualización automática.

### 🔔 Avisos de programas
1. Abre la ficha de un programa y pulsa **🔔 Avisarme**.
   **🔔 Todas las emisiones en …** marca todos los capítulos o emisiones futuras de ese programa en esa cadena.
   Los programas marcados salen con borde amarillo y una campanita.
2. En la pestaña **🔔** elige con cuánta antelación avisar: por defecto para todos o para cada programa por separado
   (a la hora, 5, 10, 15, 30 o 45 min, 1 h o 2 h antes).
3. Pulsa **📅 Añadir al Calendario**. iOS muestra los eventos; pulsa **Añadir todo** y elige el calendario.
   Cada evento lleva su alarma, así que **el iPhone avisa aunque la app esté cerrada**.
   Cada vez que marques programas nuevos, vuelve a pulsarlo: solo exporta los que faltan.
   - Si *Abrir en Calendario* no hace nada, cambia el desplegable a **Compartir fichero .ics**,
     pulsa *Guardar en Archivos* y abre ese fichero desde la app Archivos: aparece la misma opción *Añadir todo*.
   - Conviene crear antes en la app Calendario un calendario llamado «TV» y elegirlo al importar.
     Así, para borrar todos los avisos de golpe basta con borrar ese calendario.
4. **Activar avisos en la app** (opcional): saca además una notificación mientras la app está abierta.
   En iPhone solo funciona con la app instalada en la pantalla de inicio.

Por qué el Calendario: iOS no permite que una web app programe por sí sola notificaciones para más tarde.
Las notificaciones con la app cerrada (Web Push) necesitan un servidor que las envíe.

Cuando la guía se actualiza, la app comprueba los programas marcados:
- Si un programa ha **cambiado de hora**, lo mueve y lo marca con ⚠ para que lo vuelvas a añadir al Calendario.
  El evento antiguo hay que borrarlo a mano en el Calendario.
- Si un programa ha desaparecido de la guía, lo indica con ⚠.

---

## Mantenimiento

**Cambiar la app.** En el repositorio, entra en el fichero y pulsa el lápiz ✏️ (o vuelve a subirlo con
*Add file → Upload files*). Después pulsa *Commit changes*. En 1–2 minutos queda publicado.
Los iPhone reciben la versión nueva la siguiente vez que abren la app con conexión.
Si cambias varios ficheros, sube también el número de `VERSION` en `sw.js` (`parrilla-v1` → `parrilla-v2`)
para que se borre la copia antigua guardada en los teléfonos.

**La guía no se mantiene aquí.** La actualiza davidmuma a diario y cada iPhone la descarga directamente
de su GitHub, así que no hay que hacer nada para tenerla al día.

**Probarla en el ordenador antes de publicar:**
```bash
cd parrilla_pwa && python3 -m http.server 8900
# abrir http://localhost:8900
```
No funciona abriendo `index.html` con doble clic: el navegador necesita servirla por http(s).

---

## Problemas frecuentes

| Síntoma | Solución |
|---|---|
| Se queda en *Descargando…* o da error | Comprueba la conexión. Desactiva un momento el *Modo de datos reducidos* o el bloqueador de contenido, y pulsa *Reintentar* |
| No aparece «Añadir a pantalla de inicio» | Tienes que estar en **Safari**, no en el navegador interno de WhatsApp, Instagram, etc. |
| GitHub Pages da error 404 | Revisa que `index.html` está en la raíz del repositorio y no dentro de una carpeta, y que en *Settings → Pages* la rama es `main` / `(root)` |
| La app vuelve a descargar la guía tras semanas sin usarla | iOS borra los datos de las web apps que no se usan durante mucho tiempo. Se recupera sola en unos segundos |
| «Añadir al Calendario» no abre nada | Elige «Compartir fichero .ics» en la pestaña 🔔, guarda el fichero en Archivos y ábrelo desde ahí |
| Una cadena está en un grupo que no le corresponde | Los grupos se asignan por el nombre de la cadena, en la lista `GRUPOS` de `guia-worker.js`. Se pueden ajustar ahí |
| Faltan días en canales de pago o deportivos | La guía de origen suele traer menos días para esos canales que para la TDT |
