const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const controllerrender = require("../controllers/controllerrender");

// Public routes
router.get('/', controllerrender.renderHome);
router.get('/registro', controllerrender.renderRegistro);
router.get('/confirmacion', controllerrender.renderConfirmacion);
router.get('/politica_privacidad', controllerrender.renderPoliticaPrivacidad);
router.get('/terminos_y_condiciones', controllerrender.renderTerminosCondiciones);

// Protected routes
router.get('/dashboard', isLoggedIn, controllerrender.renderDashboard);

// 404 route (should be last)
router.get('*', controllerrender.renderNotFound);

module.exports = router;