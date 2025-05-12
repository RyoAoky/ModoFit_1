const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../lib/auth'); 
const controllerrender = require("../controllers/controllerrender");

// Public routes
router.get('/', controllerrender.renderHome);
router.get('/registro', forwardAuthenticated, controllerrender.renderRegistro);
router.get('/confirmacion', controllerrender.renderConfirmacion);
router.get('/politica_privacidad', controllerrender.renderPoliticaPrivacidad);
router.get('/terminos_y_condiciones', controllerrender.renderTerminosCondiciones);

// Protected routes
// router.get('/dashboard', ensureAuthenticated, controllerrender.renderDashboard); 

module.exports = router;