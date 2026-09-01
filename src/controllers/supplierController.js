const supplierService = require('../services/supplierService');
const db = require('../database/knex'); // Para el GET con JOINs

// POST /api/suppliers
exports.createSupplier = async (req, res) => {
    try {
        const { name, tax_id, contact_name, contact_phone, address } = req.body;

        // Validación básica
        if (!name) {
            return res.status(400).json({ error: 'Nombre del proveedor obligatorio' });
        }

        const result = await supplierService.createSupplier({
            name,
            tax_id,
            contact_name,
            contact_phone,
            address
        });

        res.status(201).json({ message: 'Proveedor creado exitosamente', data: result });
    } catch (error) {
        console.error('Error en proveedor:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.json(suppliers);
    } catch (error) {
        console.error('Error listando proveedores:', error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

// GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(req.params.id);
        if (!supplier) {
            return res.status(400).json({ error: 'Proveedor no encontrado' });
        }
        res.json(supplier);
    } catch (error) {
        console.error('Error obteniendo proveedor:', error);
        res.status(500).json({ error: 'Error al obtener proveedor' });
    }
};

// GET /api/suppliers/:id/supplies
exports.linkSupplierSupplies = async (req, res) => {
    try {
        const { supplier_id, supply_ids } = req.body;

        // Validación
        if (!supplier_id || !supply_ids || supply_ids.length === 0) {
            return res.status(400).json({ error: 'Supplier ID y insumos obligatorios' });
        }

        // Creamos nuevas relaciones
        const db = require('../database/knex');
        await db('supplier_supplies').insert(
            supply_ids.map((supplyId) => ({
                supplier_id,
                supply_id: supplyId
            }))
        );

        res.status(201).json({ message: 'Insumos vinculados al proveedor' });
    } catch (error) {
        console.error('Error linking supplier supplies:', error);
        res.status(500).json({ error: 'Error al linkear insumos' });
    }
};

// Obtener insumos, que vende el proveedor
exports.getSuppliesBySupplier = async (req, res) => {
    try {
        const db = require('../database/knex');
        const result = await db('supplier_supplies')
            .join('supplies', 'supplier_supplies.supply_id', 'supplies.id')
            .where('supplier_supplies.supplier_id', req.params.supplierId)
            .select('supplies.id', 'supplies.name');

        res.json(result);
    } catch (error) {
        console.error('Error getting supplier supplies:', error);
        res.status(500).json({ error: 'Error al obtener insumos del proveedor' });
    }
};