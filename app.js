require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Initialize app
const app = express();

// Security middleware con configuración mejorada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'unpkg.com', 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'unpkg.com', 'cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'images.unsplash.com', 'randomuser.me'],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", 'www.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      // Añadir directivas de seguridad adicionales
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      manifestSrc: ["'self'"]
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  // Añadir cabeceras adicionales de seguridad
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  originAgentCluster: true
}));

// Parse body and cookies con límites mejorados y validación
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10kb' 
}));
app.use(express.json({ 
  limit: '10kb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'modofit-cookie-secret-key'));
app.use(methodOverride('_method'));

// Prevenir parameter pollution con whitelist de parámetros permitidos para duplicarse
app.use(hpp({
  whitelist: ['plan', 'categoria'] // Permitir duplicados solo en parámetros específicos
}));

// Compress responses
app.use(compression());

// Rate limiting mejorado con distintos límites según rutas
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limitar cada IP a 100 solicitudes por ventana
  standardHeaders: true, // Devolver info de límite en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar los headers `X-RateLimit-*`
  message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos',
  keyGenerator: (req) => req.ip // Usar IP como identificador
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 intentos por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiados intentos de inicio de sesión, por favor intente más tarde',
  keyGenerator: (req) => req.ip
});

app.use('/api', apiLimiter);
app.use('/usuario/login', loginLimiter);

// Logger for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Configuración de sesión mejorada con mayor seguridad
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'modofit-session-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'modofit_session', // Nombre personalizado para la cookie de sesión
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: 'lax', // Protección contra CSRF
    path: '/'
  }
};

// En producción, usar almacén de sesiones más seguro (comentado por ahora)
/*
if (process.env.NODE_ENV === 'production') {
  const RedisStore = require('connect-redis').default;
  const { createClient } = require('redis');
  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
  
  sessionConfig.store = new RedisStore({ client: redisClient });
}
*/

app.use(session(sessionConfig));

// Flash messages
app.use(flash());

// Importar el módulo CSRF personalizado
const csrfModule = require('./lib/csrf');

// Aplicar protección CSRF a rutas que modifican estado
app.use(csrfModule.protect);

// Asignar token CSRF a todas las vistas y otras variables locales
app.use(csrfModule.generateTokenMiddleware);

// Añadir helpers de CSRF a variables locales
app.use((req, res, next) => {
  // Función helper para crear campos ocultos con CSRF token
  res.locals.csrfField = () => csrfModule.createHiddenInput(req.session?.csrfToken || '');
  next();
});

// Agregar mensajes flash y variables comunes a las vistas
app.use((req, res, next) => {
  // Mensajes flash
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  
  // Usuario actual
  res.locals.user = req.user || null;
  
  // Variables de entorno seguras para las vistas
  res.locals.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_VERSION: process.env.APP_VERSION || '1.0.0'
  };
  
  // Funciones de escape para XSS
  res.locals.escapeJS = (text) => {
    if (!text) return '';
    return JSON.stringify(text).slice(1, -1)
      .replace(/</g, '\u003c')
      .replace(/>/g, '\u003e');
  };
  
  next();
});

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const mainRoutes = require('./routes/main');
const ventaRoutes = require('./routes/venta');
const usuarioRoutes = require('./routes/usuario'); // Importar rutas de usuario

// Initialize Passport and session
const passport = require('passport');
require('./config/passport')(passport); // Configuración de Passport

app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/', mainRoutes);
app.use('/venta', ventaRoutes);
app.use('/usuario', usuarioRoutes); // Usar rutas de usuario

// 404 Error handler
app.use((req, res, next) => {
  res.status(404).render('404', { 
    title: 'Página no encontrada',
    layout: 'layouts/error'
  });
});

// Manejador de errores global mejorado
app.use((err, req, res, next) => {
  // Logging estructurado de errores
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.UsuarioID : 'no autenticado'
  };
  
  // Log completo en desarrollo, reducido en producción
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR DETALLADO:', errorLog);
  } else {
    // En producción omitir datos sensibles
    delete errorLog.stack;
    console.error('ERROR:', errorLog);
    
    // Opcionalmente guardar en archivo o enviar a un servicio de monitoreo
    try {
      fs.appendFileSync(
        path.join(__dirname, 'logs', 'errors.log'),
        JSON.stringify(errorLog) + '\n'
      );
    } catch (e) {
      console.error('Error al guardar log:', e);
    }
  }
  
  // CSRF errors - Manejador mejorado
  if (err.code === 'EBADCSRFTOKEN') {
    // Regenerar token para el próximo intento
    csrfModule.regenerateToken(req);
    
    // Manejar según el tipo de solicitud
    
    // Para formularios de registro, redirigir a la página de registro
    if (req.path === '/venta/procesar-pago') {
      req.flash('error_msg', err.isExpired 
        ? 'La sesión ha expirado. Por favor, complete el formulario nuevamente.'
        : 'Error de seguridad en el formulario. Se ha generado un nuevo token. Por favor, inténtelo nuevamente.');
      return res.redirect('/registro');
    }
    
    // Para API endpoints, responder con JSON
    if (req.path.startsWith('/api') || req.accepts('json')) {
      return res.status(403).json({
        error: 'Token de seguridad inválido',
        message: err.isExpired 
          ? 'Su sesión ha expirado. Por favor, recargue la página e intente nuevamente.' 
          : 'Error de validación de seguridad. Por favor, recargue la página e intente nuevamente.'
      });
    }
    
    // Para formularios web normales
    return res.status(403).render('error', {
      title: 'Error de seguridad',
      message: err.isExpired 
        ? 'Su sesión ha expirado. Por favor, regrese y complete el formulario nuevamente.' 
        : 'Ha ocurrido un error de seguridad en el formulario. Por favor, regrese e intente nuevamente.',
      error: process.env.NODE_ENV === 'development' ? err : {},
      layout: 'layouts/error'
    });
  }
  
  // Manejo de otros tipos de errores
  
  // Para API endpoints
  if (req.path.startsWith('/api') || req.accepts('json')) {
    return res.status(err.status || 500).json({
      error: 'Error del servidor',
      message: process.env.NODE_ENV === 'production' 
        ? 'Ha ocurrido un error inesperado' 
        : err.message
    });
  }
  
  // Para solicitudes web normales
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: err.status === 404 
      ? 'Página no encontrada' 
      : 'Ha ocurrido un error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err : {},
    layout: 'layouts/error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});