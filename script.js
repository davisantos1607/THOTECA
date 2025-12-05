/* ---------- UTILITÁRIOS DE SEGURANÇA ---------- */

// 🔐 chaves que serão armazenadas "protegidas" no localStorage
const SENSITIVE_KEYS = new Set(["user", "users"]);

// 🔐 sanitiza qualquer texto antes de injetar em innerHTML
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

// 🔐 criptografia simples para fins didáticos (NÃO usar em produção)
function encryptData(data) {
  try {
    return btoa(JSON.stringify(data));
  } catch (e) {
    return JSON.stringify(data);
  }
}

function decryptData(encryptedData) {
  try {
    // tenta decodificar base64, senão faz parse direto
    return JSON.parse(atob(encryptedData));
  } catch (e) {
    try {
      return JSON.parse(encryptedData);
    } catch (err) {
      return null;
    }
  }
}

// 🔐 hash de senha simples (apenas para estudo!)
function hashPassword(password) {
  return btoa(password + "|thoteca_salt");
}

// 🔐 validação de entradas
function validateInput(input, type) {
  const patterns = {
    username: /^[a-zA-Z0-9_]{3,20}$/,
    author: /^[a-zA-ZÀ-ÿ0-9\s\-_]{3,40}$/,
    title: /^[a-zA-ZÀ-ÿ0-9\s\-_]{1,100}$/,
    // para conteúdo de capítulo, só limite de tamanho (validado em outro lugar)
  };

  if (!patterns[type]) return true; // tipo não mapeado → não valida
  return patterns[type].test(input);
}

// 🔐 controle simples de tentativas de login
function isLoginBlocked() {
  const attempts = Number(sessionStorage.getItem("loginAttempts") || "0");
  return attempts >= 5;
}

function registerFailedLoginAttempt() {
  const attempts = Number(sessionStorage.getItem("loginAttempts") || "0");
  sessionStorage.setItem("loginAttempts", String(attempts + 1));
}

function resetLoginAttempts() {
  sessionStorage.setItem("loginAttempts", "0");
}

/* ---------- ARMAZENAMENTO LOCAL ---------- */
const DB = {
  load: (k, def) => {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return def;

      if (SENSITIVE_KEYS.has(k)) {
        const decrypted = decryptData(raw);
        return decrypted ?? def;
      }

      return JSON.parse(raw);
    } catch (e) {
      // 🔐 log genérico, sem detalhes internos
      console.error("Erro ao carregar dados. Tente novamente.");
      return def;
    }
  },
  save: (k, v) => {
    try {
      if (SENSITIVE_KEYS.has(k)) {
        localStorage.setItem(k, encryptData(v));
      } else {
        localStorage.setItem(k, JSON.stringify(v));
      }
    } catch (e) {
      // 🔐 log genérico, sem stack
      console.error("Erro ao salvar dados.");
    }
  }
};

/* ---------- LISTA DE GÊNEROS CENTRALIZADA ---------- */
const GENRES = [
  "Ficção Científica",
  "Fantasia",
  "Mistério",
  "Romance",
  "Tecnologia",
  "Autoajuda",
  "História",
  "Poesia"
];

/* ---------- ROTAS ---------- */
const routes = {
  "/": renderHome,
  "/genres": renderGenres,
  "/releases": renderReleases,
  "/write": renderBookEditor,
  "/send": renderSend,
  "/login": renderLogin,
  "/profile": renderProfile,
  "/saved": renderSaved,
  "/history": renderHistory
};

function router() {
  const path = location.hash.replace("#", "") || "/";
  const view = routes[path] || renderHome;
  view();
  
  document.querySelectorAll("[data-route]").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + path);
  });
}

/* ---------- LÓGICA DO TEMA ---------- */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  const body = document.body;
  const toggleButton = document.getElementById('theme-toggle');

  if (theme === 'dark') {
    body.classList.add('dark-mode');
    toggleButton.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    toggleButton.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  }
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

/* ---------- CONFIGURAÇÕES DE INTERFACE ---------- */
function setupNavigation() {
  document.querySelectorAll("[data-route]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      location.hash = a.getAttribute("href");
    });
  });

  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const nav = btn.getAttribute("data-nav");
      location.hash = "#/" + nav;
    });
  });

  document.getElementById("open-login").addEventListener("click", () => {
    location.hash = "#/login";
  });
  
  document.getElementById("logo-home").addEventListener("click", () => {
    location.hash = "#/";
  });

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

function updateUserUI() {
  const user = DB.load("user", { name: "Visitante", logged: false });
  const safeName = user.name ? String(user.name) : "Visitante";
  const avatar = safeName.substring(0, 2).toUpperCase();
  
  document.getElementById("sidebar-avatar").textContent = avatar;
  document.getElementById("sidebar-name").textContent = safeName;
  document.getElementById("sidebar-sub").textContent = user.logged ? "Conta logada" : "Conta não logada";
  
  const loginBtn = document.querySelector("[data-nav='login']");
  if (loginBtn) {
    loginBtn.style.display = user.logged ? "none" : "block";
  }
}

/* ---------- GESTÃO DE USUÁRIOS (AUTENTICAÇÃO) ---------- */

function loadUsers() {
  return DB.load("users", {});
}

function saveUsers(users) {
  DB.save("users", users);
}

/* ---------- RENDERIZAÇÕES ---------- */
function renderHome() {
  const user = DB.load("user", { name: "Visitante" });
  const safeName = sanitizeHTML(user.name || "Visitante");

  document.getElementById("app").innerHTML = `
    <div class="reader-full">
      <h2>Bem-vindo à Thoteca</h2>
      <p style="font-size: 18px; color: var(--text-muted);">
        Olá, ${safeName}! Explore, leia e compartilhe conhecimento. Comece escolhendo uma das opções abaixo.
      </p>
      <div class="grid" style="margin-top: 30px;">
        <div class="card" data-go="#/genres">
          <div class="cover">📚</div>
          <div class="title">Explorar Gêneros</div>
          <p class="meta">Navegue por categorias</p>
        </div>
        <div class="card" data-go="#/write">
          <div class="cover">✍️</div>
          <div class="title">Escrever Livro</div>
          <p class="meta">Crie seu próprio livro</p>
        </div>
        <div class="card" data-go="#/send">
          <div class="cover">➕</div>
          <div class="title">Enviar Arquivo</div>
          <p class="meta">Compartilhe PDFs/imagens</p>
        </div>
        <div class="card" data-go="#/saved">
          <div class="cover">⭐</div>
          <div class="title">Livros Salvos</div>
          <p class="meta">Acesse sua biblioteca</p>
        </div>
      </div>
    </div>`;

  // 🔐 sem inline JS: listeners adicionados aqui
  document.querySelectorAll(".card[data-go]").forEach(card => {
    card.addEventListener("click", () => {
      const target = card.getAttribute("data-go");
      if (target) location.hash = target;
    });
  });
}

function renderGenres() {
  let html = "<div class='reader-full'><h2>Gêneros Literários</h2><div class='grid'>";
  
  GENRES.forEach(genre => {
    const safeGenre = sanitizeHTML(genre);
    html += `
      <div class="card">
        <div class="title">${safeGenre}</div>
        <p class="meta">0 livros</p>
      </div>`;
  });
  
  html += "</div></div>";
  document.getElementById("app").innerHTML = html;
}

function renderReleases() {
  document.getElementById("app").innerHTML = `
    <div class="reader-full"><h2>Lançamentos</h2><p>Nenhum lançamento disponível no momento.</p></div>`;
}

function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div class="reader-full" style="max-width: 400px; margin: 0 auto;">
      <h2>Acessar sua Conta</h2>
      <form id="login-form" autocomplete="off">
        <label>Nome de usuário</label>
        <input id="username" required minlength="3" maxlength="20" placeholder="Seu nome de leitor">
        <label>Senha *</label>
        <input type="password" id="password" required minlength="6" placeholder="••••••••">
        <small class="muted">Se este for seu primeiro acesso, a conta será criada com essa senha.</small>
        <button class="btn" type="submit" style="background: var(--accent); color: white; border:none; margin-top: 15px; padding: 12px;">Entrar</button>
      </form>
    </div>`;
  
  document.getElementById("login-form").onsubmit = e => {
    e.preventDefault();

    if (isLoginBlocked()) {
      alert("Muitas tentativas de login. Tente novamente mais tarde.");
      return;
    }

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!validateInput(username, "username")) {
      alert("⚠️ Nome de usuário inválido. Use apenas letras, números e _ (3 a 20 caracteres).");
      return;
    }

    if (password.length < 6) {
      alert("⚠️ A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const users = loadUsers();
    const pwdHash = hashPassword(password);
    let userRecord = users[username];

    if (!userRecord) {
      // 🔐 Criação da conta (registro) com hash de senha
      userRecord = {
        passwordHash: pwdHash,
        joined: new Date().toISOString()
      };
      users[username] = userRecord;
      saveUsers(users);
    } else {
      // 🔐 Verificação da senha
      if (userRecord.passwordHash !== pwdHash) {
        registerFailedLoginAttempt();
        alert("❌ Usuário ou senha inválidos.");
        return;
      }
    }

    resetLoginAttempts();

    DB.save("user", {
      name: username,
      logged: true,
      joined: userRecord.joined
    });

    updateUserUI();
    alert("✅ Login efetuado com sucesso!");
    location.hash = "#/";
  };
}

function renderProfile() {
  const user = DB.load("user", { name: "Visitante", logged: false });
  const books = DB.load("books", []);
  const safeName = sanitizeHTML(user.name || "Visitante");

  document.getElementById("app").innerHTML = `
    <div class="reader-full" style="max-width: 600px; margin: 0 auto;">
      <h2>Perfil de Leitor</h2>
      <div style="padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid var(--border-light);">
        <p><strong>Nome:</strong> ${safeName}</p>
        <p><strong>Status:</strong> ${user.logged ? "✅ Logado" : "❌ Não logado"}</p>
        <p><strong>Livros enviados:</strong> ${books.length}</p>
        <p><strong>Leitor desde:</strong> ${user.joined ? new Date(user.joined).toLocaleDateString("pt-BR") : "N/A"}</p>
        ${user.logged ? `<button class="btn" id="logout-btn" style="margin-top: 15px; background: #95a5a6; color: white; border: none;">Sair da Conta</button>` : ""}
      </div>
    </div>`;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

function logout() {
  DB.save("user", { name: "Visitante", logged: false });
  updateUserUI();
  alert("👋 Você foi desconectado.");
  location.hash = "#/";
}

function renderSaved() {
  document.getElementById("app").innerHTML = `<div class="reader-full"><h2>Livros Salvos</h2><p style="color: var(--text-muted)">Em breve, seus livros salvos aparecerão aqui.</p></div>`;
}

function renderHistory() {
  document.getElementById("app").innerHTML = `<div class="reader-full"><h2>Histórico de Leitura</h2><p style="color: var(--text-muted)">Seu histórico de leituras recentes será exibido aqui.</p></div>`;
}

function renderSend() {
  const user = DB.load("user", { logged: false });
  if (!user.logged) {
    document.getElementById("app").innerHTML = `
      <div class="reader-full" style="max-width: 500px; margin: 0 auto; text-align: center;">
        <h2>⚠️ Acesso Restrito</h2>
        <p>Você precisa estar logado para enviar livros.</p>
        <button class="btn" id="go-login-btn" style="background: var(--accent); color: white; margin-top: 20px; padding: 12px; font-weight: 600; border:none;">
          Fazer Login
        </button>
      </div>`;

    const goLogin = document.getElementById("go-login-btn");
    if (goLogin) {
      goLogin.addEventListener("click", () => {
        location.hash = "#/login";
      });
    }
    return;
  }

  let genreOptions = '<option value="">Selecione um gênero</option>';
  GENRES.forEach(genre => {
    const safeGenre = sanitizeHTML(genre);
    genreOptions += `<option value="${safeGenre}">${safeGenre}</option>`;
  });

  document.getElementById("app").innerHTML = `
    <div class="reader-full" style="max-width: 600px; margin: 0 auto;">
      <h2>Enviar Livro</h2>
      <form id="uploadForm">
        <label>Título *</label>
        <input id="bookTitle" placeholder="Título do livro" required maxlength="100">
        
        <label>Autor *</label>
        <input id="bookAuthor" placeholder="Autor do livro" required maxlength="40">
        
        <label>Gênero</label>
        <select id="bookGenre">
          ${genreOptions}
        </select>
        
        <label>Arquivo (PDF ou Imagem)</label>
        <input type="file" id="bookFile" accept=".pdf,image/jpeg,image/png" required>
        
        <button class="btn" type="submit" style="background: var(--accent); color: white; font-weight: 600; margin-top: 15px; padding: 12px; border:none;">
          📤 Enviar Livro
        </button>
      </form>
      <div id="upload-status" style="margin-top: 20px;"></div>
    </div>`;
  
  document.getElementById("uploadForm").onsubmit = e => { 
    e.preventDefault(); 
    handleFileUpload(); 
  };
}

// 🔐 validação de arquivo (tipo + tamanho)
function validateFile(file) {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido. Use PDF, JPG ou PNG.");
  }

  if (file.size > maxSize) {
    throw new Error("Arquivo muito grande. Tamanho máximo: 10MB.");
  }

  return true;
}

function handleFileUpload() {
  const title = document.getElementById("bookTitle").value.trim();
  const author = document.getElementById("bookAuthor").value.trim();
  const genre = document.getElementById("bookGenre").value;
  const fileInput = document.getElementById("bookFile");
  const file = fileInput.files[0];
  const statusEl = document.getElementById("upload-status");

  statusEl.textContent = "";

  if (!validateInput(title, "title")) {
    alert("⚠️ Título inválido. Use apenas letras, números, espaços, hífen e sublinhado (até 100 caracteres).");
    return;
  }

  if (!validateInput(author, "author")) {
    alert("⚠️ Autor inválido. Use apenas letras, números, espaços, hífen e sublinhado (3 a 40 caracteres).");
    return;
  }

  if (!file) {
    alert("Selecione um arquivo.");
    return;
  }

  try {
    validateFile(file);
  } catch (err) {
    alert(err.message);
    fileInput.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("bookFile", file);
  formData.append("title", title);
  formData.append("author", author);
  formData.append("genre", genre || "Geral");

  // 🔐 upload real para o backend seguro (server.js)
  fetch("/api/upload", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        throw new Error(data.error || "Falha ao enviar o arquivo.");
      }

      statusEl.textContent = "📤 Livro enviado com sucesso!";
      fileInput.value = "";

      // guarda referência simples no localStorage (não armazena o arquivo em si)
      const books = DB.load("books", []);
      books.push({
        id: data.book.id,
        title: data.book.title,
        author: data.book.author,
        genre: data.book.genre,
        type: "upload",
        uploadedAt: data.book.uploadedAt
      });
      DB.save("books", books);
    })
    .catch(err => {
      console.error("Erro no upload seguro:", err);
      alert("Erro ao enviar arquivo. Tente novamente.");
    });
}

/* ---------- EDITOR DE LIVROS ---------- */
let currentEditingChapterIndex = -1;

function renderBookEditor() {
  const user = DB.load("user", { logged: false });
  
  if (!user.logged) {
    document.getElementById("app").innerHTML = `
      <div class="reader-full" style="max-width: 500px; margin: 0 auto; text-align: center;">
        <h2>⚠️ Acesso Restrito</h2>
        <p>Você precisa estar logado para escrever livros.</p>
        <button class="btn" id="go-login-editor" style="background: var(--accent); color: white; margin-top: 20px; padding: 12px; font-weight: 600; border:none;">
          Fazer Login
        </button>
      </div>`;
    
    const goLoginEditor = document.getElementById("go-login-editor");
    if (goLoginEditor) {
      goLoginEditor.addEventListener("click", () => {
        location.hash = "#/login";
      });
    }
    return;
  }

  const currentBook = DB.load("currentBook", {
    title: "",
    author: user.name,
    genre: "",
    chapters: []
  });

  const safeTitle = sanitizeHTML(currentBook.title || "");
  const safeGenre = sanitizeHTML(currentBook.genre || "");

  document.getElementById("app").innerHTML = `
    <div class="reader-full book-editor">
      <h2>✍️ Escrever Meu Livro</h2>
      
      <div style="margin-bottom: 20px;">
        <label>Título do Livro</label>
        <input type="text" id="bookTitleEditor" class="chapter-input" 
               placeholder="Ex: Aventuras no Espaço" 
               value="${safeTitle}">
        
        <label>Gênero</label>
        <select id="bookGenreEditor" class="chapter-input">
          <option value="">Selecione um gênero</option>
          ${GENRES.map(g => {
            const safeG = sanitizeHTML(g);
            const selected = currentBook.genre === g ? "selected" : "";
            return `<option value="${safeG}" ${selected}>${safeG}</option>`;
          }).join("")}
        </select>
      </div>

      <hr>

      <h3>Capítulos (${currentBook.chapters.length})</h3>
      
      <div class="chapter-list" id="chapterList"></div>
      
      <button class="btn" id="addChapterBtn" style="background: var(--accent); color: white; border: none; padding: 10px 16px; margin-bottom: 20px;">
        ➕ Adicionar Capítulo
      </button>

      <div id="chapterEditorArea" style="display: none;">
        <hr>
        <h3 id="editingChapterTitle">Novo Capítulo</h3>
        
        <input type="text" id="chapterTitleInput" class="chapter-input" placeholder="Título do Capítulo">
        
        <textarea id="chapterContentInput" class="chapter-editor" placeholder="Escreva o conteúdo do capítulo aqui..."></textarea>
        
        <div class="word-count" id="wordCount">0 palavras</div>
        
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button class="btn" id="saveChapterBtn" style="background: #27ae60; color: white; border: none;">
            💾 Salvar Capítulo
          </button>
          <button class="btn" id="cancelChapterBtn">
            ❌ Cancelar
          </button>
        </div>
      </div>

      <hr style="margin-top: 30px;">

      <h3>Ações do Livro</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn" id="previewBookBtn" style="background: #3498db; color: white; border: none;">
          👁️ Visualizar Livro
        </button>
        <button class="btn" id="saveDraftBtn">
          💾 Salvar Rascunho
        </button>
        <button class="btn" id="exportTxtBtn">
          📄 Exportar TXT
        </button>
        <button class="btn" id="publishBookBtn" style="background: var(--accent); color: white; border: none;">
          📤 Publicar na Thoteca
        </button>
      </div>
    </div>`;

  renderChapterList();
  setupEditorListeners();
}

function setupEditorListeners() {
  const bookTitleEditor = document.getElementById("bookTitleEditor");
  const bookGenreEditor = document.getElementById("bookGenreEditor");

  if (bookTitleEditor) {
    bookTitleEditor.addEventListener("input", (e) => {
      let book = DB.load("currentBook", {});
      book.title = e.target.value;
      DB.save("currentBook", book);
    });
  }

  if (bookGenreEditor) {
    bookGenreEditor.addEventListener("change", (e) => {
      let book = DB.load("currentBook", {});
      book.genre = e.target.value;
      DB.save("currentBook", book);
    });
  }

  const contentInput = document.getElementById("chapterContentInput");
  if (contentInput) {
    contentInput.addEventListener("input", (e) => {
      const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      document.getElementById("wordCount").textContent = `${words} palavras`;
    });
  }

  const addChapterBtn = document.getElementById("addChapterBtn");
  const saveChapterBtn = document.getElementById("saveChapterBtn");
  const cancelChapterBtn = document.getElementById("cancelChapterBtn");
  const previewBookBtn = document.getElementById("previewBookBtn");
  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const exportTxtBtn = document.getElementById("exportTxtBtn");
  const publishBookBtn = document.getElementById("publishBookBtn");

  if (addChapterBtn) addChapterBtn.addEventListener("click", addNewChapter);
  if (saveChapterBtn) saveChapterBtn.addEventListener("click", saveCurrentChapter);
  if (cancelChapterBtn) cancelChapterBtn.addEventListener("click", cancelEditChapter);
  if (previewBookBtn) previewBookBtn.addEventListener("click", previewBook);
  if (saveDraftBtn) saveDraftBtn.addEventListener("click", saveBookAsDraft);
  if (exportTxtBtn) exportTxtBtn.addEventListener("click", exportBookAsTXT);
  if (publishBookBtn) publishBookBtn.addEventListener("click", publishBook);
}

function renderChapterList() {
  const book = DB.load("currentBook", { chapters: [] });
  const listEl = document.getElementById("chapterList");
  
  if (!listEl) return;

  if (book.chapters.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-muted);">Nenhum capítulo criado ainda.</p>';
    return;
  }

  listEl.innerHTML = book.chapters.map((ch, idx) => {
    const safeTitle = sanitizeHTML(ch.title || `Capítulo ${idx + 1}`);
    const snippet = (ch.content || "").substring(0, 80);
    const safeSnippet = sanitizeHTML(snippet) + ((ch.content || "").length > 80 ? "..." : "");

    return `
      <div class="chapter-item" data-ch-index="${idx}">
        <div>
          <strong>${safeTitle}</strong>
          <div style="font-size: 13px; color: var(--text-muted);">
            ${safeSnippet}
          </div>
        </div>
        <button class="btn delete-chapter-btn" data-ch-index="${idx}" style="background: #e74c3c; color: white; border: none; padding: 6px 10px;">
          🗑️
        </button>
      </div>
    `;
  }).join("");

  // eventos sem inline JS
  listEl.querySelectorAll(".chapter-item").forEach(item => {
    const idx = Number(item.getAttribute("data-ch-index"));
    item.addEventListener("click", () => editChapter(idx));
  });

  listEl.querySelectorAll(".delete-chapter-btn").forEach(btn => {
    const idx = Number(btn.getAttribute("data-ch-index"));
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      deleteChapter(idx);
    });
  });
}

function addNewChapter() {
  currentEditingChapterIndex = -1;
  document.getElementById("editingChapterTitle").textContent = "Novo Capítulo";
  document.getElementById("chapterTitleInput").value = "";
  document.getElementById("chapterContentInput").value = "";
  document.getElementById("wordCount").textContent = "0 palavras";
  document.getElementById("chapterEditorArea").style.display = "block";
  document.getElementById("chapterContentInput").focus();
}

function editChapter(index) {
  const book = DB.load("currentBook", { chapters: [] });
  const chapter = book.chapters[index];
  
  currentEditingChapterIndex = index;
  document.getElementById("editingChapterTitle").textContent = `Editar: ${chapter.title || 'Capítulo ' + (index + 1)}`;
  document.getElementById("chapterTitleInput").value = chapter.title;
  document.getElementById("chapterContentInput").value = chapter.content;
  
  const words = chapter.content.trim().split(/\s+/).filter(w => w.length > 0).length;
  document.getElementById("wordCount").textContent = `${words} palavras`;
  
  document.getElementById("chapterEditorArea").style.display = "block";
  document.getElementById("chapterContentInput").focus();
}

function saveCurrentChapter() {
  const title = document.getElementById("chapterTitleInput").value.trim();
  const content = document.getElementById("chapterContentInput").value.trim();
  
  if (!content) {
    alert("⚠️ O conteúdo do capítulo não pode estar vazio!");
    return;
  }

  if (content.length > 10000) {
    alert("⚠️ O capítulo está muito longo. Limite de 10.000 caracteres.");
    return;
  }

  const book = DB.load("currentBook", { chapters: [] });
  
  const chapter = {
    title: title || `Capítulo ${book.chapters.length + 1}`,
    content: content,
    createdAt: new Date().toISOString()
  };

  if (currentEditingChapterIndex >= 0) {
    book.chapters[currentEditingChapterIndex] = chapter;
  } else {
    book.chapters.push(chapter);
  }

  DB.save("currentBook", book);
  
  document.getElementById("chapterEditorArea").style.display = "none";
  renderChapterList();
  alert("✅ Capítulo salvo com sucesso!");
}

function cancelEditChapter() {
  document.getElementById("chapterEditorArea").style.display = "none";
}

function deleteChapter(index) {
  if (!confirm("Tem certeza que deseja deletar este capítulo?")) return;
  
  const book = DB.load("currentBook", { chapters: [] });
  book.chapters.splice(index, 1);
  DB.save("currentBook", book);
  renderChapterList();
}

function saveBookAsDraft() {
  const book = DB.load("currentBook", {});
  if (!book.title) {
    alert("⚠️ Dê um título ao seu livro antes de salvar!");
    return;
  }
  alert("💾 Rascunho salvo automaticamente no navegador!");
}

function previewBook() {
  const book = DB.load("currentBook", { chapters: [] });
  
  if (book.chapters.length === 0) {
    alert("⚠️ Adicione pelo menos um capítulo para visualizar!");
    return;
  }

  const safeTitle = sanitizeHTML(book.title || "Sem Título");
  const safeAuthor = sanitizeHTML(book.author || "Anônimo");
  const safeGenre = sanitizeHTML(book.genre || "Sem Gênero");

  let preview = `
    <div class="reader-full">
      <div class="book-preview">
        <h1 style="text-align: center; margin-bottom: 10px;">${safeTitle}</h1>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px;">
          por ${safeAuthor} • ${safeGenre}
        </p>
        <hr style="margin: 30px 0;">
  `;

  book.chapters.forEach((ch, idx) => {
    const safeChTitle = sanitizeHTML(ch.title || `Capítulo ${idx + 1}`);
    const safeContent = sanitizeHTML(ch.content || "");
    preview += `
      <h2 style="margin-top: 40px;">${safeChTitle}</h2>
      <div style="white-space: pre-wrap;">${safeContent}</div>
    `;
  });

  preview += `
      </div>
      <button class="btn" id="backToEditorBtn" style="margin-top: 20px;">
        ← Voltar ao Editor
      </button>
    </div>`;

  document.getElementById("app").innerHTML = preview;

  const backBtn = document.getElementById("backToEditorBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      location.hash = "#/write";
    });
  }
}

function exportBookAsTXT() {
  const book = DB.load("currentBook", { chapters: [] });
  
  if (book.chapters.length === 0) {
    alert("⚠️ Não há conteúdo para exportar!");
    return;
  }

  let text = `${book.title || 'Sem Título'}\n`;
  text += `Por ${book.author || 'Anônimo'}\n`;
  text += `Gênero: ${book.genre || 'Não especificado'}\n\n`;
  text += "=".repeat(50) + "\n\n";

  book.chapters.forEach((ch, idx) => {
    text += `\n\n${ch.title || 'Capítulo ' + (idx + 1)}\n\n`;
    text += ch.content + "\n";
  });

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(book.title || 'meu-livro').replace(/[^\w\-]+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function publishBook() {
  const book = DB.load("currentBook", { chapters: [] });
  
  if (!book.title || book.chapters.length === 0) {
    alert("⚠️ Preencha o título e adicione pelo menos um capítulo!");
    return;
  }

  let books = DB.load("books", []);
  books.push({
    id: Date.now(),
    title: book.title,
    author: book.author,
    genre: book.genre,
    chapters: book.chapters.length,
    type: "escrito",
    uploadedAt: new Date().toISOString()
  });
  DB.save("books", books);

  DB.save("currentBook", { title: "", author: "", genre: "", chapters: [] });

  alert("🎉 Livro publicado com sucesso na Thoteca!");
  location.hash = "#/";
}

/* ---------- pdf.js WORKER (sem script inline) ---------- */
function setupPDFWorker() {
  if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  }
}

/* ---------- INICIALIZAÇÃO FINAL ---------- */
window.addEventListener("hashchange", router);
window.addEventListener("load", () => {
  loadTheme();
  setupNavigation();
  updateUserUI();
  setupPDFWorker();
  router();
});
