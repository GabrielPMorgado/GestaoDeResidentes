const Residente = require('./Residente');
const Profissional = require('./Profissional');
const Agendamento = require('./Agendamento');
const HistoricoConsulta = require('./HistoricoConsulta');
const DespesaGeral = require('./DespesaGeral');
const PagamentoMensalidade = require('./PagamentoMensalidade');
const PagamentoSalario = require('./PagamentoSalario');
const Usuario = require('./Usuario');

// Definir relacionamentos centralizados
const setupAssociations = () => {
  // Relacionamentos de Usuario
  Usuario.belongsTo(Profissional, {
    foreignKey: 'profissional_id',
    as: 'profissional'
  });

  Profissional.hasOne(Usuario, {
    foreignKey: 'profissional_id',
    as: 'usuario'
  });

  // Relacionamentos de Residente
  Residente.hasMany(Agendamento, { 
    foreignKey: 'residente_id', 
    as: 'agendamentos',
    onDelete: 'CASCADE'
  });
  
  Residente.hasMany(HistoricoConsulta, { 
    foreignKey: 'residente_id', 
    as: 'historico_consultas',
    onDelete: 'CASCADE'
  });

  // Relacionamentos de Profissional
  Profissional.hasMany(Agendamento, { 
    foreignKey: 'profissional_id', 
    as: 'agendamentos',
    onDelete: 'CASCADE'
  });
  
  Profissional.hasMany(HistoricoConsulta, { 
    foreignKey: 'profissional_id', 
    as: 'historico_consultas',
    onDelete: 'CASCADE'
  });

  // Relacionamentos de Agendamento
  Agendamento.belongsTo(Residente, { 
    foreignKey: 'residente_id', 
    as: 'residente'
  });
  
  Agendamento.belongsTo(Profissional, { 
    foreignKey: 'profissional_id', 
    as: 'profissional'
  });
  
  Agendamento.hasMany(HistoricoConsulta, { 
    foreignKey: 'agendamento_id', 
    as: 'historico_consultas',
    onDelete: 'SET NULL'
  });

  // Relacionamentos de HistoricoConsulta
  HistoricoConsulta.belongsTo(Residente, { 
    foreignKey: 'residente_id', 
    as: 'residente'
  });
  
  HistoricoConsulta.belongsTo(Profissional, { 
    foreignKey: 'profissional_id', 
    as: 'profissional'
  });
  
  HistoricoConsulta.belongsTo(Agendamento, { 
    foreignKey: 'agendamento_id', 
    as: 'agendamento'
  });

  // Relacionamentos Financeiros
  PagamentoMensalidade.belongsTo(Residente, {
    foreignKey: 'residente_id',
    as: 'residente_mensalidade'
  });

  Residente.hasMany(PagamentoMensalidade, {
    foreignKey: 'residente_id',
    as: 'mensalidades'
  });

  PagamentoSalario.belongsTo(Profissional, {
    foreignKey: 'profissional_id',
    as: 'profissional_salario'
  });

  Profissional.hasMany(PagamentoSalario, {
    foreignKey: 'profissional_id',
    as: 'salarios'
  });
};

// Inicializar relacionamentos
setupAssociations();

module.exports = {
  Residente,
  Profissional,
  Agendamento,
  HistoricoConsulta,
  DespesaGeral,
  PagamentoMensalidade,
  PagamentoSalario,
  Usuario,
  setupAssociations
};
