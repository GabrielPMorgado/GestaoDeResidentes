const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profissional = sequelize.define('Profissional', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único do profissional'
  },
  
  // Dados Pessoais
  nome_completo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nome completo do profissional'
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
    comment: 'Sexo do profissional'
  },
  estado_civil: {
    type: DataTypes.ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro'),
    allowNull: true,
    comment: 'Estado civil'
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone fixo'
  },
  celular: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Celular (obrigatório)'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    },
    comment: 'E-mail do profissional'
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
  
  // Dados Profissionais
  profissao: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Profissão (médico, enfermeiro, etc)'
  },
  registro_profissional: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'CRM, COREN, CRO, etc'
  },
  especialidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Especialidade profissional'
  },
  data_admissao: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Data de admissão na instituição'
  },
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Cargo ocupado'
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Departamento de trabalho'
  },
  turno: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Turno de trabalho'
  },
  salario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Salário base'
  },
  
  // Contato de Emergência
  nome_emergencia: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nome do contato de emergência'
  },
  parentesco_emergencia: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Parentesco com o profissional'
  },
  telefone_emergencia: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone de emergência'
  },
  
  // Documentação
  titulo_eleitor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número do título de eleitor'
  },
  numero_pis: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número PIS/PASEP'
  },
  carteira_trabalho: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número da carteira de trabalho'
  },
  
  // Informações Administrativas
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'licenca', 'ferias'),
    defaultValue: 'ativo',
    comment: 'Status do profissional'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações gerais'
  }
}, {
  tableName: 'profissionais',
  timestamps: true,
  createdAt: 'data_cadastro',
  updatedAt: 'data_atualizacao',
  indexes: [
    { fields: ['cpf'] },
    { fields: ['nome_completo'] },
    { fields: ['profissao'] },
    { fields: ['departamento'] },
    { fields: ['status'] },
    { fields: ['data_admissao'] },
    { fields: ['data_cadastro'] }
  ]
});

module.exports = Profissional;
