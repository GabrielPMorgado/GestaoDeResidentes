const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Residente = sequelize.define('Residente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único do residente'
  },
  
  // Dados Pessoais
  nome_completo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nome completo do residente'
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Data de nascimento'
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
    comment: 'CPF (formato: 000.000.000-00)'
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Registro Geral (RG)'
  },
  sexo: {
    type: DataTypes.ENUM('masculino', 'feminino', 'outro'),
    allowNull: false,
    comment: 'Sexo do residente'
  },
  estado_civil: {
    type: DataTypes.ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro'),
    allowNull: true,
    comment: 'Estado civil'
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Telefone principal'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'E-mail do residente'
  },
  
  // Endereço
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'CEP (formato: 00000-000)'
  },
  logradouro: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Rua/Avenida'
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Número do endereço'
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Complemento (apto, bloco, etc)'
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Bairro'
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Cidade'
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true,
    comment: 'Estado (UF)'
  },
  
  // Responsável / Contato de Emergência
  nome_responsavel: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nome do responsável/contato emergência'
  },
  parentesco_responsavel: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Parentesco com o residente'
  },
  telefone_responsavel: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Telefone do responsável'
  },
  email_responsavel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'E-mail do responsável'
  },
  
  // Informações Administrativas
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'suspenso'),
    defaultValue: 'ativo',
    comment: 'Status do residente'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações gerais'
  }
}, {
  tableName: 'residentes',
  timestamps: true,
  createdAt: 'data_cadastro',
  updatedAt: 'data_atualizacao',
  indexes: [
    { fields: ['cpf'] },
    { fields: ['nome_completo'] },
    { fields: ['status'] },
    { fields: ['data_cadastro'] }
  ]
});

module.exports = Residente;
