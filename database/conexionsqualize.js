const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });
const { Sequelize, QueryTypes, Model, Op, DataTypes, Transaction, Deferrable } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    dialect: 'mssql',
    port: parseInt(process.env.DB_PORT) || 10200,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
    logging: (msg) => {
      if (msg.startsWith('Executing')) {
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

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Call the test function
testConnection();

// Export Sequelize instance and data types
module.exports = { 
  sequelize,
  QueryTypes,
  Model,
  Op,
  DataTypes,
  Transaction,
  Deferrable
};