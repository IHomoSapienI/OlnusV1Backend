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