/**
 * Módulo de logger para la aplicación ModoFit
 * Implementa logging estructurado, rotación de archivos y diferentes niveles de log
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { format } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Asegurar que el directorio de logs exista
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Función para sanitizar información sensible antes de loggear
const sanitizeData = (info) => {
  if (!info || typeof info !== 'object') return info;
  
  const sanitized = { ...info };
  
  // Sanitizar contraseñas
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.passwordHash) sanitized.passwordHash = '[REDACTED]';
  if (sanitized.body && sanitized.body.password) sanitized.body.password = '[REDACTED]';
  
  // Sanitizar emails (mostrar solo dominio)
  if (sanitized.email && typeof sanitized.email === 'string') {
    const parts = sanitized.email.split('@');
    if (parts.length > 1) {
      sanitized.email = parts[0].substring(0, 3) + '***@' + parts[1];
    }
  }
  
  // Sanitizar tokens
  if (sanitized.token) sanitized.token = '[REDACTED]';
  if (sanitized.csrfToken) sanitized.csrfToken = '[REDACTED]';
  if (sanitized.sessionID) sanitized.sessionID = '[REDACTED]';
  
  return sanitized;
};

// Formato personalizado para logs de consola
const consoleFormat = printf(({ level, message, timestamp, ...rest }) => {
  const sanitizedRest = sanitizeData(rest);
  const metadata = Object.keys(sanitizedRest).length > 0 
    ? `\n${JSON.stringify(sanitizedRest, null, 2)}` 
    : '';
  
  return `${timestamp} ${level}: ${message}${metadata}`;
});

// Formato para logs de archivo (JSON estructurado)
const fileFormat = combine(
  format(info => {
    info.environment = process.env.NODE_ENV || 'development';
    info.app_version = process.env.npm_package_version || '1.0.0';
    return info;
  })(),
  format(info => {
    info = sanitizeData(info);
    return info;
  })(),
  timestamp(),
  json()
);

// Configuración de transports
const transports = [];

// Transport para consola (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      )
    })
  );
}

// Transport para archivo de logs combinados
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

// Transport específico para errores
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

// Transport específico para logs de seguridad
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'security.log'),
    level: 'warn',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

// Crear instancia del logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports,
  // No detener la aplicación en caso de error al logging
  exitOnError: false
});

// Logs relacionados con seguridad
const securityLogger = {
  // Intentos de autenticación
  logAuthAttempt: (success, data) => {
    const level = success ? 'info' : 'warn';
    logger.log({
      level,
      message: success ? 'Autenticación exitosa' : 'Intento de autenticación fallido',
      security: true,
      category: 'authentication',
      ...data
    });
  },
  
  // Eventos CSRF
  logCSRF: (data) => {
    logger.warn({
      message: 'Error de validación CSRF',
      security: true,
      category: 'csrf',
      ...data
    });
  },
  
  // Accesos no autorizados
  logUnauthorized: (data) => {
    logger.warn({
      message: 'Intento de acceso no autorizado',
      security: true,
      category: 'authorization',
      ...data
    });
  },
  
  // Actividades sospechosas
  logSuspicious: (data) => {
    logger.warn({
      message: 'Actividad sospechosa detectada',
      security: true,
      category: 'suspicious',
      ...data
    });
  },
  
  // Cambios en datos sensibles
  logSensitiveDataChange: (data) => {
    logger.info({
      message: 'Cambio en datos sensibles',
      security: true,
      category: 'data_modification',
      ...data
    });
  }
};

module.exports = {
  logger,
  securityLogger
};
