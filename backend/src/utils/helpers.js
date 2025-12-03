const Residente = require('../models/Residente');
const Profissional = require('../models/Profissional');

/**
 * Verifica se CPF já existe em residentes ou profissionais
 * @param {string} cpf - CPF a ser verificado
 * @param {number} excludeId - ID a ser excluído da verificação (para updates)
 * @param {string} tipoExcluir - 'residente' ou 'profissional' para excluir da verificação
 * @returns {Promise<{existe: boolean, mensagem: string}>}
 */
const verificarCpfExistente = async (cpf, excludeId = null, tipoExcluir = null) => {
  try {
    // Verificar em residentes
    if (tipoExcluir !== 'residente') {
      const whereResidente = { cpf };
      if (excludeId && tipoExcluir === 'residente') {
        whereResidente.id = { [require('sequelize').Op.ne]: excludeId };
      }
      
      const residenteExistente = await Residente.findOne({ where: whereResidente });
      if (residenteExistente) {
        return { existe: true, mensagem: 'CPF já cadastrado como residente!' };
      }
    }

    // Verificar em profissionais
    if (tipoExcluir !== 'profissional') {
      const whereProfissional = { cpf };
      if (excludeId && tipoExcluir === 'profissional') {
        whereProfissional.id = { [require('sequelize').Op.ne]: excludeId };
      }
      
      const profissionalExistente = await Profissional.findOne({ where: whereProfissional });
      if (profissionalExistente) {
        return { existe: true, mensagem: 'CPF já cadastrado como profissional!' };
      }
    }

    return { existe: false, mensagem: '' };
  } catch (error) {
    throw error;
  }
};

/**
 * Verifica se RG já existe em residentes ou profissionais
 * @param {string} rg - RG a ser verificado
 * @param {number} excludeId - ID a ser excluído da verificação (para updates)
 * @param {string} tipoExcluir - 'residente' ou 'profissional' para excluir da verificação
 * @returns {Promise<{existe: boolean, mensagem: string}>}
 */
const verificarRgExistente = async (rg, excludeId = null, tipoExcluir = null) => {
  if (!rg) return { existe: false, mensagem: '' };

  try {
    // Verificar em residentes
    if (tipoExcluir !== 'residente') {
      const whereResidente = { rg };
      if (excludeId && tipoExcluir === 'residente') {
        whereResidente.id = { [require('sequelize').Op.ne]: excludeId };
      }
      
      const residenteExistente = await Residente.findOne({ where: whereResidente });
      if (residenteExistente) {
        return { existe: true, mensagem: 'RG já cadastrado como residente!' };
      }
    }

    // Verificar em profissionais
    if (tipoExcluir !== 'profissional') {
      const whereProfissional = { rg };
      if (excludeId && tipoExcluir === 'profissional') {
        whereProfissional.id = { [require('sequelize').Op.ne]: excludeId };
      }
      
      const profissionalExistente = await Profissional.findOne({ where: whereProfissional });
      if (profissionalExistente) {
        return { existe: true, mensagem: 'RG já cadastrado como profissional!' };
      }
    }

    return { existe: false, mensagem: '' };
  } catch (error) {
    throw error;
  }
};

/**
 * Trata erros de validação do Sequelize
 * @param {Error} error - Erro do Sequelize
 * @returns {object} Resposta formatada
 */
const tratarErroValidacao = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const erros = error.errors.map(err => ({
      campo: err.path,
      mensagem: err.message
    }));
    return {
      success: false,
      message: 'Erro de validação',
      erros
    };
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const campo = error.errors[0]?.path || 'campo';
    return {
      success: false,
      message: `${campo.toUpperCase()} já cadastrado no sistema!`
    };
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return {
      success: false,
      message: 'Erro de integridade: registro relacionado não encontrado'
    };
  }

  return {
    success: false,
    message: 'Erro ao processar solicitação',
    error: error.message
  };
};

/**
 * Monta filtros de busca para queries
 * @param {object} params - Parâmetros de busca
 * @param {array} camposBusca - Campos para busca textual
 * @returns {object} Where clause do Sequelize
 */
const montarFiltros = (params, camposBusca = []) => {
  const { Op } = require('sequelize');
  const where = {};

  // Filtros diretos
  const filtrosDiretos = ['status', 'profissao', 'departamento', 'turno', 'tipo_atendimento', 'sexo', 'estado_civil'];
  filtrosDiretos.forEach(campo => {
    if (params[campo]) {
      where[campo] = params[campo];
    }
  });

  // Busca textual
  if (params.busca && camposBusca.length > 0) {
    where[Op.or] = camposBusca.map(campo => ({
      [campo]: { [Op.like]: `%${params.busca}%` }
    }));
  }

  // Filtros de data
  if (params.data_inicio && params.data_fim) {
    where.data_agendamento = {
      [Op.between]: [params.data_inicio, params.data_fim]
    };
  } else if (params.data_inicio) {
    where.data_agendamento = {
      [Op.gte]: params.data_inicio
    };
  } else if (params.data_fim) {
    where.data_agendamento = {
      [Op.lte]: params.data_fim
    };
  }

  return where;
};

/**
 * Calcula paginação
 * @param {number} page - Página atual
 * @param {number} limit - Itens por página
 * @returns {object} Objeto com limit e offset
 */
const calcularPaginacao = (page = 1, limit = 10) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return {
    limit: parseInt(limit),
    offset: Math.max(0, offset)
  };
};

/**
 * Formata resposta de listagem com paginação
 * @param {object} resultado - Resultado do findAndCountAll
 * @param {number} page - Página atual
 * @param {number} limit - Itens por página
 * @returns {object} Resposta formatada
 */
const formatarRespostaPaginada = (resultado, page, limit) => {
  const totalPaginas = Math.ceil(resultado.count / limit);
  
  return {
    success: true,
    data: resultado.rows,
    paginacao: {
      total: resultado.count,
      pagina_atual: parseInt(page),
      itens_por_pagina: parseInt(limit),
      total_paginas: totalPaginas,
      tem_proxima: parseInt(page) < totalPaginas,
      tem_anterior: parseInt(page) > 1
    }
  };
};

/**
 * Logger personalizado para desenvolvimento
 * @param {string} tipo - Tipo de log (info, error, warn)
 * @param {string} mensagem - Mensagem a ser logada
 * @param {any} dados - Dados adicionais
 */
const log = (tipo, mensagem, dados = null) => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev) return;

  const timestamp = new Date().toISOString();
  const prefixos = {
    info: '✅',
    error: '❌',
    warn: '⚠️',
    debug: '🔍'
  };

  const prefixo = prefixos[tipo] || '📝';
  console.log(`${prefixo} [${timestamp}] ${mensagem}`);
  
  if (dados) {
    console.log(JSON.stringify(dados, null, 2));
  }
};

module.exports = {
  verificarCpfExistente,
  verificarRgExistente,
  tratarErroValidacao,
  montarFiltros,
  calcularPaginacao,
  formatarRespostaPaginada,
  log
};
