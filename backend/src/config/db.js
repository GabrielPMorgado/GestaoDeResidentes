const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração da conexão com MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sistema_residencial',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desabilita logs SQL no console
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '-03:00' // Fuso horário de Brasília
  }
);

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error.message);
  }
};

testConnection();

module.exports = sequelize;
