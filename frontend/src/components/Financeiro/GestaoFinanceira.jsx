import { useState, useEffect } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import financeiroService from '../../services/financeiroService'
import { HelpButton } from '../Common'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function GestaoFinanceira() {
  const { success: showSuccess, error: showError } = useNotification()
  const [abaSelecionada, setAbaSelecionada] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  
  // Estados financeiros
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    receitaTotal: 0,
    despesaTotal: 0,
    saldo: 0,
    margemLucro: 0
  })

  const [mensalidades, setMensalidades] = useState([])
  const [salarios, setSalarios] = useState([])
  const [despesas, setDespesas] = useState([])
  const [transacoes, setTransacoes] = useState([])

  // Modal states
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false)
  const [modalPagamento, setModalPagamento] = useState(false)
  const [modalGerarMensalidades, setModalGerarMensalidades] = useState(false)
  const [modalGerarSalarios, setModalGerarSalarios] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [gerando, setGerando] = useState(false)

  // Form states
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: '',
    categoria: 'Operacional',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    status: 'pendente',
    observacoes: ''
  })

  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    status: 'todos',
    tipo: 'todos'
  })

  const [diaVencimento, setDiaVencimento] = useState(10)
  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro')

  useEffect(() => {
    carregarDadosFinanceiros()
  }, [filtros.mes, filtros.ano])

  const carregarDadosFinanceiros = async () => {
    try {
      setLoading(true)

      const [resumo, mensalidadesRes, salariosRes, despesasRes, transacoesRes] = await Promise.all([
        financeiroService.obterResumoFinanceiro(filtros.mes, filtros.ano),
        financeiroService.listarMensalidades({ 
          mes_referencia: filtros.mes, 
          ano_referencia: filtros.ano 
        }),
        financeiroService.listarSalarios({ 
          mes_referencia: filtros.mes, 
          ano_referencia: filtros.ano 
        }),
        financeiroService.listarDespesas(),
        financeiroService.obterTransacoes({ 
          mes: filtros.mes, 
          ano: filtros.ano 
        })
      ])

      const mensalidadesData = mensalidadesRes.map(m => ({
        id: m.id,
        residenteId: m.residente_id,
        residenteNome: m.residente?.nome_completo || 'N/A',
        valor: parseFloat(m.valor_mensalidade),
        dataVencimento: m.data_vencimento,
        status: m.status || 'pendente',
        tipo: 'receita',
        categoria: 'Mensalidade',
        descricao: `Mensalidade - ${m.residente?.nome_completo || 'N/A'}`
      }))

      const salariosData = salariosRes.map(s => ({
        id: s.id,
        profissionalId: s.profissional_id,
        profissionalNome: s.profissional?.nome_completo || 'N/A',
        valor: parseFloat(s.valor),
        dataVencimento: s.data_pagamento,
        status: s.status || 'pendente',
        tipo: 'despesa',
        categoria: 'Salário',
        descricao: `Salário - ${s.profissional?.nome_completo || 'N/A'}`
      }))

      const despesasData = despesasRes.map(d => ({
        id: d.id,
        descricao: d.descricao,
        categoria: d.categoria,
        valor: parseFloat(d.valor),
        dataVencimento: d.data_despesa,
        status: d.status || 'pendente',
        tipo: 'despesa'
      }))

      const transacoesData = [...mensalidadesData, ...salariosData, ...despesasData]
        .sort((a, b) => new Date(b.dataVencimento) - new Date(a.dataVencimento))

      setResumoFinanceiro({
        receitaTotal: parseFloat(resumo.receitaTotal) || 0,
        despesaTotal: parseFloat(resumo.despesaTotal) || 0,
        saldo: parseFloat(resumo.saldo) || 0,
        margemLucro: parseFloat(resumo.margemLucro) || 0
      })
      setMensalidades(mensalidadesData)
      setSalarios(salariosData)
      setDespesas(despesasData)
      setTransacoes(transacoesData)
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
      showError('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleAdicionarDespesa = async (e) => {
    e.preventDefault()
    try {
      const dataDespesa = novaDespesa.data ? new Date(novaDespesa.data).toISOString().split('T')[0] : '';
      await financeiroService.criarDespesa({
        descricao: novaDespesa.descricao,
        categoria: novaDespesa.categoria,
        valor: parseFloat(novaDespesa.valor),
        data_despesa: dataDespesa,
        status: novaDespesa.status,
        observacoes: novaDespesa.observacoes
      })

      setModalNovaDespesa(false)
      setNovaDespesa({
        descricao: '',
        categoria: 'Operacional',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        status: 'pendente',
        observacoes: ''
      })

      carregarDadosFinanceiros()
      showSuccess('Despesa criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar despesa:', error)
      showError('Erro ao criar despesa: ' + error.message)
    }
  }

  const handleRegistrarPagamento = (item) => {
    setItemSelecionado(item)
    setModalPagamento(true)
  }

  const confirmarPagamento = async () => {
    try {
      const dadosPagamento = {
        data_pagamento: new Date().toISOString().split('T')[0],
        metodo_pagamento: metodoPagamento,
        observacoes: 'Pagamento confirmado'
      }

      const itemId = itemSelecionado.id

      if (itemSelecionado.tipo === 'receita') {
        await financeiroService.pagarMensalidade(itemId, dadosPagamento)
        showSuccess('Mensalidade paga com sucesso!')
      } else if (itemSelecionado.categoria === 'Salário') {
        await financeiroService.pagarSalario(itemId, dadosPagamento)
        showSuccess('Salário pago com sucesso!')
      } else {
        await financeiroService.atualizarDespesa(itemId, {
          status: 'pago',
          data_pagamento: dadosPagamento.data_pagamento,
          metodo_pagamento: dadosPagamento.metodo_pagamento
        })
        showSuccess('Despesa paga com sucesso!')
      }

      setModalPagamento(false)
      setItemSelecionado(null)
      setMetodoPagamento('Dinheiro')
      await carregarDadosFinanceiros()
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error)
      showError('Erro ao confirmar pagamento: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleGerarMensalidades = async () => {
    try {
      setGerando(true)
      const resultado = await financeiroService.gerarMensalidades({
        mes_referencia: filtros.mes,
        ano_referencia: filtros.ano,
        dia_vencimento: diaVencimento
      })

      let msg = resultado.message
      if (resultado.jaExistem.length > 0) {
        msg += ` | Já existiam: ${resultado.jaExistem.length}`
      }
      if (resultado.semValor.length > 0) {
        msg += ` | Sem valor definido: ${resultado.semValor.join(', ')}`
      }

      showSuccess(msg)
      setModalGerarMensalidades(false)
      await carregarDadosFinanceiros()
    } catch (error) {
      console.error('Erro ao gerar mensalidades:', error)
      showError('Erro ao gerar mensalidades: ' + (error.response?.data?.error || error.message))
    } finally {
      setGerando(false)
    }
  }

  const handleGerarSalarios = async () => {
    try {
      setGerando(true)
      const resultado = await financeiroService.gerarSalarios({
        mes_referencia: filtros.mes,
        ano_referencia: filtros.ano
      })

      let msg = resultado.message
      if (resultado.jaExistem.length > 0) {
        msg += ` | Já existiam: ${resultado.jaExistem.length}`
      }
      if (resultado.semSalario.length > 0) {
        msg += ` | Sem salário definido: ${resultado.semSalario.join(', ')}`
      }

      showSuccess(msg)
      setModalGerarSalarios(false)
      await carregarDadosFinanceiros()
    } catch (error) {
      console.error('Erro ao gerar salários:', error)
      showError('Erro ao gerar salários: ' + (error.response?.data?.error || error.message))
    } finally {
      setGerando(false)
    }
  }

  // Dados para gráficos
  const dadosGraficoFluxoCaixa = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Receitas',
        data: [125000, 132000, 128000, 140000, 135000, 145000, 142000, 138000, 150000, 148000, 152000, 155000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Despesas',
        data: [95000, 98000, 92000, 105000, 100000, 108000, 103000, 99000, 110000, 107000, 112000, 115000],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const dadosGraficoDespesasPorCategoria = {
    labels: ['Salários', 'Alimentação', 'Utilidades', 'Medicamentos', 'Manutenção', 'Operacional', 'Outros'],
    datasets: [{
      data: [
        salarios.reduce((acc, s) => acc + s.valor, 0),
        8500,
        3300,
        3200,
        1800,
        2150,
        1500
      ],
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#06b6d4',
        '#ef4444',
        '#8b5cf6',
        '#6b7280'
      ]
    }]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-emerald-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-300 text-lg">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <i className="bi bi-cash-coin text-2xl text-white"></i>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestão Financeira</h1>
                  <p className="text-sm text-slate-400">Controle completo de receitas, despesas e pagamentos</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select 
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.mes}
                onChange={(e) => setFiltros({ ...filtros, mes: parseInt(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select 
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.ano}
                onChange={(e) => setFiltros({ ...filtros, ano: parseInt(e.target.value) })}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 3 + i
                  return <option key={year} value={year}>{year}</option>
                })}
              </select>
              <button 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
                onClick={carregarDadosFinanceiros}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Atualizar
              </button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Receita Total */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <i className="bi bi-arrow-down-circle text-2xl text-emerald-400"></i>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  Receita
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">Receita Total</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{formatarMoeda(resumoFinanceiro.receitaTotal)}</h3>
              <p className="text-xs text-slate-500">Mensalidades dos residentes</p>
            </div>

            {/* Despesa Total */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-red-500/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <i className="bi bi-arrow-up-circle text-2xl text-red-400"></i>
                </div>
                <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-lg">
                  Despesa
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">Despesa Total</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{formatarMoeda(resumoFinanceiro.despesaTotal)}</h3>
              <p className="text-xs text-slate-500">Salários + Operacional</p>
            </div>

            {/* Saldo do Mês */}
            <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 ${resumoFinanceiro.saldo >= 0 ? 'hover:border-blue-500/50' : 'hover:border-orange-500/50'} transition-all duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${resumoFinanceiro.saldo >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10'} flex items-center justify-center`}>
                  <i className={`bi bi-wallet2 text-2xl ${resumoFinanceiro.saldo >= 0 ? 'text-blue-400' : 'text-orange-400'}`}></i>
                </div>
                <span className={`text-xs px-2 py-1 ${resumoFinanceiro.saldo >= 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'} rounded-lg`}>
                  {resumoFinanceiro.saldo >= 0 ? 'Superávit' : 'Déficit'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">Saldo do Mês</p>
              <h3 className={`text-2xl sm:text-3xl font-bold mb-2 ${resumoFinanceiro.saldo >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                {formatarMoeda(resumoFinanceiro.saldo)}
              </h3>
              <p className="text-xs text-slate-500">Balanço do período</p>
            </div>

            {/* Margem de Lucro */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <i className="bi bi-graph-up-arrow text-2xl text-purple-400"></i>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg">
                  Margem
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">Margem de Lucro</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{resumoFinanceiro.margemLucro}%</h3>
              <p className="text-xs text-slate-500">Lucro líquido do período</p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-slate-800/30 backdrop-blur-xl rounded-xl p-2 border border-slate-700/50">
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                abaSelecionada === 'dashboard' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setAbaSelecionada('dashboard')}
            >
              <i className="bi bi-speedometer2"></i>
              Dashboard
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                abaSelecionada === 'mensalidades' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setAbaSelecionada('mensalidades')}
            >
              <i className="bi bi-receipt"></i>
              Mensalidades 
              {mensalidades.filter(m => m.status === 'pendente').length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs">
                  {mensalidades.filter(m => m.status === 'pendente').length}
                </span>
              )}
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                abaSelecionada === 'salarios' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setAbaSelecionada('salarios')}
            >
              <i className="bi bi-wallet2"></i>
              Salários ({salarios.length})
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                abaSelecionada === 'despesas' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setAbaSelecionada('despesas')}
            >
              <i className="bi bi-cart3"></i>
              Despesas 
              {despesas.filter(d => d.status === 'pendente').length > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                  {despesas.filter(d => d.status === 'pendente').length}
                </span>
              )}
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                abaSelecionada === 'transacoes' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setAbaSelecionada('transacoes')}
            >
              <i className="bi bi-list-ul"></i>
              Todas Transações
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {abaSelecionada === 'dashboard' && (
          <div className="space-y-6">
            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fluxo de Caixa */}
              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <i className="bi bi-graph-up text-lg text-emerald-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Fluxo de Caixa Anual</h3>
                </div>
                <div className="h-[300px]">
                  <Line 
                    data={dadosGraficoFluxoCaixa}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'top',
                          labels: { color: '#cbd5e1' }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: '#94a3b8',
                            callback: (value) => formatarMoeda(value)
                          },
                          grid: { color: '#334155' }
                        },
                        x: {
                          ticks: { color: '#94a3b8' },
                          grid: { color: '#334155' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Despesas por Categoria */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <i className="bi bi-pie-chart text-lg text-purple-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Despesas por Categoria</h3>
                </div>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut 
                    data={dadosGraficoDespesasPorCategoria}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'bottom',
                          labels: { 
                            color: '#cbd5e1',
                            padding: 15,
                            font: { size: 11 }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Resumo Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Mensalidades Pendentes</h3>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-medium">
                    {mensalidades.filter(m => m.status === 'pendente').length}
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-400 mb-2">
                  {formatarMoeda(mensalidades.filter(m => m.status === 'pendente').reduce((acc, m) => acc + m.valor, 0))}
                </p>
                <p className="text-sm text-slate-400">Valor total a receber</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Despesas Pendentes</h3>
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium">
                    {[...salarios, ...despesas].filter(d => d.status === 'pendente').length}
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-400 mb-2">
                  {formatarMoeda([...salarios, ...despesas].filter(d => d.status === 'pendente').reduce((acc, d) => acc + d.valor, 0))}
                </p>
                <p className="text-sm text-slate-400">Valor total a pagar</p>
              </div>
            </div>
          </div>
        )}

        {abaSelecionada === 'mensalidades' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <i className="bi bi-receipt text-lg text-emerald-400"></i>
                  </div>
                  Mensalidades do Mês
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setModalGerarMensalidades(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors font-medium flex items-center gap-2"
                  >
                    <i className="bi bi-plus-circle"></i>
                    Gerar Mensalidades
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Residente</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Vencimento</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mensalidades.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <i className="bi bi-person text-emerald-400"></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{m.residenteNome}</p>
                            <p className="text-xs text-slate-400">ID: {m.residenteId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatarData(m.dataVencimento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-400">
                        {formatarMoeda(m.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          m.status === 'pago' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {m.status === 'pago' ? '✓ Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {m.status !== 'pago' && (
                          <button
                            onClick={() => handleRegistrarPagamento(m)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-xs"
                          >
                            <i className="bi bi-check-circle mr-2"></i>
                            Registrar Pagamento
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mensalidades.length === 0 && (
              <div className="p-12 text-center">
                <i className="bi bi-inbox text-5xl text-slate-600 mb-4"></i>
                <p className="text-slate-400">Nenhuma mensalidade encontrada para este período</p>
              </div>
            )}
          </div>
        )}

        {abaSelecionada === 'salarios' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <i className="bi bi-wallet2 text-lg text-blue-400"></i>
                  </div>
                  Salários dos Profissionais
                </h3>
                <button 
                  onClick={() => setModalGerarSalarios(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors font-medium flex items-center gap-2"
                >
                  <i className="bi bi-plus-circle"></i>
                  Gerar Salários
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Profissional</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data Pagamento</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {salarios.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <i className="bi bi-person-badge text-blue-400"></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{s.profissionalNome}</p>
                            <p className="text-xs text-slate-400">ID: {s.profissionalId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatarData(s.dataVencimento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-400">
                        {formatarMoeda(s.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          s.status === 'pago' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {s.status === 'pago' ? '✓ Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {s.status !== 'pago' && (
                          <button
                            onClick={() => handleRegistrarPagamento(s)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs"
                          >
                            <i className="bi bi-check-circle mr-2"></i>
                            Pagar Salário
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {salarios.length === 0 && (
              <div className="p-12 text-center">
                <i className="bi bi-inbox text-5xl text-slate-600 mb-4"></i>
                <p className="text-slate-400">Nenhum salário encontrado para este período</p>
              </div>
            )}
          </div>
        )}

        {abaSelecionada === 'despesas' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setModalNovaDespesa(true)}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-600/30"
              >
                <i className="bi bi-plus-circle text-lg"></i>
                Nova Despesa
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <i className="bi bi-cart3 text-lg text-amber-400"></i>
                  </div>
                  Despesas Gerais
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {despesas.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-white">{d.descricao}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs">
                            {d.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatarData(d.dataVencimento)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-400">
                          {formatarMoeda(d.valor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            d.status === 'pago' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {d.status === 'pago' ? '✓ Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {d.status !== 'pago' && (
                            <button
                              onClick={() => handleRegistrarPagamento(d)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-xs"
                            >
                              <i className="bi bi-check-circle mr-2"></i>
                              Pagar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {despesas.length === 0 && (
                <div className="p-12 text-center">
                  <i className="bi bi-inbox text-5xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">Nenhuma despesa encontrada</p>
                </div>
              )}
            </div>
          </div>
        )}

        {abaSelecionada === 'transacoes' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <i className="bi bi-list-ul text-lg text-purple-400"></i>
                </div>
                Todas as Transações
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {transacoes.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatarData(t.dataVencimento)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{t.descricao}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          t.tipo === 'receita' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {t.tipo === 'receita' ? (
                            <><i className="bi bi-arrow-down-circle mr-1"></i>Receita</>
                          ) : (
                            <><i className="bi bi-arrow-up-circle mr-1"></i>Despesa</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs">
                          {t.categoria}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        t.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {formatarMoeda(t.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          t.status === 'pago' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transacoes.length === 0 && (
              <div className="p-12 text-center">
                <i className="bi bi-inbox text-5xl text-slate-600 mb-4"></i>
                <p className="text-slate-400">Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Nova Despesa */}
      {modalNovaDespesa && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-amber-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <i className="bi bi-plus-circle text-2xl"></i>
                Nova Despesa
              </h3>
              <button 
                onClick={() => setModalNovaDespesa(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="bi bi-x text-white text-2xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleAdicionarDespesa} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição*</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Conta de luz, Compra de material, etc."
                  value={novaDespesa.descricao}
                  onChange={(e) => setNovaDespesa({ ...novaDespesa, descricao: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Categoria*</label>
                <select
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={novaDespesa.categoria}
                  onChange={(e) => setNovaDespesa({ ...novaDespesa, categoria: e.target.value })}
                  required
                >
                  <option value="Operacional">Operacional</option>
                  <option value="Utilidades">Utilidades</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Comunicação">Comunicação</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Valor*</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0,00"
                    value={novaDespesa.valor}
                    onChange={(e) => setNovaDespesa({ ...novaDespesa, valor: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data*</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={novaDespesa.data}
                    onChange={(e) => setNovaDespesa({ ...novaDespesa, data: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  rows="3"
                  placeholder="Informações adicionais (opcional)"
                  value={novaDespesa.observacoes}
                  onChange={(e) => setNovaDespesa({ ...novaDespesa, observacoes: e.target.value })}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setModalNovaDespesa(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="bi bi-save"></i>
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pagamento */}
      {modalPagamento && itemSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <i className="bi bi-check-circle text-2xl"></i>
                Confirmar Pagamento
              </h3>
              <button 
                onClick={() => setModalPagamento(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="bi bi-x text-white text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-sm mb-3">Detalhes do Pagamento:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Descrição:</span>
                    <span className="text-white font-medium">{itemSelecionado.descricao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor:</span>
                    <span className="text-emerald-400 font-bold">{formatarMoeda(itemSelecionado.valor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data:</span>
                    <span className="text-white">{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Método de Pagamento</label>
                <select
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <p className="text-slate-400 text-center text-sm">
                Deseja confirmar este pagamento?
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setModalPagamento(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarPagamento}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="bi bi-check-circle"></i>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Gerar Mensalidades */}
      {modalGerarMensalidades && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <i className="bi bi-receipt text-2xl"></i>
                Gerar Mensalidades
              </h3>
              <button 
                onClick={() => setModalGerarMensalidades(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="bi bi-x text-white text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-slate-300">
                  Serão geradas mensalidades para <strong className="text-emerald-400">todos os residentes ativos</strong> que ainda não possuem mensalidade para o período selecionado.
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  O valor será o <strong>valor_mensalidade</strong> cadastrado em cada residente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mês</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={filtros.mes}
                    disabled
                  >
                    <option value={filtros.mes}>
                      {new Date(2025, filtros.mes - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ano</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={filtros.ano}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Dia de Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(parseInt(e.target.value) || 10)}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setModalGerarMensalidades(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleGerarMensalidades}
                  disabled={gerando}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {gerando ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Gerar Mensalidades
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerar Salários */}
      {modalGerarSalarios && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <i className="bi bi-wallet2 text-2xl"></i>
                Gerar Salários
              </h3>
              <button 
                onClick={() => setModalGerarSalarios(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="bi bi-x text-white text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-slate-300">
                  Serão gerados registros de salário para <strong className="text-blue-400">todos os profissionais ativos</strong> que ainda não possuem salário para o período selecionado.
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  O valor será o <strong>salário base</strong> cadastrado em cada profissional.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mês</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtros.mes}
                    disabled
                  >
                    <option value={filtros.mes}>
                      {new Date(2025, filtros.mes - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ano</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtros.ano}
                    disabled
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setModalGerarSalarios(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleGerarSalarios}
                  disabled={gerando}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {gerando ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      Gerar Salários
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Ajuda */}
      <HelpButton
        title="Gestão Financeira"
        content="Esta tela permite gerenciar todas as operações financeiras da instituição, incluindo mensalidades, salários e despesas gerais."
        steps={[
          {
            title: "Selecionar Aba",
            description: "Escolha entre Mensalidades, Salários ou Despesas Gerais para gerenciar cada tipo de movimentação."
          },
          {
            title: "Registrar Pagamentos",
            description: "Use os botões de ação para registrar pagamento de mensalidades ou salários."
          },
          {
            title: "Lançar Despesas",
            description: "Na aba Despesas Gerais, adicione novas despesas operacionais da instituição."
          },
          {
            title: "Filtrar Registros",
            description: "Use os filtros de período, status e categoria para buscar registros específicos."
          },
          {
            title: "Visualizar Estatísticas",
            description: "Os cards no topo mostram resumos financeiros e gráficos de evolução."
          }
        ]}
        tips={[
          "Mensalidades não pagas ficam com status 'Pendente' ou 'Atrasado'",
          "Salários são calculados automaticamente baseado no cadastro do profissional",
          "Despesas são categorizadas para facilitar relatórios",
          "Use os gráficos para identificar tendências financeiras",
          "Registros financeiros não podem ser excluídos, apenas marcados como cancelados"
        ]}
      />
    </div>
  )
}

export default GestaoFinanceira
