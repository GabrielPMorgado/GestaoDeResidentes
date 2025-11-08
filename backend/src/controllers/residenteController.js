const Residente = require('../models/Residente');
const Profissional = require('../models/Profissional');
const Agendamento = require('../models/Agendamento');
const HistoricoConsulta = require('../models/HistoricoConsulta');
const { Op } = require('sequelize');

// Criar novo residente
exports.criar = async (req, res) => {
  try {
    const { cpf, rg } = req.body;

    // Verificar se CPF já existe em residentes
    const residenteExistente = await Residente.findOne({ 
      where: { cpf } 
    });
    
    if (residenteExistente) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado como residente!'
      });
    }

    // Verificar se CPF já existe em profissionais
    const profissionalExistente = await Profissional.findOne({ 
      where: { cpf } 
    });
    
    if (profissionalExistente) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado como profissional!'
      });
    }

    // Verificar se RG já existe em residentes (se fornecido)
    if (rg) {
      const rgExistenteResidente = await Residente.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como residente!'
        });
      }

      // Verificar se RG já existe em profissionais
      const rgExistenteProfissional = await Profissional.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como profissional!'
        });
      }
    }

    const residente = await Residente.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Residente cadastrado com sucesso!',
      data: residente
    });
  } catch (error) {
    console.error('Erro ao criar residente:', error);
    
    // Tratamento de erro de constraint única
    if (error.name === 'SequelizeUniqueConstraintError') {
      const campo = error.errors[0]?.path || 'campo';
      return res.status(400).json({
        success: false,
        message: `${campo.toUpperCase()} já cadastrado no sistema!`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar residente',
      error: error.message
    });
  }
};

// Listar todos os residentes
exports.listar = async (req, res) => {
  try {
    const { status, busca, page = 1, limit = 10 } = req.query;
    
    // Filtros
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (busca) {
      where[Op.or] = [
        { nome_completo: { [Op.like]: `%${busca}%` } },
        { cpf: { [Op.like]: `%${busca}%` } },
        { telefone: { [Op.like]: `%${busca}%` } }
      ];
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Residente.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_cadastro', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        residentes: rows,
        pagination: {
          totalItens: count,
          paginaAtual: parseInt(page),
          itensPorPagina: parseInt(limit),
          totalPaginas: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao listar residentes:', error);
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
    console.error('Erro ao buscar residente:', error);
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
    console.error('Erro ao buscar residente:', error);
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

    // Verificar se o CPF está sendo alterado
    if (cpf && cpf !== residente.cpf) {
      // Verificar se o novo CPF já existe em outros residentes
      const cpfExistenteResidente = await Residente.findOne({ 
        where: { 
          cpf,
          id: { [Op.ne]: id } // Excluir o próprio residente
        } 
      });
      
      if (cpfExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado como residente!'
        });
      }

      // Verificar se o novo CPF já existe em profissionais
      const cpfExistenteProfissional = await Profissional.findOne({ 
        where: { cpf } 
      });
      
      if (cpfExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado como profissional!'
        });
      }
    }

    // Verificar se o RG está sendo alterado
    if (rg && rg !== residente.rg) {
      // Verificar se o novo RG já existe em outros residentes
      const rgExistenteResidente = await Residente.findOne({ 
        where: { 
          rg,
          id: { [Op.ne]: id } // Excluir o próprio residente
        } 
      });
      
      if (rgExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como residente!'
        });
      }

      // Verificar se o novo RG já existe em profissionais
      const rgExistenteProfissional = await Profissional.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como profissional!'
        });
      }
    }
    
    await residente.update(req.body);
    
    res.json({
      success: true,
      message: 'Residente atualizado com sucesso!',
      data: residente
    });
  } catch (error) {
    console.error('Erro ao atualizar residente:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const campo = error.errors[0]?.path || 'campo';
      return res.status(400).json({
        success: false,
        message: `${campo.toUpperCase()} já cadastrado no sistema!`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar residente',
      error: error.message
    });
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
    
    res.json({
      success: true,
      message: 'Residente inativado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar residente:', error);
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
    console.log('=== DELETAR PERMANENTE ===');
    console.log('ID recebido:', id);
    
    const residente = await Residente.findByPk(id);
    console.log('Residente encontrado:', residente ? 'SIM' : 'NÃO');
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      });
    }
    
    // Primeiro, deletar todos os históricos de consulta relacionados
    console.log('Deletando históricos de consulta...');
    const historicoDeletados = await HistoricoConsulta.destroy({
      where: { residente_id: id }
    });
    console.log('Históricos deletados:', historicoDeletados);
    
    // Depois, deletar todos os agendamentos relacionados
    console.log('Deletando agendamentos...');
    const agendamentosDeletados = await Agendamento.destroy({
      where: { residente_id: id }
    });
    console.log('Agendamentos deletados:', agendamentosDeletados);
    
    // Por fim, deletar o residente permanentemente do banco de dados
    console.log('Deletando residente...');
    await residente.destroy();
    console.log('Residente deletado com sucesso!');
    
    res.json({
      success: true,
      message: 'Residente e todos os registros relacionados foram deletados permanentemente do sistema!'
    });
  } catch (error) {
    console.error('Erro ao deletar residente permanentemente:', error);
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
    const total = await Residente.count();
    const ativos = await Residente.count({ where: { status: 'ativo' } });
    const inativos = await Residente.count({ where: { status: 'inativo' } });
    const suspensos = await Residente.count({ where: { status: 'suspenso' } });
    
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
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};
