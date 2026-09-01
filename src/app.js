const express = require('express');
const cors = require('cors');

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const supplyRoutes = require('./routes/supplyRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const saleRoutes = require('./routes/saleRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Definir rutas
app.use('/api', productRoutes);
app.use('/api', supplyRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', saleRoutes);
app.use('/api', supplierRoutes);
app.use('/api', catalogRoutes);
app.use('/api', recipeRoutes);
app.use('/api', inventoryRoutes);

// Middleware de errores (opcional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

module.exports = app;