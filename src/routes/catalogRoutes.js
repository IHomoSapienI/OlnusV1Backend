// src/routes/catalogRoutes.js
const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

// ================================================
// SUPPLY CATEGORIES (Categorías de Insumos)
// ================================================
router.post('/supply_categories', catalogController.createSupplyCategory);
router.get('/supply_categories', catalogController.getAllSupplyCategories);

// ================================================
// PRODUCT CATEGORIES (Categorías de Productos)
// ================================================
router.post('/product_categories', catalogController.createProductCategory);
router.get('/product_categories', catalogController.getAllProductCategories);

// ================================================
// UNITS OF MEASURE (Unidades de Medida)
// ================================================
router.post('/units_of_measure', catalogController.createUnitOfMeasure);
router.get('/units_of_measure', catalogController.getAllUnitsOfMeasure);

// ================================================
// MOVEMENT TYPES (Para el inventario)
// ================================================
router.get('/movement_types', async (req, res) => {
    try {
        const db = require('../database/knex');
        const movements = await db('movement_types').orderBy('name');
        res.json(movements);
    } catch (error) {
        console.error('Error listing movement types:', error);
        res.status(500).json({ error: 'Error al obtener tipos de movimiento' });
    }
});

module.exports = router;