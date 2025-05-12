/**
 * Módulo personalizado para protección CSRF
 * Implementa una solución robusta basada en tokens generados con crypto
 * que se almacenan en la sesión del usuario.
 */

const crypto = require('crypto');

/**
 * Genera un token CSRF criptográficamente seguro
 * @param {number} bytes - Tamaño del token en bytes (por defecto 64 bytes)
 * @returns {string} - Token CSRF en formato hexadecimal
 */
const generateToken = (bytes = 64) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Verifica si un token CSRF ha expirado
 * @param {string} timestamp - Timestamp del token en milisegundos
 * @param {number} maxAge - Edad máxima en milisegundos (por defecto 24 horas)
 * @returns {boolean} - true si el token ha expirado, false en caso contrario
 */
const isTokenExpired = (timestamp, maxAge = 24 * 60 * 60 * 1000) => {
  if (!timestamp) return true;
  
  const now = Date.now();
  const tokenTime = parseInt(timestamp, 10);
  
  return isNaN(tokenTime) || (now - tokenTime) > maxAge;
};

/**
 * Middleware para proteger rutas contra ataques CSRF
 * Verifica que el token proporcionado coincida con el almacenado en la sesión
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const protect = (req, res, next) => {
  // No verificar CSRF en ruta de login
  const isLoginRoute = req.path === '/usuario/login' && req.method === 'POST';
  
  // Solo proteger métodos no seguros (POST, PUT, DELETE, PATCH)
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Buscar el token en el cuerpo, query o cabeceras
    const token = req.body._csrf || 
                  req.query._csrf || 
                  req.headers['x-csrf-token'] || 
                  req.headers['x-xsrf-token'];
    
    // Verificar si la sesión existe
    if (!req.session) {
      console.error('CSRF Error: Session no disponible');
      const error = new Error('Session not available');
      error.code = 'EBADCSRFTOKEN';
      return next(error);
    }
                  
    const storedToken = req.session.csrfToken;
    const storedTimestamp = req.session.csrfTimestamp;
    
    // Registrar información de depuración en desarrollo
    console.log('CSRF Verification:', {
      path: req.path,
      method: req.method,
      tokenReceived: token ? 'Yes' : 'No',
      tokenStored: storedToken ? 'Yes' : 'No',
      timestampStored: storedTimestamp ? 'Yes' : 'No',
      isLoginRoute
    });
    
    // Verificar que el token existe y coincide
    if (!token || !storedToken || token !== storedToken) {
      const error = new Error('Invalid CSRF token');
      error.code = 'EBADCSRFTOKEN';
      error.details = {
        route: req.path,
        method: req.method,
        hasToken: Boolean(token),
        hasStoredToken: Boolean(storedToken)
      };
      return next(error);
    }
    
    // Verificar que el token no ha expirado
    if (isTokenExpired(storedTimestamp)) {
      const error = new Error('Expired CSRF token');
      error.code = 'EBADCSRFTOKEN';
      error.isExpired = true;
      return next(error);
    }
  }
  
  next();
};

/**
 * Middleware para generar y añadir un token CSRF a la respuesta
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const generateTokenMiddleware = (req, res, next) => {
  // Regenerar el token si no existe o está caducado
  if (!req.session.csrfToken || 
      !req.session.csrfTimestamp || 
      isTokenExpired(req.session.csrfTimestamp)) {
    
    req.session.csrfToken = generateToken();
    req.session.csrfTimestamp = Date.now().toString();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Nuevo token CSRF generado para ${req.path}`);
    }
  }
  
  // Añadir token a variables locales para las vistas
  res.locals.csrfToken = req.session.csrfToken;
  
  next();
};

/**
 * Regenera un nuevo token CSRF en la sesión
 * Útil después de errores de validación o para formularios de varios pasos
 * @param {Object} req - Objeto de solicitud Express
 * @returns {string} - El nuevo token generado
 */
const regenerateToken = (req) => {
  if (!req.session) return null;
  
  const newToken = generateToken();
  req.session.csrfToken = newToken;
  req.session.csrfTimestamp = Date.now().toString();
  
  return newToken;
};

/**
 * Obtiene el token CSRF actual de la sesión
 * @param {Object} req - Objeto de solicitud Express
 * @returns {string|null} - El token actual o null si no existe
 */
const getToken = (req) => {
  if (!req.session) return null;
  return req.session.csrfToken || null;
};

/**
 * Crea un campo de formulario oculto con el token CSRF
 * @param {string} token - Token CSRF
 * @returns {string} - HTML para el campo oculto
 */
const createHiddenInput = (token) => {
  return `<input type="hidden" name="_csrf" value="${token}">`;  
};

module.exports = {
  generateToken,
  protect,
  generateTokenMiddleware,
  regenerateToken,
  getToken,
  createHiddenInput,
  isTokenExpired
};