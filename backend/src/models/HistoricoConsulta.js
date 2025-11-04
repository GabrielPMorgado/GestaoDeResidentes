const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const HistoricoConsulta = sequelize.define('HistoricoConsulta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  residente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'residentes',
      key: 'id'
    }
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'profissionais',
      key: 'id'
    }
  },
  agendamento_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'agendamentos',
      key: 'id'
    }
  },
  data_consulta: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tipo_consulta: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'realizada'
  }
}, {
  tableName: 'historico_consultas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = HistoricoConsulta
