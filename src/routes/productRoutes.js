const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Definir las rutas
router.post('/product-categories', productController.createCategory);
router.post('/products', productController.createProduct);
router.get('/products', productController.getProducts);

module.exports = router;