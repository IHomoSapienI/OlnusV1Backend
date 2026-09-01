// inventoryService.js
const db = require('../database/knex');
const inventoryRepo = require('../repositories/inventoryRepository');

// Взять весь запас (insumos + продукты)
exports.getAllStock = async () => {
    const supplies = await inventoryRepo.getAllCurrentStock();
    const products = await inventoryRepo.getAllCurrentStockProducts();
    return { supplies, products };
};

// Взять историю движений
exports.getAllMovements = async () => {
    return await inventoryRepo.getAllMovements();
};

// Взять историю движений по предмету
exports.getMovementsByItem = async (itemType, itemId) => {
    if (!itemType || !itemId) throw new Error('Item type и item ID обязательны');
    return await inventoryRepo.getMovementsByItem(itemType, itemId);
};

// Аджаст запас (вручную)
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