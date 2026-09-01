const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Получить весь запас (insumos + продукты)
router.get('/inventory', inventoryController.getAllStock);

// Получить историю движений
router.get('/inventory/movements', inventoryController.getAllMovements);

// Получить историю движений по предмету
router.get('/inventory/movements/:itemType/:itemId', inventoryController.getMovementsByItem);

// Аджаст запас (вручную)
router.post('/inventory/adjust', inventoryController.adjustStock);

module.exports = router;