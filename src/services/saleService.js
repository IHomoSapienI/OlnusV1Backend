const db = require('../database/knex');
const saleRepo = require('../repositories/saleRepository');
const inventoryService = require('./inventoryService'); // Lo usaremos para restar stock

exports.createSaleTransaction = async (saleData, items, userEmail) => {
    return await db.transaction(async (trx) => {
        
        // 1. Buscar el usuario
        const user = await trx('users').select('id').where('email', userEmail).first();
        if (!user) throw new Error('Usuario no encontrado');

        // 2. Insertar el encabezado de la venta
        const sale = await saleRepo.insertSale(trx, {
            user_id: user.id,
            subtotal: saleData.subtotal,
            tax: saleData.tax,
            total: saleData.total,
            status: 'completed'
        });

        // 3. Procesar cada producto vendido
        for (let item of items) {
            // Buscar la receta del producto
            const recipeDetails = await saleRepo.getRecipeDetails(trx, item.product_id);
            if (!recipeDetails || recipeDetails.length === 0) {
                throw new Error(`El producto ${item.product_id} no tiene una receta definida`);
            }

            // 4. Insertar el detalle de la venta
            const detail = await saleRepo.insertSaleDetail(trx, {
                sale_id: sale.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.quantity * item.unit_price
            });

            // 5. Descontar el stock de CADA insumo necesario
            for (let req of recipeDetails) {
                // Calcular cuánto insumo se necesita para esta venta
                const quantityNeeded = req.quantity_required * item.quantity;
                
                // Verificar stock actual
                const currentStock = await saleRepo.getCurrentStock(trx, req.supply_id);
                
                if (currentStock < quantityNeeded) {
                    throw new Error(`Stock insuficiente del insumo ${req.supply_id}. Necesita ${quantityNeeded} y hay ${currentStock}`);
                }

                // Calcular nuevo stock
                const newStock = currentStock - quantityNeeded;

                // Actualizar la tabla current_stock
                await saleRepo.updateStock(trx, req.supply_id, newStock);

                // Registrar el movimiento de inventario (salida)
                await saleRepo.insertInventoryMovement(trx, {
                    supply_id: req.supply_id,
                    movement_type_id: (await trx('movement_types').select('id').where('name', 'SALE').first()).id,
                    sale_detail_id: detail.id,
                    quantity: -quantityNeeded, // Negativo porque es una salida
                    notes: `Salida por venta #${sale.id} (Producto: ${item.product_id})`
                });
            }
        }

        // Si todo salió bien, el commit es automático
        return sale;
    });
};