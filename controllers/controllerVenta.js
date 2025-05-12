const { sequelize } = require('../database/conexionsqualize');
const { QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const { sanitizeInput, validateSchema } = require('../lib/validation');

/**
 * Controller for sales operations
 */
module.exports = {
  /**
   * Process payment and generate a new sale
   */
  procesarPago: async (req, res) => {
    try {
      // Esquema de validación para pago
      const pagoSchema = {
        nombre: { required: true, type: 'string', maxLength: 50 },
        apellido: { required: true, type: 'string', maxLength: 50 },
        email: { required: true, type: 'email', maxLength: 100 },
        telefono: { required: true, type: 'string', maxLength: 20 },
        dni: { required: true, type: 'string', maxLength: 20 },
        direccion: { required: true, type: 'string', maxLength: 150 },
        ciudad: { required: true, type: 'string', maxLength: 50 },
        fechaNacimiento: { required: true, type: 'date' },
        genero: { required: true, type: 'string', enum: ['M', 'F', 'Otro'] },
        planSeleccionado: { required: true, type: 'string', maxLength: 50 },
        precioTotal: { required: true, type: 'number', min: 0 },
        descuentoAplicado: { required: false, type: 'boolean' }
      };
      
      // Validación completa usando el esquema
      const validationResult = validateSchema(req.body, pagoSchema);
      if (!validationResult.isValid) {
        req.flash('error_msg', `Por favor corrija los siguientes errores: ${validationResult.errors.join(', ')}`);
        return res.redirect('/registro');
      }
      
      // Obtener y sanitizar datos
      const {
        nombre,
        apellido,
        email,
        telefono,
        dni,
        direccion,
        ciudad,
        fechaNacimiento,
        genero,
        planSeleccionado,
        precioTotal,
        descuentoAplicado
      } = validationResult.sanitizedData;
      
      // Validación adicional de formato de email
      if (!validator.isEmail(email)) {
        req.flash('error_msg', 'Por favor ingrese un correo electrónico válido');
        return res.redirect('/registro');
      }
      
      // Validar que el precio total no sea negativo (protección adicional)
      if (precioTotal < 0) {
        console.error('Intento de manipulación de precio detectado:', {
          email,
          precioOriginal: req.body.precioTotal,
          precioValidado: precioTotal,
          ip: req.ip
        });
        req.flash('error_msg', 'Se ha detectado un error en el precio. Por favor, intente nuevamente.');
        return res.redirect('/registro');
      }

      // Generar ID de orden único
      const ordenId = uuidv4();
      
      // Log seguro (sin datos sensibles completos)
      console.log('Procesando pago:', { 
        ordenId,
        email: email.substring(0, 3) + '***@' + email.split('@')[1],
        plan: planSeleccionado,
        precio: precioTotal
      });
      
      // Ejemplo: almacenar información de venta en la base de datos usando procedimiento almacenado
      // NOTA: Cuando se active, usar parámetros con nombres (reemplazos) en lugar de concatenación directa
      // const result = await sequelize.query(
      //   'EXEC pa_InsVenta @orden_id=:orden_id, @nombre=:nombre, @apellido=:apellido, ' +
      //   '@email=:email, @telefono=:telefono, @dni=:dni, @direccion=:direccion, ' +
      //   '@ciudad=:ciudad, @fecha_nacimiento=:fecha_nacimiento, @genero=:genero, ' +
      //   '@plan_seleccionado=:plan_seleccionado, @precio_total=:precio_total, ' +
      //   '@descuento_aplicado=:descuento_aplicado',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: {
      //       orden_id: ordenId,
      //       nombre,
      //       apellido,
      //       email,
      //       telefono,
      //       dni,
      //       direccion,
      //       ciudad,
      //       fecha_nacimiento: fechaNacimiento,
      //       genero,
      //       plan_seleccionado: planSeleccionado,
      //       precio_total: precioTotal,
      //       descuento_aplicado: descuentoAplicado ? 1 : 0
      //     }
      //   }
      // );

      // Redireccionar a página de confirmación con parámetros sanitizados
      req.flash('success_msg', '¡Registro exitoso! Bienvenido a ModoFit.');
      res.redirect(`/confirmacion?plan=${encodeURIComponent(planSeleccionado)}&descuento=${Boolean(descuentoAplicado)}`);
    } catch (error) {
      console.error('Error al procesar pago:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      req.flash('error_msg', 'Error al procesar el pago. Por favor, inténtelo nuevamente.');
      res.redirect('/registro');
    }
  },

  /**
   * Get plan details
   */
  obtenerPlanDetalles: async (req, res) => {
    try {
      // Validar y sanitizar ID del plan
      let { plan_id } = req.query;
      
      // Validación básica
      if (plan_id) {
        plan_id = sanitizeInput(plan_id);
        
        // Solo permitir caracteres alfanuméricos, guiones y guiones bajos
        if (!/^[a-zA-Z0-9_-]+$/.test(plan_id)) {
          return res.status(400).json({ 
            error: 'Formato de ID de plan inválido',
            message: 'El ID del plan contiene caracteres no permitidos' 
          });
        }
      }

      // Log de solicitud
      console.log('Solicitando detalles del plan:', { 
        plan_id: plan_id || 'default', 
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Ejemplo: obtener detalles del plan de la base de datos usando procedimiento almacenado
      // const result = await sequelize.query(
      //   'EXEC pa_SelPlanDetalles @plan_id=:plan_id',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: { plan_id: plan_id || 'default' }
      //   }
      // );

      // Resultado simulado para demostración
      const planDetalles = {
        id: plan_id || 'modofit',
        nombre: 'Membresía ModoFit',
        precio: 49.90,
        matricula: 0.00,
        duracion: '30 días',
        beneficios: [
          'Acceso al gimnasio',
          '2 pases gratis mensual para amigos',
          'Sillón de masajes',
          'Congelar membresía'
        ]
      };

      // Establecer cabeceras de seguridad para la respuesta JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Incluir cabecera para prevenir cacheo de datos sensibles
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.json(planDetalles);
    } catch (error) {
      console.error('Error al obtener detalles del plan:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        ip: req.ip
      });
      
      // No revelar detalles del error interno
      res.status(500).json({ 
        error: 'Error al obtener detalles del plan',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  },

  /**
   * Apply discount code
   */
  aplicarDescuento: async (req, res) => {
    try {
      // Validar entrada
      const { codigo } = req.body;
      
      if (!codigo || typeof codigo !== 'string') {
        return res.status(400).json({ 
          error: 'Código de descuento inválido',
          mensaje: 'Debe proporcionar un código de descuento válido'
        });
      }
      
      // Sanitizar código
      const codigoSanitizado = sanitizeInput(codigo.trim());
      
      // Prevenir inyección SQL o NoSQL usando validación estricta
      if (!/^[A-Za-z0-9_-]{2,20}$/.test(codigoSanitizado)) {
        return res.status(400).json({ 
          error: 'Formato de código inválido',
          mensaje: 'El código contiene caracteres no permitidos o tiene una longitud incorrecta'
        });
      }
      
      // Registrar intento de uso de código de descuento (para análisis de abuso)
      console.log('Validación de código de descuento:', {
        codigo: codigoSanitizado,
        ip: req.ip,
        userAgent: req.get('User-Agent') ? req.get('User-Agent').substring(0, 50) : 'Unknown',
        timestamp: new Date().toISOString()
      });

      // Ejemplo: validar código de descuento usando procedimiento almacenado
      // const result = await sequelize.query(
      //   'EXEC pa_ValidarDescuento @codigo=:codigo',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: { codigo: codigoSanitizado }
      //   }
      // );

      // Validación simulada para demostración
      // Simular verificación con tasa limitada para prevenir ataques de fuerza bruta
      // (En un entorno real, esto estaría en una base de datos con límites de uso)
      let descuentoValido = false;
      let montoDescuento = 0;
      
      if (codigoSanitizado.toUpperCase() === 'MODOFIT20') {
        descuentoValido = true;
        montoDescuento = 20.00;
      }

      // Cabeceras de seguridad para la respuesta JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // No cachear respuesta
      res.setHeader('Cache-Control', 'no-store, private');
      
      res.json({
        valido: descuentoValido,
        monto: montoDescuento,
        mensaje: descuentoValido 
          ? 'Descuento aplicado correctamente' 
          : 'Código de descuento inválido'
      });
    } catch (error) {
      console.error('Error al aplicar descuento:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        ip: req.ip
      });
      
      res.status(500).json({ 
        error: 'Error al procesar el código de descuento',
        mensaje: 'Ha ocurrido un error al validar el código. Por favor, intente nuevamente.'
      });
    }
  },

  /**
   * Get user membership status
   */
  consultarMembresia: async (req, res) => {
    try {
      // Verificar autenticación - esta ruta requiere que el usuario esté autenticado
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          error: 'No autorizado',
          mensaje: 'Debe iniciar sesión para consultar el estado de la membresía'
        });
      }
      
      // Verificar y validar el ID de usuario
      let usuario_id = req.query.usuario_id || req.user.UsuarioID;
      
      // Asegurar que el ID es un número
      if (isNaN(parseInt(usuario_id))) {
        return res.status(400).json({
          error: 'ID de usuario inválido',
          mensaje: 'El ID de usuario proporcionado no es válido'
        });
      }
      
      // Convertir a entero
      usuario_id = parseInt(usuario_id);
      
      // Verificar que el usuario solo pueda consultar su propia membresía,
      // a menos que tenga rol de administrador
      if (usuario_id !== req.user.UsuarioID && req.user.TipoUsuario !== 'Admin') {
        return res.status(403).json({
          error: 'Acceso denegado',
          mensaje: 'No tiene permisos para consultar la membresía de otro usuario'
        });
      }

      // Registrar consulta de membresía
      console.log('Consulta de membresía:', {
        usuario_id,
        consultadoPor: req.user.UsuarioID,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Ejemplo: obtener estado de membresía de la base de datos usando procedimiento almacenado
      // const result = await sequelize.query(
      //   'EXEC pa_SelMembresiaEstado @usuario_id=:usuario_id',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: { usuario_id }
      //   }
      // );
      
      // Resultado simulado para demostración
      const estadoMembresia = {
        activa: true,
        plan: 'Membresía ModoFit',
        inicio: '2023-01-01',
        vencimiento: '2023-02-01',
        renovacionAutomatica: true
      };

      // Cabeceras de seguridad para la respuesta JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, max-age=0');

      res.json(estadoMembresia);
    } catch (error) {
      console.error('Error al consultar membresía:', {
        error: error.message,
        stack: error.stack,
        usuario_id: req.query.usuario_id,
        user: req.user ? req.user.UsuarioID : 'No autenticado',
        path: req.path,
        ip: req.ip
      });
      
      res.status(500).json({ 
        error: 'Error al consultar membresía',
        mensaje: 'Ha ocurrido un error al consultar el estado de su membresía. Por favor, intente nuevamente más tarde.'
      });
    }
  }
};