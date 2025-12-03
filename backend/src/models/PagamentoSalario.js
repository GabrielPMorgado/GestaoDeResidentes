const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const Profissional = require('./Profissional')

const PagamentoSalario = sequelize.define('PagamentoSalario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'profissionais',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  mes_referencia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  ano_referencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data_pagamento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendente', 'pago', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  metodo_pagamento: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  horas_trabalhadas: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  bonus: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  descontos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pagamentos_salarios',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  indexes: [
    {
      unique: true,
      fields: ['profissional_id', 'mes_referencia', 'ano_referencia'],
      name: 'unique_salario'
    }
  ]
})

PagamentoSalario.belongsTo(Profissional, {
  foreignKey: 'profissional_id',
  as: 'profissional'
})

module.exports = PagamentoSalario
