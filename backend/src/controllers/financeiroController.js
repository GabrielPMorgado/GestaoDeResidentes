const DespesaGeral = require('../models/DespesaGeral')
const PagamentoMensalidade = require('../models/PagamentoMensalidade')
const PagamentoSalario = require('../models/PagamentoSalario')
const Residente = require('../models/Residente')
const Profissional = require('../models/Profissional')
const { Op } = require('sequelize')

// ==================== DESPESAS GERAIS ====================

exports.criarDespesa = async (req, res) => {
  try {
    const despesa = await DespesaGeral.create(req.body)
    res.status(201).json(despesa)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao criar despesa', 
      detalhes: error.message 
    })
  }
}

exports.listarDespesas = async (req, res) => {
  try {
    const { categoria, status, data_inicio, data_fim } = req.query
    const where = {}

    if (categoria) where.categoria = categoria
    if (status) where.status = status
    if (data_inicio && data_fim) {
      where.data_despesa = {
        [Op.between]: [data_inicio, data_fim]
      }
    }

    const despesas = await DespesaGeral.findAll({
      where,
      order: [['data_despesa', 'DESC']]
    })
    
    res.json(despesas)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar despesas', 
      detalhes: error.message 
    })
  }
}

exports.obterDespesa = async (req, res) => {
  try {
    const despesa = await DespesaGeral.findByPk(req.params.id)
    
    if (!despesa) {
      return res.status(404).json({ error: 'Despesa não encontrada' })
    }
    
    res.json(despesa)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao obter despesa', 
      detalhes: error.message 
    })
  }
}

exports.atualizarDespesa = async (req, res) => {
  try {
    const despesa = await DespesaGeral.findByPk(req.params.id)
    
    if (!despesa) {
      return res.status(404).json({ error: 'Despesa não encontrada' })
    }
    
    await despesa.update(req.body)
    res.json(despesa)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao atualizar despesa', 
      detalhes: error.message 
    })
  }
}

exports.excluirDespesa = async (req, res) => {
  try {
    const despesa = await DespesaGeral.findByPk(req.params.id)
    
    if (!despesa) {
      return res.status(404).json({ error: 'Despesa não encontrada' })
    }
    
    await despesa.destroy()
    res.json({ message: 'Despesa excluída com sucesso' })
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao excluir despesa', 
      detalhes: error.message 
    })
  }
}

// ==================== MENSALIDADES ====================

exports.criarMensalidade = async (req, res) => {
  try {
    const mensalidade = await PagamentoMensalidade.create(req.body)
    res.status(201).json(mensalidade)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Mensalidade já cadastrada para este residente neste mês/ano' 
      })
    }
    res.status(500).json({ 
      error: 'Erro ao criar mensalidade', 
      detalhes: error.message 
    })
  }
}

exports.listarMensalidades = async (req, res) => {
  try {
    const { residente_id, status, mes_referencia, ano_referencia } = req.query
    const where = {}

    if (residente_id) where.residente_id = residente_id
    if (status) where.status = status
    if (mes_referencia) where.mes_referencia = mes_referencia
    if (ano_referencia) where.ano_referencia = ano_referencia

    const mensalidades = await PagamentoMensalidade.findAll({
      where,
      include: [{
        model: Residente,
        as: 'Residente',
        attributes: ['id', 'nome_completo', 'cpf']
      }],
      order: [['ano_referencia', 'DESC'], ['mes_referencia', 'DESC']]
    })
    
    res.json(mensalidades)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar mensalidades', 
      detalhes: error.message 
    })
  }
}

exports.obterMensalidade = async (req, res) => {
  try {
    const mensalidade = await PagamentoMensalidade.findByPk(req.params.id, {
      include: [{
        model: Residente,
        as: 'Residente'
      }]
    })
    
    if (!mensalidade) {
      return res.status(404).json({ error: 'Mensalidade não encontrada' })
    }
    
    res.json(mensalidade)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao obter mensalidade', 
      detalhes: error.message 
    })
  }
}

exports.atualizarMensalidade = async (req, res) => {
  try {
    const mensalidade = await PagamentoMensalidade.findByPk(req.params.id)
    
    if (!mensalidade) {
      return res.status(404).json({ error: 'Mensalidade não encontrada' })
    }
    
    await mensalidade.update(req.body)
    res.json(mensalidade)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao atualizar mensalidade', 
      detalhes: error.message 
    })
  }
}

exports.pagarMensalidade = async (req, res) => {
  try {
    const mensalidade = await PagamentoMensalidade.findByPk(req.params.id)
    
    if (!mensalidade) {
      return res.status(404).json({ error: 'Mensalidade não encontrada' })
    }
    
    const { data_pagamento, metodo_pagamento, observacoes } = req.body
    
    await mensalidade.update({
      status: 'pago',
      data_pagamento: data_pagamento || new Date(),
      metodo_pagamento,
      observacoes
    })
    
    res.json(mensalidade)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao registrar pagamento', 
      detalhes: error.message 
    })
  }
}

// ==================== SALÁRIOS ====================

exports.criarSalario = async (req, res) => {
  try {
    const salario = await PagamentoSalario.create(req.body)
    res.status(201).json(salario)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Salário já cadastrado para este profissional neste mês/ano' 
      })
    }
    res.status(500).json({ 
      error: 'Erro ao criar salário', 
      detalhes: error.message 
    })
  }
}

exports.listarSalarios = async (req, res) => {
  try {
    const { profissional_id, status, mes_referencia, ano_referencia } = req.query
    const where = {}

    if (profissional_id) where.profissional_id = profissional_id
    if (status) where.status = status
    if (mes_referencia) where.mes_referencia = mes_referencia
    if (ano_referencia) where.ano_referencia = ano_referencia

    const salarios = await PagamentoSalario.findAll({
      where,
      include: [{
        model: Profissional,
        as: 'Profissional',
        attributes: ['id', 'nome_completo', 'especialidade', 'salario']
      }],
      order: [['ano_referencia', 'DESC'], ['mes_referencia', 'DESC']]
    })
    
    res.json(salarios)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar salários', 
      detalhes: error.message 
    })
  }
}

exports.obterSalario = async (req, res) => {
  try {
    const salario = await PagamentoSalario.findByPk(req.params.id, {
      include: [{
        model: Profissional,
        as: 'Profissional'
      }]
    })
    
    if (!salario) {
      return res.status(404).json({ error: 'Salário não encontrado' })
    }
    
    res.json(salario)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao obter salário', 
      detalhes: error.message 
    })
  }
}

exports.atualizarSalario = async (req, res) => {
  try {
    const salario = await PagamentoSalario.findByPk(req.params.id)
    
    if (!salario) {
      return res.status(404).json({ error: 'Salário não encontrado' })
    }
    
    await salario.update(req.body)
    res.json(salario)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao atualizar salário', 
      detalhes: error.message 
    })
  }
}

exports.pagarSalario = async (req, res) => {
  try {
    const salario = await PagamentoSalario.findByPk(req.params.id)
    
    if (!salario) {
      return res.status(404).json({ error: 'Salário não encontrado' })
    }
    
    const { data_pagamento, metodo_pagamento, observacoes } = req.body
    
    await salario.update({
      status: 'pago',
      data_pagamento: data_pagamento || new Date(),
      metodo_pagamento,
      observacoes
    })
    
    res.json(salario)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao registrar pagamento', 
      detalhes: error.message 
    })
  }
}

// ==================== RELATÓRIOS FINANCEIROS ====================

exports.obterResumoFinanceiro = async (req, res) => {
  try {
    const { mes, ano } = req.query
    const where = {}
    
    if (mes) where.mes_referencia = mes
    if (ano) where.ano_referencia = ano

    const mensalidadesPagas = await PagamentoMensalidade.findAll({
      where: { ...where, status: 'pago' },
      attributes: ['valor']
    })
    
    const receitaTotal = mensalidadesPagas.reduce((sum, m) => sum + parseFloat(m.valor), 0)

    const salariosPagos = await PagamentoSalario.findAll({
      where: { ...where, status: 'pago' },
      attributes: ['valor', 'bonus', 'descontos']
    })
    
    const despesaSalarios = salariosPagos.reduce((sum, s) => {
      return sum + parseFloat(s.valor) + parseFloat(s.bonus || 0) - parseFloat(s.descontos || 0)
    }, 0)

    const whereGeral = {}
    if (mes && ano) {
      const primeiroDia = new Date(ano, mes - 1, 1)
      const ultimoDia = new Date(ano, mes, 0)
      whereGeral.data_despesa = {
        [Op.between]: [primeiroDia, ultimoDia]
      }
    }
    whereGeral.status = 'pago'

    const despesasGerais = await DespesaGeral.findAll({
      where: whereGeral,
      attributes: ['valor']
    })
    
    const despesaGeral = despesasGerais.reduce((sum, d) => sum + parseFloat(d.valor), 0)
    
    const despesaTotal = despesaSalarios + despesaGeral
    const saldo = receitaTotal - despesaTotal
    const margemLucro = receitaTotal > 0 ? ((saldo / receitaTotal) * 100).toFixed(2) : 0

    res.json({
      receitaTotal: receitaTotal.toFixed(2),
      despesaTotal: despesaTotal.toFixed(2),
      despesaSalarios: despesaSalarios.toFixed(2),
      despesaGeral: despesaGeral.toFixed(2),
      saldo: saldo.toFixed(2),
      margemLucro: parseFloat(margemLucro)
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao gerar resumo financeiro', 
      detalhes: error.message 
    })
  }
}

exports.obterTransacoes = async (req, res) => {
  try {
    const { mes, ano, tipo } = req.query
    const transacoes = []

    if (!tipo || tipo === 'receita') {
      const whereMensalidade = { status: 'pago' }
      if (mes) whereMensalidade.mes_referencia = mes
      if (ano) whereMensalidade.ano_referencia = ano

      const mensalidades = await PagamentoMensalidade.findAll({
        where: whereMensalidade,
        include: [{
          model: Residente,
          as: 'Residente',
          attributes: ['nome_completo']
        }]
      })

      mensalidades.forEach(m => {
        transacoes.push({
          id: `M-${m.id}`,
          tipo: 'receita',
          descricao: `Mensalidade - ${m.Residente.nome_completo}`,
          valor: parseFloat(m.valor),
          data: m.data_pagamento,
          categoria: 'Mensalidade',
          metodo: m.metodo_pagamento
        })
      })
    }

    if (!tipo || tipo === 'despesa') {
      const whereSalario = { status: 'pago' }
      if (mes) whereSalario.mes_referencia = mes
      if (ano) whereSalario.ano_referencia = ano

      const salarios = await PagamentoSalario.findAll({
        where: whereSalario,
        include: [{
          model: Profissional,
          as: 'Profissional',
          attributes: ['nome_completo']
        }]
      })

      salarios.forEach(s => {
        const valorTotal = parseFloat(s.valor) + parseFloat(s.bonus || 0) - parseFloat(s.descontos || 0)
        transacoes.push({
          id: `S-${s.id}`,
          tipo: 'despesa',
          descricao: `Salário - ${s.Profissional.nome_completo}`,
          valor: valorTotal,
          data: s.data_pagamento,
          categoria: 'Salário',
          metodo: s.metodo_pagamento
        })
      })
    }

    if (!tipo || tipo === 'despesa') {
      const whereDespesa = { status: 'pago' }
      if (mes && ano) {
        const primeiroDia = new Date(ano, mes - 1, 1)
        const ultimoDia = new Date(ano, mes, 0)
        whereDespesa.data_despesa = {
          [Op.between]: [primeiroDia, ultimoDia]
        }
      }

      const despesas = await DespesaGeral.findAll({
        where: whereDespesa
      })

      despesas.forEach(d => {
        transacoes.push({
          id: `D-${d.id}`,
          tipo: 'despesa',
          descricao: d.descricao,
          valor: parseFloat(d.valor),
          data: d.data_pagamento,
          categoria: d.categoria,
          metodo: d.metodo_pagamento
        })
      })
    }

    transacoes.sort((a, b) => new Date(b.data) - new Date(a.data))

    res.json(transacoes)
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar transações', 
      detalhes: error.message 
    })
  }
}
