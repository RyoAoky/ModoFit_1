const { sequelize } = require('../database/conexionsqualize');
const { QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * Controller for sales operations
 */
module.exports = {
  /**
   * Process payment and generate a new sale
   */
  procesarPago: async (req, res) => {
    try {
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
      } = req.body;

      // Generate unique order ID
      const ordenId = uuidv4();
      
      // Example: store sale information in database using stored procedure
      // const result = await sequelize.query(
      //   `EXECUTE pa_InsVenta 
      //     :orden_id, 
      //     :nombre, 
      //     :apellido, 
      //     :email, 
      //     :telefono, 
      //     :dni, 
      //     :direccion, 
      //     :ciudad, 
      //     :fecha_nacimiento, 
      //     :genero, 
      //     :plan_seleccionado, 
      //     :precio_total, 
      //     :descuento_aplicado`,
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

      // Redirect to confirmation page
      res.redirect(`/confirmacion?plan=${planSeleccionado}&descuento=${descuentoAplicado}`);
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al procesar el pago');
      res.redirect('/registro');
    }
  },

  /**
   * Get plan details
   */
  obtenerPlanDetalles: async (req, res) => {
    try {
      const { plan_id } = req.query;

      // Example: get plan details from database using stored procedure
      // const result = await sequelize.query(
      //   'EXECUTE pa_SelPlanDetalles :plan_id',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: { plan_id: plan_id }
      //   }
      // );

      // Mock result for demonstration
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

      res.json(planDetalles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener detalles del plan: ' + error.message });
    }
  },

  /**
   * Apply discount code
   */
  aplicarDescuento: async (req, res) => {
    try {
      const { codigo } = req.body;

      // Example: validate discount code using stored procedure
      // const result = await sequelize.query(
      //   'EXECUTE pa_ValidarDescuento :codigo',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: { codigo: codigo }
      //   }
      // );

      // Mock validation for demonstration
      let descuentoValido = false;
      let montoDescuento = 0;
      
      if (codigo.toUpperCase() === 'MODOFIT20') {
        descuentoValido = true;
        montoDescuento = 20.00;
      }

      res.json({
        valido: descuentoValido,
        monto: montoDescuento,
        mensaje: descuentoValido 
          ? 'Descuento aplicado correctamente' 
          : 'Código de descuento inválido'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al aplicar descuento: ' + error.message });
    }
  },

  /**
   * Get user membership status
   */
  consultarMembresia: async (req, res) => {
    try {
      const { usuario_id } = req.query;

      // Example: get membership status from database using stored procedure
      // const result = await sequelize.query(
      //   'EXECUTE pa_SelMembresiaEstado :usuario_id',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: { usuario_id: usuario_id }
      //   }
      // );
      
      // Mock result for demonstration
      const estadoMembresia = {
        activa: true,
        plan: 'Membresía ModoFit',
        inicio: '2023-01-01',
        vencimiento: '2023-02-01',
        renovacionAutomatica: true
      };

      res.json(estadoMembresia);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al consultar membresía: ' + error.message });
    }
  }
};