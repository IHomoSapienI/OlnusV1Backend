exports.addStock = async (trx, supplyId, quantity, referenceDetailId, movementTypeName) => {
    
    // 1. Obtener el tipo de movimiento
    const movementType = await trx('movement_types').select('id').where('name', movementTypeName).first();
    if (!movementType) throw new Error('Tipo de movimiento no válido');

    // 2. Insertar movimiento (Entrada)
    await trx('inventory_movements').insert({
        supply_id: supplyId,
        movement_type_id: movementType.id,
        purchase_detail_id: referenceDetailId, // Si es compra
        quantity: quantity,
        notes: `Entrada por ${movementTypeName}`
    });

    // 3. Actualizar el current_stock (Usamos raw para sumar de forma segura)
    // Verificamos si existe el registro de stock, si no, lo creamos.
    const existingStock = await trx('current_stock').where('supply_id', supplyId).first();

    if (existingStock) {
        await trx('current_stock')
            .where('supply_id', supplyId)
            .update({
                current_quantity: trx.raw('current_quantity + ?', [quantity]),
                updated_at: trx.fn.now()
            });
    } else {
        await trx('current_stock').insert({
            supply_id: supplyId,
            current_quantity: quantity
        });
    }
};

exports.removeStock = async (trx, supplyId, quantity, referenceDetailId, movementTypeName) => {
    // Similar a addStock, pero la cantidad va negativa y se usa 'SALE'
    // (Lo implementaremos cuando hagamos la venta)
};