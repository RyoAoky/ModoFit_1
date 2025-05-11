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
const csrf = require('csurf');
const methodOverride = require('method-override');
const path = require('path');

// Initialize app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'unpkg.com', 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'unpkg.com', 'cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'fonts.gstatic.com', 'cdnjs.cloudflare.com','data:'],
      imgSrc: ["'self'", 'data:', 'images.unsplash.com', 'randomuser.me'],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", 'www.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));

// Parse body and cookies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Prevent parameter pollution
app.use(hpp());

// Compress responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Logger for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Flash messages
app.use(flash());

// CSRF Protection
app.use(csrf({ cookie: true }));

// Global variables middleware
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
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

// Use routes
app.use('/', mainRoutes);
app.use('/venta', ventaRoutes);

// 404 Error handler
app.use((req, res, next) => {
  res.status(404).render('404', { 
    title: 'Página no encontrada',
    layout: 'layouts/error'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // CSRF errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      title: 'Error de formulario',
      message: 'Ha ocurrido un error de seguridad. Por favor, intente nuevamente.',
      error: process.env.NODE_ENV === 'development' ? err : {},
      layout: 'layouts/error'
    });
  }
  
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: 'Ha ocurrido un error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err : {},
    layout: 'layouts/error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});