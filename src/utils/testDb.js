const db = require('../config/db.config');

/**
 * Teste de conexão com o banco de dados MySQL.
 * Executa uma query simples para validar a conexão.
 * Útil para debug em ambientes de produção (Vercel).
 */
async function testDatabaseConnection() {
    try {
        const [rows] = await db.query('SELECT 1');
        return {
            status: 'success',
            message: 'Conexão com banco de dados estabelecida com sucesso',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Erro ao conectar ao banco de dados: ${error.message}`,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Teste de integridade da tabela de livros.
 * Verifica se a tabela existe e se pode ser consultada.
 */
async function testBooksTable() {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM books');
        return {
            status: 'success',
            message: `Tabela 'books' está ok. Total de registros: ${rows[0].count}`,
            count: rows[0].count,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Erro ao acessar tabela 'books': ${error.message}`,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Teste completo: conexão + tabela
 */
async function runFullTest() {
    console.log('🧪 Iniciando testes do banco de dados...\n');
    
    const dbTest = await testDatabaseConnection();
    console.log('1. Conexão:', dbTest);
    
    if (dbTest.status === 'success') {
        const tableTest = await testBooksTable();
        console.log('2. Tabela books:', tableTest);
        
        return {
            database: dbTest,
            table: tableTest,
            overall: tableTest.status === 'success' ? 'success' : 'partial'
        };
    } else {
        console.log('2. Tabela books: Pulado (conexão falhou)');
        return {
            database: dbTest,
            table: null,
            overall: 'error'
        };
    }
}

module.exports = {
    testDatabaseConnection,
    testBooksTable,
    runFullTest
};