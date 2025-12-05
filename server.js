// 🔐 SERVIDOR SEGURO PARA PROJETO THOTECA

const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const app = express();

// ----------------------------
// 🔐 SEGURANÇA GLOBAL
// ----------------------------

// Usa várias proteções HTTP (CSP, XSS Filter, NoSniff etc.)
app.use(helmet());

// Evita exposure de informações internas
app.disable("x-powered-by");

// CORS restrito
app.use(require("cors")({
    origin: "http://localhost:3000", // ajuste se necessário
    methods: ["GET", "POST"],
}));

// Rate limiting geral (evita ataques de força bruta)
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100,                // máximo 100 req/min
    message: { error: "Muitas requisições. Tente novamente em instantes." }
});

app.use(globalLimiter);

// Rate limiting mais rígido para upload
const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 10,                  // apenas 10 uploads
    message: { error: "Limite de uploads excedido. Tente novamente mais tarde." }
});

// ----------------------------
// 🔐 CONFIGURAÇÃO DE UPLOAD
// ----------------------------

// Extensões permitidas
const allowedMime = [
    "application/pdf",
    "image/jpeg",
    "image/png"
];

// Pasta de uploads isolada
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Armazenamento seguro
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        // Nome seguro (hash + extensão)
        const randomName = crypto.randomBytes(16).toString("hex");
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomName}${ext}`);
    }
});

// Filtro de validação de tipo MIME
const fileFilter = (req, file, cb) => {
    if (!allowedMime.includes(file.mimetype)) {
        return cb(new Error("Tipo de arquivo não permitido."), false);
    }
    cb(null, true);
};

// Limite de tamanho (10MB)
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});


// ----------------------------
// 🔐 ROTA DE UPLOAD
// ----------------------------
app.post("/api/upload", uploadLimiter, upload.single("bookFile"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "Nenhum arquivo enviado." });
        }

        // Registro simples do livro (metadados)
        const book = {
            id: Date.now(),
            filename: req.file.filename,
            size: req.file.size,
            uploadedAt: new Date().toISOString(),
            title: req.body.title || "Sem Título",
            author: req.body.author || "Desconhecido",
            genre: req.body.genre || "Geral"
        };

        console.log("[UPLOAD SEGURO] Arquivo:", req.file.originalname, "=>", req.file.filename);

        return res.json({ success: true, book });
    } catch (err) {
        console.error("[ERRO NO UPLOAD]", err.message);
        return res.status(500).json({ success: false, error: "Erro interno no upload." });
    }
});

// ----------------------------
// 🔐 ROTA PADRÃO
// ----------------------------
app.get("/", (req, res) => {
    res.json({ message: "API segura da Thoteca ativa." });
});

// ----------------------------
// 🔐 INICIAR SERVIDOR
// ----------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor seguro rodando na porta ${PORT}`);
});
