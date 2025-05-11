const { sequelize } = require('../database/conexionsqualize');
const { QueryTypes } = require('sequelize');

/**
 * Controller for rendering views
 */
module.exports = {
  /**
   * Render home page
   */
  renderHome: (req, res) => {
    res.render('index', {
      title: 'ModoFit - Tu gimnasio de confianza',
      currentPage: 'home'
    });
  },

  /**
   * Render registration page
   */
  renderRegistro: (req, res) => {
    res.render('registro', {
      title: 'Registro - ModoFit',
      currentPage: 'registro'
    });
  },

  /**
   * Render confirmation page
   */
  renderConfirmacion: (req, res) => {
    const { plan, descuento } = req.query;
    
    res.render('confirmacion', {
      title: 'Confirmación de Pago - ModoFit',
      plan: plan || 'modofit',
      descuento: descuento === 'true',
      currentPage: 'confirmacion'
    });
  },

  /**
   * Render privacy policy page
   */
  renderPoliticaPrivacidad: (req, res) => {
    res.render('politica_privacidad', {
      title: 'Política de Privacidad - ModoFit',
      currentPage: 'politica_privacidad'
    });
  },

  /**
   * Render terms and conditions page
   */
  renderTerminosCondiciones: (req, res) => {
    res.render('terminos_y_condiciones', {
      title: 'Términos y Condiciones - ModoFit',
      currentPage: 'terminos_y_condiciones'
    });
  },

  /**
   * Render dashboard page with user info
   */
  renderDashboard: async (req, res) => {
    try {
      // This would be used if user authentication is implemented
      // const userId = req.user.id;
      
      // Example: fetching data from database with stored procedure
      // const userData = await sequelize.query(
      //   'EXECUTE pa_SelUsuarioInfo :user_id',
      //   {
      //     type: QueryTypes.SELECT,
      //     replacements: { user_id: userId }
      //   }
      // );
      
      res.render('dashboard', {
        title: 'Dashboard - ModoFit',
        currentPage: 'dashboard',
        // user: userData[0]
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el dashboard');
      res.redirect('/');
    }
  },

  /**
   * Render error 404 page
   */
  renderNotFound: (req, res) => {
    res.status(404).render('404', {
      title: 'Página no encontrada - ModoFit',
      layout: 'layouts/error'
    });
  }
};