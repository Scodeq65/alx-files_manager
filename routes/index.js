// routes/index.js
const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');

// Define the routes for /status and /stats
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

module.exports = router;
