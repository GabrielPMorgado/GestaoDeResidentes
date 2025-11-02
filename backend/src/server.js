const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const residentesRoutes = require('./routes/residentes');
const profissionaisRoutes = require('./routes/profissionais');
const agendamentosRoutes = require('./routes/agendamentos');

// Importar models para definir relacionamentos
const Residente = require('./models/Residente');
const Profissional = require('./models/Profissional');
const Agendamento = require('./models/Agendamento');

// Definir relacionamentos
Residente.hasMany(Agendamento, { foreignKey: 'residente_id', as: 'agendamentos' });
Agendamento.belongsTo(Residente, { foreignKey: 'residente_id', as: 'Residente' });

Profissional.hasMany(Agendamento, { foreignKey: 'profissional_id', as: 'agendamentos' });
Agendamento.belongsTo(Profissional, { foreignKey: 'profissional_id', as: 'Profissional' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: '🏠 API Sistema Residencial - Online',
    version: '1.0.0',
    endpoints: {
      residentes: '/api/residentes',
      profissionais: '/api/profissionais',
      agendamentos: '/api/agendamentos'
    }
  });
});

// Rotas
app.use('/api/residentes', residentesRoutes);
app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/agendamentos', agendamentosRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Sincronizar banco de dados e iniciar servidor
const iniciarServidor = async () => {
  try {
    // Sincronizar modelos com o banco (não sobrescreve tabelas existentes)
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados com o banco de dados');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api/residentes`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;
