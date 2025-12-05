#!/usr/bin/env node

/**
 * Script para testar a conexão com o banco de dados MySQL
 * Uso: node test-db.js
 * 
 * Este script valida:
 * - Conexão com o servidor MySQL
 * - Existência e integridade da tabela 'books'
 * 
 * Útil para debug antes de fazer deploy na Vercel
 */

require('dotenv').config();
const { runFullTest } = require('./src/utils/testDb');

(async () => {
    const results = await runFullTest();
    process.exit(results.overall === 'success' ? 0 : 1);
})();