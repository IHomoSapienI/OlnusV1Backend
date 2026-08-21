const db = require('../database/knex');

exports.insertSale = async (trx, saleData) => {
    const [sale] = await trx('sales').insert(saleData).returning('*');
    return sale;
};

exports.insertSaleDetail = async (trx, detailData) => {
    const [detail] = await trx('sale_details').insert(detailData).returning('*');
    return detail;
};

exports.getRecipeDetails = async (trx, productId) => {
    // Obtenemos los insumos necesarios para producir 1 unidad del producto
    return await trx('recipe_details')
        .join('recipes', 'recipes.id', 'recipe_details.recipe_id')
        .where('recipes.product_id', productId)
        .select('recipe_details.supply_id', 'recipe_details.quantity_required');
};

exports.getCurrentStock = async (trx, supplyId) => {
    const stock = await trx('current_stock')
        .select('current_quantity')
        .where('supply_id', supplyId)
        .first();
    return stock ? stock.current_quantity : 0;
};

exports.updateStock = async (trx, supplyId, newQuantity) => {
    await trx('current_stock')
        .where('supply_id', supplyId)
        .update({
            current_quantity: newQuantity,
            updated_at: trx.fn.now()
        });
};

exports.insertInventoryMovement = async (trx, movementData) => {
    const [movement] = await trx('inventory_movements').insert(movementData).returning('*');
    return movement;
};