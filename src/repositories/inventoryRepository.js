const db = require('../database/knex');

// Взять текущий запас по item_type и item_id
exports.getCurrentStock = async (itemType, itemId) => {
    return await db('current_stock')
        .where({ item_type: itemType, item_id: itemId })
        .first();
};

// Взять весь запас (с именами insumos и продуктов)
exports.getAllCurrentStock = async () => {
    return await db('current_stock')
        .join('supplies', function() {
            this.on('current_stock.item_type', '=', db.raw("'supply'"))
                .andOn('current_stock.item_id', '=', 'supplies.id');
        })
        .select(
            'current_stock.*',
            'supplies.name as item_name',
            'supplies.minimum_stock'
        )
        .orderBy('current_stock.current_quantity', 'asc');
};

// Взять весь запас с продуктами
exports.getAllCurrentStockProducts = async () => {
    return await db('current_stock')
        .join('products', function() {
            this.on('current_stock.item_type', '=', db.raw("'product'"))
                .andOn('current_stock.item_id', '=', 'products.id');
        })
        .select(
            'current_stock.*',
            'products.name as item_name'
        )
        .orderBy('current_stock.current_quantity', 'asc');
};

// Взять историю движений
exports.getAllMovements = async () => {
    return await db('inventory_movements')
        .join('movement_types', 'inventory_movements.movement_type_id', 'movement_types.id')
        .select(
            'inventory_movements.*',
            'movement_types.name as movement_name'
        )
        .orderBy('inventory_movements.created_at', 'desc');
};

// Взять историю движений по предмету
exports.getMovementsByItem = async (itemType, itemId) => {
    return await db('inventory_movements')
        .join('movement_types', 'inventory_movements.movement_type_id', 'movement_types.id')
        .where({ item_type: itemType, item_id: itemId })
        .select(
            'inventory_movements.*',
            'movement_types.name as movement_name'
        )
        .orderBy('inventory_movements.created_at', 'desc');
};