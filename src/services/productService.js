const productRepo = require('../repositories/productRepository');
const db = require('../database/knex');
const { randomUUID } = require('crypto'); // Para stock

// Crear un producto (con stock 0)
exports.createProduct = async (name, product_category_id, sale_price) => {
    if (!name || !product_category_id) {
        throw new Error('Nombre y categoría de producto obligatorios');
    }

    try {
        // 1. Insertar el producto
        const product = await productRepo.insertProduct({
            name,
            product_category_id,
            sale_price: sale_price || 0
        });

        // 2. Inicializar stock en 0
        await db('current_stock')
            .insert({
                id: randomUUID(),
                item_type: 'product',
                item_id: product.id,
                current_quantity: 0,
                updated_at: db.fn.now()
            })
            .onConflict(['item_type', 'item_id'])
            .ignore();

        return product;
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe un producto con ese nombre');
        throw error;
    }
};

// Listar todos
exports.getAllProducts = async () => {
    return await productRepo.getAllProducts();
};