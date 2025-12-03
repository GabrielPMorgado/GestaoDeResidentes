const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profissional_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'profissionais',
      key: 'id'
    },
    comment: 'ID do profissional associado (null para admin)'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('admin', 'profissional'),
    allowNull: false,
    defaultValue: 'profissional',
    comment: 'Tipo de usuário: admin (acesso total) ou profissional (acesso limitado)'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_acesso: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    }
  }
});

// Método para validar senha
Usuario.prototype.validarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

module.exports = Usuario;
