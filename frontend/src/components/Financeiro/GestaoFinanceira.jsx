import { useState, useEffect } from 'react'
import './GestaoFinanceira.css'
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
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import financeiroService from '../../services/financeiroService'

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
  const [abaSelecionada, setAbaSelecionada] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  
  // Estados financeiros
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    receitaTotal: 0,
    despesaTotal: 0,
    saldoAtual: 0,
    lucroLiquido: 0
  })

  const [mensalidades, setMensalidades] = useState([])
  const [salarios, setSalarios] = useState([])
  const [despesas, setDespesas] = useState([])
  const [transacoes, setTransacoes] = useState([])

  // Modal states
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false)
  const [modalPagamento, setModalPagamento] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState(null)

  // Form states
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: '',
    categoria: 'operacional',
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
        valor: parseFloat(m.valor),
        mes: m.mes_referencia,
        ano: m.ano_referencia,
        status: m.status,
        dataPagamento: m.data_pagamento,
        dataVencimento: m.data_vencimento,
        metodoPagamento: m.metodo_pagamento,
        observacoes: m.observacoes
      }))

      const salariosData = salariosRes.map(s => ({
        id: s.id,
        profissionalId: s.profissional_id,
        profissionalNome: s.profissional?.nome_completo || 'N/A',
        cargo: s.profissional?.especialidade || 'N/A',
        valor: parseFloat(s.valor),
        bonus: parseFloat(s.bonus || 0),
        descontos: parseFloat(s.descontos || 0),
        mes: s.mes_referencia,
        ano: s.ano_referencia,
        status: s.status,
        dataPagamento: s.data_pagamento,
        metodoPagamento: s.metodo_pagamento,
        horasTrabalhadas: s.horas_trabalhadas,
        observacoes: s.observacoes
      }))

      const despesasData = despesasRes.map(d => ({
        id: d.id,
        descricao: d.descricao,
        categoria: d.categoria.toLowerCase(),
        valor: parseFloat(d.valor),
        status: d.status,
        data: d.data_despesa,
        dataPagamento: d.data_pagamento,
        metodoPagamento: d.metodo_pagamento,
        observacoes: d.observacoes
      }))

      setMensalidades(mensalidadesData)
      setSalarios(salariosData)
      setDespesas(despesasData)

      setResumoFinanceiro({
        receitaTotal: parseFloat(resumo.receitaTotal),
        despesaTotal: parseFloat(resumo.despesaTotal),
        saldoAtual: parseFloat(resumo.saldo),
        lucroLiquido: parseFloat(resumo.margemLucro)
      })

      const transacoesFormatadas = transacoesRes.map(t => ({
        id: t.id,
        tipo: t.tipo,
        descricao: t.descricao,
        valor: parseFloat(t.valor),
        data: t.data,
        categoria: t.categoria,
        metodo: t.metodo
      }))

      setTransacoes(transacoesFormatadas)

    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
      alert('Erro ao carregar dados financeiros. Verifique se as tabelas foram criadas no banco de dados.')
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
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleAdicionarDespesa = async (e) => {
    e.preventDefault()
    
    try {
      const despesaData = {
        descricao: novaDespesa.descricao,
        categoria: novaDespesa.categoria.charAt(0).toUpperCase() + novaDespesa.categoria.slice(1),
        valor: parseFloat(novaDespesa.valor),
        data_despesa: novaDespesa.data,
        status: novaDespesa.status,
        observacoes: novaDespesa.observacoes
      }

      await financeiroService.criarDespesa(despesaData)
      
      setModalNovaDespesa(false)
      setNovaDespesa({
        descricao: '',
        categoria: 'operacional',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        status: 'pendente',
        observacoes: ''
      })

      carregarDadosFinanceiros()
      alert('Despesa criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar despesa:', error)
      alert('Erro ao criar despesa: ' + error.message)
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
        metodo_pagamento: 'Dinheiro',
        observacoes: 'Pagamento confirmado'
      }

      const itemId = itemSelecionado.id.toString().replace(/^[MSD]-/, '')

      if (itemSelecionado.tipo === 'receita') {
        await financeiroService.pagarMensalidade(itemId, dadosPagamento)
        alert('Mensalidade paga com sucesso!')
      } else if (itemSelecionado.categoria === 'Salário') {
        await financeiroService.pagarSalario(itemId, dadosPagamento)
        alert('Salário pago com sucesso!')
      } else {
        await financeiroService.atualizarDespesa(itemId, {
          status: 'pago',
          data_pagamento: dadosPagamento.data_pagamento,
          metodo_pagamento: dadosPagamento.metodo_pagamento
        })
        alert('Despesa paga com sucesso!')
      }

      setModalPagamento(false)
      setItemSelecionado(null)
      await carregarDadosFinanceiros()
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error)
      alert('Erro ao confirmar pagamento: ' + error.message)
    }
  }

  // Dados para gráficos
  const dadosGraficoFluxoCaixa = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Receitas',
        data: [125000, 132000, 128000, 140000, 135000, 145000, 142000, 138000, 150000, 148000, 152000, 155000],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Despesas',
        data: [95000, 98000, 92000, 105000, 100000, 108000, 103000, 99000, 110000, 107000, 112000, 115000],
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
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
        '#007bff',
        '#28a745',
        '#ffc107',
        '#17a2b8',
        '#dc3545',
        '#6610f2',
        '#6c757d'
      ]
    }]
  }

  const dadosGraficoReceitasDespesas = {
    labels: ['Receitas', 'Despesas', 'Lucro'],
    datasets: [{
      data: [
        resumoFinanceiro.receitaTotal,
        resumoFinanceiro.despesaTotal,
        resumoFinanceiro.saldoAtual
      ],
      backgroundColor: ['#28a745', '#dc3545', '#007bff']
    }]
  }

  if (loading) {
    return (
      <div className="financeiro-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="financeiro-container">
      {/* Header */}
      <div className="financeiro-header">
        <div>
          <h2>
            <i className="bi bi-cash-coin me-2"></i>
            Gestão Financeira
          </h2>
          <p className="text-muted">Controle completo de receitas, despesas e pagamentos</p>
        </div>
        <div className="header-actions">
          <select 
            className="form-select"
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
            className="form-select"
            value={filtros.ano}
            onChange={(e) => setFiltros({ ...filtros, ano: parseInt(e.target.value) })}
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
          <button className="btn btn-primary" onClick={carregarDadosFinanceiros}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="financial-card receita">
            <div className="card-icon">
              <i className="bi bi-arrow-down-circle"></i>
            </div>
            <div className="card-content">
              <p className="card-label">Receita Total</p>
              <h3 className="card-value">{formatarMoeda(resumoFinanceiro.receitaTotal)}</h3>
              <small className="card-subtitle">Mensalidades dos residentes</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="financial-card despesa">
            <div className="card-icon">
              <i className="bi bi-arrow-up-circle"></i>
            </div>
            <div className="card-content">
              <p className="card-label">Despesa Total</p>
              <h3 className="card-value">{formatarMoeda(resumoFinanceiro.despesaTotal)}</h3>
              <small className="card-subtitle">Salários + Operacional</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className={`financial-card ${resumoFinanceiro.saldoAtual >= 0 ? 'saldo-positivo' : 'saldo-negativo'}`}>
            <div className="card-icon">
              <i className="bi bi-wallet2"></i>
            </div>
            <div className="card-content">
              <p className="card-label">Saldo do Mês</p>
              <h3 className="card-value">{formatarMoeda(resumoFinanceiro.saldoAtual)}</h3>
              <small className="card-subtitle">
                {resumoFinanceiro.saldoAtual >= 0 ? 'Superávit' : 'Déficit'}
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="financial-card lucro">
            <div className="card-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div className="card-content">
              <p className="card-label">Margem de Lucro</p>
              <h3 className="card-value">{resumoFinanceiro.lucroLiquido}%</h3>
              <small className="card-subtitle">Lucro líquido do período</small>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'dashboard' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('dashboard')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'mensalidades' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('mensalidades')}
          >
            <i className="bi bi-receipt me-2"></i>
            Mensalidades ({mensalidades.filter(m => m.status === 'pendente').length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'salarios' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('salarios')}
          >
            <i className="bi bi-wallet2 me-2"></i>
            Salários ({salarios.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'despesas' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('despesas')}
          >
            <i className="bi bi-cart3 me-2"></i>
            Despesas Gerais ({despesas.filter(d => d.status === 'pendente').length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'transacoes' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('transacoes')}
          >
            <i className="bi bi-list-ul me-2"></i>
            Todas Transações
          </button>
        </li>
      </ul>

      {/* Conteúdo das Abas */}
      {abaSelecionada === 'dashboard' && (
        <div className="aba-conteudo">
          {/* Gráficos */}
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>
                    <i className="bi bi-graph-up me-2"></i>
                    Fluxo de Caixa Anual
                  </h5>
                </div>
                <div className="chart-body" style={{ height: '300px' }}>
                  <Line 
                    data={dadosGraficoFluxoCaixa}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatarMoeda(value)
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>
                    <i className="bi bi-pie-chart me-2"></i>
                    Receitas vs Despesas
                  </h5>
                </div>
                <div className="chart-body" style={{ height: '300px' }}>
                  <Doughnut 
                    data={dadosGraficoReceitasDespesas}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>
                    <i className="bi bi-bar-chart me-2"></i>
                    Despesas por Categoria
                  </h5>
                </div>
                <div className="chart-body" style={{ height: '300px' }}>
                  <Bar 
                    data={dadosGraficoDespesasPorCategoria}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatarMoeda(value)
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaSelecionada === 'mensalidades' && (
        <div className="aba-conteudo">
          <div className="card">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Mensalidades dos Residentes
              </h5>
              <span className="badge bg-light text-dark">
                {mensalidades.filter(m => m.status === 'pago').length}/{mensalidades.length} pagas
              </span>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Residente</th>
                      <th>Valor</th>
                      <th>Vencimento</th>
                      <th>Status</th>
                      <th>Data Pagamento</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mensalidades.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.residenteNome}</strong></td>
                        <td>{formatarMoeda(m.valor)}</td>
                        <td>{formatarData(m.dataVencimento)}</td>
                        <td>
                          <span className={`badge ${m.status === 'pago' ? 'bg-success' : 'bg-warning'}`}>
                            {m.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td>{formatarData(m.dataPagamento)}</td>
                        <td className="text-center">
                          {m.status === 'pendente' && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleRegistrarPagamento(m)}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Registrar Pagamento
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-success">
                      <td><strong>TOTAL</strong></td>
                      <td><strong>{formatarMoeda(mensalidades.reduce((acc, m) => acc + m.valor, 0))}</strong></td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaSelecionada === 'salarios' && (
        <div className="aba-conteudo">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-wallet2 me-2"></i>
                Folha de Pagamento - Profissionais
              </h5>
              <span className="badge bg-light text-dark">
                {salarios.length} funcionários
              </span>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Profissional</th>
                      <th>Cargo</th>
                      <th>Salário</th>
                      <th>Status</th>
                      <th>Data Pagamento</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salarios.map(s => {
                      const valorLiquido = s.valor + s.bonus - s.descontos
                      return (
                        <tr key={s.id}>
                          <td><strong>{s.profissionalNome}</strong></td>
                          <td>{s.cargo}</td>
                          <td>{formatarMoeda(valorLiquido)}</td>
                          <td>
                            <span className={`badge ${s.status === 'pago' ? 'bg-success' : 'bg-danger'}`}>
                              {s.status === 'pago' ? 'Pago' : 'Pendente'}
                            </span>
                          </td>
                          <td>{formatarData(s.dataPagamento)}</td>
                          <td className="text-center">
                            {s.status === 'pendente' && (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleRegistrarPagamento({ ...s, tipo: 'despesa', categoria: 'salario' })}
                              >
                                <i className="bi bi-cash me-1"></i>
                                Pagar
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-primary">
                      <td colSpan="2"><strong>TOTAL FOLHA</strong></td>
                      <td><strong>{formatarMoeda(salarios.reduce((acc, s) => acc + s.valor + s.bonus - s.descontos, 0))}</strong></td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaSelecionada === 'despesas' && (
        <div className="aba-conteudo">
          <div className="card">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-cart3 me-2"></i>
                Despesas Operacionais
              </h5>
              <button 
                className="btn btn-dark btn-sm"
                onClick={() => setModalNovaDespesa(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nova Despesa
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.descricao}</strong></td>
                        <td>
                          <span className="badge bg-secondary">
                            {d.categoria}
                          </span>
                        </td>
                        <td>{formatarMoeda(d.valor)}</td>
                        <td>{formatarData(d.data)}</td>
                        <td>
                          <span className={`badge ${d.status === 'pago' ? 'bg-success' : 'bg-warning'}`}>
                            {d.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="text-center">
                          {d.status === 'pendente' && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleRegistrarPagamento({ ...d, tipo: 'despesa' })}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Pagar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-warning">
                      <td colSpan="2"><strong>TOTAL DESPESAS</strong></td>
                      <td><strong>{formatarMoeda(despesas.reduce((acc, d) => acc + d.valor, 0))}</strong></td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaSelecionada === 'transacoes' && (
        <div className="aba-conteudo">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Todas as Transações
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Tipo</th>
                      <th>Categoria</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.slice(0, 50).map((t, index) => (
                      <tr key={index}>
                        <td>{formatarData(t.data || t.dataVencimento)}</td>
                        <td><strong>{t.descricao}</strong></td>
                        <td>
                          <span className={`badge ${t.tipo === 'receita' ? 'bg-success' : 'bg-danger'}`}>
                            {t.tipo === 'receita' ? (
                              <><i className="bi bi-arrow-down-circle me-1"></i>Receita</>
                            ) : (
                              <><i className="bi bi-arrow-up-circle me-1"></i>Despesa</>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {t.categoria}
                          </span>
                        </td>
                        <td className={t.tipo === 'receita' ? 'text-success' : 'text-danger'}>
                          <strong>{formatarMoeda(t.valor)}</strong>
                        </td>
                        <td>
                          <span className={`badge ${t.status === 'pago' ? 'bg-success' : 'bg-warning'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Despesa */}
      {modalNovaDespesa && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Nova Despesa
                </h5>
                <button className="btn-close" onClick={() => setModalNovaDespesa(false)}></button>
              </div>
              <form onSubmit={handleAdicionarDespesa}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Descrição*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novaDespesa.descricao}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, descricao: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Categoria*</label>
                    <select
                      className="form-select"
                      value={novaDespesa.categoria}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, categoria: e.target.value })}
                      required
                    >
                      <option value="operacional">Operacional</option>
                      <option value="utilidades">Utilidades</option>
                      <option value="alimentacao">Alimentação</option>
                      <option value="saude">Saúde/Medicamentos</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="comunicacao">Comunicação</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Valor*</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={novaDespesa.valor}
                        onChange={(e) => setNovaDespesa({ ...novaDespesa, valor: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Data*</label>
                      <input
                        type="date"
                        className="form-control"
                        value={novaDespesa.data}
                        onChange={(e) => setNovaDespesa({ ...novaDespesa, data: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Observações</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={novaDespesa.observacoes}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, observacoes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalNovaDespesa(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-warning">
                    <i className="bi bi-save me-2"></i>
                    Salvar Despesa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagamento */}
      {modalPagamento && itemSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-check-circle me-2"></i>
                  Confirmar Pagamento
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setModalPagamento(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <h6>Detalhes do Pagamento:</h6>
                  <hr />
                  <p className="mb-2"><strong>Descrição:</strong> {itemSelecionado.descricao}</p>
                  <p className="mb-2"><strong>Valor:</strong> {formatarMoeda(itemSelecionado.valor)}</p>
                  <p className="mb-0"><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <p className="text-muted">Deseja confirmar este pagamento?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalPagamento(false)}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={confirmarPagamento}>
                  <i className="bi bi-check-circle me-2"></i>
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestaoFinanceira
