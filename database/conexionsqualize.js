const dotenv = require('dotenv');
const path = require('path'); // Asegúrate de importar path

// Carga las variables de entorno desde el archivo .env en la raíz del proyecto
const envPath = path.resolve(__dirname, '../.env');
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error('Error cargando el archivo .env:', dotenvResult.error);
  // Considera lanzar un error aquí o manejarlo de forma que la app no intente continuar sin config.
  // throw new Error('No se pudo cargar la configuración del entorno desde .env');
}

console.log('Variables de entorno cargadas:');
console.log('DB_NAME:', process.env.DB_NAME ? 'Definida' : 'NO DEFINIDA');
console.log('DB_USER:', process.env.DB_USER ? 'Definida' : 'NO DEFINIDA');
// No mostrar la contraseña en los logs por seguridad, solo si está definida o no.
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Definida' : 'NO DEFINIDA');
console.log('DB_SERVER:', process.env.DB_SERVER ? 'Definida' : 'NO DEFINIDA');
console.log('DB_PORT:', process.env.DB_PORT ? 'Definida' : 'NO DEFINIDA');
console.log('DB_ENCRYPT:', process.env.DB_ENCRYPT ? process.env.DB_ENCRYPT : 'NO DEFINIDA (usando false por defecto)');
console.log('DB_TRUST_SERVER_CERTIFICATE:', process.env.DB_TRUST_SERVER_CERTIFICATE ? process.env.DB_TRUST_SERVER_CERTIFICATE : 'NO DEFINIDA (usando false por defecto)');


const { Sequelize, QueryTypes, Model, Op, DataTypes, Transaction, Deferrable } = require('sequelize');

let sequelize; // Declara sequelize aquí para que esté en el scope del módulo

// Solo intenta inicializar Sequelize si las variables de entorno esenciales están presentes
if (process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_SERVER) {
  try {
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_SERVER,
        dialect: 'mssql',
        port: parseInt(process.env.DB_PORT) || 1433, // Puerto por defecto para SQL Server si no se especifica
        dialectOptions: {
          options: {
            encrypt: process.env.DB_ENCRYPT === 'true', // Hacer configurable
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', // Hacer configurable
          },
        },
        logging: (msg) => {
          // Solo muestra logs de ejecución si estamos en desarrollo, por ejemplo
          if (process.env.NODE_ENV === 'development' && msg.startsWith('Executing')) {
            console.log(msg);
          }
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    // Test the connection (asíncrono, no bloqueará la carga del módulo)
    sequelize.authenticate()
      .then(() => {
        console.log('Conexión a la base de datos establecida exitosamente (asíncrono).');
      })
      .catch(err => {
        console.error('No se pudo conectar a la base de datos (asíncrono):', err.name, err.message);
      });

  } catch (error) {
    console.error('Error CRÍTICO al inicializar Sequelize:', error);
    // Si Sequelize no se puede inicializar, `sequelize` seguirá siendo undefined.
  }
} else {
  console.error('Faltan variables de entorno críticas para la base de datos (DB_NAME, DB_USER, DB_PASSWORD, DB_SERVER). Sequelize no se inicializará.');
  // `sequelize` seguirá siendo undefined.
}

// Exportar siempre, incluso si sequelize es undefined, para que los `require` no fallen catastróficamente
// pero los controladores deben verificar si sequelize está definido antes de usarlo.
module.exports = { 
  sequelize, // Podría ser undefined si la inicialización falló
  QueryTypes,
  Model,
  Op,
  DataTypes,
  Transaction,
  Deferrable
};