// filepath: c:\Users\eduar\Desktop\Pruebas\ModoFit\routes\usuario.js
const express = require('express');
const router = express.Router();
const controllerUsuario = require('../controllers/controllerUsuario');
const { ensureAuthenticated, forwardAuthenticated } = require('../lib/auth'); // Middleware para proteger rutas

// Vista de Login
// Añadido forwardAuthenticated para redirigir si el usuario ya está logueado
router.get('/login', forwardAuthenticated, controllerUsuario.renderLogin);

// Manejar POST de Login
router.post('/login', controllerUsuario.loginUser);

// Vista de Dashboard (protegida)
router.get('/dashboard', ensureAuthenticated, controllerUsuario.renderDashboard);

// Vista de Facturación (protegida)
router.get('/billing', ensureAuthenticated, controllerUsuario.renderBilling);

// Logout
router.get('/logout', ensureAuthenticated, controllerUsuario.logoutUser);

module.exports = router;
