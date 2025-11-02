const Residente = require('../models/Residente');
const { Op } = require('sequelize');

// Criar novo residente
exports.criar = async (req, res) => {
  try {
    const residente = await Residente.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Residente cadastrado com sucesso!',
      data: residente
    });
  } catch (error) {
    console.error('Erro ao criar residente:', error);
    
    // Tratamento de erro de CPF duplicado
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado no sistema!'
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
    const residente = await Residente.findByPk(id);
    
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      });
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
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado no sistema!'
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
