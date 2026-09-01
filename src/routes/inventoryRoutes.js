// const express = require('express');
// const router = express.Router();
// const inventoryController = require('../controllers/inventoryController');

// // obtener todo el stock actual
// router.get('/inventory', inventoryController.getAllStock);

// // obtener todos los movimientos de inventario
// router.get('/inventory/movements', inventoryController.getAllMovements);

// // obtener movimientos por item 
// router.get('/inventory/movements/:itemType/:itemId', inventoryController.getMovementsByItem);

// // COTROLADOR PARA AJUSTAR EL STOCK (MANUALMENTE)
// router.post('/inventory/adjust', inventoryController.adjustStock);

// module.exports = router;

// inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Obtener todo el stock
router.get('/inventory', inventoryController.getAllStock);

// Obtener el historial de movimientos
router.get('/inventory/movements', inventoryController.getAllMovements);

// Obtener el historial de movimientos por insumo
router.get('/inventory/movements/:supplyId', inventoryController.getMovementsByItem);

// Ajustar el stock manualmente
router.post('/inventory/adjust', inventoryController.adjustStock);

module.exports = router;