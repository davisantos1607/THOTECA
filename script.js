/* ---------- ARMAZENAMENTO LOCAL ---------- */
const DB = {
  load: (k, def) => {
    try {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(def));
    } catch (e) {
      console.error("Erro ao carregar", k, e);
      return def;
    }
  },
  save: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      console.error("Erro ao salvar", k, e);
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
  const avatar = user.name.substring(0, 2).toUpperCase();
  
  document.getElementById("sidebar-avatar").textContent = avatar;
  document.getElementById("sidebar-name").textContent = user.name;
  document.getElementById("sidebar-sub").textContent = user.logged ? "Conta logada" : "Conta não logada";
  
  const loginBtn = document.querySelector("[data-nav='login']");
  if (user.logged) {
    loginBtn.style.display = "none";
  } else {
    loginBtn.style.display = "block";
  }
}

/* ---------- RENDERIZAÇÕES ---------- */
function renderHome() {
  const user = DB.load("user", { name: "Visitante" });
  document.getElementById("app").innerHTML = `
    <div class="reader-full">
      <h2>Bem-vindo à Thoteca</h2>
      <p style="font-size: 18px; color: var(--text-muted);">Olá, ${user.name}! Explore, leia e compartilhe conhecimento. Comece escolhendo uma das opções abaixo.</p>
      <div class="grid" style="margin-top: 30px;">
        <div class="card" onclick="location.hash='#/genres'">
          <div class="cover">📚</div>
          <div class="title">Explorar Gêneros</div>
          <p class="meta">Navegue por categorias</p>
        </div>
        <div class="card" onclick="location.hash='#/write'">
          <div class="cover">✍️</div>
          <div class="title">Escrever Livro</div>
          <p class="meta">Crie seu próprio livro</p>
        </div>
        <div class="card" onclick="location.hash='#/send'">
          <div class="cover">➕</div>
          <div class="title">Enviar Arquivo</div>
          <p class="meta">Compartilhe PDFs/imagens</p>
        </div>
        <div class="card" onclick="location.hash='#/saved'">
          <div class="cover">⭐</div>
          <div class="title">Livros Salvos</div>
          <p class="meta">Acesse sua biblioteca</p>
        </div>
      </div>
    </div>`;
}

function renderGenres() {
  let html = "<div class='reader-full'><h2>Gêneros Literários</h2><div class='grid'>";
  
  GENRES.forEach(genre => {
    html += `
      <div class="card">
        <div class="title">${genre}</div>
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
      <form id="login-form">
        <label>Nome de usuário</label>
        <input id="username" required placeholder="Seu nome de leitor">
        <label>Senha (opcional)</label>
        <input type="password" id="password" placeholder="••••••••">
        <button class="btn" type="submit" style="background: var(--accent); color: white; border:none; margin-top: 15px; padding: 12px;">Entrar</button>
      </form>
    </div>`;
  
  document.getElementById("login-form").onsubmit = e => {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    if (user.length < 3) {
      alert("⚠️ Nome de usuário deve ter pelo menos 3 caracteres");
      return;
    }
    DB.save("user", { name: user, logged: true, joined: new Date().toISOString() });
    updateUserUI();
    alert("✅ Login efetuado com sucesso!");
    location.hash = "#/";
  };
}

function renderProfile() {
  const user = DB.load("user", { name: "Visitante", logged: false });
  const books = DB.load("books", []);
  document.getElementById("app").innerHTML = `
    <div class="reader-full" style="max-width: 600px; margin: 0 auto;">
      <h2>Perfil de Leitor</h2>
      <div style="padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid var(--border-light);">
        <p><strong>Nome:</strong> ${user.name}</p>
        <p><strong>Status:</strong> ${user.logged ? "✅ Logado" : "❌ Não logado"}</p>
        <p><strong>Livros enviados:</strong> ${books.length}</p>
        <p><strong>Leitor desde:</strong> ${user.joined ? new Date(user.joined).toLocaleDateString("pt-BR") : "N/A"}</p>
        ${user.logged ? `<button class="btn" onclick="logout()" style="margin-top: 15px; background: #95a5a6; color: white; border: none;">Sair da Conta</button>` : ""}
      </div>
    </div>`;
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
        <button class="btn" onclick="location.hash='#/login'" style="background: var(--accent); color: white; margin-top: 20px; padding: 12px; font-weight: 600; border:none;">
          Fazer Login
        </button>
      </div>`;
    return;
  }

  let genreOptions = '<option value="">Selecione um gênero</option>';
  GENRES.forEach(genre => {
    genreOptions += `<option value="${genre}">${genre}</option>`;
  });

  document.getElementById("app").innerHTML = `
    <div class="reader-full" style="max-width: 600px; margin: 0 auto;">
      <h2>Enviar Livro</h2>
      <form id="uploadForm">
        <label>Título *</label>
        <input id="bookTitle" placeholder="Título do livro">
        
        <label>Autor *</label>
        <input id="bookAuthor" placeholder="Autor do livro">
        
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

function handleFileUpload() {
  const file = document.getElementById("bookFile").files[0];
  if (!file) { alert("Selecione um arquivo"); return; }
  alert("Simulação: Arquivo " + file.name + " enviado!");
  location.hash = '#/';
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
        <button class="btn" onclick="location.hash='#/login'" style="background: var(--accent); color: white; margin-top: 20px; padding: 12px; font-weight: 600; border:none;">
          Fazer Login
        </button>
      </div>`;
    return;
  }

  const currentBook = DB.load("currentBook", {
    title: "",
    author: user.name,
    genre: "",
    chapters: []
  });

  document.getElementById("app").innerHTML = `
    <div class="reader-full book-editor">
      <h2>✍️ Escrever Meu Livro</h2>
      
      <div style="margin-bottom: 20px;">
        <label>Título do Livro</label>
        <input type="text" id="bookTitleEditor" class="chapter-input" 
               placeholder="Ex: Aventuras no Espaço" 
               value="${currentBook.title}">
        
        <label>Gênero</label>
        <select id="bookGenreEditor" class="chapter-input">
          <option value="">Selecione um gênero</option>
          ${GENRES.map(g => `<option value="${g}" ${currentBook.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>

      <hr>

      <h3>Capítulos (${currentBook.chapters.length})</h3>
      
      <div class="chapter-list" id="chapterList"></div>
      
      <button class="btn" onclick="addNewChapter()" style="background: var(--accent); color: white; border: none; padding: 10px 16px; margin-bottom: 20px;">
        ➕ Adicionar Capítulo
      </button>

      <div id="chapterEditorArea" style="display: none;">
        <hr>
        <h3 id="editingChapterTitle">Novo Capítulo</h3>
        
        <input type="text" id="chapterTitleInput" class="chapter-input" placeholder="Título do Capítulo">
        
        <textarea id="chapterContentInput" class="chapter-editor" placeholder="Escreva o conteúdo do capítulo aqui..."></textarea>
        
        <div class="word-count" id="wordCount">0 palavras</div>
        
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button class="btn" onclick="saveCurrentChapter()" style="background: #27ae60; color: white; border: none;">
            💾 Salvar Capítulo
          </button>
          <button class="btn" onclick="cancelEditChapter()">
            ❌ Cancelar
          </button>
        </div>
      </div>

      <hr style="margin-top: 30px;">

      <h3>Ações do Livro</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn" onclick="previewBook()" style="background: #3498db; color: white; border: none;">
          👁️ Visualizar Livro
        </button>
        <button class="btn" onclick="saveBookAsDraft()">
          💾 Salvar Rascunho
        </button>
        <button class="btn" onclick="exportBookAsTXT()">
          📄 Exportar TXT
        </button>
        <button class="btn" onclick="publishBook()" style="background: var(--accent); color: white; border: none;">
          📤 Publicar na Thoteca
        </button>
      </div>
    </div>`;

  renderChapterList();
  setupEditorListeners();
}

function setupEditorListeners() {
  document.getElementById("bookTitleEditor").addEventListener("input", (e) => {
    let book = DB.load("currentBook", {});
    book.title = e.target.value;
    DB.save("currentBook", book);
  });

  document.getElementById("bookGenreEditor").addEventListener("change", (e) => {
    let book = DB.load("currentBook", {});
    book.genre = e.target.value;
    DB.save("currentBook", book);
  });

  const contentInput = document.getElementById("chapterContentInput");
  if (contentInput) {
    contentInput.addEventListener("input", (e) => {
      const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      document.getElementById("wordCount").textContent = `${words} palavras`;
    });
  }
}

function renderChapterList() {
  const book = DB.load("currentBook", { chapters: [] });
  const listEl = document.getElementById("chapterList");
  
  if (book.chapters.length === 0) {
    listEl.innerHTML = '<p style="color: var(--text-muted);">Nenhum capítulo criado ainda.</p>';
    return;
  }

  listEl.innerHTML = book.chapters.map((ch, idx) => `
    <div class="chapter-item" onclick="editChapter(${idx})">
      <div>
        <strong>${ch.title || 'Capítulo ' + (idx + 1)}</strong>
        <div style="font-size: 13px; color: var(--text-muted);">
          ${ch.content.substring(0, 80)}${ch.content.length > 80 ? '...' : ''}
        </div>
      </div>
      <button class="btn" onclick="event.stopPropagation(); deleteChapter(${idx})" style="background: #e74c3c; color: white; border: none; padding: 6px 10px;">
        🗑️
      </button>
    </div>
  `).join('');
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

  let preview = `
    <div class="reader-full">
      <div class="book-preview">
        <h1 style="text-align: center; margin-bottom: 10px;">${book.title || 'Sem Título'}</h1>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px;">
          por ${book.author || 'Anônimo'} • ${book.genre || 'Sem Gênero'}
        </p>
        <hr style="margin: 30px 0;">
  `;

  book.chapters.forEach((ch, idx) => {
    preview += `
      <h2 style="margin-top: 40px;">${ch.title || 'Capítulo ' + (idx + 1)}</h2>
      <div style="white-space: pre-wrap;">${ch.content}</div>
    `;
  });

  preview += `
      </div>
      <button class="btn" onclick="location.hash='#/write'" style="margin-top: 20px;">
        ← Voltar ao Editor
      </button>
    </div>`;

  document.getElementById("app").innerHTML = preview;
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
  a.download = `${book.title || 'meu-livro'}.txt`;
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

/* ---------- INICIALIZAÇÃO FINAL ---------- */
window.addEventListener("hashchange", router);
window.addEventListener("load", () => {
  loadTheme();
  setupNavigation();
  updateUserUI();
  router();
});