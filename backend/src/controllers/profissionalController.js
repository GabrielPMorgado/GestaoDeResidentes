const Profissional = require('../models/Profissional');
const { Op } = require('sequelize');

// Criar novo profissional
exports.criar = async (req, res) => {
  try {
    const profissional = await Profissional.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Profissional cadastrado com sucesso!',
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    
    // Tratamento de erro de CPF duplicado
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado no sistema!'
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
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
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
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado no sistema!'
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
