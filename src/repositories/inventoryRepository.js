// inventoryRepository.js
const db = require('../database/knex');

// Obtener todo el stock
exports.getAllCurrentStock = async () => {
    return await db('current_stock')
        .join('supplies', 'current_stock.supply_id', 'supplies.id')
        .select('current_stock.*', 'supplies.name as item_name', 'supplies.minimum_stock')
        .orderBy('current_stock.current_quantity', 'asc');
};

// Obtener el historial de movimientos
exports.getAllMovements = async () => {
    return await db('inventory_movements')
        .join('movement_types', 'inventory_movements.movement_type_id', 'movement_types.id')
        .select('inventory_movements.*', 'movement_types.name as movement_name')
        .orderBy('inventory_movements.created_at', 'desc');
};

// Obtener el historial de movimientos por insumo
exports.getMovementsByItem = async (supplyId) => {
    return await db('inventory_movements')
        .join('movement_types', 'inventory_movements.movement_type_id', 'movement_types.id')
        .where({ supply_id: supplyId })
        .select('inventory_movements.*', 'movement_types.name as movement_name')
        .orderBy('inventory_movements.created_at', 'desc');
};

// Obtener el stock actual por insumo
exports.getCurrentStock = async (supplyId) => {
    return await db('current_stock')
        .where({ supply_id: supplyId })
        .first();
};