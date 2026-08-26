// inventoryService.js
const db = require('../database/knex');

// Registra la entrada de stock
exports.addStock = async (trx, supplyId, quantity, purchaseDetailId, movementType = 'PURCHASE') => {
    // 1. Buscar el ID del tipo de movimiento
    const movementTypeRow = await trx('movement_types').where({ name: movementType }).first();
    if (!movementTypeRow) throw new Error(`Tipo de movimiento ${movementType} no encontrado`);

    // 2. Insertar el movimiento de inventario (cantidad positiva)
    const [movement] = await trx('inventory_movements').insert({
        supply_id: supplyId,
        movement_type_id: movementTypeRow.id,
        purchase_detail_id: purchaseDetailId,
        sale_detail_id: null,
        quantity: quantity,
        notes: 'Entrada por compra'
    }).returning('*');

    // 3. UPSERT en current_stock (Si existe, actualiza. Si no, crea la fila)
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

// Registra la salida de stock (para ventas o producción)
exports.removeStock = async (trx, supplyId, quantity, saleDetailId, movementType = 'SALE') => {
    // 1. Verificar stock actual
    const stockRow = await trx('current_stock').where({ supply_id: supplyId }).first();
    if (!stockRow || stockRow.current_quantity < quantity) {
        throw new Error(`Stock insuficiente del insumo ${supplyId}. Necesita ${quantity} y hay ${stockRow ? stockRow.current_quantity : 0}`);
    }

    // 2. Buscar el tipo de movimiento
    const movementTypeRow = await trx('movement_types').where({ name: movementType }).first();
    if (!movementTypeRow) throw new Error(`Tipo de movimiento ${movementType} no encontrado`);

    // 3. Insertar el movimiento (cantidad NEGATIVA)
    const [movement] = await trx('inventory_movements').insert({
        supply_id: supplyId,
        movement_type_id: movementTypeRow.id,
        purchase_detail_id: null,
        sale_detail_id: saleDetailId,
        quantity: -quantity, // Negativo porque es salida
        notes: 'Salida por venta'
    }).returning('*');

    // 4. UPDATE del stock (restar)
    await trx('current_stock')
        .where({ supply_id: supplyId })
        .update({
            current_quantity: db.raw('current_quantity - ?', [quantity]), // ¡Ojo! db.raw aquí no funciona directamente con trx. Usa trx.raw
            last_movement_id: movement.id,
            updated_at: db.fn.now()
        });

    return movement;
};