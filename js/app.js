document.addEventListener('DOMContentLoaded', () => {
  let newsData = [];
  let currentCategory = 'todos';
  let searchQuery = '';

  const newsList = document.getElementById('news-list');
  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.tag-btn');
  const urgentAlert = document.getElementById('urgent-alert');
  const urgentTitle = document.getElementById('urgent-title');
  const urgentDesc = document.getElementById('urgent-desc');

  // 1. Cargar las novedades desde el archivo noticias.json
  async function loadNews() {
    try {
      // Usamos cache-busting para evitar que el navegador guarde la versión vieja de noticias.json
      const response = await fetch(`noticias.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('No se pudo cargar el archivo de novedades.');
      
      const data = await response.json();
      
      // Decap CMS almacena la lista en un objeto que definiremos en config.yml.
      // Soportamos tanto si viene como array directo o envuelto en un objeto.
      newsData = data.novedades || data || [];
      
      // Ordenar por fecha descendente (más recientes primero)
      newsData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setupUrgentAlert();
      renderNews();
    } catch (error) {
      console.error('Error al cargar novedades:', error);
      newsList.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">⚠️</div>
          <h3>Error de Conexión</h3>
          <p>No pudimos cargar las novedades del servidor. Intente recargar la página.</p>
        </div>
      `;
    }
  }

  // 2. Configurar la alerta urgente si existe alguna reciente
  function setupUrgentAlert() {
    // Buscar la novedad más reciente de la categoría 'Avisos Urgentes'
    const urgentNews = newsData.find(item => item.categoria === 'Avisos Urgentes');
    
    if (urgentNews) {
      urgentTitle.textContent = urgentNews.titulo;
      urgentDesc.textContent = urgentNews.resumen;
      urgentAlert.classList.add('active');
      
      // Permitir hacer clic para ir a la noticia
      urgentAlert.style.cursor = 'pointer';
      urgentAlert.onclick = () => {
        const element = document.getElementById(`noticia-${newsData.indexOf(urgentNews)}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          const btn = element.querySelector('.read-more-btn');
          if (btn && !btn.classList.contains('active')) {
            btn.click();
          }
        }
      };
    } else {
      urgentAlert.classList.remove('active');
    }
  }

  // 3. Renderizar las novedades aplicando filtros de categoría y búsqueda
  function renderNews() {
    // Filtrar datos
    const filteredNews = newsData.filter(item => {
      const matchesCategory = currentCategory === 'todos' || item.categoria === currentCategory;
      
      const textToSearch = `${item.titulo} ${item.resumen} ${item.contenido} ${item.categoria}`.toLowerCase();
      const matchesSearch = textToSearch.includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });

    // Limpiar contenedor
    newsList.innerHTML = '';

    if (filteredNews.length === 0) {
      newsList.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>No encontramos novedades que coincidan con los filtros aplicados.</p>
        </div>
      `;
      return;
    }

    // Renderizar tarjetas
    filteredNews.forEach((item, index) => {
      const id = newsData.indexOf(item); // Índice real en el array
      const card = document.createElement('article');
      card.className = 'news-card';
      card.id = `noticia-${id}`;

      // Formatear fecha para legibilidad local
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
      const formattedDate = new Date(item.fecha).toLocaleDateString('es-AR', dateOptions);

      // Crear clases CSS amigables para el badge
      const categorySlug = item.categoria.toLowerCase().replace(/\s+/g, '-');

      // Crear botón de adjunto si existe
      let attachmentHTML = '';
      if (item.adjunto_url && item.adjunto_url.trim() !== '') {
        const nombreAdjunto = item.adjunto_nombre || 'Descargar Documento';
        attachmentHTML = `
          <a href="${item.adjunto_url}" target="_blank" class="attachment-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            ${nombreAdjunto}
          </a>
        `;
      }

      // Convertir cuerpo en markdown a HTML básico
      const bodyHTML = parseMarkdown(item.contenido || '');

      card.innerHTML = `
        <div class="card-header">
          <span class="badge ${categorySlug}">${item.categoria}</span>
          <span class="news-date">${formattedDate}</span>
        </div>
        <h2>${item.titulo}</h2>
        <p class="news-summary">${item.resumen}</p>
        
        <div class="news-full-content" id="content-${id}">
          ${bodyHTML}
        </div>
        
        <div class="news-actions">
          <button class="read-more-btn" data-id="${id}">
            <span>Leer más</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          ${attachmentHTML}
        </div>
      `;

      newsList.appendChild(card);
    });

    // Agregar manejadores para los botones "Leer más"
    document.querySelectorAll('.read-more-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const id = btn.getAttribute('data-id');
        const contentDiv = document.getElementById(`content-${id}`);
        const labelSpan = btn.querySelector('span');

        if (contentDiv.classList.contains('active')) {
          contentDiv.classList.remove('active');
          btn.classList.remove('active');
          labelSpan.textContent = 'Leer más';
        } else {
          contentDiv.classList.add('active');
          btn.classList.add('active');
          labelSpan.textContent = 'Cerrar lectura';
        }
      });
    });
  }

  // 4. Parser básico de Markdown a HTML (Para no requerir librerías pesadas)
  function parseMarkdown(md) {
    let html = md;
    
    // Escapar caracteres HTML básicos para seguridad
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Negritas (**texto**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Títulos de nivel 3 (### título)
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    // Títulos de nivel 4 (#### título)
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');

    // Listas con viñetas (* item o - item)
    // Agrupa viñetas consecutivas
    html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li>$1</li>');
    // Envolver las listas li consecutivas en ul
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Limpieza de ul anidados erróneamente por el modificador global de arriba
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Saltos de línea y párrafos (buscar dobles saltos de línea)
    // Evitamos encerrar bloques HTML ya procesados (como h3 o ul) en párrafos
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<h3') || block.startsWith('<h4') || block.startsWith('<ul') || block.startsWith('<ol')) {
        return block;
      }
      // Reemplazar saltos de línea individuales con <br>
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
  }

  // 5. Filtros por botones de categoría
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      currentCategory = e.currentTarget.getAttribute('data-category');
      renderNews();
    });
  });

  // 6. Búsqueda interactiva en tiempo real (con debounce simple)
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      renderNews();
    }, 200);
  });

  // Inicializar carga
  loadNews();
});
