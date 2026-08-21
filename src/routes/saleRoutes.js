const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// Registrar una venta (POST)
router.post('/sales', saleController.createSale);

// Listar ventas (GET) - opcional para pruebas
router.get('/sales', saleController.getSales);

module.exports = router;
