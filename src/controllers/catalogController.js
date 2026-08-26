const catalogService = require('../services/catalogService');

// ================================================
// SUPPLY CATEGORIES
// ================================================
exports.createSupplyCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Nombre de categoría obligatorio' });
        }

        const result = await catalogService.createSupplyCategory({ name, description });

        res.status(201).json({ message: 'Categoría de insumos creada', data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSupplyCategories = async (req, res) => {
    try {
        const result = await catalogService.getAllSupplyCategories();
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ================================================
// PRODUCT CATEGORIES
// ================================================
exports.createProductCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Nombre de categoría obligatorio' });
        }

        const result = await catalogService.createProductCategory({ name, description });

        res.status(201).json({ message: 'Categoría de productos creada', data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllProductCategories = async (req, res) => {
    try {
        const result = await catalogService.getAllProductCategories();
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ================================================
// UNITS OF MEASURE
// ================================================
exports.createUnitOfMeasure = async (req, res) => {
    try {
        const { name, abbreviation } = req.body;
        if (!name || !abbreviation) {
            return res.status(400).json({ error: 'Nombre y abreviación obligatorios' });
        }

        const result = await catalogService.createUnitOfMeasure({ name, abbreviation });

        res.status(201).json({ message: 'Unidad de medida creada', data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUnitsOfMeasure = async (req, res) => {
    try {
        const result = await catalogService.getAllUnitsOfMeasure();
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};