const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const DespesaGeral = sequelize.define('DespesaGeral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descricao: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  categoria: {
    type: DataTypes.ENUM('Operacional', 'Utilidades', 'Alimentação', 'Saúde', 'Manutenção', 'Comunicação', 'Outros'),
    allowNull: false,
    defaultValue: 'Outros'
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  data_despesa: {
    type: DataTypes.DATEONLY,
    allowNull: false
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
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_pagamento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'despesas_gerais',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
})

module.exports = DespesaGeral
