const HistoricoConsulta = require('../models/HistoricoConsulta')
const Residente = require('../models/Residente')
const Profissional = require('../models/Profissional')
const { Op } = require('sequelize')

// Listar histórico de consultas de um residente
exports.listarHistoricoResidente = async (req, res) => {
  try {
    const { residente_id } = req.params
    const { page = 1, limit = 10, profissional_id, data_inicio, data_fim } = req.query

    const offset = (page - 1) * limit

    // Construir filtros
    const where = { residente_id }

    if (profissional_id) {
      where.profissional_id = profissional_id
    }

    if (data_inicio && data_fim) {
      where.data_consulta = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      }
    } else if (data_inicio) {
      where.data_consulta = {
        [Op.gte]: new Date(data_inicio)
      }
    } else if (data_fim) {
      where.data_consulta = {
        [Op.lte]: new Date(data_fim)
      }
    }

    const { count, rows: consultas } = await HistoricoConsulta.findAndCountAll({
      where,
      include: [
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'especialidade', 'registro_profissional']
        }
      ],
      order: [['data_consulta', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: {
        consultas,
        pagination: {
          totalItens: count,
          totalPaginas: Math.ceil(count / limit),
          paginaAtual: parseInt(page),
          itensPorPagina: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Erro ao listar histórico:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao listar histórico de consultas',
      error: error.message
    })
  }
}

// Criar nova consulta no histórico
exports.criarHistoricoConsulta = async (req, res) => {
  try {
    const {
      residente_id,
      profissional_id,
      agendamento_id,
      data_consulta,
      tipo_consulta,
      observacoes,
      diagnostico,
      prescricao,
      status
    } = req.body

    // Validações básicas
    if (!residente_id || !profissional_id || !data_consulta) {
      return res.status(400).json({
        success: false,
        message: 'Residente, profissional e data da consulta são obrigatórios'
      })
    }

    // Verificar se residente existe
    const residente = await Residente.findByPk(residente_id)
    if (!residente) {
      return res.status(404).json({
        success: false,
        message: 'Residente não encontrado'
      })
    }

    // Verificar se profissional existe
    const profissional = await Profissional.findByPk(profissional_id)
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      })
    }

    const consulta = await HistoricoConsulta.create({
      residente_id,
      profissional_id,
      agendamento_id,
      data_consulta,
      tipo_consulta,
      observacoes,
      diagnostico,
      prescricao,
      status: status || 'realizada'
    })

    const consultaCriada = await HistoricoConsulta.findByPk(consulta.id, {
      include: [
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'especialidade']
        }
      ]
    })

    res.status(201).json({
      success: true,
      message: 'Consulta registrada no histórico com sucesso',
      data: consultaCriada
    })
  } catch (error) {
    console.error('Erro ao criar histórico de consulta:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar consulta no histórico',
      error: error.message
    })
  }
}

// Obter detalhes de uma consulta
exports.obterHistoricoConsulta = async (req, res) => {
  try {
    const { id } = req.params

    const consulta = await HistoricoConsulta.findByPk(id, {
      include: [
        {
          model: Residente,
          as: 'residente',
          attributes: ['id', 'nome_completo', 'cpf', 'data_nascimento']
        },
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'especialidade', 'registro_profissional']
        }
      ]
    })

    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada'
      })
    }

    res.json({
      success: true,
      data: consulta
    })
  } catch (error) {
    console.error('Erro ao obter histórico de consulta:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao obter detalhes da consulta',
      error: error.message
    })
  }
}

// Atualizar consulta do histórico
exports.atualizarHistoricoConsulta = async (req, res) => {
  try {
    const { id } = req.params
    const {
      data_consulta,
      tipo_consulta,
      observacoes,
      diagnostico,
      prescricao,
      status
    } = req.body

    const consulta = await HistoricoConsulta.findByPk(id)

    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada'
      })
    }

    await consulta.update({
      data_consulta: data_consulta || consulta.data_consulta,
      tipo_consulta: tipo_consulta || consulta.tipo_consulta,
      observacoes: observacoes || consulta.observacoes,
      diagnostico: diagnostico || consulta.diagnostico,
      prescricao: prescricao || consulta.prescricao,
      status: status || consulta.status
    })

    const consultaAtualizada = await HistoricoConsulta.findByPk(id, {
      include: [
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'especialidade']
        }
      ]
    })

    res.json({
      success: true,
      message: 'Consulta atualizada com sucesso',
      data: consultaAtualizada
    })
  } catch (error) {
    console.error('Erro ao atualizar histórico de consulta:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar consulta',
      error: error.message
    })
  }
}

// Deletar consulta do histórico
exports.deletarHistoricoConsulta = async (req, res) => {
  try {
    const { id } = req.params

    const consulta = await HistoricoConsulta.findByPk(id)

    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada'
      })
    }

    await consulta.destroy()

    res.json({
      success: true,
      message: 'Consulta removida do histórico com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar histórico de consulta:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao remover consulta do histórico',
      error: error.message
    })
  }
}

// Listar histórico de consultas de um profissional
exports.listarHistoricoProfissional = async (req, res) => {
  try {
    const { profissional_id } = req.params
    const { page = 1, limit = 10, residente_id, data_inicio, data_fim } = req.query

    const offset = (page - 1) * limit

    // Construir filtros
    const where = { profissional_id }

    if (residente_id) {
      where.residente_id = residente_id
    }

    if (data_inicio && data_fim) {
      where.data_consulta = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      }
    } else if (data_inicio) {
      where.data_consulta = {
        [Op.gte]: new Date(data_inicio)
      }
    } else if (data_fim) {
      where.data_consulta = {
        [Op.lte]: new Date(data_fim)
      }
    }

    const { count, rows: consultas } = await HistoricoConsulta.findAndCountAll({
      where,
      include: [
        {
          model: Residente,
          as: 'residente',
          attributes: ['id', 'nome_completo', 'cpf', 'email']
        }
      ],
      order: [['data_consulta', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: {
        consultas,
        pagination: {
          totalItens: count,
          totalPaginas: Math.ceil(count / limit),
          paginaAtual: parseInt(page),
          itensPorPagina: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Erro ao listar histórico do profissional:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao listar histórico de consultas do profissional',
      error: error.message
    })
  }
}
