document.addEventListener('DOMContentLoaded', () => {
  let newsData = [];
  let currentCategory = 'todos';
  let searchQuery = '';
  let manualsData = [];
  let manualSearchQuery = '';

  const newsList = document.getElementById('news-list');
  const searchInput = document.getElementById('search-input');
  const filterTagsContainer = document.getElementById('filter-tags-container');
  const urgentAlert = document.getElementById('urgent-alert');
  const urgentTitle = document.getElementById('urgent-title');
  const urgentDesc = document.getElementById('urgent-desc');

  // Elementos de Pestañas
  const mainTabButtons = document.querySelectorAll('.main-tab-btn');
  const mainTabContents = document.querySelectorAll('.main-tab-content');

  // Elementos de Manuales
  const manualsGrid = document.getElementById('manuals-grid');
  const manualSearchInput = document.getElementById('manual-search-input');
  const manualsListContainer = document.getElementById('manuals-list-container');
  const manualDetailContainer = document.getElementById('manual-detail-container');
  const btnBackToManuals = document.getElementById('btn-back-to-manuals');
  const manualDetailTitle = document.getElementById('manual-detail-title');
  const manualDetailDesc = document.getElementById('manual-detail-desc');
  const manualStepsTimeline = document.getElementById('manual-steps-timeline');

  // Pestañas Principales (Novedades vs Manuales)
  mainTabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      mainTabButtons.forEach(b => b.classList.remove('active'));
      mainTabContents.forEach(c => c.classList.remove('active'));
      
      e.currentTarget.classList.add('active');
      const tabId = e.currentTarget.getAttribute('data-main-tab');
      document.getElementById(`${tabId}-tab-content`).classList.add('active');
      
      // Resetear vista de detalle si volvemos a manuales
      if (tabId === 'manuals') {
        showManualsList();
      }
    });
  });

  // 1. Cargar las novedades, categorías y manuales desde sus respectivos archivos JSON
  async function loadData() {
    try {
      const cacheBuster = `t=${Date.now()}`;
      // Cargar todos los archivos JSON en paralelo para mayor velocidad
      const [newsResponse, categoriesResponse, manualsResponse] = await Promise.all([
        fetch(`noticias.json?${cacheBuster}`),
        fetch(`categorias.json?${cacheBuster}`),
        fetch(`manuales.json?${cacheBuster}`)
      ]);

      if (!newsResponse.ok) throw new Error('No se pudo cargar el archivo de novedades.');
      if (!categoriesResponse.ok) throw new Error('No se pudo cargar el archivo de categorías.');
      if (!manualsResponse.ok) throw new Error('No se pudo cargar el archivo de manuales.');
      
      const newsDataRaw = await newsResponse.json();
      const categoriesDataRaw = await categoriesResponse.json();
      const manualsDataRaw = await manualsResponse.json();
      
      newsData = newsDataRaw.novedades || [];
      const categoriesData = categoriesDataRaw.categorias || [];
      manualsData = manualsDataRaw.manuales || [];
      
      // Ordenar por fecha descendente (más recientes primero)
      newsData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      manualsData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      // Renderizar los filtros dinámicos y la alerta
      renderCategories(categoriesData);
      setupUrgentAlert();
      renderNews();
      renderManuals();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      const errMsg = `
        <div class="no-results">
          <div class="no-results-icon">⚠️</div>
          <h3>Error de Conexión</h3>
          <p>No pudimos cargar la información del servidor. Intente recargar la página.</p>
        </div>
      `;
      if (newsList) newsList.innerHTML = errMsg;
      if (manualsGrid) manualsGrid.innerHTML = errMsg;
    }
  }

  // 2. Renderizar dinámicamente los botones de filtros (categorías)
  function renderCategories(categories) {
    if (!filterTagsContainer) return;
    
    // Limpiar contenedor conservando la etiqueta
    filterTagsContainer.innerHTML = '<span class="filter-label">Filtrar por:</span>';
    
    // 1. Botón "Todos"
    const allBtn = document.createElement('button');
    allBtn.className = 'tag-btn active';
    allBtn.setAttribute('data-category', 'todos');
    allBtn.textContent = 'Todos';
    allBtn.addEventListener('click', handleCategoryClick);
    filterTagsContainer.appendChild(allBtn);
    
    // 2. Un botón por cada categoría de noticias.json
    categories.forEach(cat => {
      const name = cat.nombre || cat;
      if (!name) return;
      
      const btn = document.createElement('button');
      btn.className = 'tag-btn';
      btn.setAttribute('data-category', name);
      btn.textContent = name;
      btn.addEventListener('click', handleCategoryClick);
      filterTagsContainer.appendChild(btn);
    });
  }

  // Manejador del clic en las categorías
  function handleCategoryClick(e) {
    const allButtons = filterTagsContainer.querySelectorAll('.tag-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    currentCategory = e.currentTarget.getAttribute('data-category');
    renderNews();
  }

  // 3. Configurar la alerta urgente si existe alguna reciente (que contenga "urgente" en su categoría)
  function setupUrgentAlert() {
    const urgentNews = newsData.find(item => item.categoria && item.categoria.toLowerCase().includes('urgente'));
    
    if (urgentNews) {
      urgentTitle.textContent = urgentNews.titulo;
      urgentDesc.textContent = urgentNews.resumen;
      urgentAlert.classList.add('active');
      
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

  // 4. Renderizar las novedades aplicando filtros de categoría y búsqueda
  function renderNews() {
    const filteredNews = newsData.filter(item => {
      const matchesCategory = currentCategory === 'todos' || item.categoria === currentCategory;
      
      const textToSearch = `${item.titulo} ${item.resumen} ${item.contenido} ${item.categoria}`.toLowerCase();
      const matchesSearch = textToSearch.includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });

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

    filteredNews.forEach((item, index) => {
      const id = newsData.indexOf(item);
      const card = document.createElement('article');
      card.className = 'news-card';
      card.id = `noticia-${id}`;

      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
      const formattedDate = new Date(item.fecha).toLocaleDateString('es-AR', dateOptions);

      // Crear clases CSS amigables para el badge
      const categorySlug = item.categoria ? item.categoria.toLowerCase().replace(/\s+/g, '-') : 'default';

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

      const bodyHTML = parseMarkdown(item.contenido || '');

      card.innerHTML = `
        <div class="card-header">
          <span class="badge ${categorySlug}">${item.categoria || 'Novedad'}</span>
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

  // 5. Parser básico de Markdown a HTML (Para no requerir librerías pesadas)
  function parseMarkdown(md) {
    let html = md;
    
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<h3') || block.startsWith('<h4') || block.startsWith('<ul') || block.startsWith('<ol')) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
  }

  // 6. Búsqueda interactiva en tiempo real (con debounce simple)
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      renderNews();
    }, 200);
  });

  // 7. Lógica de cambio de tema (Claro / Oscuro)
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;

  // Cargar tema guardado en localStorage
  const savedTheme = localStorage.getItem('oga_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('oga_theme', isDark ? 'dark' : 'light');
      if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // --- Lógica de Renderizado y Búsqueda de Manuales ---
  function showManualsList() {
    manualsListContainer.style.display = 'block';
    manualDetailContainer.style.display = 'none';
  }

  function showManualDetail(manual) {
    manualsListContainer.style.display = 'none';
    manualDetailContainer.style.display = 'block';

    manualDetailTitle.textContent = manual.titulo;
    manualDetailDesc.textContent = manual.descripcion;

    manualStepsTimeline.innerHTML = '';
    if (!manual.pasos || manual.pasos.length === 0) {
      manualStepsTimeline.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Este instructivo no tiene pasos cargados aún.</p>';
      return;
    }

    const sortedSteps = [...manual.pasos].sort((a, b) => a.numero - b.numero);

    sortedSteps.forEach(paso => {
      const stepItem = document.createElement('div');
      stepItem.className = 'timeline-item';
      
      stepItem.innerHTML = `
        <div class="timeline-badge">${paso.numero}</div>
        <div class="timeline-content">
          <h3>${paso.titulo}</h3>
          <p>${paso.descripcion}</p>
        </div>
      `;
      manualStepsTimeline.appendChild(stepItem);
    });
  }

  if (btnBackToManuals) {
    btnBackToManuals.addEventListener('click', showManualsList);
  }

  function renderManuals() {
    if (!manualsGrid) return;

    const filteredManuals = manualsData.filter(item => {
      const textToSearch = `${item.titulo} ${item.descripcion}`.toLowerCase();
      return textToSearch.includes(manualSearchQuery.toLowerCase());
    });

    manualsGrid.innerHTML = '';

    if (filteredManuals.length === 0) {
      manualsGrid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Sin instructivos</h3>
          <p>No encontramos manuales que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    filteredManuals.forEach(manual => {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.style.cursor = 'pointer';
      
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
      const formattedDate = new Date(manual.fecha).toLocaleDateString('es-AR', dateOptions);

      card.innerHTML = `
        <div class="card-header">
          <span class="badge instructivos">Instructivo</span>
          <span class="news-date">${formattedDate}</span>
        </div>
        <h2>${manual.titulo}</h2>
        <p class="news-summary">${manual.descripcion}</p>
        <div class="news-actions">
          <button class="read-more-btn" style="color: var(--primary-light);">
            <span>Ver paso a paso</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      `;

      card.addEventListener('click', () => showManualDetail(manual));
      manualsGrid.appendChild(card);
    });
  }

  if (manualSearchInput) {
    let manualSearchTimeout;
    manualSearchInput.addEventListener('input', (e) => {
      clearTimeout(manualSearchTimeout);
      manualSearchTimeout = setTimeout(() => {
        manualSearchQuery = e.target.value;
        renderManuals();
      }, 200);
    });
  }

  // Inicializar carga
  loadData();
});
