const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../lib/auth');
const controllerVenta = require('../controllers/controllerVenta');

// API routes for sales
router.post('/procesar-pago', controllerVenta.procesarPago);
router.get('/plan-detalles', controllerVenta.obtenerPlanDetalles);
router.post('/aplicar-descuento', controllerVenta.aplicarDescuento);
router.get('/consultar-membresia', ensureAuthenticated, controllerVenta.consultarMembresia);

module.exports = router;