// saleService.js
const db = require('../database/knex');
const saleRepo = require('../repositories/saleRepository');
const inventoryService = require('./inventoryService'); 

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
            // a) Buscar la receta del producto
            const recipeDetails = await saleRepo.getRecipeDetails(trx, item.product_id);
            if (!recipeDetails || recipeDetails.length === 0) {
                throw new Error(`El producto ${item.product_id} no tiene una receta definida`);
            }

            // b) Insertar el detalle de la venta
            const detail = await saleRepo.insertSaleDetail(trx, {
                sale_id: sale.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.quantity * item.unit_price
            });

            // c) Descontar stock de CADA insumo necesario
            for (let req of recipeDetails) {
                // Calcular cuánto insumo se necesita
                const quantityNeeded = req.quantity_required * item.quantity;
                
                // Verificar y descontar stock del insumo (usando inventoryService.removeStock)
                await inventoryService.removeStock(
                    trx, 
                    'supply', 
                    req.supply_id, 
                    quantityNeeded, 
                    detail.id, 
                    'SALE'
                );
            }

            // d) Descontar stock del PRODUCTO TERMINADO
            // Esto is new en el modelo corregido
            await inventoryService.removeStock(
                trx, 
                'product', 
                item.product_id, 
                item.quantity, 
                detail.id, 
                'SALE'
            );
        }

        // Si todo salió bien, el commit es automático
        return sale;
    });
};