// // purchaseService.js
// const db = require('../database/knex');
// const purchaseRepo = require('../repositories/purchaseRepository');
// const inventoryService = require('./inventoryService');

// exports.createPurchase = async (purchaseData, detailsData, userEmail) => {
//     try {
//         if (!purchaseData || !detailsData || detailsData.length === 0) {
//             throw new Error('Данные покупки обязательны');
//         }

//         return await db.transaction(async (trx) => {
//             // 1. Search user
//             const user = await trx('users').select('id').where('email', userEmail).first();
//             if (!user) throw new Error('Usuario no encontrado');

//             // 2. Insert purchase header
//             const purchase = await purchaseRepo.insertPurchase(trx, {
//                 user_id: user.id,
//                 supplier_id: purchaseData.supplier_id,
//                 purchase_number: purchaseData.purchase_number,
//                 subtotal: purchaseData.subtotal,
//                 tax: purchaseData.tax,
//                 total: purchaseData.total,
//                 status: 'effective'
//             });

//             // 3. Insert details + автоматически связать провайдера с инсумами
//             for (let item of detailsData) {
//                 const detail = await purchaseRepo.insertPurchaseDetail(trx, {
//                     purchase_id: purchase.id,
//                     supply_id: item.supply_id,
//                     quantity: item.quantity,
//                     unit_cost: item.unit_cost,
//                     subtotal: item.quantity * item.unit_cost
//                 });

//                 // Автоматически: Регистрируем, что этот провайдер продаёт этот инсум
//                 await trx('supplier_supplies')
//                     .insert({
//                         supplier_id: purchaseData.supplier_id,
//                         supply_id: item.supply_id
//                     })
//                     .onConflict(['supplier_id', 'supply_id'])
//                     .ignore(); // Если уже есть связь, не дублируем

//                 // Aumentar stock de insumo
//                 await inventoryService.addStock(
//                     trx, 
//                     'supply', 
//                     item.supply_id, 
//                     item.quantity, 
//                     detail.id, 
//                     'PURCHASE'
//                 );
//             }

//             return purchase;
//         });
//     } catch (error) {
//         if (error.code === '23505') throw new Error('Ya existe una compra с этим номером');
//         throw error;
//     }
// };

// purchaseService.js
const db = require('../database/knex');
const purchaseRepo = require('../repositories/purchaseRepository');
const inventoryService = require('./inventoryService');

exports.createPurchase = async (purchaseData, detailsData, userEmail) => {
    try {
        if (!purchaseData || !detailsData || detailsData.length === 0) {
            throw new Error('Данные покупки обязательны');
        }

        return await db.transaction(async (trx) => {
            // 1. Поиск пользователя
            const user = await trx('users').select('id').where('email', userEmail).first();
            if (!user) throw new Error('Usuario no encontrado');

            // 2. Вставляем заголовок покупки
            const purchase = await purchaseRepo.insertPurchase(trx, {
                user_id: user.id,
                supplier_id: purchaseData.supplier_id,
                purchase_number: purchaseData.purchase_number,
                subtotal: purchaseData.subtotal,
                tax: purchaseData.tax,
                total: purchaseData.total,
                status: 'effective'
            });

            // 3. Вставляем детали и увеличиваем запас
            for (let item of detailsData) {
                const detail = await purchaseRepo.insertPurchaseDetail(trx, {
                    purchase_id: purchase.id,
                    supply_id: item.supply_id,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost,
                    subtotal: item.quantity * item.unit_cost
                });

                // Отдаём вызов в inventoryService
                await inventoryService.addStock(
                    trx, 
                    item.supply_id, 
                    item.quantity, 
                    detail.id, 
                    'PURCHASE'
                );
            }

            return purchase;
        });
    } catch (error) {
        if (error.code === '23505') throw new Error('Ya existe una compra с этим номером');
        throw error;
    }
};

// List all purchases
exports.getAllPurchases = async () => {
    return await purchaseRepo.getAllPurchases();
};

// Get purchase details
exports.getPurchaseDetails = async (purchaseId) => {
    if (!purchaseId) throw new Error('ID de compra obligatorio');
    return await purchaseRepo.getPurchaseDetails(purchaseId);
};