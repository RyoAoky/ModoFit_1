const passport = require('passport');
const { sequelize } = require('../database/conexionsqualize');
const { QueryTypes } = require('sequelize');
const { sanitizeInput, validateSchema } = require('../lib/validation');

module.exports = {
  // Renderizar vista de login
  renderLogin: (req, res) => {
    // Si ya está autenticado, redireccionar al dashboard
    if (req.isAuthenticated()) {
      return res.redirect('/usuario/dashboard');
    }
    
    // Regenerar sesión para prevenir fixation attacks
    req.session.regenerate(function(err) {
      if (err) {
        console.error('Error al regenerar sesión:', err);
      }
      
      // Generar un nuevo token CSRF para el formulario de login
      if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
      }
      
      res.render('usuario/login', {
        title: 'Iniciar Sesión',
        layout: 'layouts/main',
        error: req.flash('error'),
        success_msg: req.flash('success_msg'),
        currentPage: 'usuarioLogin',
        // Registrar último intento de login para análisis de seguridad
        loginAttempt: req.session.loginAttempts ? req.session.loginAttempts : 0
      });
    });
  },

  // Manejar el POST de login
  loginUser: (req, res, next) => {
    // Validar datos de entrada básicos
    const { email, password } = req.body;
    
    if (!email || !password) {
      req.flash('error', 'Por favor, ingrese email y contraseña');
      return res.redirect('/usuario/login');
    }
    
    // Llevar seguimiento de intentos de login
    if (!req.session.loginAttempts) {
      req.session.loginAttempts = 1;
    } else {
      req.session.loginAttempts++;
    }
    
    // Registro de intento de login (información limitada para no exponer datos sensibles)
    console.log('Intento de login:', {
      email: email.substring(0, 3) + '***@' + (email.includes('@') ? email.split('@')[1] : 'dominio.com'),
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent') ? req.get('User-Agent').substring(0, 50) : 'Unknown',
      attempts: req.session.loginAttempts
    });
    
    passport.authenticate('local', (err, user, info) => {
      // Manejar errores durante la autenticación
      if (err) {
        console.error('Error de autenticación:', err);
        req.flash('error', 'Error interno durante la autenticación');
        return res.redirect('/usuario/login');
      }
      
      // Si no se encontró usuario o contraseña incorrecta
      if (!user) {
        // Mensaje genérico de error para no dar pistas sobre qué falló
        req.flash('error', info.message || 'Credenciales inválidas');
        return res.redirect('/usuario/login');
      }
      
      // Autenticar al usuario con login exitoso
      req.login(user, (err) => {
        if (err) {
          console.error('Error al establecer sesión:', err);
          req.flash('error', 'Error al iniciar sesión');
          return res.redirect('/usuario/login');
        }
        
        // Regenerar sesión después del login para prevenir session fixation
        const oldSession = req.session;
        req.session.regenerate(function(err) {
          if (err) {
            console.error('Error al regenerar sesión post-login:', err);
            req.flash('error', 'Error al configurar la sesión');
            return res.redirect('/usuario/login');
          }
          
          // Restaurar propiedades de sesión necesarias
          req.session.passport = oldSession.passport;
          req.session.csrfToken = oldSession.csrfToken;
          req.session.csrfTimestamp = oldSession.csrfTimestamp;
          
          // Registrar el último login exitoso
          req.session.lastLogin = new Date().toISOString();
          
          // Resetear contador de intentos fallidos
          req.session.loginAttempts = 0;
          
          // Redireccionar al dashboard
          res.redirect('/usuario/dashboard');
        });
      });
    })(req, res, next);
  },

  // Renderizar vista de dashboard
  renderDashboard: async function(req, res) {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.isAuthenticated() || !req.user) {
        req.flash('error_msg', 'Debe iniciar sesión para acceder a esta página');
        return res.redirect('/usuario/login');
      }

      const usuarioID = req.user.UsuarioID;
      
      // Validar que el ID de usuario sea un número válido
      if (isNaN(parseInt(usuarioID))) {
        console.error('ID de usuario inválido:', usuarioID);
        req.flash('error_msg', 'Error de identificación de usuario');
        return res.redirect('/');
      }
      
      // Obtener datos del dashboard de forma segura
      const dashboardData = await module.exports.getDashboardData(usuarioID);

      // Asegurarse de que todos los datos entregados a la vista estén sanitizados
      res.render('usuario/dashboard', {
        title: 'Mi Dashboard',
        user: {
          // Solo proporcionar los datos necesarios del usuario
          UsuarioID: req.user.UsuarioID,
          Nombre: sanitizeInput(req.user.Nombre),
          Apellido: sanitizeInput(req.user.Apellido),
          Email: sanitizeInput(req.user.Email),
          TipoUsuario: sanitizeInput(req.user.TipoUsuario)
        },
        dashboardData: dashboardData,
        layout: 'layouts/dashboard',
        currentPage: 'usuarioDashboard'
      });
    } catch (error) {
      console.error('Error al renderizar dashboard:', {
        error: error.message,
        stack: error.stack,
        userId: req.user ? req.user.UsuarioID : 'No autenticado',
        ip: req.ip
      });
      req.flash('error_msg', 'Error al cargar el dashboard. Intente más tarde.');
      res.redirect('/');
    }
  },

  // Obtener datos para el dashboard del usuario
  getDashboardData: async function(usuarioID) { // Usar function para asegurar el contexto de 'this'
    try {
      // --- Simulación de llamadas a Stored Procedures ---
      // Reemplaza esto con llamadas reales a tus SPs usando sequelize.query
      // Ejemplo de cómo llamarías a un SP para obtener datos de asistencia:
      // const asistenciaResult = await sequelize.query('EXEC sp_GetDashboardAsistencia @UsuarioID = :usuarioID', {
      //   replacements: { usuarioID },
      //   type: QueryTypes.SELECT
      // });
      // const visitasGym = asistenciaResult[0] ? asistenciaResult[0].VisitasGym : 0;
      // const diasAsistencia = asistenciaResult.map(r => r.FechaAsistencia);

      // Ejemplo de cómo llamarías a un SP para obtener datos de beneficios:
      // const beneficiosResult = await sequelize.query('EXEC sp_GetDashboardBeneficios @UsuarioID = :usuarioID', {
      //   replacements: { usuarioID },
      //   type: QueryTypes.SELECT
      // });
      // const sillonMasajeUsos = beneficiosResult[0] ? beneficiosResult[0].SillonMasajeUsos : 0;
      // const congelamientos = beneficiosResult[0] ? beneficiosResult[0].Congelamientos : 0;
      // const membresiasCompartidas = beneficiosResult[0] ? beneficiosResult[0].MembresiasCompartidas : 0;

      // Datos simulados para el dashboard
      return {
        vecesGym: 23, // Dato simulado
        diasFue: ['2025-04-01', '2025-04-03', '2025-04-05', '2025-04-08', '2025-04-10'], // Datos simulados
        beneficiosUsados: {
          sillonMasaje: 8, // Dato simulado
          congeloMembresia: 1, // Dato simulado
          compartioMembresia: 3 // Dato simulado
        }
      };
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw error; // Re-lanzar el error para que el llamador lo maneje
    }
  },

  // Renderizar vista de facturación
  renderBilling: async function(req, res) {
    try {
      const usuarioID = req.user.UsuarioID;
      // Usar module.exports en lugar de this para evitar problemas de contexto
      const suscripciones = await module.exports.getBillingData(usuarioID);
      
      // Regenerar el token CSRF para esta solicitud
      if (req.session) {
        req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
      }

      res.render('usuario/billing', {
        title: 'Mi Facturación',
        user: req.user,
        suscripciones: suscripciones,
        layout: 'layouts/dashboard', // Usar el layout específico para dashboard
        csrfToken: req.session.csrfToken, // Asegurarse de pasar el token CSRF
        currentPage: 'usuarioBilling' // Añadido currentPage
      });
    } catch (error) {
      console.error('Error al renderizar facturación:', error);
      req.flash('error_msg', 'Error al cargar la información de facturación.');
      res.redirect('/usuario/dashboard');
    }
  },

  // Obtener datos de facturación del usuario
  getBillingData: async function(usuarioID) { // Usar function para asegurar el contexto de 'this'
    try {
      // --- Simulación de llamadas a Stored Procedures ---
      // Reemplaza esto con llamadas reales a tus SPs usando sequelize.query
      // Ejemplo:
      // const facturacionResult = await sequelize.query('EXEC sp_GetFacturacionUsuario @UsuarioID = :usuarioID', {
      //   replacements: { usuarioID },
      //   type: QueryTypes.SELECT
      // });
      // return facturacionResult; // Asumiendo que el SP devuelve una lista de suscripciones

      // Datos simulados para facturación
      return [
        { id: 'SUB001', nombrePlan: 'Plan Premium Anual', fechaContratacion: '2024-05-10', fechaVencimiento: '2025-05-09', estado: 'Pagada', monto: '500.00 USD' },
        { id: 'SUB002', nombrePlan: 'Plan Mensual', fechaContratacion: '2025-04-15', fechaVencimiento: '2025-05-14', estado: 'Pendiente de Cobrar', monto: '50.00 USD' },
        { id: 'SUB003', nombrePlan: 'Plan Trimestral', fechaContratacion: '2024-01-01', fechaVencimiento: '2024-03-31', estado: 'Cancelada', monto: '135.00 USD' }
      ];
    } catch (error) {
      console.error('Error al obtener datos de facturación:', error);
      throw error; // Re-lanzar el error para que el llamador lo maneje
    }
  },

  // Manejar logout
  logoutUser: (req, res, next) => {
    // Capturar información antes del logout para logging
    const userID = req.user ? req.user.UsuarioID : 'No autenticado';
    const userEmail = req.user ? req.user.Email : 'No disponible';
    
    // Destruir completamente la sesión
    req.session.destroy(function(err) {
      if (err) { 
        console.error('Error al cerrar sesión:', err);
        return next(err); 
      }
      
      // Log seguro de logout
      console.log('Usuario cerró sesión:', {
        userID,
        email: userEmail.substring(0, 3) + '***@' + (userEmail.includes('@') ? userEmail.split('@')[1] : 'dominio.com'),
        timestamp: new Date().toISOString(),
        ip: req.ip
      });
      
      // Borrar cookie de sesión
      res.clearCookie('modofit_session');
      
      // Redireccionar con mensaje de éxito (usando query parameter en lugar de flash, que requiere sesión)
      res.redirect('/usuario/login?mensaje=logout_exitoso');
    });
  }
};
