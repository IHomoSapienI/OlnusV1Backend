const db = require('../database/knex');
const supplierRepo = require('../repositories/supplierRepository');

// Solo permite créer un proveedor (con validaciones)
exports.createSupplier = async (supplierData) => {
    try {
        // Validar nombre obligatorio
        if (!supplierData.name) {
            throw new Error('Nombre del proveedor obligatorio');
        }

        // Insertar
        const result = await db.transaction(async (trx) => {
            return await supplierRepo.insertSupplier(trx, {
                name: supplierData.name,
                tax_id: supplierData.tax_id || null,
                contact_name: supplierData.contact_name || null,
                contact_phone: supplierData.contact_phone || null,
                address: supplierData.address || null,
                status: 'active' // Solo activo
            });
        });

        return result;
    } catch (error) {
        console.error('Error creating supplier:', error);
        if (error.code === '23505') {
            throw new Error('Ya existe un proveedor con ese nombre');
        }
        throw error;
    }
};

// Listar todos
exports.getAllSuppliers = async () => {
    return await supplierRepo.getAllSuppliers();
};

// Buscar por ID
exports.getSupplierById = async (id) => {
    if (!id) throw new Error('ID de proveedor obligatorio');
    return await supplierRepo.getSupplierById(id);
};