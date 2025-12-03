const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const rateLimiter = require('./middlewares/rateLimiter');

// Importar rotas
const authRoutes = require('./routes/auth');
const residentesRoutes = require('./routes/residentes');
const profissionaisRoutes = require('./routes/profissionais');
const agendamentosRoutes = require('./routes/agendamentos');
const historicoConsultasRoutes = require('./routes/historicoConsultas');
const financeiroRoutes = require('./routes/financeiro');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares globais
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Rate limiting (proteção contra abuso)
app.use('/api', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 200,
  message: 'Muitas requisições. Tente novamente em alguns minutos.'
}));

// Rota de health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏠 API Sistema Residencial - Online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      residentes: '/api/residentes',
      profissionais: '/api/profissionais',
      agendamentos: '/api/agendamentos',
      historicoConsultas: '/api/historico-consultas',
      financeiro: '/api/financeiro'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/residentes', residentesRoutes);
app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/historico-consultas', historicoConsultasRoutes);
app.use('/api/financeiro', financeiroRoutes);

// Middleware para rotas não encontradas (404)
app.use(notFound);

// Middleware de tratamento de erros global
app.use(errorHandler);

// Sincronizar banco de dados e iniciar servidor
const iniciarServidor = async () => {
  try {
    // Sincronizar tabelas sem apagar dados existentes
    console.log('🔄 Sincronizando banco de dados...');
    await sequelize.sync({ alter: false });
    console.log('✅ Banco de dados sincronizado com sucesso!');
    console.log('📋 Tabelas: residentes, profissionais, agendamentos, historico_consultas');
    console.log('💰 Tabelas financeiras: despesas_gerais, pagamentos_mensalidades, pagamentos_salarios');
    
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`   Servidor rodando na porta ${PORT}`);
      console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀 ========================================\n');
      console.log(`📍 URL Base: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 API Docs: http://localhost:${PORT}/api`);
      console.log('\n💡 Endpoints disponíveis:');
      console.log('   - GET/POST    /api/residentes');
      console.log('   - GET/POST    /api/profissionais');
      console.log('   - GET/POST    /api/agendamentos');
      console.log('   - GET/POST    /api/historico-consultas');
      console.log('   - GET/POST    /api/financeiro/*');
      console.log('\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recebido. Encerrando servidor graciosamente...');
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        sequelize.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    console.error('Detalhes:', error.message);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

iniciarServidor();

module.exports = app;
