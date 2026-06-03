document.addEventListener('DOMContentLoaded', () => {
  // --- Credenciales Encriptadas (Suministradas por el usuario) ---
  const ENC_USER = "AAAMEQoDGggfHFddW1kQDAENBhUTCgYBXB1eURcC";
  const ENC_REPO = "DQAYBgERBwwc";
  const ENC_PAT = "BAcePFNAAFkFKQVHawUgWhoBKQYCCFtZSEpLcjAjBgomKlAaVgBfWQ==";

  // --- Variables de Sesión Desencriptadas ---
  let gitToken = '';
  let gitUser = '';
  let gitRepo = '';

  let newsData = [];
  let categoriesData = [];
  let newsSha = '';
  let categoriesSha = '';

  let editingNewsIndex = null; // null = creando, número = editando

  // --- Elementos del DOM ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Login
  const loginContainer = document.getElementById('login-container');
  const loginForm = document.getElementById('login-form');
  const adminPasswordInput = document.getElementById('admin-password');

  // Dashboard General
  const dashboardContainer = document.getElementById('dashboard-container');
  const connStatus = document.getElementById('connection-status');
  const btnDisconnect = document.getElementById('btn-disconnect');

  // Novedades
  const newsTableBody = document.getElementById('news-table-body');
  const btnAddNews = document.getElementById('btn-add-news');
  const newsModal = document.getElementById('news-modal');
  const newsForm = document.getElementById('news-form');
  const modalTitle = document.getElementById('modal-title');
  const btnCancelNews = document.getElementById('btn-cancel-news');
  const categorySelect = document.getElementById('news-category');

  // Categorías
  const categoriesList = document.getElementById('categories-list');
  const addCategoryForm = document.getElementById('add-category-form');
  const newCategoryInput = document.getElementById('new-category-input');

  // Toasts de Notificación
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- Helpers de Cifrado Simétrico XOR (Cliente-Servidor) ---
  function xorCipher(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  function decrypt(base64Text, key) {
    try {
      const binary = atob(base64Text.replace(/\s/g, ''));
      return xorCipher(binary, key);
    } catch (e) {
      return '';
    }
  }

  // --- Helpers de Codificación Unicode/UTF-8 Base64 para GitHub API ---
  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  function b64DecodeUnicode(str) {
    const cleanedStr = str.replace(/\s/g, '');
    return decodeURIComponent(atob(cleanedStr).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  // --- Sistema de Notificación (Toast) ---
  function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // --- Gestión de Sesión de Login ---

  // Mostrar el Dashboard y cargar datos
  function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
    
    connStatus.className = 'connection-badge success';
    connStatus.textContent = 'Conectado';
    btnDisconnect.style.display = 'inline-block';
    
    loadDashboardData();
  }

  // Ocultar Dashboard y pedir contraseña
  function hideDashboard() {
    loginContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';
    
    connStatus.className = 'connection-badge danger';
    connStatus.textContent = 'Desconectado';
    btnDisconnect.style.display = 'none';
    adminPasswordInput.value = '';
  }

  // Validar credenciales haciendo consulta rápida a la API de GitHub
  async function testGitHubConnection(token, user, repo) {
    try {
      const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  // Formulario de Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = adminPasswordInput.value.trim();

    if (!password) {
      showToast('Por favor, ingrese la contraseña de acceso.', true);
      return;
    }

    showToast('Validando credenciales en GitHub...');

    // Desencriptar localmente usando la contraseña como llave
    const decryptedUser = decrypt(ENC_USER, password);
    const decryptedRepo = decrypt(ENC_REPO, password);
    const decryptedPat = decrypt(ENC_PAT, password);

    // Validar token desencriptado contra la API
    const isConnected = await testGitHubConnection(decryptedPat, decryptedUser, decryptedRepo);

    if (isConnected) {
      gitToken = decryptedPat;
      gitUser = decryptedUser;
      gitRepo = decryptedRepo;

      // Guardar sesión en sessionStorage (se borra al cerrar la pestaña)
      sessionStorage.setItem('oga_admin_logged', 'true');
      sessionStorage.setItem('oga_admin_password', password);

      showToast('¡Sesión iniciada con éxito!');
      showDashboard();
    } else {
      showToast('Contraseña de administrador incorrecta o sin acceso a internet.', true);
      adminPasswordInput.value = '';
      adminPasswordInput.focus();
    }
  });

  // Botón Salir
  btnDisconnect.addEventListener('click', () => {
    if (confirm('¿Desea cerrar la sesión de administración?')) {
      gitToken = '';
      gitUser = '';
      gitRepo = '';
      sessionStorage.removeItem('oga_admin_logged');
      sessionStorage.removeItem('oga_admin_password');
      showToast('Sesión cerrada.');
      hideDashboard();
    }
  });

  // --- Operaciones de Lectura / Escritura en GitHub API ---
  async function fetchFile(path) {
    const response = await fetch(`https://api.github.com/repos/${gitUser}/${gitRepo}/contents/${path}?t=${Date.now()}`, {
      headers: {
        'Authorization': `token ${gitToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al leer el archivo ${path} en GitHub.`);
    }

    const fileData = await response.json();
    const content = b64DecodeUnicode(fileData.content);
    return {
      jsonData: JSON.parse(content),
      sha: fileData.sha
    };
  }

  async function saveFile(path, jsonData, sha, commitMessage) {
    const encodedContent = b64EncodeUnicode(JSON.stringify(jsonData, null, 2));
    const response = await fetch(`https://api.github.com/repos/${gitUser}/${gitRepo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${gitToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: encodedContent,
        sha: sha
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error al escribir el archivo ${path} en GitHub.`);
    }

    const resData = await response.json();
    return resData.content.sha;
  }

  // --- Cargar datos en el Dashboard ---
  async function loadDashboardData() {
    newsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando información desde GitHub...</td></tr>';
    categoriesList.innerHTML = '<li class="list-empty">Cargando categorías...</li>';

    try {
      const [newsFile, categoriesFile] = await Promise.all([
        fetchFile('noticias.json'),
        fetchFile('categorias.json')
      ]);

      newsData = newsFile.jsonData.novedades || [];
      newsSha = newsFile.sha;

      categoriesData = categoriesFile.jsonData.categorias || [];
      categoriesSha = categoriesFile.sha;

      // Ordenar novedades por fecha desc (más recientes primero)
      newsData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      renderNewsTable();
      renderCategoriesList();
      renderCategorySelect();

    } catch (e) {
      console.error(e);
      showToast('Error de sincronización con GitHub.', true);
      newsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444;">Error al cargar novedades.</td></tr>';
      categoriesList.innerHTML = '<li class="list-empty" style="color: #ef4444;">Error al cargar categorías.</li>';
    }
  }

  // --- Renderizado de UI ---

  // Tabla de Novedades
  function renderNewsTable() {
    newsTableBody.innerHTML = '';
    if (newsData.length === 0) {
      newsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay novedades publicadas. ¡Creá la primera!</td></tr>';
      return;
    }

    newsData.forEach((item, index) => {
      const tr = document.createElement('tr');
      const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' };
      const formattedDate = new Date(item.fecha).toLocaleDateString('es-AR', dateOptions);

      tr.innerHTML = `
        <td class="td-title"><strong>${item.titulo}</strong></td>
        <td><span class="table-badge">${item.categoria || 'Novedad'}</span></td>
        <td>${formattedDate}</td>
        <td class="table-actions">
          <button class="action-btn edit-btn" data-index="${index}">Editar</button>
          <button class="action-btn delete-btn" data-index="${index}">Eliminar</button>
        </td>
      `;
      newsTableBody.appendChild(tr);
    });

    newsTableBody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        openNewsModal(index);
      });
    });

    newsTableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        deleteNewsItem(index);
      });
    });
  }

  // Lista de Categorías
  function renderCategoriesList() {
    categoriesList.innerHTML = '';
    if (categoriesData.length === 0) {
      categoriesList.innerHTML = '<li class="list-empty">No hay categorías de filtros definidas.</li>';
      return;
    }

    categoriesData.forEach((cat, index) => {
      const li = document.createElement('li');
      li.className = 'category-item';
      li.innerHTML = `
        <div class="category-display-view">
          <span class="category-name">${cat.nombre}</span>
          <div class="category-item-actions">
            <button class="cat-btn cat-edit-btn" data-index="${index}">Modificar</button>
            <button class="cat-btn cat-delete-btn" data-index="${index}">Eliminar</button>
          </div>
        </div>
        <div class="category-edit-view" style="display: none;">
          <input type="text" class="form-control cat-edit-input" value="${cat.nombre}">
          <button class="action-btn save-cat-btn" data-index="${index}">Guardar</button>
          <button class="action-btn cancel-cat-btn">Cancelar</button>
        </div>
      `;
      categoriesList.appendChild(li);
    });

    categoriesList.querySelectorAll('.cat-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = e.currentTarget.closest('.category-item');
        li.querySelector('.category-display-view').style.display = 'none';
        li.querySelector('.category-edit-view').style.display = 'flex';
        li.querySelector('.cat-edit-input').focus();
      });
    });

    categoriesList.querySelectorAll('.cancel-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = e.currentTarget.closest('.category-item');
        li.querySelector('.category-display-view').style.display = 'flex';
        li.querySelector('.category-edit-view').style.display = 'none';
      });
    });

    categoriesList.querySelectorAll('.save-cat-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        const li = e.currentTarget.closest('.category-item');
        const newName = li.querySelector('.cat-edit-input').value.trim();
        if (newName) {
          await editCategoryItem(index, newName);
        } else {
          showToast('El nombre de la categoría no puede estar vacío.', true);
        }
      });
    });

    categoriesList.querySelectorAll('.cat-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        deleteCategoryItem(index);
      });
    });
  }

  // Select de Categorías en el Formulario de Novedades
  function renderCategorySelect() {
    categorySelect.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';
    categoriesData.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.nombre;
      opt.textContent = cat.nombre;
      categorySelect.appendChild(opt);
    });
  }

  // --- Operaciones CRUD de Novedades ---

  function openNewsModal(index = null) {
    editingNewsIndex = index;
    if (index === null) {
      modalTitle.textContent = 'Nueva Novedad';
      newsForm.reset();
      document.getElementById('news-date').value = new Date().toISOString().substring(0, 10);
    } else {
      modalTitle.textContent = 'Editar Novedad';
      const item = newsData[index];
      document.getElementById('news-title').value = item.titulo;
      document.getElementById('news-date').value = item.fecha;
      document.getElementById('news-category').value = item.categoria;
      document.getElementById('news-summary').value = item.resumen;
      document.getElementById('news-content').value = item.contenido;
      document.getElementById('news-attach-name').value = item.adjunto_nombre || '';
      document.getElementById('news-attach-url').value = item.adjunto_url || '';
    }
    newsModal.classList.add('active');
  }

  function closeNewsModal() {
    newsModal.classList.remove('active');
    editingNewsIndex = null;
  }

  btnAddNews.addEventListener('click', () => openNewsModal(null));
  btnCancelNews.addEventListener('click', closeNewsModal);

  // Guardar Novedad (Creación o Edición)
  newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('news-title').value.trim();
    const date = document.getElementById('news-date').value;
    const category = document.getElementById('news-category').value;
    const summary = document.getElementById('news-summary').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const attachName = document.getElementById('news-attach-name').value.trim();
    const attachUrl = document.getElementById('news-attach-url').value.trim();

    if (!title || !date || !category || !summary || !content) {
      showToast('Por favor, complete todos los campos obligatorios.', true);
      return;
    }

    const payload = {
      titulo: title,
      fecha: date,
      categoria: category,
      resumen: summary,
      contenido: content,
      adjunto_nombre: attachName,
      adjunto_url: attachUrl
    };

    showToast('Subiendo cambios a GitHub...');
    closeNewsModal();

    try {
      const freshFile = await fetchFile('noticias.json');
      let currentNews = freshFile.jsonData.novedades || [];

      if (editingNewsIndex === null) {
        currentNews.push(payload);
        commitMsg = `Añadir novedad: "${title}"`;
      } else {
        currentNews.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        currentNews[editingNewsIndex] = payload;
        commitMsg = `Editar novedad: "${title}"`;
      }

      newsSha = await saveFile('noticias.json', { novedades: currentNews }, freshFile.sha, commitMsg);
      
      newsData = currentNews;
      renderNewsTable();
      showToast('¡Novedad publicada con éxito!');

    } catch (error) {
      console.error(error);
      showToast('Error al guardar en GitHub.', true);
    }
  });

  // Eliminar Novedad
  async function deleteNewsItem(index) {
    const item = newsData[index];
    if (!confirm(`¿Está seguro de que desea eliminar la novedad: "${item.titulo}"?`)) {
      return;
    }

    showToast('Eliminando novedad en GitHub...');

    try {
      const freshFile = await fetchFile('noticias.json');
      let currentNews = freshFile.jsonData.novedades || [];
      currentNews.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      currentNews.splice(index, 1);

      newsSha = await saveFile('noticias.json', { novedades: currentNews }, freshFile.sha, `Eliminar novedad: "${item.titulo}"`);
      
      newsData = currentNews;
      renderNewsTable();
      showToast('Novedad eliminada con éxito.');

    } catch (e) {
      console.error(e);
      showToast('Error al eliminar en GitHub.', true);
    }
  }

  // --- Operaciones CRUD de Categorías ---

  // Agregar Categoría
  addCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const catName = newCategoryInput.value.trim();

    if (!catName) return;

    const exists = categoriesData.some(cat => cat.nombre.toLowerCase() === catName.toLowerCase());
    if (exists) {
      showToast('Esta categoría ya existe.', true);
      return;
    }

    showToast('Guardando nueva categoría...');
    newCategoryInput.value = '';

    try {
      const freshFile = await fetchFile('categorias.json');
      let currentCats = freshFile.jsonData.categorias || [];
      currentCats.push({ nombre: catName });

      categoriesSha = await saveFile('categorias.json', { categorias: currentCats }, freshFile.sha, `Añadir categoría: "${catName}"`);

      categoriesData = currentCats;
      renderCategoriesList();
      renderCategorySelect();
      showToast('Categoría agregada con éxito.');

    } catch (e) {
      console.error(e);
      showToast('Error al guardar la categoría.', true);
    }
  });

  // Modificar Categoría
  async function editCategoryItem(index, newName) {
    const oldName = categoriesData[index].nombre;
    if (oldName === newName) {
      renderCategoriesList();
      return;
    }

    const exists = categoriesData.some((cat, i) => i !== index && cat.nombre.toLowerCase() === newName.toLowerCase());
    if (exists) {
      showToast('Ya existe otra categoría con este nombre.', true);
      return;
    }

    showToast('Modificando categoría...');

    try {
      const freshCatsFile = await fetchFile('categorias.json');
      let currentCats = freshCatsFile.jsonData.categorias || [];
      currentCats[index] = { nombre: newName };

      const freshNewsFile = await fetchFile('noticias.json');
      let currentNews = freshNewsFile.jsonData.novedades || [];
      let updatedNewsCount = 0;

      currentNews.forEach(item => {
        if (item.categoria === oldName) {
          item.categoria = newName;
          updatedNewsCount++;
        }
      });

      categoriesSha = await saveFile('categorias.json', { categorias: currentCats }, freshCatsFile.sha, `Modificar categoría de "${oldName}" a "${newName}"`);

      if (updatedNewsCount > 0) {
        showToast(`Actualizando ${updatedNewsCount} novedades asociadas...`);
        newsSha = await saveFile('noticias.json', { novedades: currentNews }, freshNewsFile.sha, `Actualizar categoría "${oldName}" a "${newName}" en novedades`);
        newsData = currentNews;
        renderNewsTable();
      }

      categoriesData = currentCats;
      renderCategoriesList();
      renderCategorySelect();
      showToast('Categoría modificada con éxito.');

    } catch (e) {
      console.error(e);
      showToast('Error al modificar la categoría.', true);
    }
  }

  // Eliminar Categoría
  async function deleteCategoryItem(index) {
    const catName = categoriesData[index].nombre;

    const inUse = newsData.some(item => item.categoria === catName);
    let msg = `¿Está seguro de que desea eliminar la categoría: "${catName}"?`;
    if (inUse) {
      msg = `ATENCIÓN: Hay novedades publicadas que usan la categoría "${catName}". Si la elimina, esas novedades quedarán sin categoría. ¿Desea continuar?`;
    }

    if (!confirm(msg)) return;

    showToast('Eliminando categoría...');

    try {
      const freshCatsFile = await fetchFile('categorias.json');
      let currentCats = freshCatsFile.jsonData.categorias || [];
      currentCats.splice(index, 1);

      const freshNewsFile = await fetchFile('noticias.json');
      let currentNews = freshNewsFile.jsonData.novedades || [];
      let updatedNewsCount = 0;

      currentNews.forEach(item => {
        if (item.categoria === catName) {
          item.categoria = '';
          updatedNewsCount++;
        }
      });

      categoriesSha = await saveFile('categorias.json', { categorias: currentCats }, freshCatsFile.sha, `Eliminar categoría: "${catName}"`);

      if (updatedNewsCount > 0) {
        showToast(`Removiendo categoría en ${updatedNewsCount} novedades...`);
        newsSha = await saveFile('noticias.json', { novedades: currentNews }, freshNewsFile.sha, `Remover categoría "${catName}" de novedades`);
        newsData = currentNews;
        renderNewsTable();
      }

      categoriesData = currentCats;
      renderCategoriesList();
      renderCategorySelect();
      showToast('Categoría eliminada.');

    } catch (e) {
      console.error(e);
      showToast('Error al eliminar la categoría.', true);
    }
  }

  // --- Lógica del Sistema de Pestañas (Tabs) ---
  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === `${tabId}-tab`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // --- Inicialización y Chequeo de Sesión ---
  const isLogged = sessionStorage.getItem('oga_admin_logged') === 'true';
  const savedPassword = sessionStorage.getItem('oga_admin_password') || '';

  if (isLogged && savedPassword) {
    // Intentar desencriptar y verificar sesión automáticamente al recargar
    gitUser = decrypt(ENC_USER, savedPassword);
    gitRepo = decrypt(ENC_REPO, savedPassword);
    gitToken = decrypt(ENC_PAT, savedPassword);

    if (gitToken && gitUser && gitRepo) {
      showDashboard();
    } else {
      hideDashboard();
    }
  } else {
    hideDashboard();
  }
});
