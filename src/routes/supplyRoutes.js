const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController');

// Categorías de insumos
router.post('/supply-categories', supplyController.createSupplyCategory);
router.get('/supply-categories', supplyController.getSupplyCategories);

// Insumos
router.post('/supplies', supplyController.createSupply);
router.get('/supplies', supplyController.getSupplies);

module.exports = router;