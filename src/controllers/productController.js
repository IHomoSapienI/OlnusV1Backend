const db = require('../database/knex');

// Controlador para crear producto
exports.createProduct = async (req, res) => {
    try {
        const { name, product_category_id, sale_price } = req.body;
        if (!name || !product_category_id) {
            return res.status(400).json({ error: 'El nombre y la categoría del producto son obligatorios' });
        }
        const [newProduct] = await db('products')
            .insert({ name, product_category_id, sale_price: sale_price || 0 })
            .returning('*');
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Ya existe un producto con ese nombre' });
        }
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// Controlador para listar productos
exports.getProducts = async (req, res) => {
    try {
        const products = await db('products')
            .join('product_categories', 'products.product_category_id', 'product_categories.id')
            .select('products.*', 'product_categories.name as category_name');
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};