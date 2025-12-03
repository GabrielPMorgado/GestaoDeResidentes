const { Residente, Agendamento, HistoricoConsulta } = require('../models');
const { Op } = require('sequelize');
const {
  verificarCpfExistente,
  verificarRgExistente,
  tratarErroValidacao,
  montarFiltros,
  calcularPaginacao,
  formatarRespostaPaginada,
  log
} = require('../utils/helpers');

// Criar novo residente
exports.criar = async (req, res) => {
  try {
    const { cpf, rg } = req.body;

    // Verificar CPF
    const cpfVerificacao = await verificarCpfExistente(cpf);
    if (cpfVerificacao.existe) {
      return res.status(400).json({
        success: false,
        message: cpfVerificacao.mensagem
      });
    }

    // Verificar RG
    const rgVerificacao = await verificarRgExistente(rg);
    if (rgVerificacao.existe) {
      return res.status(400).json({
        success: false,
        message: rgVerificacao.mensagem
      });
    }

    const residente = await Residente.create(req.body);
    
    log('info', 'Residente criado com sucesso', { id: residente.id, cpf });
    
    res.status(201).json({
      success: true,
      message: 'Residente cadastrado com sucesso!',
      data: residente
    });
  } catch (error) {
    log('error', 'Erro ao criar residente', error);
    const erroFormatado = tratarErroValidacao(error);
    res.status(500).json(erroFormatado);
  }
};

// Listar todos os residentes
exports.listar = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Montar filtros
    const where = montarFiltros(req.query, ['nome_completo', 'cpf', 'telefone']);
    
    // Calcular paginação
    const paginacao = calcularPaginacao(page, limit);
    
    const resultado = await Residente.findAndCountAll({
      where,
      ...paginacao,
      order: [['data_cadastro', 'DESC']]
    });
    
    const resposta = formatarRespostaPaginada(resultado, page, limit);
    resposta.data = { residentes: resposta.data, pagination: resposta.paginacao };
    delete resposta.paginacao;
    
    res.json(resposta);
  } catch (error) {
    log('error', 'Erro ao listar residentes', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar residentes',
      error: error.message
    });
  }
};

// Buscar residente por ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: residente
    });
  } catch (error) {
    log('error', 'Erro ao buscar residente', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar residente',
      error: error.message
    });
  }
};

// Buscar residente por CPF
exports.buscarPorCpf = async (req, res) => {
  try {
    const { cpf } = req.params;
    const residente = await Residente.findOne({ where: { cpf } });
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: residente
    });
  } catch (error) {
    log('error', 'Erro ao buscar residente por CPF', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar residente',
      error: error.message
    });
  }
};

// Atualizar residente
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { cpf, rg } = req.body;
    
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      });
    }

    // Verificar CPF se foi alterado
    if (cpf && cpf !== residente.cpf) {
      const cpfVerificacao = await verificarCpfExistente(cpf, id, 'residente');
      if (cpfVerificacao.existe) {
        return res.status(400).json({
          success: false,
          message: cpfVerificacao.mensagem
        });
      }
    }

    // Verificar RG se foi alterado
    if (rg && rg !== residente.rg) {
      const rgVerificacao = await verificarRgExistente(rg, id, 'residente');
      if (rgVerificacao.existe) {
        return res.status(400).json({
          success: false,
          message: rgVerificacao.mensagem
        });
      }
    }
    
    await residente.update(req.body);
    
    log('info', 'Residente atualizado', { id });
    
    res.json({
      success: true,
      message: 'Residente atualizado com sucesso!',
      data: residente
    });
  } catch (error) {
    log('error', 'Erro ao atualizar residente', error);
    const erroFormatado = tratarErroValidacao(error);
    res.status(500).json(erroFormatado);
  }
};

// Deletar residente (soft delete - apenas altera status)
exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      });
    }
    
    await residente.update({ status: 'inativo' });
    
    log('info', 'Residente inativado', { id });
    
    res.json({
      success: true,
      message: 'Residente inativado com sucesso!'
    });
  } catch (error) {
    log('error', 'Erro ao inativar residente', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao inativar residente',
      error: error.message
    });
  }
};

// Deletar residente permanentemente (hard delete - remove do banco)
exports.deletarPermanente = async (req, res) => {
  try {
    const { id } = req.params;
    
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      });
    }
    
    // Deletar registros relacionados (CASCADE cuida disso automaticamente)
    await residente.destroy();
    
    log('warn', 'Residente deletado permanentemente', { id, cpf: residente.cpf });
    
    res.json({
      success: true,
      message: 'Residente e todos os registros relacionados foram deletados permanentemente do sistema!'
    });
  } catch (error) {
    log('error', 'Erro ao deletar residente permanentemente', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar residente permanentemente',
      error: error.message
    });
  }
};

// Estatísticas
exports.estatisticas = async (req, res) => {
  try {
    const [total, ativos, inativos, suspensos] = await Promise.all([
      Residente.count(),
      Residente.count({ where: { status: 'ativo' } }),
      Residente.count({ where: { status: 'inativo' } }),
      Residente.count({ where: { status: 'suspenso' } })
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        ativos,
        inativos,
        suspensos
      }
    });
  } catch (error) {
    log('error', 'Erro ao buscar estatísticas', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};
