const Agendamento = require('../models/Agendamento');
const Residente = require('../models/Residente');
const Profissional = require('../models/Profissional');
const HistoricoConsulta = require('../models/HistoricoConsulta');
const { Op } = require('sequelize');

// Criar novo agendamento
exports.criar = async (req, res) => {
  try {
    const agendamento = await Agendamento.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar agendamento',
      error: error.message
    });
  }
};

// Listar todos os agendamentos com filtros e paginação
exports.listar = async (req, res) => {
  try {
    const { 
      status, 
      residente_id, 
      profissional_id, 
      tipo_atendimento,
      data_inicio,
      data_fim,
      busca,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Filtros
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (residente_id) {
      where.residente_id = residente_id;
    }
    
    if (profissional_id) {
      where.profissional_id = profissional_id;
    }
    
    if (tipo_atendimento) {
      where.tipo_atendimento = tipo_atendimento;
    }
    
    if (data_inicio && data_fim) {
      where.data_agendamento = {
        [Op.between]: [data_inicio, data_fim]
      };
    } else if (data_inicio) {
      where.data_agendamento = {
        [Op.gte]: data_inicio
      };
    } else if (data_fim) {
      where.data_agendamento = {
        [Op.lte]: data_fim
      };
    }
    
    if (busca) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${busca}%` } },
        { descricao: { [Op.like]: `%${busca}%` } },
        { local: { [Op.like]: `%${busca}%` } }
      ];
    }
    // Paginação
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Agendamento.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_agendamento', 'DESC'], ['hora_inicio', 'DESC']],
      include: [
        {
          model: Residente,
          as: 'residente',
          attributes: ['id', 'nome_completo', 'cpf']
        },
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'cpf', 'profissao', 'cargo']
        }
      ]
    });
    res.json({
      success: true,
      data: {
        agendamentos: rows,
        pagination: {
          totalItens: count,
          paginaAtual: parseInt(page),
          itensPorPagina: parseInt(limit),
          totalPaginas: Math.ceil(count / limit) || 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar agendamentos',
      error: error.message,
      details: error.stack
    });
  }
};

// Buscar agendamento por ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const agendamento = await Agendamento.findByPk(id, {
      include: [
        {
          model: Residente,
          as: 'residente',
          attributes: ['id', 'nome_completo', 'cpf', 'data_nascimento', 'email', 'telefone']
        },
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'cpf', 'profissao', 'cargo', 'email', 'celular']
        }
      ]
    });
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamento',
      error: error.message
    });
  }
};

// Buscar agendamentos por residente
exports.buscarPorResidente = async (req, res) => {
  try {
    const { residente_id } = req.params;
    
    const agendamentos = await Agendamento.findAll({
      where: { residente_id },
      order: [['data_agendamento', 'DESC'], ['hora_inicio', 'DESC']],
      include: [
        {
          model: Residente,
          as: 'residente',
          attributes: ['id', 'nome_completo', 'cpf']
        },
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'cpf', 'profissao', 'cargo']
        }
      ]
    });
    
    res.json({
      success: true,
      data: agendamentos
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos do residente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamentos do residente',
      error: error.message
    });
  }
};

// Buscar agendamentos por profissional
exports.buscarPorProfissional = async (req, res) => {
  try {
    const { profissional_id } = req.params;
    
    const agendamentos = await Agendamento.findAll({
      where: { profissional_id },
      order: [['data_agendamento', 'DESC'], ['hora_inicio', 'DESC']],
      include: [
        {
          model: Residente,
          as: 'residente',
          attributes: ['id', 'nome_completo', 'cpf']
        },
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'cpf', 'profissao', 'cargo']
        }
      ]
    });
    
    res.json({
      success: true,
      data: agendamentos
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos do profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamentos do profissional',
      error: error.message
    });
  }
};

// Atualizar agendamento
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    // Verificar se o status está mudando para 'concluido'
    const statusAnterior = agendamento.status;
    const novoStatus = req.body.status;
    
    await agendamento.update(req.body);
    
    // Se o status mudou para 'concluido', criar registro no histórico
    if (novoStatus === 'concluido' && statusAnterior !== 'concluido') {
      try {
        await HistoricoConsulta.create({
          residente_id: agendamento.residente_id,
          profissional_id: agendamento.profissional_id,
          agendamento_id: agendamento.id,
          data_consulta: agendamento.data_agendamento,
          tipo_consulta: agendamento.tipo_atendimento,
          observacoes: agendamento.observacoes || 'Consulta realizada conforme agendamento',
          status: 'realizada'
        });
      } catch (historicoError) {
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('⚠️ Erro ao criar histórico de consulta:', historicoError);
        }
        // Não falhar a atualização do agendamento se houver erro no histórico
      }
    }
    
    res.json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar agendamento',
      error: error.message
    });
  }
};

// Deletar agendamento
exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    await agendamento.destroy();
    
    res.json({
      success: true,
      message: 'Agendamento deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar agendamento',
      error: error.message
    });
  }
};

// Cancelar agendamento
exports.cancelar = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_cancelamento } = req.body;
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    await agendamento.update({
      status: 'cancelado',
      motivo_cancelamento: motivo_cancelamento || 'Não informado'
    });
    
    res.json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar agendamento',
      error: error.message
    });
  }
};

// Confirmar agendamento
exports.confirmar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    await agendamento.update({ status: 'confirmado' });
    
    res.json({
      success: true,
      message: 'Agendamento confirmado com sucesso',
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar agendamento',
      error: error.message
    });
  }
};

// Estatísticas de agendamentos
exports.estatisticas = async (req, res) => {
  try {
    const total = await Agendamento.count();
    const agendados = await Agendamento.count({ where: { status: 'agendado' } });
    const confirmados = await Agendamento.count({ where: { status: 'confirmado' } });
    const em_atendimento = await Agendamento.count({ where: { status: 'em_atendimento' } });
    const concluidos = await Agendamento.count({ where: { status: 'concluido' } });
    const cancelados = await Agendamento.count({ where: { status: 'cancelado' } });
    const faltas = await Agendamento.count({ where: { status: 'falta' } });
    
    // Agendamentos de hoje
    const hoje = new Date().toISOString().split('T')[0];
    const hoje_total = await Agendamento.count({
      where: { data_agendamento: hoje }
    });
    
    res.json({
      success: true,
      data: {
        total,
        agendados,
        confirmados,
        em_atendimento,
        concluidos,
        cancelados,
        faltas,
        hoje: hoje_total
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

// Verificar disponibilidade de horário
exports.verificarDisponibilidade = async (req, res) => {
  try {
    const { profissional_id, data_agendamento, hora_inicio, hora_fim } = req.query;
    
    if (!profissional_id || !data_agendamento || !hora_inicio || !hora_fim) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: profissional_id, data_agendamento, hora_inicio, hora_fim'
      });
    }
    
    const conflitos = await Agendamento.count({
      where: {
        profissional_id,
        data_agendamento,
        status: { [Op.notIn]: ['cancelado'] },
        [Op.or]: [
          {
            hora_inicio: {
              [Op.between]: [hora_inicio, hora_fim]
            }
          },
          {
            hora_fim: {
              [Op.between]: [hora_inicio, hora_fim]
            }
          },
          {
            [Op.and]: [
              { hora_inicio: { [Op.lte]: hora_inicio } },
              { hora_fim: { [Op.gte]: hora_fim } }
            ]
          }
        ]
      }
    });
    
    res.json({
      success: true,
      disponivel: conflitos === 0,
      message: conflitos === 0 ? 'Horário disponível' : 'Horário indisponível'
    });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar disponibilidade',
      error: error.message
    });
  }
};
