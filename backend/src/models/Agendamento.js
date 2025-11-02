const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Agendamento = sequelize.define('Agendamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único do agendamento'
  },
  
  // Relacionamentos
  residente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do residente'
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do profissional'
  },
  
  // Dados do Agendamento
  data_agendamento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Data do agendamento'
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de início'
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de término'
  },
  tipo_atendimento: {
    type: DataTypes.ENUM(
      'consulta_medica',
      'fisioterapia',
      'psicologia',
      'nutricao',
      'enfermagem',
      'terapia_ocupacional',
      'assistencia_social',
      'outro'
    ),
    allowNull: false,
    comment: 'Tipo de atendimento'
  },
  
  // Detalhes
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Título do agendamento'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações adicionais'
  },
  local: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Local do atendimento'
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta'),
    defaultValue: 'agendado',
    comment: 'Status do agendamento'
  },
  motivo_cancelamento: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do cancelamento'
  },
  
  // Timestamps
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'data_cadastro',
    comment: 'Data de criação do registro'
  },
  data_atualizacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'data_atualizacao',
    comment: 'Data da última atualização'
  }
}, {
  tableName: 'agendamentos',
  timestamps: true,
  createdAt: 'data_cadastro',
  updatedAt: 'data_atualizacao',
  indexes: [
    { fields: ['residente_id'] },
    { fields: ['profissional_id'] },
    { fields: ['data_agendamento'] },
    { fields: ['status'] },
    { fields: ['tipo_atendimento'] },
    { fields: ['data_agendamento', 'hora_inicio'] }
  ]
});

module.exports = Agendamento;
