# Portal de Novedades - OGA de Cobros y Apremios

Este proyecto es una plataforma web autoadministrable diseñada especialmente para la **Oficina de Gestión Asociada (OGA) de Cobros y Apremios** del Poder Judicial de Tucumán. 

Combina un diseño institucional premium, limpio y ágil con la potencia de **Decap CMS** para permitir publicar y editar novedades de forma visual y gratuita, sin requerir bases de datos ni servidores pagos.

---

## 🚀 Guía de Despliegue Paso a Paso (100% Gratis)

Para poner en funcionamiento el sitio y el panel de administración, seguí estos sencillos pasos:

### Paso 1: Subir el proyecto a GitHub
1. Creá una cuenta gratuita en [GitHub](https://github.com/) si aún no tenés una.
2. Creá un nuevo repositorio en blanco (puede ser público o privado, recomendamos **público** para facilitar la publicación rápida en el hosting). Nombralo por ejemplo: `oga-novedades`.
3. Subí todos los archivos de este directorio a tu nuevo repositorio de GitHub.

### Paso 2: Crear el sitio en Netlify
1. Entrá a [Netlify](https://www.netlify.com/) y creá una cuenta gratuita (recomendamos iniciar sesión con tu cuenta de GitHub para mayor rapidez).
2. Hacé clic en el botón **"Add new site"** (Añadir nuevo sitio) y seleccioná **"Import an existing project"** (Importar un proyecto existente).
3. Elegí **GitHub** como proveedor e inicia sesión si te lo solicita.
4. Seleccioná tu repositorio `oga-novedades`.
5. En la configuración de construcción:
   - **Build command:** *Dejalo en blanco (no se requiere compilar nada)*.
   - **Publish directory:** `.` (un solo punto, lo que indica la carpeta raíz).
6. Hacé clic en **"Deploy oga-novedades"** (Desplegar sitio). En un par de minutos, Netlify te dará una dirección web pública gratuita (ej: `https://oga-novedades.netlify.app`).

### Paso 3: Configurar la Autenticación (Netlify Identity)
Este paso es crucial para habilitar el inicio de sesión seguro de los administradores sin escribir código:
1. En el panel de control de tu sitio en Netlify, ve a la pestaña **"Site configuration"** (Configuración del sitio).
2. Buscá en el menú lateral izquierdo la sección **"Identity"** (Identidad) y hacé clic en **"Enable Identity"** (Habilitar Identidad).
3. Desplázate hacia abajo hasta la sección **"Services"** (Servicios) -> **"Git Gateway"** y hacé clic en **"Enable Git Gateway"** (Habilitar Git Gateway). Te pedirá autorización para conectarse a tu cuenta de GitHub; dale permisos. Esto le permite a Netlify subir los cambios del CMS directamente a tu repositorio.
4. Volvé arriba a la pestaña de **"Identity"** y en la sección de **"Registration preferences"** (Preferencias de registro), cambiala a **"Invite only"** (Solo invitación) para evitar que cualquier persona ajena a la OGA pueda registrarse como administrador.

### Paso 4: Crear tu Cuenta de Administrador
1. En la misma pestaña de **"Identity"** en Netlify, hacé clic en el botón **"Invite users"** (Invitar usuarios).
2. Ingresá tu correo electrónico (o los correos de las personas encargadas de publicar novedades en la OGA).
3. Recibirás un correo electrónico de invitación con un enlace. **Hacé clic en el enlace**.
4. Te redirigirá a la web oficial y se abrirá una ventana emergente para que elijas una contraseña. Una vez creada, ¡tu cuenta estará activa!

---

## ✍️ Cómo publicar y administrar noticias

Una vez completado el despliegue:
1. Entrá a la URL de tu sitio web agregando `/admin/` al final (ejemplo: `https://tu-sitio.netlify.app/admin/`).
2. Iniciá sesión con tu correo y contraseña.
3. Verás una lista con las novedades cargadas actualmente (provenientes de `noticias.json`).
4. Hacé clic en el botón **"New Novedad OGA"** (o en cualquiera de las noticias para editarla).
5. Completá el formulario visual:
   - Redactá el texto usando negrita, listas, etc.
   - Podés subir un archivo PDF adjunto (como una resolución) directamente desde el cargador de archivos del panel.
6. Hacé clic en **"Publish"** (Publicar) arriba a la derecha.

*Netlify recibirá el cambio en GitHub, actualizará el archivo `noticias.json` automáticamente y en menos de 1 minuto los cambios estarán visibles para todo el público en tu web principal.*

---

## 🛠️ Estructura de Archivos del Proyecto
*   `index.html`: Portal público de novedades adaptado al fuero.
*   `noticias.json`: Archivo de base de datos que guarda las noticias creadas.
*   `css/styles.css`: Estilos visuales institucionales responsivos de alta calidad.
*   `js/app.js`: Lógica de carga, búsqueda interactiva y filtros en el frontend.
*   `admin/index.html`: Carga la interfaz administrativa de Decap CMS.
*   `admin/config.yml`: Reglas de funcionamiento y campos del editor de Decap CMS.
*   `assets/uploads/`: Carpeta destinada a guardar los PDFs y recursos adjuntos que se suban.
