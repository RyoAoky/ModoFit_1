/**
 * Módulo de validación y sanitización de datos
 * Proporciona funciones para validar y sanitizar los datos de entrada
 */

const validator = require('validator');

/**
 * Sanitiza una cadena de texto para prevenir XSS y otros ataques
 * @param {string} input - Cadena de texto a sanitizar
 * @returns {string} - Cadena sanitizada
 */
const sanitizeInput = (input) => {
  if (input === null || input === undefined) return '';
  
  // Convertir a string si no lo es
  const str = String(input);
  
  // Escapar HTML para prevenir XSS
  return validator.escape(str.trim());
};

/**
 * Sanitiza un objeto completo de forma recursiva
 * @param {object} obj - Objeto a sanitizar
 * @returns {object} - Objeto sanitizado
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result[key] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'object' ? sanitizeObject(item) : typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Valida un valor según un esquema definido y lo sanitiza
 * @param {any} value - Valor a validar
 * @param {object} schema - Esquema de validación
 * @param {string} fieldName - Nombre del campo (para mensajes de error)
 * @returns {object} - Resultado de la validación {isValid, error, sanitizedValue}
 */
const validateField = (value, schema, fieldName) => {
  const result = {
    isValid: true,
    error: null,
    sanitizedValue: value
  };
  
  // Verificar si es requerido
  if (schema.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      error: `El campo ${fieldName} es requerido`,
      sanitizedValue: null
    };
  }
  
  // Si no es requerido y está vacío, retornar válido
  if (!schema.required && (value === undefined || value === null || value === '')) {
    return result;
  }
  
  // Validar tipo
  if (schema.type) {
    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          result.sanitizedValue = String(value);
        } else {
          result.sanitizedValue = value;
        }
        
        // Sanitizar string
        result.sanitizedValue = sanitizeInput(result.sanitizedValue);
        
        // Validar longitud máxima
        if (schema.maxLength && result.sanitizedValue.length > schema.maxLength) {
          return {
            isValid: false,
            error: `El campo ${fieldName} no debe exceder ${schema.maxLength} caracteres`,
            sanitizedValue: result.sanitizedValue.substring(0, schema.maxLength)
          };
        }
        
        // Validar longitud mínima
        if (schema.minLength && result.sanitizedValue.length < schema.minLength) {
          return {
            isValid: false,
            error: `El campo ${fieldName} debe tener al menos ${schema.minLength} caracteres`,
            sanitizedValue: result.sanitizedValue
          };
        }
        
        // Validar enumeración
        if (schema.enum && !schema.enum.includes(result.sanitizedValue)) {
          return {
            isValid: false,
            error: `El campo ${fieldName} debe ser uno de: ${schema.enum.join(', ')}`,
            sanitizedValue: result.sanitizedValue
          };
        }
        break;
        
      case 'email':
        result.sanitizedValue = String(value).toLowerCase().trim();
        if (!validator.isEmail(result.sanitizedValue)) {
          return {
            isValid: false,
            error: `El campo ${fieldName} debe ser un correo electrónico válido`,
            sanitizedValue: result.sanitizedValue
          };
        }
        break;
        
      case 'number':
        // Convertir a número si es string
        if (typeof value === 'string') {
          result.sanitizedValue = parseFloat(value);
        } else {
          result.sanitizedValue = value;
        }
        
        // Verificar que es un número válido
        if (isNaN(result.sanitizedValue)) {
          return {
            isValid: false,
            error: `El campo ${fieldName} debe ser un número válido`,
            sanitizedValue: 0
          };
        }
        
        // Validar mínimo
        if (schema.min !== undefined && result.sanitizedValue < schema.min) {
          return {
            isValid: false,
            error: `El campo ${fieldName} debe ser mayor o igual a ${schema.min}`,
            sanitizedValue: schema.min
          };
        }
        
        // Validar máximo
        if (schema.max !== undefined && result.sanitizedValue > schema.max) {
          return {
            isValid: false,
            error: `El campo ${fieldName} debe ser menor o igual a ${schema.max}`,
            sanitizedValue: schema.max
          };
        }
        break;
        
      case 'boolean':
        // Convertir a booleano
        if (typeof value === 'string') {
          result.sanitizedValue = value.toLowerCase() === 'true';
        } else {
          result.sanitizedValue = Boolean(value);
        }
        break;
        
      case 'date':
        // Validar que es una fecha válida
        if (value instanceof Date) {
          result.sanitizedValue = value;
        } else {
          // Intentar parsear la fecha
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return {
              isValid: false,
              error: `El campo ${fieldName} debe ser una fecha válida`,
              sanitizedValue: null
            };
          }
          result.sanitizedValue = date;
        }
        break;
        
      default:
        // Tipo no reconocido, mantener el valor original
        break;
    }
  }
  
  return result;
};

/**
 * Valida un objeto completo según un esquema definido
 * @param {object} data - Datos a validar
 * @param {object} schema - Esquema de validación
 * @returns {object} - Resultado de la validación {isValid, errors, sanitizedData}
 */
const validateSchema = (data, schema) => {
  const result = {
    isValid: true,
    errors: [],
    sanitizedData: {}
  };
  
  // Validar cada campo según el esquema
  for (const [field, fieldSchema] of Object.entries(schema)) {
    const fieldResult = validateField(data[field], fieldSchema, field);
    
    if (!fieldResult.isValid) {
      result.isValid = false;
      result.errors.push(fieldResult.error);
    }
    
    result.sanitizedData[field] = fieldResult.sanitizedValue;
  }
  
  return result;
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  validateField,
  validateSchema
};
