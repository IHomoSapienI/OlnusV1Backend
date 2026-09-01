// inventoryService.js
const db = require('../database/knex');
const inventoryRepo = require('../repositories/inventoryRepository');

// AGREGAR STOCK (Entrada por compra)
exports.addStock = async (trx, supplyId, quantity, purchaseDetailId, movementType = 'PURCHASE') => {
    const movementTypeRow = await trx('movement_types').where({ name: movementType }).first();
    if (!movementTypeRow) throw new Error(`Tipo de movimiento ${movementType} no encontrado`);

    const [movement] = await trx('inventory_movements').insert({
        supply_id: supplyId,
        movement_type_id: movementTypeRow.id,
        purchase_detail_id: purchaseDetailId,
        sale_detail_id: null,
        quantity: quantity,
        notes: 'Entrada por compra'
    }).returning('*');

    await trx.raw(`
        INSERT INTO current_stock (id, supply_id, current_quantity, last_movement_id, updated_at)
        VALUES (gen_random_uuid(), ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT (supply_id) 
        DO UPDATE SET 
            current_quantity = current_stock.current_quantity + EXCLUDED.current_quantity,
            last_movement_id = EXCLUDED.last_movement_id,
            updated_at = CURRENT_TIMESTAMP
    `, [supplyId, quantity, movement.id]);

    return movement;
};

// QUITAR STOCK (Salida por venta)
exports.removeStock = async (trx, supplyId, quantity, saleDetailId, movementType = 'SALE') => {
    const stockRow = await trx('current_stock').where({ supply_id: supplyId }).first();
    if (!stockRow || stockRow.current_quantity < quantity) {
        throw new Error(`Stock insuficiente del insumo ${supplyId}. Necesita ${quantity} y hay ${stockRow ? stockRow.current_quantity : 0}`);
    }

    const movementTypeRow = await trx('movement_types').where({ name: movementType }).first();
    if (!movementTypeRow) throw new Error(`Tipo de movimiento ${movementType} no encontrado`);

    const [movement] = await trx('inventory_movements').insert({
        supply_id: supplyId,
        movement_type_id: movementTypeRow.id,
        purchase_detail_id: null,
        sale_detail_id: saleDetailId,
        quantity: -quantity,
        notes: 'Salida por venta'
    }).returning('*');

    await trx('current_stock')
        .where({ supply_id: supplyId })
        .update({
            current_quantity: trx.raw('current_quantity - ?', [quantity]),
            last_movement_id: movement.id,
            updated_at: trx.fn.now()
        });

    return movement;
};

// Obtener todo el stock
exports.getAllStock = async () => {
    return await inventoryRepo.getAllCurrentStock();
};

// Obtener el historial de movimientos
exports.getAllMovements = async () => {
    return await inventoryRepo.getAllMovements();
};

// Obtener el historial de movimientos por insumo
exports.getMovementsByItem = async (supplyId) => {
    if (!supplyId) throw new Error('ID del insumo obligatorio');
    return await inventoryRepo.getMovementsByItem(supplyId);
};

// Ajustar el stock manualmente
exports.adjustStock = async (supplyId, quantity, notes) => {
    if (!supplyId || !quantity) throw new Error('ID del insumo y cantidad obligatorios');

    // 1. Obtener el stock actual
    const current = await inventoryRepo.getCurrentStock(supplyId);
    if (!current) {
        throw new Error('Stock no encontrado para este insumo');
    }

    // 2. Si se reduce, verificar que hay suficiente
    if (quantity < 0 && current.current_quantity < Math.abs(quantity)) {
        throw new Error('Stock insuficiente para reducir');
    }

    // 3. Buscar el tipo de movimiento
    const movementType = await db('movement_types').where({ name: 'ADJUSTMENT' }).first();
    if (!movementType) throw new Error('Tipo de movimiento ADJUSTMENT no encontrado');

    // 4. Insertar el movimiento
    const [movement] = await db('inventory_movements').insert({
        supply_id: supplyId,
        movement_type_id: movementType.id,
        purchase_detail_id: null,
        sale_detail_id: null,
        quantity: quantity,
        notes: notes || 'Ajuste manual'
    }).returning('*');

    // 5. Update del stock
    await db('current_stock')
        .where({ supply_id: supplyId })
        .update({
            current_quantity: db.raw('current_quantity + ?', [quantity]),
            last_movement_id: movement.id,
            updated_at: db.fn.now()
        });

    return movement;
};