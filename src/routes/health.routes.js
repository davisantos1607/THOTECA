const express = require('express');
const router = express.Router();
const { testDatabaseConnection, testBooksTable } = require('../utils/testDb');

/**
 * Health check endpoint
 * GET /api/health
 * Retorna status do servidor e da conexão com o banco
 */
router.get('/', async (req, res) => {
    try {
        const dbTest = await testDatabaseConnection();
        const tableTest = await testBooksTable();

        const healthStatus = {
            server: 'ok',
            database: dbTest.status,
            table: tableTest.status,
            timestamp: new Date().toISOString(),
            details: {
                database: dbTest,
                table: tableTest
            }
        };

        const statusCode = (dbTest.status === 'success' && tableTest.status === 'success') ? 200 : 500;
        res.status(statusCode).json(healthStatus);
    } catch (error) {
        res.status(500).json({
            server: 'error',
            database: 'unknown',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;