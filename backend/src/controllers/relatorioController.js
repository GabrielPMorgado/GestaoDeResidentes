const { Residente, Profissional, Agendamento, HistoricoConsulta, DespesaGeral, PagamentoMensalidade, PagamentoSalario } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Controller de Relatórios Avançados
 * Funções de saída do sistema com filtros e exportação
 */

// ==================== RELATÓRIOS DE RESIDENTES ====================

exports.relatorioResidentes = async (req, res) => {
  try {
    const { status, sexo, data_inicio, data_fim } = req.query;
    const where = {};

    if (status) where.status = status;
    if (sexo) where.sexo = sexo;
    if (data_inicio && data_fim) {
      where.data_cadastro = {
        [Op.between]: [data_inicio, data_fim]
      };
    }

    const residentes = await Residente.findAll({
      where,
      attributes: [
        'id',
        'nome_completo',
        'cpf',
        'data_nascimento',
        'sexo',
        'telefone',
        'email',
        'valor_mensalidade',
        'status',
        'data_cadastro'
      ],
      order: [['nome_completo', 'ASC']]
    });

    // Estatísticas
    const estatisticas = {
      total: residentes.length,
      ativos: residentes.filter(r => r.status === 'ativo').length,
      inativos: residentes.filter(r => r.status === 'inativo').length,
      masculino: residentes.filter(r => r.sexo === 'masculino').length,
      feminino: residentes.filter(r => r.sexo === 'feminino').length
    };

    res.json({
      success: true,
      data: residentes,
      estatisticas,
      total: residentes.length
    });
  } catch (error) {
    console.error('Erro no relatório de residentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de residentes',
      error: error.message
    });
  }
};

// ==================== RELATÓRIOS DE PROFISSIONAIS ====================

exports.relatorioProfissionais = async (req, res) => {
  try {
    const { status, profissao, departamento, data_inicio, data_fim } = req.query;
    const where = {};

    if (status) where.status = status;
    if (profissao) where.profissao = profissao;
    if (departamento) where.departamento = departamento;
    if (data_inicio && data_fim) {
      where.data_admissao = {
        [Op.between]: [data_inicio, data_fim]
      };
    }

    const profissionais = await Profissional.findAll({
      where,
      attributes: [
        'id',
        'nome_completo',
        'cpf',
        'profissao',
        'registro_profissional',
        'departamento',
        'turno',
        'salario',
        'status',
        'data_admissao'
      ],
      order: [['nome_completo', 'ASC']]
    });

    // Estatísticas
    const estatisticas = {
      total: profissionais.length,
      ativos: profissionais.filter(p => p.status === 'ativo').length,
      inativos: profissionais.filter(p => p.status === 'inativo').length,
      totalFolha: profissionais
        .filter(p => p.status === 'ativo')
        .reduce((sum, p) => sum + parseFloat(p.salario || 0), 0)
    };

    // Agrupar por profissão
    const porProfissao = profissionais.reduce((acc, p) => {
      acc[p.profissao] = (acc[p.profissao] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: profissionais,
      estatisticas,
      porProfissao,
      total: profissionais.length
    });
  } catch (error) {
    console.error('Erro no relatório de profissionais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de profissionais',
      error: error.message
    });
  }
};

// ==================== RELATÓRIOS DE AGENDAMENTOS ====================

exports.relatorioAgendamentos = async (req, res) => {
  try {
    const { status, tipo_atendimento, profissional_id, data_inicio, data_fim } = req.query;
    const where = {};

    if (status) where.status = status;
    if (tipo_atendimento) where.tipo_atendimento = tipo_atendimento;
    if (profissional_id) where.profissional_id = profissional_id;
    if (data_inicio && data_fim) {
      where.data = {
        [Op.between]: [data_inicio, data_fim]
      };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        {
          model: Residente,
          as: 'residente',
          attributes: ['id', 'nome_completo', 'cpf']
        },
        {
          model: Profissional,
          as: 'profissional',
          attributes: ['id', 'nome_completo', 'profissao']
        }
      ],
      order: [['data', 'DESC'], ['hora_inicio', 'DESC']]
    });

    // Estatísticas
    const estatisticas = {
      total: agendamentos.length,
      agendados: agendamentos.filter(a => a.status === 'agendado').length,
      confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
      concluidos: agendamentos.filter(a => a.status === 'concluido').length,
      cancelados: agendamentos.filter(a => a.status === 'cancelado').length,
      faltas: agendamentos.filter(a => a.status === 'falta').length
    };

    // Agrupar por tipo de atendimento
    const porTipo = agendamentos.reduce((acc, a) => {
      acc[a.tipo_atendimento] = (acc[a.tipo_atendimento] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: agendamentos,
      estatisticas,
      porTipo,
      total: agendamentos.length
    });
  } catch (error) {
    console.error('Erro no relatório de agendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de agendamentos',
      error: error.message
    });
  }
};

// ==================== RELATÓRIOS FINANCEIROS ====================

exports.relatorioFinanceiro = async (req, res) => {
  try {
    const { data_inicio, data_fim, tipo } = req.query;
    const dataInicio = data_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const dataFim = data_fim || new Date().toISOString().split('T')[0];

    // Buscar despesas
    const despesas = await DespesaGeral.findAll({
      where: {
        data_despesa: {
          [Op.between]: [dataInicio, dataFim]
        }
      },
      order: [['data_despesa', 'DESC']]
    });

    // Buscar mensalidades
    const mensalidades = await PagamentoMensalidade.findAll({
      where: {
        data_vencimento: {
          [Op.between]: [dataInicio, dataFim]
        }
      },
      include: [{
        model: Residente,
        as: 'residente',
        attributes: ['id', 'nome_completo']
      }],
      order: [['data_vencimento', 'DESC']]
    });

    // Buscar salários
    const salarios = await PagamentoSalario.findAll({
      where: {
        [Op.or]: [
          // Filtrar por data_pagamento se existir
          {
            data_pagamento: {
              [Op.and]: [
                { [Op.ne]: null },
                { [Op.between]: [dataInicio, dataFim] }
              ]
            }
          },
          // Ou filtrar por ano_referencia se data_pagamento for null
          {
            [Op.and]: [
              { data_pagamento: null },
              { ano_referencia: new Date(dataInicio).getFullYear() }
            ]
          }
        ]
      },
      include: [{
        model: Profissional,
        as: 'profissional',
        attributes: ['id', 'nome_completo', 'profissao']
      }],
      order: [[literal('COALESCE(data_pagamento, CONCAT(ano_referencia, "-", LPAD(mes_referencia, 2, "0"), "-01"))'), 'DESC']]
    });

    // Calcular totais
    const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
    const totalMensalidades = mensalidades.reduce((sum, m) => sum + parseFloat(m.valor_mensalidade || 0), 0);
    const totalSalarios = salarios.reduce((sum, s) => sum + parseFloat(s.valor || 0), 0);

    const totalReceitas = totalMensalidades;
    const totalGastos = totalDespesas + totalSalarios;
    const saldo = totalReceitas - totalGastos;

    // Agrupar despesas por categoria
    const despesasPorCategoria = despesas.reduce((acc, d) => {
      acc[d.categoria] = (acc[d.categoria] || 0) + parseFloat(d.valor || 0);
      return acc;
    }, {});

    // Status de pagamentos
    const mensalidadesPagas = mensalidades.filter(m => m.status === 'pago').length;
    const mensalidadesPendentes = mensalidades.filter(m => m.status === 'pendente').length;
    const mensalidadesAtrasadas = mensalidades.filter(m => m.status === 'atrasado').length;

    res.json({
      success: true,
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      resumo: {
        totalReceitas,
        totalGastos,
        totalDespesas,
        totalSalarios,
        saldo,
        percentualGasto: totalReceitas > 0 ? ((totalGastos / totalReceitas) * 100).toFixed(2) : 0
      },
      despesas: {
        total: totalDespesas,
        quantidade: despesas.length,
        porCategoria: despesasPorCategoria,
        lista: despesas
      },
      mensalidades: {
        total: totalMensalidades,
        quantidade: mensalidades.length,
        pagas: mensalidadesPagas,
        pendentes: mensalidadesPendentes,
        atrasadas: mensalidadesAtrasadas,
        lista: mensalidades
      },
      salarios: {
        total: totalSalarios,
        quantidade: salarios.length,
        lista: salarios
      }
    });
  } catch (error) {
    console.error('Erro no relatório financeiro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório financeiro',
      error: error.message
    });
  }
};

// ==================== RELATÓRIO CONSOLIDADO ====================

exports.relatorioGeral = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    const dataInicio = data_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const dataFim = data_fim || new Date().toISOString().split('T')[0];

    // Buscar dados consolidados
    const [
      residentes,
      profissionais,
      agendamentos,
      consultas,
      despesas,
      mensalidades,
      salarios
    ] = await Promise.all([
      Residente.count(),
      Profissional.count({ where: { status: 'ativo' } }),
      Agendamento.count({
        where: {
          data_agendamento: { [Op.between]: [dataInicio, dataFim] }
        }
      }),
      HistoricoConsulta.count({
        where: {
          data_consulta: { [Op.between]: [dataInicio, dataFim] }
        }
      }),
      DespesaGeral.sum('valor', {
        where: {
          data_despesa: { [Op.between]: [dataInicio, dataFim] }
        }
      }),
      PagamentoMensalidade.sum('valor_mensalidade', {
        where: {
          data_vencimento: { [Op.between]: [dataInicio, dataFim] }
        }
      }),
      PagamentoSalario.sum('valor', {
        where: {
          ano_referencia: new Date(dataInicio).getFullYear()
        }
      })
    ]);

    const totalReceitas = parseFloat(mensalidades || 0);
    const totalGastos = parseFloat(despesas || 0) + parseFloat(salarios || 0);

    res.json({
      success: true,
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      dados: {
        residentes: {
          total: residentes,
          label: 'Residentes Cadastrados'
        },
        profissionais: {
          total: profissionais,
          label: 'Profissionais Ativos'
        },
        agendamentos: {
          total: agendamentos,
          label: 'Agendamentos'
        },
        consultas: {
          total: consultas,
          label: 'Consultas Realizadas'
        }
      },
      financeiro: {
        receitas: totalReceitas,
        gastos: totalGastos,
        saldo: totalReceitas - totalGastos,
        percentualGasto: totalReceitas > 0 ? ((totalGastos / totalReceitas) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Erro no relatório geral:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório geral',
      error: error.message
    });
  }
};

module.exports = exports;
