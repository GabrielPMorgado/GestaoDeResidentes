import api from '../api/axios';

/**
 * Serviço de Relatórios
 * Funções para geração e exportação de relatórios
 */

// ==================== BUSCAR RELATÓRIOS ====================

export const buscarRelatorioGeral = async (filtros = {}) => {
  const params = new URLSearchParams()
  Object.keys(filtros).forEach(key => {
    if (filtros[key]) params.append(key, filtros[key])
  })
  return await api.get(`/relatorios/geral?${params}`)
}

export const buscarRelatorioResidentes = async (filtros = {}) => {
  const params = new URLSearchParams()
  Object.keys(filtros).forEach(key => {
    if (filtros[key]) params.append(key, filtros[key])
  })
  return await api.get(`/relatorios/residentes?${params}`)
}

export const buscarRelatorioProfissionais = async (filtros = {}) => {
  const params = new URLSearchParams()
  Object.keys(filtros).forEach(key => {
    if (filtros[key]) params.append(key, filtros[key])
  })
  return await api.get(`/relatorios/profissionais?${params}`)
}

export const buscarRelatorioAgendamentos = async (filtros = {}) => {
  const params = new URLSearchParams()
  Object.keys(filtros).forEach(key => {
    if (filtros[key]) params.append(key, filtros[key])
  })
  return await api.get(`/relatorios/agendamentos?${params}`)
}

export const buscarRelatorioFinanceiro = async (filtros = {}) => {
  const params = new URLSearchParams()
  Object.keys(filtros).forEach(key => {
    if (filtros[key]) params.append(key, filtros[key])
  })
  return await api.get(`/relatorios/financeiro?${params}`)
}

// ==================== EXPORTAÇÃO CSV ====================

export const exportarCSV = (dados, tipo, nomeArquivo = null) => {
  let csvContent = ''
  let headers = []
  let rows = []

  switch (tipo) {
    case 'geral':
      // Relatório geral com estatísticas consolidadas
      headers = ['Categoria', 'Valor']
      rows = [
        ['=== ESTATÍSTICAS GERAIS ===', ''],
        ['Residentes Cadastrados', dados.dados?.residentes?.total || 0],
        ['Profissionais Ativos', dados.dados?.profissionais?.total || 0],
        ['Agendamentos', dados.dados?.agendamentos?.total || 0],
        ['Consultas Realizadas', dados.dados?.consultas?.total || 0],
        ['', ''],
        ['=== RESUMO FINANCEIRO ===', ''],
        ['Receitas', dados.financeiro?.receitas ? `R$ ${dados.financeiro.receitas.toFixed(2)}` : 'R$ 0.00'],
        ['Gastos', dados.financeiro?.gastos ? `R$ ${dados.financeiro.gastos.toFixed(2)}` : 'R$ 0.00'],
        ['Saldo', dados.financeiro?.saldo ? `R$ ${dados.financeiro.saldo.toFixed(2)}` : 'R$ 0.00'],
        ['% Gasto', dados.financeiro?.percentualGasto ? `${dados.financeiro.percentualGasto}%` : '0%'],
        ['', ''],
        ['Período', `${dados.periodo?.inicio || 'N/A'} até ${dados.periodo?.fim || 'N/A'}`]
      ]
      break

    case 'financeiro':
      // Relatório financeiro detalhado
      if (!dados.financeiro) {
        throw new Error('Dados financeiros não disponíveis')
      }
      headers = ['Categoria', 'Valor']
      rows = [
        ['Receitas', dados.financeiro.receitas ? `R$ ${dados.financeiro.receitas.toFixed(2)}` : 'R$ 0.00'],
        ['Gastos', dados.financeiro.gastos ? `R$ ${dados.financeiro.gastos.toFixed(2)}` : 'R$ 0.00'],
        ['Saldo', dados.financeiro.saldo ? `R$ ${dados.financeiro.saldo.toFixed(2)}` : 'R$ 0.00']
      ]
      break
    case 'residentes':
      if (!dados.data || !Array.isArray(dados.data) || dados.data.length === 0) {
        throw new Error('Nenhum dado de residentes para exportar')
      }
      headers = ['Nome', 'CPF', 'Sexo', 'Data Nascimento', 'Telefone', 'E-mail', 'Mensalidade', 'Status', 'Data Cadastro']
      rows = dados.data.map(r => [
        r.nome_completo || '',
        r.cpf || '',
        r.sexo || '',
        r.data_nascimento ? new Date(r.data_nascimento).toLocaleDateString('pt-BR') : '',
        r.telefone || '',
        r.email || '',
        r.valor_mensalidade ? `R$ ${parseFloat(r.valor_mensalidade).toFixed(2)}` : '',
        r.status || '',
        r.data_cadastro ? new Date(r.data_cadastro).toLocaleDateString('pt-BR') : ''
      ])
      break

    case 'profissionais':
      if (!dados.data || !Array.isArray(dados.data) || dados.data.length === 0) {
        throw new Error('Nenhum dado de profissionais para exportar')
      }
      headers = ['Nome', 'CPF', 'Profissão', 'Registro', 'Departamento', 'Turno', 'Salário', 'Status', 'Data Admissão']
      rows = dados.data.map(p => [
        p.nome_completo || '',
        p.cpf || '',
        p.profissao || '',
        p.registro_profissional || '',
        p.departamento || '',
        p.turno || '',
        p.salario ? `R$ ${parseFloat(p.salario).toFixed(2)}` : '',
        p.status || '',
        p.data_admissao ? new Date(p.data_admissao).toLocaleDateString('pt-BR') : ''
      ])
      break

    case 'agendamentos':
      if (!dados.data || !Array.isArray(dados.data) || dados.data.length === 0) {
        throw new Error('Nenhum dado de agendamentos para exportar')
      }
      headers = ['Residente', 'Profissional', 'Data', 'Hora Início', 'Hora Fim', 'Tipo', 'Status', 'Observações']
      rows = dados.data.map(a => [
        a.residente?.nome_completo || 'N/A',
        a.profissional?.nome_completo || 'N/A',
        a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '',
        a.hora_inicio || '',
        a.hora_fim || '',
        a.tipo_atendimento || '',
        a.status || '',
        a.observacoes || ''
      ])
      break

    default:
      throw new Error('Tipo de relatório não suportado para exportação CSV')
  }

  // Criar conteúdo CSV com BOM UTF-8 para Excel
  csvContent = '\uFEFF' + headers.join(';') + '\n'
  rows.forEach(row => {
    csvContent += row.map(cell => {
      const cellStr = String(cell).replace(/"/g, '""')
      return cellStr.includes(';') || cellStr.includes(',') || cellStr.includes('\n') ? `"${cellStr}"` : cellStr
    }).join(';') + '\n'
  })

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = nomeArquivo || `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// ==================== IMPRESSÃO ====================

export const imprimirRelatorio = () => {
  window.print()
}

const relatorioService = {
  buscarRelatorioGeral,
  buscarRelatorioResidentes,
  buscarRelatorioProfissionais,
  buscarRelatorioAgendamentos,
  buscarRelatorioFinanceiro,
  exportarCSV,
  imprimirRelatorio,
  
  // Funções antigas mantidas para compatibilidade
  obterEstatisticasGerais: async () => {
    const response = await api.get('/relatorios/estatisticas');
    return response.data;
  },

  agendamentosPorPeriodo: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/agendamentos/periodo', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  agendamentosPorProfissional: async (profissionalId, dataInicio = null, dataFim = null) => {
    const response = await api.get(`/relatorios/profissional/${profissionalId}`, {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  agendamentosPorResidente: async (residenteId, dataInicio = null, dataFim = null) => {
    const response = await api.get(`/relatorios/residente/${residenteId}`, {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  consultasRealizadas: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/consultas/realizadas', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  consultasCanceladas: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/consultas/canceladas', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  }
};

export default relatorioService;
