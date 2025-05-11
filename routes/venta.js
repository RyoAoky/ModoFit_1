const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const controllerVenta = require('../controllers/controllerVenta');

// API routes for sales
router.post('/procesar-pago', controllerVenta.procesarPago);
router.get('/plan-detalles', controllerVenta.obtenerPlanDetalles);
router.post('/aplicar-descuento', controllerVenta.aplicarDescuento);
router.get('/consultar-membresia', isLoggedIn, controllerVenta.consultarMembresia);

module.exports = router;