# Portal de Novedades - OGA de Cobros y Apremios Concepción

Este es el proyecto oficial de novedades y anuncios autoadministrable para la **Oficina de Gestión Asociada (OGA) de Cobros y Apremios** del Centro Judicial de Concepción, Poder Judicial de Tucumán.

Cuenta con un diseño premium y adaptativo inspirado en la gráfica del portal de Acordadas del Poder Judicial y utiliza un **Panel de Administración Serverless Propio** para la gestión de contenidos directamente conectado con la API de GitHub, permitiendo una operatividad **100% gratuita, ilimitada y para siempre**.

---

## 🚀 Guía de Despliegue en Internet (100% Gratis)

Para subir la web y poner en funcionamiento el panel de control, seguí estos sencillos pasos:

### Paso 1: Subir tus archivos a GitHub
1. Iniciá sesión en [GitHub.com](https://github.com/) (creá una cuenta gratis si no la tenés).
2. Hacé clic arriba a la derecha en el botón **"+"** y elegí **"New repository"** (Nuevo repositorio).
3. Nombralo como prefieras (ejemplo: `novedades-oga`).
4. Elegí si querés que sea **Público** o **Privado** (recomendamos **Público** para facilitar la publicación en un clic). Hacé clic en **"Create repository"**.
5. En la pantalla que sigue, seleccioná el enlace **"uploading an existing file"** (subir archivos existentes).
6. Arrastrá y soltá **todos** los archivos de este directorio local (las carpetas `css`, `js`, `admin`, `assets`, y los archivos `index.html`, `noticias.json`, `categorias.json`, etc.).
7. Al finalizar la carga, presioná el botón verde **"Commit changes"** para guardar.

### Paso 2: Activar la Web Gratis (GitHub Pages)
1. Dentro de tu repositorio en GitHub, hacé clic en la pestaña ⚙️ **Settings** (Configuración) en el menú superior.
2. En el menú lateral izquierdo, ingresá a la sección **"Pages"**.
3. En la sección **Build and deployment**:
   - **Source:** Elegí `Deploy from a branch` (Desplegar desde una rama).
   - **Branch:** Cambialo de *None* a `main` y la carpeta a `/ (root)`.
4. Hacé clic en **Save** (Guardar).
5. ¡Listo! En menos de 1 minuto GitHub te dará el enlace público de tu sitio en la parte superior (ej: `https://tu-usuario.github.io/novedades-oga/`).

---

## 🔑 Cómo entrar al Panel Administrador y Configurar tu Token (PAT)

El administrador de la web no requiere instalar nada en tu computadora, ni configurar servidores o bases de datos complejas. Funciona 100% en tu navegador y se conecta de forma segura con tu repositorio.

### Paso 1: Generar tu Clave de Escritura (Token PAT)
Para que el panel pueda escribir en tu repositorio, GitHub requiere que generes una clave personal temporal:
1. En GitHub.com, hacé clic en tu foto de perfil arriba a la derecha e ingresá a **Settings** (Configuración).
2. Bajá en el menú de la izquierda al final y hacé clic en **"Developer Settings"**.
3. Seleccioná **"Personal access tokens"** -> **"Tokens (classic)"**.
4. Hacé clic en el botón **"Generate new token"** -> **"Generate new token (classic)"**.
5. Colocá una descripción en *Note* (ej: `Panel Novedades OGA`).
6. En la lista de permisos, marcá la primera casilla **"repo"** completa (esto da permiso de subir archivos al repositorio).
7. Hacé clic abajo de todo en **"Generate token"**.
8. **Copiá el código generado** (comienza con `ghp_`). *Guardalo bien ya que GitHub no lo vuelve a mostrar.*

### Paso 2: Configurar el Administrador
1. Entrá a tu web agregando `/admin/` al final de la URL (ejemplo: `https://tu-usuario.github.io/novedades-oga/admin/`).
2. En la pestaña de **Credenciales de Conexión**, completá los datos:
   - **Usuario:** Tu nombre de usuario de GitHub.
   - **Repositorio:** El nombre exacto que le pusiste al repositorio (ej: `novedades-oga`).
   - **Token (PAT):** Pegá la clave que generaste en el paso anterior.
3. Hacé clic en **"Conectar y Validar Repositorio"**. 

El sistema validará tus credenciales y quedará conectado de forma permanente en ese navegador (no tendrás que volver a introducirlas). Las pestañas de **Novedades** y **Categorías** quedarán desbloqueadas.

---

## ✍️ Gestión de Novedades e Integridad de Categorías

El panel propio te ofrece herramientas avanzadas para la gestión de contenidos:

*   **Gestión de Novedades (CRUD Completo):** Podés agregar nuevas novedades mediante un formulario visual, editar noticias publicadas anteriormente y eliminar las que ya no correspondan. Soporta autocompletado de fecha, subida y enlace de archivos PDF (como resoluciones) y redacción en Markdown.
*   **Gestión de Categorías Dinámicas:** En la pestaña **Categorías** podés agregar nuevos filtros, modificarlos o eliminarlos.
*   **Integridad de Datos:** Si cambiás el nombre de una categoría existente (por ejemplo, de `"Procedimientos"` a `"Procedimientos Digitales"`), el sistema **actualizará de manera automática** la categoría de todas las novedades publicadas que usaran la anterior versión para evitar inconsistencias en la base de datos pública.
