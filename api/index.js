const app = require('../server');

// Vercel will call this exported function for each request.
// Express apps are callable as functions (app(req, res)), so we delegate to the app.
module.exports = (req, res) => app(req, res);