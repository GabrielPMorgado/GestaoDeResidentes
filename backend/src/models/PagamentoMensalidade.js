const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const Residente = require('./Residente')

const PagamentoMensalidade = sequelize.define('PagamentoMensalidade', {
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
    },
    onDelete: 'CASCADE'
  },
  valor_mensalidade: {
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
  data_vencimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_pagamento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendente', 'pago', 'atrasado', 'cancelado'),
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
  }
}, {
  tableName: 'pagamentos_mensalidades',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  indexes: [
    {
      unique: true,
      fields: ['residente_id', 'mes_referencia', 'ano_referencia'],
      name: 'unique_mensalidade'
    }
  ]
})

PagamentoMensalidade.belongsTo(Residente, {
  foreignKey: 'residente_id',
  as: 'residente'
})

module.exports = PagamentoMensalidade
