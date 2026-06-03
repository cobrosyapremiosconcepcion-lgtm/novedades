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

## 🔑 Cómo entrar al Panel Administrador

El panel de administración funciona de forma 100% estática en tu navegador y ya tiene incorporados de manera segura y encriptada los accesos a tu repositorio.

### Credenciales de Acceso por Defecto:
1. Accedé a tu web agregando `/admin/` al final de la URL (ejemplo: `https://tu-usuario.github.io/novedades/admin/`).
2. Se te presentará una pantalla de inicio de sesión.
3. Ingresá la contraseña de administrador establecida
4. Hacé clic en **"Iniciar Sesión"**.

El sistema validará de forma segura las claves encriptadas conectándose directamente con la API de GitHub. Al validar con éxito, las secciones de **Gestión de Novedades** y **Categorías de Filtros** quedarán desbloqueadas de manera inmediata. La sesión durará activa en tu navegador hasta que cierres la pestaña o hagas clic en *"Salir del Panel"*.

---

## ✍️ Gestión de Novedades e Integridad de Categorías

El panel propio te ofrece herramientas avanzadas para la gestión de contenidos:

*   **Gestión de Novedades (CRUD Completo):** Podés agregar nuevas novedades mediante un formulario visual, editar noticias publicadas anteriormente y eliminar las que ya no correspondan. Soporta autocompletado de fecha, subida y enlace de archivos PDF (como resoluciones) y redacción en Markdown.
*   **Gestión de Categorías Dinámicas:** En la pestaña **Categorías** podés agregar nuevos filtros, modificarlos o eliminarlos.
*   **Integridad de Datos:** Si cambiás el nombre de una categoría existente (por ejemplo, de `"Procedimientos"` a `"Procedimientos Digitales"`), el sistema **actualizará de manera automática** la categoría de todas las novedades publicadas que usaran la anterior versión para evitar inconsistencias en la base de datos pública.
