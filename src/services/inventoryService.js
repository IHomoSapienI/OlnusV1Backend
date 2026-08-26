// inventoryService.js
const db = require('../database/knex');

// ================================================
// 1. AGREGAR STOCK (Entrada por compra)
// ================================================
exports.addStock = async (trx, itemType, itemId, quantity, purchaseDetailId, movementType = 'PURCHASE') => {
    // 1. Buscar el ID del tipo de movimiento
    const movementTypeRow = await trx('movement_types').where({ name: movementType }).first();
    if (!movementTypeRow) throw new Error(`Tipo de movimiento ${movementType} no encontrado`);

    // 2. Insertar el movimiento de inventario (cantidad positiva)
    const [movement] = await trx('inventory_movements').insert({
        item_type: itemType,
        item_id: itemId,
        movement_type_id: movementTypeRow.id,
        purchase_detail_id: purchaseDetailId,
        sale_detail_id: null,
        quantity: quantity,
        notes: 'Entrada por compra'
    }).returning('*');

    // 3. UPSERT en current_stock (Si existe, actualiza. Si no, crea la fila)
    await trx.raw(`
        INSERT INTO current_stock (id, item_type, item_id, current_quantity, last_movement_id, updated_at)
        VALUES (gen_random_uuid(), ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT (item_type, item_id) 
        DO UPDATE SET 
            current_quantity = current_stock.current_quantity + EXCLUDED.current_quantity,
            last_movement_id = EXCLUDED.last_movement_id,
            updated_at = CURRENT_TIMESTAMP
    `, [itemType, itemId, quantity, movement.id]);

    return movement;
};

// ================================================
// 2. QUITAR STOCK (Salida por venta)
// ================================================
exports.removeStock = async (trx, itemType, itemId, quantity, saleDetailId, movementType = 'SALE') => {
    // 1. Verificar stock actual
    const stockRow = await trx('current_stock').where({ item_type: itemType, item_id: itemId }).first();
    if (!stockRow || stockRow.current_quantity < quantity) {
        throw new Error(`Stock insuficiente del ${itemType === 'supply' ? 'insumo' : 'producto'} ${itemId}. Necesita ${quantity} y hay ${stockRow ? stockRow.current_quantity : 0}`);
    }

    // 2. Buscar el tipo de movimiento
    const movementTypeRow = await trx('movement_types').where({ name: movementType }).first();
    if (!movementTypeRow) throw new Error(`Tipo de movimiento ${movementType} no encontrado`);

    // 3. Insertar el movimiento (cantidad NEGATIVA)
    const [movement] = await trx('inventory_movements').insert({
        item_type: itemType,
        item_id: itemId,
        movement_type_id: movementTypeRow.id,
        purchase_detail_id: null,
        sale_detail_id: saleDetailId,
        quantity: -quantity, // Negativo porque es salida
        notes: 'Salida por venta'
    }).returning('*');

    // 4. UPDATE del stock (restar) - Usando trx.raw
    await trx('current_stock')
        .where({ item_type: itemType, item_id: itemId })
        .update({
            current_quantity: trx.raw('current_quantity - ?', [quantity]),
            last_movement_id: movement.id,
            updated_at: trx.fn.now()
        });

    return movement;
};