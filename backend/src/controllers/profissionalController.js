const Profissional = require('../models/Profissional');
const Residente = require('../models/Residente');
const Agendamento = require('../models/Agendamento');
const HistoricoConsulta = require('../models/HistoricoConsulta');
const { Op } = require('sequelize');

// Criar novo profissional
exports.criar = async (req, res) => {
  try {
    const { cpf, rg } = req.body;

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

    // Verificar se RG já existe em profissionais (se fornecido)
    if (rg) {
      const rgExistenteProfissional = await Profissional.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como profissional!'
        });
      }

      // Verificar se RG já existe em residentes
      const rgExistenteResidente = await Residente.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como residente!'
        });
      }
    }

    const profissional = await Profissional.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Profissional cadastrado com sucesso!',
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    
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
      message: 'Erro ao cadastrar profissional',
      error: error.message
    });
  }
};

// Listar todos os profissionais
exports.listar = async (req, res) => {
  try {
    const { status, busca, profissao, departamento, page = 1, limit = 10 } = req.query;
    
    // Filtros
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (profissao) {
      where.profissao = profissao;
    }
    
    if (departamento) {
      where.departamento = departamento;
    }
    
    if (busca) {
      where[Op.or] = [
        { nome_completo: { [Op.like]: `%${busca}%` } },
        { cpf: { [Op.like]: `%${busca}%` } },
        { celular: { [Op.like]: `%${busca}%` } },
        { cargo: { [Op.like]: `%${busca}%` } }
      ];
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Profissional.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_cadastro', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        profissionais: rows,
        pagination: {
          totalItens: count,
          paginaAtual: parseInt(page),
          itensPorPagina: parseInt(limit),
          totalPaginas: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar profissionais',
      error: error.message
    });
  }
};

// Buscar profissional por ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar profissional',
      error: error.message
    });
  }
};

// Buscar profissional por CPF
exports.buscarPorCpf = async (req, res) => {
  try {
    const { cpf } = req.params;
    const profissional = await Profissional.findOne({ where: { cpf } });
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar profissional',
      error: error.message
    });
  }
};

// Atualizar profissional
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { cpf, rg } = req.body;
    
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }

    // Verificar se o CPF está sendo alterado
    if (cpf && cpf !== profissional.cpf) {
      // Verificar se o novo CPF já existe em outros profissionais
      const cpfExistenteProfissional = await Profissional.findOne({ 
        where: { 
          cpf,
          id: { [Op.ne]: id } // Excluir o próprio profissional
        } 
      });
      
      if (cpfExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado como profissional!'
        });
      }

      // Verificar se o novo CPF já existe em residentes
      const cpfExistenteResidente = await Residente.findOne({ 
        where: { cpf } 
      });
      
      if (cpfExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado como residente!'
        });
      }
    }

    // Verificar se o RG está sendo alterado
    if (rg && rg !== profissional.rg) {
      // Verificar se o novo RG já existe em outros profissionais
      const rgExistenteProfissional = await Profissional.findOne({ 
        where: { 
          rg,
          id: { [Op.ne]: id } // Excluir o próprio profissional
        } 
      });
      
      if (rgExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como profissional!'
        });
      }

      // Verificar se o novo RG já existe em residentes
      const rgExistenteResidente = await Residente.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como residente!'
        });
      }
    }
    
    await profissional.update(req.body);
    
    res.json({
      success: true,
      message: 'Profissional atualizado com sucesso!',
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const campo = error.errors[0]?.path || 'campo';
      return res.status(400).json({
        success: false,
        message: `${campo.toUpperCase()} já cadastrado no sistema!`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar profissional',
      error: error.message
    });
  }
};

// Deletar profissional (soft delete - apenas altera status)
exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    await profissional.update({ status: 'inativo' });
    
    res.json({
      success: true,
      message: 'Profissional inativado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao inativar profissional',
      error: error.message
    });
  }
};

// Deletar profissional permanentemente (hard delete - remove do banco)
exports.deletarPermanente = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== DELETAR PROFISSIONAL PERMANENTE ===');
    console.log('ID recebido:', id);
    
    const profissional = await Profissional.findByPk(id);
    console.log('Profissional encontrado:', profissional ? 'SIM' : 'NÃO');
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    // Primeiro, deletar todos os históricos de consulta relacionados
    console.log('Deletando históricos de consulta do profissional...');
    const historicoDeletados = await HistoricoConsulta.destroy({
      where: { profissional_id: id }
    });
    console.log('Históricos deletados:', historicoDeletados);
    
    // Depois, deletar todos os agendamentos relacionados
    console.log('Deletando agendamentos do profissional...');
    const agendamentosDeletados = await Agendamento.destroy({
      where: { profissional_id: id }
    });
    console.log('Agendamentos deletados:', agendamentosDeletados);
    
    // Por fim, deletar o profissional permanentemente do banco de dados
    console.log('Deletando profissional...');
    await profissional.destroy();
    console.log('Profissional deletado com sucesso!');
    
    res.json({
      success: true,
      message: 'Profissional e todos os registros relacionados foram deletados permanentemente do sistema!'
    });
  } catch (error) {
    console.error('ERRO COMPLETO ao deletar profissional permanentemente:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar profissional permanentemente',
      error: error.message
    });
  }
};;

// Estatísticas
exports.estatisticas = async (req, res) => {
  try {
    const total = await Profissional.count();
    const ativos = await Profissional.count({ where: { status: 'ativo' } });
    const inativos = await Profissional.count({ where: { status: 'inativo' } });
    const ferias = await Profissional.count({ where: { status: 'ferias' } });
    const licenca = await Profissional.count({ where: { status: 'licenca' } });
    
    // Contar por profissão
    const porProfissao = await Profissional.findAll({
      attributes: [
        'profissao',
        [require('sequelize').fn('COUNT', require('sequelize').col('profissao')), 'total']
      ],
      group: ['profissao'],
      order: [[require('sequelize').literal('total'), 'DESC']]
    });
    
    // Contar por departamento
    const porDepartamento = await Profissional.findAll({
      attributes: [
        'departamento',
        [require('sequelize').fn('COUNT', require('sequelize').col('departamento')), 'total']
      ],
      where: {
        departamento: { [Op.ne]: null }
      },
      group: ['departamento'],
      order: [[require('sequelize').literal('total'), 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        total,
        ativos,
        inativos,
        ferias,
        licenca,
        porProfissao,
        porDepartamento
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
