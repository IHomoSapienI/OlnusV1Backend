// saleRepository.js
const db = require('../database/knex');

// Función para insertar el encabezado de la venta
exports.insertSale = async (trx, saleData) => {
    const [sale] = await trx('sales').insert(saleData).returning('*');
    return sale;
};

// Función para insertar el detalle de la venta
exports.insertSaleDetail = async (trx, detailData) => {
    const [detail] = await trx('sale_details').insert(detailData).returning('*');
    return detail;
};

// Función para buscar la receta de un producto (con su detalle)
exports.getRecipeDetails = async (trx, productId) => {
    // Obtenemos los insumos necesarios para producir 1 unidad del producto
    return await trx('recipe_details')
        .join('recipes', 'recipes.id', 'recipe_details.recipe_id')
        .where('recipes.product_id', productId)
        .select('recipe_details.supply_id', 'recipe_details.quantity_required');
};

// Función para consultar stock actual (Nuevo modelo)
exports.getCurrentStock = async (trx, itemType, itemId) => {
    const stock = await trx('current_stock')
        .select('current_quantity')
        .where({ item_type: itemType, item_id: itemId })
        .first();
    return stock ? stock.current_quantity : 0;
};

// Función para actualizar stock (Nuevo modelo)
exports.updateStock = async (trx, itemType, itemId, newQuantity) => {
    await trx('current_stock')
        .where({ item_type: itemType, item_id: itemId })
        .update({
            current_quantity: newQuantity,
            updated_at: trx.fn.now()
        });
};

// Función para insertar movimientos de inventario (Nuevo modelo)
exports.insertInventoryMovement = async (trx, movementData) => {
    const [movement] = await trx('inventory_movements').insert(movementData).returning('*');
    return movement;
};