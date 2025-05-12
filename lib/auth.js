/**
 * Authentication middleware
 * Provee funciones para proteger rutas y verificar permisos de usuario
 */

const { sanitizeInput } = require('./validation');

module.exports = {
  /**
   * Asegura que el usuario esté autenticado para acceder a rutas protegidas
   * Redirige a login si no está autenticado
   */
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
      // Registrar acceso a ruta protegida para auditoría
      if (process.env.NODE_ENV === 'development') {
        console.log('Acceso a ruta protegida:', {
          path: req.path,
          method: req.method,
          userId: req.user.UsuarioID,
          timestamp: new Date().toISOString(),
          ip: req.ip
        });
      }
      
      // Verificar si la sesión ha expirado (opcional, ya que express-session lo maneja)
      if (req.session && req.session.cookie && req.session.cookie.expires) {
        const now = new Date();
        const expires = new Date(req.session.cookie.expires);
        
        if (now > expires) {
          // La sesión ha expirado, forzar logout
          req.logout((err) => {
            if (err) console.error('Error al cerrar sesión expirada:', err);
            req.flash('error_msg', 'Su sesión ha expirado. Por favor inicie sesión nuevamente.');
            return res.redirect('/usuario/login');
          });
          return;
        }
      }
      
      // Si está autenticado y la sesión es válida, continuar
      return next();
    }
    
    // Almacenar la URL original para redireccionar después del login (excepto para API)
    if (!req.path.startsWith('/api') && req.method === 'GET') {
      req.session.returnTo = sanitizeInput(req.originalUrl);
    }
    
    // Si es una solicitud de API, devolver error JSON en lugar de redireccionar
    if (req.path.startsWith('/api') || req.accepts('json')) {
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Debe iniciar sesión para acceder a este recurso'
      });
    }
    
    // Para solicitudes web normales, redireccionar a login
    req.flash('error_msg', 'Por favor, inicie sesión para ver este recurso.');
    res.redirect('/usuario/login');
  },
  
  /**
   * Redirige a los usuarios ya autenticados a su dashboard
   * Permite a usuarios no autenticados continuar a la vista solicitada
   */
  forwardAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/usuario/dashboard');
  },
  
  /**
   * Verifica si el usuario tiene rol de administrador
   * Redirige a una página de acceso denegado si no es administrador
   */
  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user && req.user.TipoUsuario === 'Admin') {
      return next();
    }
    
    // Registrar intento de acceso no autorizado
    console.log('Intento de acceso a ruta de administrador:', {
      path: req.path,
      method: req.method,
      userId: req.user ? req.user.UsuarioID : 'No autenticado',
      userType: req.user ? req.user.TipoUsuario : 'N/A',
      timestamp: new Date().toISOString(),
      ip: req.ip
    });
    
    // Si es una solicitud de API, devolver error JSON
    if (req.path.startsWith('/api') || req.accepts('json')) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'No tiene permisos para acceder a este recurso'
      });
    }
    
    // Para solicitudes web normales, mostrar acceso denegado
    req.flash('error_msg', 'No tiene permisos para acceder a esta página.');
    res.redirect('/');
  },
  
  /**
   * Verifica si el usuario tiene permisos sobre un recurso específico
   * Comprueba que el ID de recurso coincida con el ID de usuario o que sea admin
   * @param {string} paramName - Nombre del parámetro que contiene el ID del recurso
   */
  hasResourceAccess: (paramName) => {
    return (req, res, next) => {
      // Si no está autenticado, denegar acceso
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          mensaje: 'Debe iniciar sesión para acceder a este recurso'
        });
      }
      
      // El administrador siempre tiene acceso
      if (req.user.TipoUsuario === 'Admin') {
        return next();
      }
      
      // Obtener el ID del recurso de los parámetros de la ruta o query
      const resourceId = req.params[paramName] || req.query[paramName];
      
      // Validar que el ID del recurso exista y coincida con el ID del usuario
      if (!resourceId || parseInt(resourceId) !== req.user.UsuarioID) {
        // Registrar intento de acceso no autorizado a recurso
        console.log('Intento de acceso no autorizado a recurso:', {
          path: req.path,
          method: req.method,
          userId: req.user.UsuarioID,
          resourceId: resourceId,
          timestamp: new Date().toISOString(),
          ip: req.ip
        });
        
        // Si es una solicitud de API, devolver error JSON
        if (req.path.startsWith('/api') || req.accepts('json')) {
          return res.status(403).json({
            error: 'Acceso denegado',
            mensaje: 'No tiene permisos para acceder a este recurso'
          });
        }
        
        // Para solicitudes web normales, mostrar acceso denegado
        req.flash('error_msg', 'No tiene permisos para acceder a este recurso.');
        return res.redirect('/');
      }
      
      // Si tiene permisos, continuar
      next();
    };
  }
};