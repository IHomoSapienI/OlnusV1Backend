const db = require('../database/knex');

// Crear un producto
exports.insertProduct = async (data) => {
    const [product] = await db('products').insert(data).returning('*');
    return product;
};

// Listar todos los productos (con categoría y stock)
exports.getAllProducts = async () => {
    return await db('products')
        .join('product_categories', 'products.product_category_id', 'product_categories.id')
        .select(
            'products.*',
            'product_categories.name as category_name',
            'current_stock.current_quantity'
        )
        .leftJoin('current_stock', function() {
            this.on('current_stock.item_type', '=', db.raw("'product'"))
                .andOn('current_stock.item_id', '=', 'products.id');
        })
        .orderBy('products.name');
};