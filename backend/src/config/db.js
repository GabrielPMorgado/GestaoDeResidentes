const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração da conexão com MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sistema_residencial',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    
    // Pool de conexões otimizado
    pool: {
      max: 10,              // Máximo de conexões simultâneas
      min: 2,               // Mínimo de conexões mantidas
      acquire: 30000,       // Tempo máximo para adquirir conexão (30s)
      idle: 10000,          // Tempo antes de remover conexão ociosa (10s)
      evict: 1000           // Verificar conexões a cada 1s
    },
    
    // Configurações de timezone e charset
    timezone: '-03:00',     // Fuso horário de Brasília
    
    dialectOptions: {
      charset: 'utf8mb4',
      connectTimeout: 10000 // 10 segundos
    },
    
    // Configurações de retry
    retry: {
      max: 3,               // Tentar 3 vezes antes de falhar
      timeout: 3000
    },
    
    // Definições globais de modelo
    define: {
      charset: 'utf8mb4',
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    
    // Log de informações da conexão em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Database: ${process.env.DB_NAME || 'sistema_residencial'}`);
      console.log(`👤 User: ${process.env.DB_USER || 'root'}`);
      console.log(`🌐 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error.message);
    console.error('💡 Verifique se o MySQL está rodando e as credenciais estão corretas');
    process.exit(1);
  }
};

testConnection();

module.exports = sequelize;
