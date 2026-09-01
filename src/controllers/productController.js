const productService = require('../services/productService');

// POST /api/products
exports.createProduct = async (req, res) => {
    try {
        const { name, product_category_id, sale_price } = req.body;

        // Validaciones
        if (!name || !product_category_id) {
            return res.status(400).json({ error: 'Nombre y categoría obligatorios' });
        }

        const result = await productService.createProduct(name, product_category_id, sale_price);

        res.status(201).json({ message: 'Producto creado exitosamente', data: result });
    } catch (error) {
        console.error('Error en producto:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const result = await productService.getAllProducts();
        res.json(result);
    } catch (error) {
        console.error('Error listing products:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};