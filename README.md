# Thoteca — Backend (Node.js, Express, MySQL)

Este repositório contém o backend da aplicação Thoteca usando Node.js, Express, upload de arquivos com Multer e banco de dados MySQL.

## Visão geral

- Linguagem: JavaScript (Node.js)
- Framework: Express
- Banco de dados: MySQL (usando mysql2)
- Uploads: Multer, arquivos salvos em `backend/uploads`

## Funcionalidades

- CRUD de livros (título, autor, descrição, capa/arquivo)
- Upload de imagens/capas
- Endpoints REST organizados em rotas
- Estrutura modular com controllers, models, routes e config

## Estrutura do projeto (pasta `backend`)

- `server.js` — ponto de entrada do servidor
- `src/config/db.config.js` — configuração de conexão com MySQL
- `src/config/database.sql` — script SQL para criar banco/tabela
- `src/models/` — modelos (ex.: `book.model.js`)
- `src/controllers/` — controladores (ex.: `book.controller.js`)
- `src/routes/` — rotas (ex.: `book.routes.js`)
- `uploads/` — pasta para arquivos enviados (ignoramos o conteúdo no git)
- `.env` — variáveis de ambiente (não versionar)
- `.gitignore` — arquivo de exclusões (já configurado)

## Requisitos

- Node.js >= 18 (ou versão compatível)
- npm
- MySQL Server

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=suasenha
DB_NAME=thoteca_db
PORT=3001
```

Ajuste conforme suas credenciais.

## Criando o banco de dados

O arquivo SQL para criar o banco e a tabela está em `src/config/database.sql`.
No Windows (cmd.exe), rode:

```cmd
cd C:\Users\<seu-usuario>\OneDrive\Desktop\THOTECA\backend
mysql -u root -p < src\config\database.sql
```

Substitua `root` e o caminho conforme necessário. Será solicitado a senha do MySQL.

> Observação: se preferir, use um cliente gráfico (MySQL Workbench, phpMyAdmin) para executar o script.

## Instalação de dependências

No diretório `backend`, instale as dependências:

```cmd
cd C:\Users\<seu-usuario>\OneDrive\Desktop\THOTECA\backend
npm install
```

As dependências principais usadas são: `express`, `mysql2`, `dotenv`, `cors`, `multer`.

## Executando em modo desenvolvimento

Use o script `dev` (usa `nodemon` se estiver instalado globalmente ou como dependência de desenvolvimento):

```cmd
npm run dev
```

Ou para iniciar normalmente:

```cmd
npm start
```

O servidor ficará disponível em `http://localhost:3001` (ou `PORT` configurada no `.env`).

## Endpoints principais

Base: `http://localhost:<PORT>/api/books`

- GET `/api/books` — lista todos os livros
- GET `/api/books/:id` — obtém livro por id
- POST `/api/books` — cria um livro (multipart/form-data, campo de arquivo: `cover_image`)
- PUT `/api/books/:id` — atualiza um livro (pode enviar novo `cover_image`)
- DELETE `/api/books/:id` — remove um livro

APIs adicionais implementadas

Autenticação (JWT):
- POST `/api/auth/register` — { name, email, password }
- POST `/api/auth/login` — { email, password }

Usuário (protegido por token):
- GET `/api/users/me` — retorna perfil do usuário autenticado
- PUT `/api/users/me` — atualiza dados (name, email, password)
- DELETE `/api/users/me` — remove conta

Avaliações (reviews):
- POST `/api/reviews` — (protected) { book_id, rating, comment }
- GET `/api/reviews/book/:bookId` — lista avaliações de um livro
- DELETE `/api/reviews/:id` — (protected) deleta avaliação própria

Favoritos:
- POST `/api/favorites` — (protected) { book_id } adiciona favorito
- GET `/api/favorites` — (protected) lista favoritos do usuário
- DELETE `/api/favorites/:book_id` — (protected) remove favorito

Estatísticas:
- GET `/api/stats/top-rated?limit=10` — livros mais bem avaliados
- GET `/api/stats/by-genre` — contagem de livros por gênero

Exemplo de requisição POST com `curl` (envio de imagem):

```bash
curl -X POST "http://localhost:3001/api/books" \
  -F "title=Meu Livro" \
  -F "author=Autor Exemplo" \
  -F "description=Descrição do livro" \
  -F "cover_image=@C:/caminho/para/imagem.jpg"
```

(Em Windows você pode usar `curl` nativo ou uma ferramenta como Postman/Insomnia.)

## Health Check / Teste de Conexão

Para verificar se o servidor está respondendo e se a conexão com o banco está ok, use o endpoint:

```bash
GET http://localhost:3001/api/health
```

Resposta esperada (exemplo):

```json
{
  "server": "ok",
  "database": "success",
  "table": "success",
  "timestamp": "2025-11-14T10:30:00.000Z",
  "details": {
    "database": {
      "status": "success",
      "message": "Conexão com banco de dados estabelecida com sucesso",
      "timestamp": "2025-11-14T10:30:00.000Z"
    },
    "table": {
      "status": "success",
      "message": "Tabela 'books' está ok. Total de registros: 5",
      "count": 5,
      "timestamp": "2025-11-14T10:30:00.000Z"
    }
  }
}
```

### Script de teste local

Se quiser testar a conexão com o banco antes de fazer deploy, execute:

```cmd
cd C:\Users\<seu-usuario>\OneDrive\Desktop\THOTECA\backend
node test-db.js
```

Este script faz:
1. Testa conexão com MySQL
2. Verifica integridade da tabela `books`
3. Exibe o total de registros

Útil para debug após configurar variáveis de ambiente ou antes de deploy na Vercel.

## Uploads e .gitignore

A pasta `uploads/` existe no repositório, mas seu conteúdo está ignorado pelo `.gitignore`. Há um `.gitkeep` para manter a pasta no controle de versão sem incluir arquivos de usuários.

## Boas práticas e segurança

- Nunca versionar `.env` (credenciais). Use variáveis de ambiente no servidor de produção.

- Limite tipos de arquivos aceitos (já implementado no multer em `book.routes.js`).
- Considere usar autenticação/autorizações (JWT) antes de expor rotas de write/delete em produção.

## Próximos passos sugeridos

- Implementar testes unitários e de integração
- Adicionar paginação e filtros na listagem de livros
- Implementar autenticação (registro/login) para operações protegidas
- Adicionar migrações com uma ferramenta (ex.: `knex`, `sequelize` ou `umzug`)

## Contato

Se quiser que eu adicione exemplos de testes, scripts de migração ou integração contínua (GitHub Actions), me diga qual parte prefere que eu implemente a seguir.

---

Arquivo gerado automaticamente por assistente. Ajuste caminhos/valores conforme seu ambiente.

## Deploy na Vercel (passo a passo)

Esta seção explica como publicar o backend na Vercel como uma API serverless. O projeto já contém uma função em `api/index.js` e um `vercel.json` de exemplo.

Resumo do que será necessário:
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Conta na Vercel
- Banco de dados MySQL gerenciado (ex.: PlanetScale, Railway, Neon, AWS RDS)
- (Opcional) Conta Cloudinary para armazenar imagens (recomendado para persistência de uploads em serverless)

1) Commit e push do repositório

```cmd
cd C:\Users\<seu-usuario>\OneDrive\Desktop\THOTECA
git add .
git commit -m "Preparar backend para deploy na Vercel"
git push origin main
```

2) Crie o banco de dados gerenciado

- Ex.: PlanetScale, Railway, Neon ou RDS. Depois de criar, anote o host, usuário, senha e nome do banco.
- Importe o script SQL (ou use o Console do provedor):

```cmd
cd C:\Users\<seu-usuario>\OneDrive\Desktop\THOTECA\backend
mysql -h <DB_HOST> -u <DB_USER> -p < src\config\database.sql
```

3) Configure Cloudinary (opcional, recomendado)

- Crie uma conta em https://cloudinary.com e copie a `CLOUDINARY_URL` (ou as credenciais separadas).
- Se usar Cloudinary, as imagens serão salvas lá; caso contrário os uploads só funcionarão localmente (Vercel não persiste arquivos no disco).

4) Criar projeto na Vercel

- No dashboard da Vercel, clique em "New Project" → import do Git → selecione o repositório.
- Em "Project Settings" defina o campo "Root Directory" como `backend` (importante: o código da API está dentro de `backend/`).

5) Variáveis de ambiente no painel da Vercel

Adicione as variáveis necessárias (Settings → Environment Variables):

- DB_HOST — host do seu banco (ex: db.xyz.host)
- DB_USER — usuário do banco
- DB_PASSWORD — senha do banco
- DB_NAME — nome do banco (ex: thoteca_db)
- CLOUDINARY_URL — (opcional) `cloudinary://KEY:SECRET@CLOUD_NAME`
- NODE_ENV — `production`

6) Deploy

- Após configurar as variáveis, clique em Deploy. A Vercel executará o deploy automaticamente.

7) Testes pós-deploy

- Acesse a URL do projeto (ex.: https://<seu-projeto>.vercel.app)
- Teste os endpoints:

  - GET `https://<seu-projeto>.vercel.app/api/books`
  - POST `https://<seu-projeto>.vercel.app/api/books` (multipart/form-data, campo `cover_image`) — se usar Cloudinary a imagem será carregada e a URL será salva no banco

Exemplo de teste com curl (para upload de imagem):

```bash
curl -X POST "https://<seu-projeto>.vercel.app/api/books" \
  -F "title=Livro Vercel" \
  -F "author=Autor Vercel" \
  -F "description=Teste de upload" \
  -F "cover_image=@C:/caminho/para/imagem.jpg"
```

Dicas e observações

- Vercel não oferece armazenamento de arquivos persistente; por isso o Cloudinary (ou S3) é recomendado para imagens.
- Para bancos serverless como PlanetScale, leia a documentação sobre conexões persistentes e pooling; `mysql2` geralmente funciona, mas serviços serverless podem ter limitações (use provedores que suportem conexões a partir de funções serverless ou configure pooling externo).
- Se preferir mais controle sobre o backend (disco persistente, tarefas em segundo plano), use Render, Railway ou DigitalOcean App Platform.

Se quiser, eu posso:
- adicionar instruções específicas para PlanetScale (incluindo adaptações no driver),
- ou gerar um passo-a-passo com screenshots do painel da Vercel.
