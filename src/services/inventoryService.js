// inventoryService.js
const db = require('../database/knex');
const inventoryRepo = require('../repositories/inventoryRepository');

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

// ================================================
// 3. ПОЛУЧИТЬ ВЕСЬ ЗАПАС (Insumos + Продукты)
// ================================================
exports.getAllStock = async () => {
    const supplies = await inventoryRepo.getAllCurrentStock();
    const products = await inventoryRepo.getAllCurrentStockProducts();
    return { supplies, products };
};

// ================================================
// 4. ПОЛУЧИТЬ ИСТОРИЮ ДВИЖЕНИЙ
// ================================================
exports.getAllMovements = async () => {
    return await inventoryRepo.getAllMovements();
};

// ================================================
// 5. ПОЛУЧИТЬ ИСТОРИЮ ДВИЖЕНИЙ ПО ПРЕДМЕТУ
// ================================================
exports.getMovementsByItem = async (itemType, itemId) => {
    if (!itemType || !itemId) throw new Error('Item type и item ID обязательны');
    return await inventoryRepo.getMovementsByItem(itemType, itemId);
};

// ================================================
// 6. АДЖАСТ ЗАПАС (Вручную)
// ================================================
exports.adjustStock = async (itemType, itemId, quantity, notes) => {
    if (!itemType || !itemId || !quantity) throw new Error('Данные для аджаста обязательны');

    // 1. Проверяем текущий запас
    const current = await inventoryRepo.getCurrentStock(itemType, itemId);
    if (!current) {
        throw new Error('Запас для этого предмета не найден');
    }

    // 2. Если уменьшение, проверяем, что хватает
    if (quantity < 0 && current.current_quantity < Math.abs(quantity)) {
        throw new Error('Недостаточно запаса для уменьшения');
    }

    // 3. Проверяем тип движения
    const movementType = await db('movement_types').where({ name: 'ADJUSTMENT' }).first();
    if (!movementType) throw new Error('Tipo de movimiento ADJUSTMENT не найден');

    // 4. Вставляем движение
    const [movement] = await db('inventory_movements').insert({
        item_type: itemType,
        item_id: itemId,
        movement_type_id: movementType.id,
        purchase_detail_id: null,
        sale_detail_id: null,
        quantity: quantity,
        notes: notes || 'Ajuste manual'
    }).returning('*');

    // 5. Обновляем запас
    await db('current_stock')
        .where({ item_type: itemType, item_id: itemId })
        .update({
            current_quantity: db.raw('current_quantity + ?', [quantity]),
            last_movement_id: movement.id,
            updated_at: db.fn.now()
        });

    return movement;
};